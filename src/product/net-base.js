/**
 * 中性的出网基座。
 *
 * ## 为什么单独一个文件
 *
 * 上游 `dsh-our-free-model` 的 `src/http.js` 是一份质量很高的通用 HTTP/流工具
 * （SSE 嗅探、头回放、失败分类、超时），但它顶部从 `upstream.js` 引了四个
 * 与**客户端指纹伪装**相关的符号：
 *
 *   - `CLIENT_UA`       —— 冒充官方 CLI 的 User-Agent；
 *   - `UPSTREAM_BASE`   —— 那条免费车道的地址；
 *   - `gatewayHeaders`  —— 构造伪装指纹的那组请求头；
 *   - `truncateSession` —— 配合被铸造的 session id 使用。
 *
 * 那条车道需要**假装自己是官方客户端**才能拿到免费额度。本产品不这么做 ——
 * 一是上游条款不允许，二是实测该车道已对外全量拒绝（403），三是它根本不是
 * DeepSeek。
 *
 * 但 `http.js` 的其余部分（流读取、失败分类、SSE 解析）与指纹毫无关系，直接
 * 丢弃重写等于把两百行经过实战检验的代码重新写一遍。所以这里提供一份**中性
 * 实现**：`http.js` 改为从这里取这四个符号，其余代码逐字保留。
 *
 * ## 保留的 Kilo 车道
 *
 * Kilo 的公共网关是厂商**明确标注 `isFree: true` 且「no credits required」**的
 * 官方免费池，不需要任何伪装。它是本产品 DeepSeek 全挂时的兜底车道（非
 * DeepSeek 模型，可关闭）。
 *
 * @module src/product/net-base.js
 */

/**
 * 本产品自己的 User-Agent。
 *
 * 诚实标识自己，不冒充任何其它客户端。
 */
export const CLIENT_UA = 'dsh-qq-free-bot/0.1.0 (+https://github.com/dsh-qq-free-bot)';

/**
 * 出网基址。
 *
 * 默认为 Kilo 的公共网关 —— 官方标注为免费池的那一条。
 */
export const UPSTREAM_BASE = process.env.DSH_QQ_FREE_BOT_BASE ?? 'https://api.kilo.ai/api/gateway';

/**
 * 构造出网请求头。
 *
 * 与上游的同名函数形状一致，但**不含**任何伪装指纹：不伪造官方 UA，不带
 * 官方客户端专属的 session 镜像头。
 *
 * @param {{session?: string, stream?: boolean, accept?: string}} options
 * @returns {Record<string, string>}
 */
export function gatewayHeaders({ session, stream, accept } = {}) {
  const headers = {
    'content-type': 'application/json',
    'user-agent': CLIENT_UA,
    accept: accept ?? (stream ? 'text/event-stream' : '*/*'),
  };
  // Kilo 的网关接受普通的会话标识；不是官方客户端那种被铸造的降序 id。
  if (typeof session === 'string' && session !== '') headers['x-session-id'] = session;
  return headers;
}

/**
 * 把会话标识截断到上游接受的长度。
 *
 * @param {string} session
 * @returns {string}
 */
export function truncateSession(session) {
  const value = typeof session === 'string' ? session : '';
  if (value === '') return '';
  return value.length > 64 ? value.slice(0, 64) : value;
}
