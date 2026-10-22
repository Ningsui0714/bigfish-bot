import { callManagementRpc } from '../management-rpc.mjs';
import * as React from 'react';
import manifest from '../../package.json' with { type: 'json' };
import { DeepSeekSettingsPage } from '../../src/product/client/deepseek-settings.js';

import {
  QqLogoGlyph,
} from './channel-logos.js';
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/dingtalk/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/dingtalk/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/discord/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/discord/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/discord/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/feishu/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/feishu/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/feishu/styles.js）
import { QQ_RPC_CHANNEL } from './channels/qq/api.js';
import { QqSettingsTab } from './channels/qq/index.js';
import { installQqStyles } from './channels/qq/styles.js';
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/office/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/office/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/office/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/slack/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/slack/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/slack/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/telegram/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/telegram/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/telegram/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/wecom/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/wecom/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/wecom/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/wecom-app/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/wecom-app/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/wecom-app/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/weixin/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/weixin/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/weixin/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/whatsapp/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/whatsapp/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/whatsapp/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/imessage/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/email/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/imessage/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/email/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/imessage/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/email/styles.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/matrix/api.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/matrix/index.js）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ./channels/matrix/styles.js）
import { en, h, IM_LOCALE_NAMESPACE, setImTranslator, zh } from './i18n.js';
import {
  HOST_LANGUAGE_RPC_CHANNEL,
  installInterfaceLanguageMirror,
} from './interface-language.js';
import { BotSettingsContext } from './channel-card-meta.js';
import {
  DELIVERY_RPC_CHANNEL,
  DeliveryTargetSettingsPage,
} from './delivery-settings.js';
import {
  GLOBAL_SETTINGS_RPC_CHANNEL,
  GLOBAL_SETTINGS_TAB_ID,
  GlobalSettingsLogoGlyph,
  GlobalSettingsPanel,
} from './global-settings.js';
import {
  createLoopbackAwareRpcCalls,
  replacePageLocation,
} from './loopback-recovery.js';
import { installImStyles } from './styles.js';
import { installSessionChannelLogos } from './session-channel-logos.js';
import { installDsBotSessionAvatars } from './ds-bot-session-avatars.js';
import { UpdatePanel, UPDATE_RPC_CHANNEL } from './update-panel.js';
import { WorkspaceDirectoryPickerContext } from './workspace-editor.js';
import { IMPanelErrorBoundary } from './panel-error-boundary.js';
import { installImPluginPage } from './plugin-page.js';
import { installSidebarVisibilitySync, SIDEBAR_SETTINGS_ENDPOINTS, SIDEBAR_SETTINGS_RPC_CHANNEL } from './sidebar-settings.js';

export const name = 'im-settings';
export const inject = ['slots', 'connection', 'locale', 'workspaces'];
export const IM_PLUGIN_VERSION = manifest.version;

function callWorkspaceDirectoryApi(ctx, method, ...args) {
  // Current DSH owns directory operations on uiWorkspace; legacy Hosts keep them on workspaces.
  const uiWorkspace = typeof ctx.get === 'function' ? ctx.get('uiWorkspace') : undefined;
  const service = typeof uiWorkspace?.[method] === 'function' ? uiWorkspace : ctx.workspaces;
  if (typeof service?.[method] !== 'function') {
    throw new Error('无法读取目录，请重试。');
  }
  return service[method](...args);
}

const CHANNELS = Object.freeze([
  { id: 'qq', label: 'QQ' },
]);

/**
 * 第二个 tab：免充值 DeepSeek 的车道设置。
 *
 * 它不是 IM 渠道，但和机器人在**同一个设置页**里 —— 用户装的是一个插件，
 * 就该看到一页设置。
 */
const MODEL_TAB = Object.freeze({ id: 'deepseek', label: '免充值 DeepSeek', note: '车道与兜底' });

/** rail 里的全部 tab：QQ 渠道 + 模型车道。 */
const RAIL_TABS = [ ...CHANNELS, MODEL_TAB ];

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Weixin）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Feishu）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Dingtalk）

function QqLogo() {
  return h('span', { className: 'dim-logo dim-logoQq', 'aria-hidden': 'true' }, h(QqLogoGlyph));
}

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Wecom）

function WecomAppLogo() {
  return h('span', { className: 'dim-logo dim-logoWecomApp', 'aria-hidden': 'true' }, h(WecomLogoGlyph));
}

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Telegram）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Slack）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Discord）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Whatsapp）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 IMessage）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Email）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Matrix）

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 Office）

function ModelGlyph() {
  return h('svg', {
    width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
    focusable: 'false', 'aria-hidden': 'true',
  }, h('path', { d: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z' }));
}

function ChannelLogo({ channel }) {
  if (channel === 'deepseek') return h(ModelGlyph);
  return h(QqLogo);
}

export function LoopbackRecoveryNotice({ recovery, onNavigate = replacePageLocation }) {
  return h('div', {
    className: 'dim-loopbackRecovery',
    role: 'alert',
  },
  h('div', { className: 'dim-loopbackRecoveryCopy' },
    h('strong', null, '请改用 localhost 重新打开'),
    h('p', null, '页面会在当前端口重新打开，机器人配置不会改变。'),
    h('code', null, recovery.origin)),
  h('button', {
    type: 'button',
    className: 'dim-loopbackRecoveryAction',
    onClick: () => onNavigate(recovery.url),
  }, '使用 localhost 重新打开'));
}

export function IMSettingsTab({
  dingtalkRpcCall,
  discordRpcCall,
  feishuRpcCall,
  imessageRpcCall,
  emailRpcCall,
  matrixRpcCall,
  qqRpcCall,
  slackRpcCall,
  telegramRpcCall,
  wecomRpcCall,
  wecomAppRpcCall,
  weixinRpcCall,
  whatsappRpcCall,
  officeRpcCall,
  updateRpcCall,
  deliveryRpcCall,
  globalSettingsRpcCall,
  workspaceDirectoryPicker,
  laneRpcCall,
  channelRpcCall,
  preferredSectionId,
  browserLocation = globalThis.location,
  navigateToRecoveryUrl = replacePageLocation,
}) {
  const [selected, setSelected] = React.useState(() => (
    preferredSectionId === GLOBAL_SETTINGS_TAB_ID
      || RAIL_TABS.some((tab) => tab.id === preferredSectionId)
      ? preferredSectionId : RAIL_TABS[0].id
  ));
  const [loopbackRecovery, setLoopbackRecovery] = React.useState(null);
  const [runningVersion, setRunningVersion] = React.useState(IM_PLUGIN_VERSION);
  const [deliverySettings, setDeliverySettings] = React.useState(null);
  // [dsh-qq-free-bot] 裁剪：邮箱渠道不存在，不需要它的可用性判断。
  const visibleChannels = RAIL_TABS;
  const githubTooltipId = React.useId();
  const generalSettingsTooltipId = React.useId();
  const globalSettingsSelected = selected === GLOBAL_SETTINGS_TAB_ID;
  const active = visibleChannels.find((channel) => channel.id === selected) ?? visibleChannels[0];
  const activeTabId = globalSettingsSelected
    ? 'dim-general-settings-trigger'
    : `dim-tab-${active.id}`;
  const activePanelId = globalSettingsSelected
    ? `dim-panel-${GLOBAL_SETTINGS_TAB_ID}`
    : `dim-panel-${active.id}`;
  const reportLoopbackRecovery = React.useCallback((recovery) => {
    setLoopbackRecovery((current) => current?.url === recovery.url ? current : recovery);
  }, []);
  const reportUpdateStatus = React.useCallback((snapshot) => {
    setRunningVersion(snapshot.runningVersion);
  }, []);
  const rpcCalls = React.useMemo(() => createLoopbackAwareRpcCalls({
    dingtalkRpcCall,
    discordRpcCall,
    feishuRpcCall,
    qqRpcCall,
    slackRpcCall,
    telegramRpcCall,
    wecomRpcCall,
    wecomAppRpcCall,
    weixinRpcCall,
    whatsappRpcCall,
    officeRpcCall,
    updateRpcCall,
    deliveryRpcCall,
    globalSettingsRpcCall,
    imessageRpcCall,
    emailRpcCall,
    matrixRpcCall,
  }, {
    location: browserLocation,
    onRecovery: reportLoopbackRecovery,
  }), [
    browserLocation,
    dingtalkRpcCall,
    discordRpcCall,
    deliveryRpcCall,
    feishuRpcCall,
    globalSettingsRpcCall,
    imessageRpcCall,
    emailRpcCall,
    matrixRpcCall,
    officeRpcCall,
    qqRpcCall,
    reportLoopbackRecovery,
    slackRpcCall,
    telegramRpcCall,
    updateRpcCall,
    wecomRpcCall,
    wecomAppRpcCall,
    weixinRpcCall,
    whatsappRpcCall,
  ]);
  const botSettingsContext = React.useMemo(() => Object.freeze({
    openBotSettings: setDeliverySettings,
  }), []);
  return h(WorkspaceDirectoryPickerContext.Provider, { value: workspaceDirectoryPicker },
    h('section', { className: 'dim-page', 'aria-label': 'QQ 机器人设置' },
    h('header', { className: 'dim-title' },
      h('div', { className: 'dim-brand' },
        h('div', { className: 'dim-brandHeading' },
          h('strong', { className: 'dim-brandName' }, 'QQ 机器人'),),
        h('p', null, '扫码接入 QQ，模型走免充值 DeepSeek')),
      h('div', { className: 'dim-titleActions' },
        
      
      h('span', { className: 'dim-generalSettingsAction' },
        h('button', {
          type: 'button',
          id: 'dim-general-settings-trigger',
          className: 'dim-generalSettingsButton',
          'aria-label': '通用设置',
          'aria-describedby': generalSettingsTooltipId,
          'aria-controls': `dim-panel-${GLOBAL_SETTINGS_TAB_ID}`,
          'aria-current': globalSettingsSelected ? 'page' : undefined,
          onClick: () => {
            setSelected(GLOBAL_SETTINGS_TAB_ID);
            setDeliverySettings(null);
          },
        }, h(GlobalSettingsLogoGlyph, { size: 17 })),
        h('span', {
          id: generalSettingsTooltipId,
          className: 'dim-generalSettingsTooltip',
          role: 'tooltip',
        }, '通用设置')))
    ),
    h('div', { className: 'dim-layout' },
      h('nav', { className: 'dim-rail', role: 'tablist', 'aria-label': '设置导航' },
        visibleChannels.map((channel) => h('button', {
          key: channel.id,
          type: 'button',
          role: 'tab',
          id: `dim-tab-${channel.id}`,
          className: 'dim-channel',
          'aria-selected': !globalSettingsSelected && channel.id === active.id,
          'aria-controls': `dim-panel-${channel.id}`,
          onClick: () => {
            setSelected(channel.id);
            setDeliverySettings(null);
          },
        },
        h(ChannelLogo, { channel: channel.id }),
        h('span', { className: 'dim-channelCopy' },
          h('strong', null, channel.label),
          channel.note ? h('small', { className: 'dim-channelNote' }, channel.note) : null,
        )))),
      h('div', { className: 'dim-divider', 'aria-hidden': 'true' }),
      h('main', {
        className: 'dim-panel',
        role: 'tabpanel',
        id: activePanelId,
        'aria-labelledby': activeTabId,
      },
      loopbackRecovery
        ? h(LoopbackRecoveryNotice, {
            recovery: loopbackRecovery,
            onNavigate: navigateToRecoveryUrl,
          })
        : null,
      h(BotSettingsContext.Provider, { value: botSettingsContext },
        globalSettingsSelected
          ? h(GlobalSettingsPanel, { rpcCall: rpcCalls.globalSettingsRpcCall })
          : deliverySettings?.channel === active.id
          ? h(DeliveryTargetSettingsPage, {
              channel: active.id,
              account: deliverySettings,
              rpcCall: rpcCalls.deliveryRpcCall,
              accessRpcCall: rpcCalls[`${active.id}RpcCall`],
              onBack: () => setDeliverySettings(null),
            })
          // [dsh-qq-free-bot] 裁剪：上游按 14 个渠道分派设置页，本产品只保留 QQ。
: active.id === 'deepseek'
                    ? h(DeepSeekSettingsPage, { rpcCall: laneRpcCall, channelRpc: channelRpcCall })
                    : h(QqSettingsTab, { rpcCall: rpcCalls.qqRpcCall }))),
    ),
  ));
}

export function apply(ctx, options = {}) {
  const laneRpcCall = options.laneRpcCall ?? null;
  const channelRpcCall = options.channelRpcCall ?? null;
  ctx.effect(
    () => ctx.locale.register(IM_LOCALE_NAMESPACE, { zh, en }),
    'im-settings: bilingual dictionaries',
  );
  const t = ctx.locale.bind(IM_LOCALE_NAMESPACE);
  setImTranslator(t);

  // The settings page is the only place that knows the locale the interface is
  // actually rendered in: DSH stores nothing when it came from the browser's
  // language list. Report it so bot messages follow the same language.
  ctx.effect(
    () => installInterfaceLanguageMirror(ctx, {
      rpcCall: (endpoint, payload, signal) =>
        callManagementRpc(ctx.connection, HOST_LANGUAGE_RPC_CHANNEL, endpoint, payload, signal),
    }),
    'im-settings: mirror the DSH interface language',
  );

  ctx.effect(() => installSessionChannelLogos(), 'im-settings: Session channel logos');
  let dsBotAvatars;
  ctx.effect(() => {
    dsBotAvatars = installDsBotSessionAvatars(ctx, {
      rpcCall: (endpoint, payload, signal) =>
        callManagementRpc(ctx.connection, DELIVERY_RPC_CHANNEL, endpoint, payload, signal),
    });
    return () => { dsBotAvatars.dispose(); dsBotAvatars = null; };
  }, 'im-settings: bound DS Bot session avatars');

  ctx.effect(() => {
    const disposers = [
      installQqStyles(),
      installImStyles(),
    ];
    return () => {
      for (const dispose of disposers.reverse()) dispose();
    };
  }, 'im-settings: install combined channel styles');

  let sidebarSync;
  const managementRpc = async (connection, channel, endpoint, payload, signal) => {
    const result = await callManagementRpc(connection, channel, endpoint, payload, signal);
    if (result?.ok === true) {
      const dsBotRead = channel === DELIVERY_RPC_CHANNEL && endpoint === 'ds-bot.status';
      if (channel === DELIVERY_RPC_CHANNEL && ['ds-bot.bind', 'ds-bot.unbind'].includes(endpoint)) dsBotAvatars?.refresh();
      if (endpoint === SIDEBAR_SETTINGS_ENDPOINTS.set) sidebarSync?.apply(result);
      else if (!dsBotRead && endpoint !== SIDEBAR_SETTINGS_ENDPOINTS.get) sidebarSync?.refresh();
    }
    return result;
  };
  const feishuRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, FEISHU_RPC_CHANNEL, endpoint, payload, signal);
  const weixinRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, WEIXIN_RPC_CHANNEL, endpoint, payload, signal);
  const dingtalkRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, DINGTALK_RPC_CHANNEL, endpoint, payload, signal);
  const qqRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, QQ_RPC_CHANNEL, endpoint, payload, signal);
  const wecomRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, WECOM_RPC_CHANNEL, endpoint, payload, signal);
  const wecomAppRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, WECOM_APP_RPC_CHANNEL, endpoint, payload, signal);
  const telegramRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, TELEGRAM_RPC_CHANNEL, endpoint, payload, signal);
  const discordRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, DISCORD_RPC_CHANNEL, endpoint, payload, signal);
  const whatsappRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, WHATSAPP_RPC_CHANNEL, endpoint, payload, signal);
  const imessageRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, IMESSAGE_RPC_CHANNEL, endpoint, payload, signal);
  const emailRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, EMAIL_RPC_CHANNEL, endpoint, payload, signal);
  const matrixRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, MATRIX_RPC_CHANNEL, endpoint, payload, signal);
  const slackRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, SLACK_RPC_CHANNEL, endpoint, payload, signal);
  const officeRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, OFFICE_RPC_CHANNEL, endpoint, payload, signal);
  const updateRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, UPDATE_RPC_CHANNEL, endpoint, payload, signal);
  const deliveryRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, DELIVERY_RPC_CHANNEL, endpoint, payload, signal);
  const globalSettingsRpcCall = (endpoint, payload, signal) =>
    managementRpc(ctx.connection, Object.values(SIDEBAR_SETTINGS_ENDPOINTS).includes(endpoint)
      ? SIDEBAR_SETTINGS_RPC_CHANNEL : GLOBAL_SETTINGS_RPC_CHANNEL, endpoint, payload, signal);
  const workspaceDirectoryPicker = Object.freeze({
    listDirectory: (path, signal) =>
      callWorkspaceDirectoryApi(ctx, 'listDirectory', path, signal),
    pickDirectory: () => callWorkspaceDirectoryApi(ctx, 'pickDirectory'),
  });

  const panelDependencies = {
    dingtalkRpcCall,
    discordRpcCall,
    feishuRpcCall,
    qqRpcCall,
    slackRpcCall,
    telegramRpcCall,
    wecomRpcCall,
    wecomAppRpcCall,
    weixinRpcCall,
    whatsappRpcCall,
    imessageRpcCall,
    officeRpcCall,
    emailRpcCall,
    matrixRpcCall,
    updateRpcCall,
    deliveryRpcCall,
    globalSettingsRpcCall,
    workspaceDirectoryPicker,
    laneRpcCall,
    channelRpcCall,
  };
  const subscribeLocale = (listener) => typeof ctx.on === 'function'
    ? ctx.on('locale/change', listener) : () => {};
  const localeSnapshot = () => ctx.locale.getLocale?.()?.active ?? '';

  // Stable for this plugin lifetime: creating an element must not create a
  // new component type and reset the reader's selected tab or unsaved input.
  function IMPanel({ preferredSectionId }) {
    React.useSyncExternalStore(subscribeLocale, localeSnapshot, localeSnapshot);
    return h(IMPanelErrorBoundary, null,
      h(IMSettingsTab, { ...panelDependencies, preferredSectionId }));
  }
  const buildPanelElement = (props = {}) => h(IMPanel, {
    preferredSectionId: props.preferredSectionId,
  });

  const pluginPage = installImPluginPage(ctx, {
    packageName: manifest.name,
    renderPanel: buildPanelElement,
  });

  ctx.effect(() => {
    sidebarSync = installSidebarVisibilitySync({
      rpcCall: (endpoint, payload, signal) =>
        callManagementRpc(ctx.connection, SIDEBAR_SETTINGS_RPC_CHANNEL, endpoint, payload, signal),
      setVisible: (visible) => pluginPage.setSidebarVisible(visible),
    });
    return () => { sidebarSync.dispose(); sidebarSync = null; };
  }, 'im-settings: sidebar visibility');

  ctx.effect(() => {
    let disposed = false;
    let stopSettings = null;
    let registered = false;
    const setSettingsVisible = (visible) => {
      if (disposed) return;
      if (typeof visible !== 'boolean') throw new TypeError('visible must be a boolean');
      if (visible === (stopSettings !== null)) return;
      if (!visible) {
        const stop = stopSettings;
        stopSettings = null;
        stop();
        return;
      }
      // The existing slot controller owns late declarations, withdrawal and
      // re-declaration. Cancelling it also cancels a pending registration.
      stopSettings = ctx.slots.inject('settings.section', () => {
        const unregister = ctx.slots.register({
          name: 'settings.section',
          id: 'dsh-qq-free-bot',
          order: 22,
          label: () => 'QQ 机器人',
          locale: IM_LOCALE_NAMESPACE,
          inject: () => panelDependencies,
        }, buildPanelElement);
        registered = true;
        return () => {
          registered = false;
          unregister();
        };
      });
    };

    // Publish only after the default registration is established, so a
    // consumer hiding it during service discovery cannot be overridden.
    setSettingsVisible(true);
    if (typeof ctx.provide === 'function') {
      ctx.provide('dshImClient', Object.freeze({
        version: 1,
        render: (props) => disposed ? null : buildPanelElement(props),
        setSettingsVisible,
        settingsVisible: () => !disposed && registered,
      }));
    }
    return () => {
      disposed = true;
      const stop = stopSettings;
      stopSettings = null;
      registered = false;
      stop?.();
    };
  }, 'im-settings: client panel service');
}
