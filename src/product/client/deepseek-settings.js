/**
 * 「免充值 DeepSeek」设置页 —— 浏览器半身。
 *
 * ## 这一页要解决的问题
 *
 * 免充值的 DeepSeek 来自多个账号渠道，每个渠道的失效方式不同（积分按天重置、
 * 登录态会过期、上游会下线）。用户需要一眼看到：
 *
 *   1. 哪些渠道已经挂上（渠道包是挂载成功的，还是复用了别的插件）；
 *   2. 每条车道的当前顺序与启用状态；
 *   3. 某条车道的 provider 是否真的注册了。
 *
 * 并且能直接调顺序、关掉失效的车道 —— 这就是「跨车道降级」这条产品能力的
 * 可视面。
 *
 * ## 为什么状态是宿主给的
 *
 * 浏览器够不到 `<DSH_HOME>` 下的配置文件，也看不到宿主进程里注册了哪些 llm
 * provider。所有状态都由宿主通过 RPC 返回（见 `lane-rpc-shared.js`）。
 *
 * @module src/product/client/deepseek-settings.js
 */

import * as React from 'react';

import { MODEL_LANE_ENDPOINTS } from '../lane-rpc-shared.js';
import { LOGIN_PROVIDERS } from './channel-rpc-client.js';

const { createElement: h, useState, useEffect, useCallback } = React;

/** 设置区 id。 */
const SECTION_ID = 'dsh-qq-free-bot';
/** 设置区在侧边栏里的排序（排在 IM机器人 之后）。 */
const SECTION_ORDER = 22;
/** 样式注入的标记属性。 */
const STYLE_ATTR = 'data-plugin';
const STYLE_VALUE = 'dsh-qq-free-bot';

const styles = `
.qqfb_page { display: flex; flex-direction: column; gap: 16px; padding: 4px 2px 24px; }
.qqfb_head { display: flex; flex-direction: column; gap: 4px; }
.qqfb_head strong { font-size: 15px; font-weight: 600; }
.qqfb_head p { margin: 0; font-size: 12px; color: var(--dsw-alias-label-tertiary); line-height: 1.6; }
.qqfb_card { border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px; background: var(--dsw-alias-bg-layer-2); padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.qqfb_cardTitle { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.qqfb_hint { font-size: 11.5px; color: var(--dsw-alias-label-tertiary); line-height: 1.6; }
.qqfb_row { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-3); }
.qqfb_row[data-off="true"] { opacity: .5; }
.qqfb_idx { width: 20px; text-align: center; font-variant-numeric: tabular-nums; font-size: 11px; color: var(--dsw-alias-label-tertiary); flex: none; }
.qqfb_rowMain { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.qqfb_rowName { font-size: 12.5px; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qqfb_rowId { font-size: 11px; color: var(--dsw-alias-label-tertiary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qqfb_badge { flex: none; font-size: 10.5px; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.qqfb_badge[data-tone="ok"] { border-color: color-mix(in srgb, #2f9e62 55%, transparent); color: #2f9e62; }
.qqfb_badge[data-tone="warn"] { border-color: color-mix(in srgb, #d9812f 55%, transparent); color: #d9812f; }
.qqfb_badge[data-tone="off"] { border-color: var(--dsw-alias-border-l1); color: var(--dsw-alias-label-tertiary); }
.qqfb_icon { width: 24px; height: 24px; flex: none; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--dsw-alias-border-l2); border-radius: 7px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 12px; line-height: 1; padding: 0; }
.qqfb_icon:hover:not(:disabled) { color: var(--dsw-alias-label-primary); }
.qqfb_icon:disabled { opacity: .35; cursor: default; }
.qqfb_actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.qqfb_btn { font: inherit; font-size: 12px; font-weight: 550; padding: 6px 13px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-3); color: var(--dsw-alias-label-primary); cursor: pointer; }
.qqfb_btn:hover:not(:disabled) { border-color: var(--dsw-alias-state-business-primary, #4b6fff); }
.qqfb_btn:disabled { opacity: .45; cursor: default; }
.qqfb_switch { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; user-select: none; font-size: 12.5px; }
.qqfb_switch input { width: 16px; height: 16px; accent-color: var(--dsw-alias-state-business-primary, #4b6fff); cursor: inherit; }
.qqfb_meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 11.5px; color: var(--dsw-alias-label-tertiary); }
.qqfb_meta b { color: var(--dsw-alias-label-primary); font-weight: 600; }
.qqfb_error { padding: 9px 12px; border-radius: 10px; border: 1px solid color-mix(in srgb, #c94a4a 50%, transparent); background: color-mix(in srgb, #c94a4a 10%, transparent); font-size: 12px; line-height: 1.6; }
.qqfb_empty { font-size: 12px; color: var(--dsw-alias-label-tertiary); padding: 10px 0; }
.qqfb_prov { display: flex; flex-direction: column; gap: 6px; padding: 10px 11px; border-radius: 10px; border: 1px solid var(--dsw-alias-border-l1); background: var(--dsw-alias-bg-layer-3); }
.qqfb_provHead { display: flex; align-items: center; gap: 9px; }
.qqfb_provName { font-size: 12.5px; font-weight: 550; }
.qqfb_provHint { font-size: 11px; color: var(--dsw-alias-label-tertiary); margin-left: auto; text-align: right; }
.qqfb_account { display: flex; align-items: center; gap: 8px; padding-left: 2px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.qqfb_accountId { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10.5px; color: var(--dsw-alias-label-tertiary); }
.qqfb_link { font-size: 11.5px; color: var(--dsw-alias-state-business-primary, #4b6fff); background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; font-family: inherit; }
.qqfb_pending { font-size: 11.5px; color: var(--dsw-alias-state-warning-primary, #d9812f); }
`;

/**
 * 注入样式（只注入一次，卸载时移除）。
 *
 * @returns {Function} 清理函数
 */
function installStyles() {
  if (typeof document === 'undefined') return () => {};
  const existing = document.querySelector(`style[${STYLE_ATTR}="${STYLE_VALUE}"]`);
  if (existing !== null) return () => {};
  const element = document.createElement('style');
  element.setAttribute(STYLE_ATTR, STYLE_VALUE);
  element.textContent = styles;
  document.head.appendChild(element);
  return () => {
    element.remove();
  };
}

/** 渠道包状态 → 展示文案与色调。 */
function channelPackBadge(state) {
  switch (state) {
    case 'mounted':
      return { text: '渠道包已挂载', tone: 'ok' };
    case 'reused':
      return { text: '复用其它插件的渠道', tone: 'ok' };
    case 'failed':
      return { text: '渠道包加载失败', tone: 'warn' };
    case 'absent':
      return { text: '未配置渠道包', tone: 'warn' };
    default:
      return { text: '渠道包加载中', tone: 'off' };
  }
}

/**
 * 单条车道的状态徽章。
 *
 * `loggedIn` 来自账号列表：**渠道服务在 ≠ 有账号**。只按 provider 是否注册来
 * 判断，会把 11 条车道全标成「可用」，而实际上只有登录过的那一两个能作答。
 *
 * @param {object} lane
 * @param {boolean|undefined} loggedIn 该 provider 是否有已登录账号；undefined 表示还不知道
 */
function laneBadge(lane, loggedIn) {
  if (lane.enabled === false) return { text: '已停用', tone: 'off' };
  if (!lane.providerRegistered) return { text: '渠道未注册', tone: 'warn' };
  if (loggedIn === false) return { text: '未登录', tone: 'warn' };
  if (!lane.channelServicePresent) return { text: '渠道不可用', tone: 'warn' };
  return { text: '可用', tone: 'ok' };
}

function Badge({ text, tone }) {
  return h('span', { className: 'qqfb_badge', 'data-tone': tone }, text);
}

function LaneRow({ lane, busy, onMove, onToggle, total, loggedIn }) {
  const badge = laneBadge(lane, loggedIn);
  return h('div', { className: 'qqfb_row', 'data-off': lane.enabled === false },
    h('span', { className: 'qqfb_idx' }, String(lane.index + 1)),
    h('div', { className: 'qqfb_rowMain' },
      h('span', { className: 'qqfb_rowName' }, lane.label),
      h('span', { className: 'qqfb_rowId' },
        lane.model === 'auto'
          ? `${lane.provider} / 自动选择 DeepSeek`
          : `${lane.provider} / ${lane.model}`),
    ),
    h(Badge, badge),
    h('button', {
      type: 'button',
      className: 'qqfb_icon',
      title: '上移（更优先尝试）',
      'aria-label': `上移 ${lane.label}`,
      disabled: busy || lane.index === 0,
      onClick: () => onMove(lane.index, lane.index - 1),
    }, '↑'),
    h('button', {
      type: 'button',
      className: 'qqfb_icon',
      title: '下移（更晚尝试）',
      'aria-label': `下移 ${lane.label}`,
      disabled: busy || lane.index === total - 1,
      onClick: () => onMove(lane.index, lane.index + 1),
    }, '↓'),
    h('button', {
      type: 'button',
      className: 'qqfb_icon',
      title: lane.enabled === false ? '启用这条车道' : '停用这条车道',
      'aria-label': `${lane.enabled === false ? '启用' : '停用'} ${lane.label}`,
      disabled: busy,
      onClick: () => onToggle(lane.index),
    }, lane.enabled === false ? '○' : '●'),
  );
}

/**
 * 账号渠道的登录面板。
 *
 * ## 登录是两步式，必须按这个顺序
 *
 * `account.create` **先返回 `loginUrl`，再在后台等授权结果** —— 上游代码里
 * 有一整段注释解释为什么不能等整个流程走完才返回：浏览器只在用户点击后的
 * 短暂窗口内允许 `window.open`，阻塞几十秒后弹窗必被拦截。
 *
 * 所以这里：`create` → 立刻 `window.open`（被拦截就退化成可点的链接）→
 * 轮询 `login.poll` 直到 `done`。
 *
 * @param {{channelRpc: Function, onChanged: Function}} props
 */
function AccountChannels({ channelRpc, onChanged, onAccounts }) {
  const [accounts, setAccounts] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState({});
  const [links, setLinks] = useState({});

  /**
   * 读取已登录账号。
   *
   * ⚠️ `account.list` **必须带 `provider`**。
   *
   * 渠道包的实现是 `readAccounts().filter(a => a.provider === req.provider)` ——
   * 不传 provider 时 `a.provider === undefined` 恒为假，于是**永远返回空数组**。
   * 这不会报错，看起来就像「登录成功了但列表没反应」。所以这里按 provider
   * 逐个查再合并。
   *
   * 每个 provider 单独 try：某个渠道读失败不该把整张表清空。
   */
  const refresh = useCallback(async () => {
    const results = await Promise.all(LOGIN_PROVIDERS.map(async (provider) => {
      try {
        const value = await channelRpc('account.list', { provider: provider.id });
        return Array.isArray(value?.accounts) ? value.accounts : [];
      } catch {
        return [];
      }
    }));
    const flat = results.flat();
    setAccounts(flat);
    onAccounts?.(flat);
  }, [channelRpc, onAccounts]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** 轮询一个账号的登录结果，直到 done 或超时。 */
  const poll = useCallback(async (accountId, provider) => {
    const deadline = Date.now() + 5 * 60_000;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let value;
      try {
        value = await channelRpc('login.poll', { accountId });
      } catch {
        continue;
      }
      if (value?.done !== true) continue;
      setPending((current) => {
        const next = { ...current };
        delete next[provider];
        return next;
      });
      if (value.success === true) {
        setLinks((current) => {
          const next = { ...current };
          delete next[provider];
          return next;
        });
        await refresh();
        onChanged?.();
      } else {
        setError(value.error?.message ?? `${provider} 登录未完成`);
        await refresh();
      }
      return;
    }
    setPending((current) => {
      const next = { ...current };
      delete next[provider];
      return next;
    });
    setError(`${provider} 登录等待超时，请重试`);
  }, [channelRpc, refresh, onChanged]);

  const login = useCallback(async (provider) => {
    setError(null);
    setPending((current) => ({ ...current, [provider]: true }));
    try {
      const value = await channelRpc('account.create', { provider });
      const url = value?.loginUrl;
      if (typeof url === 'string' && url !== '') {
        const popup = window.open(url, '_blank', 'noopener,noreferrer');
        if (!popup) {
          // 弹窗被拦截：给一个可点的链接，不要用 location.href —— 那会把
          // 整个设置页跳走，用户就再也回不来了。
          setLinks((current) => ({ ...current, [provider]: url }));
        }
      }
      void poll(value?.accountId, provider);
    } catch (cause) {
      setPending((current) => {
        const next = { ...current };
        delete next[provider];
        return next;
      });
      setError(cause?.message ?? String(cause));
    }
  }, [channelRpc, poll]);

  const remove = useCallback(async (accountId) => {
    setError(null);
    try {
      await channelRpc('account.delete', { accountId });
      await refresh();
      onChanged?.();
    } catch (cause) {
      setError(cause?.message ?? String(cause));
    }
  }, [channelRpc, refresh, onChanged]);

  return h('div', { className: 'qqfb_card' },
    h('div', { className: 'qqfb_cardTitle' }, '账号登录'),
    h('div', { className: 'qqfb_hint' },
      '这些是各家官方渠道的免费额度，登录一次即可（多数按天重置）。'
      + '登录后会出现在上面的降级链里。点「登录」会打开官方授权页，完成授权后自动回来。'),
    error !== null ? h('div', { className: 'qqfb_error', role: 'alert' }, error) : null,
    accounts === null
      ? h('div', { className: 'qqfb_empty' }, '正在读取已有账号…')
      : null,
    // ⚠️ provider 列表**不等账号列表**：登录按钮必须立刻可点，否则用户会以为
    // 页面还没准备好。账号为空时 `owned` 自然为空，渲染结果一样。
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 } },
        LOGIN_PROVIDERS.map((provider) => {
          const owned = (accounts ?? []).filter((account) => account.provider === provider.id);
          // `source` 由宿主用 `credentials.describe` 填 —— 有值才说明凭据真的在。
          // 占位账号（点了登录但没完成授权）没有凭据，不能算「已登录」。
          const ready = owned.filter((account) => account.source !== undefined);
          const busy = pending[provider.id] === true;
          return h('div', { key: provider.id, className: 'qqfb_prov' },
            h('div', { className: 'qqfb_provHead' },
              h('span', { className: 'qqfb_provName' }, provider.label),
              h(Badge, ready.length > 0
                ? { text: `${ready.length} 个账号`, tone: 'ok' }
                : owned.length > 0
                ? { text: '未完成', tone: 'warn' }
                : { text: '未登录', tone: 'off' }),
              busy ? h('span', { className: 'qqfb_pending' }, '等待授权…') : null,
              h('button', {
                type: 'button',
                className: 'qqfb_btn',
                style: { marginLeft: 'auto', padding: '4px 11px' },
                disabled: busy,
                onClick: () => void login(provider.id),
              }, busy ? '登录中…' : '登录'),
            ),
            h('div', { className: 'qqfb_provHint' }, provider.hint),
            links[provider.id] !== undefined
              ? h('button', {
                type: 'button',
                className: 'qqfb_link',
                onClick: () => window.open(links[provider.id], '_blank', 'noopener,noreferrer'),
              }, '弹窗被拦截，点这里打开授权页')
              : null,
            owned.map((account) => h('div', { key: account.id, className: 'qqfb_account' },
              account.source === undefined
                ? h('span', { className: 'qqfb_pending' }, '未完成登录')
                : h('span', null, account.nickname ?? account.id),
              h('span', { className: 'qqfb_accountId' }, account.id),
              h('button', {
                type: 'button',
                className: 'qqfb_link',
                onClick: () => void remove(account.id),
              }, '删除'),
            )),
          );
        })),
  );
}

/**
 * 设置页。
 *
 * @param {{rpcCall: (endpoint: string, payload: object, signal?: AbortSignal) => Promise<any>}} props
 */
export function DeepSeekSettingsPage({ rpcCall, channelRpc }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  /** 已登录账号快照 —— 用来给车道徽章判定「是否登录」。 */
  const [accounts, setAccounts] = useState(null);

  const handleAccounts = useCallback((next) => setAccounts(next), []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await rpcCall(MODEL_LANE_ENDPOINTS.status, {});
      if (result?.ok !== true) throw new Error(result?.error?.message ?? '读取车道状态失败');
      setState(result.value);
    } catch (cause) {
      setError(cause?.message ?? String(cause));
    } finally {
      setLoaded(true);
    }
  }, [rpcCall]);

  useEffect(() => {
    void load();
  }, [load]);

  /** 统一处理「发一个变更请求并应用返回的新状态」。 */
  const mutate = useCallback(async (endpoint, payload) => {
    setBusy(true);
    setError(null);
    try {
      const result = await rpcCall(endpoint, payload);
      if (result?.ok !== true) throw new Error(result?.error?.message ?? '设置未生效');
      setState(result.value);
    } catch (cause) {
      setError(cause?.message ?? String(cause));
    } finally {
      setBusy(false);
    }
  }, [rpcCall]);

  // ⚠️ 不要在这里整页 return 「加载中」。
  //
  // 车道状态要一次 RPC，而**账号登录面板**是用户最需要先看到的东西 —— 把它
  // 藏在车道状态后面，用户会先看到一个空页面、然后以为哪里又坏了。
  //
  // 所以：整页始终渲染，只有依赖车道状态的那几块在加载时显示占位。
  const loading = state === null;
  const pack = channelPackBadge(state?.channelPack);
  const lanes = Array.isArray(state?.lanes) ? state.lanes : [];
  const channels = Array.isArray(state?.channels) ? state.channels : [];

  return h('section', { className: 'qqfb_page', 'aria-label': '免充值 DeepSeek 设置' },
    h('header', { className: 'qqfb_head' },
      h('strong', null, '免充值 DeepSeek'),
      h('p', null,
        'QQ 机器人只使用 DeepSeek 模型。这些模型来自各账号渠道的官方免费额度，'
        + '按下面的顺序依次尝试，前一条不可用就自动换下一条。'),
    ),

    error !== null ? h('div', { className: 'qqfb_error', role: 'alert' }, error) : null,

    h('div', { className: 'qqfb_card' },
      h('div', { className: 'qqfb_cardTitle' }, '账号渠道', h(Badge, pack)),
      loading
        ? h('div', { className: 'qqfb_empty' }, '正在读取渠道状态…')
        : h('div', { className: 'qqfb_meta' },
          h('span', null, '已挂载渠道服务 ', h('b', null, String(channels.length))),
          h('span', null, '生效车道 ', h('b', null, String(state.effective?.length ?? 0))),
        ),
      h('div', { className: 'qqfb_hint' },
        channels.length === 0
          ? '还没有渠道挂上。渠道包挂载成功后会在这里列出；下面的登录面板可直接登录。'
          : `已挂载：${channels.join('、')}。`),
    ),

    // 登录面板必须先于降级顺序出现：没有账号就没有车道，顺序先摆出来是空的。
    channelRpc
      ? h(AccountChannels, {
        channelRpc,
        onChanged: () => void load(),
        onAccounts: handleAccounts,
      })
      : null,

    h('div', { className: 'qqfb_card' },
      h('div', { className: 'qqfb_cardTitle' }, '降级顺序'),
      h('div', { className: 'qqfb_hint' },
        '越靠前越优先。某条车道在吐出第一个字之前失败（积分用完、登录过期、超时），'
        + '就会自动换下一条，聊天里看不出来。'),
      loading
        ? h('div', { className: 'qqfb_empty' }, '正在读取车道…')
        : lanes.length === 0
        ? h('div', { className: 'qqfb_empty' }, '没有车道。点「恢复默认顺序」重新生成。')
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 } },
          lanes.map((lane) => h(LaneRow, {
            key: `${lane.provider}::${lane.model}`,
            lane,
            busy,
            total: lanes.length,
            onMove: (index, to) => void mutate(MODEL_LANE_ENDPOINTS.move, { index, to }),
            onToggle: (index) => void mutate(MODEL_LANE_ENDPOINTS.toggle, { index }),
            loggedIn: accounts === null
              ? undefined
              : accounts.some((account) => account.provider === lane.provider
                && account.source !== undefined),
          }))),
    ),

    h('div', { className: 'qqfb_card' },
      h('div', { className: 'qqfb_cardTitle' }, '免费兜底'),
      h('label', { className: 'qqfb_switch' },
        h('input', {
          type: 'checkbox',
          checked: state?.fallback?.enabled === true,
          disabled: busy || loading,
          onChange: (event) => void mutate(MODEL_LANE_ENDPOINTS.fallback, {
            enabled: event.target.checked,
          }),
        }),
        '所有 DeepSeek 车道都不可用时，用 Kilo 公共免费池兜底回答',
      ),
      h('div', { className: 'qqfb_hint' },
        '兜底车道用的是非 DeepSeek 模型（Kilo 官方标注免费、无需账号），'
        + '只为了让机器人「至少还能回一句话」，不会出现在模型选择器里。'),
    ),

    h('div', { className: 'qqfb_actions' },
      h('button', {
        type: 'button',
        className: 'qqfb_btn',
        disabled: busy || loading,
        onClick: () => void mutate(MODEL_LANE_ENDPOINTS.reset, {}),
      }, '恢复默认顺序'),
      h('button', {
        type: 'button',
        className: 'qqfb_btn',
        disabled: busy,
        onClick: () => void load(),
      }, loading ? '重试读取' : '刷新'),
    ),
  );
}

/**
 * 安装本页的样式。
 *
 * 页面本身不再单独注册 `settings.section` —— 它作为「QQ 机器人」设置页里的
 * 第二个 tab 出现（见 `plugin-src/client/index.js` 的 MODEL_TAB）。用户装的
 * 是一个插件，就该看到一页设置。
 *
 * @returns {Function} 清理函数
 */
export function installDeepSeekStyles() {
  return installStyles();
}

export { SECTION_ID, SECTION_ORDER };
