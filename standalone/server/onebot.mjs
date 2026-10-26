import WebSocket from 'ws';
import { randomUUID } from 'node:crypto';

export function normalizeEvent(e) {
  if (e?.post_type !== 'message' || !['group', 'private'].includes(e.message_type)
    || e.user_id == null || e.message_id == null || String(e.user_id) === String(e.self_id)) return null;
  if (e.message_type === 'group' && e.group_id == null) return null;
  // Require array mode to avoid interpreting arbitrary CQ markup as bot commands.
  if (!Array.isArray(e.message)) return null;
  let addressed = false, text = '';
  for (const segment of e.message) {
    if (segment.type === 'text') text += String(segment.data?.text ?? '');
    if (segment.type === 'at') {
      if (String(segment.data?.qq) === String(e.self_id)) addressed = true;
      else text += `<@${String(segment.data?.qq ?? '')}>`;
    }
  }
  return { kind: e.message_type === 'group' ? 'group' : 'c2c', groupOpenid: String(e.group_id ?? `dm:${e.user_id}`),
    senderId: String(e.user_id), senderName: String(e.sender?.card || e.sender?.nickname || e.user_id).slice(0, 80),
    messageId: String(e.message_id), content: text.trim().slice(0, 4000), addressed: addressed || e.message_type === 'private' };
}
export class OneBot {
  #ws; #timer; #stopped = true; #pending = new Map(); #attempt = 0;
  status = { state: 'disconnected', selfId: null, name: null, error: null };
  constructor({ onEvent, onStatus = () => {} }) { this.onEvent = onEvent; this.onStatus = onStatus; }
  #set(patch) { this.status = { ...this.status, ...patch }; this.onStatus(this.status); }
  connect(config) { this.stop(); this.config = config; this.#stopped = false; this.#attempt = 0; this.#open(); }
  #open() {
    if (this.#stopped) return;
    this.#set({ state: 'connecting', error: null });
    const ws = this.#ws = new WebSocket(this.config.url, { headers: this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {},
      handshakeTimeout: 8000, maxPayload: 1_000_000, followRedirects: false });
    ws.on('open', async () => {
      if (ws !== this.#ws) return;
      try {
        const info = await this.call('get_login_info', {});
        if (ws !== this.#ws) return;
        this.#attempt = 0;
        this.#set({ state: 'connected', selfId: String(info.user_id), name: String(info.nickname), error: null });
      } catch { if (ws === this.#ws) { this.#set({ error: 'OneBot 登录信息检查失败' }); ws.close(); } }
    });
    ws.on('message', raw => {
      if (ws !== this.#ws) return;
      let e; try { e = JSON.parse(raw.toString()); } catch { return; }
      if (e.echo && this.#pending.has(e.echo)) {
        const pending = this.#pending.get(e.echo); this.#pending.delete(e.echo); clearTimeout(pending.timer);
        if (e.status === 'ok' && e.retcode === 0) pending.resolve(e.data);
        else pending.reject(new Error(`OneBot 动作失败（${Number(e.retcode) || '未知'}）`));
      } else if (this.status.state === 'connected') { void Promise.resolve(this.onEvent(e)).catch(() => {}); }
    });
    ws.on('error', error => { if (ws === this.#ws) this.#set({ error: error.code === 'ECONNREFUSED' ? 'NapCat 通信服务尚未启动，请先启动 NapCat 并扫码登录' : /401|403/.test(error.message) ? 'NapCat 拒绝连接，请核对 OneBot Access Token' : 'NapCat 连接未完成，请检查正向 WS 地址、网络与服务状态' }); });
    ws.on('close', () => {
      if (ws !== this.#ws) return;
      this.#rejectPending();
      this.#set({ state: this.#stopped ? 'disconnected' : 'reconnecting', selfId: null, name: null });
      if (!this.#stopped) { this.#timer = setTimeout(() => this.#open(), Math.min(30_000, 1000 * 2 ** Math.min(this.#attempt++, 5))); this.#timer.unref(); }
    });
  }
  call(action, params) {
    if (this.#ws?.readyState !== WebSocket.OPEN) return Promise.reject(new Error('QQ 尚未连接'));
    return new Promise((resolve, reject) => {
      const echo = randomUUID();
      const timer = setTimeout(() => { this.#pending.delete(echo); reject(new Error('OneBot 动作超时')); }, 8000);
      this.#pending.set(echo, { resolve, reject, timer });
      this.#ws.send(JSON.stringify({ action, params, echo }), error => {
        if (error) { clearTimeout(timer); this.#pending.delete(echo); reject(new Error('OneBot 发送失败')); }
      });
    });
  }
  send(message, text) {
    return this.call(message.kind === 'group' ? 'send_group_msg' : 'send_private_msg', {
      ...(message.kind === 'group' ? { group_id: message.groupOpenid } : { user_id: message.senderId }),
      message: [{ type: 'text', data: { text } }],
    });
  }
  #rejectPending() { for (const p of this.#pending.values()) { clearTimeout(p.timer); p.reject(new Error('QQ 连接已断开')); } this.#pending.clear(); }
  stop() {
    this.#stopped = true; clearTimeout(this.#timer); const old = this.#ws; this.#ws = null;
    old?.terminate(); this.#rejectPending(); this.#set({ state: 'disconnected', selfId: null, name: null, error: null });
  }
}
