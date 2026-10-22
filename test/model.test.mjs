/**
 * 核心逻辑测试：DeepSeek 过滤与跨车道降级。
 *
 *     node --test test/
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isDeepSeekModel,
  filterDeepSeekModels,
  assertDeepSeekModel,
} from '../src/product/deepseek-filter.js';
import {
  AUTO_MODEL,
  commitsAnswer,
  isAutoLane,
  orderLanes,
  runWithFallback,
  DEFAULT_LANES,
} from '../src/product/lane-fallback.js';

/* ------------------------------------------------------------ DeepSeek 过滤 */

test('isDeepSeekModel 认得各家渠道的 DeepSeek id 形态', () => {
  const positives = [
    'deepseek-v4.1-flash',
    'deepseek-v4-flash-0731',
    'deepseek-r1-0528',
    'deepseek-chat',
    'deepseek_v4',
    'cline-free/deepseek-v4.1-flash',
    'deepseek/deepseek-v4.1-flash',
    'codearts/deepseek-v4.1-flash',
    'DeepSeek-V4.1-Flash',
    'deepseek',
  ];
  for (const id of positives) {
    assert.equal(isDeepSeekModel(id), true, `应当识别为 DeepSeek：${id}`);
  }
});

test('isDeepSeekModel 拒绝别的厂商', () => {
  const negatives = [
    'glm-5.3-flash',
    'minimax-m3.1-flash',
    'kimi-k3',
    'nemotron-3.5-super-vl-free',
    'beam-free',
    'openrouter/free',
    '',
    null,
    undefined,
    123,
  ];
  for (const id of negatives) {
    assert.equal(isDeepSeekModel(id), false, `不应识别为 DeepSeek：${String(id)}`);
  }
});

test('filterDeepSeekModels 保持原顺序', () => {
  const models = [
    { id: 'glm-5.3-flash' },
    { id: 'deepseek-v4.1-flash' },
    { id: 'kimi-k3' },
    { id: 'deepseek-v4-flash' },
  ];
  assert.deepEqual(
    filterDeepSeekModels(models).map((model) => model.id),
    ['deepseek-v4.1-flash', 'deepseek-v4-flash'],
  );
});

test('assertDeepSeekModel 在限制开启时拦截非 DeepSeek', () => {
  assert.throws(
    () => assertDeepSeekModel('glm-5.3-flash'),
    /不是 DeepSeek 模型/,
  );
  assert.doesNotThrow(() => assertDeepSeekModel('deepseek-v4.1-flash'));
});

test('assertDeepSeekModel 在 restricted:false 时放行', () => {
  assert.doesNotThrow(() => assertDeepSeekModel('glm-5.3-flash', { restricted: false }));
});

/* ---------------------------------------------------------------- 提交判定 */

test('commitsAnswer 只认正文，不认思考增量', () => {
  // DSH 的 StreamChunk 是按 type 区分的判别联合。
  assert.equal(commitsAnswer({ type: 'reasoning-delta', text: '我在想…' }), false);
  assert.equal(commitsAnswer({ type: 'text-delta', text: '' }), false);
  assert.equal(commitsAnswer({ type: 'text-delta', text: '答案' }), true);
  assert.equal(commitsAnswer({ type: 'tool-call-delta', name: 'read' }), true);
  assert.equal(commitsAnswer({ type: 'block-start', index: 0 }), false);
  assert.equal(commitsAnswer({ type: 'block-end', index: 0 }), false);
  assert.equal(commitsAnswer({ type: 'usage', usage: {} }), false);
  assert.equal(commitsAnswer({ type: 'finish', reason: {} }), false);
  assert.equal(commitsAnswer(null), false);
  assert.equal(commitsAnswer({}), false);
});

test('commitsAnswer 不把 reasoning 字段当成正文', () => {
  // 没有 type 的宽松形状：reasoning 字段不能算正文。
  assert.equal(commitsAnswer({ reasoning: '我在想…' }), false);
  assert.equal(commitsAnswer({ content: '答案' }), true);
  assert.equal(commitsAnswer({ delta: '答案' }), true);
  assert.equal(commitsAnswer({ toolCalls: [{ name: 'read' }] }), true);
});

/* ------------------------------------------------------------------ 排序 */

test('orderLanes 按 priority 排序，同优先级保持原顺序', () => {
  const ordered = orderLanes([
    { provider: 'a', model: 'm', priority: 2 },
    { provider: 'b', model: 'm', priority: 1 },
    { provider: 'c', model: 'm' },
    { provider: 'd', model: 'm' },
  ]);
  assert.deepEqual(ordered.map((lane) => lane.provider), ['b', 'a', 'c', 'd']);
});

test('orderLanes 保留 auto 车道，丢弃真正的残缺条目', () => {
  // `model` 缺省 = auto（调用时从渠道目录挑），所以 `{ provider: 'b' }` 是合法的。
  const ordered = orderLanes([
    { provider: 'a', model: 'm' },
    { provider: 'b' },
    null,
    { model: 'm' },
  ]);
  assert.deepEqual(ordered.map((lane) => lane.provider), ['a', 'b']);
});

/* ------------------------------------------------------------------ 降级 */

async function* chunks(items) {
  for (const item of items) yield item;
}

test('runWithFallback 首个车道成功时不再尝试后续车道', async () => {
  const attempted = [];
  const output = [];
  for await (const chunk of runWithFallback({
    lanes: [{ provider: 'a', model: 'm' }, { provider: 'b', model: 'm' }],
    attempt: async function* attempt(lane) {
      attempted.push(lane.provider);
      yield { type: 'text-delta', text: '你好' };
    },
  })) {
    output.push(chunk);
  }
  assert.deepEqual(attempted, ['a']);
  assert.deepEqual(output, [{ type: 'text-delta', text: '你好' }]);
});

test('runWithFallback 在产出正文前失败时切换到下一个车道', async () => {
  const attempted = [];
  const output = [];
  for await (const chunk of runWithFallback({
    lanes: [{ provider: 'a', model: 'm' }, { provider: 'b', model: 'm' }],
    attempt: async function* attempt(lane) {
      attempted.push(lane.provider);
      if (lane.provider === 'a') {
        yield { type: 'reasoning-delta', text: '我在想…' };
        throw new Error('额度用尽');
      }
      yield { type: 'text-delta', text: '来自 b' };
    },
  })) {
    output.push(chunk);
  }
  assert.deepEqual(attempted, ['a', 'b']);
  // 车道 a 的思考增量被丢弃 —— 调用方只看到车道 b 的正文。
  assert.deepEqual(output, [{ type: 'text-delta', text: '来自 b' }]);
});

test('runWithFallback 在正文产出后失败时不切换', async () => {
  const attempted = [];
  await assert.rejects(async () => {
    for await (const chunk of runWithFallback({
      lanes: [{ provider: 'a', model: 'm' }, { provider: 'b', model: 'm' }],
      attempt: async function* attempt(lane) {
        attempted.push(lane.provider);
        yield { type: 'text-delta', text: '开头' };
        throw new Error('中途断了');
      },
    })) {
      void chunk;
    }
  }, /中途断了/);
  assert.deepEqual(attempted, ['a']);
});

test('runWithFallback 全部车道失败时报出每条原因', async () => {
  await assert.rejects(async () => {
    for await (const chunk of runWithFallback({
      lanes: [{ provider: 'a', model: 'm' }, { provider: 'b', model: 'm' }],
      attempt: async function* attempt(lane) {
        throw new Error(`${lane.provider} 挂了`);
      },
    })) {
      void chunk;
    }
  }, /所有 DeepSeek 车道都不可用.*a\/m: a 挂了.*b\/m: b 挂了/s);
});

test('runWithFallback 没有车道时报出可操作的中文提示', async () => {
  await assert.rejects(async () => {
    for await (const chunk of runWithFallback({
      lanes: [],
      attempt: async function* attempt() { yield { type: 'text-delta', text: 'x' }; },
    })) {
      void chunk;
    }
  }, /登录至少一个账号渠道/);
});

test('runWithFallback 回调收到成功与失败事件', async () => {
  const failures = [];
  const successes = [];
  for await (const chunk of runWithFallback({
    lanes: [{ provider: 'a', model: 'm' }, { provider: 'b', model: 'm' }],
    attempt: async function* attempt(lane) {
      if (lane.provider === 'a') throw new Error('无额度');
      yield { type: 'text-delta', text: 'ok' };
    },
    onFail: (info) => failures.push(info),
    onSuccess: (lane) => successes.push(lane.provider),
  })) {
    void chunk;
  }
  assert.equal(failures.length, 1);
  assert.equal(failures[0].lane.provider, 'a');
  assert.match(failures[0].reason, /无额度/);
  assert.deepEqual(successes, ['b']);
});

/* ------------------------------------------------------------- 默认车道表 */

test('DEFAULT_LANES 全部是 auto 车道（模型 id 由渠道目录决定）', () => {
  assert.ok(DEFAULT_LANES.length > 0);
  for (const lane of DEFAULT_LANES) {
    assert.equal(isAutoLane(lane), true, `默认车道应当自动选模型：${lane.provider}`);
    assert.equal(lane.model, AUTO_MODEL);
  }
});

test('DEFAULT_LANES 的 provider 互不重复', () => {
  const providers = DEFAULT_LANES.map((lane) => lane.provider);
  assert.equal(new Set(providers).size, providers.length);
});

test('runWithFallback 能处理返回 Promise 的 attempt（回归：漏 await）', async () => {
  // 真实调用里 `attempt` 是 async 函数，返回的是**流的 Promise**。曾经的实现
  // 直接把它当流用，于是每一次调用都以 "iterator.next is not a function" 失败
  // —— 降级链形同虚设。
  const attempted = [];
  const output = [];
  for await (const chunk of runWithFallback({
    lanes: [{ provider: 'a', model: 'm' }, { provider: 'b', model: 'm' }],
    attempt: async (lane) => {
      attempted.push(lane.provider);
      if (lane.provider === 'a') {
        return (async function* failing() {
          yield { type: 'reasoning-delta', index: 0, text: 'DEAD_MARKER' };
          throw new Error('额度用尽');
        })();
      }
      return (async function* working() {
        yield { type: 'text-delta', index: 0, text: '好的' };
        yield { type: 'finish', reason: { kind: 'stop' } };
      })();
    },
  })) {
    output.push(chunk);
  }
  assert.deepEqual(attempted, ['a', 'b']);
  assert.ok(
    output.some((chunk) => chunk.type === 'text-delta' && chunk.text === '好的'),
    '应当拿到第二条车道的正文',
  );
  assert.ok(
    !output.some((chunk) => chunk.text === 'DEAD_MARKER'),
    '失败车道的思考增量不该泄漏',
  );
});

test('runWithFallback 把返回 null 的车道当作失败并继续', async () => {
  const attempted = [];
  const output = [];
  for await (const chunk of runWithFallback({
    lanes: [{ provider: 'a', model: 'm' }, { provider: 'b', model: 'm' }],
    attempt: async (lane) => {
      attempted.push(lane.provider);
      if (lane.provider === 'a') return null;
      return (async function* working() {
        yield { type: 'text-delta', index: 0, text: '兜住了' };
      })();
    },
  })) {
    output.push(chunk);
  }
  assert.deepEqual(attempted, ['a', 'b']);
  assert.ok(output.some((chunk) => chunk.text === '兜住了'));
});
