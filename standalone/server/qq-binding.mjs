import { startQrConnect } from '@tencent-connect/qqbot-connector';
import QRCode from 'qrcode';

// Official connector as an external dependency; no DSH host or QR SDK source copy.
export class QqBinding {
  #start; #stop; #controller; #timer; #epoch = 0; #imageEpoch = 0; #state = { phase: 'idle' };
  constructor({ onCredentials, start = startQrConnect, ttlMs = 10 * 60_000, renderQr = url => QRCode.toDataURL(url, { width: 260, margin: 2, errorCorrectionLevel: 'M' }) }) {
    this.onCredentials = onCredentials; this.#start = start; this.ttlMs = ttlMs; this.renderQr = renderQr;
  }
  status() { return structuredClone(this.#state); }
  get committing() { return this.#state.phase === 'saving'; }
  #cleanup() {
    clearTimeout(this.#timer); this.#controller?.abort(); const stop = this.#stop; this.#stop = null;
    try { stop?.(); } catch { /* Connector cancellation must not override session state. */ }
  }
  begin() {
    if (this.committing) throw new Error('正在保存扫码结果，请稍候');
    if (['preparing', 'waiting', 'refreshing'].includes(this.#state.phase)) return this.status();
    this.cancel(); const epoch = this.#epoch, controller = this.#controller = new AbortController();
    this.#state = { phase: 'preparing', expiresAt: new Date(Date.now() + this.ttlMs).toISOString() };
    const live = () => epoch === this.#epoch && !controller.signal.aborted;
    const fail = () => { if (!live() || this.committing || this.#state.phase === 'bound') return; this.#epoch++; this.#state = { phase: 'error', error: '二维码准备或授权失败，请检查网络后重新获取' }; this.#cleanup(); };
    this.#timer = setTimeout(() => { if (!live() || this.committing) return; this.#epoch++; this.#state = { phase: 'expired', error: '本次扫码已超时，请重新获取二维码' }; this.#cleanup(); }, this.ttlMs);
    this.#timer.unref();
    try {
      const stop = this.#start({
        onQrDisplayed: url => {
          if (!live() || this.committing) return;
          const imageEpoch = ++this.#imageEpoch;
          // The connector currently returns this official HTTPS page. Never
          // render an arbitrary host supplied by an unexpected SDK response.
          let parsed; try { parsed = new URL(url); } catch { fail(); return; }
          if (parsed.protocol !== 'https:' || parsed.hostname !== 'q.qq.com' || parsed.username || parsed.password) { fail(); return; }
          this.#state = { phase: 'preparing', expiresAt: this.#state.expiresAt };
          Promise.resolve(this.renderQr(parsed.href)).then(image => {
            if (!live() || this.committing || imageEpoch !== this.#imageEpoch) return;
            this.#state = { ...this.#state, phase: 'waiting', qrImage: image };
          }).catch(fail);
        },
        onQrExpired: () => { if (live() && !this.committing) { this.#imageEpoch++; this.#state = { phase: 'refreshing', expiresAt: this.#state.expiresAt }; } },
        onFailure: fail,
        onSuccess: credentials => {
          if (!live() || this.committing || this.#state.phase === 'bound') return;
          if (!Array.isArray(credentials) || credentials.length !== 1 || !/^\d{1,40}$/.test(credentials[0]?.appId ?? '') || !/^[\x21-\x7e]{1,1024}$/.test(credentials[0]?.appSecret ?? '')) { fail(); return; }
          this.#state = { phase: 'saving' }; clearTimeout(this.#timer); this.#imageEpoch++;
          const { appId, appSecret } = credentials[0];
          this.task = Promise.resolve().then(() => this.onCredentials({ appId, appSecret })).then(() => {
            if (epoch === this.#epoch) this.#state = { phase: 'bound', appId, boundAt: new Date().toISOString() };
          }).catch(() => { if (epoch === this.#epoch) this.#state = { phase: 'error', error: '扫码已完成，但保存或连接未完成，请检查设置后重试' }; })
            .finally(() => { this.#epoch++; this.#cleanup(); });
        },
      }, { displayQrCodeToConsole: false, source: '', signal: controller.signal });
      if (live()) this.#stop = stop; else stop?.();
    } catch { fail(); }
    return this.status();
  }
  cancel() {
    if (this.committing) return this.status(); // Atomic credential commit is already in progress.
    this.#epoch++; this.#imageEpoch++; this.#state = { phase: 'cancelled' }; this.#cleanup(); return this.status();
  }
  async close() { if (this.committing) await this.task; this.cancel(); }
}
