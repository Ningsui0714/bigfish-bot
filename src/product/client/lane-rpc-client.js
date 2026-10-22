/**
 * 浏览器侧调用车道 RPC。
 *
 * 宿主把车道 RPC 挂在 `/api/dsh-qq-free-bot` 上（见
 * `plugin-src/host/json-rpc.mjs`）。这里用 DSH 的 `connection.rpc.call`
 * 发同一个信封 —— 鉴权、超时、错误映射都交给宿主，不自己拼 fetch。
 *
 * @module src/product/client/lane-rpc-client.js
 */

/** RPC 路径（`/api/` 之后那一段）。 */
export const LANE_RPC_PATH = 'dsh-qq-free-bot';

/**
 * 调一个车道 RPC 方法。
 *
 * @param {object} connection DSH 的连接服务
 * @param {string} method 方法名
 * @param {object} [payload]
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>}
 */
export async function callLaneRpc(connection, method, payload = {}, signal) {
  if (typeof connection?.rpc?.call !== 'function') {
    throw new Error('DSH 连接不可用，无法读取车道设置');
  }
  return connection.rpc.call('/api', LANE_RPC_PATH, { method, payload }, signal);
}
