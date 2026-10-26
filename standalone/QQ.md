# 大肥鱼 QQ 接入：官方 Bot / NapCat

「QQ 接入」现在只提供 **两条路径**，没有 Ollama 接入项。Ollama 不是 QQ 通信协议；本次未改变独立的模型账号配置。

两条路径共享已选择的统一模型、人格、接话节奏和显式记忆逻辑，不调用 DSH。默认都不自动上线。路径切换需保存，再连接；保存 / 断开会取消尚未投递的模型回复。官方凭据、OneBot Token 均只在本机加密保存，不返回已保存的明文。

## NapCat / OneBot 11

1. 独立安装 NapCat，并在 NapCat 中登录 QQ。
2. 在网络设置新增 **WebSocket 服务端（正向 WS）**，启用服务，消息格式选择 `array`（数组），设置 Access Token。
3. 大肥鱼选择「NapCat / OneBot」，填写服务地址（如 `ws://127.0.0.1:3001`）与相同的 Token。该 Token 不是 NapCat WebUI 的登录 Token。
4. 填入允许的 QQ 群号；私聊需单独开启，并填允许的 QQ 号。
5. 保存并连接。通过 `get_login_info` 确认实际登录账号后，在白名单群 @ 机器人。

其他标准 OneBot 11 正向 WS 实现可使用同一接口。远程明文 WS 不受支持，远程连接使用 WSS。

## 官方 QQ Bot（默认扫码 + WebSocket 直连）

界面优先提供**手机 QQ 扫码绑定**，不再要求手工抄 AppID / AppSecret。扫码使用外部依赖 `@tencent-connect/qqbot-connector` 1.2.0；消息收发使用 `@tencent-connect/qqbot-nodejs` 1.0.4。未加载旧 DSH QQ 桥。官方 Bot 不是个人 QQ 客户端登录。

1. 选择「官方 QQ Bot」，点击「获取 QQ 绑定二维码」。如有未保存的设置，先保存，再请求二维码。
2. 在**手机 QQ** 扫码，选择 / 绑定你管理的机器人并完成腾讯侧确认。本应用不代替用户扫码确认。
3. Connector 返回凭据后，在本机加密保存；不把 AppSecret 返回给浏览器、写入日志或明文配置。
4. 自动使用 **WebSocket 主动连接官方网关**，不要求公网 IP、HTTPS 回调域名或内网穿透。连接状态以网关 READY 为准，不把扫码成功当作聊天收发成功。
5. 向机器人发消息，从“最近收到的会话标识”将群 / 用户 OpenID 加入白名单。保存会断开连接，再点击「连接已绑定 Bot」开始接话。

二维码由后端本机生成 PNG，前端不向第三方二维码生成站发送绑定链接。二维码过期由官方 Connector 自动刷新；会话总时限 10 分钟，可主动取消。取消、重新开始或显式保存配置后，旧会话的延迟回调不能覆盖新状态；保存凭据的短暂提交阶段保持原子提交。重启不恢复未完成的扫码。

扫码换成另一个 AppID 时，清空官方白名单，避免把 Bot A 的 OpenID 用于 Bot B；同一 AppID 重新授权保留原白名单。官方记忆按 AppID 隔离。不会把模型厂商登录账号展示成 QQ 机器人。

### 手动配置与 Webhook 高级选项

展开「高级设置 · 手动填写凭据 / 消息接收方式」可手工填写 AppID / AppSecret，或切换到 **Webhook**。默认不使用 Webhook；旧 BotGo README 的历史下线提示不应当作所有当前机器人必须使用 Webhook 的依据。当前腾讯 QQ Bot 项目 README 和安装 SDK 都支持 WebSocket 默认接入，仍需使用真实机器人验证账号权限。

选择 Webhook 时：独立监听 `127.0.0.1:3211/qqbot`（端口可改），你需提供公网 HTTPS 入口**只转发回调路径**。在开放平台配置回调 URL、订阅事件，并按平台要求配置沙箱 / 出口 IP。不要转发管理端口 3210。未自动创建公网隧道、域名或证书。

### 状态与协议语义

- **正在连接**：尚在初始化 / 获取 token / 等待网关 READY，不表示接入成功。
- **回调已监听，等待平台事件**：本地端口准备好了；不表示公网 HTTPS 已打通。
- **已连接**：WebSocket 收到 READY / RESUMED，或 Webhook 收到通过签名与时间戳校验的事件。WebSocket READY 不代表已经实际发送聊天；Webhook URL 挑战 `op:13` 也不算真实消息接入。
- 管理接口的连接响应是启动任务的状态，不会等待整个长连接生命周期；错误通过轮询状态显示。
- 回调专用端口仅接受 `POST /qqbot`，限制请求大小和时间；消息回调需有效签名，时间戳与本机相差不超过 5 分钟。`op:13` 按平台挑战协议返回签名，不投递到模型。
- 先 ACK，再后台处理模型，避免慢推理导致平台超时重投；重复事件仍经过社交层消息 ID 去重。
- 官方回复携带原始 `msg_id`，SDK 维护 `msg_seq`，使用文字消息 `msg_type:0`，不是无关联的主动广播。
- `GROUP_AT_MESSAGE_CREATE` 明确接话；普通 `GROUP_MESSAGE_CREATE` 如获授权并被推送，才按旁听、兴趣和冷却决策。不宣称能读取平台没有推送的群消息。
- 个人 QQ 的普通群聊观察可使用 NapCat；官方 Bot 的可见消息范围与权限由开放平台决定。

支持文字群聊和私聊；当前未实现频道 / 频道私信、图片、语音、文件与好友申请处理。模型调用失败或消息投递失败仍记为失败，不把 ACK 当作已回复。

## 验证与剩余缺口

```sh
npm --prefix standalone run check
npm test
npm start
```

`standalone/test/qq-binding.test.mjs` 验证二维码渲染、取消 / 过期 / 刷新、延迟回调隔离、凭据保存、并发与修订号，以及扫码后自动连接。

`standalone/test/qq.test.mjs` 使用**真实安装的 QQ SDK + 本机协议替身**验证 token 交换、回调 URL 签名挑战、无签名 / 错签 / 过期拒绝、官方群消息和 C2C 到模型再到 REST 回复、白名单、消息去重、凭据遮蔽、会话切换和启动中取消。既有 `core.test.mjs` 覆盖真实本机 WebSocket 上的 OneBot 事件 / 动作链路。

已真实向腾讯取得官方二维码链接（HTTPS `q.qq.com/qqbot/openclaw/connect.html`），未替用户完成扫码确认。官方 WebSocket 的 token → 网关发现 → IDENTIFY / READY → 群聊 REST 回复已通过本机真实 SDK 协议替身测试。

尚未绑定真实机器人，也未接入真实 NapCat 实例，因此**没有声称真实 QQ 账号已收发成功**。不会用模型厂商账号冒充 QQ 机器人身份。

## 资料

- [NapCat 项目配置指南](https://napneko.github.io/config/basic)：正向 WS / 反向 WS、Token 与消息格式。
- [腾讯 QQ Bot 当前 README](https://github.com/tencent-connect/openclaw-qqbot)：扫码绑定、默认 WebSocket 与可选 Webhook。
- [腾讯官方 BotGo README](https://github.com/tencent-connect/botgo)：保留其历史链路提示与 Webhook 示例作为背景，不将旧公告覆盖到当前 SDK。
- [QQ 开放平台](https://q.qq.com/) 与 [回调协议文档](https://bot.q.qq.com/wiki/develop/api-v2/dev-prepare/interface-framework/event-emit.html)；本次文档抓取器未能读取后者全文，具体字段同时核对安装的 SDK 源码与本地协议测试，不把无法抓取当作已验证的线上权限。

本次改动前备份：`/tmp/bigfish-qq-paths-originals/`。这不是整个仓库备份；保留已有用户改动。加密业务数据未为测试替换或清空。

扫码功能追加备份：`/tmp/bigfish-qq-qr-originals/`。Connector 为外部 npm 依赖，许可证元数据 UNLICENSED，本仓库不复制其实现源码。
