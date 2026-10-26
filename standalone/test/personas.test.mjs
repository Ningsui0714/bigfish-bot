import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createCipheriv,randomBytes} from 'node:crypto';
import {LocalStore,defaults,mergeConfig} from '../server/store.mjs';
import {SocialAgent} from '../server/agent.mjs';
import {personaScope} from '../server/persona-scope.mjs';
import {selectPersona,createPersona} from '../ui/persona-drafts.mjs';
const m=(content)=>({kind:'group',groupOpenid:'room',senderId:'user',senderName:'测试',messageId:crypto.randomUUID(),content});
const response=text=>({text,providerId:'fixture'});
const newProfile=(config,id='other',kind='persona',patch={})=>({id,name:kind==='template'?'测试模板':'测试人格',kind,persona:{...config.persona,guidance:'另一套独立设定',nicknames:['另一个名字']},agent:{...config.agent},...patch});
async function fixture(fn){const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-personas-')),store=await new LocalStore(dir).load();const agents=[];const make=model=>{const a=new SocialAgent({store,model});agents.push(a);return a;};try{await fn({dir,store,make});}finally{for(const a of agents)a.stop();await fs.rm(dir,{recursive:true,force:true});}}
async function add(store,id='other',kind='persona',patch={}){const c=store.get();await store.update({personas:[...c.personas,newProfile(c,id,kind,patch)]});}
async function activate(store,agent,id){await store.update({activePersonaId:id});agent?.reset();}

test('initial library contains only the existing persona, no generated characters or templates',()=>{
 const d=defaults();assert.equal(d.activePersonaId,'default');assert.equal(d.personas.length,1);assert.equal(d.personas[0].name,'大肥鱼');assert.equal(d.personas[0].kind,'persona');assert.deepEqual(d.persona,d.personas[0].persona);
});
test('legacy encrypted state migrates existing persona, notes and short history without creating extras',async()=>fixture(async({store,dir})=>{
 await store.update({persona:{...store.get().persona,guidance:'原来的设定'}});await store.memories([{room:'lab:room',sender:'user',text:'原来的笔记',at:Date.now()}]);await store.appendConversation('lab:room','user',{at:Date.now(),user:'原来的问题',assistant:'原来的回答'});
 const legacy=store.get();delete legacy.personas;delete legacy.activePersonaId;
 const key=await fs.readFile(join(dir,'local.key')),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv),body=Buffer.concat([cipher.update(JSON.stringify(legacy)),cipher.final()]);await fs.writeFile(join(dir,'state.enc'),Buffer.concat([iv,cipher.getAuthTag(),body]));
 const restored=(await new LocalStore(dir).load()).get();assert.equal(restored.personas.length,1);assert.equal(restored.persona.guidance,'原来的设定');assert.equal(restored.memories[0].text,'原来的笔记');assert.equal(restored.conversations[0].turns.length,1);
}));
test('switching activates selected persona and rhythm without overwriting the previous entry',async()=>fixture(async({store})=>{
 const original=store.get().persona;await add(store);await store.update({activePersonaId:'other'});assert.equal(store.get().persona.guidance,'另一套独立设定');
 await store.update({persona:{...store.get().persona,cooldownMs:45000,guidance:'修改后的新设定'},agent:{historyTurns:3}});assert.equal(store.get().personas.find(p=>p.id==='other').agent.historyTurns,3);
 await store.update({activePersonaId:'default'});assert.deepEqual(store.get().persona,original);assert.equal(store.get().agent.historyTurns,12);
}));
test('long-term notes, recalls and deletion are persona-isolated',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('记住：默认人格专属笔记'),{local:true});await add(store);await activate(store,a,'other');
 assert.equal(a.memories().length,0);assert.ok(!(await a.receive(m('/memory'),{local:true})).text.includes('专属笔记'));
 await a.receive(m('记住：另一个人格的笔记'),{local:true});assert.equal(store.get().memories.length,2);assert.equal(a.memories().length,1);
 await a.deleteMemory(0);assert.equal(a.memories().length,0);assert.equal(store.get().memories.length,1);
 await activate(store,a,'default');assert.equal(a.memories()[0].text,'默认人格专属笔记');
}));
test('short history never crosses persona boundaries and returns when switching back',async()=>fixture(async({store,make})=>{
 let prompt;const a=make(async(_c,p)=>{prompt=p;return response('原人格独有回答');});await a.receive(m('原人格独有问题'),{local:true});await add(store);await activate(store,a,'other');
 assert.equal(a.status().sessions.turns,0);await a.receive(m('新的问题'),{local:true});assert.ok(!JSON.stringify(prompt).includes('原人格独有问题'));assert.ok(!prompt.some(x=>x.role==='assistant'));
 await activate(store,a,'default');await a.receive(m('继续'),{local:true});assert.ok(prompt.some(x=>x.role==='assistant'&&x.content==='原人格独有回答'));assert.equal(a.status().personaId,'default');assert.equal(a.status().sessions.turns,2);
}));
test('disabling one persona history does not erase another persona history',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('默认历史'),{local:true});await add(store);await activate(store,a,'other');await a.receive(m('另一人格历史'),{local:true});
 await store.update({agent:{historyEnabled:false}});a.reset();assert.equal(a.status().sessions.turns,0);assert.equal(store.get().conversations.length,1);await activate(store,a,'default');assert.equal(a.status().sessions.turns,1);
}));
test('reset and forget operate only within the active persona',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('记住：原人格记忆'),{local:true});await a.receive(m('原人格聊天'),{local:true});await add(store);await activate(store,a,'other');await a.receive(m('记住：新人格记忆'),{local:true});await a.receive(m('新聊天'),{local:true});
 await a.receive(m('/reset'),{local:true});assert.equal(a.status().sessions.turns,0);assert.equal(a.memories().length,1);await a.receive(m('忘记我'),{local:true});assert.equal(a.memories().length,0);
 await activate(store,a,'default');assert.equal(a.memories().length,1);assert.equal(a.status().sessions.turns,1);
}));
test('templates are selectable but copying settings never copies notes or conversations',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('记住：不应复制'),{local:true});await a.receive(m('聊天'),{local:true});
 const draft=createPersona(store.publicConfig(),{id:'template-test',name:'测试模板',kind:'template',copy:true});assert.equal(draft.activePersonaId,'default');await store.update(draft);await activate(store,a,'template-test');
 assert.equal(a.memories().length,0);assert.equal(a.status().sessions.turns,0);assert.deepEqual(store.get().persona,store.get().personas[0].persona);
}));
test('draft selection stashes unsaved edits and can return without losing another profile',()=>{
 let c=defaults();c.persona.guidance='尚未保存的原设定';c=createPersona(c,{id:'draft',name:'尚未创建的人格',copy:false});assert.equal(c.persona.guidance,'');c.persona.guidance='尚未保存的新设定';
 c=selectPersona(c,'default');assert.equal(c.persona.guidance,'尚未保存的原设定');c=selectPersona(c,'draft');assert.equal(c.persona.guidance,'尚未保存的新设定');
});
test('invalid IDs, empty labels, missing active profiles and accidental removal are rejected',()=>{
 const c=defaults();for(const patch of [{activePersonaId:'missing'},{personas:[]},{personas:[{...c.personas[0],name:' '}]},{personas:[...c.personas,{...c.personas[0]}]},{personas:[{...c.personas[0],id:'invalid:scope'}]},{personas:[{...c.personas[0],id:'replacement'}],activePersonaId:'replacement'}])assert.throws(()=>mergeConfig(patch,c));
 assert.throws(()=>createPersona(c,{id:'new',name:' '}));assert.throws(()=>selectPersona(c,'missing'));
});
test('profile-specific retention survives encrypted reload and public config contains no notes',async()=>fixture(async({store,dir,make})=>{
 const a=make(async()=>response('隐藏对话'));await a.receive(m('记住：隐藏笔记'),{local:true});await a.receive(m('隐藏问题'),{local:true});await add(store,'other','persona',{agent:{historyEnabled:false,historyTurns:2,historyTtlHours:1}});await activate(store,a,'other');
 const reload=await new LocalStore(dir).load();assert.equal(reload.get().activePersonaId,'other');assert.equal(reload.get().agent.historyEnabled,false);assert.equal(reload.get().conversations.length,1);assert.ok(!JSON.stringify(reload.publicConfig()).includes('隐藏笔记'));assert.ok(!(await fs.readFile(join(dir,'state.enc'))).includes('隐藏笔记'));
}));
test('profile activation aborts an old reply and never delivers it under the new persona',async()=>fixture(async({store,make})=>{
 let start,finish;const started=new Promise(r=>start=r),late=new Promise(r=>finish=r),sent=[];const a=make(async()=>{start();return late;});
 await add(store);const old=a.receive(m('旧人格的问题'),{local:true,send:async t=>sent.push(t)}),rejected=assert.rejects(old,{name:'AbortError'});await started;await activate(store,a,'other');finish(response('不应发送'));await rejected;assert.deepEqual(sent,[]);assert.equal(a.status().sessions.turns,0);
}));
test('runtime traces and counts expose only the currently active persona',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('原人格消息'),{local:true});await add(store);await activate(store,a,'other');assert.equal(a.status().traces.length,0);assert.equal(a.status().sessions.count,0);await a.receive(m('/help'),{local:true});assert.equal(a.status().traces.length,1);assert.ok(a.status().traces[0].room.startsWith('persona:other:'));
 await activate(store,a,'default');assert.ok(a.status().traces.every(t=>!t.room.startsWith('persona:other:')));
}));
test('default persona scope preserves existing note/history identifiers',()=>{
 assert.equal(personaScope('default','qq:123'),'qq:123');assert.equal(personaScope('other','qq:123'),'persona:other:qq:123');
});
test('HTTP persona activation keeps QQ connected and memory APIs follow only the saved active persona',async()=>fixture(async({dir})=>{
 const {createApplication}=await import('../server/index.mjs'),{WebSocketServer}=await import('ws');const ws=new WebSocketServer({host:'127.0.0.1',port:0});await new Promise(r=>ws.once('listening',r));let connections=0;
 ws.on('connection',socket=>{connections++;socket.on('message',raw=>{const e=JSON.parse(raw);socket.send(JSON.stringify({echo:e.echo,status:'ok',retcode:0,data:{user_id:789,nickname:'fixture'}}));});});
 const app=await createApplication({dataDir:dir,model:async()=>response('测试回答')});app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));
 try{
  await app.store.update({qq:{url:`ws://127.0.0.1:${ws.address().port}`}});app.qq.connect(app.store.get().qq);for(let i=0;i<100&&app.qq.status.state!=='connected';i++)await new Promise(r=>setTimeout(r,5));assert.equal(app.qq.status.state,'connected');
  await app.agent.receive(m('记住：原人格的 HTTP 笔记'),{local:true});const base=`http://127.0.0.1:${app.server.address().port}`,h=await fetch(base),cookie=h.headers.get('set-cookie').split(';')[0],headers={cookie,origin:base,'Content-Type':'application/json'};
  const state=await(await fetch(base+'/api/state',{headers})).json(),profiles=[...state.config.personas,newProfile(state.config)];
  let r=await fetch(base+'/api/config',{method:'PUT',headers,body:JSON.stringify({revision:state.revision,config:{personas:profiles,activePersonaId:'other'}})});assert.equal(r.status,200);const changed=await r.json();assert.equal(app.qq.status.state,'connected');assert.equal(connections,1);
  assert.deepEqual((await(await fetch(base+'/api/memories',{headers})).json()).items,[]);await app.agent.receive(m('记住：新人格的 HTTP 笔记'),{local:true});
  const other=await(await fetch(base+'/api/memories',{headers})).json();assert.equal(other.items.length,1);assert.match(other.items[0].text,/新人格/);
  r=await fetch(base+'/api/config',{method:'PUT',headers,body:JSON.stringify({revision:changed.revision,config:{activePersonaId:'default'}})});assert.equal(r.status,200);
  const original=await(await fetch(base+'/api/memories',{headers})).json();assert.equal(original.items.length,1);assert.match(original.items[0].text,/原人格/);
  const staleDelete=await fetch(base+'/api/memories/delete',{method:'POST',headers,body:JSON.stringify({revision:other.revision,index:0,item:other.items[0]})});assert.equal(staleDelete.status,409);assert.equal(app.agent.memories().length,1);assert.equal(connections,1);
 }finally{await app.close();await new Promise(r=>ws.close(r));}
}));
test('renaming a persona does not change its memory namespace or copy notes',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('记住：改名后仍属于我'),{local:true});const c=store.get();await store.update({personas:c.personas.map(p=>({...p,name:'显示名称改动'}))});a.reset();assert.equal(a.memories().length,1);assert.equal(a.status().personaName,'显示名称改动');assert.equal(store.get().personas.length,1);
}));
test('deleting an inactive persona clears only its notes/history and leaves the active profile intact',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('记住：保留的笔记'),{local:true});await a.receive(m('保留的对话'),{local:true});await add(store);await activate(store,a,'other');await a.receive(m('记住：待删除笔记'),{local:true});await a.receive(m('待删除对话'),{local:true});await activate(store,a,'default');
 await store.deletePersona('other');a.personaDeleted('other',false);const c=store.get();assert.equal(c.activePersonaId,'default');assert.equal(c.personas.length,1);assert.equal(c.memories.length,1);assert.equal(c.memories[0].text,'保留的笔记');assert.equal(c.conversations.length,1);assert.equal(a.status().sessions.turns,1);
 assert.ok(a.status().traces.every(t=>!t.room.startsWith('persona:other:')));
}));
test('deleting the active profile switches back to an existing profile and preserves its memory',async()=>fixture(async({store,make})=>{
 const a=make(async()=>response('回答'));await a.receive(m('记住：原人格记忆'),{local:true});await add(store);await activate(store,a,'other');await a.receive(m('记住：待删除人格记忆'),{local:true});await store.deletePersona('other');a.personaDeleted('other',true);
 assert.equal(a.status().personaId,'default');assert.equal(a.memories().length,1);assert.equal(a.memories()[0].text,'原人格记忆');assert.equal(store.get().persona.guidance,store.get().personas[0].persona.guidance);
}));
test('the original default profile can be deleted when another profile exists and reload stays valid',async()=>fixture(async({store,make,dir})=>{
 const a=make(async()=>response('回答'));await a.receive(m('记住：默认待删除'),{local:true});await add(store,'remaining','template');await activate(store,a,'remaining');await a.receive(m('记住：模板保留'),{local:true});await activate(store,a,'default');
 await store.deletePersona('default');a.personaDeleted('default',true);const reload=await new LocalStore(dir).load(),c=reload.get();assert.equal(c.personas.length,1);assert.equal(c.activePersonaId,'remaining');assert.equal(c.personas[0].kind,'template');assert.equal(c.memories[0].text,'模板保留');assert.equal(c.memories.length,1);assert.equal(a.status().traces.length,1);
}));
test('last profile and missing profile deletion fail without touching persisted data',async()=>fixture(async({store,dir})=>{
 await store.update({});const before=await fs.readFile(join(dir,'state.enc'));
 await assert.rejects(store.deletePersona('default'),/至少保留/);await assert.rejects(store.deletePersona('missing'),/不存在/);assert.deepEqual(await fs.readFile(join(dir,'state.enc')),before);assert.equal(store.get().personas.length,1);
}));
test('deletion cancels the old persona reply and removes its diagnostic records',async()=>fixture(async({store,make})=>{
 let start,finish;const started=new Promise(r=>start=r),late=new Promise(r=>finish=r),sent=[];const a=make(async()=>{start();return late;});await add(store);await activate(store,a,'other');
 const old=a.receive(m('待删除人格的问题'),{local:true,send:async t=>sent.push(t)}),rejected=assert.rejects(old,{name:'AbortError'});await started;await store.deletePersona('other');a.personaDeleted('other',true);finish(response('不应发送'));await rejected;
 assert.deepEqual(sent,[]);assert.equal(store.get().conversations.length,0);assert.ok(!a.events.some(e=>e.room?.startsWith('persona:other:')&&e.reason==='replied'));assert.equal(a.status().personaId,'default');
}));
test('HTTP deletion requires current revision and confirmation, and keeps the existing QQ socket',async()=>fixture(async({dir})=>{
 const {createApplication}=await import('../server/index.mjs'),{WebSocketServer}=await import('ws');const ws=new WebSocketServer({host:'127.0.0.1',port:0});await new Promise(r=>ws.once('listening',r));let connections=0;
 ws.on('connection',socket=>{connections++;socket.on('message',raw=>{const e=JSON.parse(raw);socket.send(JSON.stringify({echo:e.echo,status:'ok',retcode:0,data:{user_id:789,nickname:'fixture'}}));});});
 const app=await createApplication({dataDir:dir,model:async()=>response('回答')});app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));
 try{
  await app.store.update({qq:{url:`ws://127.0.0.1:${ws.address().port}`}});await add(app.store);await activate(app.store,app.agent,'other');app.qq.connect(app.store.get().qq);for(let i=0;i<100&&app.qq.status.state!=='connected';i++)await new Promise(r=>setTimeout(r,5));
  const b=`http://127.0.0.1:${app.server.address().port}`,h=await fetch(b),cookie=h.headers.get('set-cookie').split(';')[0],headers={cookie,origin:b,'Content-Type':'application/json'},post=body=>fetch(b+'/api/personas/delete',{method:'POST',headers,body:JSON.stringify(body)});
  assert.equal((await post({id:'other',revision:0})).status,400);assert.equal((await post({id:'other',revision:999,confirmed:true})).status,409);assert.equal(app.store.get().personas.length,2);
  const r=await post({id:'other',revision:0,confirmed:true}),d=await r.json();assert.equal(r.status,200);assert.equal(d.revision,1);assert.equal(d.config.activePersonaId,'default');assert.equal(d.config.personas.length,1);assert.equal(app.qq.status.state,'connected');assert.equal(connections,1);
  assert.equal((await post({id:'default',revision:0,confirmed:true})).status,409);assert.equal((await post({id:'default',revision:1,confirmed:true})).status,400);assert.equal(app.store.get().personas.length,1);
 }finally{await app.close();await new Promise(r=>ws.close(r));}
}));
test('delivery checks active persona even in the gap between persisted deletion and runtime reset',async()=>fixture(async({store})=>{
 await add(store);await store.update({activePersonaId:'other'});const sent=[];
 const a=new SocialAgent({store,plugins:[{id:'delete-before-delivery',hooks:{afterModel:async()=>{await store.deletePersona('other');}}}],model:async()=>response('不应发到另一个人格')});
 try{await assert.rejects(a.receive(m('问题'),{local:true,send:async text=>sent.push(text)}),{name:'AbortError'});assert.deepEqual(sent,[]);assert.equal(store.get().conversations.length,0);}finally{a.stop();}
}));
