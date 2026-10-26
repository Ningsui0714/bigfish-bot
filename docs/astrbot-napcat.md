# AstrBot 与 NapCat：大肥鱼的集成选择

研究日期：2026-10-26。研究对象为官方仓库、部署模板与 NapCat WebUI 源码，没有根据第三方教程直接改动登录流程。

## 查到的结构

**AstrBot 是完整机器人框架，不是 NapCat 的登录 SDK。** 它已有多平台、模型服务、插件、人格和上下文等能力。其 OneBot 适配器使用反向 WebSocket，NapCat 负责 QQ 客户端与登录；官方 Compose 模板同时启动两个独立容器。

来源：[AstrBot 主仓库](https://github.com/AstrBotDevs/AstrBot)、[AstrBot OneBot 适配器](https://github.com/AstrBotDevs/AstrBot/blob/master/astrbot/core/platform/sources/aiocqhttp/aiocqhttp_platform_adapter.py)、[NapCat 官方 AstrBot 模板](https://github.com/NapNeko/NapCat-Docker/blob/main/compose/astrbot.yml)。

这意味着“整合 NapCat”不必把 QQ 程序塞进自己的后端。让用户在一个界面完成服务启动、二维码登录、连接状态和 OneBot 配置，同样能提供一体化体验。

## 这一轮的选择

保留大肥鱼已经实现的多厂商账号、签到、统一模型、群聊人格与记忆，参考 AstrBot 的独立服务结构，新增：

- 自有 NapCat 实例的 Docker / Compose 启动与停止。
- 环境检查，区分“没有 Docker”“引擎未启动”和“QQ / OneBot 未连接”。
- 同一页面展示 NapCat 个人 QQ 登录二维码和 QQ 初始化状态。
- QQ 上线后自动尝试连接 OneBot；可一键创建大肥鱼专用本机通道。
- 接管已有 WebUI 的扫码流程，保留原有正向 WS 配置入口。

大肥鱼当前仍使用正向 WS，与 AstrBot 的反向 WS 接入方向不同；二者都属于 OneBot 11，不需要为了 UI 整合改掉已工作的消息传输。

## 为什么没有直接换成 AstrBot

把大肥鱼整体改成 AstrBot 插件，需要重接它的平台事件、Provider、配置、记忆和插件生命周期，而不只是换一个 QQ SDK。这会影响现有本地界面与账号模型主链路。

如果后续明确要 AstrBot 插件生态，可以选择独立的 Provider / 插件适配层，让 AstrBot 使用大肥鱼的账号模型能力；本轮保持现有应用架构，不混入第二套群聊决策核心。

AstrBot 仓库标注 AGPL-3.0；NapCat 有自己的 Limited Redistribution License。此实现只调用外部服务和容器，没有复制二者实现代码。完整许可证保持在各自上游项目中：[AstrBot LICENSE](https://github.com/AstrBotDevs/AstrBot/blob/master/LICENSE)、[NapCat LICENSE](https://github.com/NapNeko/NapCatQQ/blob/main/LICENSE)。

## 对接依据

核对的 NapCatQQ 提交：`3420f0b76d7dc0ac92cde1663f21ea27f61e13bb`。

- `POST /api/auth/login`，字段 `hash=SHA256(token + '.napcat')`，可携带 `totpCode`；读取返回的 `Credential` 作为 Bearer。
- `POST /api/QQLogin/CheckLoginStatus`，区分 `isLogin`、`coreReady`、`qrLoginAccepted` 与初始化阶段。
- `POST /api/QQLogin/GetQQLoginQrcode` / `RefreshQRcode`。
- `POST /api/OB11Config/GetConfig` / `SetConfig`；写入字段 `config` 为 JSON 字符串。

源码：[WebUI 后端](https://github.com/NapNeko/NapCatQQ/tree/3420f0b76d7dc0ac92cde1663f21ea27f61e13bb/packages/napcat-webui-backend)、[WebUI 前端登录调用](https://github.com/NapNeko/NapCatQQ/blob/3420f0b76d7dc0ac92cde1663f21ea27f61e13bb/packages/napcat-webui-frontend/src/controllers/webui_manager.ts)、[Docker 部署说明](https://github.com/NapNeko/NapCat-Docker)。

## 交付与验证

实现：`standalone/server/napcat.mjs`、`standalone/ui/napcat-panel.jsx`；配置、API 与 QQ 设置页已连接。`standalone/test/napcat.test.mjs` 覆盖缺少环境、受管实例归属、私有配置、登录哈希、二维码、两步验证、初始化状态、取消后的延迟响应、OneBot 配置保留和本机 HTTP → WS → 模型 → 回复完整链路。

开发机是 macOS / arm64，检查时没有 Docker CLI 和运行引擎。因此本机验证能覆盖界面与缺少运行环境的实际分支；容器启动使用命令替身测试，真实个人 QQ 扫码仍由用户完成。这里没有把测试二维码或替身当作已登录的 QQ 账号。

修改前文件副本位于 `/tmp/bigfish-napcat-originals/`。运行：`npm run local:check`；需要容器时，在界面检查环境后点击启动。


## 后续调整：原生优先（2026-10-26）

用户反馈不应把 Docker 作为普通用户的安装前提。新增 `standalone/server/napcat-native.mjs`，新配置默认原生安装，Docker 保留为可选项。

重新核对当前官方文档：macOS 12+ 提供通用安装器，Windows 提供一键包，Linux 提供 amd64 / arm64 AppImage。下载从官方 Release API 固定版本与资产，校验发布 SHA-256；桌面端引导打开官方安装器，首次 QQ 入口授权在其 UI 完成。大肥鱼不代替系统授权，不复制 NapCat 代码，也不把原生模式宣传为静默完成全部系统安装。

来源：[当前 Shell 安装文档](https://napneko.github.io/guide/boot/Shell)、[macOS 安装器 v1.7](https://github.com/NapNeko/NapCat-Mac-Installer/releases/tag/v1.7)、[NapCat v4.18.41](https://github.com/NapNeko/NapCatQQ/releases/tag/v4.18.41)、[Linux AppImage](https://github.com/NapNeko/NapCatAppImageBuild/releases/latest)。
