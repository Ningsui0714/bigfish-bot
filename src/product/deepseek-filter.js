/**
 * DeepSeek 模型过滤。
 *
 * 本产品只向 QQ 机器人暴露 DeepSeek 模型。这不是一个「偏好」而是**产品契约**：
 * 机器人背后跑的是 agent，需要稳定的推理能力与工具调用支持，用户要能预期
 * 「我问的就是 DeepSeek」。把别的模型混进选择器会让这个预期失效。
 *
 * 过滤发生在**两个层面**，缺一不可：
 *
 *   1. **目录层**（`isDeepSeekModel`）—— 决定哪些模型出现在 DSH 的模型选择器里。
 *   2. **调用层**（`assertDeepSeekModel`）—— 决定哪些模型允许被真正调用。
 *
 * 只有第 1 层是不够的：DSH 的 combo/降级链、用户直接点名模型 id、以及历史
 * 会话里保存的模型选择，都可能把一个非 DeepSeek 的 id 递到调用层。目录是建议
 * 性的（上游 channel-pack 的注释说得很清楚：「目录是建议性的，缺省不构成拒绝」），
 * 所以调用层必须自己再把关一次。
 *
 * @module src/product/deepseek-filter.js
 */

/**
 * 认定一个模型 id 属于 DeepSeek 家族。
 *
 * 判定依据是 id 里的 `deepseek` 词根 —— 上游各家渠道的 DeepSeek 模型 id 形态
 * 各不相同：
 *
 *   - `deepseek-v4.1-flash`              （CodeArts benefit 集合、智谱）
 *   - `deepseek-v4-flash-0731`           （带日期后缀）
 *   - `cline-free/deepseek-v4.1-flash`   （Cline 的免费命名空间前缀）
 *   - `deepseek/deepseek-v4.1-flash`     （带 provider 命名空间前缀）
 *   - `deepseek_v4` / `deepseek-chat`    （裸 id）
 *   - `deepseek-r1-0528`                 （推理系列）
 *
 * 所以判定必须**忽略分隔符与命名空间**，只看「词根是否出现」：
 *
 *   - 先取命名空间之后的最后一段（前缀本身含 deepseek 时会让判断变成同义反复）；
 *   - 再把 `_`、`.`、空格统一成连字符；
 *   - 最后匹配 `deepseek` 词根。
 *
 * ⚠️ 不能用「名字包含 deepseek 就算」这种朴素判断来**标注免费属性** ——
 * 上游 Cline 明确警告过：`cline-free/deepseek-v4.1-flash`（免费）与
 * `deepseek/deepseek-v4.1-flash`（按量计费）是两个不同条目，模糊匹配会把
 * 付费条目误标成免费。本模块只做「是不是 DeepSeek 家族」的判断，不碰免费属性，
 * 两者是不同的问题。
 *
 * @param {string} modelId 模型 id
 * @returns {boolean}
 */
export function isDeepSeekModel(modelId) {
  if (typeof modelId !== 'string') return false;
  const raw = modelId.trim();
  if (raw === '') return false;

  const segments = raw.split('/');
  const tail = segments[segments.length - 1] ?? raw;
  const normalized = tail.toLowerCase().replace(/[_.\s]+/g, '-');
  return normalized.includes('deepseek');
}

/**
 * 过滤掉所有非 DeepSeek 的模型条目。
 *
 * @param {Array<{id: string}>} models
 * @returns {Array<{id: string}>} 保持原顺序的 DeepSeek 条目
 */
export function filterDeepSeekModels(models) {
  if (!Array.isArray(models)) return [];
  return models.filter((model) => isDeepSeekModel(model?.id));
}

/**
 * 调用前的守卫：非 DeepSeek 模型一律拒绝。
 *
 * 拒绝时抛出的错误消息要能让人一眼看懂「为什么不能用这个模型」，因为这个
 * 错误会沿着 DSH 的错误链路一路显示到 QQ 聊天窗口里。
 *
 * @param {string} modelId
 * @param {{restricted?: boolean}} [options] `restricted: true`（缺省）表示启用
 *   「只允许 DeepSeek」的限制；传 `false` 时不拦截，用于用户主动尝试其它模型
 *   的场景（例如设置页里的「显示全部模型」开关）。
 * @returns {void}
 * @throws {Error} 当模型不属于 DeepSeek 家族且限制开启时
 */
export function assertDeepSeekModel(modelId, { restricted = true } = {}) {
  if (restricted === false) return;
  if (isDeepSeekModel(modelId)) return;
  throw new Error(
    `"${modelId}" 不是 DeepSeek 模型。本产品只提供 DeepSeek 家族模型，请从模型列表中选择。`,
  );
}

/**
 * 账号渠道里已知提供 DeepSeek 模型的渠道。
 *
 * 这不是白名单而是**提示**：渠道的模型目录是动态的（登录后从远端拉取），
 * 硬编码一份名单会在上游新增模型时立刻过时。真正的判定始终是
 * {@link isDeepSeekModel} 对实际目录条目的逐个检查。
 *
 * 这里保留它是为了设置页能给用户一个「这些渠道通常提供 DeepSeek」的预期提示。
 */
export const CHANNELS_WITH_DEEPSEEK = Object.freeze([
  'codearts', 'cline', 'trae', 'lobsterai', 'zcode',
  'loomy', 'raccoon', 'minimax', 'gemini', 'qoder', 'qodercn',
]);
