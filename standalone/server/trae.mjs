/**
 * Experimental TRAE CN client-protocol adapter, independent of DSH.
 * Protocol shapes adapted from the MIT channel pack; see vendor/channel-pack/NOTICE.md.
 * Single user account, stable device identity, no identity rotation or risk-control bypass.
 * Endpoints are observations of the bundled client adapter, NOT a public API contract.
 */
import http from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
export const TRAE_PROFILE = Object.freeze({
  console: 'https://www.trae.cn', oauth: 'https://api.trae.com.cn',
  agent: 'https://trae-api-cn.mchost.guru', credits: 'https://api.trae.cn',
  clientId: 'en1oxy7wnw8j9n', appId: '6eefa01c-1036-4c7e-9ca5-d891f63bfcd8',
  version: '0.1.52', versionCode: '20260811', pluginVersion: '2.3.62834',
});
export const TRAE_PATHS = Object.freeze({
  exchange: '/cloudide/api/v3/trae/oauth/ExchangeToken', user: '/cloudide/api/v3/trae/GetUserInfo',
  models: '/api/ide/v1/batch_get_detail_param', chat: '/api/agent/v3/llm_utils_chat',
  checkStatus: '/trae/api/v2/ug/checkin_credits/status', claim: '/trae/api/v2/ug/checkin_credits/claim',
  balance: '/trae/api/v2/pay/ide_user_ent_usage',
});
export const traeDefaults = () => ({ autoCheckin: false, enabled: true, identity: null, credential: null, models: [], balance: null,
  checkin: null, lastError: null, authRequired: false });
export class TraeError extends Error {
  constructor(message, code = 'trae-error') { super(message); this.name = 'TraeError'; this.code = code; }
}
const str = (v, max = 8192) => typeof v === 'string' ? v.slice(0, max) : '';
export function normalizeTraeState(value) {
  const d = traeDefaults();
  if (!value || typeof value !== 'object') return d;
  d.autoCheckin = value.autoCheckin === true; d.enabled = value.enabled !== false;
  if (/^[a-f0-9]{32}$/.test(value.identity?.machineId ?? '') && /^[a-f0-9]{32}$/.test(value.identity?.deviceId ?? '')) d.identity = { machineId: value.identity.machineId, deviceId: value.identity.deviceId };
  const c = value.credential;
  if (d.identity && c && str(c.accessToken) && str(c.uid, 128)) d.credential = {
    accessToken: str(c.accessToken), refreshToken: str(c.refreshToken), uid: str(c.uid, 128), nickname: str(c.nickname, 128),
    expiresAt: Number.isFinite(c.expiresAt) && c.expiresAt >= 0 ? c.expiresAt : 0,
  };
  d.models = Array.isArray(value.models) ? value.models.filter(m => m && typeof m.id === 'string' && typeof m.channel === 'string')
    .slice(0, 128).map(m => ({ id: str(m.id, 200), name: str(m.name, 200), channel: str(m.channel, 64) })) : [];
  d.balance = value.balance && (value.balance.total === null || Number.isFinite(value.balance.total)) ? { total: value.balance.total, updatedAt: str(value.balance.updatedAt, 80) } : null;
  d.checkin = value.checkin && /^\d{4}-\d{2}-\d{2}$/.test(value.checkin.day) ? {
    day: value.checkin.day, phase: str(value.checkin.phase, 40), at: str(value.checkin.at, 80),
    retryAt: Number.isFinite(value.checkin.retryAt) ? value.checkin.retryAt : 0,
    credit: Number.isFinite(value.checkin.credit) ? value.checkin.credit : null, unit: 'credits', coversToday: value.checkin.coversToday !== false, message: str(value.checkin.message, 300),
  } : null;
  d.lastError = value.lastError ? str(value.lastError, 300) : null;
  d.authRequired = value.authRequired === true;
  return d;
}
export function publicTraeState(value) {
  const d = normalizeTraeState(value);
  return { enabled: d.enabled, autoCheckin: d.autoCheckin, loggedIn: !!d.credential, authRequired: d.authRequired,
    nickname: d.credential?.nickname ?? '', expiresAt: d.credential?.expiresAt ?? 0,
    refreshable: !!d.credential?.refreshToken, models: d.models, balance: d.balance, checkin: d.checkin, lastError: d.lastError };
}
export function shanghaiDay(now = Date.now()) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(now));
  const v = type => p.find(x => x.type === type).value;
  return `${v('year')}-${v('month')}-${v('day')}`;
}
function expires(data, now) {
  const absolute = Number(data.TokenExpireAt ?? data.tokenExpireAt);
  if (absolute > 0) return absolute > 1e12 ? absolute : absolute * 1000;
  const duration = Number(data.TokenExpireDuration ?? data.tokenExpireDuration);
  if (duration > 0) return now + duration * 1000;
  try { const exp = JSON.parse(Buffer.from(String(data.Token ?? '').split('.')[1], 'base64url')).exp; return Number.isFinite(exp) ? exp * 1000 : 0; } catch { return 0; }
}
function parseObject(v) { if (!v) return {}; try { const x = JSON.parse(v); return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; } catch { return {}; } }
export function parseTraeCallback(url) {
  const q = new URL(url, 'http://127.0.0.1').searchParams;
  const user = parseObject(q.get('userInfo')), jwt = parseObject(q.get('userJwt'));
  const refreshToken = q.get('refreshToken') || str(jwt.RefreshToken);
  const accessToken = refreshToken ? '' : str(jwt.Token);
  if (!refreshToken && !accessToken) throw new TraeError(q.has('code') || q.has('authCode') || q.has('authCodeInfo')
    ? 'TRAE 已切换授权码流程，本版适配尚未支持，请勿反复登录重试' : 'TRAE 回调未携带可用授权凭据', 'protocol-changed');
  return { refreshToken, accessToken, uid: String(user.UserID ?? ''), nickname: str(user.ScreenName, 128) };
}
export function parseTraeModels(body) {
  const priority = ['solo_work_lite', 'solo_agent', 'solo_agent_lite', 'chat_v3', 'builder_v3'];
  const result = new Map();
  for (const channel of priority) for (const g of body.function_configs ?? body.FunctionConfigs ?? []) {
    if ((g.function ?? g.Function) !== channel) continue;
    for (const m of g.config_info_list ?? g.ConfigInfoList ?? []) {
      const display = m.display_config ?? m.DisplayConfig ?? {};
      const id = m.config_name ?? m.ConfigName;
      if (typeof id !== 'string' || !id || result.has(id) || m.config_switch === false || m.ConfigSwitch === false
        || m.is_invisible_to_user === true || m.IsInvisibleToUser === true || display.is_custom_model === true || display.IsCustomModel === true
        || ((m.usage ?? m.Usage) && (m.usage ?? m.Usage) !== 'chat_completion')) continue;
      result.set(id, { id: id.slice(0, 200), name: str(display.display_name || id, 200), channel });
    }
  }
  return [...result.values()].slice(0, 128);
}
/** Stable derived IDs reproduce the observed single-account check-in header format. */
function seeded(uid, salt, n) {
  let bytes = Buffer.alloc(0), count = 0;
  while (bytes.length < n) { const b = Buffer.alloc(4); b.writeUInt32BE(count++); bytes = Buffer.concat([bytes, createHash('sha256').update(`${salt}:${uid}`).update(b).digest()]); }
  return bytes.subarray(0, n);
}
function creditHeaders(credential, profile) {
  const b = seeded(credential.uid, 'market', 16); b[6] = b[6] & 15 | 64; b[8] = b[8] & 63 | 128;
  const h = b.toString('hex'), market = `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
  const device = [...seeded(credential.uid, 'devid', 15)].map(n => n % 10).join('');
  return { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Cloud-IDE-JWT ${credential.accessToken}`,
    'User-Agent': 'VSCode 1.107.1 (TRAE SOLO CN)', 'X-Market-Client-Id': 'VSCode 1.107.1',
    'X-Market-User-Id': market, 'X-User-Region': 'CN', 'X-Device-Id': device,
    'X-Lgw-Req-Sdk-Type': '3', 'Package-Type': 'stable_cn', 'X-Lscbd-Aid': '787976', 'X-Lscbd-Platform': 'windows',
    'App-Version': profile.version, 'Vscode-Sessionid': seeded(credential.uid, 'sess', 32).toString('hex') };
}
export async function readBounded(response, max = 1_000_000) {
  if (!response.body) throw new TraeError('TRAE 响应为空', 'protocol-changed');
  const reader = response.body.getReader(), chunks = []; let size = 0;
  try { while (true) { const { value, done } = await reader.read(); if (done) break;
    size += value.length; if (size > max) throw new TraeError('TRAE 响应超过大小上限', 'response-too-large'); chunks.push(value); }
  } finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks).toString();
}
export async function parseTraeStream(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new TraeError('TRAE 未返回流', 'protocol-changed');
  let buffer = '', answer = '', size = 0, event = '', done = false;
  const decoder = new TextDecoder();
  const line = text => {
    if (text.startsWith('event:')) event = text.slice(6).trim();
    if (!text.startsWith('data:')) return;
    let data; try { data = JSON.parse(text.slice(5).trim()); } catch { throw new TraeError('TRAE 流格式变化', 'protocol-changed'); }
    if (event === 'error') throw new TraeError(`TRAE 推理返回错误（${Number(data.code) || '未知'}）`, 'upstream-error');
    if (event === 'output' && typeof data.response === 'string') answer += data.response;
    // Do not truncate completed text by character count; bound transport bytes only.
    if (event === 'done') done = true;
  };
  try {
    while (!done) {
      const chunk = await reader.read();
      if (chunk.done) { buffer += decoder.decode(); if (buffer.trim()) line(buffer.replace(/\r$/, '')); break; }
      size += chunk.value.length; if (size > 16_000_000) throw new TraeError('TRAE 流超过 16 MB 容量上限', 'response-too-large');
      buffer += decoder.decode(chunk.value, { stream: true });
      let end; while ((end = buffer.indexOf('\n')) >= 0) { line(buffer.slice(0, end).replace(/\r$/, '')); buffer = buffer.slice(end + 1); if (done) break; }
    }
  } finally { await reader.cancel().catch(() => {}); }
  if (!done || !answer.trim()) throw new TraeError('TRAE 流未正常结束或没有文字答案', 'incomplete-response');
  return answer.trim();
}

export class TraeClient {
  #login = null; #refresh = null; #check = null; #ticker; #busy = false; #epoch = 0;
  #stop = new AbortController();
  constructor({ store, fetchImpl = fetch, now = Date.now, profile = TRAE_PROFILE }) {
    this.store = store; this.fetch = fetchImpl; this.now = now; this.profile = profile;
  }
  state() { return normalizeTraeState(this.store.get().trae); }
  status() { return { ...publicTraeState(this.state()), login: this.#login ? { state: this.#login.phase, expiresAt: this.#login.expiresAt, url: this.#login.url } : null }; }
  async #patch(patch) { await this.store.patchTrae(patch); }
  #checkEpoch(epoch) { if (epoch !== this.#epoch || this.#stop.signal.aborted) throw new TraeError('TRAE 操作已取消', 'cancelled'); }
  async #request(host, path, body, headers, signal) {
    let response;
    try { response = await this.fetch(`${host}${path}`, { method: 'POST', redirect: 'error', headers, body: JSON.stringify(body),
      signal: AbortSignal.any([this.#stop.signal, AbortSignal.timeout(60_000), ...(signal ? [signal] : [])]) }); }
    catch { signal?.throwIfAborted();this.#stop.signal.throwIfAborted();throw new TraeError('TRAE 网络请求失败或超时', 'network'); }
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      if (response.status === 401) throw new TraeError('TRAE 登录已失效，请重新授权', 'auth-required');
      if (response.status === 403 || response.status === 429) throw new TraeError(`TRAE 风控或限流（HTTP ${response.status}），请在客户端确认状态`, 'risk-control');
      throw new TraeError(`TRAE HTTP ${response.status}`, 'upstream-error');
    }
    return response;
  }
  async #json(host, path, body, headers, signal, maxBytes = 1_000_000) {
    const response = await this.#request(host, path, body, headers, signal);
    let result; try { result = JSON.parse(await readBounded(response, maxBytes)); } catch (e) { if (e instanceof TraeError) throw e; throw new TraeError('TRAE 返回格式变化', 'protocol-changed'); }
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new TraeError('TRAE 响应结构变化', 'protocol-changed');
    const code = result.code ?? result.Code;
    if (code !== undefined && Number(code) !== 0) throw new TraeError(`TRAE 业务错误（${Number(code) || '未知'}），请在客户端确认`, Number(code) === 9074 ? 'risk-control' : 'upstream-error');
    return result;
  }
  #oauthHeaders() { return { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': `Trae/${this.profile.version}` }; }
  #agentHeaders(c, identity) {
    return { ...this.#oauthHeaders(), Authorization: `Cloud-IDE-JWT ${c.accessToken}`, 'X-Cloudide-Token': c.accessToken,
      'X-Ide-Token': c.accessToken, 'X-Uid': c.uid, 'X-App-Id': this.profile.appId, 'X-App-Version': 'default',
      'X-Ide-Version': this.profile.version, 'X-Ide-Version-Code': this.profile.versionCode, 'X-App-Version-Code': this.profile.versionCode,
      'X-Ide-Version-Type': 'stable', 'X-Device-Type': 'macos', 'X-OS-Version': 'macOS 15.7.4', 'X-Device-Brand': 'Apple',
      'X-Machine-Id': identity.machineId, 'X-Device-Id': identity.deviceId, 'Request-Traffic-Type': 'prod' };
  }
  async #exchange(refreshToken) {
    const data = await this.#json(this.profile.oauth, TRAE_PATHS.exchange,
      { ClientID: this.profile.clientId, RefreshToken: refreshToken, ClientSecret: '-', UserID: '' }, this.#oauthHeaders());
    const r = data.Result ?? data.result;
    const accessToken = str(r?.Token ?? r?.token ?? r?.accessToken);
    if (!accessToken) throw new TraeError('TRAE 换取登录凭据失败，协议可能变化', 'protocol-changed');
    return { accessToken, refreshToken: str(r.RefreshToken ?? r.refreshToken) || refreshToken, expiresAt: expires(r, this.now()) };
  }
  async credential() {
    const state = this.state(), c = state.credential;
    if (!c || state.authRequired) throw new TraeError('请先登录 TRAE 中国版账号', 'auth-required');
    if (!c.expiresAt || c.expiresAt > this.now() + 120_000) return c;
    return this.refresh();
  }
  refresh() {
    if (this.#refresh) return this.#refresh;
    const epoch = this.#epoch;
    this.#refresh = (async () => {
      const c = this.state().credential;
      if (!c?.refreshToken) throw new TraeError('TRAE 登录不支持续期，请重新授权', 'auth-required');
      try {
        const result = await this.#exchange(c.refreshToken); this.#checkEpoch(epoch);
        await this.#patch({ credential: { ...c, ...result }, lastError: null, authRequired: false });
        return { ...c, ...result };
      } catch (e) { if (epoch === this.#epoch && e.code === 'auth-required') await this.#patch({ authRequired: true, lastError: e.message }); throw e; }
    })().finally(() => { this.#refresh = null; });
    return this.#refresh;
  }
  async #authorized(host, path, body, credit = false, signal) {
    let c = await this.credential();
    const run = () => this.#json(host, path, body, credit ? creditHeaders(c, this.profile) : this.#agentHeaders(c, this.state().identity), signal, path === TRAE_PATHS.models ? 16_000_000 : 1_000_000);
    try { return await run(); }
    catch (e) { if (e.code !== 'auth-required') throw e; c = await this.refresh(); return run(); }
  }
  async beginLogin({ port = 0, ttlMs = 600_000 } = {}) {
    this.cancelLogin(); this.#epoch++;
    const epoch = this.#epoch;
    let identity = this.state().identity;
    if (!identity) { identity = { machineId: randomBytes(16).toString('hex'), deviceId: randomBytes(16).toString('hex') }; await this.#patch({ identity }); }
    // The official authorization page accepts ONLY /authorize (no suffix/query).
    // Bind the one-shot callback via login_trace_id, which it echoes as loginTraceID.
    const nonce = randomBytes(24).toString('hex'), path = '/authorize';
    const server = http.createServer();
    const session = { server, phase: 'waiting', expiresAt: this.now() + ttlMs, timer: null };
    this.#login = session;
    const finish = () => { clearTimeout(session.timer); server.close(); if (this.#login === session) this.#login = null; };
    server.on('request', async (req, res) => {
      res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
      const host = `127.0.0.1:${server.address()?.port}`;
      const url = new URL(req.url ?? '/', `http://${host}`);
      if (req.method !== 'GET' || req.headers.host !== host || url.pathname !== path || this.#login !== session) { res.writeHead(404); res.end('无效的授权回调'); return; }
      if (url.searchParams.getAll('loginTraceID').length !== 1 || url.searchParams.get('loginTraceID') !== nonce) {
        res.writeHead(403); res.end('授权会话不匹配，请从大肥鱼重新打开授权页面'); return;
      }
      if (session.phase !== 'waiting') { res.writeHead(409); res.end('授权正在处理中'); return; }
      session.phase = 'exchanging';
      try {
        const cb = parseTraeCallback(url.href);
        const c = cb.refreshToken ? await this.#exchange(cb.refreshToken) : { accessToken: cb.accessToken, refreshToken: '', expiresAt: expires({ Token: cb.accessToken }, this.now()) };
        const userData = await this.#json(this.profile.oauth, TRAE_PATHS.user, { ReqSource: 'IDE', IDEVersion: this.profile.version }, { ...this.#oauthHeaders(), 'X-Cloudide-Token': c.accessToken });
        const u = userData.Result ?? userData.result;
        const uid = String(u?.UserID ?? u?.userId ?? u?.uid ?? '');
        if (!uid || (cb.uid && uid !== cb.uid)) throw new TraeError('TRAE 账号身份校验失败', 'protocol-changed');
        this.#checkEpoch(epoch);
        await this.#patch({ credential: { ...c, uid, nickname: str(u.ScreenName ?? u.screenName ?? cb.nickname, 128) }, models: [], balance: null, checkin: null, lastError: null, authRequired: false });
        res.end('TRAE 账号已连接大肥鱼。可以关闭本页，返回本地控制台刷新模型列表。');
      } catch (e) {
        if (epoch === this.#epoch) await this.#patch({ lastError: e instanceof TraeError ? e.message : 'TRAE 授权失败' }).catch(() => {});
        res.writeHead(400); res.end(e instanceof TraeError ? e.message : 'TRAE 授权失败，请返回本地控制台查看');
      } finally { finish(); }
    });
    try { await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); }); }
    catch { finish(); throw new TraeError('TRAE 本地授权回调端口启动失败'); }
    session.timer = setTimeout(() => { if (this.#login === session) { this.#epoch++; finish(); void this.#patch({ lastError: 'TRAE 登录超时，请重试' }).catch(() => {}); } }, ttlMs); session.timer.unref();
    const callback = `http://127.0.0.1:${server.address().port}${path}`;
    const url = new URL('/authorization', this.profile.console);
    url.search = new URLSearchParams({ login_version: '1', auth_from: 'solo', login_channel: 'native_ide', plugin_version: this.profile.pluginVersion,
      auth_type: 'local', client_id: this.profile.clientId, redirect: '0', auth_callback_url: callback,
      login_trace_id: nonce, machine_id: identity.machineId, device_id: identity.deviceId,
      x_device_id: identity.deviceId, x_machine_id: identity.machineId, x_device_brand: 'PC', x_device_type: 'PC',
      x_os_version: '1.0', x_app_version: this.profile.version, x_app_type: 'stable' }).toString();
    session.url = url.href;
    return { url: url.href, expiresAt: session.expiresAt };
  }
  cancelLogin() { if (!this.#login) return; clearTimeout(this.#login.timer); this.#login.server.close(); this.#login = null; this.#epoch++; }
  async logout() { this.cancelLogin(); this.#epoch++; await this.#patch({ credential: null, models: [], balance: null, checkin: null, autoCheckin: false, authRequired: false, lastError: null }); }
  async models() {
    const epoch = this.#epoch;
    const data = await this.#authorized(this.profile.agent, TRAE_PATHS.models, {
      functions: ['solo_work_lite', 'solo_agent', 'solo_agent_lite', 'chat_v3', 'builder_v3'], agent_type: '',
      current_config_info: { config_name: '', is_custom_model: false }, mode_type: 0, access_type: 0, show_custom_model: false,
    });
    const models = parseTraeModels(data);
    if (!models.length) throw new TraeError('TRAE 未返回可用模型，账号权限或客户端协议可能变化', 'protocol-changed');
    this.#checkEpoch(epoch); await this.#patch({ models, lastError: null }); return models;
  }
  async balance() {
    const epoch = this.#epoch;
    const d = await this.#authorized(this.profile.credits, TRAE_PATHS.balance, { require_usage: true, req_source: 2 }, true);
    if (!Array.isArray(d.user_entitlement_pack_list)) throw new TraeError('TRAE 积分响应结构变化', 'protocol-changed');
    let total = 0, unknown = false;
    for (const p of d.user_entitlement_pack_list) {
      const limit = p?.entitlement_base_info?.quota?.credits_limit, used = p?.usage?.credits_amount ?? 0;
      if (typeof limit !== 'number' || !Number.isFinite(limit) || typeof used !== 'number' || !Number.isFinite(used)) { unknown = true; continue; }
      if (p.expire_time && Number(p.expire_time) * 1000 <= this.now()) continue;
      total += Math.max(0, limit - used);
    }
    const balance = { total: unknown ? null : Math.round(total * 100) / 100, updatedAt: new Date(this.now()).toISOString() };
    this.#checkEpoch(epoch); await this.#patch({ balance }); return balance;
  }
  checkin() {
    if (this.#check) return this.#check;
    const epoch = this.#epoch;
    this.#check = (async () => {
      const day = shanghaiDay(this.now()), previous = this.state().checkin;
      if (previous?.day === day && (!['inactive', 'status-error'].includes(previous.phase) || previous.retryAt > this.now())) return previous;
      let claimSubmitted = false;
      const record = patch => this.#patch({ checkin: { day, at: new Date(this.now()).toISOString(), credit: null, unit: 'credits', coversToday: true, ...patch } });
      try {
        await this.credential();
        const status = await this.#authorized(this.profile.credits, TRAE_PATHS.checkStatus, {}, true);
        this.#checkEpoch(epoch);
        if (status.checked_in === true) { await record({ phase: 'already-claimed', message: '今天已签到' }); return this.state().checkin; }
        if (status.enable !== true) { await record({ phase: 'inactive', retryAt: this.now() + 3_600_000, message: '当前账号未启用签到活动，1 小时后再查询状态' }); return this.state().checkin; }
        // Persist intent BEFORE a claim. A timeout/crash must not lead to another claim.
        await record({ phase: 'claiming', message: '已提交签到；重启后不重复领取' });
        claimSubmitted = true;
        const d = await this.#authorized(this.profile.credits, TRAE_PATHS.claim, {}, true);
        this.#checkEpoch(epoch);
        if (Number(d.code ?? d.Code) !== 0) throw new TraeError('TRAE 签到响应缺少明确成功状态，请在客户端确认', 'protocol-changed');
        const credit = typeof d.credits === 'number' ? d.credits : null;
        await record({ phase: 'claimed', credit, message: '签到请求成功，实际积分以厂商账户为准' });
        await this.balance().catch(() => {});
        return this.state().checkin;
      } catch (e) {
        if (epoch === this.#epoch) {
          await record({ phase: e.code === 'risk-control' ? 'blocked' : e.code === 'auth-required' ? 'auth-required' : claimSubmitted ? 'uncertain' : 'status-error', retryAt: claimSubmitted ? 0 : this.now() + 900_000, message: e instanceof TraeError ? e.message : '签到结果待确认，请在客户端查看' });
          await this.#patch({ lastError: e instanceof TraeError ? e.message : 'TRAE 签到失败', ...(e.code === 'auth-required' ? { authRequired: true } : {}) });
        }
        throw e;
      }
    })().finally(() => { this.#check = null; });
    return this.#check;
  }
  async chat(provider, messages, { signal } = {}) {
    if (this.#busy) throw new TraeError('TRAE 单账号正在处理上一条请求，请稍后', 'busy');
    this.#busy = true;
    const epoch = this.#epoch;
    try {
      let models = this.state().models; if (!models.length) models = await this.models();
      const selected = models.find(m => m.id === provider.model);
      if (!selected) throw new TraeError('所选模型不在当前 TRAE 账号的可用列表中，请刷新并重新选择', 'model-unavailable');
      let c = await this.credential();
      const run = () => this.#request(this.profile.agent, TRAE_PATHS.chat, {
        model: selected.id, config_name: selected.id, function: selected.channel, stream: true, ...(provider.maxOutputTokens ? { max_tokens: provider.maxOutputTokens } : {}),
        messages: messages.map(m => ({ role: m.role, content: [{ type: 'text', text: m.content }] })),
      }, { ...this.#agentHeaders(c, this.state().identity), Accept: 'text/event-stream' }, signal).catch(e=>{if(e.code==='network')e.noFallback=true;throw e;});
      let response;
      try { response = await run(); } catch (e) { if (e.code !== 'auth-required') throw e; c = await this.refresh(); response = await run(); }
      let text;
      try { text = await parseTraeStream(response); }
      catch (e) { e.noFallback = true; throw e; } // Accepted/possibly billed: never reissue on parser/stream failure.
      this.#checkEpoch(epoch); return text;
    } catch (e) {
      if (epoch === this.#epoch && !signal?.aborted && !this.#stop.signal.aborted) await this.#patch({ lastError: e instanceof TraeError ? e.message : 'TRAE 调用失败', ...(e.code === 'auth-required' ? { authRequired: true } : {}) });
      throw e;
    } finally { this.#busy = false; }
  }
  async tick() {
    const s = this.state(); if (!s.enabled || !s.autoCheckin || !s.credential || s.authRequired || (s.checkin?.day === shanghaiDay(this.now()) && (!['inactive', 'status-error'].includes(s.checkin.phase) || s.checkin.retryAt > this.now()))) return;
    await this.checkin();
  }
  start() {
    if (this.#ticker) return;
    this.#ticker = setInterval(() => { void this.tick().catch(() => {}); }, 60_000); this.#ticker.unref();
    void this.tick().catch(() => {});
  }
  stop() { clearInterval(this.#ticker); this.#ticker = null; this.cancelLogin(); this.#epoch++; this.#stop.abort(); }
}
