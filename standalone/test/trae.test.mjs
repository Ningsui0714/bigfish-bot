import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalStore, defaults, mergeConfig } from '../server/store.mjs';
import { TraeClient, TRAE_PATHS, parseTraeModels, parseTraeCallback, parseTraeStream, shanghaiDay } from '../server/trae.mjs';
import { completion, generate } from '../server/providers.mjs';
const identity = { machineId: 'a'.repeat(32), deviceId: 'b'.repeat(32) };
const credential = { uid: 'fixture-user', nickname: '测试用户', accessToken: 'fixture-access-secret', refreshToken: 'fixture-refresh-secret', expiresAt: Date.now() + 3_600_000 };
const modelList = { function_configs: [{ function: 'solo_work_lite', config_info_list: [
  { config_name: 'fixture-model', config_switch: true, usage: 'chat_completion', display_config: { display_name: '可用模型' } },
  { config_name: 'hidden-model', is_invisible_to_user: true }, { config_name: 'disabled-model', config_switch: false },
  { config_name: 'custom-model', display_config: { is_custom_model: true } },
] }] };
const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
const stream = () => new Response('event:output\ndata:{"reasoning_content":"不发送的思考","response":"你好"}\n\nevent:output\ndata:{"response":"，大肥鱼"}\n\nevent:done\ndata:{"finish_reason":"stop"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
async function fixture(fn, options = {}) {
  const dir = await fs.mkdtemp(join(tmpdir(), 'bigfish-trae-'));
  const store = await new LocalStore(dir).load();
  await store.patchTrae({ identity, credential, ...options.state });
  const client = new TraeClient({ store, ...options });
  try { await fn({ store, dir, client }); } finally { client.stop(); await fs.rm(dir, { recursive: true, force: true }); }
}
test('TRAE account secrets survive encrypted reload but never appear in public config', async () => fixture(async ({ store, dir }) => {
  assert.ok(!JSON.stringify(store.publicConfig()).includes('fixture-access-secret'));
  assert.ok(!JSON.stringify(store.publicConfig()).includes('fixture-refresh-secret'));
  assert.ok(!(await fs.readFile(join(dir, 'state.enc'))).includes('fixture-access-secret'));
  const loaded = await new LocalStore(dir).load(); assert.equal(loaded.get().trae.credential.accessToken, credential.accessToken);
  await store.update({ trae: { autoCheckin: true, credential: { accessToken: 'forged-secret' } } });
  assert.equal(store.get().trae.credential.accessToken, credential.accessToken); assert.equal(store.get().trae.autoCheckin, true);
}));
test('TRAE uses fixed upstream and no arbitrary API key, restricts to one configured account', () => {
  const p = { id: 'trae', name: 'TRAE', type: 'trae', model: 'fixture-model', baseUrl: 'https://evil.test', apiKey: 'should-not-be-used' };
  const next = mergeConfig({ providers: [p] }, defaults());
  assert.equal(next.providers[0].baseUrl, 'https://trae-api-cn.mchost.guru'); assert.equal(next.providers[0].apiKey, '');
  assert.throws(() => mergeConfig({ providers: [p, { ...p, id: 'trae2' }] }, defaults()), /一个账号/);
});
test('TRAE model list filters hidden, disabled, custom and unknown channels', () => {
  assert.deepEqual(parseTraeModels(modelList), [{ id: 'fixture-model', name: '可用模型', channel: 'solo_work_lite' }]);
  assert.throws(() => parseTraeCallback('/?code=fixture-code'), /授权码流程/);
  assert.equal(parseTraeCallback('/?refreshToken=fixture-refresh').refreshToken, 'fixture-refresh');
});
test('TRAE SSE retains only final text and rejects truncated/error streams', async () => {
  assert.equal(await parseTraeStream(stream()), '你好，大肥鱼');
  await assert.rejects(parseTraeStream(new Response('event:output\ndata:{"response":"半截"}\n')), /未正常结束/);
  await assert.rejects(parseTraeStream(new Response('event:error\ndata:{"code":9074,"message":"fixture-access-secret"}\n')), { message: 'TRAE 推理返回错误（9074）' });
});
test('direct provider dispatch uses TRAE service and stable identity, no DSH or tools', async () => {
  const calls = [];
  await fixture(async ({ client }) => {
    const result = await completion({ id: 'trae', type: 'trae', enabled: true, model: 'fixture-model' }, [{ role: 'user', content: '你好' }], { trae: client });
    assert.equal(result, '你好，大肥鱼');
    const chat = calls.find(c => c.path === TRAE_PATHS.chat);
    assert.equal(chat.body.function, 'solo_work_lite'); assert.equal(chat.body.config_name, 'fixture-model');
    assert.equal(chat.body.tools, undefined); assert.equal(chat.options.headers['X-Machine-Id'], identity.machineId);
    assert.deepEqual(chat.body.messages[0].content, [{ type: 'text', text: '你好' }]);
  }, { fetchImpl: async (url, options) => { const path = new URL(url).pathname; calls.push({ path, options, body: JSON.parse(options.body) }); return path === TRAE_PATHS.models ? json(modelList) : stream(); } });
});
test('TRAE catalog accepts observed 1.66 MB metadata with a separate 16 MB ceiling', async () => {
  for (const bytes of [1_700_000, 16_100_000]) await fixture(async ({ client }) => {
    if (bytes < 16_000_000) assert.equal((await client.models())[0].id, 'fixture-model');
    else await assert.rejects(client.models(), /大小上限/);
  }, { fetchImpl: async () => json({ ...modelList, client_config: 'x'.repeat(bytes) }) });
});
test('TRAE login uses the official callback URL contract and requires an unpredictable echoed trace', async () => {
  await fixture(async ({ client, store }) => {
    const login = await client.beginLogin();
    const auth = new URL(login.url), callback = new URL(auth.searchParams.get('auth_callback_url'));
    assert.equal(auth.hostname, 'www.trae.cn');
    // Regression: official authorization/page validates this exact regex before any request.
    assert.match(callback.href, /^http:\/\/127\.0\.0\.1:(\d+)\/authorize$/);
    const trace = auth.searchParams.get('login_trace_id'); assert.match(trace, /^[a-f0-9]{48}$/);
    assert.equal((await fetch(callback)).status, 403);
    callback.searchParams.set('loginTraceID', 'wrong');
    assert.equal((await fetch(callback)).status, 403);
    assert.equal(client.status().login.state, 'waiting');
    callback.searchParams.set('loginTraceID', trace);
    assert.equal((await fetch(`${callback.origin}/authorize/wrong?refreshToken=fixture`)).status, 404);
    callback.searchParams.set('refreshToken', 'fixture-new-refresh');
    callback.searchParams.set('userInfo', JSON.stringify({ UserID: 'fixture-user' }));
    const response = await fetch(callback); assert.equal(response.status, 200);
    assert.ok(!(await response.text()).includes('fixture-new-access'));
    assert.equal(store.get().trae.credential.accessToken, 'fixture-new-access');
    assert.equal(client.status().loggedIn, true); assert.ok(!JSON.stringify(client.status()).includes('fixture-new-refresh'));
    assert.deepEqual(store.get().trae.identity, identity);
  }, { fetchImpl: async url => new URL(url).pathname === TRAE_PATHS.exchange
    ? json({ Result: { Token: 'fixture-new-access', RefreshToken: 'fixture-new-refresh', TokenExpireDuration: 3600 } })
    : json({ Result: { UserID: 'fixture-user', ScreenName: '测试昵称' } }) });
});
test('TRAE callbacks cannot cross login sessions or accept duplicate trace parameters', async () => {
  let calls = 0;
  await fixture(async ({ client }) => {
    const first = new URL((await client.beginLogin()).url);
    const second = new URL((await client.beginLogin()).url);
    const callback = new URL(second.searchParams.get('auth_callback_url'));
    assert.notEqual(first.searchParams.get('login_trace_id'), second.searchParams.get('login_trace_id'));
    callback.searchParams.set('loginTraceID', first.searchParams.get('login_trace_id'));
    assert.equal((await fetch(callback)).status, 403);
    callback.searchParams.set('loginTraceID', second.searchParams.get('login_trace_id'));
    callback.searchParams.append('loginTraceID', second.searchParams.get('login_trace_id'));
    assert.equal((await fetch(callback)).status, 403);
    assert.equal(client.status().login.state, 'waiting'); assert.equal(calls, 0);
  }, { fetchImpl: async () => { calls++; throw new Error('unexpected upstream call'); } });
});
test('expired TRAE token refresh is single-flight and preserves stable device identity', async () => {
  let refreshed = 0;
  await fixture(async ({ client, store }) => {
    await Promise.all([client.credential(), client.credential(), client.credential()]);
    assert.equal(refreshed, 1); assert.equal(store.get().trae.credential.refreshToken, 'new-refresh');
    assert.deepEqual(store.get().trae.identity, identity);
  }, { state: { credential: { ...credential, expiresAt: Date.now() - 1000 } }, fetchImpl: async () => {
    refreshed++; return json({ Result: { Token: 'new-access', RefreshToken: 'new-refresh', TokenExpireDuration: 3600 } });
  } });
});
test('daily scheduler uses Shanghai dates, claims once across concurrent ticks and restart', async () => {
  let now = Date.parse('2026-10-26T15:59:00Z'), claims = 0;
  const fetchImpl = async url => { const path = new URL(url).pathname;
    if (path === TRAE_PATHS.checkStatus) return json({ code: 0, enable: true, checked_in: false });
    if (path === TRAE_PATHS.claim) { claims++; return json({ code: 0, credits: 100 }); }
    return json({ code: 0, user_entitlement_pack_list: [] });
  };
  await fixture(async ({ client, store, dir }) => {
    await store.patchTrae({ autoCheckin: true });
    await Promise.all([client.tick(), client.tick(), client.tick()]); assert.equal(claims, 1);
    const loaded = await new LocalStore(dir).load();
    const afterRestart = new TraeClient({ store: loaded, now: () => now, fetchImpl });
    try { await afterRestart.tick(); assert.equal(claims, 1); now += 120_000; await afterRestart.tick(); assert.equal(claims, 2); }
    finally { afterRestart.stop(); }
    assert.equal(shanghaiDay(now), '2026-10-27');
  }, { now: () => now, state: { credential: { ...credential, expiresAt: now + 3_600_000 } }, fetchImpl });
});
test('check-in recognizes already claimed status and never POSTs another claim', async () => {
  let claims = 0;
  await fixture(async ({ client }) => { const result = await client.checkin(); assert.equal(result.phase, 'already-claimed'); assert.equal(claims, 0); },
    { fetchImpl: async url => { if (new URL(url).pathname === TRAE_PATHS.claim) claims++; return json({ code: 0, enable: true, checked_in: true }); } });
});
test('ambiguous check-in persists before claiming and is not retried after network failure', async () => {
  let claims = 0;
  const fetchImpl = async url => {
    if (new URL(url).pathname === TRAE_PATHS.checkStatus) return json({ code: 0, enable: true, checked_in: false });
    claims++; throw new Error('timeout fixture-access-secret');
  };
  await fixture(async ({ client, store, dir }) => {
    await assert.rejects(client.checkin(), /网络请求失败/); assert.equal(claims, 1);
    assert.equal(store.get().trae.checkin.phase, 'uncertain'); assert.ok(!JSON.stringify(client.status()).includes('fixture-access-secret'));
    const loaded = await new LocalStore(dir).load(), restarted = new TraeClient({ store: loaded, fetchImpl });
    try { await restarted.checkin(); assert.equal(claims, 1); } finally { restarted.stop(); }
  }, { fetchImpl });
});
test('risk-control response stops without retrying or changing device identity', async () => {
  let claims = 0;
  await fixture(async ({ client, store }) => {
    await assert.rejects(client.checkin(), /风控或限流/); assert.equal(store.get().trae.checkin.phase, 'blocked');
    await client.checkin(); assert.equal(claims, 1); assert.deepEqual(store.get().trae.identity, identity);
  }, { fetchImpl: async url => { if (new URL(url).pathname === TRAE_PATHS.checkStatus) return json({ code: 0, enable: true, checked_in: false }); claims++; return new Response('secret upstream body', { status: 429 }); } });
});
test('expired credit packages do not count as available balance', async () => {
  await fixture(async ({ client }) => {
    const b = await client.balance(); assert.equal(b.total, 80);
  }, { fetchImpl: async () => json({ code: 0, user_entitlement_pack_list: [
    { entitlement_base_info: { quota: { credits_limit: 100 } }, usage: { credits_amount: 20 }, expire_time: (Date.now() + 3_600_000) / 1000 },
    { entitlement_base_info: { quota: { credits_limit: 999 } }, usage: { credits_amount: 0 }, expire_time: (Date.now() - 1000) / 1000 },
  ] }) });
});

test('TRAE returns more than 6000 characters without local truncation', async () => {
  const text = '长回复'.repeat(3000);
  assert.equal(await parseTraeStream(new Response(`event:output\ndata:${JSON.stringify({response:text})}\n\nevent:done\ndata:{}\n\n`)), text);
});
test('accepted TRAE stream failures never invoke a fallback that could bill again', async () => fixture(async ({ client }) => {
  let fallbackCalls = 0;
  await assert.rejects(generate({providers:[{id:'trae',name:'TRAE',type:'trae',model:'fixture-model',enabled:true},{id:'backup',name:'备用',type:'compatible',enabled:true,apiKey:'fixture',baseUrl:'https://fixture.test',model:'fixture'}]},[],{trae:client,fetchImpl:async()=>{fallbackCalls++;return json({choices:[{message:{content:'unexpected'}}]})}}), /未正常结束/);
  assert.equal(fallbackCalls,0);
}, {fetchImpl:async url=> new URL(url).pathname===TRAE_PATHS.models?json(modelList):new Response('event:output\ndata:{"response":"part"}\n\n')}));
test('missing numerical credit quota stays unknown after encrypted reload rather than displaying zero', async () => fixture(async ({client,dir})=>{
  assert.equal((await client.balance()).total,null);
  assert.equal((await new LocalStore(dir).load()).publicConfig().trae.balance.total,null);
},{fetchImpl:async()=>json({user_entitlement_pack_list:[{entitlement_base_info:{quota:{enable_solo_agent:true}},usage:{}}]})}));
test('inactive check-in and pre-claim network errors retry only status after backoff', async () => {
  let now=Date.parse('2026-10-26T06:00:00Z'), statusCalls=0, claims=0;
  await fixture(async({client})=>{
    await client.tick(); assert.equal(statusCalls,1); await client.tick(); assert.equal(statusCalls,1);
    now+=3_600_001;
    await assert.rejects(client.tick(),/网络/); assert.equal(client.state().checkin.phase,'status-error');
    await client.tick(); assert.equal(statusCalls,2);
    now+=900_001; await client.tick(); assert.equal(statusCalls,3); assert.equal(claims,0);
  },{now:()=>now,state:{autoCheckin:true,credential:{...credential,expiresAt:now+10_000_000}},fetchImpl:async url=>{
    if(new URL(url).pathname===TRAE_PATHS.claim){claims++;throw new Error('unexpected claim');}
    statusCalls++;if(statusCalls===2)throw new Error('network');return json({code:0,enable:false,checked_in:false});
  }});
});
