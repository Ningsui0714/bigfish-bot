import React, { useState } from 'react';
const phases = { claimed: '签到成功', 'already-claimed': '今天已签到', claiming: '已提交，结果待确认', uncertain: '结果待确认', inactive: '暂无活动', 'status-error': '查询失败，稍后再查', blocked: '风控 / 限流', 'auth-required': '需要重新登录' };
export function TraeAccount({ state, activeModel, autoCheckin, onAutoCheckin, request, onUse, fail, notify }) {
  const [pending, setPending] = useState(''), [login, setLogin] = useState(null), [modelId, setModelId] = useState('');
  const s = state ?? { loggedIn: false, models: [] };
  async function action(name) {
    setPending(name);
    try {
      const result = await request(name);
      if (name === 'login') setLogin(result);
      if (name === 'logout' || name === 'cancel-login') setLogin(null);
      if (name === 'checkin') notify(result.checkin?.message || '签到状态已刷新');
      if (name === 'balance') notify('积分余额已刷新');
      if (name === 'models') notify(`获取到 ${result.models.length} 个可用模型`);
    } catch (e) { fail(e.message); }
    finally { setPending(''); }
  }
  const chosen = s.models.find(m => m.id === modelId) || s.models.find(m => m.id === activeModel) || s.models[0];
  return <section className="trae-account"><div className="section-heading"><div><h2>TRAE 中国版账号</h2><p>通过客户端协议调用账号现有积分，不需要填写模型 API Key。</p></div><span className={`status-tag ${s.loggedIn && !s.authRequired ? 'online' : ''}`}>{s.authRequired ? '需重新授权' : s.loggedIn ? '已连接账号' : '尚未登录'}</span></div>
    <div className="trae-summary"><div><small>登录账号</small><strong>{s.loggedIn ? s.nickname || 'TRAE 用户' : '等待你完成授权'}</strong></div><div><small>上次查询积分</small><strong>{s.balance ? s.balance.total ?? '上游未提供积分数' : '尚未查询'}</strong>{s.balance && <span>{new Date(s.balance.updatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</span>}</div><div><small>最近签到</small><strong>{s.checkin ? phases[s.checkin.phase] || s.checkin.phase : '尚未执行'}</strong>{s.checkin && <span>{s.checkin.day} · 上海时间</span>}</div></div>
    <div className="trae-actions"><button className="primary" disabled={!!pending || !!s.login} onClick={() => action('login')}>{pending === 'login' ? '准备授权…' : s.loggedIn ? '重新授权' : '登录 TRAE 账号'}</button>{s.login && <button disabled={!!pending} onClick={() => action('cancel-login')}>取消本次登录</button>}{s.loggedIn && <><button disabled={!!pending} onClick={() => action('models')}>{pending === 'models' ? '获取中…' : '获取可用模型'}</button><button disabled={!!pending} onClick={() => action('balance')}>刷新积分</button><button disabled={!!pending} onClick={() => action('checkin')}>{pending === 'checkin' ? '查询签到…' : '今日签到'}</button><button className="danger-text" disabled={!!pending} onClick={() => action('logout')}>退出账号</button></>}</div>
    {!login && s.login && <p className="muted">上次授权仍在等待中；请在已打开的 TRAE 页面完成，或先取消本次登录再生成新链接。</p>}
    {login && s.login && <div className="trae-login" role="status"><strong>请在 TRAE 页面完成你自己的登录授权</strong><p>完成后自动回到本机回调；本页会刷新账号状态。授权链接约 10 分钟有效。</p><a href={login.url} target="_blank" rel="noreferrer">打开 TRAE 授权页面 ↗</a></div>}
    {s.models.length > 0 && <div className="trae-model"><label htmlFor="trae-model-select">账号当前可用模型</label><div><select id="trae-model-select" value={chosen?.id || ''} onChange={e => setModelId(e.target.value)}>{s.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select><button onClick={() => chosen && onUse(chosen)}>设为主模型</button></div><small>选择账号返回的模型，点击“设为主模型”后保存设置。</small></div>}
    <label className="toggle-label trae-checkin-toggle"><input type="checkbox" checked={autoCheckin} onChange={e => onAutoCheckin(e.target.checked)} /><span className="switch" />每天自动签到（应用运行时，上海日期每天一次）</label>
    <p className="trae-note">实验性账号接入，调用消耗账号额度，可能包含付费额度。自动签到需保持应用运行；重新打开后查询当天状态。</p>
    {s.checkin?.message && <p className="muted">{s.checkin.message}</p>}{s.lastError && <p className="error-text" role="alert">{s.lastError}</p>}
  </section>;
}
