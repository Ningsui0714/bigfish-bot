import {TRAE_CHANNEL, REMOVED_CHANNEL_NOTICE} from '../server/channel-state.mjs';
import {BENEFITS} from '../server/benefits-state.mjs';
import React,{useState} from 'react';
const phaseNames={claiming:'正在处理',claimed:'今天已完成','already-claimed':'今天已完成',unconfirmed:'结果待确认',uncertain:'结果待确认',inactive:'暂无活动','previous-period':'已领上一周期，稍后查今日','status-error':'稍后重查',blocked:'厂商暂时限制','auth-required':'需重新授权'};
export function AccountChannels({states=[],trae,config,onOption,request,notify,fail}){
  const all=[{...TRAE_CHANNEL,...trae},...states];
  const [selected,setSelected]=useState('trae'),[pending,setPending]=useState('');
  const s=all.find(p=>p.id===selected)??all[0],settings=s.id==='trae'?config.trae:config.accounts?.[s.id];
  async function action(name){const id=s.id;setPending(`${id}:${name}`);try{const r=await request(id,name);if(name==='models')notify(`${s.name} 的 ${r.models.length} 个原始模型已加入统一目录`);if(name==='balance')notify(`${s.name} 额度已更新`);if(name==='checkin')notify(r.checkin.message);}catch(e){fail(e.message);}finally{setPending('');}}
  return <section className="account-hub"><div className="section-heading"><div><span className="eyebrow">账号统一管理</span><h2>连接你的厂商账号</h2><p>这里只管理当前选中的厂商；聊天模型在上方统一选择。</p></div><span className="account-count">{all.filter(x=>x.loggedIn).length} / {all.length} 已连接</span></div>
    <p className="removed-channel-note">{REMOVED_CHANNEL_NOTICE}</p>
    <label className="field"><span>选择账号厂商</span><select aria-label="选择账号厂商" value={s.id} onChange={e=>setSelected(e.target.value)}>{all.map(p=><option key={p.id} value={p.id}>{p.displayName||p.name} · {p.loggedIn?'已登录':'未登录'}</option>)}</select></label>
    <div className="account-detail" key={s.id} aria-label={`${s.name} 账号详情`}><div className="section-heading"><div><h3>{s.displayName||s.name}</h3><p>{s.loginKind} · {s.testedAt?'真实聊天已验证':s.loggedIn?'已登录':'待登录验证'}</p></div><span className={`status-tag ${s.loggedIn?'online':''}`}>{s.loggedIn?'已连接':'尚未登录'}</span></div>
      <div className="trae-summary"><div><small>登录账号</small><strong>{s.loggedIn?s.nickname||`${s.name} 用户`:'等待授权'}</strong></div><div><small>账号额度</small><strong>{s.balance?s.balance.total??'厂商未提供数值':'尚未查询'}</strong></div><div><small>{s.daily?'每日签到':'权益方式'}</small><strong>{s.daily?(phaseNames[s.checkin?.phase]??'尚未执行'):BENEFITS[s.id]?.label??'随账号权益'}</strong></div></div>
      <div className="trae-actions"><button className="primary" disabled={!!pending||!!s.login} onClick={()=>action('login')}>{pending===`${s.id}:login`?'准备授权…':s.loggedIn?'重新授权':`登录 ${s.name}`}</button>{s.login&&<button disabled={!!pending} onClick={()=>action('cancel-login')}>取消本次授权</button>}{s.loggedIn&&<><button disabled={!!pending} onClick={()=>action('models')}>获取模型列表</button><button disabled={!!pending} onClick={()=>action('balance')}>查询额度</button>{s.refreshable&&<button disabled={!!pending} onClick={()=>action('refresh')}>续期登录</button>}{s.daily&&<button disabled={!!pending} onClick={()=>action('checkin')}>今日签到</button>}<button className="danger-text" disabled={!!pending} onClick={()=>action('logout')}>退出账号</button></>}</div>
      {s.login&&<div className="trae-login" role="status"><strong>在 {s.name} 页面完成登录</strong>{s.login.userCode&&<p>设备授权码：<b>{s.login.userCode}</b></p>}{s.login.url?<a href={s.login.url} target="_blank" rel="noreferrer">打开 {s.name} 授权页面 ↗</a>:<p>正在准备授权链接…</p>}<p>完成后这里自动更新。</p></div>}
      {!!s.models?.length&&<p className="muted">已读取 {s.models.length} 个原始模型，自动并入上方统一模型目录。</p>}
      <label className="toggle-label trae-checkin-toggle"><input type="checkbox" checked={settings?.enabled!==false} onChange={e=>onOption(s.id,'enabled',e.target.checked)}/><span className="switch"/>允许这个账号参与模型路由</label>
      {s.daily&&<label className="toggle-label trae-checkin-toggle"><input type="checkbox" checked={settings?.autoCheckin===true} onChange={e=>onOption(s.id,'autoCheckin',e.target.checked)}/><span className="switch"/>每天自动签到（应用运行时）</label>}
      <p className="trae-note">使用当前账号权益，调用可能消耗付费额度。{s.id==='zcode'?'交互验证请在厂商页面完成。':''}</p>
      {s.checkin?.message&&<p className="muted">{s.checkin.message}</p>}{s.lastError&&<p className="error-text" role="alert">{s.lastError}</p>}
    </div>
  </section>;
}
