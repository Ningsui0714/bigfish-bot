/**
 * 迁移脚本 —— 从两个上游仓库提取代码到本产品。
 *
 *     node scripts/migrate.mjs [--dsh-im <path>] [--ofm <path>]
 *
 * 为什么是脚本而不是手工拷贝：上游会持续更新（dsh-im 每周都有提交），手工拷贝
 * 之后无法判断"哪些是本产品自己改的、哪些是从上游同步来的"。脚本把「拷贝」与
 * 「裁剪」分开：
 *
 *   1. 拷贝 —— 原样搬运上游文件，保留上游目录结构；
 *   2. 裁剪 —— 对搬运过来的文件做确定性的改写（渠道白名单收敛、import 裁剪、
 *      i18n 聚合收敛），每一处都写进 PATCHES 里，可审计。
 *
 * 第 2 步的全部改动集中在本文件，冲突时（上游改了被裁剪的那几行）只需要在这里
 * 解决一次，而不是散落在几百个文件里。
 *
 * 幂等：重复运行会先清空 vendor/ 与 src/ 的生成物再重建。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
function argValue(flag, fallback) {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? path.resolve(args[index + 1]) : fallback;
}

const DSH_IM = argValue('--dsh-im', path.resolve(ROOT, '..', 'dsh-im'));
const OFM = argValue('--ofm', path.resolve(ROOT, '..', 'dsh-our-free-model'));

const SRC = path.join(ROOT, 'src');
const PLUGIN_SRC = path.join(ROOT, 'plugin-src');
const VENDOR = path.join(ROOT, 'vendor');

/**
 * 本产品自己写的源码目录 —— **不参与**迁移脚本的重建。
 *
 * `src/channels/**` 与 `src/model/**` 是从上游搬来的（每次迁移重新生成），
 * `src/product/**` 是本产品自己的实现（手写、长期维护）。两者必须分开，
 * 否则迁移脚本的清理步骤会把手写代码一起删掉。
 */
const PRODUCT_SRC = path.join(SRC, 'product');

/* ------------------------------------------------------------------ utils */

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function copyFile(from, to) {
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
}

function copyDir(from, to, filter = () => true) {
  if (!fs.existsSync(from)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(source, target, filter);
    } else if (entry.isFile() && filter(source)) {
      copyFile(source, target);
      count += 1;
    }
  }
  return count;
}

/** Read a file, apply `mutate` to its text, write it back. */
function rewrite(file, mutate) {
  const absolute = path.join(ROOT, file);
  const before = fs.readFileSync(absolute, 'utf8');
  const after = mutate(before);
  if (after === before) return false;
  fs.writeFileSync(absolute, after, 'utf8');
  return true;
}

/** Drop whole files whose path matches `pattern`. */
function drop(relativeDir, pattern) {
  const base = path.join(ROOT, relativeDir);
  if (!fs.existsSync(base)) return [];
  const removed = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(target);
      } else if (pattern.test(path.relative(base, target))) {
        fs.rmSync(target, { force: true });
        removed.push(path.relative(ROOT, target));
      }
    }
  };
  walk(base);
  return removed;
}

/**
 * `plugin-src/host/` 下由本产品手写、迁移脚本不重建的文件。
 *
 * 入口（`index.mjs`）与模型车道装配（`model-lane.mjs`）是本产品的核心代码，
 * 长期手工维护；其余 `plugin-src/host/**` 都是从上游搬来的，每次迁移重建。
 */
const HANDWRITTEN_HOST_FILES = new Set([
  'index.mjs',
  'model-lane.mjs',
  'model-lane-rpc.mjs',
  'json-rpc.mjs',
]);

/* ------------------------------------------------------------------- step 1 */

// 清理上一轮的迁移产物。⚠️ 只删迁移生成的东西 —— `src/product/**` 与
// `plugin-src/host/index.mjs`、`plugin-src/host/model-lane.mjs` 是本产品自己
// 写的代码，不能被清掉。
rmrf(path.join(SRC, 'channels'));
rmrf(path.join(SRC, 'model'));
rmrf(path.join(PLUGIN_SRC, 'client'));
rmrf(VENDOR);

// `plugin-src/host/` 下从上游搬来的文件要重建，但本产品手写的两个入口要留下。
{
  const hostDir = path.join(PLUGIN_SRC, 'host');
  if (fs.existsSync(hostDir)) {
    for (const entry of fs.readdirSync(hostDir)) {
      if (HANDWRITTEN_HOST_FILES.has(entry)) continue;
      rmrf(path.join(hostDir, entry));
    }
  }
}

console.log('== 1. 拷贝 dsh-im 的 QQ 渠道 ==');

// 1a. QQ 专属渠道目录
copyDir(path.join(DSH_IM, 'src', 'channels', 'qq'), path.join(SRC, 'channels', 'qq'));
copyDir(path.join(DSH_IM, 'plugin-src', 'host', 'channels', 'qq'), path.join(PLUGIN_SRC, 'host', 'channels', 'qq'));

// 1b. 共享层：QQ 依赖 src/channels/shared/ 里的绝大部分，整体搬过来再裁剪。
copyDir(path.join(DSH_IM, 'src', 'channels', 'shared'), path.join(SRC, 'channels', 'shared'));
copyDir(path.join(DSH_IM, 'plugin-src', 'host', 'channels', 'shared'), path.join(PLUGIN_SRC, 'host', 'channels', 'shared'));

// 1c. 宿主通用基础设施（群历史、投递、Harness 客户端、语言镜像、更新…）
//
// ⚠️ `management-rpc.mjs` 与上游一样放在 `plugin-src/` 根，不在 `plugin-src/host/`
// 里 —— 上游的引用方（`plugin-src/host/channels/*/rpc.mjs`）用的是
// `../../../management-rpc.mjs`，client 侧用的是 `../management-rpc.mjs`，两边
// 都指向 `plugin-src/` 根。放错位置会让全部 RPC 路由在加载时崩掉。
copyFile(
  path.join(DSH_IM, 'plugin-src', 'management-rpc.mjs'),
  path.join(PLUGIN_SRC, 'management-rpc.mjs'),
);

for (const file of [
  'host-language-rpc.mjs',
  'host-language.mjs',
  'delivery-adapter.mjs',
  'delivery-http.mjs',
  'delivery-rpc.mjs',
  'delivery-service.mjs',
  'delivery-suggestions.mjs',
  'ds-bot-client.mjs',
  'group-history-rpc.mjs',
  'group-history-runtime.mjs',
  'harness-command-executor.mjs',
  'harness-connection.mjs',
  'harness-peer.mjs',
  'harness-session-coordinator.mjs',
  'image-input-rpc.mjs',
  'inbound-ttl-rpc.mjs',
  'inbound-ttl-runtime.mjs',
  'inbound-ttl-service.mjs',
  'injected-context.mjs',
  'lark-sdk-handshake-patch.mjs',
  'modern-harness-api.mjs',
  'rpc-authority.mjs',
  'session-sync-coordinator.mjs',
  'session-title-prefix.mjs',
  'sidebar-settings.mjs',
  'update-rpc.mjs',
  'update-runtime.mjs',
  'update-service.mjs',
]) {
  const from = path.join(DSH_IM, 'plugin-src', 'host', file);
  // 宿主基础设施拷进 `src/product/host/`：它们是从上游搬来的（可重建），
  // 但和本产品自己写的入口放在同一层，import 路径短、来源清楚。
  if (fs.existsSync(from)) copyFile(from, path.join(PLUGIN_SRC, 'host', file));
}

// 1d. 客户端侧。
//
// 注意目标路径：上游的 client 源码在 `plugin-src/client/`，本产品保持同样的层级
// （`plugin-src/client/`），因为 client 内部有 `../../` 形式的相对 import ——
// 平铺会让这些路径全部指错地方。
const CLIENT_SRC = path.join(DSH_IM, 'plugin-src', 'client');
const CLIENT_DST = path.join(PLUGIN_SRC, 'client');
copyDir(CLIENT_SRC, CLIENT_DST, (source) => {
  const relative = path.relative(CLIENT_SRC, source);
  // 其它渠道的客户端目录整个排除。
  if (relative.startsWith('channels' + path.sep)) {
    const channel = relative.split(path.sep)[1];
    if (channel !== 'qq' && channel !== 'shared') return false;
  }
  return true;
});
// QQ 客户端复用了 dingtalk 的基础 CSS（.ddt-* 类），一并带走并在裁剪阶段改名。
copyFile(
  path.join(DSH_IM, 'plugin-src', 'client', 'channels', 'dingtalk', 'styles.js'),
  path.join(CLIENT_DST, 'channels', 'shared', 'base-styles.js'),
);
// 共享客户端组件（collapsible-account 等）—— QQ 客户端会用到。
copyDir(
  path.join(DSH_IM, 'plugin-src', 'client', 'channels', 'shared'),
  path.join(CLIENT_DST, 'channels', 'shared'),
);
// 客户端的构建脚本。它是入口，不参与「可达性」判定（可达性从 index.js 出发，
// 而构建脚本不被 index.js import），所以在可达性清理之后会被误删 —— 这里
// 提前放好，后面的裁剪步骤再改它的模块加载 id。
copyFile(
  path.join(DSH_IM, 'plugin-src', 'client', 'build.mjs'),
  path.join(CLIENT_DST, 'build.mjs'),
);
// QQ 客户端的 i18n 依赖 src/channels/shared/i18n-en/ —— 已在 1b 一起搬来。

console.log('== 2. 拷贝 dsh-our-free-model 的模型车道 ==');

// 2a. Host 半身：模型侧核心。
//
// ⚠️ 这里**不是**照搬上游的模型侧。上游 `src/adapter.js` + `src/core/runtime.js`
// 是一条面向「通用免费聚合」的完整实现：它同时维护免 Key 免账号车道（需伪装
// 官方客户端指纹）、EAC 协付车道（依赖 seal 凭据）、聚合车道（用户自备 Key）、
// combo 降级链、本地 OpenAI 网关、公告中心、自更新、用量看板。
//
// 本产品只需要其中两块，并且诉求都不同：
//
//   - **Kilo 兜底车道** —— 官方标注 `isFree: true` 的公共免费池，不需要伪装；
//   - **通用 HTTP/流工具** —— SSE 嗅探、头回放、失败分类，是两百行经过实战
//     检验的代码，值得留用。
//
// 所以这里只搬 `kilo.js` / `http.js` / `egress.js` 三件（Kilo 的完整依赖链），
// 其余模型侧文件由本产品自己实现（见 `src/model/deepseek-adapter.js` 与
// `src/model/kilo-adapter.js`）。
//
// 上游那两条需要「伪装/绕过」的车道**不搬** —— 一是上游条款不允许，二是实测
// 已对外全量拒绝，三是它们与「只提供 DeepSeek」的产品契约无关。
for (const file of [
  'egress.js',
  'failure.js',
  'http.js',
  'kilo.js',
]) {
  const from = path.join(OFM, 'src', file);
  if (!fs.existsSync(from)) continue;
  copyFile(from, path.join(SRC, 'model', file));
}

// 2b. 账号渠道包（预构建 bundle + WASM）。只有 pack.js 与 wasm 是运行期必需。
ensureDir(path.join(VENDOR, 'channel-pack'));
for (const file of ['pack.js', 'qoder-auth-wasm.wasm', 'NOTICE.md', 'LICENSE']) {
  const from = path.join(OFM, 'vendor', 'channel-pack', file);
  if (fs.existsSync(from)) copyFile(from, path.join(VENDOR, 'channel-pack', file));
}

/* ------------------------------------------------------------------- step 3 */

console.log('== 3. 裁剪：只保留 QQ 渠道 ==');

const PATCHES = [];

/**
 * 所有上游已知的 IM 渠道名。裁剪时用于识别常量里的渠道条目。
 *
 * 名单来自上游 `src/channels/` 下的目录名 + 复合渠道名（`wecom-app`）。
 */
const ALL_CHANNELS = [
  'weixin', 'feishu', 'dingtalk', 'wecom', 'wecom-app', 'qq',
  'slack', 'telegram', 'discord', 'whatsapp', 'imessage', 'email',
  'matrix', 'office',
];

/**
 * 裁剪一张渠道白名单常量。
 *
 * 上游把这些渠道名散落在若干个 `Set` / `Object.freeze([...])` 里 —— 是**数据**
 * 耦合而非**结构**耦合，所以裁剪只是把集合里的渠道名换成单个 `qq`，不需要重构
 * 抽象层。
 *
 * 做法是**整块重写**：取出常量体里的渠道名，只留下 `qq`，再按上游的容器类型
 * （`new Set([...])` / `Object.freeze([...])`）重新生成整个声明。
 *
 * 为什么不逐个删名字：上游这些数组的排版各不相同（单行、多行、带缩进），
 * 逐个删会留下空洞逗号和空行；整块重写则永远得到同样形状的干净结果。
 *
 * @param {string} file  相对产品根的文件路径
 * @param {RegExp} decl  匹配常量声明（含左括号）的正则
 * @param {string} name  常量名，用于报错定位
 * @param {'set'|'frozen'} kind  容器类型
 */
function narrowChannelSet(file, decl, name, kind) {
  PATCHES.push(`${file} :: ${name}`);
  return rewrite(file, (text) => {
    const match = text.match(decl);
    if (!match) throw new Error(`裁剪失败：${file} 里找不到 ${name} 的声明`);
    const start = match.index + match[0].length;
    // 从左括号往后找配对的右括号，取出常量体。
    let depth = 1;
    let end = start;
    while (end < text.length && depth > 0) {
      if (text[end] === '(') depth += 1;
      else if (text[end] === ')') depth -= 1;
      end += 1;
    }
    const body = text.slice(start, end - 1);
    const names = [...body.matchAll(/['"]([a-z-]+)['"]/g)].map((entry) => entry[1]);
    if (!names.includes('qq')) {
      throw new Error(`裁剪失败：${file} 的 ${name} 里没有 qq，渠道名是 ${names.join(',')}`);
    }
    const other = names.filter((entry) => entry !== 'qq');
    // decl 里的正则已经吃掉了容器名与左括号，所以这里只补元素与右括号。
    const rebuilt = `${match[0]}\n  'qq',\n])`;
    const note = other.length
      ? `\n// [dsh-qq-free-bot] 裁剪：上游渠道 ${other.join(', ')} 已移除，只保留 qq。`
      : '';
    // end 之后紧跟的是原来的分号 —— 注释插在分号之前会把分号带进注释里。
    const tail = text.slice(end).replace(/^\s*;\s*/, '\n');
    return text.slice(0, match.index) + rebuilt + note + tail;
  });
}

// 3a. i18n：唯一的**代码级**多渠道聚合点。裁掉非 QQ 渠道的字典。
//
// 聚合文件是 `import <var> from './i18n-en/<channel>.mjs'` + `Object.assign({}, <var>...)`
// 的固定形状。注意字典分两类：
//
//   - **共享字典**（shared-a/b/c、diagnostics、permission、image-input）—— 不是
//     某个渠道的，是所有渠道共用的文案，**必须保留**；
//   - **渠道专属字典**（feishu、dingtalk、telegram…）—— 只属于该渠道，可以删。
//
// 只按「渠道名」删而保留共享字典，是这个裁剪点唯一容易出错的地方。
PATCHES.push('src/channels/shared/i18n-en.mjs :: 渠道字典聚合');

/** 共享字典的变量名 —— 这些不属于任何单一渠道，必须保留。 */
const I18N_SHARED = new Set([
  'sharedA', 'sharedB', 'sharedC', 'diagnostics', 'permission', 'imageInput',
]);
/** 唯一保留的渠道。 */
const I18N_KEEP_CHANNEL = 'qq';

rewrite('src/channels/shared/i18n-en.mjs', (text) => {
  const imports = new Map();
  let output = text.replace(
    /^import\s+(\w+)\s+from\s+'\.\/i18n-en\/([\w-]+)\.mjs';$/gm,
    (whole, variable, channel) => {
      imports.set(variable, channel);
      if (I18N_SHARED.has(variable) || channel === I18N_KEEP_CHANNEL) return whole;
      return `// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道的英文字典（已移除 ${channel}）`;
    },
  );
  // 聚合体里只留共享字典与 QQ 字典的成员。
  output = output.replace(
    /export const EN = Object\.freeze\(Object\.assign\(\s*\{([\s\S]*?)\},\s*([\s\S]*?)\)\);/,
    (_all, head, tail) => {
      const members = tail
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
        .filter((entry) => {
          const variable = entry;
          if (I18N_SHARED.has(variable)) return true;
          const channel = imports.get(variable);
          return channel === I18N_KEEP_CHANNEL;
        });
      const head2 = head.trim();
      return `export const EN = Object.freeze(Object.assign(\n  {}${head2 ? `, ${head2}` : ''},\n${members
        .map((entry) => `  ${entry}`)
        .join(',\n')},\n));`;
    },
  );
  return output;
});

// 3b. 渠道白名单常量
narrowChannelSet(
  'src/channels/shared/diagnostic-details.mjs',
  /export const DIAGNOSTIC_CHANNELS\s*=\s*Object\.freeze\(\[/,
  'DIAGNOSTIC_CHANNELS',
  'frozen',
);
narrowChannelSet(
  'src/channels/shared/harness-approval.mjs',
  /export const COMPETITIVE_APPROVAL_CHANNELS\s*=\s*Object\.freeze\(\[/,
  'COMPETITIVE_APPROVAL_CHANNELS',
  'frozen',
);
narrowChannelSet(
  'src/channels/shared/context-enhancement.mjs',
  /const CHANNELS\s*=\s*new Set\(\[/,
  'CHANNELS',
  'set',
);
narrowChannelSet(
  'src/channels/shared/group-history-store.mjs',
  /export const GROUP_HISTORY_CHANNELS\s*=\s*Object\.freeze\(\[/,
  'GROUP_HISTORY_CHANNELS',
  'frozen',
);
narrowChannelSet(
  'plugin-src/host/delivery-adapter.mjs',
  /const CHANNELS\s*=\s*new Set\(\[/,
  'CHANNELS',
  'set',
);
narrowChannelSet(
  'plugin-src/host/delivery-suggestions.mjs',
  /const CHANNELS\s*=\s*new Set\(\[/,
  'CHANNELS',
  'set',
);

// 3c. 连接错误的 legacy 兜底分支（QQ 不在其中）
PATCHES.push('src/channels/shared/connection-error.mjs :: legacy 渠道兜底分支');
rewrite('src/channels/shared/connection-error.mjs', (text) =>
  text.replace(
    /\[['"](?:email|imessage|office)['"],\s*['"](?:email|imessage|office)['"]\]\.includes\(channel\)/g,
    "false",
  ),
);

// 3d. groupHistoryEntry 的多渠道分派：QQ 走手工构造 entry，这里是死代码。
//
// 上游的签名是 (channel, raw, message, { scope, groupName })，本产品保留签名与
// `common` 的字段形状不变，只把按渠道 if 的分派换成「QQ 走本函数，其它渠道返回
// null」—— 这样调用方（只有 QQ 用）不需要改动，其它渠道的调用点也不会拿到
// 错误的 entry。
PATCHES.push('src/channels/shared/group-history.mjs :: groupHistoryEntry 多渠道分派');
rewrite('src/channels/shared/group-history.mjs', (text) =>
  text.replace(
    /export function groupHistoryEntry\([\s\S]*?\n  return null;\n}/,
    [
      'export function groupHistoryEntry(channel, raw, message, { scope = \'\', groupName } = {}) {',
      '  // [dsh-qq-free-bot] 裁剪：上游按渠道 if 链分派 whatsapp/telegram/discord/slack，',
      '  // 但 QQ 在 qq-bridge.mjs 里手工构造 entry，并不走这个函数。',
      '  // 本产品只保留 QQ，故此处不再分派其它渠道。',
      '  const common = { channel, scope, groupName, senderId: message.senderId,',
      "    senderName: message.contextSource?.()?.senderName, attachments: groupHistoryAttachments(message) };",
      "  if (channel === 'qq') return { ...common, groupId: raw.groupId ?? raw.chatId ?? '',",
      "    messageId: raw.messageId ?? raw.id ?? '', sentAt: raw.sentAt ?? raw.timestamp ?? 0,",
      "    text: raw.text ?? message.content ?? '', type: 'text' };",
      '  return null;',
      '}',
    ].join('\n'),
  ),
);

// 3e. sidebar-settings：侧边栏入口按渠道列出已配置的机器人。上游为 14 个渠道
// 各 import 一个 ConfigStore；那些渠道的源码本产品没有，import 会在加载时直接
// 抛错，所以这里收敛成只有 QQ。
PATCHES.push('plugin-src/host/sidebar-settings.mjs :: 渠道 ConfigStore 列表');
rewrite('plugin-src/host/sidebar-settings.mjs', (text) => {
  let output = text.replace(
    /^import\s+\{?\s*\w*ConfigStore\s*\}?\s+from\s+'[^']*';\n/gm,
    (whole) => {
      const from = whole.match(/from\s+'([^']*)'/)[1];
      // 只保留 QQ 的 ConfigStore。
      if (from.includes('/qq/')) return whole;
      return `// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ${from}）\n`;
    },
  );
  output = output.replace(
    /const CHANNEL_STORES = \[[\s\S]*?\n\];/,
    [
      'const CHANNEL_STORES = [',
      "  ['qq', QqConfigStore],",
      '];',
    ].join('\n'),
  );
  return output;
});

// 3f. delivery-adapter 的按渠道路由分派：只保留 QQ 的分支。
//
// 上游是一个 switch，每个渠道一个 case（有的带 `{ }` 块）。逐个 case 删除比正则
// 匹配整个函数可靠 —— 带块的 case 里有嵌套大括号，正则会在第一个 `}` 处停下。
PATCHES.push('plugin-src/host/delivery-adapter.mjs :: 渠道路由分派');
rewrite('plugin-src/host/delivery-adapter.mjs', (text) => {
  const start = text.indexOf('function normalizeRoute(channel, kind, route) {');
  if (start < 0) throw new Error('裁剪失败：delivery-adapter 里找不到 normalizeRoute');
  const end = text.indexOf('\n}\n', start);
  if (end < 0) throw new Error('裁剪失败：delivery-adapter 的 normalizeRoute 找不到结尾');
  const body = text.slice(start, end + 3);

  // 切出每个 case 块：从 `case 'x':` 到下一个 `case`/`default` 之前。
  const caseStarts = [...body.matchAll(/^ {4}case '([a-z-]+)':/gm)];
  if (caseStarts.length === 0) throw new Error('裁剪失败：normalizeRoute 里找不到 case');
  const kept = [];
  for (let index = 0; index < caseStarts.length; index += 1) {
    const current = caseStarts[index];
    const next = caseStarts[index + 1];
    const blockStart = current.index;
    const blockEnd = next ? next.index : body.lastIndexOf('    default:');
    const block = body.slice(blockStart, blockEnd);
    if (current[1] === 'qq') kept.push(block.trimEnd());
  }
  if (kept.length !== 1) throw new Error(`裁剪失败：normalizeRoute 里 qq 的分支有 ${kept.length} 个`);

  const rebuilt = [
    'function normalizeRoute(channel, kind, route) {',
    '  // [dsh-qq-free-bot] 裁剪：上游按 14 个渠道分派路由，本产品只保留 QQ。',
    '  switch (channel) {',
    kept[0],
    '    default:',
    "      throw invalidTarget('target kind is not supported by this channel');",
    '  }',
    '}',
  ].join('\n');
  return text.slice(0, start) + rebuilt + text.slice(end + 3);
});

// 3g. 模型侧的中性化：`http.js` 顶部从 `upstream.js` 引了四个与**客户端指纹
// 伪装**相关的符号（冒充官方 CLI 的 UA、那条免费车道的地址、构造伪装头的
// 函数、配合被铸造 session id 的截断函数）。
//
// 本产品不伪装任何客户端 —— Kilo 的免费池是厂商明确标注「no credits
// required」的官方免费池，不需要伪装。所以这四个符号改为从本产品自己的
// `net-base.js` 取中性实现，其余两百多行通用 HTTP/流代码逐字保留。
PATCHES.push('src/model/http.js :: 指纹相关 import 改为中性实现');
rewrite('src/model/http.js', (text) => {
  const from = "import { CLIENT_UA, UPSTREAM_BASE, gatewayHeaders, truncateSession } from './upstream.js'";
  const to = "import { CLIENT_UA, UPSTREAM_BASE, gatewayHeaders, truncateSession } from '../product/net-base.js'";
  if (!text.includes(from)) {
    throw new Error('裁剪失败：src/model/http.js 里找不到指纹 import');
  }
  return text.replace(from, to);
});

// 3g2. client 的模块加载 id。
//
// 上游的 client/build.mjs 用 `window.__ModuleLoader__.load({ id: '@xmanrui/dsh-im' })`
// 登记浏览器半身。这个 id 必须是**本包的裸包名** —— DSH 的浏览器端按 id 去重，
// 而 `dsh-our-free-model` 也用 `dsh-our-free-model` 登记自己的半身。
//
// ⚠️ 这一处必须落在迁移脚本里：client/build.mjs 是从上游搬来的，每次迁移
// 都会重建，直接改文件会在下一次同步时丢掉。
PATCHES.push('plugin-src/client/build.mjs :: 浏览器模块加载 id');
rewrite('plugin-src/client/build.mjs', (text) => {
  const from = /const loaderId = process\.env\.\w+ \?\? '[^']*';/;
  if (!from.test(text)) {
    throw new Error('裁剪失败：client/build.mjs 里找不到 loaderId');
  }
  return text.replace(
    from,
    "const loaderId = process.env.DSH_QQ_FREE_BOT_CLIENT_ID ?? 'dsh-qq-free-bot';",
  );
});

// 3g3. 构建入口换成我们自己的 entry（上游入口 + 本产品的车道设置页）。
//
// 上游的入口是 `plugin-src/client/index.js`（只有 QQ 那套）。我们的浏览器
// 代码住在 `src/product/client/`，由迁移脚本之外的目录承载 —— 所以入口必须
// 指过去，否则新页面永远进不了 bundle。
PATCHES.push('plugin-src/client/build.mjs :: 构建入口');
rewrite('plugin-src/client/build.mjs', (text) => {
  const from = /entryPoints: \[resolve\(sourceDirectory, 'index\.js'\)\],/;
  if (!from.test(text)) {
    throw new Error('裁剪失败：client/build.mjs 里找不到 entryPoints');
  }
  return text.replace(
    from,
    "entryPoints: [resolve(packageRoot, 'src', 'product', 'client', 'entry.js')],",
  );
});

// 3h. client 侧收敛为 QQ-only。
//
// 上游的 client/index.js 是 14 个渠道并排的：每个渠道三行 import（api / tab /
// styles）、一个 Logo 组件、一条 CHANNELS 条目、一个 RPC 包装函数、一段 render
// 分支。逐处删除比正则替换整个文件安全 —— 上游改��通用部分（错误边界、循环
// 恢复、目录选择器）时，本产品自动继承。
//
// 注意保留「通用设置」路径（GlobalSettingsPanel / DeliveryTargetSettingsPage /
// UpdatePanel / SidebarSettings）：那些不是渠道专属，是全局能力。
const CLIENT_INDEX = 'plugin-src/client/index.js';

PATCHES.push(`${CLIENT_INDEX} :: 其它渠道的 import`);
rewrite(CLIENT_INDEX, (text) => {
  let output = text;
  // 3h-1. 渠道专属的 import：只留 qq。
  output = output.replace(
    /^import\s+\{[^}]*\}\s+from\s+'\.\/channels\/(?!qq\/|shared\/)[^']*';\n/gm,
    (whole) => {
      const from = whole.match(/from\s+'([^']*)'/)[1];
      return `// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ${from}）\n`;
    },
  );
  // 3h-2. channel-logos 里的 Logo 组件：只留 QQ 的。
  //
  // ⚠️ 匹配必须**不跨越其它 import 语句**：上游这里是一个多行 import 块，
  // 而 `import {` 也在文件更早的地方出现过。用 `[\s\S]*?` 跨行匹配会从最早
  // 那个 `import {` 一路吞到 channel-logos 的 `from` —— 把中间的
  // `callManagementRpc`、`React`、`manifest` 三个 import 一起吃掉，浏览器端
  // 求值时直接抛 "manifest is not defined"。
  //
  // 所以这里逐个 import 语句地扫，只挑出**紧邻** channel-logos 的那个。
  output = output.replace(
    // `[^]*?` 会跨行匹配；用 `(?:(?!\bimport\b)[^])*?` 排除掉中间出现的
    // 其它 `import` 关键字，保证匹配范围就是这个 import 块本身。
    /(^import\s*\{(?:(?!\bimport\b)[^])*?\}\s*from\s*'\.\/channel-logos\.js';$)/m,
    (whole) => {
      const names = [...whole.matchAll(/^\s*(\w+LogoGlyph),$/gm)].map((entry) => entry[1]);
      const kept = names.filter((name) => name === 'QqLogoGlyph');
      if (kept.length === 0) throw new Error('裁剪失败：channel-logos 里找不到 QqLogoGlyph');
      return `import {\n  ${kept.join(',\n  ')},\n} from './channel-logos.js';`;
    },
  );
  return output;
});

PATCHES.push(`${CLIENT_INDEX} :: 渠道 Logo 组件`);
rewrite(CLIENT_INDEX, (text) => {
  // 每个 Logo 组件是一个 `function XxxLogo() { ... }` 声明。
  return text.replace(
    /function (\w+)Logo\(\) \{[\s\S]*?\n\}\n/g,
    (whole, name) => {
      const channel = name.replace(/Logo$/, '').toLowerCase();
      if (channel === 'qq') return whole;
      if (!ALL_CHANNELS.includes(channel)) return whole;
      return `// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ${name}）\n`;
    },
  );
});

PATCHES.push(`${CLIENT_INDEX} :: ChannelLogo 分派`);
rewrite(CLIENT_INDEX, (text) =>
  text.replace(
    /function ChannelLogo\(\{ channel \}\) \{[\s\S]*?\n\}\n/,
    (whole) => [
      'function ChannelLogo() {',
      '  // [dsh-qq-free-bot] 裁剪：上游按渠道分派 Logo，本产品只保留 QQ。',
      '  return h(QqLogo);',
      '}',
      '',
    ].join('\n'),
  ),
);

PATCHES.push(`${CLIENT_INDEX} :: CHANNELS 列表`);
rewrite(CLIENT_INDEX, (text) =>
  text.replace(
    /const CHANNELS = Object\.freeze\(\[[\s\S]*?\]\);/,
    (whole) => {
      const labels = [...whole.matchAll(/\{ id: '([a-z-]+)', label: '([^']+)'(?:, note: '[^']*')? \}/g)];
      const kept = labels.filter((entry) => entry[1] === 'qq');
      if (kept.length === 0) throw new Error('裁剪失败：CHANNELS 里没有 qq');
      return [
        'const CHANNELS = Object.freeze([',
        `  { id: 'qq', label: '${kept[0][2]}' },`,
        ']);',
      ].join('\n');
    },
  ),
);

PATCHES.push(`${CLIENT_INDEX} :: render 分支`);
rewrite(CLIENT_INDEX, (text) => {
  // 上游是 14 级嵌套三元（`: active.id === 'weixin' ? ... : ... : h(OfficeSettingsTab, ...)`）。
  //
  // 逐个删分支在这里行不通 —— 嵌套深度不同、缩进不齐，逐条正则既难写对又难
  // 验证。整块替换成「只剩 QQ」的一支更可靠：起点是第一个渠道分支，终点是
  // 上游的最后兜底（office），两端都是唯一可定位的锚点。
  const start = text.indexOf(": active.id === 'weixin'");
  if (start < 0) throw new Error('裁剪失败：client/index.js 里找不到渠道 render 分支');
  const endMarker = ': h(OfficeSettingsTab, { rpcCall: rpcCalls.officeRpcCall })';
  const end = text.indexOf(endMarker, start);
  if (end < 0) throw new Error('裁剪失败：client/index.js 里找不到 render 分支的结尾');
  const endOfBranch = end + endMarker.length;
  const replacement = [
    "// [dsh-qq-free-bot] 裁剪：上游按 14 个渠道分派设置页，本产品只保留 QQ。",
    ": active.id === 'qq'",
    '                    ? h(QqSettingsTab, { rpcCall: rpcCalls.qqRpcCall })',
    "                    : null",
  ].join('\n');
  return text.slice(0, start) + replacement + text.slice(endOfBranch);
});

PATCHES.push(`${CLIENT_INDEX} :: styles 安装列表`);
rewrite(CLIENT_INDEX, (text) =>
  text.replace(
    /const disposers = \[\n([\s\S]*?)\n    \];/,
    (whole, body) => {
      const lines = body.split('\n').filter((line) => /install\w+Styles\(\),/.test(line));
      const kept = lines.filter((line) => /installQqStyles|installImStyles/.test(line));
      if (kept.length === 0) throw new Error('裁剪失败：styles 列表里找不到 QQ 的样式安装');
      return `const disposers = [\n${kept.map((line) => `      ${line.trim()}`).join('\n')}\n    ];`;
    },
  ),
);

// 3i. client 侧两个「全局能力」文件内部引用了其它渠道：
//
//   - `delivery-settings.js` —— 交付目标设置页，按渠道挂载各自的子页面
//     （飞书的群设置/语音/指令面板、Telegram 的群触发）；
//   - `bot-general-settings.js` —— 机器人的通用设置，其中「飞书阶梯卡片」是
//     飞书专属能力。
//
// 这些子页面在本产品里不存在，所以要把 import 与使用点一起去掉。功能本身的
// 其它部分（工作区、模型、别名、上下文增强、访问策略）都是渠道无关的，保留。
for (const file of ['plugin-src/client/delivery-settings.js', 'plugin-src/client/bot-general-settings.js']) {
  PATCHES.push(`${file} :: 其它渠道的子页面 import`);
  rewrite(file, (text) => {
    let output = text.replace(
      /^import\s+\{[^}]*\}\s+from\s+'\.\/channels\/(?!qq\/|shared\/)[^']*';\n/gm,
      (whole) => {
        const from = whole.match(/from\s+'([^']*)'/)[1];
        return `// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ${from}）\n`;
      },
    );
    // 飞书的阶梯卡片归一化是飞书专属能力。
    output = output.replace(
      /^import\s+\{[^}]*\}\s+from\s+'\.\.\/\.\.\/src\/channels\/feishu\/[^']*';\n/gm,
      (whole) => `// [dsh-qq-free-bot] 裁剪：飞书专属能力（已移除）\n`,
    );
    return output;
  });
}

// 3i2. 邮箱渠道的可选入口。
//
// 上游的「IM机器人」面板会调 `useEmailChannelEnabled(emailRpcCall)` 决定要不要
// 显示邮箱这一栏。email 渠道本产品没有，那个 hook 的 import 早已被裁掉 ——
// 于是这行变成一个**渲染期**的 ReferenceError，错误边界把整页显示成
// 「加载失败」。
//
// ⚠️ 这类问题在 `apply()` 阶段查不出来：注册本身不渲染组件。所以除了删掉这行，
// `scripts/verify-client.mjs` 还必须真的渲染一次面板。
PATCHES.push(`${CLIENT_INDEX} :: 邮箱渠道入口`);
rewrite(CLIENT_INDEX, (text) => {
  let output = text;
  // 删掉 hook 调用（连同它上面那段解释性注释）。
  output = output.replace(
    /\n  \/\/ The Host owns email availability[\s\S]*?const emailEnabled = useEmailChannelEnabled\(emailRpcCall\);\n/,
    "\n  // [dsh-qq-free-bot] 裁剪：邮箱渠道不存在，不需要它的可用性判断。\n",
  );
  if (/useEmailChannelEnabled/.test(output)) {
    throw new Error('裁剪失败：client/index.js 里还有 useEmailChannelEnabled');
  }
  // `visibleChannels` 直接就是 CHANNELS —— 没有要过滤的渠道了。
  output = output.replace(
    /const visibleChannels = React\.useMemo\(\s*\(\) => CHANNELS\.filter\(\(channel\) => channel\.id !== 'email' \|\| emailEnabled\),\s*\[emailEnabled\],\s*\);/,
    'const visibleChannels = CHANNELS;',
  );
  if (/\bemailEnabled\b/.test(output)) {
    throw new Error('裁剪失败：client/index.js 里还有 emailEnabled 引用');
  }
  return output;
});

// 3k. client 侧的三处跨渠道引用：
//
//   - `client/i18n.js` 引入微信的诊断文案（`weixin/connection-error.en.mjs`）
//     —— 那是渠道专属文案，裁剪 i18n 聚合时它就成了断链；
//   - `client/channels/qq/index.js` 复用了钉钉的基础样式（`.ddt-*` 类）——
//     纯 CSS，无逻辑依赖，改指向本产品自带的 `shared/base-styles.js`；
//   - `plugin-src/host/channels/shared/group-triggers-rpc.mjs` 是 Telegram 的
//     群触发规则 —— QQ 没有这个概念，整个文件删除。
PATCHES.push('plugin-src/client/i18n.js :: 微信诊断文案');
rewrite('plugin-src/client/i18n.js', (text) => {
  const from = "import weixinDiagnostics from '../../src/channels/weixin/connection-error.en.mjs';";
  if (!text.includes(from)) {
    throw new Error('裁剪失败：client/i18n.js 里找不到微信诊断 import');
  }
  // ⚠️ import 与**聚合体里的展开项**必须一起去掉。只删 import 会留下
  // `...weixinDiagnostics,` —— 那是引用一个不存在的变量，浏览器端加载整个
  // client bundle 时直接抛 "Can't find variable: weixinDiagnostics"。
  return text
    .replace(from, '// [dsh-qq-free-bot] 裁剪：微信专属诊断文案（只保留 QQ 渠道）')
    .replace(/^\s*\.\.\.weixinDiagnostics,\s*$/m, '');
});

PATCHES.push('plugin-src/client/channels/qq/index.js :: 钉钉基础样式');
rewrite('plugin-src/client/channels/qq/index.js', (text) => {
  const from = "import { installDingtalkStyles } from '../dingtalk/styles.js';";
  if (!text.includes(from)) {
    throw new Error('裁剪失败：QQ 客户端里找不到钉钉样式 import');
  }
  return text.replace(
    from,
    "import { installDingtalkStyles } from '../shared/base-styles.js';",
  );
});

// 3j. 删除 client 侧真正不可达的文件 —— 它们服务于其它渠道，或已被 QQ 的
// 专用实现取代。
//
// 判断依据是**从 client/index.js 出发的可达性**：不可达即删除。这比按文件名
// 列黑名单可靠 —— 上游新增文件时，要么可达（保留），要么不可达（删除），
// 规则本身不需要跟着上游改。
const clientReachable = (() => {
  const root = path.join(ROOT, 'plugin-src', 'client');
  const seen = new Set();
  const visit = (absolute) => {
    if (seen.has(absolute)) return;
    seen.add(absolute);
    if (!fs.existsSync(absolute)) return;
    const text = fs.readFileSync(absolute, 'utf8');
    // ⚠️ import 语句可能是多行的（`import {\n  A,\n  B,\n} from './x.js';`），
    // 所以 `from` 之前不能排除换行。
    const re = /(?:^|\n)\s*(?:import|export)\s[\s\S]{0,400}?from\s*['"](\.[^'"]+)['"]/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      const base = path.resolve(path.dirname(absolute), match[1]);
      const candidates = [
        base,
        `${base}.mjs`,
        `${base}.js`,
        path.join(base, 'index.mjs'),
        path.join(base, 'index.js'),
      ];
      const hit = candidates.find((candidate) => fs.existsSync(candidate));
      // ⚠️ 目标不存在（断链）时**不要**就此跳过这个文件 —— 断链只说明它引用了
      // 一个已裁剪的模块，不代表它自己没用。仍要继续遍历它其它的 import，
      // 否则「引用了别的渠道的文件」会被误判成不可达而删掉（而它其实正是
      // index.js 直接 import 的全局能力组件）。
      if (hit) visit(hit);
    }
  };
  visit(path.join(root, 'index.js'));
  return seen;
})();

const clientUnreachable = [];
{
  const root = path.join(ROOT, 'plugin-src', 'client');
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (!clientReachable.has(target)) {
        // 构建脚本是入口，不被 index.js import —— 它按定义「不可达」，但必须留下。
        if (entry.name === 'build.mjs') continue;
        fs.rmSync(target, { force: true });
        clientUnreachable.push(path.relative(ROOT, target));
      }
    }
  };
  walk(root);
}
console.log(`  client 侧删除不可达文件：${clientUnreachable.length} 个`);

// 3m. 两处「渠道专属分支」必须连同其**组件引用**一起去掉。
//
// 只删 import 会留下对不存在变量的引用 —— 浏览器端加载 client bundle 时会抛
// "Can't find variable: X"，整个设置页都打不开。所以这里连分支一起删。
PATCHES.push('plugin-src/client/delivery-settings.js :: 其它渠道的设置子页面分支');
rewrite('plugin-src/client/delivery-settings.js', (text) => {
  let output = text;
  // 每个渠道专属分支是一段 `: cond ? h(Component, {...})` 的三元。
  for (const [component, channel] of [
    ['TelegramGroupTriggersSettings', 'telegram'],
    ['FeishuGroupSettingsPage', 'feishu'],
    ['FeishuSlashPanelSettingsPage', 'feishu'],
    ['FeishuVoiceSettingsPage', 'feishu'],
  ]) {
    // 分支的形状是 `: <条件> ? h(Component, { ...props })`，
    // 条件里含 `channel === '<channel>'`，props 可能跨多行。
    const pattern = new RegExp(
      `\\n\\s*: [^\\n]*channel === '${channel}'[\\s\\S]*?\\?\\s*h\\(${component}, \\{[\\s\\S]*?\\n\\s*\\}\\)`,
    );
    if (!pattern.test(output)) {
      throw new Error(`裁剪失败：delivery-settings.js 里找不到 ${component} 的分支`);
    }
    output = output.replace(
      pattern,
      `\n    // [dsh-qq-free-bot] 裁剪：${channel} 专属的设置子页面已移除（只保留 QQ 渠道）`,
    );
  }
  return output;
});

// 3n. 被裁剪掉的组件替换成「渲染 null 的桩」。
//
// 为什么用桩而不是删分支：这些组件出现在**渠道专属的三元分支**里，分支条件
// （`channel === 'feishu'`）在只保留 QQ 之后恒为假，运行时不会渲染 —— 但
// 变量引用仍然存在，浏览器端会在加载 bundle 时就抛
// "Can't find variable: FeishuGroupSettingsPage"，整个设置页都打不开。
//
// 桩函数让变量存在、渲染为空。条件恒假，所以用户永远看不到它。
PATCHES.push('plugin-src/client/*.js :: 被裁剪组件的桩替换');
for (const file of ['plugin-src/client/delivery-settings.js', 'plugin-src/client/bot-general-settings.js']) {
  rewrite(file, (text) => {
    let output = text;
    for (const component of [
      'TelegramGroupTriggersSettings',
      'FeishuGroupSettingsPage',
      'FeishuSlashPanelSettingsPage',
      'FeishuVoiceSettingsPage',
    ]) {
      if (!output.includes(`h(${component}`)) continue;
      output = output.replace(
        new RegExp(`^import \\{ ${component} \\} from '[^']*';$`, 'm'),
        '',
      );
      output = output.replace(
        new RegExp(`\\b${component}\\b`, 'g'),
        `__removed_${component}`,
      );
      // 桩定义插到文件末尾的 import 之后。
      output = output.replace(
        /^(import .*\n)+/m,
        (block) => `${block}
const __removed_${component} = () => null;
`,
      );
    }
    return output;
  });
}

PATCHES.push('plugin-src/client/bot-general-settings.js :: 飞书阶梯卡片字段');
rewrite('plugin-src/client/bot-general-settings.js', (text) => {
  let output = text;
  // `stepCardPanels` 是飞书独有的「阶梯卡片」设置，QQ 没有这个概念。
  //
  // ⚠️ 这里**保留字段本身**，只把它的归一化函数换成桩：渲染部分还有一块
  // `channel === 'feishu'` 的专属 UI 会读 `settings.stepCardPanels`。条件在只
  // 保留 QQ 之后恒为假（不会渲染），但字段若被整个删掉，那块 UI 读它就会
  // 在运行时报错。留一个恒为空的值最安全。
  output = output.replace(
    /stepCardPanels: normalizeFeishuStepCardPanels\(([^)]*)\),/g,
    (_all, argument) => `stepCardPanels: __removed_normalizeFeishuStepCardPanels(${argument}),`,
  );
  output = output.replace(
    /field === 'stepCardPanels'\s*\?\s*FEISHU_ENDPOINTS\.setStepCardPanels\s*:\s*/,
    '',
  );
  // 归一化函数的桩：飞书阶梯卡片的字段在 QQ 下恒为空对象。
  output = output.replace(
    /^(import .*\n)+/m,
    (block) => `${block}
const __removed_normalizeFeishuStepCardPanels = () => ({});
`,
  );

  // 校验：不能还有**未经桩化**的飞书专属引用。
  // `__removed_normalizeFeishuStepCardPanels` 是有意保留的桩名，不算残留。
  if (/\bnormalizeFeishuStepCardPanels\(/.test(output.replace(/__removed_normalizeFeishuStepCardPanels/g, ''))) {
    throw new Error('裁剪失败：bot-general-settings.js 里还有未桩化的 normalizeFeishuStepCardPanels');
  }
  if (/\bFEISHU_ENDPOINTS\b/.test(output)) {
    throw new Error('裁剪失败：bot-general-settings.js 里还有 FEISHU_ENDPOINTS 引用');
  }
  return output;
});


/**
 * 删除一处 `h(Component, {...})` 调用（含配对的括号与随后的逗号）。
 *
 * 有些要删的节点里嵌着很长的字面量（GitHub 图标的 SVG path 有几百个字符），
 * 用正则去配括号会被这些内容绕进去。这里按括号配平扫描，是确定的。
 *
 * @param {string} text
 * @param {string} marker 调用开头的唯一片段，如 "h(UpdatePanel, {"
 * @returns {string}
 */
function removeBalancedCall(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`裁剪失败：找不到 ${marker}`);
  // 从 marker 里的第一个 '(' 开始配平。
  const open = text.indexOf('(', start + marker.indexOf('(') - 1);
  let depth = 0;
  let end = open;
  for (; end < text.length; end += 1) {
    const ch = text[end];
    if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth === 0) { end += 1; break; }
    }
  }
  // 连带后面的逗号与空白一起吃掉，避免留下 `,\n` 的空洞。
  let tail = end;
  while (tail < text.length && /[\s,]/.test(text[tail])) {
    if (text[tail] === ',') { tail += 1; break; }
    tail += 1;
  }
  return text.slice(0, start) + text.slice(tail);
}

// ── 3z. 合并成「一个设置页」，并抹掉上游的品牌痕迹 ────────────────────────
//
// 上游的「IM机器人」页是一整套带自己品牌、版本号、GitHub 链接与应用内更新
// 面板的独立界面。本产品要把两件事并成**一页**：QQ 机器人 + 免充值 DeepSeek
// 车道，外观上就是「一个插件的一个设置页」。
//
// 所有改动都落在这里，而不是直接改 `plugin-src/client/index.js` —— 那个文件
// 每次迁移都会从上游重建。

const DEEPSEEK_TAB_ID = 'deepseek';

// 3z-1. 设置区本身：id / 顺序 / 标题。
PATCHES.push(`${CLIENT_INDEX} :: 设置区 id 与标题`);
rewrite(CLIENT_INDEX, (text) => {
  let output = text;
  const replacements = [
    // 设置区 id —— 决定侧边栏与路由里的插件身份。
    [/id: 'xmanrui-dsh-im',\n          order: 21,/g, `id: 'dsh-qq-free-bot',\n          order: 22,`],
    // 侧边栏标题。
    [/label: \(\) => t\('IM机器人'\),/g, "label: () => 'QQ 机器人',"],
    // 无障碍标签 / 导航名 —— 也不该出现上游名字。
    [/'aria-label': 'IM机器人设置'/g, "'aria-label': 'QQ 机器人设置'"],
    [/'aria-label': 'IM 设置导航'/g, "'aria-label': '设置导航'"],
  ];
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(output)) {
      throw new Error(`裁剪失败：${CLIENT_INDEX} 里找不到 ${pattern}`);
    }
    output = output.replace(pattern, replacement);
  }
  return output;
});

// 3z-2. 品牌区：换成我们自己的名字与副标题，去掉版本号、GitHub 链接、更新面板。
PATCHES.push(`${CLIENT_INDEX} :: 品牌区去痕`);
rewrite(CLIENT_INDEX, (text) => {
  let output = text;
  if (!output.includes("'DSH-IM'")) {
    throw new Error('裁剪失败：品牌名 DSH-IM 不见了');
  }
  output = output.replace("h('strong', { className: 'dim-brandName' }, 'DSH-IM')",
    "h('strong', { className: 'dim-brandName' }, 'QQ 机器人')");
  // 版本号徽标（它显示的是上游插件的版本）。
  output = output.replace(
    /\n\s*h\('span', \{ className: 'dim-brandVersion' \}, `v\$\{runningVersion\}`\)\)/,
    ')',
  );
  // 删掉版本号后可能留下 `h(...),)` —— 语法合法但难看，顺手清理。
  output = output.replace(/\),\n(\s*)\)/, ')\n$1)');
  output = output.replace("h('p', null, '让 DeepSeek Harness 触手可及')",
    "h('p', null, '扫码接入 QQ，模型走免充值 DeepSeek')");
  // 应用内更新面板与 GitHub 入口：都是上游的分发机制，本产品没有。
  output = removeBalancedCall(output, 'h(UpdatePanel, {');
  output = removeBalancedCall(output, "h('span', { className: 'dim-githubAction' },");
  // 只校验「渲染调用」是否还在 —— import 语句里仍有 UpdatePanel 属正常。
  if (/h\(UpdatePanel|dim-githubAction\b/.test(output)) {
    throw new Error('裁剪失败：品牌区里还残留更新面板或 GitHub 入口');
  }
  return output;
});

// 3z-3. rail 里加一个「模型」tab，并把两页并进同一个设置区。
PATCHES.push(`${CLIENT_INDEX} :: 合并模型页为第二个 tab`);
rewrite(CLIENT_INDEX, (text) => {
  let output = text;

  // (a) tab 定义 + 图标。
  const channelsDecl = /const CHANNELS = Object\.freeze\(\[\n  \{ id: 'qq', label: '[^']+' \},\n\]\);/;
  if (!channelsDecl.test(output)) throw new Error('裁剪失败：找不到 CHANNELS 声明');
  output = output.replace(channelsDecl, (whole) => `${whole}

/**
 * 第二个 tab：免充值 DeepSeek 的车道设置。
 *
 * 它不是 IM 渠道，但和机器人在**同一个设置页**里 —— 用户装的是一个插件，
 * 就该看到一页设置。
 */
const MODEL_TAB = Object.freeze({ id: '${DEEPSEEK_TAB_ID}', label: '免充值 DeepSeek', note: '车道与兜底' });`);

  // (b) 图标组件：模型 tab 用一个闪电，其它仍用 QQ 标。
  output = output.replace(
    /function ChannelLogo\(\) \{\n  \/\/ \[dsh-qq-free-bot\] 裁剪：上游按渠道分派 Logo，本产品只保留 QQ。\n  return h\(QqLogo\);\n\}/,
    `function ModelGlyph() {
  return h('svg', {
    width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
    focusable: 'false', 'aria-hidden': 'true',
  }, h('path', { d: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z' }));
}

function ChannelLogo({ channel }) {
  if (channel === '${DEEPSEEK_TAB_ID}') return h(ModelGlyph);
  return h(QqLogo);
}`,
  );

  // (c) rail 的数据源把模型 tab 也算进去（渲染循环不用改）。
  //
  // 同时修掉初始 tab 的选择：上游的兜底是 `'weixin'`（它的第一个渠道），
  // 而本产品没有微信 → `active` 会回落。更关键的是它只查 `CHANNELS`，
  // 传 `preferredSectionId: 'deepseek'` 时会被拒绝，永远停在 QQ 页。
  output = output.replace(
    'const visibleChannels = CHANNELS;',
    'const visibleChannels = RAIL_TABS;',
  );
  output = output.replace(
    /const MODEL_TAB = Object\.freeze\(\{ id: 'deepseek', label: '免充值 DeepSeek', note: '车道与兜底' \}\);/,
    `const MODEL_TAB = Object.freeze({ id: 'deepseek', label: '免充值 DeepSeek', note: '车道与兜底' });

/** rail 里的全部 tab：QQ 渠道 + 模型车道。 */
const RAIL_TABS = [ ...CHANNELS, MODEL_TAB ];`,
  );
  output = output.replace(
    /(\|\| CHANNELS\.some\(\(channel\) => channel\.id === preferredSectionId\)\n\s*\? preferredSectionId : )'weixin'/,
    `$1RAIL_TABS[0].id`,
  );
  output = output.replace(
    /CHANNELS\.some\(\(channel\) => channel\.id === preferredSectionId\)/,
    'RAIL_TABS.some((tab) => tab.id === preferredSectionId)',
  );

  // (d) panel 里分派：模型 tab 渲染车道设置页，其余仍是 QQ。
  const panelBranch = /: active\.id === 'qq'\n\s*\? h\(QqSettingsTab, \{ rpcCall: rpcCalls\.qqRpcCall \}\)\n\s*: null\)\)/;
  if (!panelBranch.test(output)) throw new Error('裁剪失败：找不到 panel 的 QQ 分支');
  output = output.replace(panelBranch,
    `: active.id === '${DEEPSEEK_TAB_ID}'
                    ? h(DeepSeekSettingsPage, { rpcCall: laneRpcCall, channelRpc: channelRpcCall })
                    : h(QqSettingsTab, { rpcCall: rpcCalls.qqRpcCall })))`);

  // (e) 车道 RPC 从 entry 传进来（与我们自己的设置页共用同一个通道）。
  output = output.replace(
    /  workspaceDirectoryPicker,\n  preferredSectionId,/,
    '  workspaceDirectoryPicker,\n  laneRpcCall,\n  channelRpcCall,\n  preferredSectionId,',
  );
  output = output.replace(
    /    globalSettingsRpcCall,\n    workspaceDirectoryPicker,\n  \};/,
    '    globalSettingsRpcCall,\n    workspaceDirectoryPicker,\n    laneRpcCall,\n    channelRpcCall,\n  };',
  );

  // (g) `apply` 接受一个 options，把车道 RPC 从 entry 传进来。
  //
  // 不改 `apply(ctx)` 的调用约定是不可能的：车道 RPC 挂在我们自己的路径
  // （`/api/dsh-qq-free-bot`）上，而这里的 `callManagementRpc` 会把路径拼到
  // dsh-im 命名空间下。所以由 entry 造好函数再传进来。
  output = output.replace(
    'export function apply(ctx) {',
    'export function apply(ctx, options = {}) {\n  const laneRpcCall = options.laneRpcCall ?? null;\n  const channelRpcCall = options.channelRpcCall ?? null;',
  );

  // (f) import 车道设置页组件。
  output = output.replace(
    /^import manifest from '\.\.\/\.\.\/package\.json' with \{ type: 'json' \};$/m,
    `import manifest from '../../package.json' with { type: 'json' };
import { DeepSeekSettingsPage } from '../../src/product/client/deepseek-settings.js';`,
  );

  return output;
});

// 3z-4. 插件详情页里的入口 id 也带上游名字。
//
// 这些 id 会出现在 `plugins.detail.actions` / `main` 两个 slot 上，属于
// 「插件身份」的一部分。用户装的是本产品，就不该看到上游的标识。
PATCHES.push('plugin-src/client/plugin-page.js :: 插件入口 id');
rewrite('plugin-src/client/plugin-page.js', (text) => {
  let output = text;
  if (!output.includes("'xmanrui-dsh-im'")) {
    throw new Error('裁剪失败：plugin-page.js 里找不到上游 id');
  }
  output = output.replace(/'xmanrui-dsh-im-open'/g, "'dsh-qq-free-bot-open'");
  output = output.replace(/'xmanrui-dsh-im'/g, "'dsh-qq-free-bot'");
  return output;
});

// 3z-5. 剩下的两处上游标识：i18n 命名空间与侧边栏头像 slot 的 id。
//
// 它们不是「品牌展示」，但会出现在 DOM 的属性里；既然产品要看起来像一个独立
// 插件，这些标识也一并改掉。RPC 路径（`/dsh-im-delivery` 等）保持不变 ——
// 那是宿主与浏览器之间的传输约定，改了要同时动上游那几个文件，收益是零。
PATCHES.push('plugin-src/client/i18n.js :: i18n 命名空间');
rewrite('plugin-src/client/i18n.js', (text) => {
  const from = "export const IM_LOCALE_NAMESPACE = 'dsh-im';";
  if (!text.includes(from)) throw new Error('裁剪失败：找不到 i18n 命名空间');
  return text.replace(from, "export const IM_LOCALE_NAMESPACE = 'dsh-qq-free-bot';");
});

PATCHES.push('plugin-src/client/ds-bot-session-avatars.js :: 头像 slot id');
rewrite('plugin-src/client/ds-bot-session-avatars.js', (text) => {
  const from = "id: 'dsh-im-ds-bot-avatar'";
  if (!text.includes(from)) throw new Error('裁剪失败：找不到头像 slot id');
  return text.replace(from, "id: 'dsh-qq-free-bot-ds-bot-avatar'");
});

console.log('== 4. 裁剪：删除其它渠道的源码 ==');

const removed = [
  ...drop('src/channels', /^(?!qq\/|shared\/).+\.mjs$/),
  ...drop('plugin-src/host/channels', /^(?!qq\/|shared\/).+\.mjs$/),
  ...drop('plugin-src/client/channels', /^(?!qq\/|shared\/).+\.mjs$/),
  // Telegram 的群触发规则 —— QQ 没有「按群配置回复规则」这个概念。
  ...drop('plugin-src/host/channels/shared', /^group-triggers-rpc\.mjs$/),
  // 微信专属的诊断文案：client/i18n.js 已改为不引用它。
  ...drop('src/channels/shared/i18n-en', /^weixin\.mjs$/),
];

// 3b 裁剪后 i18n 不再引用其它渠道，weixin 的泄漏文件一并删除。
removed.push(...drop('src/channels', /^weixin\//));

/* ------------------------------------------------------------------- step 5 */

console.log('== 5. 汇总 ==');
console.log(`裁剪点：${PATCHES.length} 处`);
for (const patch of PATCHES) console.log(`  - ${patch}`);
console.log(`删除文件：${removed.length} 个`);
