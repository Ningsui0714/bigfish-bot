import React,{useState} from 'react';
import {ACCOUNT_CHANNELS,TRAE_CHANNEL} from '../server/channel-state.mjs';
const labels=Object.fromEntries([TRAE_CHANNEL,...ACCOUNT_CHANNELS].map(m=>[m.id,m.displayName]));
const phases={pending:'等待中',running:'领取中',claimed:'领取成功','already-claimed':'今日已领','previous-period':'上一周期奖励',inactive:'暂无活动',uncertain:'结果待确认',claiming:'结果待确认','status-error':'查询失败',blocked:'厂商暂时限制','auth-required':'需重新登录',error:'未完成',skipped:'已跳过',cancelled:'已停止',interrupted:'上次已中断',automatic:'自动发放',manual:'需人工验证',none:'无需签到'};
export function BenefitsPanel({state,enabled,onEnabled,request,dirty,fail}) {
  const [pending,setPending]=useState(false);
  const job=state?.job,running=job?.running===true;
  const done=job?.rows.filter(r=>!['pending','running'].includes(r.phase)).length??0;
  async function action(name){
    if(name==='run'&&dirty){fail('请先保存账号与自动签到设置，再一键签到');return;}
    setPending(true);try{await request(name);}catch(e){fail(e.message);}finally{setPending(false);}
  }
  return <section className="benefits-panel" aria-label="每日签到中心">
    <div className="section-heading"><div><span className="eyebrow">每日领鱼粮</span><h2>签到一次，各家一起领</h2><p>自动领取已开启的账号；一键签到处理所有已登录、已启用的账号。</p></div><span className="benefits-day">上海自然日</span></div>
    <div className="benefits-controls"><label className="toggle-label"><input type="checkbox" checked={enabled!==false} onChange={e=>onEnabled(e.target.checked)}/><span className="switch"/>启用每日自动签到</label><div className="trae-actions"><button className="primary" disabled={pending||running} onClick={()=>action('run')}>{running?'正在领取…':'一键签到'}</button>{running&&<button disabled={pending||job.stopping} onClick={()=>action('stop')}>{job.stopping?'正在收尾…':'停止后续渠道'}</button>}</div></div>
    <p className="muted">启动 30 秒后检查，此后每分钟检查一次；跨日或重新打开应用会补查当天。每个账号的自动签到开关在上方设置，应用关闭时暂停。</p>
    {job?<div className="benefits-results" aria-live="polite"><div className="benefits-progress"><strong>{running?(job.stopping?'当前渠道完成后停止':`正在处理 ${labels[job.current]??'账号列表'}`):job.rows.length?'本次处理完成':'还没有可处理的账号'}</strong><span>{done} / {job.rows.length} · {job.source==='automatic'?'自动':'手动'} · {job.day}</span></div>
      {!!job.rows.length&&<progress aria-label="签到处理进度" value={done} max={job.rows.length}/>}
      <ul className="benefits-rows">{job.rows.map(row=><li key={row.id}><div><strong>{labels[row.id]}</strong><small>{row.message}{row.balancePhase==='error'?' · 领取记录已保留，余额刷新失败':''}{row.balancePhase==='updated'?' · 余额已刷新':''}</small></div><div className="benefits-outcome"><span className={`benefit-phase ${['claimed','already-claimed'].includes(row.phase)?'success':''}`}>{row.cached&&row.phase==='claimed'?'今日已领（本地记录）':phases[row.phase]??'未完成'}</span>{Number.isFinite(row.credit)&&['claimed','previous-period'].includes(row.phase)&&<small>{row.cached?'此前已领':'本次领取'} +{row.credit} {row.unit}</small>}</div></li>)}</ul>
      {!job.rows.length&&<p className="muted">先登录厂商账号并启用，即可在这里领取。</p>}
    </div>:<p className="benefits-empty">鱼粮还没开领。登录后点“一键签到”，结果会按渠道显示在这里。</p>}
    <details className="benefits-modes"><summary>哪些渠道需要签到？</summary><p>TRAE、CodeArts、Qoder / 中国版、Loomy、MiniMax 支持活动领取；小浣熊自动发放，ZCode 需在厂商页面人工验证，Cline / Gemini 没有独立每日签到。各家额度分别记录，不混算积分。</p></details>
  </section>;
}
