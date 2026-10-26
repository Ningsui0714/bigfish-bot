import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalStore, defaults, mergeConfig, endpoint } from '../server/store.mjs';
import { completion, generate } from '../server/providers.mjs';
import { SocialAgent } from '../server/agent.mjs';
import { normalizeEvent, OneBot } from '../server/onebot.mjs';
import { WebSocketServer } from 'ws';
import { createApplication } from '../server/index.mjs';
const provider = { id: 'primary', name: 'test', enabled: true, type: 'compatible', baseUrl: 'https://example.test/v1', model: 'test-model', apiKey: 'test-fixture-key' };
async function withStore(fn) { const dir = await fs.mkdtemp(join(tmpdir(), 'bigfish-test-')); try { await fn(await new LocalStore(dir).load(), dir); } finally { await fs.rm(dir, { recursive: true, force: true }); } }
const message = (content, extras = {}) => ({ kind: 'group', groupOpenid: '123', senderId: '456', messageId: crypto.randomUUID(), content, ...extras });

test('defaults use 大肥鱼 persona and default-deny QQ', () => {
  const d = defaults(); assert.ok(d.persona.guidance.includes('大肥鱼')); assert.ok(!d.persona.guidance.includes('海鸥'));
  assert.deepEqual(d.qq.allowedGroupIds, []); assert.equal(d.qq.privateEnabled, false);
});
test('secrets are encrypted, masked, retained only on the same endpoint, reloadable', async () => withStore(async (store, dir) => {
  await store.update({ providers: [provider], activeProviderId: 'primary' });
  assert.ok(!JSON.stringify(store.publicConfig()).includes('test-fixture-key'));
  assert.equal(store.publicConfig().providers[0].hasKey, true);
  assert.ok(!(await fs.readFile(join(dir, 'state.enc'))).includes('test-fixture-key'));
  assert.equal((await new LocalStore(dir).load()).get().providers[0].apiKey, 'test-fixture-key');
  await store.update({ providers: [{ ...store.publicConfig().providers[0], name: 'new name' }] });
  assert.equal(store.get().providers[0].apiKey, 'test-fixture-key');
  await store.update({ providers: [{ ...store.publicConfig().providers[0], baseUrl: 'https://changed.test/v1' }] });
  assert.equal(store.get().providers[0].apiKey, '');
  assert.equal((await fs.stat(join(dir, 'local.key'))).mode & 0o777, 0o600);
}));
test('missing encryption key never silently overwrites encrypted state', async () => withStore(async (store, dir) => {
  await store.update({ providers: [provider] }); await fs.unlink(join(dir, 'local.key'));
  await assert.rejects(new LocalStore(dir).load(), /缺失/);
  await assert.rejects(fs.stat(join(dir, 'local.key')), { code: 'ENOENT' });
}));
test('endpoint validation protects saved credentials from insecure remote hosts', () => {
  assert.equal(endpoint('http://127.0.0.1:11434/v1', ['http:']), 'http://127.0.0.1:11434/v1');
  for (const url of ['http://remote.test/v1', 'https://user:pass@a.test', 'https://a.test/?token=secret', 'file:///tmp/test']) assert.throws(() => endpoint(url, ['https:', 'http:']));
  assert.throws(() => mergeConfig({ qq: { url: 'ws://127.0.0.1:3001', allowedGroupIds: ['bad'] } }, defaults()));
});
test('direct completion formats request without tools and sanitizes service errors', async () => {
  let request;
  const reply = await completion(provider, [{ role: 'user', content: '你好' }], { fetchImpl: async (url, options) => {
    request = { url, ...options }; return new Response(JSON.stringify({ choices: [{ message: { content: '你好呀' } }] }));
  } });
  assert.equal(reply, '你好呀'); assert.equal(request.url, 'https://example.test/v1/chat/completions');
  assert.equal(request.headers.Authorization, 'Bearer test-fixture-key');
  assert.equal(JSON.parse(request.body).tools, undefined);
  await assert.rejects(completion(provider, [], { fetchImpl: async () => new Response('echo test-fixture-key', { status: 401 }) }), { message: '模型服务 HTTP 401' });
});
test('provider fallback tries secondary after primary failure', async () => {
  const calls = [];
  const result = await generate({ providers: [provider, { ...provider, id: 'secondary', baseUrl: 'https://second.test/v1' }], activeProviderId: 'primary' }, [], {
    fetchImpl: async url => { calls.push(url); return url.includes('example') ? new Response('', { status: 429 }) : new Response(JSON.stringify({ choices: [{ message: { content: '备用回复' } }] })); },
  });
  assert.equal(result.providerId, 'secondary'); assert.equal(calls.length, 2);
});
test('agent has standalone local memory, room isolation, actual context and no Harness', async () => withStore(async store => {
  let calls = 0; const prompts = [];
  const agent = new SocialAgent({ store, model: async (_c, messages) => { calls++; prompts.push(messages); return { text: '聊聊电影吧', providerId: 'test' }; } });
  await agent.receive(message('大肥鱼记住我喜欢茶'), { local: true }); assert.equal(calls, 0);
  await agent.receive(message('你记得吗'), { local: true }); assert.equal(calls, 1);
  assert.match(JSON.stringify(prompts[0]), /我喜欢茶/);
  await agent.receive(message('继续聊'), { local: true }); assert.match(JSON.stringify(prompts[1]), /bot:self/);
  const denied = await agent.receive(message('你好', { addressed: true })); assert.equal(denied.reason, 'access-denied'); assert.equal(agent.events.at(-1).reason,'access-denied'); assert.equal(agent.events.at(-1).detail,'not-allowlisted');
  const forgot = await agent.receive(message('大肥鱼忘记我'), { local: true }); assert.ok(!forgot.text.includes('DSH')); assert.equal(agent.memories().length, 0);
}));
test('OneBot normalizer ignores self and non-array events, detects self mention only', () => {
  const e = { post_type: 'message', message_type: 'group', group_id: 123, user_id: 456, self_id: 789, message_id: 1, message: [{ type: 'at', data: { qq: '789' } }, { type: 'text', data: { text: '你好' } }] };
  assert.equal(normalizeEvent(e).addressed, true); assert.equal(normalizeEvent(e).content, '你好');
  assert.equal(normalizeEvent({ ...e, user_id: 789 }), null); assert.equal(normalizeEvent({ ...e, message: '[CQ:at,qq=789]' }), null);
  assert.match(normalizeEvent({ ...e, message: [{ type: 'at', data: { qq: '999' } }] }).content, /999/);
});
test('OneBot speaks real WebSocket JSON actions, auth, echo and plaintext segments', async () => {
  const ws = new WebSocketServer({ host: '127.0.0.1', port: 0 }); await new Promise(resolve => ws.once('listening', resolve));
  let authorization; const calls = [];
  ws.on('connection', (client, req) => { authorization = req.headers.authorization; client.on('message', raw => {
    const action = JSON.parse(raw); calls.push(action);
    client.send(JSON.stringify({ status: 'ok', retcode: 0, echo: action.echo, data: action.action === 'get_login_info' ? { user_id: 789, nickname: 'fixture' } : { message_id: 42 } }));
  }); });
  let connected;
  const ready = new Promise(resolve => { connected = resolve; });
  const ob = new OneBot({ onEvent: () => {}, onStatus: s => { if (s.state === 'connected') connected(); } });
  try {
    ob.connect({ url: `ws://127.0.0.1:${ws.address().port}`, token: 'fixture-token' }); await ready;
    const result = await ob.send(message('input'), '[CQ:at,qq=all]');
    assert.equal(authorization, 'Bearer fixture-token'); assert.equal(result.message_id, 42);
    assert.deepEqual(calls[1].params.message, [{ type: 'text', data: { text: '[CQ:at,qq=all]' } }]);
  } finally { ob.stop(); await new Promise(resolve => ws.close(resolve)); }
});
test('local HTTP application authenticates APIs and blocks cross-origin writes', async () => {
  const dir = await fs.mkdtemp(join(tmpdir(), 'bigfish-http-'));
  const app = await createApplication({ dataDir: dir, model: async () => ({ text: '本地测试回复', providerId: 'fixture' }) });
  app.server.listen(0, '127.0.0.1'); await new Promise(resolve => app.server.once('listening', resolve));
  const origin = `http://127.0.0.1:${app.server.address().port}`;
  try {
    const home = await fetch(origin); assert.equal(home.status, 200);
    const cookie = home.headers.get('set-cookie').split(';')[0];
    assert.equal((await fetch(origin + '/api/state')).status, 401);
    const read = await fetch(origin + '/api/state', { headers: { Cookie: cookie } }); assert.equal(read.status, 200);
    const s = await read.json(); assert.deepEqual(s.config.providers, []);
    const evil = await fetch(origin + '/api/qq/connect', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://evil.test', 'Content-Type': 'application/json' }, body: '{}' }); assert.equal(evil.status, 403);
    const headers = { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' };
    const chat = await fetch(origin + '/api/chat', { method: 'POST', headers, body: JSON.stringify({ text: '你好' }) });
    assert.equal((await chat.json()).text, '本地测试回复');
    const save = await fetch(origin + '/api/config', { method: 'PUT', headers, body: JSON.stringify({ revision: 0, config: { providers: [provider], activeProviderId: 'primary' } }) });
    assert.equal(save.status, 200); assert.ok(!(await save.text()).includes('test-fixture-key'));
    assert.equal((await fetch(origin + '/api/config', { method: 'PUT', headers, body: JSON.stringify({ revision: 0, config: {} }) })).status, 409);
  } finally { await app.close(); await fs.rm(dir, { recursive: true, force: true }); }
});

test('whole QQ path: OneBot event -> independent model -> OneBot send action', async () => {
  const dir = await fs.mkdtemp(join(tmpdir(), 'bigfish-full-path-'));
  const ws = new WebSocketServer({ host: '127.0.0.1', port: 0 }); await new Promise(resolve => ws.once('listening', resolve));
  let socket, delivered, ready;
  const arrived = new Promise(resolve => { delivered = resolve; });
  const connected = new Promise(resolve => { ready = resolve; });
  ws.on('connection', client => { socket = client; client.on('message', raw => {
    const action = JSON.parse(raw);
    client.send(JSON.stringify({ status: 'ok', retcode: 0, echo: action.echo,
      data: action.action === 'get_login_info' ? { user_id: 789, nickname: 'fixture' } : { message_id: 99 } }));
    if (action.action === 'get_login_info') ready();
    if (action.action === 'send_group_msg') delivered(action.params);
  }); });
  const app = await createApplication({ dataDir: dir, model: async () => ({ text: '大肥鱼听到了', providerId: 'fixture' }) });
  try {
    await app.store.update({ qq: { ...defaults().qq, url: `ws://127.0.0.1:${ws.address().port}`, allowedGroupIds: ['123'] } });
    app.agent.reset(); app.qq.connect(app.store.get().qq); await connected;
    // Wait until the login-info response has been processed, not just written.
    for (let i = 0; i < 30 && app.qq.status.state !== 'connected'; i++) await new Promise(resolve => setTimeout(resolve, 5));
    socket.send(JSON.stringify({ post_type: 'message', message_type: 'group', group_id: 123, user_id: 456, self_id: 789, message_id: 42,
      message: [{ type: 'at', data: { qq: '789' } }, { type: 'text', data: { text: '你好' } }] }));
    const result = await Promise.race([arrived, new Promise((_, reject) => { const t = setTimeout(() => reject(new Error('QQ pipeline timed out')), 3000); t.unref(); })]);
    assert.equal(result.group_id, '123'); assert.equal(result.message[0].data.text, '大肥鱼听到了');
  } finally { await app.close(); await new Promise(resolve => ws.close(resolve)); await fs.rm(dir, { recursive: true, force: true }); }
});

test('configuration reset cancels in-flight model replies before delivery', async () => withStore(async store => {
  let start, finish;
  const started = new Promise(resolve => { start = resolve; });
  const agent = new SocialAgent({ store, model: async () => { start(); return new Promise(resolve => { finish = resolve; }); } });
  const sent = [];
  const pending = agent.receive(message('你好'), { local: true, send: async text => sent.push(text) });
  // Attach rejection handling before aborting.
  const rejected = assert.rejects(pending, { name: 'AbortError' });
  await started; agent.reset(); finish({ text: '过期的回复', providerId: 'fixture' });
  await rejected; assert.deepEqual(sent, []);
}));

test('direct transport keeps full replies and optional output-token settings', async () => {
  const text='完整回复'.repeat(2000); let body;
  const fetchImpl=async(_url,options)=>{body=JSON.parse(options.body);return new Response(JSON.stringify({choices:[{message:{content:text}}]}));};
  assert.equal(await completion(provider,[],{fetchImpl}),text); assert.equal(body.max_tokens,undefined);
  await completion({...provider,maxOutputTokens:4096},[],{fetchImpl});assert.equal(body.max_tokens,4096);
  assert.equal(mergeConfig({providers:[{...provider,maxOutputTokens:'2048'}]},defaults()).providers[0].maxOutputTokens,2048);
  assert.throws(()=>mergeConfig({providers:[{...provider,maxOutputTokens:-1}]},defaults()),/正整数/);
});
test('accepted invalid JSON does not trigger a second billable request', async()=>{
  let calls=0;
  await assert.rejects(generate({providers:[provider,{...provider,id:'backup'}]},[],{fetchImpl:async()=>{calls++;return new Response('broken');}}),/JSON/);
  assert.equal(calls,1);
});
