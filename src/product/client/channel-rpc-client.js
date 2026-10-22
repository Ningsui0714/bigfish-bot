/**
 * 浏览器侧调用账号渠道包的 RPC。
 *
 * 账号渠道包（`vendor/channel-pack/pack.js`）自己注册了 `/api/channel-pack`
 * 端点，方法名见 `channel-pack-rpc.ts` 的 handleMethod：
 * `account.list` / `account.create` / `login.poll` / `account.delete` 等。
 *
 * 这里只做一件事：用 DSH 的 `connection.rpc.call` 发同一套信封 —— 鉴权、超时、
 * 错误映射都交给宿主。
 *
 * @module src/product/client/channel-rpc-client.js
 */

/** 渠道包 RPC 的路径（`/api/` 之后那一段）。 */
export const CHANNEL_RPC_PATH = 'channel-pack';

/**
 * 调一个渠道包方法。
 *
 * @param {object} connection DSH 的连接服务
 * @param {string} method 方法名
 * @param {object} [payload]
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export async function callChannelRpc(connection, method, payload = {}, signal) {
  if (typeof connection?.rpc?.call !== 'function') {
    throw new Error('DSH 连接不可用，无法操作账号渠道');
  }
  const result = await connection.rpc.call('/api', CHANNEL_RPC_PATH, { method, payload }, signal);
  if (result?.ok === true) return result.value;
  if (result?.ok === false) {
    throw new Error(result.error?.message ?? result.error?.code ?? '渠道操作失败');
  }
  return result;
}

/**
 * 可登录的账号渠道。
 *
 * 顺序按「拿到 DeepSeek 额度最稳」排：CodeArts 的 benefit 集合明确标了
 * `deepseek-v4.1-flash`，TRAE / 有道 / 智谱 走每日签到，Cline 有独立免费 id，
 * 其余按配额窗口或积分池。
 *
 * ⚠️ 这里不包含 `opencode`（本产品挂载渠道包时传了 `disableOpencode: true`）与
 * 已退役的 `buddy` / `workbuddy`。
 */
export const LOGIN_PROVIDERS = Object.freeze([
  { id: 'codearts', label: 'CodeArts（华为云）', hint: '每日签到积分，DeepSeek 在免费集合里' },
  { id: 'trae', label: 'TRAE（字节）', hint: '每日签到，按天重置' },
  { id: 'lobsterai', label: '有道 LobsterAI', hint: '每日签到（幂等）' },
  { id: 'zcode', label: '智谱 ZCode', hint: '凭据不可续期，失效要重新登录' },
  { id: 'cline', label: 'Cline', hint: '有独立免费模型 id' },
  { id: 'loomy', label: '讯飞 Loomy', hint: '每日赠送池，14 天需重登' },
  { id: 'raccoon', label: '商汤 Raccoon', hint: '注册礼包 + 每日自动发放' },
  { id: 'minimax', label: 'MiniMax Code', hint: '每日签到' },
  { id: 'gemini', label: 'Gemini Code Assist', hint: '配额窗口（5 小时 / 周）' },
  { id: 'qoder', label: 'Qoder', hint: '每日领取，有效期 30 天' },
  { id: 'qodercn', label: 'Qoder 中国版', hint: '每日领取，有效期 30 天' },
]);
