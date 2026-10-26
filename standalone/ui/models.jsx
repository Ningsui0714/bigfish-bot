import React,{useState} from 'react';
export function UnifiedModels({catalog=[],config,onChange,onTokenLimit,onRefresh,onTest,notify,fail}){
  const [busy,setBusy]=useState('');
  const selected=catalog.find(m=>m.id===config.activeModelId);
  async function refresh(){setBusy('refresh');try{const r=await onRefresh();const failed=r.results.filter(x=>!x.ok);notify(failed.length?`目录已更新，${failed.length} 个渠道暂未返回新目录`:`目录已更新：${r.models.length} 个统一模型`);}catch(e){fail(e.message);}finally{setBusy('');}}
  async function test(){setBusy('test');try{await onTest();notify('统一模型真实调用成功');}catch(e){fail(e.message);}finally{setBusy('');}}
  return <section className="unified-models"><div className="section-heading"><div><span className="eyebrow">模型优先 · 渠道自动选择</span><h2>大肥鱼用哪个模型</h2><p>同一个模型只出现一次，厂商和日期后缀在后台归并。</p></div><button disabled={busy} onClick={refresh}>{busy==='refresh'?'刷新目录…':'刷新模型目录'}</button></div>
    <label className="field"><span>聊天模型</span><select aria-label="统一聊天模型" value={config.activeModelId||''} onChange={e=>onChange(e.target.value)}><option value="">请选择模型</option>{config.activeModelId&&!selected&&<option value={config.activeModelId}>{config.activeModelId} · 暂无可用渠道</option>}{catalog.map(m=><option key={m.id} value={m.id}>{m.name} · {m.channelCount} 个渠道</option>)}</select></label><button disabled={busy||!selected} onClick={test}>{busy==='test'?'调用中…':'测试当前模型'}</button>
    {selected?<div className="model-route-summary"><strong>{selected.name}</strong><span>自动选择已登录、已启用的接入渠道</span><small>{[...new Set(selected.routes.map(r=>r.channelName))].join(' / ')} · {selected.routes.length} 个原始标识，{selected.channelCount} 个接入渠道</small><details><summary>查看归并的原始模型标识</summary>{selected.routes.map(r=><div className="model-wire" key={`${r.providerId}:${r.wireModel}`}><span>{r.channelName}</span><code>{r.wireModel}</code>{r.source==='snapshot'&&<small>协议目录</small>}</div>)}</details></div>:<p className="muted">登录账号后刷新模型目录，或在高级配置添加 API / Ollama。已有选择会保留，不会悄悄换成其他模型。</p>}
    <label className="field"><span>单次输出 Token 上限</span><input type="number" min="1" step="1" placeholder="留空使用厂商默认值" value={config.modelMaxOutputTokens??''} onChange={e=>onTokenLimit(e.target.value)}/></label>
  </section>;
}
