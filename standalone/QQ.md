# 大肥鱼 QQ 接入：官方 Bot / NapCat

「QQ 接入」现在只提供 **两条路径**，没有 Ollama 接入项。Ollama 不是 QQ 通信协议；本次未改变独立的模型账号配置。

两条路径共享已选择的统一模型、人格、接话节奏和显式记忆逻辑，不调用 DSH。默认都不自动上线。路径切换需保存，再连接；保存 / 断开会取消尚未投递的模型回复。官方凭据、OneBot Token 均只在本机加密保存，不返回已保存的明文。

## NapCat / OneBot 11：集成启动与扫码

「QQ 接入 → NapCat」提供三种部署方式；新配置默认选择原生安装，旧配置保留之前选择。

### 原生安装 · 免 Docker（推荐）

1. 点击“下载原生安装包”，大肥鱼自动识别本机系统和 CPU 架构。
2. 从 NapNeko 官方 GitHub Release 下载固定版本的安装包，显示进度，校验官方 SHA-256 后保存在本机数据目录。重复下载复用通过校验的文件。
3. Windows / macOS 点击“打开官方安装器”，首次安装与系统授权在官方安装器内完成；不要求手工安装 Docker。
4. macOS 已安装 QQ.app 时直接复用，安装器会提示 QQ 入口授权；完成首次安装后可关闭安装器，在本页点击“启动 NapCat 并扫码”。大肥鱼后台启动 QQ / NapCat，在页面显示二维码，QQ 上线后自动建立本机 OneBot 通道。
5. Windows 一键安装器负责部署 QQ 与 NapCat，运行生成目录的 `napcat.bat`；管理 Token 可在“高级管理配置”填写。
6. Linux 提供包含 QQ 的对应架构 AppImage，打开下载目录，按页面命令运行。仍需要系统提供 `xvfb-run` / `xauth`；大肥鱼不静默执行 sudo 安装系统软件。

原生安装包保存在 `standalone/data/napcat-native/`；QQ 账号、NapCat 配置与日志保留在其原生数据目录，不重定向到项目目录。首次 QQ 入口授权仍由官方安装器完成。macOS 后台启动会先明确提示 `--no-sandbox` 对当前 QQ 进程 Chromium 沙盒的影响，确认后才启动。关闭大肥鱼会停止它自己启动的 QQ / NapCat，不会停止外部实例或其他 QQ。

已运行的外部 NapCat 可以直接复用；首次粘贴一次 WebUI 链接或管理 Token，大肥鱼加密保存。后台托管启动使用上游 `NAPCAT_WEBUI_SECRET_KEY`、`NAPCAT_WEBUI_PREFERRED_PORT` 配置凭据和首选端口，并识别实际启动端口；无需读取受保护的 QQ 配置目录，也不再打开终端。

来源：[NapCat 官方 Shell 安装说明](https://napneko.github.io/guide/boot/Shell)、[macOS 官方安装器](https://github.com/NapNeko/NapCat-Mac-Installer)、[Linux AppImage](https://github.com/NapNeko/NapCatAppImageBuild)。

### Docker · 可选

1. 安装并启动 Docker / Docker Compose；macOS 使用 Docker Desktop 或兼容引擎。
2. 点击「下载并启动 NapCat」。首次会从 NapCat 项目使用的 `mlikiowa/napcat-docker:latest` 下载镜像，创建本应用独立的 Compose 实例。
3. 本页展示 QQ 登录二维码；用手机 QQ 扫码并确认。登录成功后自动连接 OneBot。
4. 如配置变更导致 WS 尚未连接，点击「自动配置本机 OneBot 并连接」。
5. 添加群 / 联系人白名单，保存并重新连接。

默认 WebUI 6099、OneBot 3001；可修改本机映射端口。容器端口固定为 6099 / 3001，发布到主机的端口只绑定 `127.0.0.1`。实例不使用 privileged，不挂载 Docker socket，不修改别的 NapCat / AstrBot 实例。

运行数据在 `standalone/data/napcat/`，包括 Compose 文件、NapCat 配置、QQ 登录目录和插件目录。应用管理凭据加密保存在主状态中；NapCat 自己所需的配置为其本地私有文件，目录权限 0700、生成文件 0600，整个数据目录已被 Git 排除。

关闭大肥鱼会停止状态跟踪，但容器作为独立服务继续运行；点击「停止内置 NapCat」停止本应用拥有的实例，保留 QQ 登录文件，不删除数据。

### 连接已有 NapCat

填写 WebUI 服务地址与管理 Token，点击「获取登录二维码 / 查询状态」。后端按 NapCat WebUI 的 SHA256(Token + `.napcat`) 登录协议取得临时管理凭据，前端显示本地生成的二维码，不展示已保存的 Token。启用了两步验证的服务可输入当前验证码。

已有 OneBot 连接仍在高级设置中填写正向 WS 地址与 Access Token。**WebUI Token 和 OneBot Token 是两套凭据**。远端管理地址使用 HTTPS。自动新增 OneBot 通道仅用于本机实例，且保留原有其他通道；远端在自己的 NapCat 管理页配置。

内置管理借鉴 AstrBot + NapCat 的独立服务部署结构，并未把 AstrBot 或 NapCat 源码打进大肥鱼。研究与来源见 [AstrBot / NapCat 集成记录](../docs/astrbot-napcat.md)。

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


### 点击“下载并启动 NapCat”没有反应

这个按钮属于“Docker · 可选”部署。普通用户直接切到“原生安装 · 免 Docker”，不必安装 Docker。Docker 模式会检查本机 Docker / Compose，再拉取镜像并启动容器。

- 若页面显示“尚未安装 Docker”，先安装并启动 Docker Desktop，再点“重新检查并启动 NapCat”。未满足运行环境时不会开始下载镜像。
- 若显示“Docker 尚未启动”，先启动 Docker 引擎，再检查环境。
- 本地后台重启后，旧页面的 HttpOnly 会话会失效。界面现已在明确收到本地 HTTP 401 时自动恢复会话并重试一次，不清空正在编辑的表单。
- 网络超时、400 / 403 / 409 / 429 / 500 不自动重放操作；按钮附近会显示具体错误，避免只在页面顶部出现提示。

2026-10-26 实测：本机后台重启后，不刷新旧 QQ 接入页面直接点击启动，正确进入“需要 Docker 运行环境”，显示“尚未安装 Docker”及安装入口。本机无 Docker，镜像下载与容器启动尚未执行。新增 7 项会话恢复 / HTTP 回归测试，独立版共 110 项通过。


### 原生安装验证（2026-10-26）

- 本机 macOS / arm64 实际检测到 `/Applications/QQ.app`，在界面切换并保存原生模式。
- 页面实际从 NapNeko 下载 `NapCatInstaller_arm64.amd64.zip` v1.7（1,101,125 字节），SHA-256 为 `93537837ae2a5d645393fbe67a758fbaebe93ca2b8cad3a608582c4be12a92a4`，与官方发布记录一致。
- 用户已在官方安装器完成系统授权及入口切换；本机由大肥鱼后台启动 NapCat 4.18.41 / QQ 7.0.2，真实管理接口鉴权成功，页面已显示真实 QQ 登录二维码。扫码确认需由用户本人完成，尚未实测群聊消息收发。
- 原生下载 / 打开 / HTTP、托管进程生命周期、端口回退、分片启动输出、凭据保密、外部实例复用及 OneBot 自动配置均有测试。独立版共 180 项通过；Windows / Linux 执行链为协议与命令替身覆盖，后台托管启动当前只适配 macOS。
- 修改前文件副本：`/tmp/bigfish-native-napcat-originals/`。
