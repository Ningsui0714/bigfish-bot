# 大肥鱼 / BigFish

- 中文产品名：**大肥鱼**。
- 英文品牌：**BigFish**；代码和仓库标识：`bigfish-bot`。
- 本地应用包：`bigfish-bot-local`，当前版本 `0.2.0`。
- 品牌蓝：`#2864E8`；深色文字：`#152744`；浅蓝背景：`#EDF3FF`。
- 图形标记：`standalone/public/brand-mark.svg`，本项目独立绘制的鱼形 favicon，不是模型厂商图标。
- 吉祥物：`standalone/public/bigfish-maid.png`，蓝发、鲸尾、抱饭碗的呆萌 Q 版女仆。保留已有角色，不重新改成成熟风格。

吉祥物为同人式设计，其中 DeepSeek 鲸鱼元素属于其各自权利人，不代表官方角色或授权合作。品牌标识不改变第三方代码的版权与许可证。

## 兼容边界

不对上游版权声明、旧 DSH RPC 路径、旧配置目录、模块加载 ID 或环境变量做机械全局替换。旧协议标识中的 `dsh-qq-free-bot` 是兼容键，不再是对外产品名。旧文档移至 `docs/legacy-dsh.md`。

本机工作目录不随 GitHub 仓库改名搬迁，以免打断现有服务和数据路径；新克隆目录为 `bigfish-bot`。用户加密数据、设备身份、登录状态和记忆不因改名迁移或重置。
