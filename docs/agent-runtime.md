# 大肥鱼 Agent V2

## 这次借鉴什么

核对日期：2026-10-26。AstrBot 参考提交：`832fc6d98ac25facd54b07424c16067435c118e6`。

- [消息阶段顺序](https://github.com/AstrBotDevs/AstrBot/blob/832fc6d98ac25facd54b07424c16067435c118e6/astrbot/core/pipeline/stage_order.py)：将唤醒、会话状态、插件处理、回复修饰和发送拆开。
- [会话管理](https://github.com/AstrBotDevs/AstrBot/blob/832fc6d98ac25facd54b07424c16067435c118e6/astrbot/core/conversation_mgr.py)：将消息来源与对话记录分开管理，支持新建、切换和删除。
- [插件事件注册](https://github.com/AstrBotDevs/AstrBot/blob/832fc6d98ac25facd54b07424c16067435c118e6/astrbot/core/star/star_handler.py)：按事件类型及优先级运行处理器。

大肥鱼保留自己的 Node.js、QQ 和统一模型链路，独立实现以下结构，没有嵌入 AstrBot 的 Python 代码。此版本不是 AstrBot 插件兼容层，没有插件市场、MCP 工具循环或任意代码执行功能。

## 消息流

`会话权限 → 去重 → 本地命令 / 接话决策 → 按会话排队 → 人格 + 群聊现场 + 个人对话历史 → 模型前钩子 → 模型 → 回复后处理 → QQ 送达 → 加密历史 → 送达事件`

- 白名单检查在命令和插件之前；被挡下时留下明确原因，不再静默丢弃诊断信息。
- 同一会话的模型轮次串行；不同会话可独立处理。每房间最多 20 个排队请求，最多 64 个活跃房间，单轮含排队最长 90 秒。
- 群聊现场在入队时快照，第一轮不会偷看到后续排队的消息。上一轮送达后，下一轮使用真实 `user` / `assistant` 历史。
- 叫“大肥鱼”也会明确标记为直接对话，不会在模型阶段误当作随机插话。
- 重置配置时切换取消代次，旧任务结束不会删掉新任务的队列；即使模型忽略取消，旧回复也不会继续发送。保存人格、记忆和模型设置时保留已连接的 QQ，只有 QQ 接入或白名单变化才要求重连。
- 模型静默、推理失败、发送失败不写入成功对话。送达后的本地存储或事件钩子失败只记诊断，不重新推理或重发消息。

## 两种记忆

**短期对话**：默认保留每个渠道 / 会话 / 成员最近 12 轮成功对话，24 小时有效。界面「人格与节奏 → Agent 内核与会话」可调整为 1～24 轮、1～168 小时，也可以关闭。记录与密钥一起留在本机，沿用 AES-256-GCM 加密存储，不放进 `/api/state` 的公开配置中。

**明确记忆**：继续使用“记住：…”的显式笔记；按会话与成员隔离。不会把每句话自动变成用户画像。

短期记录有滚动字符预算、全局最多 128 个存储会话及总字符预算。保留的是有界上下文，不是额外调用模型的摘要，因此不额外消耗一次推理额度。超出有效期的记录不再进入提示词；加密备份仍按原本的 `.bak` 机制保留，清理备份需连同数据目录管理。

## QQ 与实验室命令

| 命令 | 行为 |
| --- | --- |
| `/help`、`/帮助` | 查看本地命令 |
| `/reset`、`/new`、`/新对话` | 取消当前成员旧轮次、清空其短期上下文，保留明确记忆 |
| `/memory` | 只显示当前成员在本会话的明确笔记 |
| `/status` | 当前成员的历史轮数、笔记数量及持久化状态 |

私聊直接发送；群里需要 `@机器人 /help` 这样明确唤醒，不会把群友随口发的斜杠命令当作对机器人的操作。本地命令不调用模型。关闭内置命令时，这些指令不转发给模型执行。

“忘记我”同时清理本人的显式笔记、近期上下文和当前短期对话；不会清掉其他成员的记录。

## 扩展钩子

开发者可通过 `createApplication({agentPlugins:[...]})` 注入可信本地 JS 模块，也可使用 `app.agent.plugins.register(plugin)` 动态注册并取得注销函数。默认注册内置会话命令插件。

```js
const plugin = {
  id: 'answer-style',
  name: '回答后处理',
  priority: 10,
  hooks: {
    beforeModel({message, messages, signal}) {
      // messages 为本轮模型消息；可以添加自己的格式要求。
      signal.throwIfAborted();
    },
    afterModel({result}) {
      result.text = result.text.trim();
    },
    afterDelivery({message, result}) {
      // 这里只处理已送达事件；不要在这里重发 result.text。
    },
  },
};
const app = await createApplication({agentPlugins:[plugin]});
```

支持的钩子为 `command`、`beforeModel`、`afterModel`、`afterDelivery`，高优先级先运行。命令处理器返回 `{handled:true,reason:'自定义原因',text:'回复'}` 可结束本轮命令分发。扩展在应用进程内执行，不是隔离沙盒，也不会自动下载或执行远程插件。

## 运行与验证

根目录 `npm start` 启动；`npm run check` 构建前端并运行独立版与兼容版测试。

实现：`standalone/server/agent.mjs`、`standalone/server/agent-runtime.mjs`、`standalone/server/store.mjs`、`standalone/ui/agent-panel.jsx`。新增测试：`standalone/test/agent-runtime.test.mjs`。

覆盖加密重启续聊、成员 / 渠道隔离、串行上下文、取消与重置、显式记忆保留、失败不留历史、插件优先级及注销、送达后插件错误不重发、权限先于插件、保留周期与完整 JSON。

## 实机验收（2026-10-26）

实际重启本地后端后恢复原有两轮短期对话，真实模型续聊仍回答“蓝色的小鱼”；QQ / NapCat 重新上线。另已实测仅保存 Agent 设置时 QQ 保持连接。

人格管理接在同一内核之上，参见 [人格与模板管理](personas.md)。
