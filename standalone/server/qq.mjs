import http from 'node:http';
import { QQBot } from '@tencent-connect/qqbot-nodejs';
import { OneBot, normalizeEvent } from './onebot.mjs';

export function normalizeOfficialMessage(m) {
  if (!m || !['group', 'c2c'].includes(m.kind) || m.senderIsBot || !m.senderId || !m.messageId || typeof m.content !== 'string') return null;
  if (m.kind === 'group' && !m.groupOpenid) return null;
  const targetId = m.kind === 'group' ? m.groupOpenid : m.senderId;
  // Derive reply target ourselves; never trust an arbitrary forwarded target.
  return { kind: m.kind, groupOpenid: m.kind === 'group' ? m.groupOpenid : `dm:${m.senderId}`,
    senderId: m.senderId, senderName: String(m.senderName || m.senderId).slice(0, 80), messageId: m.messageId,
    content: m.content.replace(/^\s*<@!?\d+>\s*/, '').trim().slice(0, 4000),
    addressed: m.kind === 'c2c' || m.rawEventType === 'GROUP_AT_MESSAGE_CREATE',
    replyTarget: { scope: m.kind, targetId, msgId: m.messageId } };
}

// Separate loopback listener: expose ONLY /qqbot through an HTTPS reverse proxy,
// never the management console on 3210. Signature verification is owned by SDK.
export class CallbackServer {
  #server; #closed = false;
  constructor(onVerified = () => {}) { this.onVerified = onVerified; }
  async listen(port, path, handler) {
    if (this.#closed) throw new Error('回调监听已取消');
    const server = this.#server = http.createServer(async (req, res) => {
      const finish = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(body); };
      if (req.method !== 'POST' || req.url !== path) return finish(404, '{}');
      try {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 1_000_000) return finish(413, '{}'); chunks.push(chunk); }
        const body = Buffer.concat(chunks);
        const payload = JSON.parse(body.toString('utf8'));
        // op:13 is the platform challenge, not a message. Other requests must
        // have a recent signature timestamp; SDK verifies the raw bytes next.
        if (payload.op !== 13) {
          const timestamp = req.headers['x-signature-timestamp'];
          if (typeof timestamp !== 'string' || !/^\d{10}$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return finish(401, '{}');
        }
        const result = await handler({ body, headers: req.headers });
        if (result.status === 200 && payload.op === 0) this.onVerified(payload);
        finish(result.status, result.body);
      } catch { finish(400, '{}'); }
    });
    server.requestTimeout = 10_000; server.headersTimeout = 10_000;
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', () => { server.off('error', reject); resolve(); }); });
    if (this.#closed) { server.close(); throw new Error('回调监听已取消'); }
  }
  close() { this.#closed = true; this.#server?.closeAllConnections(); this.#server?.close(); }
}

export class OfficialBot {
  #bot; #callback; #epoch = 0;
  status = { mode: 'official', state: 'disconnected', selfId: null, name: null, error: null };
  constructor({ onMessage, botFactory = options => new QQBot(options), onStatus = () => {} }) {
    this.onMessage = onMessage; this.botFactory = botFactory; this.onStatus = onStatus;
  }
  #set(patch) { this.status = { ...this.status, ...patch }; this.onStatus(this.status); }
  connect(q) {
    this.stop();
    const o = q.official;
    if (!o?.appId || !o.appSecret) throw new Error('请先填写并保存官方 Bot 的 AppID 和 AppSecret');
    const epoch = this.#epoch;
    const webhook = o.transport === 'webhook';
    const callback = this.#callback = new CallbackServer(() => {
      if (epoch === this.#epoch) this.#set({ state: 'connected', lastEventAt: new Date().toISOString(), error: null });
    });
    const bot = this.#bot = this.botFactory({ appId: o.appId, appSecret: o.appSecret, markdownSupport: false, intents: 1 << 25,
      transport: webhook ? 'webhook' : 'websocket', ...(webhook ? { webhook: { port: o.port, path: '/qqbot', server: callback } } : {}),
      // Only observe lifecycle markers, never forward SDK log bodies or secrets.
      logger: { debug: () => {}, warn: () => {}, info: line => { if (epoch === this.#epoch && !webhook && String(line).includes('WebSocket closed:')) this.#set({ state: 'reconnecting' }); },
        error: () => { if (epoch === this.#epoch && !webhook) this.#set({ state: 'reconnecting', error: '官方网关连接异常，正在尝试重连' }); } } });
    this.#set({ transport: webhook ? 'webhook' : 'websocket', state: 'connecting', selfId: o.appId, name: '官方 Bot', error: null, lastEventAt: null, callbackUrl: webhook ? `http://127.0.0.1:${o.port}/qqbot` : null });
    bot.on('ready', () => { if (epoch === this.#epoch) this.#set({ state: webhook ? 'listening' : 'connected', error: null }); });
    bot.on('resumed', () => { if (epoch === this.#epoch) this.#set({ state: 'connected', error: null }); });
    bot.on('error', () => { if (epoch === this.#epoch && !webhook) this.#set({ state: 'reconnecting', error: '官方网关连接异常，正在尝试重连' }); });
    bot.on('message', (_ctx, raw) => {
      const m = normalizeOfficialMessage(raw);
      if (epoch !== this.#epoch || !m) return;
      this.#set({ lastEventAt: new Date().toISOString() });
      return this.onMessage(m);
    });
    // start() runs for the lifetime of the listener, not just startup.
    this.task = Promise.resolve().then(() => {
      if (epoch !== this.#epoch) return;
      return bot.start();
    }).catch(e => {
      if (epoch === this.#epoch) this.#set({ state: 'error', error: e.code === 'EADDRINUSE' ? '官方回调端口被占用，请更换端口后重连' : '官方 Bot 启动失败，请检查 AppID / AppSecret 和网络' });
    }).finally(() => { callback.close(); bot.stop(); });
  }
  async send(m, text) {
    if (!this.#bot || !['listening', 'connected'].includes(this.status.state)) throw new Error('官方 Bot 尚未连接');
    if (!m.replyTarget?.msgId) throw new Error('官方回复缺少关联消息 ID');
    return this.#bot.sendText(m.replyTarget, text);
  }
  stop() {
    this.#epoch++; this.#callback?.close(); this.#bot?.stop(); this.#bot = null;
    this.#set({ state: 'disconnected', selfId: null, name: null, error: null, lastEventAt: null, callbackUrl: null });
  }
}

export class QqConnection {
  #transport; #mode = 'napcat'; #peers = []; #epoch = 0;
  constructor({ onMessage, officialBotFactory }) { this.onMessage = onMessage; this.officialBotFactory = officialBotFactory; }
  get status() { return { ...(this.#transport?.status ?? { state: 'disconnected', selfId: null, name: null, error: null }), mode: this.#mode, recentPeers: [...this.#peers] }; }
  connect(q) {
    this.stop(); this.#mode = q.mode ?? 'napcat'; this.#peers = [];
    const epoch = this.#epoch;
    let transport;
    const receive = async m => {
      if (!m || epoch !== this.#epoch) return;
      const peer = { kind: m.kind, groupId: m.kind === 'group' ? m.groupOpenid : null, userId: m.senderId, at: new Date().toISOString() };
      this.#peers = [peer, ...this.#peers.filter(p => p.groupId !== peer.groupId || p.userId !== peer.userId)].slice(0, 10);
      await this.onMessage(m, text => {
        // A reply queued under a previous QQ session must never go to a new bot.
        if (epoch !== this.#epoch) throw new Error('QQ 会话已更换，已取消旧回复');
        return transport.send(m, text);
      });
    };
    transport = this.#transport = this.#mode === 'official'
      ? new OfficialBot({ onMessage: receive, botFactory: this.officialBotFactory })
      : new OneBot({ onEvent: e => receive(normalizeEvent(e)) });
    transport.connect(q);
  }
  // Keep explicit send for callers, while event handlers use session-bound send.
  send(m, text) { if (!this.#transport) throw new Error('QQ 尚未连接'); return this.#transport.send(m, text); }
  stop() { this.#epoch++; this.#transport?.stop(); this.#peers = []; }
}
