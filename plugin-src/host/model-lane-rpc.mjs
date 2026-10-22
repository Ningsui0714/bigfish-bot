/**
 * 车道设置页的管理 RPC。
 *
 * 复用 IM 渠道那套 `registerManagementRpc`（同一套浏览器鉴权、同一套
 * `{type:'client-request', rpcId, method, payload:{method,payload}}` 协议），
 * 只是换一个 channel 前缀 `dsh-qq-free-bot` —— 这样它和 QQ 设置页走同一条
 * 已验证的通路，不需要另起一套 HTTP 服务。
 *
 * ## 为什么放在宿主侧而不是浏览器直接读写
 *
 * 配置文件在 `<DSH_HOME>` 下，浏览器够不到；车道对象（`adapter.lanes`）是
 * 宿主进程里的活对象。所有变更都必须经宿主，才能同时更新磁盘与内存里的
 * 派发目标。
 *
 * @module plugin-src/host/model-lane-rpc.mjs
 */

import { registerJsonRpc } from './json-rpc.mjs';
import {
  MODEL_LANE_ENDPOINTS,
  MODEL_LANE_RPC_PATH,
} from '../../src/product/lane-rpc-shared.js';

export { MODEL_LANE_ENDPOINTS, MODEL_LANE_RPC_PATH };

/**
 * 校验并取出配置对象。
 *
 * @param {unknown} value
 * @returns {{lanes: Array<object>, freeFallback: boolean}}
 */
function validConfig(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('config must be an object');
  }
  if (!Array.isArray(value.lanes)) throw new TypeError('config.lanes must be an array');
  for (const lane of value.lanes) {
    if (!lane || typeof lane !== 'object') throw new TypeError('config.lanes[] must be objects');
    if (typeof lane.provider !== 'string' || lane.provider === '') {
      throw new TypeError('config.lanes[].provider must be a non-empty string');
    }
    if (typeof lane.model !== 'string' || lane.model === '') {
      throw new TypeError('config.lanes[].model must be a non-empty string');
    }
  }
  return { lanes: value.lanes, freeFallback: value.freeFallback === true };
}

/**
 * 校验一个车道下标。
 *
 * @param {unknown} value
 * @param {number} length 车道数量
 * @returns {number}
 */
function validIndex(value, length) {
  if (!Number.isInteger(value) || value < 0 || value >= length) {
    throw new TypeError(`index must be an integer in [0, ${length - 1}]`);
  }
  return value;
}

/**
 * 把带运行状态的条目还原成纯配置。
 *
 * 设置页拿到的每条车道带有 `providerRegistered`、`channelServicePresent`
 * 之类的**只读**字段；写回配置时必须剔除，否则配置文件里会混进过期的状态。
 *
 * @param {object} entry
 * @returns {object}
 */
function stripStatus(entry) {
  return {
    provider: entry.provider,
    model: entry.model,
    ...(typeof entry.label === 'string' && entry.label !== '' ? { label: entry.label } : {}),
    enabled: entry.enabled !== false,
  };
}

/**
 * 安装 RPC。
 *
 * @param {object} ctx DSH 插件上下文
 * @param {object} lane `installModelLane()` 暴露的三个操作
 * @returns {Function|undefined} 注销函数
 */
export function installModelLaneRpc(ctx, lane) {
  if (typeof ctx?.connection?.fetch?.register !== 'function') return undefined;
  if (!lane || typeof lane.status !== 'function' || typeof lane.update !== 'function') {
    return undefined;
  }

  return registerJsonRpc(ctx, {
    path: MODEL_LANE_RPC_PATH,
    handler: async (method, payload = {}) => {
    switch (method) {
      case MODEL_LANE_ENDPOINTS.status:
        return { ok: true, value: lane.status() };

      case MODEL_LANE_ENDPOINTS.update:
        return { ok: true, value: lane.update(validConfig(payload.config)) };

      case MODEL_LANE_ENDPOINTS.reset:
        return { ok: true, value: lane.reset() };

      case MODEL_LANE_ENDPOINTS.move: {
        const state = lane.status();
        const from = validIndex(payload.index, state.lanes.length);
        const to = validIndex(payload.to, state.lanes.length);
        const lanes = [...state.lanes];
        const [moved] = lanes.splice(from, 1);
        lanes.splice(to, 0, moved);
        return {
          ok: true,
          value: lane.update({
            lanes: lanes.map(stripStatus),
            freeFallback: state.fallback.enabled,
          }),
        };
      }

      case MODEL_LANE_ENDPOINTS.toggle: {
        const state = lane.status();
        const index = validIndex(payload.index, state.lanes.length);
        const lanes = state.lanes.map((entry, at) => (
          at === index
            ? { ...stripStatus(entry), enabled: entry.enabled === false }
            : stripStatus(entry)
        ));
        return {
          ok: true,
          value: lane.update({ lanes, freeFallback: state.fallback.enabled }),
        };
      }

      case MODEL_LANE_ENDPOINTS.fallback: {
        const state = lane.status();
        return {
          ok: true,
          value: lane.update({
            lanes: state.lanes.map(stripStatus),
            freeFallback: payload.enabled === true,
          }),
        };
      }

      default:
        return {
          ok: false,
          error: {
            code: 'gateway/unknown-method',
            message: `unknown method "${String(method)}"`,
            details: { supported: Object.values(MODEL_LANE_ENDPOINTS) },
          },
        };
    }
    },
    // ⚠️ 不能写 `ctx.rpcAuthority` —— cordis 的属性访问在属性未被本 fiber
    // 注入时会抛 "cannot get property rpcAuthority without inject"。这个属性
    // 在多数宿主里根本不存在，写死就是一次启动失败。缺省交给
    // `resolveRpcAuthority` 走它自己的默认值（trusted-host）。
    authority: ctx.get?.('rpcAuthority'),
  });
}
