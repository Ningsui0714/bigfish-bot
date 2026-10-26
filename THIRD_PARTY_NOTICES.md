# Third-party notices

本产品现名 **大肥鱼 BigFish**，仓库与包名为 `bigfish-bot`，前身为 `dsh-qq-free-bot`。仓库保留旧集成及其上游代码、完整许可与出处；当前独立版的来源另列于文末。

## 内联的上游项目

### dsh-im（QQ 渠道部分）

- 来源：<https://github.com/xmanrui/dsh-im>，版本 v5.4.0
- 许可证：MIT（全文见 `LICENSE.upstream-dsh-im`）
- 版权：Copyright (c) 2026 xmanrui
- 本产品内联的部分：`src/channels/qq/**`、`src/channels/shared/**`、
  `plugin-src/host/channels/qq/**`、`plugin-src/host/channels/shared/**`、
  `plugin-src/host/` 下的宿主基础设施、`plugin-src/client/**` 的 QQ 设置页。
- 裁剪：上游支持 14 个 IM 渠道，本产品只保留 QQ；裁剪点在
  `scripts/migrate.mjs` 中集中列出（每处都带 `[dsh-qq-free-bot] 裁剪` 注释）。

上游自身的第三方声明（涉及微信、飞书、钉钉、企业微信、Telegram、Discord、
WhatsApp、Matrix 等渠道的协议适配）见
<https://github.com/xmanrui/dsh-im/blob/main/THIRD_PARTY_NOTICES.md>。本产品只
保留 QQ 渠道，其中与 QQ 相关的部分是：

> QQ QR binding uses Tencent Connect's official
> [`@tencent-connect/qqbot-connector`](https://www.npmjs.com/package/@tencent-connect/qqbot-connector)
> 1.2.0 package as an external runtime dependency. Its npm metadata declares
> `UNLICENSED`; no connector source is copied into this project.

### dsh-our-free-model（模型侧部分）

- 来源：<https://github.com/Ebony-Vinyl/dsh-our-free-model>，版本 v2.5.8
- 许可证：MIT（全文见 `LICENSE.upstream-dsh-our-free-model`）
- 版权：Copyright (c) 2026 Ebony-Vinyl
- 本产品内联的部分：`src/model/http.js`、`src/model/kilo.js`、
  `src/model/egress.js`、`src/model/failure.js`（通用 HTTP/流工具与 Kilo 免费
  池客户端），以及 `vendor/channel-pack/**`（账号渠道包）。
- 裁剪与改写：
  - `src/model/http.js` 顶部四个与**客户端指纹伪装**相关的 import 改为从本产品
    自己的 `src/product/net-base.js` 取中性实现；
  - 上游的免 Key 免账号车道（需伪装官方客户端指纹）与 EAC 协付车道（依赖从
    seal 包提取的共享密钥）**未内联** —— 上游自己已将它们下线，本产品继承
    这个判断。

## vendor/channel-pack —— 账号渠道包

来源与许可证见 `vendor/channel-pack/NOTICE.md` 与 `vendor/channel-pack/LICENSE`。

- 上游仓库：<https://gitee.com/iJetLi/deepseek-harness-codearts>
- 吸收的提交：`345f0a07b22713c0ae189ca7d8b97ec4f64626c6`（2026-10-06）
- 许可证：MIT

## 运行期依赖（不在 bundle 内，由 Node 解析）

| 包 | 版本 | 许可证 |
| --- | --- | --- |
| [`@tencent-connect/qqbot-connector`](https://www.npmjs.com/package/@tencent-connect/qqbot-connector) | 1.2.0 | `UNLICENSED`（腾讯官方包） |
| [`@tencent-connect/qqbot-nodejs`](https://www.npmjs.com/package/@tencent-connect/qqbot-nodejs) | 1.0.4 | MIT |
| [`qrcode`](https://www.npmjs.com/package/qrcode) | 1.5.4 | MIT |
| [`undici`](https://www.npmjs.com/package/undici) | 7.29.1 | MIT |
| [`semver`](https://www.npmjs.com/package/semver) | 7.8.5 | ISC |

## bundle 内的第三方代码

- [`semver`](https://www.npmjs.com/package/semver) 7.8.5 —— 用于 npm 版本比较，
  ISC 许可证。

## 商标

QQ 是腾讯公司及其关联公司的商标。本项目与腾讯、华为云、字节跳动、有道、
智谱、讯飞、商汤、MiniMax、Google、Moonshot、Kilo AI 等厂商无隶属、认可
或赞助关系。产品名称与标识归各自所有者所有。

当前主应用为独立本地 QQ 群聊助手，不依赖 DeepSeek Harness 或 OpenClaw 运行。仓库中的旧 DSH 集成仅为兼容代码。

## 独立版 TRAE 客户端协议适配

`standalone/server/trae.mjs` 中客户端协议字段、模型列表与流格式、账号积分响应解析，参考并改写自上述 MIT `vendor/channel-pack`（Copyright (c) 2026 Jet）。本项目保留原完整许可证 `vendor/channel-pack/LICENSE`。新适配不加载上游 DSH 宿主；没有移植上游的设备轮换或多账号池逻辑。

### Standalone account protocol subset

`standalone/server/vendor/channels.mjs` and `qoder-auth-wasm.wasm` derive from the repository's MIT-licensed `vendor/channel-pack/pack.js` snapshot, Copyright (c) 2026 Jet. The license is copied to `standalone/server/vendor/LICENSE`. The extraction script is `standalone/scripts/build-channels.mjs`; it does not mount the original host plugin, account pool, or gateway. Original bundled dependency notices are retained inline. Local value-type compatibility definitions and account/UI orchestration are independently implemented.


### Standalone QQ official transport

The standalone app now directly depends on `@tencent-connect/qqbot-nodejs` 1.0.4 (MIT), installed as an external npm dependency, for QQ Open Platform token exchange, signed Webhook dispatch and text replies. The dependency retains its LICENSE in its installed package. `@tencent-connect/qqbot-connector` 1.2.0 is also an external npm dependency for official QR binding; its metadata declares UNLICENSED. No connector implementation source is copied into the standalone app. `qrcode` 1.5.4 (MIT) generates QR PNGs locally. NapCat is an independently installed external service; no NapCat implementation is copied into this repository.
