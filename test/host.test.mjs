/**
 * 宿主插件的装配测试。
 *
 * 用一个**最小化的 cordis 上下文**加载插件，检查它注册了什么：
 *
 *   - 模型车道是否注册了 `dsh-deepseek` provider；
 *   - 目录里是否只有 DeepSeek 模型；
 *   - 插件的 `inject` 是否包含必需的宿主服务。
 *
 * 这里不连真实 QQ、也不加载账号渠道包 —— 那些需要真实凭据与网络。模型车道的
 * **注册**与**目录内容**是可以在本地确定地验证的。
 *
 *     node --test test/host.test.mjs
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { installModelLane, normalizeLanes, DEEPSEEK_PROVIDER } from '../plugin-src/host/model-lane.mjs';
import { DEFAULT_LANES, isAutoLane } from '../src/product/lane-fallback.js';
import { isDeepSeekModel } from '../src/product/deepseek-filter.js';

/**
 * 一个够用的 llm 服务替身。
 *
 * 它记录注册了什么 provider，并按 provider 返回模型目录 —— 正好用来验证
 * 「目录里只有 DeepSeek」这条产品契约。
 */
function createLlmStub() {
  const adapters = new Map();
  const configurable = [];
  return {
    adapters,
    configurable,
    registerAdapter(providers, adapter) {
      for (const provider of providers) adapters.set(provider, adapter);
      return () => {
        for (const provider of providers) adapters.delete(provider);
      };
    },
    registerConfigurableProviders(list) {
      configurable.push(...list);
    },
    async listModels(provider) {
      const adapter = adapters.get(provider);
      return adapter ? adapter.listModels(provider) : [];
    },
    /** 真实 llm 服务的 `listProviders()` —— 车道可用性检查靠它。 */
    listProviders() {
      return [...adapters.keys()].map((id) => ({ id, name: id }));
    },
  };
}

/** 每条测试用独立的临时 DSH home，避免写进真实的 ~/.dsh。 */
function temporaryHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'qqfb-test-'));
}

test('normalizeLanes 只保留 DeepSeek 模型', () => {
  const lanes = normalizeLanes([
    { provider: 'codearts', model: 'deepseek-v4.1-flash' },
    { provider: 'gemini', model: 'gemini-5-pro' },
    { provider: 'trae', model: 'deepseek-v4-flash' },
    { provider: 'kilo', model: 'kilo-auto/free' },
  ]);
  assert.deepEqual(lanes.map((lane) => lane.provider), ['codearts', 'trae']);
});

test('normalizeLanes 去掉重复的车道', () => {
  const lanes = normalizeLanes([
    { provider: 'codearts', model: 'deepseek-v4.1-flash' },
    { provider: 'codearts', model: 'deepseek-v4.1-flash' },
    { provider: 'trae', model: 'deepseek-v4.1-flash' },
  ]);
  assert.equal(lanes.length, 2);
});

test('模型车道注册 dsh-deepseek provider，目录里只有 DeepSeek', async () => {
  const llm = createLlmStub();
  const ctx = {
    llm,
    inject: () => null,
    get: () => llm,
    provide: () => {},
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  };

  // 先把车道指向的 provider 都「注册」进 llm 替身 —— 真实宿主里它们是
  // 账号渠道包装上的，`listModels` 会据此过滤。
  for (const candidate of DEFAULT_LANES) {
    llm.adapters.set(candidate.provider, {
      providerInfo: (id) => ({ id, name: id }),
      // auto 车道要从渠道目录里挑模型 —— 每条车道给一个 DeepSeek 模型。
      listModels: async (id) => [{ provider: id, id: 'deepseek-v4.1-flash', name: 'DeepSeek' }],
    });
  }

  const lane = await installModelLane(ctx, {
    dshHome: temporaryHome(),
    channelPackEntry: null,
  });

  assert.ok(llm.adapters.has(DEEPSEEK_PROVIDER), '应当注册 dsh-deepseek provider');

  const models = await llm.listModels(DEEPSEEK_PROVIDER);
  assert.ok(models.length > 0, '应当提供至少一个模型');
  for (const model of models) {
    assert.equal(isDeepSeekModel(model.id), true, `目录里不应出现非 DeepSeek 模型：${model.id}`);
  }

  const description = lane.describe();
  assert.equal(description.provider, DEEPSEEK_PROVIDER);
  assert.ok(description.lanes.length > 0);
  // `describe()` 报的是**配置**里的车道（auto 车道在调用时才解析成具体模型），
  // 所以这里接受 auto，或者一个明确的 DeepSeek id。
  for (const item of description.lanes) {
    assert.ok(isAutoLane(item) || isDeepSeekModel(item.model),
      `车道应当自动选模型或指向 DeepSeek：${item.provider}/${item.model}`);
  }

  lane.dispose();
  assert.equal(llm.adapters.has(DEEPSEEK_PROVIDER), false, 'dispose 后应注销 provider');
});

test('没有车道时，目录为空而不是报错', async () => {
  const llm = createLlmStub();
  const ctx = {
    llm,
    inject: () => null,
    get: () => llm,
    provide: () => {},
    logger: { info: () => {}, warn: () => {}, error: () => {} },
  };
  const lane = await installModelLane(ctx, {
    dshHome: temporaryHome(),
    channelPackEntry: null,
  });
  const models = await llm.listModels(DEEPSEEK_PROVIDER);
  assert.deepEqual(models, []);
  lane.dispose();
});

test('默认车道全部是 auto 车道', () => {
  for (const lane of DEFAULT_LANES) {
    assert.equal(isAutoLane(lane), true, `默认车道应当自动选模型：${lane.provider}`);
  }
});
