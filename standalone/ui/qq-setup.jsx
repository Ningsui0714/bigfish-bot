import React, { useEffect, useState } from 'react';

const choices = [
  { id: 'napcat', title: 'NapCat / OneBot', tag: '个人 QQ', text: '通过已登录的 QQ 账号接入，适合自然群聊与旁听接话。' },
  { id: 'official', title: '官方 QQ Bot', tag: '腾讯开放平台', text: '手机 QQ 扫码绑定，自动保存并直连官方机器人。' },
];
const labels = { disconnected: '已断开', connecting: '正在连接', connected: '已收到有效事件 / 已连接', listening: '回调已监听，等待平台事件', reconnecting: '正在重连', error: '连接失败' };
function Field({ label, help, children }) { return <label className="field"><span>{label}</span>{children}{help && <small>{help}</small>}</label>; }
function IdList({ value, onChange, ...props }) {
  const [raw, setRaw] = useState(value.join(', '));
  const parse = s => s.split(/[,，\s]+/).filter(Boolean);
  useEffect(() => { if (JSON.stringify(parse(raw)) !== JSON.stringify(value)) setRaw(value.join(', ')); }, [value]);
  return <input {...props} value={raw} onChange={e => { setRaw(e.target.value); onChange(parse(e.target.value)); }} />;
}
function Toggle({ checked, onChange, children }) { return <label className="toggle-label"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><span className="switch" />{children}</label>; }

export function QqSetup({ config, update, status, connect, dirty, binding = { phase: 'idle' }, onBind }) {
  const q = config.qq, mode = q.mode ?? 'napcat', official = mode === 'official';
  const access = official ? q.official : q;
  const patch = values => update(c => ({ ...c, qq: { ...c.qq, ...values } }));
  const patchAccess = values => official ? patch({ official: { ...q.official, ...values } }) : patch(values);
  const running = !['disconnected', 'error'].includes(status.state);
  const samePath = (status.mode ?? 'napcat') === mode;
  const peers = samePath ? status.recentPeers ?? [] : [];
  const [busy, setBusy] = useState(false);
  const bindingActive = ['preparing', 'waiting', 'refreshing', 'saving'].includes(binding.phase);
  const webhook = q.official.transport === 'webhook';
  async function act(action) { setBusy(true); try { await connect(action); } finally { setBusy(false); } }
  async function bind(action) { setBusy(true); try { await onBind(action); } finally { setBusy(false); } }
  return <>
    <section className="qq-paths" aria-labelledby="qq-path-title">
      <div className="section-heading"><div><span className="eyebrow">QQ CONNECTION</span><h2 id="qq-path-title">选择接入方式</h2><p>只切换 QQ 通道，不更换模型，也不丢掉大肥鱼的人格。</p></div></div>
      <div className="qq-path-grid" role="group" aria-label="QQ 接入方式">{choices.map(choice => <button type="button" key={choice.id} aria-pressed={mode === choice.id} className={`qq-path ${mode === choice.id ? 'selected' : ''}`} onClick={() => patch({ mode: choice.id })}>
        <span className="qq-path-top"><strong>{choice.title}</strong><i aria-hidden="true">{mode === choice.id ? '●' : '○'}</i></span><span className="qq-path-tag">{choice.tag}</span><span className="qq-path-description">{choice.text}</span>
      </button>)}</div>
      <div className="qq-flow"><span>{official ? '官方机器人' : 'NapCat'}</span><b>→</b><span>大肥鱼 · 人格 / 记忆 / 接话</span><b>→</b><span>统一模型</span></div>
    </section>

    <section className="settings-section">
      <div className="section-heading"><div><h2>{official ? '扫码接入官方 Bot' : '连接 NapCat'}</h2><p>{official ? '不用手抄 AppID / AppSecret，扫码确认后自动连接。' : '连接 OneBot 11 的 WebSocket 服务端（正向 WS）。'}</p></div></div>
      {official ? <>
        <div className="qq-bind-summary"><span>当前绑定</span><strong>{q.official.hasSecret ? `AppID · ${q.official.appId}` : '还没有绑定机器人'}</strong><small>默认 WebSocket 直连，无需公网 IP 或回调隧道。</small></div>
        <div className="qq-connect-actions"><button className="primary" disabled={busy || bindingActive} onClick={() => bind('login')}>{busy ? '准备中…' : q.official.hasSecret ? '重新扫码绑定' : '获取 QQ 绑定二维码'}</button>{bindingActive && <button disabled={busy || binding.phase === 'saving'} onClick={() => bind('cancel-login')}>取消扫码</button>}</div>
        {['preparing', 'refreshing'].includes(binding.phase) && <div className="qq-scan-note" role="status">{binding.phase === 'refreshing' ? '二维码已过期，正在自动刷新…' : '正在向腾讯请求绑定二维码…'}</div>}
        {binding.phase === 'waiting' && binding.qrImage && <div className="qq-scan" role="status"><img src={binding.qrImage} alt="官方 QQ Bot 绑定二维码，请使用手机 QQ 扫码" /><strong>用手机 QQ 扫码并确认绑定</strong><p>请绑定你管理的机器人，凭据自动加密保存到本机。</p><small>本次会话有效至 {new Date(binding.expiresAt).toLocaleTimeString('zh-CN')}，二维码过期会自动刷新。</small></div>}
        {binding.phase === 'saving' && <p className="qq-scan-note" role="status">扫码成功，正在保存并连接官方 Bot…</p>}
        {binding.phase === 'bound' && <p className="qq-scan-note" role="status">已绑定 AppID {binding.appId}，正在使用下方连接状态检查消息链路。</p>}
        {binding.error && <p className="qq-bind-error" role="alert">{binding.error}</p>}
        <details className="qq-manual"><summary>高级设置 · 手动填写凭据 / 消息接收方式</summary>
        <div className="form-grid"><Field label="AppID"><input autoComplete="off" inputMode="numeric" value={q.official.appId} onChange={e => patchAccess({ appId: e.target.value, allowedGroupIds: [], allowedUserIds: [], privateEnabled: false })} placeholder="开放平台的机器人 AppID" /></Field>
        <Field label="AppSecret" help={q.official.hasSecret ? '已加密保存，留空保留；更换 AppID 后需重新填写。' : '填写开放平台的 AppSecret，仅在本机加密保存。'}><input type="password" autoComplete="new-password" value={q.official.appSecret ?? ''} onChange={e => patchAccess({ appSecret: e.target.value, clearSecret: false })} placeholder={q.official.hasSecret ? '已保存，留空保留' : 'AppSecret'} /></Field>
        <Field label="消息接收方式"><select value={q.official.transport ?? 'websocket'} onChange={e => patchAccess({ transport: e.target.value })}><option value="websocket">WebSocket 直连（默认，无需公网回调）</option><option value="webhook">Webhook 回调（需公网 HTTPS）</option></select></Field>
        {webhook && <Field label="本地回调端口" help="需与管理端口不同；默认只监听 127.0.0.1。"><input type="number" min="1024" max="65535" value={q.official.port} onChange={e => patchAccess({ port: Number(e.target.value) })} /></Field>}</div>
        {q.official.hasSecret && <Toggle checked={q.official.clearSecret === true} onChange={v => patchAccess({ clearSecret: v, appSecret: '' })}>清除已保存的 AppSecret</Toggle>}
        {webhook && <div className="qq-callback"><small>公网 HTTPS 仅转发此回调地址</small><code>http://127.0.0.1:{q.official.port}/qqbot</code><p>本机地址不能直接填到开放平台；需使用你自己的 HTTPS 反向代理或隧道。不要转发 3210 管理端口。</p></div>}
        </details>
      </> : <div className="form-grid"><Field label="正向 WebSocket 地址" help="不是 NapCat WebUI 地址，也不是反向 WS。"><input value={q.url} onChange={e => patch({ url: e.target.value })} placeholder="ws://127.0.0.1:3001" /></Field><Field label="OneBot Access Token" help={q.hasToken ? '已保存，留空保留；不是 NapCat WebUI 的登录 Token。' : '与 NapCat 网络配置中的 Token 保持一致。'}><input type="password" autoComplete="new-password" value={q.token ?? ''} onChange={e => patch({ token: e.target.value, clearToken: false })} placeholder={q.hasToken ? '已保存，留空保留' : 'Access Token'} /></Field>{q.hasToken && <Toggle checked={q.clearToken === true} onChange={v => patch({ clearToken: v, token: '' })}>清除已保存的 Access Token</Toggle>}</div>}
      <div className="qq-connect-actions"><button className={official ? '' : 'primary'} disabled={busy || dirty || bindingActive || (official && !q.official.hasSecret) || (samePath && running)} onClick={() => act('connect')}>{busy ? '处理中…' : official ? '连接已绑定 Bot' : '连接 NapCat'}</button><button disabled={busy || !running || binding.phase === 'saving'} onClick={() => act('disconnect')}>断开连接</button></div>
      {dirty && <p className="muted">先保存底部设置，再连接。保存会断开当前 QQ 会话。</p>}
      <div role="status" className="qq-status"><strong>{(running ? status.mode : mode) === 'official' ? '官方 Bot' : 'NapCat'} · {labels[status.state] ?? status.state}</strong>{status.selfId && <span>{status.name} · {status.selfId}</span>}{status.lastEventAt && <small>最近有效回调：{new Date(status.lastEventAt).toLocaleString('zh-CN')}</small>}{status.error && <p role="alert">{status.error}</p>}{!samePath && running && <p>当前运行的是另一条路径；保存后再连接所选路径。</p>}</div>
    </section>

    <section className="settings-section"><h2>{official ? '官方 OpenID 白名单' : '群聊与私聊白名单'}</h2><p className="muted">{official ? '官方 OpenID 不是 QQ 号。先连接并向机器人发消息，可在下方查看收到的群 / 用户标识。' : '仅回复白名单中的群与联系人；逗号、空格或换行分隔。'}</p>
      <div className="form-grid"><Field label={official ? '允许的群 OpenID' : '允许的 QQ 群号'}><IdList key={`${mode}-groups`} value={access.allowedGroupIds} onChange={v => patchAccess({ allowedGroupIds: v })} placeholder={official ? 'group_openid' : '例如：123456789'} /></Field><Field label={official ? '允许的用户 OpenID' : '允许私聊的 QQ 号'}><IdList key={`${mode}-users`} value={access.allowedUserIds} onChange={v => patchAccess({ allowedUserIds: v })} placeholder={official ? 'user_openid / member_openid' : '例如：123456789'} /></Field></div>
      <Toggle checked={access.privateEnabled} onChange={v => patchAccess({ privateEnabled: v })}>启用白名单私聊</Toggle>
      {!!peers.length && <div className="qq-peers"><h3>最近收到的会话标识</h3><small>只展示标识，不展示消息正文；加入后仍需保存并重新连接。</small>{peers.map((p, i) => {const field=p.kind==='group'?'allowedGroupIds':'allowedUserIds',id=p.groupId??p.userId,added=access[field].includes(id);return <div className="qq-peer" key={`${p.groupId}-${p.userId}-${i}`}><span>{p.kind === 'group' ? '群' : '私聊'}<code>{id}</code>{p.kind === 'group' && <small>成员：{p.userId}</small>}</span><button disabled={added} onClick={() => patchAccess({ [field]: [...new Set([...access[field], id])] })}>{added ? '已加入' : '加入白名单'}</button></div>;})}</div>}
    </section>
    <section className="settings-section guide"><h2>{official ? '官方 Bot 接入步骤' : 'NapCat 接入步骤'}</h2>{official ? <><ol><li>点击“获取 QQ 绑定二维码”，用手机 QQ 扫码并确认绑定你管理的机器人。</li><li>凭据会加密保存并自动用 WebSocket 连接，无需手抄密钥或配置公网回调。</li><li>向机器人发消息，在下方会话标识里将群 / 用户 OpenID 加入白名单。</li><li>保存设置，点击“连接已绑定 Bot”，在 QQ 内测试聊天。</li></ol><p>扫码绑定成功不等于消息已收发成功，以连接状态和实际回复为准。只有高级设置选择 Webhook 时才需要公网 HTTPS；普通群聊旁听取决于官方授权的消息范围。</p></> : <><ol><li>独立安装 NapCat 并登录 QQ，本应用不内置 QQ 客户端。</li><li>在 NapCat 新建“WebSocket 服务端”，消息格式选择“数组”，设置 Access Token。</li><li>填写正向 WS 地址和同一个 Token，添加群白名单。</li><li>保存设置并连接，检查显示的 QQ 账号，再在群里 @ 大肥鱼测试。</li></ol><p>兼容标准 OneBot 11 正向 WebSocket。两条路径均支持文字群聊和私聊，暂不处理图片、语音、文件或好友申请。</p></>}</section>
  </>;
}
