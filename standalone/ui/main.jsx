import { PersonaProfiles } from './personas.jsx';
import { AgentPanel } from './agent-panel.jsx';
import { BenefitsPanel } from './benefits.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { AccountChannels } from './accounts.jsx';
import { UnifiedModels } from './models.jsx';
import { QqSetup } from './qq-setup.jsx';
import { api } from './api.mjs';
const pages = ['互动实验室', '模型账号', 'QQ 接入', '人格与节奏', '记忆管理'];
const descriptions = ['在接入群聊前，先和大肥鱼聊聊。', '直接连接模型服务，不经过 DSH。', '官方 QQ Bot 或 NapCat，两条路径任选。', '让大肥鱼有自己的性格，也懂聊天的分寸。', '只记住明确交代的事，随时查看，也随时忘记。'];
const paths = ['M4 4h16v12H9l-5 4V4z', 'm12 3 9 5-9 5-9-5 9-5zm-9 5v9l9 5 9-5V8m-9 5v9', 'm9 15 6-6m-8 3-2 2a4 4 0 0 0 6 6l3-3m-2-8 2-2a4 4 0 0 1 6 6l-3 3', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM5 21v-3a7 7 0 0 1 14 0v3H5z', 'M4 6c0-4 16-4 16 0s-16 4-16 0zm0 0v12c0 4 16 4 16 0V6M4 12c0 4 16 4 16 0'];
function Icon({ index = 0, size = 22 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[index]} /></svg>; }
function Field({ label, help, children }) { return <label className="field"><span>{label}</span>{children}{help && <small>{help}</small>}</label>; }
function ListInput({ value, onChange, ...props }) {
  const [raw, setRaw] = useState(value.join(', '));
  const parse = s => s.split(/[,，\s]+/).filter(Boolean);
  useEffect(() => { if (JSON.stringify(parse(raw)) !== JSON.stringify(value)) setRaw(value.join(', ')); }, [value]);
  return <input {...props} value={raw} onChange={e => { setRaw(e.target.value); onChange(parse(e.target.value)); }} />;
}
function Toggle({ checked, onChange, children }) { return <label className="toggle-label"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><span className="switch" />{children}</label>; }
const reasons = { listen: '旁听，暂不插话', interest: '聊到感兴趣的话题', question: '接住一个公共问题', followup: '延续刚才的对话', name: '听见你叫我了', mention: '正在与你对话', cooldown: '让群友先聊一会儿', budget: '本分钟已经说得够多', busy: '忙着回复，先听着', 'low-signal': '这条消息适合旁听', repeat: '不跟着复读', muted: '遵守安静约定', mute: '已进入安静状态', unmute: '可以继续聊天了', remember: '记住你交代的事', forget: '已删除本会话记忆', recall: '查看自己的记忆', 'model-silence': '想了想，还是先听着', replied: '回复已送达' };
const statusLabels = { disconnected: '未连接 QQ', connecting: '正在连接', connected: 'QQ 已连接', reconnecting: '正在重连', listening: '回调待事件', error: 'QQ 连接失败' };
function App() {
  const [page, setPage] = useState(0), [snapshot, setSnapshot] = useState(null), [config, setConfig] = useState(null);
  const [revision, setRevision] = useState(0), [dirty, setDirty] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState('');
  const [saving, setSaving] = useState(false), [chat, setChat] = useState([]), [input, setInput] = useState(''), [passive, setPassive] = useState(false), [thinking, setThinking] = useState(false), [decision, setDecision] = useState(null);
  const [memories, setMemories] = useState([]), [memoryRevision, setMemoryRevision] = useState(0), [testing, setTesting] = useState('');
  const bottom = useRef(null), noticeTimer = useRef(), chatEpoch=useRef(0), memoryRequest=useRef(0);
  const notify = message => { setNotice(message); clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(''), 4500); };
  async function refresh(reload = false) {
    const s = await api('state'); setSnapshot(s);
    if (reload) { setConfig(s.config); setRevision(s.revision); setDirty(false); }
  }
  useEffect(() => { refresh(true).catch(e => setError(e.message)); const id = setInterval(() => refresh().catch(() => {}), 3000); return () => { clearInterval(id); clearTimeout(noticeTimer.current); }; }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [chat, thinking]);
  useEffect(()=>{chatEpoch.current++;memoryRequest.current++;setChat([]);setDecision(null);setThinking(false);setMemories([]);setError('');},[snapshot?.config?.activePersonaId]);
  useEffect(() => { if (page === 4) loadMemories(); }, [page,snapshot?.config?.activePersonaId]);
  useEffect(() => { if ((snapshot?.qqBinding?.phase === 'bound'||['pulling','starting','authorizing','waiting-qr','online','error'].includes(snapshot?.napcat?.phase)) && snapshot.revision !== revision && !dirty) refresh(true).catch(e => setError(e.message)); }, [snapshot?.qqBinding?.phase,snapshot?.napcat?.phase, snapshot?.revision, revision, dirty]);
  function update(fn) { setConfig(c => fn(structuredClone(c))); setDirty(true); setError(''); }
  async function save() {
    setSaving(true); setError('');
    try { const result = await api('config', { config, revision }, 'PUT'); setConfig(result.config); setRevision(result.revision); setDirty(false); notify('设置已保存；仅修改 QQ 接入或白名单时需要重新连接。'); await refresh(); return true; }
    catch (e) { setError(e.message); return false; } finally { setSaving(false); }
  }
  async function deletePersona(id){
    if(dirty){setError('请先保存更改再删除人格');return;}
    setSaving(true);setError('');
    try{const result=await api('personas/delete',{id,revision,confirmed:true});setConfig(result.config);setRevision(result.revision);setDirty(false);setMemories([]);await refresh();notify('已删除所选人格及其独立记忆，QQ 连接保持不变。');}
    catch(e){setError(e.message);}finally{setSaving(false);}
  }
  async function loadMemories() {
    const request=++memoryRequest.current;
    try { const r = await api('memories');if(request!==memoryRequest.current)return;setMemories(r.items); setMemoryRevision(r.revision); } catch (e) { if(request===memoryRequest.current)setError(e.message); }
  }
  async function send(e) {
    e.preventDefault(); if (!input.trim() || thinking) return;
    const epoch=++chatEpoch.current;
    const text = input; setInput(''); setError(''); setChat(c => [...c, { role: 'user', text }]); setThinking(true);
    try {
      const result = await api('chat', { text, passive }); if(epoch!==chatEpoch.current)return;setDecision(result);
      if (result.text) setChat(c => [...c, { role: 'assistant', text: result.text }]);
      else setChat(c => [...c, { role: 'quiet', text: reasons[result.reason] || result.reason }]);
      await refresh();
    } catch (e) { if(epoch!==chatEpoch.current)return;setError(e.message); setChat(c => [...c, { role: 'quiet', text: '这次没有生成回复，请检查模型设置。' }]); }
    finally { if(epoch===chatEpoch.current)setThinking(false); }
  }
  async function connect(action) {
    if (dirty && action === 'connect') { setError('请先保存设置，再连接 QQ'); return; }
    try { await api(`qq/${action}`, {}); await refresh(); } catch (e) { setError(e.message); }
  }
  async function bindQq(action) {
    setError('');
    if (action === 'login' && dirty && !await save()) return;
    try { await api(`qq/${action}`, {}); await refresh(); } catch (e) { setError(e.message); }
  }
  async function napcatAction(action,data={}){
    setError('');
    if(['start','login','configure','native-download','native-open','native-connect','native-start','native-pair'].includes(action)&&dirty&&!await save())throw new Error('设置还未保存，请先处理保存错误再启动');
    try{await api(`napcat/${action}`,data);await refresh(['native-connect','native-pair'].includes(action));}catch(e){setError(e.message);throw e;}
  }
  async function testProvider(id) {
    if (dirty) { setError('请先保存模型账号，再测试连接'); return; }
    setTesting(id); setError('');
    try { await api('provider/test', { id }); notify('真实模型调用成功'); } catch (e) { setError(e.message); } finally { setTesting(''); }
  }
  const q = snapshot?.qq || { state: 'disconnected' };
  return <div className="app"><aside className="sidebar"><div className="brand"><div className="brand-avatar"><img src="/bigfish-maid.png" alt="大肥鱼 Q 版蓝色女仆头像" /></div><div><strong>大肥鱼</strong><span>BigFish</span></div></div><nav aria-label="主导航">{pages.map((title, i) => <button key={title} className={page === i ? 'active' : ''} onClick={() => { setPage(i); setError(''); }}><Icon index={i} /><span>{title}</span></button>)}</nav><div className="local"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 4h14v12H5zm-3 16h20" /></svg><span>本地运行</span><span className="local-dot" /></div></aside>
    <main><header><div><h1>{pages[page]}</h1><p>{descriptions[page]}</p></div><span className={`connection ${q.state === 'connected' ? 'online' : ''}`}><i />{statusLabels[q.state] || q.state}</span></header>
    {error && <div role="alert" className="alert">{error}<button onClick={() => setError('')} aria-label="关闭错误提示">×</button></div>}
    {notice && <div role="status" className="toast">{notice}</div>}
    {!config ? <div className="loading">正在加载本地设置…</div> : <>
    {page === 0 && <div className="lab-layout"><section className="chat-panel" aria-label="聊天实验区"><div className="messages" aria-live="polite">{chat.length === 0 ? <div className="empty-chat"><img className="character" src="/bigfish-maid.png" alt="呆萌圆脸、抱着饭碗的大肥鱼 Q 版蓝色女仆" /><h2>试着开启一段对话</h2><p>这里使用真实模型，不会发到 QQ；会延续已保存上下文，发 /reset 可换新话题。</p></div> : chat.map((m, i) => m.role === 'quiet' ? <div key={i} className="quiet-note">{m.text}</div> : <div key={i} className={`message ${m.role}`}><span className="speaker">{m.role === 'user' ? '你' : '大肥鱼'}</span><div>{m.text}</div></div>)}{thinking && <div className="thinking"><span /><span /><span />大肥鱼正在想怎么接话</div>}<div ref={bottom} /></div><div className="composer"><form onSubmit={send}><input aria-label="聊天消息" placeholder="输入消息，Enter 发送…" maxLength={4000} value={input} onChange={e => setInput(e.target.value)} /><button className="primary" disabled={thinking || !input.trim()}>{thinking ? '思考中' : '发送'}</button></form><Toggle checked={passive} onChange={setPassive}>模拟普通群消息 <span className="hint" title="开启后会执行兴趣、冷却、预算等规则，可能保持安静；关闭则明确与大肥鱼对话。">?</span></Toggle></div></section>
      <aside className="inspector"><section><h2>本轮决策</h2><div className={`decision ${decision ? 'has-decision' : ''}`}>{decision ? <><strong>{reasons[decision.reason] || decision.reason}</strong><small>{decision.text ? '已回复' : '保持安静'}{decision.providerId ? ` · ${snapshot.config.providers.find(p => p.id === decision.providerId)?.name ?? '模型'}` : ''}</small></> : '尚无消息'}</div></section><section className="pipeline"><h2>运行链路</h2><ol>{['本地决策', '直接模型调用', 'QQ / OneBot'].map((t, i) => <li key={t}><span>{i + 1}</span>{t}</li>)}</ol></section><button className="setup-link" onClick={() => setPage(1)}><span>{snapshot?.modelCatalog?.length ? '管理模型账号' : '还未配置模型'}</span><b>去配置 →</b></button></aside></div>}
    {page === 1 && <div className="settings-page"><UnifiedModels catalog={snapshot?.modelCatalog} config={config}
        onChange={id=>update(c=>({...c,activeModelId:id}))} onTokenLimit={value=>update(c=>({...c,modelMaxOutputTokens:value}))}
        onRefresh={async()=>{const r=await api('models/refresh',{});await refresh();return r;}} onTest={async()=>{if(dirty)throw new Error('请先保存模型选择再测试');const r=await api('models/test',{});await refresh();return r;}} notify={notify} fail={setError}/>
      <AccountChannels states={snapshot?.accounts} trae={snapshot?.trae} config={config}
        request={async(id,action)=>{const r=await api(id==='trae'?`trae/${action}`:`accounts/${id}/${action}`,{});await refresh();return r;}}
        onOption={(id,key,value)=>update(c=>id==='trae'?{...c,trae:{...c.trae,[key]:value}}:{...c,accounts:{...c.accounts,[id]:{...c.accounts?.[id],[key]:value}}})}
        notify={notify} fail={setError}/>
      <BenefitsPanel state={snapshot?.benefits} enabled={config.benefits?.enabled} dirty={dirty} fail={setError}
        onEnabled={value=>update(c=>({...c,benefits:{...c.benefits,enabled:value}}))}
        request={async action=>{await api(`benefits/${action}`,{});await refresh();}}/>
      <details className="api-advanced"><summary>高级配置 · 兼容 API / 本机 Ollama</summary>
<div className="section-heading"><div><h2>API / Ollama 接入</h2><p>支持多个 OpenAI 兼容服务和本机 Ollama。请求未被上游接受时可尝试备用账号；已开始生成的响应异常不自动重发。</p></div><button className="primary" onClick={() => update(c => { const id = crypto.randomUUID(); c.providers.push({ id, name: '', type: 'compatible', baseUrl: '', model: '', enabled: true }); if (!c.activeProviderId) c.activeProviderId = id; return c; })}>＋ 添加账号</button></div>
      {!config.providers.some(p=>!['trae','account'].includes(p.type)) && <div className="empty-settings"><Icon index={1} size={36} /><h3>也可以添加自己的 API 或本机模型</h3><p>填写服务地址、模型 ID 和 API Key，或者连接本机 Ollama。</p></div>}
      {config.providers.map((p, i) => { if(['trae','account'].includes(p.type))return null; const change = (key, value) => update(c => { c.providers[i][key] = value; return c; }); return <section className="provider" key={p.id}><div className="provider-heading"><h3>{p.name || `新账号 ${i + 1}`}</h3><div className="provider-actions"><label><input type="radio" name="primary" checked={config.activeProviderId === p.id} onChange={() => update(c => ({ ...c, activeProviderId: p.id }))} /> 主账号</label><Toggle checked={p.enabled} onChange={v => change('enabled', v)}>启用</Toggle><button className="danger-text" onClick={() => update(c => { c.providers.splice(i, 1); if (c.activeProviderId === p.id) c.activeProviderId = c.providers[0]?.id || ''; return c; })}>删除</button></div></div><div className="form-grid"><Field label="账号名称"><input value={p.name} placeholder="例如：日常聊天" onChange={e => change('name', e.target.value)} /></Field><Field label="接入类型"><select value={p.type} onChange={e => update(c => { c.providers[i] = { ...c.providers[i], type: e.target.value, ...(e.target.value === 'ollama' ? { baseUrl: 'http://127.0.0.1:11434/v1', apiKey: '', clearKey: true } : {}) }; return c; })}><option value="compatible">OpenAI 兼容 API</option><option value="ollama">本机 Ollama</option>{p.type === 'account' && <option value="account">厂商账号 · {p.channelId}</option>}{p.type === 'trae' && <option value="trae">TRAE 客户端协议</option>}</select></Field><Field label="API 基址" help="填写包含 /v1 的完整基址；远程地址需 HTTPS。"><input disabled={p.type === 'trae' || p.type === 'account'} value={p.baseUrl} placeholder="https://你的服务地址/v1" onChange={e => change('baseUrl', e.target.value)} /></Field><Field label="模型 ID"><input value={p.model} placeholder={p.type === 'ollama' ? '本机已下载的模型名称' : 'deepseek-chat 或服务商提供的模型 ID'} onChange={e => change('model', e.target.value)} /></Field><Field label="API Key" help={p.hasKey ? '已加密保存；留空保留。更换服务地址时请重新填写。' : p.type === 'ollama' ? '本机 Ollama 可留空。' : '密钥只保存在本机，不回传到浏览器。'}><input autoComplete="new-password" type="password" disabled={p.type === 'trae' || p.type === 'account'} value={p.apiKey || ''} onChange={e => change('apiKey', e.target.value)} placeholder={p.type === 'account' ? '使用上方厂商账号登录态' : p.type === 'trae' ? '使用上方 TRAE 账号登录态' : p.hasKey ? '已保存 · 输入可替换' : '输入 API Key'} /></Field><Field label="单次输出 Token 上限" help="留空使用厂商默认值，不再固定限制为 800 Token。"><input type="number" min="1" step="1" value={p.maxOutputTokens ?? ''} placeholder="厂商默认" onChange={e => change('maxOutputTokens', e.target.value)} /></Field><div className="test-field"><button disabled={!!testing} onClick={() => testProvider(p.id)}>{testing === p.id ? '调用中…' : '测试真实调用'}</button><small>会发起一次短模型请求。</small></div></div></section>; })}</details>
      <div className="info-note">厂商账号在上方登录；也可以配置兼容 API 或本机 Ollama。更换模型后保存即可生效。</div><SaveBar {...{ dirty, saving, save }} reload={() => refresh(true).catch(e => setError(e.message))} /></div>}
    {page === 2 && <div className="settings-page"><QqSetup config={config} update={update} status={q} connect={connect} dirty={dirty} binding={snapshot?.qqBinding} onBind={bindQq} napcat={snapshot?.napcat} nativeNapcat={snapshot?.nativeNapcat} onNapcatAction={napcatAction} /><SaveBar {...{ dirty, saving, save }} reload={() => refresh(true).catch(e => setError(e.message))} /></div>}
    {page === 3 && <div className="settings-page"><PersonaProfiles config={config} update={update} savedId={snapshot?.config?.activePersonaId} saving={saving} dirty={dirty} onDelete={deletePersona}/><AgentPanel settings={config.agent} runtime={snapshot?.agent} editingPersonaId={config.activePersonaId} onChange={v=>update(c=>({...c,agent:{...c.agent,...v}}))}/><section className="settings-section"><h2>{config.personas?.find(p=>p.id===config.activePersonaId)?.name??'大肥鱼'}的设定</h2><div className="form-grid"><Field label="叫名触发" help="逗号分隔。消息开头叫这些名字时，明确回应。"><ListInput value={config.persona.nicknames} onChange={v => update(c => ({ ...c, persona: { ...c.persona, nicknames: v } }))} /></Field><Field label="感兴趣的话题" help="第一版使用关键词匹配，不是语义分类。"><ListInput value={config.persona.interests} onChange={v => update(c => ({ ...c, persona: { ...c.persona, interests: v } }))} /></Field></div><Field label="人格设定"><textarea rows={9} maxLength={4000} value={config.persona.guidance} onChange={e => update(c => ({ ...c, persona: { ...c.persona, guidance: e.target.value } }))} /></Field></section><section className="settings-section"><h2>什么时候说，什么时候安静</h2><div className="toggle-row"><Toggle checked={config.persona.enabled} onChange={v => update(c => ({ ...c, persona: { ...c.persona, enabled: v } }))}>参与普通群聊</Toggle><Toggle checked={config.persona.memoryEnabled} onChange={v => update(c => ({ ...c, persona: { ...c.persona, memoryEnabled: v } }))}>启用显式记忆</Toggle></div><div className="form-grid">{[['兴趣接话概率', 'replyProbability', 0, 1, 0.05], ['接话冷却（秒）', 'cooldownMs', 1, 600, 1], ['对话延续窗口（秒）', 'followupMs', 0, 300, 1], ['每分钟被动回复上限', 'maxRepliesPerMinute', 1, 10, 1], ['安静时长（分钟）', 'muteMs', 1, 1440, 1]].map(([label, key, min, max, step]) => { const factor = key === 'muteMs' ? 60000 : key.endsWith('Ms') ? 1000 : 1; return <Field label={label} key={key}><input type="number" min={min} max={max} step={step} value={config.persona[key] / factor} onChange={e => update(c => ({ ...c, persona: { ...c.persona, [key]: Number(e.target.value) * factor } }))} /></Field>; })}</div><p className="muted">说“大肥鱼，安静”暂停被动接话；“大肥鱼，可以说话了”恢复。明确 @ 仍可提问。</p></section><SaveBar {...{ dirty, saving, save }} reload={() => refresh(true).catch(e => setError(e.message))} /></div>}
    {page === 4 && <div className="settings-page"><div className="section-heading"><div><h2>明确记忆的事情 · {snapshot?.agent?.personaName??'大肥鱼'}</h2><p>只显示当前启用人格的记忆。明确说“记住：我喜欢乌龙茶”；按 QQ 群和成员隔离，实验室与真实群聊也不混用。</p></div><button onClick={loadMemories}>刷新列表</button></div>{!memories.length ? <div className="empty-settings"><Icon index={4} size={38} /><h3>还没有需要记住的事</h3><p>不会偷偷把每句话都存成画像。你明确说“记住”，才会留下笔记。</p></div> : <div className="table-wrap"><table><thead><tr><th>记住的事</th><th>会话 / 成员</th><th>记录时间</th><th>操作</th></tr></thead><tbody>{memories.map((m, i) => <tr key={`${m.at}-${i}`}><td>{m.text}</td><td><code>{m.room}</code><small>{m.sender}</small></td><td>{new Date(m.at).toLocaleString('zh-CN')}</td><td><button className="danger-text" onClick={async () => { try { await api('memories/delete', { index: i, item: m, revision: memoryRevision }); await loadMemories(); notify('已删除这条笔记'); } catch (e) { setError(e.message); } }}>忘记</button></td></tr>)}</tbody></table></div>}<div className="info-note">每人每群最多 8 条，保留 30 天；全部本地数据加密存储。删除会重置近期聊天窗口，但不会删除本机加密备份。请连同数据目录一起管理备份。</div></div>}
    </>}
    </main></div>;
}
function SaveBar({ dirty, saving, save, reload }) { return <div className="savebar"><span>{dirty ? '有尚未保存的更改' : '设置已同步'}</span><div><button onClick={reload} disabled={saving}>重新加载</button><button className="primary" onClick={save} disabled={!dirty || saving}>{saving ? '保存中…' : '保存设置'}</button></div></div>; }
createRoot(document.getElementById('root')).render(<App />);
