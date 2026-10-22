/**
 * 新增能力的测试：配置持久化、Kilo 车道解析、自指保护。
 *
 * 这三块都是「修 bug 时新写的代码」，必须有覆盖 —— 否则下次改动会把它们
 * 悄悄改坏。
 *
 *     node --test test/lane-config.test.mjs
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  LaneConfigStore,
  defaultConfig,
  normalizeConfig,
  normalizeLanesConfig,
} from '../src/product/lane-config.js';
import { DeepSeekFallbackAdapter } from '../src/product/deepseek-adapter.js';
import { AUTO_MODEL, DEFAULT_LANES, isAutoLane } from '../src/product/lane-fallback.js';

function temporaryHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qqfb-cfg-'));
}

const quiet = { info() {}, warn() {}, error() {} };

/* --------------------------------------------------------------- 配置规范化 */

test('normalizeLanesConfig 丢掉非 DeepSeek 模型', () => {
  const lanes = normalizeLanesConfig([
    { provider: 'codearts', model: 'deepseek-v4.1-flash' },
    { provider: 'kilo', model: 'kilo-auto/free' },
    { provider: 'gemini', model: 'gemini-5-pro' },
  ]);
  assert.deepEqual(lanes.map((lane) => lane.provider), ['codearts']);
});

test('normalizeLanesConfig 丢掉自指车道', () => {
  const lanes = normalizeLanesConfig([
    { provider: 'dsh-deepseek', model: 'deepseek-v4.1-flash' },
    { provider: 'codearts', model: 'deepseek-v4.1-flash' },
  ]);
  assert.deepEqual(lanes.map((lane) => lane.provider), ['codearts']);
});

test('normalizeLanesConfig 去重并保留顺序', () => {
  const lanes = normalizeLanesConfig([
    { provider: 'trae', model: 'deepseek-v4.1-flash' },
    { provider: 'codearts', model: 'deepseek-v4.1-flash' },
    { provider: 'trae', model: 'deepseek-v4.1-flash' },
  ]);
  assert.deepEqual(lanes.map((lane) => lane.provider), ['trae', 'codearts']);
});

test('normalizeLanesConfig 保留 enabled 标记', () => {
  const lanes = normalizeLanesConfig([
    { provider: 'codearts', model: 'deepseek-v4.1-flash', enabled: false },
  ]);
  assert.equal(lanes[0].enabled, false);
});

test('normalizeConfig 在车道为空时回落默认', () => {
  const config = normalizeConfig({ version: 2, lanes: [], freeFallback: true });
  assert.ok(config.lanes.length > 0);
  assert.equal(config.freeFallback, true);
});

test('normalizeConfig 把旧版本配置升级成默认值', () => {
  const config = normalizeConfig({ version: 1, lanes: [{ provider: 'trae', model: 'deepseek-v4.1-flash' }] });
  assert.equal(config.version, 2);
  assert.ok(config.lanes.every((lane) => lane.model === 'auto'), '旧版固定 id 应当被升级成 auto');
});

test('normalizeConfig 容忍垃圾输入', () => {
  for (const value of [null, undefined, 42, 'x', [], { lanes: 'nope', version: 2 }]) {
    const config = normalizeConfig(value);
    assert.ok(Array.isArray(config.lanes));
    assert.ok(config.lanes.length > 0);
  }
});

/* ------------------------------------------------------------------- 持久化 */

test('LaneConfigStore 首次读取落盘默认值', () => {
  const home = temporaryHome();
  const store = new LaneConfigStore({ dshHome: home, logger: quiet });
  const value = store.load();
  assert.ok(value.lanes.length > 0);
  assert.equal(value.freeFallback, false);
  assert.ok(fs.existsSync(store.file), '应当写出配置文件');
});

test('LaneConfigStore 保存后能读回', () => {
  const home = temporaryHome();
  const store = new LaneConfigStore({ dshHome: home, logger: quiet });
  store.load();
  store.save({
    lanes: [{ provider: 'codearts', model: 'deepseek-v4.1-flash', enabled: true }],
    freeFallback: true,
  });
  const reread = new LaneConfigStore({ dshHome: home, logger: quiet }).load();
  assert.equal(reread.lanes.length, 1);
  assert.equal(reread.lanes[0].provider, 'codearts');
  assert.equal(reread.freeFallback, true);
});

test('LaneConfigStore 遇到坏文件时备份并回落默认', () => {
  const home = temporaryHome();
  const store = new LaneConfigStore({ dshHome: home, logger: quiet });
  fs.mkdirSync(store.dir, { recursive: true });
  fs.writeFileSync(store.file, '{ 这不是 JSON', 'utf8');
  const value = store.load();
  assert.equal(value.lanes.length, defaultConfig().lanes.length);
  const backups = fs.readdirSync(store.dir).filter((name) => name.includes('.corrupt-'));
  assert.equal(backups.length, 1, '坏文件应当被备份保留');
});

test('LaneConfigStore.reset 回到默认', () => {
  const home = temporaryHome();
  const store = new LaneConfigStore({ dshHome: home, logger: quiet });
  store.save({ lanes: [{ provider: 'trae', model: 'deepseek-v4.1-flash' }], freeFallback: true });
  const value = store.reset();
  assert.equal(value.freeFallback, false);
  assert.deepEqual(
    value.lanes.map((lane) => lane.provider),
    DEFAULT_LANES.map((lane) => lane.provider),
  );
});

/* ------------------------------------------------------- 自指保护与车道过滤 */

/** 构造一个 adapter，`resolveCall` 记录被调用过的 provider。 */
function makeAdapter(lanes, { available = [], catalog = {} } = {}) {
  const called = [];
  const adapter = new DeepSeekFallbackAdapter({
    lanes,
    logger: quiet,
    isAvailable: (lane) => available.length === 0 || available.includes(lane.provider),
    resolveCall: (lane) => {
      called.push(`${lane.provider}/${lane.model}`);
      return (async function* chunks() {
        yield { type: 'text-delta', index: 0, text: 'ok' };
        yield { type: 'finish', reason: { kind: 'stop' } };
      })();
    },
  });
  // `auto` 车道要靠宿主的目录解析模型 —— 给一个替身，按 provider 返回模型列表。
  adapter.setLlmRuntime({
    listModels: async (provider) => (catalog[provider] ?? []).map((id) => ({ id })),
  });
  return { adapter, called };
}

test('适配器不会把自己当成车道（防无限递归）', async () => {
  const { adapter, called } = makeAdapter([
    { provider: 'dsh-deepseek', model: 'deepseek-v4.1-flash' },
    { provider: 'codearts', model: 'deepseek-v4.1-flash' },
  ]);
  const chunks = [];
  for await (const chunk of adapter.stream({ provider: 'dsh-deepseek', model: 'deepseek-v4.1-flash' })) {
    chunks.push(chunk);
  }
  assert.deepEqual(called, ['codearts/deepseek-v4.1-flash']);
  assert.ok(chunks.some((chunk) => chunk.type === 'text-delta'));
});

test('listModels 只列出 provider 已注册的车道', async () => {
  const { adapter } = makeAdapter(
    [
      { provider: 'codearts', model: 'deepseek-v4.1-flash' },
      { provider: 'trae', model: 'deepseek-v4-flash' },
    ],
    {
      available: ['codearts'],
      catalog: { codearts: ['deepseek-v4.1-flash'], trae: ['deepseek-v4-flash'] },
    },
  );
  const models = await adapter.listModels('dsh-deepseek');
  assert.deepEqual(models.map((model) => model.id), ['deepseek-v4.1-flash']);
});

test('listModels 在没有可用车道时返回空数组', async () => {
  const { adapter } = makeAdapter(
    [{ provider: 'codearts', model: 'deepseek-v4.1-flash' }],
    { available: ['trae'], catalog: { codearts: ['deepseek-v4.1-flash'] } },
  );
  assert.deepEqual(await adapter.listModels('dsh-deepseek'), []);
});

test('车道全部失败时产出 finish error 而不是抛出', async () => {
  const adapter = new DeepSeekFallbackAdapter({
    lanes: [
      { provider: 'a', model: 'deepseek-v4.1-flash' },
      { provider: 'b', model: 'deepseek-v4.1-flash' },
    ],
    logger: quiet,
    resolveCall: () => {
      throw new Error('额度用尽');
    },
  });
  const chunks = [];
  for await (const chunk of adapter.stream({ provider: 'dsh-deepseek', model: 'deepseek-v4.1-flash' })) {
    chunks.push(chunk);
  }
  const finish = chunks.at(-1);
  assert.equal(finish.type, 'finish');
  assert.equal(finish.reason.kind, 'error');
  assert.match(finish.reason.failure.message, /所有 DeepSeek 车道都不可用/);
  assert.match(finish.reason.failure.message, /额度用尽/);
});

test('没有车道时产出可操作的中文提示', async () => {
  const { adapter } = makeAdapter([]);
  const chunks = [];
  for await (const chunk of adapter.stream({ provider: 'dsh-deepseek', model: 'deepseek-v4.1-flash' })) {
    chunks.push(chunk);
  }
  assert.match(chunks.at(-1).reason.failure.message, /登录至少一个账号渠道/);
});

test('auto 车道从渠道目录里挑一个 DeepSeek 模型', async () => {
  const { adapter, called } = makeAdapter(
    [{ provider: 'trae', model: AUTO_MODEL }],
    { catalog: { trae: ['Doubao-Seed-Code', 'DeepSeek-V4-Flash', 'kimi-k2.6'] } },
  );
  const models = await adapter.listModels('dsh-deepseek');
  assert.deepEqual(models.map((model) => model.id), ['DeepSeek-V4-Flash']);

  for await (const chunk of adapter.stream({ provider: 'dsh-deepseek', model: 'DeepSeek-V4-Flash' })) {
    void chunk;
  }
  assert.deepEqual(called, ['trae/DeepSeek-V4-Flash']);
});

test('auto 车道在渠道没有 DeepSeek 模型时被跳过', async () => {
  const { adapter, called } = makeAdapter(
    [{ provider: 'trae', model: AUTO_MODEL }, { provider: 'codearts', model: AUTO_MODEL }],
    { catalog: { trae: ['Doubao-Seed-Code'], codearts: ['deepseek-v4.1-flash'] } },
  );
  const models = await adapter.listModels('dsh-deepseek');
  assert.deepEqual(models.map((model) => model.id), ['deepseek-v4.1-flash']);
  for await (const chunk of adapter.stream({ provider: 'dsh-deepseek', model: 'deepseek-v4.1-flash' })) {
    void chunk;
  }
  assert.deepEqual(called, ['codearts/deepseek-v4.1-flash']);
});

test('固定 id 的车道不需要查询宿主目录', async () => {
  const calls = [];
  const adapter = new DeepSeekFallbackAdapter({
    lanes: [{ provider: 'codearts', model: 'deepseek-v4.1-flash' }],
    logger: quiet,
    resolveCall: () => (async function* () { yield { type: 'text-delta', index: 0, text: 'x' }; })(),
  });
  adapter.setLlmRuntime({
    listModels: async (provider) => { calls.push(provider); return []; },
  });
  await adapter.listModels('dsh-deepseek');
  assert.deepEqual(calls, [], '固定 id 不该触发目录查询');
});
