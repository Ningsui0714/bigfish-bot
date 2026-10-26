/**
 * 跨车道降级。
 *
 * ## 为什么需要它
 *
 * 免充值的 DeepSeek 来自十一个账号渠道，每个渠道各有各的失效方式：
 *
 *   - 每日积分领完了（CodeArts/Qoder/TRAE 的签到额度按天重置）；
 *   - 登录态过期（Loomy 14 天、ZCode 凭据不可续期）；
 *   - 上游模型下线或临时 5xx；
 *   - 账号池被限流。
 *
 * 任何**单个**渠道都不保证 24×7 可用。所以 QQ 机器人的真实需求不是「接一个
 * 模型」，而是「**只要还有至少一个渠道活着，就还能回答**」。
 *
 * 上游 `dsh-our-free-model` 的 combo（降级链）已经解决了**同一车道内**的模型
 * 切换，但它是「模型级」的：链上的候选必须来自同一个 provider 目录，且切换是
 * 由调用方（用户）在设置页手动配置的。本产品要解决的是**跨 provider** 的问题
 * —— 从 `codearts/deepseek-v4.1-flash` 换到 `cline/deepseek-v4.1-flash` 再换到
 * `trae/deepseek-v4.1-flash`，这些是**不同的 llm provider 注册**，不在同一个
 * adapter 的目录里，所以上游的 combo 覆盖不到。
 *
 * ## 机制
 *
 * 降级发生在**调用层**：本产品自己持有一个「DeepSeek 车道清单」，每个车道记
 * 录 provider 与 model；调用时按优先级逐个尝试，**第一个产出答案正文的**获胜。
 *
 * 「产出答案正文才算提交」这条规则继承自上游 combo 的设计，因为它是对的：
 *
 *   - 一个渠道在**吐出第一个字之前**失败（额度用尽、登录过期、连接超时）——
 *     这是最常见的失效形态，此时切换对调用方**完全不可见**；
 *   - 而「想了很久才撞上配额墙」（思考增量已经吐了一堆，正文还没开始）如果
 *     算提交，就会把半截思考留在界面上，切到下一个模型又是另一番说辞。
 *
 * 所以：**思考增量不算提交，正文增量才算**。
 *
 * @module src/product/lane-fallback.js
 */

/**
 * 一个候选车道。
 *
 * @typedef {object} Lane
 * @property {string} provider DSH 里的 provider 路由 id（如 `codearts`）
 * @property {string} model    模型 id（如 `deepseek-v4.1-flash`）
 * @property {number} [priority] 数字越小越优先；缺省按数组顺序
 * @property {string} [label]  展示名
 */

/**
 * 「自动选择模型」的标记。
 *
 * ## 为什么不能写死 model id
 *
 * 各家渠道的 DeepSeek 模型 id **并不统一**，实测（2026-10-22）：
 *
 *   - CodeArts：`deepseek-v4.1-flash`（benefit 集合）
 *   - TRAE：`DeepSeek-V4-Flash` / `DeepSeek-V4-Pro`（首字母大写、无 v4.1）
 *   - Cline：`cline-free/deepseek-v4.1-flash`
 *
 * 一开始我把 `deepseek-v4.1-flash` 写进每条车道，结果 TRAE 那条永远调不通 ——
 * 而且**不会报错**，只会被降级链跳过，表现得像「明明登录了却不用」。
 *
 * 所以车道只声明「用哪个渠道」，模型 id 在**调用时**从该渠道的真实目录里挑
 * 第一个 DeepSeek。渠道换 id、加新模型，都不用改配置。
 */
export const AUTO_MODEL = 'auto';

/**
 * 这条车道是不是「自动选择模型」。
 *
 * @param {{model?: string}} lane
 * @returns {boolean}
 */
export function isAutoLane(lane) {
  const model = lane?.model;
  return model === undefined || model === null || model === '' || model === AUTO_MODEL;
}

/**
 * 车道清单的默认顺序。
 *
 * 排序依据是**积分机制的稳健性**：
 *
 *   1. CodeArts —— 华为云官方，每日签到领积分，benefit 模型明确标注免费，
 *      且模型 id 在多个渠道里一致（`deepseek-v4.1-flash`）；
 *   2. TRAE —— 字节，OAuth 续期，签到额度按天重置；
 *   3. 有道 LobsterAI —— 签到三步、幂等，续期走 RefreshScheduler；
 *   4. 智谱 ZCode —— 官方 CLI 设备授权，凭据静态不可续期（失效需重登）；
 *   5. Cline —— 免费额度独立 id，但 402 后需要充值，排在后面；
 *   6. 其余 —— Loomy（14 天需重登）、Raccoon、MiniMax、Gemini（配额窗口）、
 *      Qoder（领取后 30 天有效）。
 *
 * ⚠️ 这只是**默认顺序**，用户可以在设置页改。真正的顺序应该由用户根据自己
 * 实际登录了哪些渠道决定 —— 没登录的渠道排在前面只是浪费一次尝试。
 */
export const DEFAULT_LANES = Object.freeze([
  { provider: 'codearts', model: AUTO_MODEL, label: 'CodeArts（华为云）' },
  { provider: 'trae', model: AUTO_MODEL, label: 'TRAE（字节）' },
  { provider: 'zcode', model: AUTO_MODEL, label: '智谱 ZCode' },
  { provider: 'cline', model: AUTO_MODEL, label: 'Cline' },
  { provider: 'loomy', model: AUTO_MODEL, label: '讯飞 Loomy' },
  { provider: 'raccoon', model: AUTO_MODEL, label: '商汤 Raccoon' },
  { provider: 'minimax', model: AUTO_MODEL, label: 'MiniMax Code' },
  { provider: 'gemini', model: AUTO_MODEL, label: 'Gemini Code Assist' },
  { provider: 'qoder', model: AUTO_MODEL, label: 'Qoder' },
  { provider: 'qodercn', model: AUTO_MODEL, label: 'Qoder 中国版' },
]);

/**
 * 判断一个 chunk 是否「提交了答案」。
 *
 * 提交 = 出现了**答案正文**。思考增量（reasoning）与元数据都不算。
 *
 * DSH 的 `StreamChunk` 是按 `type` 区分的判别联合（见 `@deepseek-ai/dsh-llm` 的
 * `StreamChunk`）：
 *
 *   - `text-delta`      —— 答案正文 ✅
 *   - `reasoning-delta` —— 思考增量 ❌
 *   - `tool-call-delta` —— 工具调用 ✅（模型已经开始动手，不该再切车道）
 *   - `block-start` / `block-end` / `usage` / `finish` —— 元数据 ❌
 *
 * ⚠️ 不能只看「有没有 text 字段」：`reasoning-delta` 也有 `text` 字段。看字段
 * 会把「想了很久才撞配额墙」误判成提交 —— 而那恰恰是最该切车道的场景。
 *
 * @param {object} chunk DSH 的 StreamChunk
 * @returns {boolean}
 */
export function commitsAnswer(chunk) {
  if (!chunk || typeof chunk !== 'object') return false;

  // 有 `type` 时按判别联合处理 —— 这是 DSH 的正式契约。
  switch (chunk.type) {
    case 'text-delta':
      return typeof chunk.text === 'string' && chunk.text.length > 0;
    case 'tool-call-delta':
      return true;
    case 'reasoning-delta':
    case 'block-start':
    case 'block-end':
    case 'usage':
    case 'finish':
      return false;
    default:
      break;
  }

  // 没有 `type` 的形状（第三方 adapter 的宽松输出）：退回字段判断，但显式排除
  // 思考字段。
  if (typeof chunk.reasoning === 'string' && chunk.reasoning.length > 0) return false;
  if (chunk.type === 'reasoning') return false;

  const text = chunk.text ?? chunk.content ?? chunk.delta;
  if (typeof text === 'string' && text.length > 0) return true;
  if (text && typeof text === 'object' && typeof text.text === 'string' && text.text.length > 0) {
    return true;
  }
  if (Array.isArray(chunk.toolCalls) && chunk.toolCalls.length > 0) return true;
  if (Array.isArray(chunk.tool_calls) && chunk.tool_calls.length > 0) return true;
  return false;
}

/**
 * 把车道清单按优先级排序。
 *
 * @param {Lane[]} lanes
 * @returns {Lane[]}
 */
export function orderLanes(lanes) {
  if (!Array.isArray(lanes)) return [];
  return lanes
    .filter((lane) => lane && typeof lane.provider === 'string' && lane.provider !== '' && lane.provider !== 'lobsterai'
      && (typeof lane.model === 'string' || isAutoLane(lane)))
    .map((lane, index) => ({ lane, index }))
    .sort((a, b) => {
      const pa = typeof a.lane.priority === 'number' ? a.lane.priority : a.index;
      const pb = typeof b.lane.priority === 'number' ? b.lane.priority : b.index;
      if (pa !== pb) return pa - pb;
      return a.index - b.index;
    })
    .map((entry) => entry.lane);
}

/**
 * 在车道清单里跑一遍降级。
 *
 * @param {object} options
 * @param {Lane[]} options.lanes          候选车道（会被排序）
 * @param {(lane: Lane, signal?: AbortSignal) => AsyncIterable<object>} options.attempt
 *        对一个车道发起一次尝试，返回该车道的 chunk 流
 * @param {(info: {lane: Lane, reason: string}) => void} [options.onFail]
 *        某个车道失败时的回调（用于日志与设置页统计）
 * @param {(lane: Lane) => void} [options.onSuccess]
 *        某个车道成功产出正文时的回调
 * @param {AbortSignal} [options.signal]
 * @returns {AsyncGenerator<object>} 胜出车道的 chunk 流
 *
 * 语义：
 *   - 某个车道在**产出正文之前**失败 → 整段丢弃，换下一个；
 *   - 产出正文之后失败 → 那是调用方的回合结束，不再切换（与上游 combo 同规则）；
 *   - 全部车道都失败 → 抛出聚合错误，消息里列出每个车道的失败原因。
 */
export async function* runWithFallback({ lanes, attempt, onFail, onSuccess, signal }) {
  const ordered = orderLanes(lanes);
  if (ordered.length === 0) {
    throw new Error('没有可用的 DeepSeek 车道。请先在设置页登录至少一个账号渠道。');
  }

  const failures = [];

  for (const lane of ordered) {
    if (signal?.aborted === true) {
      throw new Error('调用已被取消');
    }

    let committed = false;
    const held = [];

    try {
      // 注意 try 的范围只包住「向车道要数据」，不含「把数据交给调用方」——
      // 否则调用方在处理 chunk 时抛出的错误会被误判成车道失败，然后静默地
      // 换一个车道重来一遍（同一个错误被重复触发，且用户的原始报错丢失了）。
      let stream;
      try {
        // ⚠️ 必须 `await`：`attempt` 通常是 async 函数，返回的是**流的 Promise**
        // 而不是流本身。漏掉 await 会拿到一个 Promise，`Promise` 没有
        // `[Symbol.asyncIterator]`，于是 `iterator.next` 不存在 —— 每一次调用
        // 都会以 "iterator.next is not a function" 失败，整条降级链形同虚设。
        stream = await attempt(lane, signal);
      } catch (error) {
        throw Object.assign(error ?? new Error(String(error)), { __laneFailure: true });
      }

      if (stream === null || stream === undefined) {
        throw Object.assign(new Error('车道没有返回任何数据流'), { __laneFailure: true });
      }

      const iterator = typeof stream[Symbol.asyncIterator] === 'function'
        ? stream[Symbol.asyncIterator]()
        : stream;
      if (typeof iterator?.next !== 'function') {
        throw Object.assign(
          new Error('车道返回的不是可迭代的数据流'),
          { __laneFailure: true },
        );
      }

      while (true) {
        let next;
        try {
          next = await iterator.next();
        } catch (error) {
          throw Object.assign(error ?? new Error(String(error)), { __laneFailure: true });
        }
        if (next.done === true) break;
        const chunk = next.value;
        if (committed) {
          yield chunk;
          continue;
        }
        held.push(chunk);
        if (commitsAnswer(chunk)) {
          committed = true;
          // 一次性把缓冲的 chunk 交给调用方 —— 调用方看不到切换过程。
          for (const buffered of held) yield buffered;
          held.length = 0;
        }
      }
    } catch (error) {
      if (committed) {
        // 已经提交过正文：这是调用方的回合，按正常错误结束，不再换车道。
        throw error;
      }
      if (error?.__laneFailure !== true) {
        // 不是车道本身的问题（例如调用方取消、宿主错误）—— 直接抛出去。
        throw error;
      }
      const reason = error?.message ?? String(error);
      failures.push({ lane, reason });
      onFail?.({ lane, reason });
      continue;
    }

    if (committed) {
      onSuccess?.(lane);
      return;
    }

    // 流正常结束但没有产出正文 —— 这条车道等于没答上来。
    const reason = '模型结束了这一轮，但没有产生任何回答';
    failures.push({ lane, reason });
    onFail?.({ lane, reason });
  }

  const detail = failures
    .map((failure) => `${failure.lane.provider}/${failure.lane.model}: ${failure.reason}`)
    .join('; ');
  throw new Error(`所有 DeepSeek 车道都不可用 —— ${detail}`);
}
