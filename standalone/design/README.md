# 大肥鱼视觉设计与验证

## 用户指定的变化

1. 独立本地应用，替换 DSH 主链路。
2. 产品名“大肥鱼”，不叫海鸥。
3. 整体蓝色。
4. 参考社区 DeepSeek 拟人元素：蓝发、鲸尾、蓝白女仆。
5. 拒绝成熟御姐形象，改为呆萌、小小一只、抱饭碗发呆的 Q 版吉祥物。
6. 碗和围裙上的星形标记改为 DeepSeek 应用的蓝色鲸鱼图标。

最终角色文件为 `public/bigfish-maid.png`，透明 PNG；由内置 ImageGen 生成，再按用户要求做两次局部/造型编辑。旧角色归档在 `design/archive/`，不会被界面引用。角色属于同人设计，不是 DeepSeek 官方角色或官方授权产品标记。

## 生成提示词摘要

UI：完整本地 QQ chatbot 控制台，左导航、中央聊天、右侧决策/链路；白色背景、皇家蓝 #2864E8、海军蓝 #152744、浅蓝 #EDF3FF，无营销页和虚构指标。蓝色概念图为 `concept-blue.png`。

角色：super-deformed 2.3-heads-tall chibi blue whale maid, huge round head, tiny plump body, mitten hands, blank round eyes, small o mouth, messy cobalt hair and ahoge, oversized loose high-neck long-sleeved blue/white maid dress, leggings/round shoes, huge pudgy whale tail, seated holding rice bowl, grain of rice on cheek, wholesome funny innocent expression, transparent background。最终编辑仅将碗和围裙的两个星形标记替换为 DeepSeek 蓝鲸图标，其余保持一致。

## UI 对照核验

使用 Codex 内置浏览器，不需要 Playwright 回退。实际桌面视口 1280×720、实际窄屏视口 425×664；概念原图 1505×1045，内置浏览器未提供可设置视口能力，因此未声称逐像素原尺寸复刻。

检查点：
- 信息架构：五个导航、聊天/决策/链路的双栏布局一致。
- 配色：蓝色主操作、浅蓝选中态、深蓝文字和白色背景。
- 文案：首屏标题、说明、空状态、发送、群消息开关一致；产品名按用户指定替换。
- 图像：按用户追加要求，用 Q 版女仆替换概念里的鲸鱼 logo / 空状态气泡，属于明确接受的变更。
- 排版：主标题、次级标题、辅助说明、表单标签有明确层级；表单不依赖浏览器默认字体。
- 小高度修复：1280×720 下最初右栏配置入口被挤出，已调整决策区高度和链路间距。
- 窄屏：导航变顶部条，右侧检查器隐藏，聊天输入可用，长表格横向滚动，不挤压主内容。

功能检查：配置编辑后保存显示成功；重载仍可读取；实验室“记住”写入真实本地笔记，记忆页可见对应 `lab:playground / local-user`。真实模型和真实 QQ 账号尚未接入，未将协议测试当作线上验证。

不宣称“10/10 已经原样复刻”：角色、移动适配和小高度布局是用户需求/实现约束下的有意变化。最终静态视图已检查上述要点。
