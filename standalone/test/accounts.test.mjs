import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {setImmediate as immediate} from 'node:timers/promises';
import {LocalStore, defaults, mergeConfig} from '../server/store.mjs';
import {AccountHub} from '../server/accounts.mjs';
import {ACCOUNT_CHANNELS, publicAccounts} from '../server/channel-state.mjs';
import {channelOperation,protocolFetch} from '../server/channel-transport.mjs';
import * as sdk from '../server/vendor/channels.mjs';
import {completion,generate} from '../server/providers.mjs';
import {createApplication} from '../server/index.mjs';
const credential={access_token:'fixture-account-token-secret',refresh_token:'fixture-account-refresh-secret',expires_at:String(Date.now()+86_400_000),user_id:'fixture-user',nickname:'测试账号'};
const json=d=>new Response(JSON.stringify(d),{headers:{'Content-Type':'application/json'}});
const sse=frames=>new Response(frames.map(f=>`data: ${typeof f==='string'?f:JSON.stringify(f)}\n\n`).join(''),{headers:{'Content-Type':'text/event-stream'}});
const p=(channelId,model='fixture-model')=>({id:`account-${channelId}`,name:channelId,type:'account',channelId,model,enabled:true});
async function fixture(fn,opts={}){const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-accounts-'));const store=await new LocalStore(dir).load();const hub=new AccountHub({store,...opts});try{await fn({store,hub,dir});}finally{await hub.stop();await fs.rm(dir,{recursive:true,force:true});}}
test('all nine active channels expose real features and start disconnected',()=>{const h=new AccountHub({store:{get:defaults}});assert.equal(h.statuses().length,9);assert.ok(h.statuses().every(s=>!s.loggedIn&&!s.testedAt&&!s.autoCheckin));assert.equal(h.statuses().find(s=>s.id==='zcode').daily,false);});
test('account credentials are encrypted, reloadable, masked, and immune to config injection',async()=>fixture(async({store,dir})=>{
 await store.patchAccount('cline',{credential});await store.update({accounts:{cline:{autoCheckin:true,credential:{access_token:'forged'}}}});
 assert.equal(store.get().accounts.cline.credential.access_token,credential.access_token);assert.equal(store.get().accounts.cline.autoCheckin,false);
 assert.ok(!JSON.stringify(store.publicConfig()).includes('fixture-account-token-secret'));assert.ok(!(await fs.readFile(join(dir,'state.enc'))).includes('fixture-account-token-secret'));
 const loaded=await new LocalStore(dir).load();assert.equal(loaded.get().accounts.cline.credential.refresh_token,credential.refresh_token);
}));
test('legacy TRAE settings survive account migration and all provider routes validate channel ids',()=>{
 const d=defaults();d.trae.autoCheckin=true;const c=mergeConfig({providers:[p('cline')],activeProviderId:'account-cline'},d);assert.equal(c.trae.autoCheckin,true);assert.equal(c.providers[0].baseUrl,'account:cline');
 assert.throws(()=>mergeConfig({providers:[p('missing')]},d),/未知/);assert.throws(()=>mergeConfig({providers:[p('cline'),{...p('cline'),id:'second'}]},d),/一个账号/);
});
test('cancelled or logged-out login cannot save a late result',async()=>{
 let resolve,closed=0;await fixture(async({hub,store})=>{const login=await hub.login('cline');assert.equal(login.userCode,'FIXTURE-CODE');assert.equal(hub.statuses().find(s=>s.id==='cline').login.url,'https://fixture.test/verify');
 await hub.logout('cline');resolve({access:JSON.stringify(credential)});await immediate();assert.equal(store.get().accounts.cline.credential,null);assert.ok(closed>=1);
 },{protocol:{startClineLoginFlow:async()=>({loginUrl:'https://fixture.test/verify',userCode:'FIXTURE-CODE',result:new Promise(r=>resolve=r),close:async()=>{closed++;}})}});
});
test('successful browser login saves only its own channel without claiming rewards',async()=>fixture(async({hub,store})=>{
 await hub.login('cline');await hub.sessions.get('cline')?.task;assert.equal(hub.state('cline').credential.access_token,credential.access_token);assert.equal(hub.state('qoder').credential,null);assert.equal(hub.state('cline').checkin,null);
 assert.ok(!JSON.stringify(hub.statuses()).includes(credential.access_token));
},{protocol:{startClineLoginFlow:async()=>({loginUrl:'https://fixture.test/verify',result:Promise.resolve({access:JSON.stringify(credential)}),close:async()=>{}})}}));
test('Cline models and OpenAI SSE chat work through actual extracted codec, no host',async()=>fixture(async({hub,store})=>{
 await store.patchAccount('cline',{credential,models:[{id:'fixture-model',name:'Fixture',source:'remote'}]});hub.adapter('cline').remoteModels=[{id:'fixture-model',name:'Fixture'}];
 const text=await completion(p('cline'),[{role:'system',content:'大肥鱼人格'},{role:'user',content:'你好'}],{accounts:hub});assert.equal(text,'你好，大肥鱼');assert.ok(hub.state('cline').testedAt);
},{fetchImpl:async(url,opts)=>{assert.match(String(url),/chat\/completions/);const b=JSON.parse(opts.body);assert.ok(JSON.stringify(b).includes('大肥鱼人格'));assert.deepEqual(b.tools,undefined);return sse([{choices:[{delta:{content:'你好，大肥鱼'}}]},{choices:[{delta:{},finish_reason:'stop'}]},'[DONE]']);}}));
test('MiniMax Anthropic messages and long text remain intact',async()=>fixture(async({hub,store})=>{
 const text='长回复'.repeat(3000);await store.patchAccount('minimax',{credential,models:[{id:'fixture-model',name:'Fixture',source:'remote'}]});hub.adapter('minimax').remoteModels=[{id:'fixture-model',name:'Fixture'}];
 assert.equal(await hub.chat(p('minimax'),[{role:'system',content:'蓝色女仆'},{role:'user',content:'你好'}]),text);
},{fetchImpl:async(url,opts)=>{assert.match(String(url),/messages/);assert.match(JSON.stringify(JSON.parse(opts.body).system),/蓝色女仆/);return sse([
 {type:'message_start',message:{}},{type:'content_block_start',index:0,content_block:{type:'text',text:''}},{type:'content_block_delta',index:0,delta:{type:'text_delta',text:'长回复'.repeat(3000)}},{type:'content_block_stop',index:0},{type:'message_delta',delta:{stop_reason:'end_turn'}},{type:'message_stop'}]);}}));
test('Qoder and Gemini label snapshot catalogs without pretending remote verification',async()=>fixture(async({hub,store})=>{
 for(const id of ['qoder','qodercn','gemini']){await store.patchAccount(id,{credential});const models=await hub.models(id);assert.ok(models.length>0);assert.ok(models.every(m=>m.source==='snapshot'));assert.equal(hub.state(id).testedAt,null);}
},{fetchImpl:async()=>{throw new Error('catalog must not require network');}}));
test('remote model failures do not replace last good catalog with a fallback',async()=>fixture(async({hub,store})=>{
 await store.patchAccount('cline',{credential,models:[{id:'old',source:'remote'}]});await assert.rejects(hub.models('cline'),/未返回/);assert.equal(hub.state('cline').models[0].id,'old');
},{protocol:{fetchClineRemoteModels:async()=>({entries:[],remoteIds:[]})}}));
test('already-sent inference cannot be reissued by an adapter retry or fallback',async()=>{
 let calls=0;const op={purpose:'chat',fetchImpl:async()=>{calls++;return sse([]);}};await channelOperation.run(op,async()=>{
 await protocolFetch('https://fixture.test/chat/completions',{method:'POST'});await assert.rejects(protocolFetch('https://fixture.test/chat/completions',{method:'POST'}),/不自动重复/);});assert.equal(calls,1);
});
test('stream errors never switch to another account and never expose credentials',async()=>fixture(async({hub,store})=>{
 await store.patchAccount('cline',{credential,models:[{id:'fixture-model',source:'remote'}]});hub.adapter('cline').remoteModels=[{id:'fixture-model'}];let backups=0;
 await assert.rejects(generate({providers:[p('cline'),{id:'backup',name:'备用',enabled:true,type:'compatible',apiKey:'fixture',baseUrl:'https://fixture.test',model:'fixture'}]},[],{accounts:hub,fetchImpl:async()=>{backups++;return json({});}}));assert.equal(backups,0);assert.ok(!JSON.stringify(hub.statuses()).includes(credential.access_token));
},{fetchImpl:async()=>sse([{error:{message:credential.access_token}}])}));
test('daily check-in is per-account, concurrent-safe, persisted, and crosses Shanghai day',async()=>{
 let now=Date.parse('2026-10-26T15:59:00Z'),claims=0;
 const protocol={fetchMinimaxSigninStatus:async()=>({active:true,todayCheckedIn:false}),claimMinimaxDailyCheckin:async()=>{await protocolFetch('https://fixture.test/signin/claim',{method:'POST',body:'{}'});return{kind:'claimed'};}};
 await fixture(async({hub,store,dir})=>{await store.patchAccount('minimax',{credential,autoCheckin:true});await Promise.all([hub.tick(),hub.tick()]);assert.equal(claims,1);assert.equal(hub.state('minimax').checkin.phase,'claimed');
 const loaded=await new LocalStore(dir).load();const h=new AccountHub({store:loaded,now:()=>now,protocol,fetchImpl:async()=>{claims++;return json({})}});try{await h.tick();assert.equal(claims,1);now+=120_000;await h.tick();assert.equal(claims,2);}finally{await h.stop();}
 },{now:()=>now,protocol,fetchImpl:async()=>{claims++;return json({})}});
});
test('check-in distinguishes status failure from uncertain submitted claim',async()=>{
 let now=Date.parse('2026-10-26T06:00:00Z'),status=0;
 await fixture(async({hub,store})=>{await store.patchAccount('minimax',{credential,autoCheckin:true});await hub.tick();assert.equal(hub.state('minimax').checkin.phase,'status-error');await hub.tick();assert.equal(status,1);now+=900_001;await hub.tick();assert.equal(hub.state('minimax').checkin.phase,'uncertain');await hub.tick();assert.equal(status,2);
 },{now:()=>now,protocol:{fetchMinimaxSigninStatus:async()=>{if(++status===1)throw new Error('network');return{active:true};},claimMinimaxDailyCheckin:async()=>{await protocolFetch('https://fixture.test/signin/claim',{method:'POST'});throw new Error('timeout');}},fetchImpl:async()=>{throw new Error('timeout');}});
});
test('HTTP account routes enforce same-origin auth and do not expose the old gateway',async()=>{
 const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-account-http-'));const app=await createApplication({dataDir:dir});app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));const base=`http://127.0.0.1:${app.server.address().port}`;
 try{const home=await fetch(base),cookie=home.headers.get('set-cookie').split(';')[0];const state=await(await fetch(base+'/api/state',{headers:{cookie}})).json();assert.equal(state.accounts.length,9);
 const r=await fetch(base+'/api/accounts/cline/models',{method:'POST',headers:{cookie,origin:base,'Content-Type':'application/json'},body:'{}'});assert.equal(r.status,400);assert.match((await r.json()).error,/先完成/);
 assert.equal((await fetch(base+'/v1/chat/completions')).status,404);assert.equal((await fetch(base+'/api/accounts/cline/login',{method:'POST',headers:{cookie,origin:'https://evil.test','Content-Type':'application/json'},body:'{}'})).status,403);
 }finally{await app.close();await fs.rm(dir,{recursive:true,force:true});}
});
test('generated subset has no DSH runtime imports and ships the Qoder codec',async()=>{
 const code=await fs.readFile(new URL('../server/vendor/channels.mjs',import.meta.url),'utf8');assert.doesNotMatch(code,/from\s+["']@deepseek-ai\//);assert.ok((await fs.stat(new URL('../server/vendor/qoder-auth-wasm.wasm',import.meta.url))).size>0);
});

test('an explicit 401 permits one credential-refresh replay but accepted replies are never replayed',async()=>{
 let calls=0;const op={purpose:'chat',fetchImpl:async()=>new Response('',{status:++calls===1?401:200})};
 await channelOperation.run(op,async()=>{await protocolFetch('https://fixture.test/chat/completions',{method:'POST'});await protocolFetch('https://fixture.test/chat/completions',{method:'POST'});await assert.rejects(protocolFetch('https://fixture.test/chat/completions',{method:'POST'}));});assert.equal(calls,2);
});
test('MiniMax device authorization uses the real PKCE request and displays a user code',async()=>fixture(async({hub})=>{
 const login=await hub.login('minimax');assert.equal(login.userCode,'FIXTURE-CODE');assert.equal(login.url,'https://fixture.test/verify');await hub.cancel('minimax');
},{fetchImpl:async(url,opts)=>{
 if(String(url).includes('/device/code')){const body=new URLSearchParams(opts.body);assert.ok(body.get('code_challenge'));return json({device_code:'fixture-device',user_code:'FIXTURE-CODE',verification_uri:'https://fixture.test/verify',expires_in:600,interval:1});}
 if(String(url).includes('/token'))return new Promise((_resolve,reject)=>{opts.signal.addEventListener('abort',()=>reject(new Error('cancelled')),{once:true});});
 throw new Error('unexpected path');
}}));
test('actual Cline device-code handshake preserves user code and is cancellable',async()=>fixture(async({hub})=>{
 const login=await hub.login('cline');assert.equal(login.userCode,'CLINE-CODE');assert.equal(login.url,'https://fixture.test/verify?code=CLINE-CODE');await hub.cancel('cline');
},{fetchImpl:async(url,opts)=>{
 if(String(url).endsWith('/authorize/device'))return json({device_code:'fixture-device',user_code:'CLINE-CODE',verification_uri:'https://fixture.test/verify',verification_uri_complete:'https://fixture.test/verify?code=CLINE-CODE',expires_in:600,interval:1});
 if(String(url).endsWith('/authenticate'))return new Promise((_resolve,reject)=>{opts.signal.addEventListener('abort',()=>reject(new Error('cancelled')),{once:true});});
 throw new Error('unexpected path');
}}));
