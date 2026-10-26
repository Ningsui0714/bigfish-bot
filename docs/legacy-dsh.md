# 历史 DSH 插件说明（归档）

> 以下为旧版文档快照，不是 BigFish 当前安装入口或现行功能承诺。旧包名、RPC 路径与数据目录保留用于兼容；其中价格、额度、模型和厂商行为可能已经变化。当前独立版请从仓库根目录 README 开始。

# dsh-qq-free-bot

**一个不需要充值的 QQ 群聊机器人：接进 DeepSeek Harness，用免充值的 DeepSeek
模型选择性参与群聊、回答问题和执行任务。**

把 QQ 机器人接进 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，
并且让它只跑**官方免费额度**的 DeepSeek 模型 —— 不需要你给任何 API Key 充值。

```
QQ 私聊 / 普通群消息
          │
          ▼
QQ 渠道（扫码建机器人）──► 访问控制 / 群历史 / 会话队列
          ▲                              │
          │                              ▼
          └────── 答案 / 工具回传 ◄── Harness Agent ──► DeepSeek 免充值车道
```

---

## 它是什么

一个**单包** DSH 插件，装上就同时得到三样东西：

| 能力 | 来源 | 说明 |
| --- | --- | --- |
| **QQ 机器人** | [xmanrui/dsh-im](https://github.com/xmanrui/dsh-im) v5.4.0 | 手机 QQ 扫码建机器人、会话绑定、群历史、斜杠命令、审批流、图片与文件回传 |
| **群聊 Chatbot** | 本产品新增 | 普通群消息无需 `@`；机器人会选择时机自然接话，并保留命令边界和访问控制 |
| **免充值 DeepSeek** | 本产品新增 | 十一个官方账号渠道的免费额度 + 跨渠道自动降级 |

上游那两个插件原本是分开的、各自都能单独用。本产品把它们合成一个包，并在此
基础上新增群聊 Chatbot 与跨渠道自动降级；降级细节见下面「跨车道降级」。

## 免充值的原理

这里的“免充值”不是破解付费接口，也不是插件替你承担模型费用。它做的是：把不同
模型厂商**原本就发给用户账号的官方免费额度**接入同一个 DSH 模型入口，并在当前
渠道额度不足或暂时不可用时自动尝试下一条渠道。

完整链路如下：

```
登录厂商账号
    │
    ├─► 厂商官方签到积分 / 每日赠送 / 免费配额窗口
    │
    ▼
账号渠道包读取该账号当前可用的模型目录
    │
    ├─► 只保留 DeepSeek 家族模型
    │
    ▼
dsh-deepseek 按配置顺序调用第一条可用车道
    │
    ├─► 正文前失败：丢弃该次尝试，自动切换下一条
    └─► 已产出正文：视为本轮已提交，不重复切换
```

因此，用户不需要购买 DeepSeek 官方 API Key，也不需要向本插件充值。真正提供推理
资源的是各渠道面向其正常登录用户发放的免费权益：

| 免费权益来源 | 常见形式 | 插件如何使用 |
| --- | --- | --- |
| 每日赠送 | 每天恢复固定次数或积分 | 当天直接消费，用尽后尝试下一条车道 |
| 签到积分 | 登录后由厂商签到接口发放 | 使用渠道包的正常账号流程领取和消费 |
| 配额窗口 | 每几小时或每周恢复调用额度 | 等窗口恢复，期间由其它车道接替 |
| 新用户或活动权益 | 注册礼包、限时积分 | 只在账号确实拥有该权益时使用 |

账号授权仍走各厂商自己的 OAuth、设备码、短信或扫码流程；登录凭据保存在本机，由
对应渠道包请求厂商接口。本插件只负责统一模型目录和调度，不会生成免费额度。

### 为什么要多条车道

单个免费渠道通常有额度上限、登录有效期和服务波动。`dsh-deepseek` 把多个互相
独立的 provider 排成一条降级链：CodeArts 不可用时尝试 TRAE，TRAE 不可用时再
尝试 LobsterAI、ZCode、Cline 等已登录且当前提供 DeepSeek 的渠道。

切换发生在一次请求内部，QQ 侧不需要更换机器人或重新发送问题。只有“产出答案
正文”才算该车道已经接管本轮；思考增量、连接提示和失败信息都不算正文，所以不会
把半截失败内容发给群里再重复回答。

### 它没有做什么

- 不使用共享 API Key、管理员密钥或从其它软件提取的签名密钥；
- 不伪造官方客户端身份来领取限定给其它产品的额度；
- 不绕过登录、计费、配额或模型权限校验；
- 不承诺无限额度：全部渠道都耗尽时，需要等待额度恢复或重新登录；
- 可选的 Kilo 公共免费池只用于所有 DeepSeek 车道都失败后的兜底，其中不保证有
  DeepSeek，且默认关闭。

“免充值”解决的是**无需预存 API 余额**，不是“无限免费”或“永远在线”。建议登录
2～3 个以上渠道获得冗余，并留意各厂商的额度规则和数据政策。

### 实际成本

| 成本项 | 要花钱吗 |
| --- | --- |
| 模型推理 | ❌ 官方每日免费额度 / 签到积分 / 配额窗口 |
| DSH 内核 | ❌ 开源 |
| 本插件 | ❌ MIT |
| QQ 机器人 | ❌ QQ 开放平台个人开发者免费，无 API 计费 |
| 机器与网络 | ⚠️ 需要一台常开的机器 |

在全部模型调用都落到官方免费权益的前提下，实际开销主要是运行机器的电费和网费。

## 跨车道降级（本产品的核心）

免充值的现实是：**没有任何一个渠道能保证 24×7 可用**。

- CodeArts / Qoder / TRAE 的积分**按天重置**，今天领完明天才有；
- 讯飞 Loomy 的登录态**14 天**过期，要重新短信登录；
- 智谱 ZCode 的凭据**不可续期**，失效只能重新授权；
- Cline 的额度用完会返回 402（那时才需要充值）；
- 上游模型随时可能下线或临时 5xx。

账号渠道在 DSH 里是**各自独立**注册的 llm provider —— CodeArts 的积分领完了，
DSH 不会自动去问 TRAE 要模型。上游 `dsh-our-free-model` 的 combo（降级链）也
只在**同一个 adapter 的目录内**换模型，覆盖不到跨 provider 的情况。

所以本产品自己注册了一个 `dsh-deepseek` provider，它内部按车道清单依次尝试：

```
codearts/deepseek-v4.1-flash
  → trae/deepseek-v4.1-flash
    → lobsterai/deepseek-v4.1-flash
      → zcode/deepseek-v4.1-flash
        → cline/cline-free/deepseek-v4.1-flash
```

**切换判据是「有没有产出答案正文」**：

- 正文**之前**失败（额度用尽、登录过期、超时）→ 整段丢弃，换下一个车道，
  调用方**看不到任何痕迹**，包括那个车道已经吐出的思考增量；
- 正文**之后**失败 → 那是这一轮对话的正常结局，不切换。

这条规则与上游 combo 一致，因为它是对的：「想了很久才撞上配额墙」是免充值
场景里最常见、也最该切换的失效形态。

---

## 安装

### 环境要求

- Node.js `>= 22.19`；
- DeepSeek Harness `0.2.1-rc.2`；
- 一台能保持在线并连接 QQ WebSocket 的机器；
- 要接收未 `@` 的普通群消息，QQ 开放平台必须向机器人下发
  `GROUP_MESSAGE_CREATE` 事件。

### 命令行

```
dsh plugin --profile web add /绝对路径/dsh-qq-free-bot
```

装完重启一次应用。

> ⚠️ **不要通过 npm 安装。** npm 上的同名包不是本仓库发布的，内容与本仓库
> 不一致。请只使用本仓库的 Release 发布包，或本地源码目录。

### 手动安装（源码目录）

1. 在本仓库目录打包（不执行 npm 发布脚本）：

   ```bash
   npm pack --ignore-scripts --pack-destination "<DSH_HOME>/profiles/<profile>/vendor"
   ```

2. 在 `<DSH_HOME>/profiles/<profile>/package.json` 的 `dependencies` 里加入：

   ```json
   "dsh-qq-free-bot": "file:./vendor/dsh-qq-free-bot-<version>.tgz"
   ```

3. 在 `dsh.profile.bundles` 里加入 `"dsh-qq-free-bot"`。

---

## 配置

### 1. 接 QQ 机器人

DSH 设置 → **IM机器人** → **QQ**：

- **扫码建机器人**（推荐）：点「扫码创建机器人」，用手机 QQ 扫码。腾讯官方页面会
  帮你创建并绑定机器人，凭据直接交给本机 Harness —— **不需要手动填 AppID /
  AppSecret，也不需要 QQ 开放平台的开发者资质**。
- **手动绑定**：如果你已经有机器人，填入 `AppID` + `AppSecret`。

绑定完成后，机器人默认**允许所有人私聊和群聊**（可在「访问设置」里收紧成
白名单）。群聊 Chatbot 默认开启：普通群消息无需 `@` 就会触发回复，`/` 开头的
管理命令仍然必须显式 `@机器人`。

### 2. 登录免充值渠道

DSH 设置 → **QQ 机器人** → **免充值 DeepSeek** tab → **账号登录** → 逐个点「登录」。

每个渠道会打开官方授权页；授权完成后页面自动刷新，账号出现在下面。
至少登录 **2～3 个**不同渠道 —— 单渠道不保证 24×7 可用。

带 DeepSeek 的渠道及其积分机制：

| 渠道 | 登录方式 | 免费额度 |
| --- | --- | --- |
| **CodeArts**（华为云） | 浏览器 OAuth + PKCE | 每日签到领积分，`deepseek-v4.1-flash` 属 benefit（免费）集合 |
| **TRAE**（字节） | OAuth | 每日签到，按天重置 |
| **有道 LobsterAI** | Bearer | 每日签到三步（幂等） |
| **智谱 ZCode** | 官方 CLI 设备授权 | 签到补激活；**凭据静态、不可续期** |
| **Cline** | WorkOS 设备码 | 免费额度独立 id（`cline-free/…`）；**402 后需充值** |
| 讯飞 Loomy | 短信 / 微信 | 每日赠送池 + 永久积分；**14 天需重登** |
| 商汤 Raccoon | 微信扫码 | 注册礼包 + 每日自动发放 |
| MiniMax Code | OAuth 设备码 | 每日签到 |
| Gemini Code Assist | 浏览器 OAuth | **配额窗口**（5 小时 / 周窗口），非积分 |
| Qoder / Qoder 中国版 | OAuth | 每日领取，**领取后 30 天有效** |

> 建议至少登录 **2～3 个**不同渠道 —— 单渠道不保证 24×7 可用，多个才有冗余。

### 3. 选模型

模型选择器里会出现两个分组：

- **DeepSeek** —— DSH 内置的 DeepSeek 官方 API（需要你自己的 API Key，付费）。
- **DeepSeek（免充值 · 自动降级）** —— 本产品注册的 `dsh-deepseek` provider，
  里面是各账号渠道提供的免费 DeepSeek 模型。**选这里即可零成本。**

在 QQ 里用 `/models` 看当前可用模型，`/model <序号>` 切换。

---

## 设置界面

装好之后，DSH 设置里只有**一页**：**「QQ 机器人」**（侧边栏排在中间那一档）。

页面里有两个 tab，一个齿轮：

| tab | 能做什么 |
| --- | --- |
| **QQ** | 扫码创建机器人、手动绑定 AppID/AppSecret、访问白名单、工作区、会话与群历史、模型选择 |
| **免充值 DeepSeek** | 调车道优先顺序、启用/停用某条车道、开关免费兜底 |
| **⚙ 通用** | 群历史保留天数、图片输入限制、侧边栏显示等全局设置 |

> 一个插件，一页设置 —— 不需要在两个插件之间来回切。

### 「免充值 DeepSeek」这一页

| 区块 | 内容 |
| --- | --- |
| **账号渠道** | 渠道包状态（已挂载 / 复用其它插件的 / 加载失败）+ 在线渠道服务列表 |
| **账号登录** | 11 个渠道逐个登录：点「登录」打开官方授权页，授权完成后自动回到页面并刷新；已登录账号显示昵称，可删除 |
| **降级顺序** | 每条车道一行：序号、名称、`provider / model`、状态徽章、↑↓ 调序、● / ○ 启停 |
| **免费兜底** | 一个开关：所有 DeepSeek 车道都不可用时，是否用 Kilo 公共免费池兜底 |

**登录不需要装第二个插件。** 登录走渠道包自己的 `/api/channel-pack`
（`account.create` → 打开授权页 → 轮询 `login.poll`），本产品在设置页里直接
接上了这条链路。

改动**立即生效并落盘**到 `<DSH_HOME>/dsh-qq-free-bot/lanes.json`（权限 0600），
重启后保持。「恢复默认顺序」回到内置的五条 DeepSeek 车道。

状态徽章的含义：

- **可用** —— provider 已注册，渠道服务在线；
- **渠道未注册** —— 这个渠道的 llm provider 没挂上（通常意味着账号渠道包没加载）；
- **渠道未登录** —— provider 在，但对应渠道的 auth 服务不在（还没登录过）；
- **已停用** —— 你手动关掉了，不会参与降级。

> 徽章只报**结构可用性**（provider / 服务在不在）。真正的额度是否用完要等
> 调用时才知道 —— 而那正是降级链要处理的事。

## 在 QQ 里怎么用

### 最短验证路径

1. 私聊机器人发送「你好」，确认 QQ、Harness 和模型三段链路都正常；
2. 把机器人加入目标群，在群里发送一条不带 `@` 的普通文字；
3. 机器人应根据消息内容给出 1～3 句简短评价或自然回复；
4. 再发送 `/status`：未 `@` 时不会执行，`@机器人 /status` 才会执行命令。

### 消息与命令

| 命令 | 作用 |
| --- | --- |
| `/menu` | 打开按钮菜单（会话、工作区、模型、新会话、停止…） |
| `/models` | 列出可用模型（按 provider 分组） |
| `/model <序号>` | 切换模型 |
| `/new` | 开新会话 |
| `/stop` | 停止当前这一轮 |
| `/history` | 查看当前会话的历史 |
| `/permission` | 查看/切换权限档位 |
| 私聊任意文字 | 直接提问 |
| 群聊普通消息 | 无需 `@`，机器人会结合群聊上下文作简短评价或自然接话 |
| 群聊中 `@机器人` 后发文字 | 正常提问或补充明确指令 |
| 群聊中直接发送 `/命令` | 忽略，不把普通聊天误判为管理命令 |
| 群聊中 `@机器人 /命令` | 执行对应管理命令 |

机器人自己发送的消息不会再次触发回复，因此不会形成自回复循环。消息仍受「访问
设置」控制：关闭群聊访问或启用白名单后，Chatbot 不会绕过既有访问策略。

### 群聊参与：先听，再决定要不要说

普通群消息不再条条排给 DSH。QQ 侧增加了独立的 `QqGroupMind`：

1. 先做去重、机器人消息过滤和访问检查，再观察允许的消息。
2. 明确 `@` 或在句首叫“海鸥”时回应；仍保留原有斜杠命令和审批流程。
3. 路人闲聊默认旁听。兴趣话题有 25% 接话机会，公共问题为 12.5%；同一成员在机器人实际回复后的 90 秒内作明确延续时可接话。
4. 被动接话至少间隔 20 秒，每群每分钟最多尝试 2 次。正在处理消息、审批或提问时，普通消息只进入近期上下文，不堆进任务队列。
5. 复读、纯链接、低信息语气词和明确 `@` 其他人的消息不插话。即使通过规则，模型仍可输出沉默标记，由渠道吞掉，不发送给群。
6. 近期上下文有说话人和机器人自己的回复，最多 24 条、10 分钟；模型输入有额外长度上限。不同群不串用。

这是**本地规则决策 + 模型自然表达**的第一版，不是已经具备语义理解的完整 Planner。
人格指导让它平时像群友接话，明确交代任务时继续使用 DSH；“闲聊不调用工具”目前是提示词约束，**不是工具权限隔离**，实际权限仍由 DSH 管理。

### 人格与可控记忆

默认人格叫“海鸥”：有好奇心、能轻松吐槽、不假装真人经历，闲聊通常一两句，认真求助时正常回答。
可用 `guidance` 完整替换人格，用 `nicknames` 配置叫名。

| 群里说的话（或明确 @ 机器人后说） | 效果 |
| --- | --- |
| `海鸥，安静` | 停止被动插话 30 分钟；明确 @ 仍可提问，已生成但尚未发送的被动回复也会拦截 |
| `海鸥，可以说话了` | 提前解除静音 |
| `海鸥，记住：我喜欢乌龙茶` | 保存本人明确要求记住的笔记，不自动推断身份画像 |
| `海鸥，你记得我什么` | 查看自己在本群的笔记 |
| `海鸥，忘记我` | 删除自己在本群的笔记和本地近期上下文 |

笔记保存在原有 QQ state 文件中，随机器人实例隔离，再按群和成员隔离；每人每群最多 8 条，实例最多 256 条，30 天后不再召回，后续写入时清理过期项。基础敏感关键词会阻止保存凭据，但不是完整的敏感信息检测。
聊天和笔记作为**数据上下文**注入，不拼成人格指令。`忘记我` 不会删除 DSH 已有会话、模型供应商记录或独立群历史；需要彻底移除历史时还要清理相应存储。

### 配置群聊 Chatbot

在插件 bundle 的 `config` 中配置，修改后重启插件或 DSH：

```yaml
config:
  qq:
    groupChatbot:
      enabled: true
      nicknames: [海鸥, 小鸥]
      interests: [游戏, 电影, 音乐, 编程]
      replyProbability: 0.25  # 0 关闭随机插话，保留叫名和短时对话延续
      cooldownMs: 20000
      followupMs: 90000
      maxRepliesPerMinute: 2
      muteMs: 1800000
      memoryEnabled: true
      # guidance: 自定义完整人格；不填使用内置人格
```

`groupChatbot: false` 恢复群聊仅 @ 触发，不启用新参与/记忆层；已有笔记不会自动删除。
`memoryEnabled: false` 关闭新笔记保存和模型召回，仍允许本人查看/删除已有笔记。
`guidance: ""` 关闭额外人格指导。静音、短时接话状态和近期窗口仅存内存，重启重置；明确笔记才持久化。
状态中的 `lastParticipation` 记录最近一次决策原因（不含消息正文），便于排查为什么说话或安静。

设计参考了群聊 bot 的人格、参与节奏和分域记忆思路；调研与本次实现边界见 `docs/group-agent.md`。


### QQ 事件权限

代码开启 Chatbot 不代表 QQ 平台一定会投递普通群消息。两类事件的区别是：

| QQ 事件 | 插件能收到什么 | 实际效果 |
| --- | --- | --- |
| `GROUP_MESSAGE_CREATE` | 未 `@` 的普通群消息 | Chatbot 可自动评价或接话 |
| `GROUP_AT_MESSAGE_CREATE` | 只收到 `@机器人` 的消息 | 群聊仍需 `@` |

如果私聊和 `@机器人` 都正常，但普通群消息没有任何反应，优先检查 QQ 开放平台的
事件订阅/机器人权限，并确认实际收到的事件类型是否为 `GROUP_MESSAGE_CREATE`。
这种表现通常发生在平台没有投递普通群消息时，与提示词或模型车道无关。

---

## 合规说明

这一节请认真读。

### 本产品**不做**的事

上游 `dsh-our-free-model` 曾经有两条免 Key 车道，本产品**没有**内联它们：

1. **匿名免费车道**（`opencode.ai`）—— 需要把 User-Agent 伪造成官方 CLI、把
   `read` / `shell` 工具定义逐字伪造、并铸造特定编码的 session id 才能拿到
   免费额度。上游的原话是 *"OpenCode's free tier can only be used from within
   OpenCode"* —— 伪装身份去拿额度与上游声明的意图相悖，而且实测该车道已对外
   全量拒绝（403 FreeTierError）。
2. **EAC 协付车道** —— 依赖从 seal 包里提取共享签名密钥。

**上游自己已经把这两条车道下线了**（`src/catalog.js` 的 `isDisabledLaneEntry`，
理由分别是 *"requires impersonating the official client fingerprint"* 与
*"depends on extracted seal credentials"*）。本产品继承这个判断：这两条车道
既不出现在代码里，也不出现在文档里。

### 本产品**做**的事

- 只用**厂商官方开放的免费额度**：官方签到积分、官方每日赠送、官方配额窗口、
  以及官方明确标注 `isFree: true` 且「no credits required」的公共免费池。
- 每个渠道都是**正常登录**换额度，不绕过任何一家的授权机制。
- 不伪造任何客户端身份。本插件的 User-Agent 是 `dsh-qq-free-bot/<version>`。

### 数据

- 你的 prompt 与工具结果会作为**普通推理请求**发给你所选模型对应的上游 ——
  与调用任何模型 API 完全相同。
- **Kilo 免费池**（若开启兜底车道）明确声明 prompt 可能被上游记录并用于改进
  服务；该池里也**没有 DeepSeek**，只作 DeepSeek 全挂时的兜底。
- 本插件自身不上传任何数据；设置、凭据、用量统计都只落在本机。
- ⚠️ **不要通过免费车道发送密码、密钥、身份信息或商业机密。**

### 与上游的关系

- 本插件是 **DeepSeek Harness** 的独立集成，与腾讯、华为云、字节跳动、有道、
  智谱、讯飞、商汤、MiniMax、Google、Kilo AI 等厂商无隶属、认可或赞助关系。
- QQ 是腾讯公司的商标。产品名称与标识归各自所有者所有。

### 借鉴与致谢

本产品的 QQ 渠道部分**借鉴并内联**了
[dsh-im](https://github.com/xmanrui/dsh-im)（MIT）的实现 —— 扫码建机器人、
WebSocket 长连接、会话绑定、群历史、斜杠命令、审批流、图片与文件回传，这些
工作都是上游作者做的。模型侧的通用出网代码与账号渠道包来自
[dsh-our-free-model](https://github.com/Ebony-Vinyl/dsh-our-free-model)（MIT）。

本产品在上游基础上做了三件事，而不是重新发明一遍：

1. **合并**成一个插件、一页设置（上游是两个独立插件、两页设置）；
2. **裁掉** 13 个 IM 渠道，只保留 QQ；
3. **新增**跨 provider 的 DeepSeek 降级链、免充值模型目录与兜底车道。

界面上不展示上游的品牌名与仓库链接（用户装的是本产品）；出处与许可证仍完整
保留在 `THIRD_PARTY_NOTICES.md` 与两个 `LICENSE.upstream-*` 文件里。

---

## 架构

```
plugin-src/host/index.mjs        宿主入口（照上游 dsh-im 的装配结构，只留 QQ）
plugin-src/host/model-lane.mjs   模型车道装配（账号渠道包 + 降级 provider）
plugin-src/client/               浏览器设置页（QQ 面板 + 模型面板所在的同一页）
src/channels/qq/                 QQ 渠道（来自 dsh-im）
  ├── qq-mention.mjs             @ 判定与普通群消息的 Chatbot 触发规则
  ├── qq-runtime.mjs             QQ WebSocket、中间件与访问控制入口
  ├── qq-bridge.mjs              会话队列、上下文注入与回复投递
  └── state-store.mjs            队列和被动触发状态持久化
src/channels/shared/             跨渠道共享层（来自 dsh-im，已裁剪到只剩 QQ）
src/model/                       Kilo 免费池客户端 + 通用 HTTP/流工具（来自 dsh-our-free-model）
src/product/                     本产品自己写的代码
  ├── deepseek-filter.js         DeepSeek 家族判定
  ├── lane-fallback.js           跨车道降级（提交规则在此）
  ├── deepseek-adapter.js        dsh-deepseek provider
  ├── kilo-adapter.js            免费兜底车道（可选，默认关）
  ├── lane-config.js             车道配置的持久化
  ├── lane-rpc-shared.js         RPC 契约（宿主与浏览器共用）
  ├── net-base.js                中性的出网基座（无指纹伪装）
  └── client/
      ├── entry.js               浏览器半身入口（上游 QQ 面板 + 本产品设置页）
      ├── deepseek-settings.js   「免充值 DeepSeek」设置页
      └── lane-rpc-client.js     浏览器侧 RPC 调用
vendor/channel-pack/             十一个账号渠道包（来自 dsh-our-free-model）
scripts/migrate.mjs              从上游同步代码的迁移脚本
```

### 与上游同步

`scripts/migrate.mjs` 把两个上游仓库的代码搬进来并**确定性地裁剪**：

- 拷贝 —— 原样搬运上游文件；
- 裁剪 —— 每一处改动都写在脚本里（19 处），带 `[dsh-qq-free-bot] 裁剪` 注释。

上游更新后重跑一次脚本即可同步，冲突只需要在脚本里解决一次：

```bash
node scripts/migrate.mjs --dsh-im ../dsh-im --ofm ../dsh-our-free-model
node scripts/verify-imports.mjs   # 检查所有相对 import 都能解析
npm test                           # 核心逻辑测试
npm run build                      # 打包 host + client
```

## 开发

```bash
npm install
npm run migrate    # 从上游同步代码（会重建 src/channels 与 src/model）
npm run verify     # 静态 import 解析检查 + client bundle 运行时检查
npm test           # 单元测试
npm run build      # 构建 lib/index.js 与 lib/client.js
npm run check      # build + verify + test
```

### 测试覆盖

- `test/model.test.mjs` —— DeepSeek 家族判定、跨车道降级（提交规则、切换时机、
  错误传播、异步流、失败车道的内容不泄漏）
- `test/lane-config.test.mjs` —— 配置规范化、持久化、坏文件恢复、自指保护、
  目录按可用性过滤
- `test/host.test.mjs` —— 模型车道注册、DeepSeek-only 目录契约、清理
- `test/qq-group-chatbot.test.mjs` —— 普通群消息触发、`/` 命令边界、关闭开关、
  自身消息防循环、提示词注入与排队恢复

`npm run verify` 还会做两件单测覆盖不到的事：

1. **静态 import 解析**（`scripts/verify-imports.mjs`）—— 裁剪代码最容易留下
   指向已删文件的 import；
2. **client bundle 运行时检查**（`scripts/verify-client.mjs`）—— 在一个最小的
   DOM + React 桩里真正执行浏览器 bundle 并调用 `apply()`，验证设置区注册成功。
   静态分析抓不到「删了 import 却留下用法」，这一步能。

## 许可证

MIT —— 见 [LICENSE](LICENSE)。

内联的上游代码与第三方依赖的出处见
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
