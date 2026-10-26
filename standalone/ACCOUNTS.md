# 多厂商账号接入

## 本次接入范围

从旧项目仍使用的协议适配中保留 9 个渠道，加上原有 TRAE。CodeBuddy / WorkBuddy 在旧项目的 `LOGIN_PROVIDERS` 中已退役，未恢复成可用入口。

| 渠道 | 登录入口 | 模型目录 | 独立每日签到 |
| --- | --- | --- | --- |
| CodeArts | 浏览器 OAuth + 本机回调 | 厂商目录 | 支持 |
| 智谱 ZCode | 服务端中介授权 + 轮询 | 厂商目录 | 本次不自动处理交互验证 |
| Cline | WorkOS 设备码 | 厂商目录，保留 free / pass 命名空间 | 无独立接口 |
| 讯飞 Loomy | 微信扫码 / 绑定表单 | 厂商目录 | 每日额度 |
| 商汤 Raccoon | 扫码 / 短信表单 | 厂商目录 | 权益自动发放，无独立每日按钮 |
| MiniMax Code | PKCE 设备码 | 厂商目录 | 支持 |
| Gemini Code Assist | Google OAuth | 协议内置目录，界面标注 | 无独立接口 |
| Qoder | 浏览器设备授权 | 协议内置目录，界面标注 | 支持 |
| Qoder 中国版 | 浏览器设备授权 | 协议内置目录，界面标注 | 支持 |

本表描述代码接入范围，不代表这些账号已完成真实登录。当前仅 TRAE 有真实账号联调记录；新渠道需用户分别在厂商页面完成自己的授权，再获取模型并测试调用。没有复制本机其他客户端的凭据，也没有从旧宿主自动导入账号。

## 本地架构

- `server/accounts.mjs`：每厂商一个本地登录态、独立授权任务、模型目录、余额、续期、签到、聊天。
- `server/channel-state.mjs`：明确的渠道能力和公开状态，不向浏览器发送凭据。
- `server/channel-transport.mjs`：AsyncLocalStorage 绑定当前渠道和请求，注入测试网络；不替换进程全局 fetch。已发出的推理不自动重复；已发送的领取不自动重投。
- `server/vendor/channels.mjs`：从仓库原有 MIT 协议快照提取的登录、签名、模型目录和消息编解码；**不启动旧宿主、RPC、OpenAI 网关或账号池**。
- `server/protocol-sdk-shim.mjs`：少量值类型和错误类型的本地定义，不包含 DSH 运行时。协议代码中用于旧设置页的 Schema 元数据是惰性空描述，本地配置由 `store.mjs` 校验。
- `ui/accounts.jsx`：蓝色账号选择面板、厂商授权页链接、设备码、目录来源和实际聊天验证状态。

普通启动仍为根目录 `npm start`，构建验证 `npm --prefix standalone run check`。生成的协议子集已随项目保存，不要求运行 DSH 或先安装旧宿主依赖。

如修改协议快照后需要重新提取，仓库根依赖安装完成后运行 `npm --prefix standalone run channels:build`。脚本记录原快照 SHA256，复制许可证和 Qoder WASM，移除旧入口 `apply()`；关闭旧宿主的正文 / 循环裁剪，CodeArts 目录缓存定位到本项目 `standalone/data/protocol-cache`，不使用旧宿主缓存路径。第三方原件保持不变。

## 使用

1. “模型账号” → “选择账号厂商”下拉框 → “登录”。TRAE 也在同一列表，下面只展示所选厂商。
2. 打开授权链接，完成该厂商自己的登录或设备码授权。登录页可以单独打开；刷新本地控制台不丢失待授权链接。
3. 获取模型列表；Qoder / Gemini 使用协议内置目录，实际权益以测试调用为准。
4. 在上方“统一聊天模型”下拉框选择模型 → 保存设置 → “测试当前模型”，或回互动实验室聊天。无需给每个厂商各选一次模型。
5. 厂商支持每日签到时，开启开关后保存设置。应用运行时按上海日期执行，关机不运行、不补领历史日期。

切换模型不改人格、记忆和群聊接话逻辑。原有 TRAE 登录态、主模型和自动签到配置保持原样，新渠道默认未登录、自动签到关闭。

## 签到与错误

- 每厂商独立记录日期和状态；并发操作合并。
- 提交领取前写入 `claiming`；结果不确定留 `uncertain`，当天不盲目重发。
- 没有活动和仅状态查询失败可在退避后重查；不把“没查到状态”当成“已经领取过”。
- 正常额度查询结果没有数值时显示未知，不编成 0；领取响应必须明确确认，才显示已完成。
- ZCode 若要求交互验证，交给用户在厂商端完成；不启动旧包的自动浏览器验证子系统。
- 不挂载多账号池、不轮换设备或串号；调用使用用户当前账号权益，可能包含付费额度。

## 验证记录

`npm --prefix standalone run check`：构建和 61 项自动化测试通过（原 32 项 + 账号接入 18 项 + 统一目录与标签 11 项）。

新增测试覆盖加密重载、旧 TRAE 兼容、配置注入隔离、取消后迟到回调、登录完成落库、实际 Cline OpenAI SSE 编解码、实际 MiniMax Anthropic SSE 编解码、长文本、内置目录标注、失败目录保留、不重复推理、错误不泄露凭据、上海跨日和重启签到幂等、状态错误与已提交领取的区别、本地 HTTP 接线、无 DSH 运行时依赖与 Qoder WASM 文件。

这些新增测试使用明确的 fixture 凭据和网络替身，没有替用户登录其他厂商，也没有消费新厂商生产额度。修改前源码备份：`/tmp/bigfish-channels-originals/`。


## 统一模型目录与账号下拉框

`server/model-catalog.mjs` 把逻辑模型与原始 wire ID 分开。`DeepSeek V4.1 Flash`、`deepseekv4.1flash1017`、`deepseek-v4.1-flash-20261017`、`cline-free/deepseek-v4.1-flash` 等归并到 `deepseek-v4.1-flash`，前端只展示一项，但每个渠道发送它自己的真实原始 ID，free/pass 命名空间不改写。Flash、Pro、V4、V4.1、vision 和 preview 不混成同一型号。日期尾缀只去除合法月日格式，不把任意四位数字当日期。

`activeModelId` 与 `modelMaxOutputTokens` 独立保存；原有主模型自动迁移，不清除登录态。只在同一个逻辑模型的已登录、已启用渠道之间选路；当前渠道明确拒绝可换同模型的其他渠道，不降级成别的型号。已接受或结果不明的推理失败不盲目重发，避免重复消耗。一个渠道有多个日期别名时，本轮最多尝试该渠道一个别名。

“账号统一管理”只有一个厂商下拉框，包含 TRAE 和9 个渠道。选 ZCode 时详情只显示 ZCode；选 TRAE 才显示 TRAE。账号页不再铺所有厂商卡片，也不再另加一块 TRAE 账号或原始厂商模型选择器。API / Ollama 放入折叠的高级配置。

HTTP：`GET /api/state` 返回不含密钥的 `modelCatalog`；`POST /api/models/refresh` 只更新已登录账号目录（不发起推理）；`POST /api/models/test` 对保存的统一模型做一次短调用。原有每账号授权/查询接口保留。


## 渠道中文显示名（原始标识不变）

| 标识 | 显示名 |
| --- | --- |
| trae | TRAE · 字节跳动 |
| codearts | CodeArts · 华为云 |
| zcode | ZCode · 智谱 |
| cline | Cline · 开源编程助手 · Cline Bot Inc. |
| loomy | Loomy · 科大讯飞 |
| raccoon | Raccoon · 小浣熊 · 商汤科技 |
| minimax | MiniMax Code · 稀宇科技 |
| gemini | Gemini Code Assist · 谷歌 Google |
| qoder | Qoder · 阿里云 |
| qodercn | Qoder 中国版 · 阿里云 |

显示名用于账号下拉框、详情标题、统一模型的接入渠道；底层 `id`、存储键和 wire ID 均不变。无须重新登录或迁移凭据。

厂商归属核验参考：[阿里云 Qoder CN 文档](https://www.alibabacloud.com/help/en/lingma/introduction-of-lingma)、[阿里云 Qoder 产品页](https://www.alibabacloud.com/en/marketplace/qoder)、[MiniMax 隐私政策](https://agent.minimaxi.com/doc/zh/privacy-policy.html)、[Cline 官方隐私声明](https://cline.bot/privacy)。厂商显示用于辨认来源，不替代用户与各产品的实际服务合同主体。

最终实机验证：统一入口 `POST /api/models/test` HTTP 200，返回 `OK`，逻辑模型 `deepseek-v4.1-flash`、实际渠道 `trae-cn`。原有 TRAE 登录态、26 项目录和自动签到保持。界面选择 `ZCode · 智谱` 后仅有 ZCode 详情面板，TRAE 只作为下拉选项存在；截图 `design/accounts-unified.png`。新增厂商尚未由用户完成真实登录，不把 fixture 测试视作生产账号调用成功。


## 渠道移除与统一签到中心

有道龙虾（LobsterAI · 网易有道）：用户反馈存在封号风险，已移除。登录、模型路由、额度查询、每日签到均不再提供该渠道；旧加密配置会自动排除其活跃配置，不影响其他账号。原始加密备份保留。

签到入口改为“每日领鱼粮”统一批处理，支持总开关、逐账号开关、逐渠道结果和停止后续任务。详细行为和验证见 [每日签到中心](../docs/daily-benefits.md)。
