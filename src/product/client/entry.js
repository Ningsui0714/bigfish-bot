/**
 * 浏览器半身的入口。
 *
 * 一个包只能登记**一个**浏览器模块，也只该有**一页**设置。所以这里把两件事
 * 装进同一个设置页：
 *
 *   - 「路由」tab —— QQ 机器人：扫码建机器人、会话、群历史、权限、模型选择；
 *   - 「模型」tab —— 免充值 DeepSeek：车道顺序、启用状态、兜底开关。
 *
 * 两个 tab 由 `plugin-src/client/index.js` 里的 rail 渲染（见迁移脚本的
 * 3z 组补丁），本文件只负责：
 *
 *   1. 装本产品设置页的样式；
 *   2. 把「车道 RPC」交给上游那套设置页 —— 它挂在 `/api/dsh-qq-free-bot`
 *      上，不能用上游的 `callManagementRpc`（那个会拼进 dsh-im 命名空间）。
 *
 * ## 为什么入口在这里而不是 plugin-src/client/
 *
 * `plugin-src/client/` 是从上游搬来的（迁移脚本每次都会重建整个目录），手写
 * 代码放进去会在下一次同步时被删掉。本产品的浏览器代码住在
 * `src/product/client/`。
 *
 * @module src/product/client/entry.js
 */

import { apply as applySettingsPage } from '../../../plugin-src/client/index.js';

import { installDeepSeekStyles } from './deepseek-settings.js';
import { callLaneRpc } from './lane-rpc-client.js';
import { callChannelRpc } from './channel-rpc-client.js';

export const name = 'dsh-qq-free-bot-settings';

/** 与上游设置页一致的依赖声明。 */
export const inject = ['slots', 'connection', 'locale', 'workspaces'];

/**
 * 挂载浏览器半身。
 *
 * @param {object} ctx 客户端插件上下文
 */
export function apply(ctx) {
  ctx.effect(installDeepSeekStyles, 'dsh-qq-free-bot: 车道设置页样式');

  applySettingsPage(ctx, {
    laneRpcCall: (endpoint, payload, signal) =>
      callLaneRpc(ctx.connection, endpoint, payload, signal),
    channelRpcCall: (method, payload, signal) =>
      callChannelRpc(ctx.connection, method, payload, signal),
  });
}
