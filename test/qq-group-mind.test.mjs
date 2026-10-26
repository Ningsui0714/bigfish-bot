import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { QqGroupMind, normalizeSocialMemory } from '../src/channels/qq/group-mind.mjs';
import { normalizeQqGroupChatbotConfig } from '../src/channels/qq/qq-mention.mjs';
import { QqStateStore } from '../src/channels/qq/state-store.mjs';
import { QqHarnessBridge } from '../src/channels/qq/qq-bridge.mjs';
const msg = (content, extra = {}) => ({ kind: 'group', groupOpenid: 'room-a', senderId: 'alice', content, ...extra });
function fixture(config = {}) {
  let time = 100_000;
  const mind = new QqGroupMind({ config: normalizeQqGroupChatbotConfig(config), now: () => time, random: () => 0.1 });
  return { mind, tick: (ms = 21_000) => { time += ms; } };
}
test('listen by default; interests/questions get a bounded opportunity, not every message', () => {
  const { mind } = fixture();
  assert.equal(mind.consider(msg('今天去上课')).reason, 'listen');
  assert.equal(mind.consider(msg('这电影结尾真仓促')).reason, 'interest');
  assert.equal(mind.consider(msg('游戏玩什么')).reason, 'cooldown');
});
test('low signal, human mentions, repeated messages and busy turns stay quiet', () => {
  const { mind } = fixture();
  for (const text of ['哈哈哈', '+1', 'https://a.test/', '<@human> 电影好看吗']) assert.equal(mind.consider(msg(text)).speak, false);
  assert.equal(mind.consider(msg('这个电影怎么样'), { busy: true }).reason, 'busy');
  assert.equal(mind.consider(msg('这个电影怎么样')).reason, 'repeat');
});
test('name and mentions bypass sampling, but passive rate limits remain room-local', () => {
  const { mind, tick } = fixture({ replyProbability: 1 });
  assert.equal(mind.consider(msg('大肥鱼，聊两句')).reason, 'name');
  assert.equal(mind.consider(msg('电影一')).speak, true);
  tick();
  assert.equal(mind.consider(msg('电影二')).speak, true);
  tick();
  assert.equal(mind.consider(msg('电影三')).reason, 'budget');
  assert.equal(mind.consider(msg('你好'), { addressed: true }).speak, true);
  assert.equal(mind.consider(msg('电影四', { groupOpenid: 'room-b' })).speak, true);
});
test('followup is grounded in a delivered reply, same speaker, and a short time window', () => {
  const { mind, tick } = fixture({ replyProbability: 0 });
  const m = msg('你怎么看');
  mind.delivered(m, '节奏确实慢');
  tick();
  assert.equal(mind.consider(msg('那为什么这么拍')).reason, 'followup');
  tick();
  assert.equal(mind.consider(msg('那为什么这么拍', { senderId: 'bob' })).speak, false);
  tick(100_000);
  assert.equal(mind.consider(msg('那后面呢')).speak, false);
});
test('mute is addressed only, expires, and can be explicitly reversed', () => {
  const { mind, tick } = fixture({ replyProbability: 1, muteMs: 1000 });
  assert.equal(mind.consider(msg('大肥鱼安静')).reason, 'mute');
  assert.equal(mind.isMuted(msg('')), true);
  assert.equal(mind.consider(msg('电影好看')).reason, 'muted');
  assert.equal(mind.consider(msg('有个问题'), { addressed: true }).speak, true);
  tick(1001);
  assert.equal(mind.isMuted(msg('')), false);
  mind.consider(msg('大肥鱼安静'));
  assert.equal(mind.consider(msg('大肥鱼可以说话了')).reason, 'unmute');
});
test('explicit memory is bounded, attributed, scoped, expiring and deletable', () => {
  const { mind, tick } = fixture();
  assert.equal(mind.consider(msg('我喜欢喝茶')).memoryChanged, undefined);
  for (let i = 0; i < 10; i++) mind.consider(msg(`大肥鱼记住：我喜欢茶${i}`));
  assert.equal(mind.memorySnapshot().length, 8);
  assert.equal(JSON.parse(mind.context(msg('hi', { senderId: 'bob' }))).memories.length, 0);
  assert.equal(JSON.parse(mind.context(msg('hi', { groupOpenid: 'room-b' }))).memories.length, 0);
  assert.equal(mind.consider(msg('大肥鱼记住我的密码是123')).reason, 'sensitive-memory');
  assert.match(mind.consider(msg('大肥鱼你记得我什么')).reply, /茶9/);
  assert.equal(mind.consider(msg('大肥鱼忘记我')).memoryChanged, true);
  assert.equal(mind.memorySnapshot().length, 0);
  mind.consider(msg('大肥鱼记住我爱乌龙茶'));
  tick(31 * 86_400_000);
  assert.equal(mind.memorySnapshot().length, 0);
  assert.deepEqual(normalizeSocialMemory([{ at: Infinity }]), []);
});
test('disabled memory and zero participation are respected', () => {
  const { mind } = fixture({ memoryEnabled: false, replyProbability: 0 });
  assert.equal(mind.consider(msg('大肥鱼记住我爱茶')).reason, 'memory-disabled');
  assert.equal(mind.consider(msg('电影怎么样？')).speak, false);
});
test('memory survives an actual state store reload', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qq-mind-'));
  try {
    const path = join(dir, 'state.json');
    const store = await new QqStateStore(path).load();
    await store.setSocialMemory([{ room: 'a', sender: 'u', text: '喜欢茶', at: Date.now() }]);
    const loaded = await new QqStateStore(path).load();
    assert.equal(loaded.socialMemory()[0].text, '喜欢茶');
    await loaded.setSocialMemory([]);
    assert.equal((await new QqStateStore(path).load()).socialMemory().length, 0);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('real bridge filters quiet traffic, handles local memory and does not call Harness', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qq-bridge-mind-'));
  try {
    const state = await new QqStateStore(join(dir, 'state.json')).load();
    const sent = [];
    const bridge = new QqHarnessBridge({ bot: { appId: 'bot', sendText: async (_target, text) => sent.push(text) },
      state, ownerUserOpenid: '*', harness: {}, groupChatbot: { replyProbability: 0 } });
    const incoming = (id, text) => msg(text, { messageId: id, replyTarget: { scope: 'group', targetId: 'room-a' } });
    await bridge.accept(incoming('1', '普通路人聊天'));
    assert.equal(sent.length, 0);
    assert.equal(state.hasSeen('1'), true);
    await bridge.accept(incoming('2', '大肥鱼记住我喜欢茶'));
    assert.equal(state.socialMemory()[0].text, '我喜欢茶');
    await bridge.accept(incoming('2', '大肥鱼记住我喜欢茶'));
    assert.equal(sent.length, 1);
    await bridge.accept(incoming('3', '大肥鱼忘记我'));
    assert.equal(state.socialMemory().length, 0);
    assert.equal(sent.length, 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('context remains valid bounded JSON with adversarial escaping and long bursts', () => {
  const { mind } = fixture();
  for (let i = 0; i < 40; i++) mind.consider(msg('"\\'.repeat(1000) + i), { busy: true });
  const context = mind.context(msg('now'));
  assert.ok(context.length <= 7000);
  assert.ok(JSON.parse(context).recent.length > 0);
});

test('bridge injects personality and social context and consumes model silence', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qq-social-delivery-'));
  try {
    const state = await new QqStateStore(join(dir, 'state.json')).load();
    const calls = [], sent = [];
    const harness = { createSession: async () => 'session-a', sessionExists: async () => true,
      ask: async (_id, prompt, options) => { calls.push({ prompt, options }); return '[[QQ_SILENT]]'; } };
    const bridge = new QqHarnessBridge({ bot: { appId: 'bot', sendText: async (_target, text) => sent.push(text) },
      state, ownerUserOpenid: '*', harness });
    await bridge.accept(msg('大肥鱼，电影结尾你怎么看', { messageId: 'm1', replyTarget: { scope: 'group', targetId: 'room-a' } }));
    assert.equal(calls.length, 1);
    assert.match(calls[0].prompt, /qq-social/);
    assert.match(calls[0].options.sourceGuidance, /群友/);
    assert.equal(sent.length, 0);
    assert.equal(bridge.status.lastParticipation.reason, 'model-silence');
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('bridge records actual successful replies as bot context for later conversation', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qq-delivered-'));
  try {
    const state = await new QqStateStore(join(dir, 'state.json')).load();
    const calls = [], sent = [];
    const harness = { createSession: async () => 's', sessionExists: async () => true,
      ask: async (_id, prompt) => { calls.push(prompt); return '我觉得节奏有点赶。'; } };
    const bridge = new QqHarnessBridge({ bot: { appId: 'bot', sendText: async (_target, text) => sent.push(text) },
      state, ownerUserOpenid: '*', harness });
    for (const id of ['1', '2']) await bridge.accept(msg('电影结尾呢', { messageId: id,
      rawEventType: 'GROUP_AT_MESSAGE_CREATE', replyTarget: { scope: 'group', targetId: 'room-a' } }));
    assert.equal(sent.length, 2);
    assert.match(calls[1], /bot:self/);
    assert.match(calls[1], /我觉得节奏有点赶/);
    assert.equal(bridge.status.messagesReplied, 2);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('a mute during inference suppresses the pending passive reply', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qq-mute-inflight-'));
  try {
    const state = await new QqStateStore(join(dir, 'state.json')).load();
    const sent = [];
    let finish, started;
    const ready = new Promise(resolve => { started = resolve; });
    const harness = { createSession: async () => 's', sessionExists: async () => true,
      ask: async () => { started(); return new Promise(resolve => { finish = resolve; }); } };
    const bridge = new QqHarnessBridge({ bot: { appId: 'bot', sendText: async (_target, text) => sent.push(text) },
      state, ownerUserOpenid: '*', harness });
    const incoming = (id, text) => msg(text, { messageId: id, replyTarget: { scope: 'group', targetId: 'room-a' } });
    const task = bridge.accept(incoming('1', '大肥鱼电影怎么样'));
    await ready;
    await bridge.accept(incoming('2', '大肥鱼安静'));
    finish('我还想插一句');
    await task;
    assert.deepEqual(sent, ['好，我先安静一会儿。']);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('access rejection happens before memory and participation', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qq-mind-denied-'));
  try {
    const state = await new QqStateStore(join(dir, 'state.json')).load();
    const bridge = new QqHarnessBridge({ bot: { appId: 'bot', sendText: async () => assert.fail('denied traffic must stay quiet') },
      state, ownerUserOpenid: '*', harness: {}, accessPolicy: { getSettings: () => null } });
    await bridge.accept(msg('大肥鱼记住我爱茶', { messageId: 'denied' }));
    assert.equal(state.socialMemory().length, 0);
    assert.equal(bridge.status.messagesRejected, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
