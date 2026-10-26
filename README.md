<div align="center">
  <img src="standalone/public/bigfish-maid.png" alt="大肥鱼：抱着饭碗的蓝色鲸尾女仆吉祥物" width="180">
  <h1>大肥鱼 · BigFish</h1>
  <p><strong>一键白嫖模型，让大肥鱼进群唠嗑。</strong></p>
  <p>账号授权接入 · 自动签到攒额度 · 同款模型自动选渠道 · QQ 自然群聊</p>
</div>

把散落在不同厂商账号里的免费额度、签到积分和活动权益，用在同一个聊天入口里。

**登录账号、选好模型，剩下交给大肥鱼。** 支持签到的渠道可以每天自动领取；同款模型跨厂商合并，聊天时自动选择可用渠道。再接上 QQ，她就能在群里接梗、聊天、记住你交代的小事。

## 白嫖这件事，帮你省掉哪些麻烦？

| 以前 | 用大肥鱼 |
| --- | --- |
| 额度散在各个客户端里 | 多厂商账号集中管理，在一个界面看账号、额度和模型。 |
| 天天打开客户端找签到 | 开启自动签到，应用运行时按天检查和领取。 |
| 同一个模型被厂商名、日期后缀分成一长串 | 合并成一个模型选项，实际调用保留各渠道原始 ID。 |
| 一个渠道用不了，就得手动换配置 | 同款模型有多个可用渠道时，符合切换条件就自动接替。 |
| 每次接入都要抄 Key、配接口 | 内置浏览器授权、设备码和扫码入口，按厂商流程完成登录。 |
| 模型只躺在网页里 | 官方 QQ Bot 扫码或 NapCat 接入，把额度用到群聊里。 |

### 已接入的账号渠道

**TRAE · 字节跳动**、**CodeArts · 华为云**、**LobsterAI · 网易有道**、**ZCode · 智谱**、**Cline**、**Loomy · 科大讯飞**、**Raccoon · 商汤科技**、**MiniMax Code**、**Gemini Code Assist**、**Qoder / Qoder 中国版**。

账号用下拉框切换，当前选谁就展示谁；聊天模型在上方统一选择。

例如多个渠道里的 `DeepSeek V4.1 Flash` 和同版本日期别名，会合成一个选择项。选好一次，后台处理渠道差异。不同代际、Flash、Pro 和预览版仍各自保留。

白嫖使用各渠道账号已有的免费额度、签到积分和活动权益；使用付费账号或自填 API 时，按对应服务方案计费。

## 三步开聊

### 1. 启动大肥鱼

准备 **Node.js ≥ 22.19** 和 npm：

```sh
git clone https://github.com/Ningsui0714/bigfish-bot.git
cd bigfish-bot
npm --prefix standalone ci
npm run build
npm start
```

打开 **http://127.0.0.1:3210**。主应用独立运行，直接在本地界面配置。

### 2. 登录账号，拿好模型

进入 **模型账号** → 选择厂商 → 点击登录并完成授权 → 获取模型列表。

在统一模型列表里选一个喜欢的模型，保存设置。支持每日签到的渠道勾上 **每天自动签到**，大肥鱼运行期间会按上海自然日检查。也能手动点“今日签到”和“查询额度”。

先到 **互动实验室** 聊两句，看看她的语气，再接 QQ。

### 3. 把大肥鱼拉进 QQ

| 接入方式 | 怎么连 |
| --- | --- |
| **官方 QQ Bot** | 点击“获取 QQ 绑定二维码”，用手机 QQ 扫码确认，自动保存凭据并通过 WebSocket 直连。 |
| **NapCat / OneBot 11** | 在 NapCat 登录 QQ，开启正向 WebSocket、选择数组消息格式；在大肥鱼填入地址和 Access Token。 |

填好允许的群 / 联系人并连接，就可以开聊。官方 Bot 使用 OpenID，NapCat 使用 QQ 群号和 QQ 号；收到会话标识后，也能直接点“加入白名单”。

扫码和群聊设置见 [QQ 接入说明](standalone/QQ.md)。

## 白嫖来的模型，也得聊得像个群友

大肥鱼是蓝发、鲸尾、抱着饭碗发呆的小女仆。呆一点，贪吃一点，有自己的兴趣，也懂得给别人留说话的空隙。

- **叫她就回应**：明确 @、句首叫名、刚才还在聊的话题，都能接上。
- **有兴趣才插话**：兴趣话题、公共问题和普通闲聊走不同的接话判断。
- **会安静**：有冷却、复读过滤和每分钟被动回复预算，模型也可以选择旁听。
- **记得住你交代的事**：显式记忆按群和成员保存，可在界面查看和删除。
- **人设随你调**：昵称、语气、兴趣、接话概率和安静时间都能改。

```text
大肥鱼，电影结尾你怎么看？
大肥鱼，安静
大肥鱼，可以说话了
大肥鱼，记住：我喜欢乌龙茶
大肥鱼，你记得我什么
大肥鱼，忘记我
```

## 本地运行，账号留在自己手里

设置、凭据和记忆保存在 `standalone/data/`，使用 AES-256-GCM 加密。备份时一起保存 `state.enc` 和 `local.key`；这个目录已从 Git 排除。

管理端口默认只监听本机。需要改端口或数据位置时：

```sh
PORT=3212 npm start
BIGFISH_DATA_DIR=/absolute/path/to/bigfish-data npm start
```

模型账号、接话决策、人格和记忆都由大肥鱼自己的服务管理，运行不依赖 DSH 或 OpenClaw。自己的兼容 API 也可在高级配置里接入。

## 开发

```sh
npm run local:check               # 前端构建 + 独立版测试
npm --prefix standalone run dev   # 监视前端重建
npm start                        # 另开终端运行后端
```

```text
standalone/ui/             本地控制台
standalone/server/         账号、签到、模型路由与 QQ 连接
standalone/public/         大肥鱼吉祥物与品牌标识
standalone/test/           自动化测试
src/channels/qq/           群聊决策与兼容代码
```

完整工程检查：根目录 `npm ci` 后运行 `npm run check`。当前包含 76 项独立版测试和 62 项兼容测试。

## 更多说明

- [运行与备份](standalone/README.md)
- [账号接入与模型归并](standalone/ACCOUNTS.md)
- [QQ 扫码与 NapCat](standalone/QQ.md)
- [TRAE 适配记录](standalone/TRAE.md)
- [品牌素材](docs/brand.md)
- [历史 DSH 插件归档](docs/legacy-dsh.md)

## 开源与致谢

项目自有代码采用 [MIT](LICENSE)。第三方代码、SDK 和协议适配的来源与许可见 [第三方声明](THIRD_PARTY_NOTICES.md)。QQ、DeepSeek 与各厂商商标归各自所有者所有；大肥鱼吉祥物为同人式设计。
