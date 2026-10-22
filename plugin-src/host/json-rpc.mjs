/**
 * 一个最小的 JSON-RPC 端点注册器（走 DSH 的 `/api` 载体）。
 *
 * ## 为什么不用 IM 渠道那套 `registerManagementRpc`
 *
 * 那套函数会把 channel 名拼在 `dsh-im` 命名空间下（`/api/dsh-im<channel>`）——
 * 它服务于 IM 渠道，本产品的车道设置与 IM 无关，挂在那里既不语义正确，也会在
 * 用户不装 IM 渠道时显得莫名其妙。
 *
 * 这里保留**同一套信封与状态码**（这样浏览器侧的行为与 QQ 设置页一致），只是
 * 路径由调用方自己给。
 *
 * ## 信封
 *
 * ```
 * 请求  { type: 'client-request', rpcId, payload: { method, payload } }
 * 响应  { type: 'server-response', rpcId, result: { ok, value | error } }
 * ```
 *
 * @module plugin-src/host/json-rpc.mjs
 */

import { resolveRpcAuthority } from './rpc-authority.mjs';

/**
 * 判断一个 authority 是不是回环地址。
 *
 * @param {string|null} authority
 * @returns {boolean}
 */
function isLoopbackAuthority(authority) {
  if (typeof authority !== 'string' || authority === '') return false;
  try {
    const host = authority.startsWith('[')
      ? authority.slice(0, authority.indexOf(']') + 1)
      : authority.split(':')[0];
    const normalized = host.toLowerCase();
    if (normalized === 'localhost' || normalized === '[::1]') return true;
    const parts = normalized.split('.');
    return parts.length === 4
      && parts[0] === '127'
      && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
  } catch {
    return false;
  }
}

/**
 * 回环 mode 下再校验一次来源。
 *
 * @param {Request} request
 * @returns {boolean}
 */
function isLoopbackRequest(request) {
  if (!isLoopbackAuthority(request.headers.get('host'))) return false;
  const origin = request.headers.get('origin');
  if (origin === null) return true;
  try {
    const url = new URL(origin);
    return ['http:', 'https:'].includes(url.protocol) && isLoopbackAuthority(url.host);
  } catch {
    return false;
  }
}

/**
 * 构造响应信封。
 *
 * @param {string} rpcId
 * @param {object} result
 * @returns {Response}
 */
function reply(rpcId, result) {
  // 下游客户端要求 error 一定带 details 字段。
  const value = result.ok === false
    ? { ...result, error: { ...result.error, details: result.error.details ?? {} } }
    : result;
  return Response.json({ type: 'server-response', rpcId, result: value });
}

/**
 * 注册一个 JSON-RPC 端点。
 *
 * @param {object} ctx DSH 插件上下文
 * @param {object} options
 * @param {string} options.path `/api/` 之后那一段（如 `dsh-qq-free-bot`）
 * @param {(method: string, payload: object, signal?: AbortSignal) => Promise<object>} options.handler
 * @param {'loopback'|'trusted-host'} [options.authority]
 * @returns {Function|undefined} 注销函数
 */
export function registerJsonRpc(ctx, { path: routePath, handler, authority }) {
  if (typeof ctx?.connection?.fetch?.register !== 'function') return undefined;
  if (typeof routePath !== 'string' || !/^[A-Za-z0-9._~/-]+$/.test(routePath)) {
    throw new TypeError(`invalid RPC path "${String(routePath)}"`);
  }
  const policy = resolveRpcAuthority(authority);

  return ctx.connection.fetch.register({
    path: `/api/${routePath}`,
    methods: ['POST'],
    requestBody: 'buffered',
    async fetch(request) {
      // DSH 已经做过浏览器鉴权与 Host/Origin 信任；这里只在 loopback 策略下
      // 再收紧一次。
      if (policy === 'loopback' && !isLoopbackRequest(request)) {
        return new Response('forbidden', { status: 403 });
      }
      if (request.method !== 'POST') return new Response('method not allowed', { status: 405 });
      const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
      if (contentType !== 'application/json') {
        return new Response('content type must be application/json', { status: 415 });
      }
      let message;
      try {
        message = await request.json();
      } catch {
        return new Response('body is not JSON', { status: 400 });
      }
      const rpcId = typeof message?.rpcId === 'string' ? message.rpcId : 'invalid-request';
      const call = message?.payload;
      if (message?.type !== 'client-request'
        || typeof message.rpcId !== 'string'
        || !call || typeof call !== 'object'
        || typeof call.method !== 'string'
        || !Object.hasOwn(call, 'payload')) {
        return reply(rpcId, {
          ok: false,
          error: { code: 'gateway/bad-request', message: 'Invalid RPC request.' },
        });
      }
      try {
        return reply(rpcId, await handler(call.method, call.payload ?? {}, request.signal));
      } catch (error) {
        return reply(rpcId, {
          ok: false,
          error: {
            code: 'gateway/handler-failed',
            message: error?.message ?? String(error),
          },
        });
      }
    },
  });
}
