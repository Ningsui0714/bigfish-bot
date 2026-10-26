import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createPrivateKey, sign, verify, createPublicKey } from 'node:crypto';
import { QQBot } from '@tencent-connect/qqbot-nodejs';
import { WebSocketServer } from 'ws';
import { defaults, mergeConfig, LocalStore } from '../server/store.mjs';
import { normalizeOfficialMessage, OfficialBot, QqConnection } from '../server/qq.mjs';
import { createApplication } from '../server/index.mjs';

const secret = 'fixture-secret-qq-not-real';
const official = port => ({ ...defaults().qq, mode: 'official', official: { ...defaults().qq.official, appId: '12345', appSecret: secret, transport: 'webhook', port, allowedGroupIds: ['GROUP_FIXTURE'], allowedUserIds: ['USER_FIXTURE'], privateEnabled: true } });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) { for (let i = 0; i < 150; i++) { if (fn()) return; await delay(10); } assert.fail('fixture timed out'); }
async function listen(server) { await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); }); return `http://127.0.0.1:${server.address().port}`; }
async function close(server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
async function freePort() { const s = http.createServer(); await listen(s); const port = s.address().port; await close(s); return port; }
function privateKey() {
  let seed = secret; while (seed.length < 32) seed += seed;
  return createPrivateKey({ key: Buffer.concat([Buffer.from('302e020100300506032b657004220420', 'hex'), Buffer.from(seed.slice(0, 32))]), format: 'der', type: 'pkcs8' });
}
function signed(body, timestamp = String(Math.floor(Date.now() / 1000))) {
  const data = JSON.stringify(body);
  return { body: data, headers: { 'Content-Type': 'application/json', 'X-Signature-Timestamp': timestamp, 'X-Signature-Ed25519': sign(null, Buffer.from(timestamp + data), privateKey()).toString('hex') } };
}
const groupEvent = (id = 'MSG_FIXTURE') => ({ op: 0, t: 'GROUP_AT_MESSAGE_CREATE', d: { id, group_openid: 'GROUP_FIXTURE', author: { member_openid: 'USER_FIXTURE' }, content: '<@12345> 你好', timestamp: new Date().toISOString() } });

test('QQ config migrates old NapCat settings; official credentials and access lists stay separate', () => {
  const legacy = { url: 'ws://127.0.0.1:3001', token: 'onebot-fixture', allowedGroupIds: ['123'], allowedUserIds: [], privateEnabled: false };
  const old = mergeConfig({ qq: legacy }, defaults());
  assert.equal(old.qq.mode, 'napcat'); assert.deepEqual(old.qq.official.allowedGroupIds, []);
  const next = mergeConfig({ qq: { mode: 'official', official: official(3211).official } }, old);
  assert.equal(next.qq.token, 'onebot-fixture'); assert.deepEqual(next.qq.allowedGroupIds, ['123']);
  assert.deepEqual(next.qq.official.allowedGroupIds, ['GROUP_FIXTURE']);
  assert.equal(mergeConfig({ qq: { official: { appSecret: '' } } }, next).qq.official.appSecret, secret);
  assert.equal(mergeConfig({ qq: { official: { appId: '23456', appSecret: '' } } }, next).qq.official.appSecret, '');
  assert.equal(mergeConfig({ qq: { official: { clearSecret: true } } }, next).qq.official.appSecret, '');
  assert.throws(() => mergeConfig({ qq: { mode: 'ollama' } }, next), /官方 Bot 或 NapCat/);
  assert.throws(() => mergeConfig({ qq: { allowedGroupIds: ['GROUP_FIXTURE'] } }, next), /数字 ID/);
  assert.throws(() => mergeConfig({ qq: { official: { port: 0 } } }, next), /端口/);
  assert.throws(() => mergeConfig({ qq: { official: { allowedGroupIds: ['../../bad'] } } }, next), /OpenID/);
});

test('QQ secrets remain encrypted and never appear in public configuration after reload', async () => {
  const dir = await fs.mkdtemp(join(tmpdir(), 'bigfish-qq-store-'));
  try {
    const store = await new LocalStore(dir).load(); await store.update({ qq: official(3211) });
    const publicConfig = store.publicConfig(); assert.equal(publicConfig.qq.official.hasSecret, true);
    assert.ok(!JSON.stringify(publicConfig).includes(secret)); assert.equal(publicConfig.qq.official.appSecret, undefined);
    assert.ok(!(await fs.readFile(join(dir, 'state.enc'))).includes(Buffer.from(secret)));
    const again = await new LocalStore(dir).load(); assert.equal(again.get().qq.official.appSecret, secret);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('official group @ and full-message normalization differ; bots, guilds and invalid messages are ignored', () => {
  const raw = { kind: 'group', senderId: 'U', groupOpenid: 'G', messageId: 'M', content: '<@!123> 你好', rawEventType: 'GROUP_AT_MESSAGE_CREATE' };
  const m = normalizeOfficialMessage(raw); assert.equal(m.content, '你好'); assert.equal(m.addressed, true);
  assert.deepEqual(m.replyTarget, { scope: 'group', targetId: 'G', msgId: 'M' });
  assert.equal(normalizeOfficialMessage({ ...raw, rawEventType: 'GROUP_MESSAGE_CREATE' }).addressed, false);
  assert.equal(normalizeOfficialMessage({ ...raw, senderIsBot: true }), null);
  assert.equal(normalizeOfficialMessage({ ...raw, groupOpenid: '' }), null);
  assert.equal(normalizeOfficialMessage({ ...raw, kind: 'guild' }), null);
  assert.equal(normalizeOfficialMessage({ ...raw, content: null }), null);
  assert.equal(normalizeOfficialMessage({ ...raw, kind: 'c2c' }).replyTarget.targetId, 'U');
});

test('real QQ SDK fixture: token -> signed webhook -> social model -> official group/C2C reply', async () => {
  const calls = [];
  const upstream = http.createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = JSON.parse(Buffer.concat(chunks).toString()); calls.push({ path: req.url, auth: req.headers.authorization, body });
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(req.url === '/app/getAppAccessToken' ? { access_token: 'fixture-access', expires_in: 7200 } : { id: 'REPLY_FIXTURE' }));
  });
  const baseUrl = await listen(upstream), port = await freePort(), dir = await fs.mkdtemp(join(tmpdir(), 'bigfish-official-'));
  let modelCalls = 0;
  const app = await createApplication({ dataDir: dir, model: async () => { modelCalls++; return { text: '大肥鱼听到了', providerId: 'fixture' }; },
    officialBotFactory: opts => new QQBot({ ...opts, baseUrl, tokenBaseUrl: baseUrl }) });
  const callback = `http://127.0.0.1:${port}/qqbot`;
  try {
    await app.store.update({ qq: official(port) }); app.agent.reset(); app.qq.connect(app.store.get().qq);
    await until(() => app.qq.status.state === 'listening');
    assert.equal(app.qq.status.mode, 'official'); assert.equal(app.qq.status.lastEventAt, null);
    assert.equal((await fetch(callback)).status, 404);
    assert.equal((await fetch(callback + '/wrong', { method: 'POST' })).status, 404);
    const challenge = await fetch(callback, { method: 'POST', body: JSON.stringify({ op: 13, d: { plain_token: 'challenge', event_ts: '1234567890' } }) });
    const proof = await challenge.json(); assert.equal(proof.plain_token, 'challenge');
    assert.equal(verify(null, Buffer.from('1234567890challenge'), createPublicKey(privateKey()), Buffer.from(proof.signature, 'hex')), true);
    assert.equal(app.qq.status.state, 'listening'); // URL challenge is not a connected QQ event.
    assert.equal((await fetch(callback, { method: 'POST', body: JSON.stringify(groupEvent()) })).status, 401);
    assert.equal((await fetch(callback, { method: 'POST', ...signed(groupEvent(), '1000000000') })).status, 401);
    const tampered = signed(groupEvent()); tampered.body = tampered.body.replace('你好', '坏消息');
    assert.equal((await fetch(callback, { method: 'POST', ...tampered })).status, 401);
    assert.equal(modelCalls, 0); assert.equal(app.qq.status.recentPeers.length, 0);
    assert.equal((await fetch(callback, { method: 'POST', ...signed(groupEvent()) })).status, 200);
    await until(() => calls.some(c => c.path === '/v2/groups/GROUP_FIXTURE/messages'));
    const sent = calls.find(c => c.path === '/v2/groups/GROUP_FIXTURE/messages');
    assert.equal(sent.auth, 'QQBot fixture-access'); assert.equal(sent.body.msg_type, 0); assert.equal(sent.body.msg_id, 'MSG_FIXTURE');
    assert.equal(sent.body.content, '大肥鱼听到了'); assert.ok(sent.body.msg_seq >= 1);
    assert.equal(app.qq.status.state, 'connected'); assert.equal(app.qq.status.recentPeers[0].groupId, 'GROUP_FIXTURE');
    await fetch(callback, { method: 'POST', ...signed(groupEvent()) }); await delay(20); assert.equal(modelCalls, 1);
    const c2c = { op: 0, t: 'C2C_MESSAGE_CREATE', d: { id: 'C2C_FIXTURE', author: { user_openid: 'USER_FIXTURE' }, content: '你好', timestamp: new Date().toISOString() } };
    await fetch(callback, { method: 'POST', ...signed(c2c) });
    await until(() => calls.some(c => c.path === '/v2/users/USER_FIXTURE/messages'));
    assert.equal(modelCalls, 2);
    const denied = groupEvent('DENIED'); denied.d.group_openid = 'OTHER_GROUP';
    await fetch(callback, { method: 'POST', ...signed(denied) }); await delay(20); assert.equal(modelCalls, 2);
    assert.equal(app.qq.status.recentPeers[0].groupId, 'OTHER_GROUP'); // Observe ID for manual allowlist, not auto-allow.
    assert.ok(!JSON.stringify(app.qq.status).includes('你好'));
    app.qq.stop(); assert.equal(app.qq.status.state, 'disconnected'); assert.deepEqual(app.qq.status.recentPeers, []);
    await assert.rejects(fetch(callback), /fetch failed/);
  } finally { await app.close(); await close(upstream); await fs.rm(dir, { recursive: true, force: true }); }
});

function fakeFactory(instances) {
  return options => {
    const handlers = {}; let finish;
    const instance = { options, stopped: false, sent: [], on: (type, fn) => { handlers[type] = fn; },
      start: () => new Promise(resolve => { finish = resolve; handlers.ready?.(); }),
      stop: () => { instance.stopped = true; finish?.(); }, sendText: async (m, text) => { instance.sent.push({ m, text }); },
      message: m => handlers.message?.({}, m) };
    instances.push(instance); return instance;
  };
}

test('QQ session switch cancels queued send and ignores callbacks from the old bot', async () => {
  const instances = []; let send, received = 0;
  const qq = new QqConnection({ officialBotFactory: fakeFactory(instances), onMessage: (_m, fn) => { received++; send = fn; } });
  const m = { kind: 'c2c', senderId: 'USER_FIXTURE', messageId: 'M', content: '你好' };
  try {
    qq.connect(official(3211)); await delay(0); await instances[0].message(m); assert.equal(received, 1);
    qq.connect(official(3212)); await delay(0);
    await assert.rejects(async () => send('旧回复'), /会话已更换/);
    await instances[0].message(m); assert.equal(received, 1); assert.deepEqual(instances[1].sent, []);
    assert.deepEqual(qq.status.recentPeers, []);
    qq.stop(); await instances[1].message(m); assert.equal(received, 1);
  } finally { qq.stop(); }
});

test('official stop during token startup does not resurrect the callback listener', async () => {
  let finish; const instances = [];
  const bot = new OfficialBot({ onMessage: () => {}, botFactory: opts => {
    const fake = fakeFactory(instances)(opts);
    fake.start = async () => { await new Promise(resolve => { finish = resolve; }); await opts.webhook.server.listen(0, '/qqbot', async () => ({ status: 200, body: '{}' })); };
    return fake;
  } });
  bot.connect(official(3211)); await until(() => !!finish); bot.stop(); finish(); await bot.task;
  assert.equal(bot.status.state, 'disconnected'); assert.equal(instances[0].stopped, true);
});

test('official startup failure does not expose upstream secrets and missing credentials fail immediately', async () => {
  const bot = new OfficialBot({ onMessage: () => {}, botFactory: () => ({ on: () => {}, start: async () => { throw new Error(secret); }, stop: () => {} }) });
  bot.connect(official(3211)); await bot.task;
  assert.equal(bot.status.state, 'error'); assert.ok(!JSON.stringify(bot.status).includes(secret)); bot.stop();
  assert.throws(() => bot.connect({ official: { appId: '', appSecret: '' } }), /AppID 和 AppSecret/);
});

test('real QQ SDK WebSocket fixture: token + gateway discovery + IDENTIFY/READY + group reply, no public callback', async () => {
  const ws=new WebSocketServer({host:'127.0.0.1',port:0});await new Promise(resolve=>ws.once('listening',resolve));
  const calls=[];let socket,identified;
  ws.on('connection',client=>{socket=client;client.send(JSON.stringify({op:10,d:{heartbeat_interval:60000}}));client.on('message',raw=>{
    const payload=JSON.parse(raw);if(payload.op===2){identified=payload.d;client.send(JSON.stringify({op:0,t:'READY',s:1,d:{session_id:'SESSION_FIXTURE',user:{id:'12345',username:'fixture'}}}));}
    if(payload.op===1)client.send(JSON.stringify({op:11,d:null}));
  });});
  const upstream=http.createServer(async(req,res)=>{const chunks=[];for await(const c of req)chunks.push(c);const body=Buffer.concat(chunks).toString();calls.push({path:req.url,body:body?JSON.parse(body):null});res.setHeader('Content-Type','application/json');res.end(JSON.stringify(req.url==='/app/getAppAccessToken'?{access_token:'fixture-ws-token',expires_in:7200}:req.url==='/gateway'?{url:`ws://127.0.0.1:${ws.address().port}`}:{id:'REPLY_WS'}));});
  const baseUrl=await listen(upstream), dir=await fs.mkdtemp(join(tmpdir(),'bigfish-qq-ws-'));
  const app=await createApplication({dataDir:dir,model:async()=>({text:'扫码路径的直连回复',providerId:'fixture'}),officialBotFactory:opts=>new QQBot({...opts,baseUrl,tokenBaseUrl:baseUrl})});
  try {
    const q=official(3211);q.official.transport='websocket';await app.store.update({qq:q});app.agent.reset();app.qq.connect(app.store.get().qq);
    await until(()=>app.qq.status.state==='connected');assert.equal(identified.token,'QQBot fixture-ws-token');assert.equal(identified.intents,1<<25);
    assert.equal(app.qq.status.callbackUrl,null);assert.equal(app.qq.status.transport,'websocket');
    socket.send(JSON.stringify({...groupEvent('WS_MESSAGE'),s:2}));await until(()=>calls.some(c=>c.path==='/v2/groups/GROUP_FIXTURE/messages'));
    const sent=calls.find(c=>c.path==='/v2/groups/GROUP_FIXTURE/messages');assert.equal(sent.body.content,'扫码路径的直连回复');assert.equal(sent.body.msg_id,'WS_MESSAGE');
    socket.close(1000);await until(()=>app.qq.status.state==='reconnecting');app.qq.stop();
  } finally {await app.close();await close(upstream);for(const client of ws.clients)client.terminate();await new Promise(resolve=>ws.close(resolve));await fs.rm(dir,{recursive:true,force:true});}
});
