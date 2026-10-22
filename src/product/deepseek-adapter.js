/**
 * DeepSeek 降级适配器。
 *
 * 它实现 DSH 的 `LlmAdapter` 契约，但**不代理任何上游**：它是一个按车道清单
 * 依次尝试的路由器，最终仍然调用 DSH 里已注册的账号渠道 provider。
 *
 * ## 为什么要有这一层
 *
 * 账号渠道各自注册了独立的 llm provider（`codearts`、`trae`……），它们是**并列**
 * 的注册 —— CodeArts 的积分领完了，DSH 不会自动去问 TRAE 要模型。
 *
 * 而免充值的现实是：任何单个渠道都保证不了 24×7 可用（积分按天重置、登录态
 * 会过期、上游模型会下线、账号池被限流）。所以「只要还有一个渠道活着就还能
 * 回答」是这个产品的核心承诺 —— 必须由产品自己实现。
 *
 * ## 提交规则
 *
 * 车道切换的唯一判据是「有没有产出答案正文」：
 *
 *   - **正文之前失败** → 整段丢弃，换下一个车道。调用方看不到任何痕迹 ——
 *     包括那个车道已经吐出的思考增量。
 *   - **正文之后失败** → 那是这一轮对话的正常结局，不切换。
 *
 * 这条规则实现于 {@link module:src/product/lane-fallback}，本模块只负责把它
 * 接到 DSH 的适配器契约上。**不在本模块重写一遍循环**：两份实现会漂移，而
 * 单测只能覆盖其中一份。
 *
 * @module src/product/deepseek-adapter.js
 */

import { AUTO_MODEL, isAutoLane, runWithFallback } from './lane-fallback.js';
import { isDeepSeekModel } from './deepseek-filter.js';

/**
 * DeepSeek 模型的元数据。
 *
 * 取值来自 DeepSeek 官方文档的公开规格。不同渠道的 DeepSeek 模型在上下文
 * 窗口上可能有出入，但选一个**保守**的公共值比逐渠道精确更安全 —— 报小了会
 * 让宿主提前截断上下文，报大了最多是上游自己拒绝。
 */
export const DEEPSEEK_MODEL_META = Object.freeze({
  contextWindow: 131072,
  defaultMaxTokens: 8192,
});

/**
 * 剔掉会让自己递归的车道。
 *
 * 车道清单是用户可编辑的（设置页能改顺序、开关，配置文件也能手改）。如果
 * 里面出现本适配器自己的 provider（`dsh-deepseek`），`resolveCall` 会再次
 * 进入本适配器 —— 无限递归，最后爆栈。这里把自指项与结构不完整的项一起滤掉。
 *
 * @param {Array<object>} lanes
 * @param {string} [selfProvider] 本适配器的 provider 路由 id
 * @returns {Array<object>}
 */
function sanitizeLanes(lanes, selfProvider) {
  if (!Array.isArray(lanes)) return [];
  return lanes.filter((lane) => {
    if (!lane || typeof lane !== 'object') return false;
    if (typeof lane.provider !== 'string' || lane.provider === '') return false;
    if (!isAutoLane(lane) && typeof lane.model !== 'string') return false;
    if (selfProvider !== undefined && lane.provider === selfProvider) return false;
    if (lane.provider === 'dsh-deepseek') return false;
    return true;
  });
}

/** 默认的展示名。 */
function displayName(model) {
  const tail = String(model ?? '').split('/').pop() ?? String(model ?? '');
  if (tail === '') return 'DeepSeek';
  return tail
    .split('-')
    .map((part) => (/^\d/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

/**
 * 降级适配器。
 */
export class DeepSeekFallbackAdapter {
  /**
   * @param {object} options
   * @param {Array<{provider: string, model: string}>} options.lanes 车道清单
   * @param {(lane: object, options: object, signal?: AbortSignal) => AsyncIterable<object>} options.resolveCall
   *        实际发起一次调用的钩子（本产品用宿主自己的 llm 服务）
   * @param {(lane: object) => boolean} [options.isAvailable]
   *        判断某条车道的 provider 当前是否真的注册了。缺省视为全部可用。
   * @param {object} [options.logger]
   */
  constructor({ lanes, resolveCall, isAvailable, selfProvider, logger = console } = {}) {
    this.selfProvider = typeof selfProvider === 'string' ? selfProvider : 'dsh-deepseek';
    this.lanes = sanitizeLanes(lanes, this.selfProvider);
    this.resolveCall = resolveCall;
    this.isAvailable = isAvailable ?? (() => true);
    this.logger = logger;
    /**
     * 宿主的 llm 运行时。
     *
     * 它只能在**注入过 `llm` 的作用域**里取到，所以由宿主在那个作用域中通过
     * {@link setLlmRuntime} 交进来，而不是在构造函数里读 ctx。
     */
    this.runtime = null;
    /** provider → { at, model }：自动选中的模型，短缓存。 */
    this.autoCache = new Map();
  }

  /**
   * 交入宿主的 llm 运行时。
   *
   * @param {object} runtime DSH 的 llm 服务
   */
  setLlmRuntime(runtime) {
    this.runtime = runtime ?? null;
  }

  /**
   * 运行时替换车道清单（设置页改顺序/开关时用）。
   *
   * 正在进行的回合不受影响：{@link prepareCall} 在调用开始时就把车道快照
   * 固定下来了。
   *
   * @param {Array<object>} lanes
   */
  setLanes(lanes) {
    this.lanes = sanitizeLanes(lanes, this.selfProvider);
  }

  /** @param {string} provider */
  providerInfo(provider) {
    return { id: provider, name: 'DeepSeek（免充值 · 自动降级）' };
  }

  /**
   * 重试策略。
   *
   * 刻意**不**把限流（RATE_LIMIT）列进可重试错误：这一条车道限流时，正确做法
   * 是**换车道**，而不是在同一条车道上重试 —— 重复重试只会把额度墙撞三次。
   * 车道切换由本适配器负责，宿主的重试层不该插手。
   */
  providerRetryPolicy() {
    return Object.freeze({
      mode: 'normal',
      maxRetries: 0,
      retryableCodes: Object.freeze(['EMPTY_RESPONSE', 'SERVER', 'TIMEOUT', 'TRANSPORT']),
      initialDelayMs: 700,
      maxDelayMs: 8000,
      jitterRatio: 0.2,
    });
  }

  /** 本适配器不代理上游，所以没有自己的图片计价。 */
  imageRequestPricing() {
    return undefined;
  }

  /**
   * 列出本 provider 提供的模型。
   *
   * 只列**当前真的能拨通**的 DeepSeek 车道 —— 这就是「模型选择器里只有
   * DeepSeek」这个产品契约的落点。
   *
   * ⚠️ 必须按 `isAvailable` 过滤：车道清单是静态的，而渠道是否登录是动态的。
   * 不过滤的话，选择器里会出现一个必然失败的模型，用户选了只会拿到一条
   * 「所有车道都不可用」。
   */
  async listModels(provider) {
    const resolved = await this.resolveLanes(this.lanes);
    const seen = new Set();
    const models = [];
    for (const lane of resolved) {
      if (seen.has(lane.model)) continue;
      seen.add(lane.model);
      models.push({
        provider,
        id: lane.model,
        name: lane.label ?? displayName(lane.model),
        description: `免充值 DeepSeek 车道 · 来自 ${lane.provider}`,
        inputModalities: ['text'],
      });
    }
    return models;
  }

  /**
   * 把车道清单解析成「渠道 + 具体模型 id」。
   *
   * 固定 id 的车道原样保留；`auto` 的车道从该渠道**当前真实的目录**里挑第一个
   * DeepSeek 模型。渠道没登录 / 没有 DeepSeek 模型时，这条车道被丢掉。
   *
   * @param {Array<object>} lanes
   * @returns {Promise<Array<{provider: string, model: string, label?: string}>>}
   */
  async resolveLanes(lanes) {
    const ordered = sanitizeLanes(lanes, this.selfProvider);
    const resolved = [];
    for (const lane of ordered) {
      // 渠道没挂上就不进候选 —— 否则选择器里会出现一个必然失败的模型。
      if (!this.isAvailable(lane)) continue;
      if (!isAutoLane(lane)) {
        if (!isDeepSeekModel(lane.model)) continue;
        resolved.push({ provider: lane.provider, model: lane.model, ...(lane.label ? { label: lane.label } : {}) });
        continue;
      }
      const model = await this.pickAutoModel(lane.provider);
      if (model === null) continue;
      resolved.push({ provider: lane.provider, model, ...(lane.label ? { label: lane.label } : {}) });
    }
    return resolved;
  }

  /**
   * 从某个渠道的当前目录里挑一个 DeepSeek 模型。
   *
   * 缓存 30 秒：设置页一次 `listModels` 会连着问好几条车道，每次都打一遍宿主
   * 没有必要；而 30 秒足够短，登录新渠道后刷新一下就能看到。
   *
   * @param {string} provider
   * @returns {Promise<string|null>}
   */
  async pickAutoModel(provider) {
    const now = Date.now();
    const cached = this.autoCache.get(provider);
    if (cached !== undefined && now - cached.at < 30_000) return cached.model;
    let model = null;
    try {
      const list = await this.runtime?.listModels?.(provider);
      const candidates = (Array.isArray(list) ? list : [])
        .map((entry) => String(entry?.id ?? ''))
        .filter((id) => id !== '' && isDeepSeekModel(id));
      model = candidates[0] ?? null;
    } catch {
      model = null;
    }
    this.autoCache.set(provider, { at: now, model });
    return model;
  }

  /** 解析一个模型的完整元数据。 */
  async resolveModel(provider, model) {
    const resolved = await this.resolveLanes(this.lanes);
    const lane = resolved.find((candidate) => candidate.model === model);
    const meta = DEEPSEEK_MODEL_META;
    return {
      provider,
      id: model,
      name: lane?.label ?? displayName(model),
      inputModalities: ['text'],
      context: { contextWindow: meta.contextWindow },
      defaultMaxTokens: meta.defaultMaxTokens,
    };
  }

  /**
   * 准备一次调用。
   *
   * 把模型元数据与派发闭包绑到**同一份车道快照**上：设置页在调用途中改了
   * 车道顺序，也不该让这一轮的元数据与实际派发目标对不上。
   *
   * 注意 `signal` 是**模型解析**的取消信号，不是这一轮的取消信号 —— 它不该
   * 传给 `stream`，否则一次被取消的元数据查询会让整轮对话直接中止。
   */
  async prepareCall(provider, model) {
    // 快照必须是**解析后**的清单：`auto` 车道在这里就钉死成具体模型，一轮对话
    // 中途不会因为宿主目录刷新而换目标。
    const snapshot = await this.resolveLanes(this.lanes);
    return {
      model: await this.resolveModel(provider, model),
      stream: (options) => this.stream(options, snapshot),
    };
  }

  /**
   * 一次调用：在车道清单里依次尝试，直到某个车道产出正文。
   *
   * @param {object} options GenerateOptions
   * @param {Array<object>} [lanes] 车道快照
   * @returns {AsyncIterable<object>}
   */
  async * stream(options, lanes = this.lanes) {
    try {
      // `auto` 车道要在进入降级循环之前解析成具体模型 —— 循环本身是同步选择的，
      // 每次尝试都去查一遍宿主目录既慢又可能在半途换模型。
      const resolved = await this.resolveLanes(lanes);
      if (resolved.length === 0) {
        throw new Error('没有可用的 DeepSeek 车道。请先在设置页登录至少一个账号渠道。');
      }
      yield* runWithFallback({
        lanes: resolved,
        signal: options?.signal,
        attempt: (lane, signal) => this.resolveCall(lane, options, signal),
        onFail: ({ lane, reason }) => {
          this.logger.warn?.(
            `[dsh-qq-free-bot] DeepSeek 车道 ${lane.provider}/${lane.model} 失败，切换下一个：${reason}`,
          );
        },
        onSuccess: (lane) => {
          this.logger.info?.(
            `[dsh-qq-free-bot] DeepSeek 车道 ${lane.provider}/${lane.model} 作答`,
          );
        },
      });
    } catch (error) {
      // `runWithFallback` 把「没有车道」与「全部失败」都表达成异常 —— 对 DSH
      // 的契约而言它们是一轮的终态，要变成 finish chunk 而不是抛给宿主。
      yield {
        type: 'finish',
        reason: {
          kind: 'error',
          failure: {
            message: error?.message ?? String(error),
            code: error?.code ?? 'SERVER',
          },
        },
      };
    }
  }
}
