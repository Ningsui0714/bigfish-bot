/**
 * 浏览器端 bundle 的**运行时**检查。
 *
 * ## 为什么用运行时而不是静态分析
 *
 * 裁剪渠道时删掉一个 import 却留下它的用法，在 Node 侧完全查不出来 ——
 * 语法合法、import 解析检查也过。但浏览器加载 client bundle 时会抛
 * `Can't find variable: X`，整个设置页都打不开。
 *
 * 静态分析要处理字符串、注释、JSX、作用域……噪音大且容易漏。直接**执行**
 * bundle 就没有这些歧义：任何未定义变量的引用都会在模块求值时立刻抛错。
 *
 * 执行环境用一个最小的 `window.__ModuleLoader__` 替身，把 bundle 加载成
 * 一个 CommonJS 模块（bundle 本身就是 CJS 形态），并提供 React 的替身 ——
 * 因为我们只关心「模块能否求值」，不关心渲染。
 *
 *     node scripts/verify-client.mjs
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// 用**真实**的 React 与 ReactDOMServer 来做渲染检查。
//
// 一开始这里是手写的递归求值器，结果它并没有真正执行到内层组件 —— 一个
// 「删了 import 却留下用法」的 ReferenceError 照样被放过去了。手写渲染器
// 一旦和真实渲染语义有偏差，检查本身就成了假阴性机器。
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUNDLE = path.join(ROOT, 'lib', 'client.js');

if (!fs.existsSync(BUNDLE)) {
  console.error('找不到 lib/client.js —— 先运行 npm run build');
  process.exit(1);
}

const source = fs.readFileSync(BUNDLE, 'utf8');


let registered = null;

const sandbox = {
  window: {
    __ModuleLoader__: {
      load({ id, factory }) {
        // ⚠️ 必须用 factory 的**返回值**取导出。
        //
        // bundle 自己在 factory 内部声明了 `var module = { exports: {} }` 并把
        // 结果赋回去，外层再读自己的 `module.exports` 只会拿到空对象 —— 那正是
        // 「求值成功但没有 apply」的假阴性来源。
        const exported = factory((request) => {
          if (request === 'react') return React;
          if (request === 'react-dom') return require('react-dom');
          if (request === 'react-dom/client') return require('react-dom/client');
          if (request === 'react/jsx-runtime') return require('react/jsx-runtime');
          throw new Error(`client bundle 请求了未预期的模块：${request}`);
        });
        registered = { id, exports: exported ?? {} };
      },
    },
  },
  document: {
    // 样式注入会 `querySelector` 查重、`createElement` 建 <style>、
    // `head.appendChild` 挂上。全部给成空实现 —— 这里只验证「代码能跑通」，
    // 不验证视觉。
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      setAttribute: () => {},
      style: {},
      appendChild: () => {},
      append: () => {},
      textContent: '',
      dataset: {},
      classList: { add: () => {}, remove: () => {} },
    }),
    createTextNode: (text) => ({ textContent: text }),
    head: { appendChild: () => {}, removeChild: () => {} },
    body: { appendChild: () => {}, removeChild: () => {} },
    documentElement: { style: { setProperty: () => {} }, appendChild: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: () => null,
    baseURI: 'http://127.0.0.1/',
  },
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  queueMicrotask,
  location: { href: 'http://127.0.0.1/', pathname: '/' },
  navigator: { language: 'zh-CN', languages: ['zh-CN'] },
  fetch: () => Promise.reject(new Error('检查期间不应发起网络请求')),
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  MutationObserver: class { observe() {} disconnect() {} },
  IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  // 设置页与 QQ 面板会用到这些 Web API。Node 24 全局就有，直接透传即可 ——
  // 它们在 vm 的新 context 里不会自动存在。
  AbortController,
  AbortSignal,
  TextEncoder,
  TextDecoder,
  Blob,
  FormData,
  Headers,
  Request,
  Response,
  URL,
  URLSearchParams,
  structuredClone,
  // EventSource 只被 OFM 的推送用；这里给个不会真正连网的桩。
  EventSource: class EventSource {
    constructor() { this.readyState = 0; }
    addEventListener() {}
    removeEventListener() {}
    close() {}
  },
};
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
sandbox.window.document = sandbox.document;
// 面板会挂 window 级监听（resize / storage 之类）。
sandbox.window.addEventListener = () => {};
sandbox.window.removeEventListener = () => {};
sandbox.window.dispatchEvent = () => true;
sandbox.window.location = sandbox.location;
sandbox.window.navigator = sandbox.navigator;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.matchMedia = sandbox.matchMedia;
sandbox.window.requestAnimationFrame = sandbox.requestAnimationFrame;
sandbox.window.cancelAnimationFrame = sandbox.cancelAnimationFrame;
sandbox.window.setTimeout = setTimeout;
sandbox.window.clearTimeout = clearTimeout;
sandbox.window.setInterval = setInterval;
sandbox.window.clearInterval = clearInterval;
sandbox.window.EventSource = sandbox.EventSource;
sandbox.window.AbortController = AbortController;
sandbox.window.fetch = sandbox.fetch;

try {
  vm.runInNewContext(source, sandbox, { filename: 'lib/client.js' });
} catch (error) {
  console.error(`client bundle 求值失败：${error?.message ?? error}`);
  console.error(error?.stack?.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
}

if (!registered) {
  console.error('client bundle 没有向 __ModuleLoader__ 登记模块');
  process.exit(1);
}

console.log(`client bundle 求值成功，模块 id = ${registered.id}`);
if (registered.id !== 'dsh-qq-free-bot') {
  console.error(`模块 id 应当是裸包名 dsh-qq-free-bot，实际是 ${registered.id}`);
  process.exit(1);
}

// ── 真正跑一遍 apply() ─────────────────────────────────────────────────────
//
// 只求值模块是不够的：设置区是在 `apply()` 里注册的，而注册代码里的错误
// （引用了不存在的导出、slots API 用错）只有跑起来才会暴露。
//
// 这里给一个最小的 ctx 替身，记录注册结果 —— 不渲染组件（那会违反 hooks
// 规则），只验证「注册发生了、且 id / order / label 对」。
const sections = [];
const ctx = {
  effect(factory) {
    const dispose = factory();
    return typeof dispose === 'function' ? dispose : () => {};
  },
  on() {
    return () => {};
  },
  get() {
    return undefined;
  },
  provide() {},
  inject(_services, callback) {
    return typeof callback === 'function' ? callback(ctx) : undefined;
  },
  slots: {
    inject(_name, callback) {
      return callback();
    },
    register(definition, render) {
      sections.push({ definition, render, type: typeof render });
      return () => {};
    },
  },
  connection: { rpc: { call: async () => ({ ok: true, value: null }) } },
  locale: {
    register() {
      return () => {};
    },
    bind() {
      return (key) => key;
    },
    getLocale() {
      return { active: 'zh' };
    },
  },
  workspaces: {},
};

const exported = registered.exports;
const apply = exported?.apply ?? exported?.default?.apply;
if (typeof apply !== 'function') {
  console.error('client bundle 没有导出可调用的 apply()');
  process.exit(1);
}

try {
  apply(ctx);
} catch (error) {
  console.error(`client apply() 执行失败：${error?.message ?? error}`);
  console.error(error?.stack?.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
}

if (!Array.isArray(sections) || sections.length === 0) {
  console.error('client apply() 没有注册任何设置区');
  process.exit(1);
}

if (process.env.VERBOSE_SECTIONS === '1') {
  for (const section of sections) {
    console.log('  def:', JSON.stringify(section.definition ?? {}).slice(0, 200));
  }
}

const own = sections.find((section) => section.definition?.id === 'dsh-qq-free-bot');
if (!own) {
  console.error(
    `没有注册 id 为 dsh-qq-free-bot 的设置区，实际注册了：${sections
      .map((section) => section.definition?.id ?? '(无 id)')
      .join(', ')}`,
  );
  process.exit(1);
}

const label = typeof own.definition.label === 'function' ? own.definition.label() : own.definition.label;
if (typeof label !== 'string' || label.trim() === '') {
  console.error('dsh-qq-free-bot 设置区的 label 为空');
  process.exit(1);
}

console.log(
  `设置区注册正常：${sections.map((section) => `${section.definition?.id}[order=${section.definition?.order}]`).join(', ')}`,
);

// ── 真的**渲染**一遍每个设置区 ──────────────────────────────────────────
//
// `apply()` 只注册，不渲染。而「删了 import 却留下用法」这类残留，恰恰是在
// 渲染时才会炸成 ReferenceError —— QQ 面板曾经因为 `useEmailChannelEnabled`
// 的 import 被裁掉而整页显示「加载失败」，就是这一步没做才漏掉的。
//
// 用真实的 ReactDOMServer 渲染，而不是手写递归：手写版一旦与真实渲染语义
// 有偏差（比如没有真正下钻到子组件），检查本身就会变成假阴性。
for (const section of sections) {
  if (section.definition?.name !== 'settings.section') continue;
  const props = typeof section.definition?.inject === 'function'
    ? section.definition.inject()
    : {};
  let element;
  try {
    element = section.render({ ...props, preferredSectionId: undefined });
  } catch (error) {
    console.error(`设置区 ${section.definition?.id} 创建元素失败：${error?.message ?? error}`);
    console.error(error?.stack?.split('\n').slice(0, 8).join('\n'));
    process.exit(1);
  }
  if (element === null || element === undefined) continue;
  // 两个 tab 各渲染一次。
  //
  // 只渲染默认 tab 是不够的：模型 tab 的组件在另一个分支里，只有真的切过去
  // 才会执行它的函数体。`preferredSectionId` 就是切 tab 的入口。
  for (const tab of ['qq', 'deepseek']) {
    let tabElement;
    try {
      tabElement = section.render({ ...props, preferredSectionId: tab });
    } catch (error) {
      console.error(`设置区 ${section.definition?.id} 切换到 ${tab} 失败：${error?.message ?? error}`);
      process.exit(1);
    }
    try {
      const html = renderToStaticMarkup(tabElement);
      console.log(`  渲染通过：${section.definition?.id} / ${tab}（${html.length} 字节 HTML）`);
      if (process.env.DUMP_HTML === '1') console.log(html);
    } catch (error) {
      console.error(`设置区 ${section.definition?.id} 的 ${tab} tab 渲染失败：${error?.message ?? error}`);
      console.error(error?.stack?.split('\n').slice(0, 10).join('\n'));
      process.exit(1);
    }
  }
}

// 面板会注册定时器/事件监听（侧边栏同步、头像刷新等），vm 里的这些句柄
// 不会自动回收，进程会挂着不退出。检查已经做完，直接结束。
process.exit(0);
