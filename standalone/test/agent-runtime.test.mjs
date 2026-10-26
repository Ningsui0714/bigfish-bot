import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SocialAgent} from '../server/agent.mjs';
import {LocalStore,defaults,mergeConfig} from '../server/store.mjs';
import {AgentPlugins,normalizeAgentSettings,normalizeConversations} from '../server/agent-runtime.mjs';
const m=(content,extra={})=>({kind:'group',groupOpenid:'123',senderId:'456',senderName:'测试成员',messageId:crypto.randomUUID(),content,...extra});
const reply=text=>({text,providerId:'fixture'});
const barrier=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
async function fixture(fn){const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-agent-v2-'));const store=await new LocalStore(dir).load();const agents=[];const make=options=>{const a=new SocialAgent({store,...options});agents.push(a);return a;};try{await fn({store,dir,make});}finally{for(const a of agents)a.stop();await fs.rm(dir,{recursive:true,force:true});}}

test('successful conversations survive restart encrypted and use actual user/assistant roles',async()=>fixture(async({store,dir,make})=>{
 const a=make({model:async()=>reply('先喝乌龙茶吧')});await a.receive(m('我今天想喝茶'),{local:true});a.stop();
 const disk=await fs.readFile(join(dir,'state.enc'));assert.ok(!disk.includes('乌龙茶'));assert.equal(store.publicConfig().conversations,undefined);
 const restored=await new LocalStore(dir).load();let prompt;const b=new SocialAgent({store:restored,model:async(_c,p)=>{prompt=p;return reply('还记得呢');}});
 try{await b.receive(m('刚才聊到哪里'),{local:true});assert.ok(prompt.some(x=>x.role==='assistant'&&x.content==='先喝乌龙茶吧'));assert.equal(b.status().sessions.turns,2);}finally{b.stop();}
}));
test('history is isolated by channel, conversation, and sender',async()=>fixture(async({make,store})=>{
 let prompt;const a=make({model:async(_c,p)=>{prompt=p;return reply('私人回答');}});await a.receive(m('scope-secret'),{local:true});
 await a.receive(m('另一个人',{senderId:'999'}),{local:true});assert.ok(!prompt.some(x=>x.role==='assistant'&&x.content==='私人回答'));
 assert.ok(prompt.find(x=>x.content.startsWith('参考聊天数据'))?.content.includes('scope-secret')); // Shared-room public conversation can be heard; personal notes remain isolated.
 await store.update({qq:{allowedGroupIds:['123']}});await a.receive(m('真实 QQ',{addressed:true}));assert.ok(!JSON.stringify(prompt).includes('scope-secret'));
 await a.receive(m('另一房间',{groupOpenid:'789'}),{local:true});assert.ok(!JSON.stringify(prompt).includes('scope-secret'));
}));
test('queued turns include delivered previous replies, never a future message in the first prompt',async()=>fixture(async({make})=>{
 const started=barrier(),release=barrier(),prompts=[];let calls=0;
 const a=make({model:async(_c,p)=>{prompts.push(p);if(++calls===1){started.resolve();await release.promise;}return reply('回答'+calls);}});
 const first=a.receive(m('第一句'),{local:true});await started.promise;
 const second=a.receive(m('future-message'),{local:true});release.resolve();await Promise.all([first,second]);
 assert.ok(!JSON.stringify(prompts[0]).includes('future-message'));assert.ok(prompts[1].some(x=>x.role==='assistant'&&x.content==='回答1'));assert.equal(a.status().activeRooms,0);
}));
test('/reset cancels old inference without waiting for a model that ignores cancellation',async()=>fixture(async({make,store})=>{
 const started=barrier(),late=barrier(),sent=[];let calls=0;
 const a=make({model:async()=>{if(++calls===1){started.resolve();return late.promise;}return reply('新话题回答');}});
 await a.receive(m('记住：我喜欢茶'),{local:true});const old=a.receive(m('长问题'),{local:true,send:async t=>sent.push(t)});const rejected=assert.rejects(old,{name:'AbortError'});await started.promise;
 const reset=await a.receive(m('/reset'),{local:true});assert.match(reset.text,/新话题/);await rejected;
 await a.receive(m('新话题'),{local:true,send:async t=>sent.push(t)});late.resolve(reply('旧回答'));
 assert.deepEqual(sent,['新话题回答']);assert.equal(store.get().memories.length,1);assert.equal(a.status().sessions.turns,1);
}));
test('local /help /memory /status do not call the model or expose another member notes',async()=>fixture(async({make})=>{
 const a=make({model:async()=>{throw Error('must not call');}});
 await a.receive(m('记住：独有笔记'),{local:true});assert.match((await a.receive(m('/memory'),{local:true})).text,/独有笔记/);
 assert.ok(!(await a.receive(m('/memory',{senderId:'999'}),{local:true})).text.includes('独有笔记'));
 assert.match((await a.receive(m('/status'),{local:true})).text,/加密/);assert.match((await a.receive(m('/help'),{local:true})).text,/reset/);
}));
test('unaddressed group slash commands and disabled commands never invoke a model',async()=>fixture(async({make,store})=>{
 await store.update({qq:{allowedGroupIds:['123']}});let calls=0;const a=make({model:async()=>{calls++;return reply('unexpected');}});
 assert.equal((await a.receive(m('/reset',{addressed:false}))).reason,'command-not-supported');
 await store.update({agent:{commandsEnabled:false}});assert.equal((await a.receive(m('/help'),{local:true})).reason,'command-not-supported');assert.equal(calls,0);
}));
test('model silence and failed delivery never create durable turns',async()=>fixture(async({make,store})=>{
 const quiet=make({model:async()=>reply('[[QQ_SILENT]]')});assert.equal((await quiet.receive(m('你好'),{local:true})).reason,'model-silence');assert.equal(quiet.status().sessions.turns,0);
 const fail=make({model:async()=>reply('没送到的回答')});await assert.rejects(fail.receive(m('你好'),{local:true,send:async()=>{throw Error('delivery failed');}}),/delivery/);
 assert.deepEqual(store.get().conversations,[]);assert.equal(fail.status().traces.at(-1).stages.at(-1).name,'delivery');
}));
test('trusted plugin hooks decorate the actual request and reply in order',async()=>fixture(async({make})=>{
 const order=[],sent=[];const plugin={id:'fixture',name:'测试插件',hooks:{beforeModel:ctx=>{order.push('before');ctx.messages.push({role:'user',content:'插件上下文'});},afterModel:ctx=>{order.push('after');ctx.result.text+='～';},afterDelivery:()=>order.push('delivered')}};
 const a=make({plugins:[plugin],model:async(_c,p)=>{order.push('model');assert.equal(p.at(-1).content,'插件上下文');return reply('回答');}});
 await a.receive(m('你好'),{local:true,send:async text=>{order.push('send');sent.push(text);}});assert.deepEqual(order,['before','model','after','send','delivered']);assert.deepEqual(sent,['回答～']);
 assert.ok(a.status().plugins.some(p=>p.id==='fixture'));assert.equal(a.status().sessions.turns,1);
}));
test('plugin command priority can short-circuit the model and unregister cleanly',async()=>fixture(async({make})=>{
 const a=make({model:async()=>{throw Error('must not call');}});const unregister=a.plugins.register({id:'custom-command',priority:200,hooks:{command:ctx=>ctx.message.content==='/ping'&&ctx.addressed?{handled:true,reason:'plugin-command',text:'pong'}:null}});
 assert.equal((await a.receive(m('/ping'),{local:true})).text,'pong');unregister();assert.match((await a.receive(m('/ping'),{local:true})).text,/help/);
}));
test('plugin failures after delivery never retry or lose the delivery receipt',async()=>fixture(async({make})=>{
 let calls=0,sends=0;const a=make({plugins:[{id:'broken-receipt',hooks:{afterDelivery:()=>{throw Error('private-secret-error');}}}],model:async()=>{calls++;return reply('一次');}});
 const result=await a.receive(m('你好'),{local:true,send:async()=>sends++});assert.equal(result.text,'一次');assert.equal(calls,1);assert.equal(sends,1);assert.equal(a.status().sessions.turns,1);assert.ok(!JSON.stringify(a.status()).includes('private-secret'));
}));
test('access checks precede command/plugin handling and expose a reason, not content',async()=>fixture(async({make})=>{
 let hooks=0;const a=make({plugins:[{id:'access-fixture',hooks:{command:()=>{hooks++;}}}]});
 const result=await a.receive(m('/help private-body'));assert.equal(result.reason,'access-denied');assert.equal(hooks,0);
 const status=JSON.stringify(a.status());assert.ok(!status.includes('private-body'));assert.equal(a.status().traces.at(-1).stages[0].state,'blocked');
}));
test('configuration reset cancels old queues without deleting the new generation queue',async()=>fixture(async({make})=>{
 const firstStarted=barrier(),secondStarted=barrier(),late=barrier(),release=barrier();let n=0;
 const a=make({model:async()=>{if(++n===1){firstStarted.resolve();return late.promise;}secondStarted.resolve();await release.promise;return reply('新世代');}});
 const first=a.receive(m('旧世代'),{local:true}),rejected=assert.rejects(first,{name:'AbortError'});await firstStarted.promise;a.reset();const second=a.receive(m('新世代'),{local:true});await secondStarted.promise;await rejected;
 assert.equal(a.status().activeRooms,1);release.resolve();await second;late.resolve(reply('过期'));assert.equal(a.status().activeRooms,0);
}));
test('settings bound history retention and disable erases current short-term history only',async()=>fixture(async({make,store})=>{
 assert.deepEqual(normalizeAgentSettings({historyTurns:999,historyTtlHours:-1}),{historyEnabled:true,historyTurns:24,historyTtlHours:1,commandsEnabled:true});
 await store.update({agent:{historyTurns:1}});const a=make({model:async()=>reply('回答')});await a.receive(m('记住：喜欢电影'),{local:true});await a.receive(m('第一轮'),{local:true});await a.receive(m('第二轮'),{local:true});assert.equal(a.status().sessions.turns,1);
 await store.update({agent:{historyEnabled:false}});assert.equal(store.get().conversations.length,0);assert.equal(store.get().memories.length,1);
 const now=Date.now();assert.deepEqual(normalizeConversations([{scope:'a',sender:'b',turns:[{at:now-25*3600000,user:'旧问题',assistant:'旧回答'}]}],{},now),[]);
 assert.equal(mergeConfig({conversations:[{scope:'forged'}]},defaults()).conversations.length,0);
}));
test('forget clears the current sender persistent and recent context but not other members',async()=>fixture(async({make,store})=>{
 const a=make({model:async()=>reply('独有回答')});await a.receive(m('记住：独有记忆'),{local:true});await a.receive(m('独有问题'),{local:true});await a.receive(m('另一个人',{senderId:'999'}),{local:true});
 await a.receive(m('忘记我'),{local:true});assert.equal(a.memories().length,0);assert.equal(a.sessions.history('lab:123','456').length,0);assert.equal(a.sessions.history('lab:123','999').length,1);
 assert.ok(!store.publicConfig().conversations);
}));
test('name-triggered conversation is explicitly addressed in the model prompt',async()=>fixture(async({make,store})=>{
 await store.update({qq:{allowedGroupIds:['123']}});let prompt;const a=make({model:async(_c,p)=>{prompt=p;return reply('在呢');}});
 const r=await a.receive(m('大肥鱼 哈喽',{addressed:false}));assert.equal(r.reason,'name');assert.match(prompt[0].content,/明确与你对话/);
}));
test('plugin registration rejects duplicate IDs and unknown hooks',()=>{
 const plugins=new AgentPlugins();plugins.register({id:'fixture',hooks:{}});assert.throws(()=>plugins.register({id:'fixture'}),/重复/);assert.throws(()=>plugins.register({id:'invalid',hooks:{executeShell:()=>{}}}),/钩子/);
});
test('escaped user messages retain complete JSON across encrypted reload',async()=>fixture(async({make,store,dir})=>{
 const a=make({model:async()=>reply('收到')});await a.receive(m('"\\'.repeat(1800)),{local:true});
 const reloaded=await new LocalStore(dir).load(),turn=reloaded.get().conversations[0].turns[0];assert.equal(JSON.parse(turn.user).text,'"\\'.repeat(1800));
}));
test('HTTP agent settings keep an already-connected QQ transport and hide raw history',async()=>fixture(async({store,dir})=>{
 const {createApplication}=await import('../server/index.mjs'),{WebSocketServer}=await import('ws');
 const ws=new WebSocketServer({host:'127.0.0.1',port:0});await new Promise(r=>ws.once('listening',r));let connections=0;
 ws.on('connection',socket=>{connections++;socket.on('message',raw=>{const e=JSON.parse(raw);socket.send(JSON.stringify({echo:e.echo,status:'ok',retcode:0,data:{user_id:789,nickname:'fixture'}}));});});
 const app=await createApplication({dataDir:dir,model:async()=>reply('history-private-body')});app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));
 try{
  await app.store.update({qq:{url:`ws://127.0.0.1:${ws.address().port}`}});app.qq.connect(app.store.get().qq);
  for(let i=0;i<100&&app.qq.status.state!=='connected';i++)await new Promise(r=>setTimeout(r,5));assert.equal(app.qq.status.state,'connected');
  await app.agent.receive(m('secret-test-body'),{local:true});
  const base=`http://127.0.0.1:${app.server.address().port}`,home=await fetch(base),cookie=home.headers.get('set-cookie').split(';')[0],headers={cookie,origin:base,'Content-Type':'application/json'};
  const state=await(await fetch(base+'/api/state',{headers})).json();assert.equal(state.agent.version,2);assert.ok(!JSON.stringify(state).includes('history-private-body'));assert.ok(!JSON.stringify(state).includes('secret-test-body'));
  const response=await fetch(base+'/api/config',{method:'PUT',headers,body:JSON.stringify({revision:state.revision,config:{agent:{historyTurns:6}}})});assert.equal(response.status,200);assert.equal(app.qq.status.state,'connected');assert.equal(connections,1);
 }finally{await app.close();await new Promise(r=>ws.close(r));}
}));
test('an unaddressed group command cannot enter even a permissive custom command hook',async()=>fixture(async({make,store})=>{
 await store.update({qq:{allowedGroupIds:['123']}});let called=0;const a=make({plugins:[{id:'permissive',priority:200,hooks:{command:()=>{called++;return {handled:true,text:'不应发送'};}}}]});
 assert.equal((await a.receive(m('/custom',{addressed:false}))).reason,'command-not-supported');assert.equal(called,0);
}));
test('reset by one member does not cancel another member active in the same group',async()=>fixture(async({make})=>{
 const started=barrier(),release=barrier(),sent=[];const a=make({model:async()=>{started.resolve();await release.promise;return reply('另一成员的回答');}});
 const other=a.receive(m('另一成员的问题',{senderId:'999'}),{local:true,send:async t=>sent.push(t)});await started.promise;
 await a.receive(m('/reset'),{local:true});release.resolve();await other;assert.deepEqual(sent,['另一成员的回答']);assert.equal(a.sessions.history('lab:123','999').length,1);
}));
