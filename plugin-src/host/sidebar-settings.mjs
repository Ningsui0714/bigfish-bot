import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { registerManagementRpc } from '../management-rpc.mjs';

// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/feishu/plugin-config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/weixin/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/dingtalk/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/wecom/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/wecom-app/config-store.mjs）
import { QqConfigStore } from '../../src/channels/qq/config-store.mjs';
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/slack/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/telegram/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/discord/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/whatsapp/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/imessage/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/email/config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/matrix/matrix-config-store.mjs）
// [dsh-qq-free-bot] 裁剪：只保留 QQ 渠道（已移除 ../../src/channels/office/config-store.mjs）

export const SIDEBAR_SETTINGS_RPC_CHANNEL = '/dsh-im-sidebar';
export const SIDEBAR_SETTINGS_ENDPOINTS = Object.freeze({
  get: 'settings.sidebar-entry.get', set: 'settings.sidebar-entry.set',
});
const MODES = new Set(['auto', 'show', 'hide']);
const CHANNEL_STORES = [
  ['qq', QqConfigStore],
];

function dshHome(config) {
  return resolve(config.dshHome ?? process.env.DSH_HOME ?? join(homedir(), '.dsh'));
}

/** Read saved accounts, not connection state or workspace history. An offline
 * bot still counts; an unfinished QR login does not. Reuse each channel's schema
 * and the same per-channel path overrides as production. */
export async function hasConfiguredChannel(config = {}) {
  const results = await Promise.allSettled(CHANNEL_STORES.map(async ([key, Store, channel = key]) => {
    const options = { dshHome: dshHome(config), ...config[key] };
    const root = resolve(options.dataDir ?? join(dshHome(options), 'integrations', `dsh-${channel}`));
    const store = await new Store(resolve(options.configPath ?? join(root, 'config.json'))).load();
    return key === 'office' ? store.get() !== null : store.list().length > 0;
  }));
  if (results.some((result) => result.status === 'fulfilled' && result.value)) return true;
  // Unknown configuration must not be mistaken for deleting the last channel.
  const failed = results.find((result) => result.status === 'rejected');
  if (failed) throw failed.reason;
  return false;
}

export class SidebarSettingsStore {
  #path;
  #writes = Promise.resolve();
  constructor(path) { this.#path = path; }

  async get() {
    let raw;
    try { raw = await readFile(this.#path, 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') return 'auto'; throw error; }
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !MODES.has(value.mode)) throw new Error('Invalid sidebar settings');
    return value.mode;
  }

  async set(mode) {
    if (!MODES.has(mode)) throw new TypeError('Invalid sidebar mode');
    const operation = this.#writes.catch(() => {}).then(async () => {
      await mkdir(dirname(this.#path), { recursive: true, mode: 0o700 });
      const temporary = `${this.#path}.${randomUUID()}.tmp`;
      try {
        await writeFile(temporary, `${JSON.stringify({ version: 1, mode }, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
        await rename(temporary, this.#path);
      } finally { await rm(temporary, { force: true }); }
      return mode;
    });
    this.#writes = operation;
    return operation;
  }
}

export function createSidebarSettingsRpcHandler({ config = {}, store, configured } = {}) {
  store ??= new SidebarSettingsStore(join(dshHome(config), 'integrations', 'dsh-im', 'sidebar-settings.json'));
  configured ??= () => hasConfiguredChannel(config);
  return async (endpoint, payload, signal) => {
    const valid = payload && typeof payload === 'object' && !Array.isArray(payload)
      && (endpoint === SIDEBAR_SETTINGS_ENDPOINTS.get ? Object.keys(payload).length === 0
        : endpoint === SIDEBAR_SETTINGS_ENDPOINTS.set && Object.keys(payload).length === 1 && MODES.has(payload.mode));
    if (!valid) return { ok: false, error: { code: 'bad-request', message: 'Invalid sidebar settings.' } };
    if (signal?.aborted) return { ok: false, error: { code: 'cancelled', message: 'Request cancelled.' } };
    try {
      const mode = endpoint === SIDEBAR_SETTINGS_ENDPOINTS.set ? payload.mode : await store.get();
      const visible = mode === 'show' || (mode === 'auto' && !await configured());
      if (endpoint === SIDEBAR_SETTINGS_ENDPOINTS.set) await store.set(mode);
      return { ok: true, value: { mode, visible } };
    } catch {
      return { ok: false, error: { code: 'sidebar-settings-unavailable', message: '无法读取或保存侧边栏设置，请稍后重试。' } };
    }
  };
}

export function installSidebarSettingsRpc(ctx, { config = {} } = {}) {
  // Visibility follows ordinary channel management authority. Keep it separate
  // from the general settings route, whose TTL operations remain loopback-only.
  return registerManagementRpc(ctx, SIDEBAR_SETTINGS_RPC_CHANNEL,
    createSidebarSettingsRpcHandler({ config }), { authority: config.rpcAuthority });
}
