/**
 * 模型车道的宿主侧装配。
 *
 * 职责：
 *
 *   1. **挂载账号渠道包** —— 十一个官方账号渠道各自登录换取每日免费额度，
 *      它们是本产品 DeepSeek 模型的主要来源。
 *   2. **注册降级 provider** —— `dsh-deepseek` 内部按车道清单依次尝试。
 *   3. **接上兜底车道** —— 可选，默认关闭。
 *   4. **把状态暴露给设置页** —— 车道顺序、启用状态、渠道可用性。
 *
 * ## 为什么降级要自己注册一个 provider
 *
 * 账号渠道各自已经注册了独立的 llm provider（`codearts`、`trae`……）。它们是
 * **并列**的注册，谁也不能替谁兜底：CodeArts 的积分领完了，DSH 不会自动去问
 * TRAE 要模型。
 *
 * 而免充值的现实是：任何单个渠道都保证不了 24×7 可用（积分按天重置、登录态
 * 会过期、上游模型会下线）。所以「只要还有一个渠道活着就还能回答」是这个产品
 * 的核心承诺，必须由产品自己实现。
 *
 * @module plugin-src/host/model-lane.mjs
 */

import path from 'node:path';

import { DEFAULT_LANES, orderLanes } from '../../src/product/lane-fallback.js';
import { isDeepSeekModel } from '../../src/product/deepseek-filter.js';
import { DeepSeekFallbackAdapter } from '../../src/product/deepseek-adapter.js';
import {
  KiloFallbackAdapter,
  KILO_PROVIDER,
  KILO_LABEL,
  KILO_MODEL,
} from '../../src/product/kilo-adapter.js';
import { LaneConfigStore, resolveDshHome } from '../../src/product/lane-config.js';
import { installModelLaneRpc } from './model-lane-rpc.mjs';

export const DEEPSEEK_PROVIDER = 'dsh-deepseek';
export const DEEPSEEK_LABEL = 'DeepSeek（免充值 · 自动降级）';

/**
 * 账号渠道包会注册的服务名。
 *
 * 每个渠道一个 `${product.id}Auth`（见 channel-pack 的 `*-auth.ts`：
 * `super(ctx, options.serviceName ?? \`${product.id}Auth\`)`）。
 */
const CHANNEL_SERVICE_NAMES = Object.freeze([
  'codeartsAuth',
  'clineAuth',
  'geminiAuth',
  'lobsteraiAuth',
  'loomyAuth',
  'minimaxAuth',
  'qoderAuth',
  'raccoonAuth',
  'traeAuth',
  'zcodeAuth',
]);

/**
 * 检测宿主里已经挂载了哪些账号渠道服务。
 *
 * 用 `ctx.get(name)` 而不是 `ctx.name`：cordis 的属性访问在服务**未被本 fiber
 * 注入**时会抛 "cannot get property X without inject"，而 `get()` 只返回
 * `undefined`。
 *
 * @param {object} ctx
 * @returns {string[]} 已存在的服务名
 */
export function detectExistingChannelServices(ctx) {
  const found = [];
  for (const name of CHANNEL_SERVICE_NAMES) {
    try {
      if (ctx.get?.(name) !== undefined) found.push(name);
    } catch {
      // 服务存在但当前 fiber 读不到（未注入）—— 视为不可见。
    }
  }
  return found;
}

/**
 * 把一个注册句柄收进清理列表。
 *
 * DSH 的 `llm.registerAdapter()` 返回的 `AdapterRegistrationHandle` **本身就是一个
 * 可调用对象**（`(): void` —— 调用即释放路由），不是 `{ dispose() }` 那种形状。
 * 所以这里两种都认。
 *
 * @param {Function[]} disposers 清理列表
 * @param {unknown} handle 注册句柄
 */
function pushDisposer(disposers, handle) {
  if (typeof handle === 'function') {
    disposers.push(() => handle());
    return;
  }
  if (handle && typeof handle.dispose === 'function') {
    disposers.push(() => handle.dispose());
  }
}

/**
 * 挂载模型车道。
 *
 * @param {object} ctx DSH 插件上下文
 * @param {object} config 插件配置
 * @returns {{describe: () => object, dispose: () => void, store: object, status: () => object, update: (next: object) => object}}
 */
export async function installModelLane(ctx, config = {}) {
  const logger = config.logger ?? console;
  const disposers = [];

  // ── 0. 配置 ─────────────────────────────────────────────────────────────
  const home = resolveDshHome(config);
  const store = new LaneConfigStore({ dshHome: home, logger });
  const current = store.load();

  // ── 1. 账号渠道包 ────────────────────────────────────────────────────────
  //
  // 账号渠道包需要 `credentials` / `commands` / `llm` 三样宿主服务，所以放在
  // 一个嵌套 fiber 里挂载：宿主缺哪样，缺的只是那一项功能，而不是整个插件。
  let channelPackState = 'pending';
  if (typeof ctx.inject === 'function') {
    const scope = ctx.inject(['credentials', 'commands', 'llm'], (scoped) => {
      const entry = config.channelPackEntry;
      if (!entry) {
        channelPackState = 'absent';
        return;
      }
      let stopped = false;
      scoped.effect(() => () => { stopped = true; }, 'dsh-qq-free-bot: channel pack');

      // ── 与另一个装了账号渠道包的插件共存 ──────────────────────────────
      //
      // 账号渠道包会为每个渠道注册一个 `${product.id}Auth` 服务
      // （`codeartsAuth`、`clineAuth`……）。两个插件各带一份 pack.js 时，第二份
      // 注册同名服务会被 cordis 拒绝：
      //
      //   service "codeartsAuth" has been registered at <our-free-model>
      //
      // 渠道的 **llm provider 注册不受影响**（provider 名在 llm 服务里唯一，
      // 且 pack 自带的 `registerAdapterIdempotent` 会吞掉重复注册）—— 真正冲突
      // 的只有这些 auth 服务。
      //
      // 所以：**先检测渠道服务是否已存在**，已存在就跳过加载自己这份，直接复用
      // 对方已经挂好的渠道。两个插件可以共存，谁先挂上算谁的。
      const existing = detectExistingChannelServices(scoped);
      if (existing.length > 0) {
        channelPackState = 'reused';
        logger.info?.(
          `[dsh-qq-free-bot] 检测到已挂载的账号渠道服务（${existing.join(', ')}），`
          + '复用它们，不再加载本插件自带的渠道包',
        );
        return;
      }

      // 账号渠道包是预构建的 ESM bundle（vendor/channel-pack/pack.js）。
      //
      // 它必须**运行期加载**而不能在打包时静态并入：它 import 的是宿主提供的
      // `@deepseek-ai/dsh-llm` 等模块，需要与正在运行的宿主**共享同一份实例**
      // —— 静态并入会得到第二份实例，身份检查随之失败。
      //
      // 用绝对路径转 file URL，是因为本插件的宿主半身会被 esbuild 打包成
      // `lib/index.js`，相对路径在打包后会指向错误的位置。
      import(pathToFileUrl(entry)).then(
        (module) => {
          if (stopped) return;
          mountChannelPack(module, scoped, config, logger, disposers);
          channelPackState = 'mounted';
        },
        (error) => {
          if (stopped) return;
          channelPackState = 'failed';
          logger.warn?.(
            `[dsh-qq-free-bot] 账号渠道包加载失败，免费 DeepSeek 车道不可用：${error?.message ?? error}`,
          );
        },
      );
    });
    if (scope && typeof scope.dispose === 'function') disposers.push(() => scope.dispose());
  }

  // ⚠️ `llm` 必须用 `ctx.get('llm')` 取，不能写 `ctx.llm`。
  //
  // 原因：cordis 的属性访问只在服务**被本 fiber 注入**时才可用，否则抛
  // "cannot get property llm without inject"。而本插件的 `apply()` 收到的 ctx
  // 是 `ctx.inject([...])` 那个作用域的 ctx —— 它没有注入 `llm`。
  //
  // `ctx.get(name)` 是**机会性**读取：服务不存在时返回 `undefined` 而不抛错。
  const llmRuntime = ctx.get?.('llm') ?? null;

  // ── 2. 降级 provider ────────────────────────────────────────────────────
  //
  // 这个 provider 本身**不代理**任何上游：它是一个「按车道清单依次尝试」的
  // 路由器，最终仍然调用 DSH 里已注册的账号渠道 provider。
  const lanes = current.lanes;
  const adapter = new DeepSeekFallbackAdapter({
    lanes,
    selfProvider: DEEPSEEK_PROVIDER,
    logger,
    // 车道是否真的能拨通：只看 provider 有没有注册。渠道登录态由 provider
    // 自己在调用时判定（它会回 INVALID_CREDENTIAL 之类的错误码，降级链会
    // 据此切下一条）。
    isAvailable: (lane) => hasProvider(llmRuntime, lane.provider),
    resolveCall: async (lane, options, signal) => {
      // 通过 DSH 的 llm 服务调用目标 provider —— 这样车道切换走的是宿主
      // 自己的重试、超时与用量计量逻辑，而不是自己再实现一遍。
      const runtime = adapter.runtime;
      if (!runtime || typeof runtime.stream !== 'function') {
        throw new Error('宿主没有提供 llm 服务');
      }
      return runtime.stream({
        ...options,
        provider: lane.provider,
        model: lane.model,
        signal,
      });
    },
  });

  if (!llmRuntime || typeof llmRuntime.registerAdapter !== 'function') {
    logger.warn?.(
      '[dsh-qq-free-bot] 宿主没有提供 llm 服务，免充值 DeepSeek 车道不可用；QQ 渠道不受影响',
    );
  } else {
    const registration = llmRuntime.registerAdapter([DEEPSEEK_PROVIDER], adapter);
    pushDisposer(disposers, registration);
    llmRuntime.registerConfigurableProviders?.([
      {
        provider: DEEPSEEK_PROVIDER,
        displayName: DEEPSEEK_LABEL,
        settingsNs: ctx.fiber?.entry?.options?.id ?? 'dsh-qq-free-bot',
        settingsPath: [],
      },
    ]);
    adapter.setLlmRuntime(llmRuntime);
  }

  // ── 3. 兜底车道（默认关闭） ─────────────────────────────────────────────
  //
  // Kilo 的官方免费池里**没有 DeepSeek**，所以它不出现在模型选择器里（
  // `listModels` 返回空），只作为降级链的最后一环被内部调用。
  const kilo = new KiloFallbackAdapter({ logger });
  let fallbackEnabled = current.freeFallback === true;
  // 兜底 provider 只能注册一次（重复注册会被 llm 服务拒绝）—— 用标记记住。
  let kiloRegistered = false;
  const applyFallback = () => {
    adapter.setLanes(buildLanes(store.load().lanes, fallbackEnabled));
  };
  applyFallback();
  if (fallbackEnabled && llmRuntime && typeof llmRuntime.registerAdapter === 'function') {
    pushDisposer(disposers, llmRuntime.registerAdapter([KILO_PROVIDER], kilo));
    kiloRegistered = true;
    // 清单拉取失败不该挡住启动。
    kilo.refresh().catch((error) => {
      logger.warn?.(`[dsh-qq-free-bot] 免费兜底车道清单拉取失败：${error?.message ?? error}`);
    });
  }

  /**
   * 当前状态快照 —— 设置页用。
   */
  const status = () => {
    const configuration = store.load();
    const channels = detectExistingChannelServices(ctx);
    const providers = listProviderIds(llmRuntime);
    return {
      version: 1,
      channelPack: channelPackState,
      channels,
      fallback: { enabled: fallbackEnabled, provider: KILO_PROVIDER, model: KILO_MODEL, label: KILO_LABEL },
      lanes: configuration.lanes.map((lane, index) => ({
        index,
        provider: lane.provider,
        model: lane.model,
        label: lane.label ?? `${lane.provider} · ${lane.model}`,
        enabled: lane.enabled !== false,
        // 渠道服务是否挂上了（登录与否由 provider 自己判定，这里只报结构可用性）。
        providerRegistered: providers.includes(lane.provider),
        channelServicePresent: channelServiceFor(lane.provider) === null
          || channels.includes(channelServiceFor(lane.provider)),
      })),
      effective: describeLanes(adapter.lanes),
      defaults: DEFAULT_LANES.map((lane) => ({ ...lane })),
    };
  };

  /**
   * 应用一份新配置（设置页调用）。
   *
   * @param {object} next
   * @returns {object} 新状态
   */
  const update = (next) => {
    const saved = store.save(next);
    fallbackEnabled = saved.freeFallback === true;
    adapter.setLanes(buildLanes(saved.lanes, fallbackEnabled));
    if (fallbackEnabled && llmRuntime && typeof llmRuntime.registerAdapter === 'function') {
      // 兜底 provider 只注册一次；重复注册会被 llm 服务拒绝，所以用一个标记
      // 记住它是否已经挂上。
      if (!kiloRegistered) {
        pushDisposer(disposers, llmRuntime.registerAdapter([KILO_PROVIDER], kilo));
        kiloRegistered = true;
        kilo.refresh().catch((error) => {
          logger.warn?.(`[dsh-qq-free-bot] 免费兜底车道清单拉取失败：${error?.message ?? error}`);
        });
      }
    }
    return status();
  };

  /**
   * 恢复到默认配置。
   *
   * @returns {object} 新状态
   */
  const reset = () => {
    const saved = store.reset();
    fallbackEnabled = saved.freeFallback === true;
    adapter.setLanes(buildLanes(saved.lanes, fallbackEnabled));
    return status();
  };

  // ── 4. 设置页的 RPC ─────────────────────────────────────────────────────
  const rpc = installModelLaneRpc(ctx, { status, update, reset });
  if (typeof rpc === 'function') disposers.push(rpc);

  logger.info?.(
    `[dsh-qq-free-bot] DeepSeek 车道已注册：${describeLanes(adapter.lanes).join(' → ')}`,
  );

  return {
    describe: () => ({
      provider: DEEPSEEK_PROVIDER,
      label: DEEPSEEK_LABEL,
      fallbackProvider: fallbackEnabled ? KILO_PROVIDER : null,
      // 结构化返回，不是字符串数组 —— 调用方（`ctx.provide('dshQqFreeBot')` 与
      // 单测）需要能按字段取值，拼好的字符串只适合打印。
      lanes: adapter.lanes.map((lane) => ({
        provider: lane.provider,
        model: lane.model,
        ...(typeof lane.label === 'string' ? { label: lane.label } : {}),
      })),
    }),
    status,
    update,
    reset,
    store,
    dispose: () => {
      for (const dispose of disposers.reverse()) {
        try {
          dispose();
        } catch (error) {
          logger.warn?.(`[dsh-qq-free-bot] 清理模型车道时出错：${error?.message ?? error}`);
        }
      }
    },
  };
}

/**
 * 车道清单 + 可选的兜底车道。
 *
 * 兜底车道只在开启时追加到末尾 —— 它必须排在**所有** DeepSeek 车道之后，
 * 否则「DeepSeek 还活着却用了非 DeepSeek 模型」会发生。
 *
 * @param {Array<object>} lanes
 * @param {boolean} fallbackEnabled
 * @returns {Array<object>}
 */
function buildLanes(lanes, fallbackEnabled) {
  const active = orderLanes(lanes).filter((lane) => lane.enabled !== false);
  if (!fallbackEnabled) return active;
  return [
    ...active,
    { provider: KILO_PROVIDER, model: KILO_MODEL, label: '免费兜底（Kilo 公共免费池）', priority: 9999 },
  ];
}

/**
 * 把车道清单渲染成可读的一行。
 *
 * @param {Array<object>} lanes
 * @returns {string[]}
 */
function describeLanes(lanes) {
  return lanes.map((lane) => `${lane.provider}/${lane.model}`);
}

/**
 * 渠道 provider → 它对应的 auth 服务名。
 *
 * @param {string} provider
 * @returns {string|null}
 */
function channelServiceFor(provider) {
  const map = {
    codearts: 'codeartsAuth',
    cline: 'clineAuth',
    gemini: 'geminiAuth',
    lobsterai: 'lobsteraiAuth',
    loomy: 'loomyAuth',
    minimax: 'minimaxAuth',
    qoder: 'qoderAuth',
    qodercn: 'qoderAuth',
    raccoon: 'raccoonAuth',
    trae: 'traeAuth',
    zcode: 'zcodeAuth',
  };
  return map[provider] ?? null;
}

/**
 * 宿主当前注册了哪些 llm provider。
 *
 * @param {object|null} llmRuntime
 * @returns {string[]}
 */
function listProviderIds(llmRuntime) {
  try {
    const list = llmRuntime?.listProviders?.();
    return Array.isArray(list) ? list.map((provider) => provider?.id).filter(Boolean) : [];
  } catch {
    return [];
  }
}

/**
 * 判断某个 provider 是否已注册。
 *
 * @param {object|null} llmRuntime
 * @param {string} provider
 * @returns {boolean}
 */
function hasProvider(llmRuntime, provider) {
  return listProviderIds(llmRuntime).includes(provider);
}

/**
 * 挂载账号渠道包。
 *
 * @param {object} pack 账号渠道包的模块
 * @param {object} scoped 嵌套 fiber 的上下文
 * @param {object} config
 * @param {object} logger
 * @param {Function[]} disposers
 */
function mountChannelPack(pack, scoped, config, logger, disposers) {
  const apply = pack?.default?.apply ?? pack?.apply;
  if (typeof apply !== 'function') {
    logger.warn?.('[dsh-qq-free-bot] 账号渠道包没有可用的 apply()，免费 DeepSeek 车道不可用');
    return;
  }
  try {
    const handle = apply(scoped, {
      disableOpencode: true,
      ...(config.channelPack ?? {}),
    });
    pushDisposer(disposers, handle);
    logger.info?.('[dsh-qq-free-bot] 账号渠道包已挂载（CodeArts 等 11 个免费渠道）');
  } catch (error) {
    logger.warn?.(
      `[dsh-qq-free-bot] 账号渠道包挂载失败，免费 DeepSeek 车道不可用：${error?.message ?? error}`,
    );
  }
}

/**
 * 规范化车道清单：只保留 DeepSeek 模型，去掉重复项。
 *
 * @param {Array<object>} lanes
 * @returns {Array<object>}
 */
export function normalizeLanes(lanes) {
  const seen = new Set();
  const result = [];
  for (const lane of orderLanes(lanes)) {
    if (!isDeepSeekModel(lane.model)) continue;
    const key = `${lane.provider}::${lane.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(lane);
  }
  return result;
}

/** `path` → file URL，用于动态 import 绝对路径。 */
function pathToFileUrl(target) {
  return new URL(`file://${path.resolve(target)}`).href;
}
