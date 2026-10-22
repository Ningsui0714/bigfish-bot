/**
 * 车道设置页的 RPC 契约 —— 宿主与浏览器共用。
 *
 * 两级都要拼同一套 channel 名与端点名，写两份字符串迟早会不一致（改了一边
 * 忘了另一边，表现是「设置页一直加载不出来」）。所以集中在这里。
 *
 * @module src/product/lane-rpc-shared.js
 */

/** RPC 路径（宿主侧拼成 `/api/dsh-qq-free-bot`）。 */
export const MODEL_LANE_RPC_PATH = 'dsh-qq-free-bot';

/** 端点表。 */
export const MODEL_LANE_ENDPOINTS = Object.freeze({
  status: 'lane.status',
  update: 'lane.update',
  reset: 'lane.reset',
  move: 'lane.move',
  toggle: 'lane.toggle',
  fallback: 'lane.fallback',
});
