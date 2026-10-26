import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes,createCipheriv} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {LocalStore,defaults,mergeConfig} from '../server/store.mjs';
import {DailyBenefits,checkinDue} from '../server/benefits.mjs';
import {AccountHub} from '../server/accounts.mjs';
import {BENEFITS} from '../server/benefits-state.mjs';
import {shanghaiDay,TraeClient} from '../server/trae.mjs';
import {channelOperation,protocolFetch} from '../server/channel-transport.mjs';
import {unifiedModels} from '../server/model-catalog.mjs';
import {createApplication} from '../server/index.mjs';
import {DEFAULT_LANES,orderLanes} from '../../src/product/lane-fallback.js';
import * as sdk from '../server/vendor/channels.mjs';

const credential={access_token:'fixture-very-secret-token'};
const json=d=>new Response(JSON.stringify(d),{headers:{'Content-Type':'application/json'}});
const gate=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
async function fixture(fn,options={}) {
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-benefits-')),store=await new LocalStore(dir).load();
  let now=Date.parse('2026-10-26T15:59:00Z');
  const claims=[],balances=[];
  const clients={checkin:async(id='trae')=>{
    const s=id==='trae'?store.get().trae:store.get().accounts[id];
    if(!checkinDue(s.checkin,now))return s.checkin;
    claims.push(id);
    const receipt={day:shanghaiDay(now),at:new Date(now).toISOString(),phase:'claimed',credit:10,unit:id==='trae'?'credits':'积分',coversToday:true,message:'今日签到已完成'};
    await (id==='trae'?store.patchTrae({checkin:receipt}):store.patchAccount(id,{checkin:receipt}));return receipt;
  },balance:async(id='trae')=>{balances.push(id);return {total:100};}};
  const service=new DailyBenefits({store,accounts:clients,trae:clients,now:()=>now,...options});
  const login=async(id,patch={})=>id==='trae'?store.patchTrae({identity:{machineId:'a'.repeat(32),deviceId:'b'.repeat(32)},credential:{accessToken:'fixture-trae-secret',uid:'fixture-user'},...patch}):store.patchAccount(id,{credential,...patch});
  try {await fn({service,store,dir,clients,claims,balances,login,advance:ms=>now+=ms});}
  finally {service.stop();await service.task;await fs.rm(dir,{recursive:true,force:true});}
}

test('removed LobsterAI has no active metadata, protocol exports, catalog or legacy fallback',async()=>{
  assert.equal(BENEFITS.lobsterai,undefined);assert.equal(sdk.LobsteraiAuth,undefined);assert.equal(sdk.claimLobsteraiDailyCheckin,undefined);
  assert.ok(DEFAULT_LANES.every(l=>l.provider!=='lobsterai'));
  assert.deepEqual(orderLanes([{provider:'lobsterai',model:'auto'},{provider:'trae',model:'auto'}]).map(l=>l.provider),['trae']);
  const d=defaults();d.accounts.lobsterai={credential,enabled:true,models:[{id:'removed-only'}]};assert.ok(!JSON.stringify(unifiedModels(d)).includes('removed-only'));
  assert.throws(()=>mergeConfig({providers:[{id:'old',name:'old',type:'account',channelId:'lobsterai',model:'removed-only'}]},defaults()),/未知/);
});
test('old encrypted LobsterAI profile migrates without losing TRAE or other accounts',async()=>fixture(async({store,dir,login})=>{
  await login('trae',{autoCheckin:true});await login('cline');
  const old=store.get();old.accounts.lobsterai={credential,autoCheckin:true};old.providers=[{id:'old-lobster',name:'old',type:'account',channelId:'lobsterai',model:'removed-only'}];old.activeProviderId='old-lobster';
  const key=await fs.readFile(join(dir,'local.key')),iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv),body=Buffer.concat([c.update(JSON.stringify(old)),c.final()]);
  await fs.writeFile(join(dir,'state.enc'),Buffer.concat([iv,c.getAuthTag(),body]));
  const loaded=await new LocalStore(dir).load();assert.equal(loaded.get().accounts.lobsterai,undefined);assert.deepEqual(loaded.get().providers,[]);assert.equal(loaded.get().activeProviderId,'');
  assert.equal(loaded.get().trae.autoCheckin,true);assert.equal(loaded.get().trae.credential.accessToken,'fixture-trae-secret');assert.equal(loaded.get().accounts.cline.credential.access_token,credential.access_token);
}));
test('batch check-in reserves one job across concurrent clicks and skips non-daily POSTs',async()=>fixture(async({service,login,clients,claims})=>{
  for(const id of ['trae','codearts','zcode','raccoon','cline','gemini'])await login(id);
  const blocked=gate(),original=clients.checkin;clients.checkin=async id=>{await blocked.promise;return original(id);};
  const a=service.launch(),b=service.launch();assert.equal(a.job.id,b.job.id);blocked.resolve();await service.task;
  assert.deepEqual(claims,['trae','codearts']);assert.equal(service.status().job.running,false);
  assert.deepEqual(service.status().job.rows.slice(2).map(r=>r.phase),['manual','none','automatic','none']);
}));
test('automatic scheduling respects global, per-account and enabled flags, manual ignores only auto flag',async()=>fixture(async({service,store,login,claims})=>{
  await login('trae',{autoCheckin:true});await login('codearts',{autoCheckin:false});await login('loomy',{autoCheckin:true,enabled:false});
  await store.update({benefits:{enabled:false}});await service.tick();assert.deepEqual(claims,[]);
  await store.update({benefits:{enabled:true}});await service.tick();assert.deepEqual(claims,['trae']);
  service.launch();await service.task;assert.deepEqual(claims,['trae','codearts']);
}));
test('daily receipts survive restart and cross Shanghai midnight without claiming twice',async()=>fixture(async({service,store,dir,login,claims,advance,clients})=>{
  await login('trae',{autoCheckin:true});await service.tick();await service.tick();assert.equal(claims.length,1);
  const loaded=await new LocalStore(dir).load();const restart=new DailyBenefits({store:loaded,accounts:clients,trae:clients});assert.equal(restart.status().job.rows[0].phase,'claimed');assert.equal(restart.status().job.running,false);restart.stop();
  advance(120_000);await service.tick();assert.equal(claims.length,2);assert.equal(service.status().job.day,'2026-10-27');
  assert.ok(!(await fs.readFile(join(dir,'state.enc'))).includes('fixture-trae-secret'));
}));
test('pre-claim failures do not stop other channels and balance failure preserves claim receipt',async()=>fixture(async({service,clients,store,login})=>{
  await login('trae');await login('codearts');const original=clients.checkin;
  clients.checkin=async id=>{if(id==='trae'){await store.patchTrae({checkin:{day:'2026-10-26',phase:'status-error'}});throw new Error('fixture-secret-upstream');}return original(id);};
  clients.balance=async()=>{throw new Error('balance');};service.launch();await service.task;
  const rows=service.status().job.rows;assert.equal(rows[0].phase,'status-error');assert.equal(rows[1].phase,'claimed');assert.equal(rows[1].balancePhase,'error');
  assert.ok(!JSON.stringify(service.status()).includes('fixture-secret-upstream'));assert.equal(store.get().accounts.codearts.checkin.phase,'claimed');
}));
test('stop remaining waits for current claim and never submits the next channel',async()=>fixture(async({service,login,clients,claims})=>{
  await login('trae');await login('codearts');const blocked=gate(),entered=gate(),original=clients.checkin;
  clients.checkin=async id=>{entered.resolve();await blocked.promise;return original(id);};
  service.launch();await entered.promise;service.stopRemaining();blocked.resolve();await service.task;
  assert.deepEqual(claims,['trae']);assert.deepEqual(service.status().job.rows.map(r=>r.phase),['claimed','cancelled']);
}));
test('disabling global automatic switch or next account during a run takes effect before next claim',async()=>fixture(async({service,store,login,clients,claims})=>{
  await login('trae',{autoCheckin:true});await login('codearts',{autoCheckin:true});const blocked=gate(),entered=gate(),original=clients.checkin;
  clients.checkin=async id=>{entered.resolve();await blocked.promise;return original(id);};
  const task=service.tick();await entered.promise;await store.update({benefits:{enabled:false}});blocked.resolve();await task;
  assert.deepEqual(claims,['trae']);assert.equal(service.status().job.rows[1].phase,'cancelled');
}));
test('persisted interrupted jobs do not show running or permit uncertain same-day resubmission',async()=>fixture(async({service,store,login,claims})=>{
  await login('trae',{autoCheckin:true,checkin:{day:'2026-10-26',phase:'claiming',message:'submitted'}});
  await store.patchBenefits({lastJob:{id:'interrupted',running:true,rows:[{id:'trae',phase:'running'}]}});
  assert.equal(service.status().job.running,false);assert.equal(service.status().job.rows[0].phase,'interrupted');await service.tick();assert.equal(claims.length,0);
}));
test('persisted results cannot be injected through config and different vendors are never summed',async()=>fixture(async({service,store,login})=>{
  await login('trae');await login('codearts');service.launch();await service.task;const id=service.status().job.id;
  await store.update({benefits:{enabled:false,lastJob:{id:'forged'}}});assert.equal(store.get().benefits.lastJob.id,id);
  assert.deepEqual(service.status().totals,{trae:{credit:10,unit:'credits'},codearts:{credit:10,unit:'积分'}});
  service.launch();await service.task;assert.deepEqual(service.status().totals,{});assert.ok(service.status().job.rows.every(r=>r.cached));
}));
test('startup delay, repeating interval and shutdown are real timers, not startup-only checks',async()=>fixture(async({service,login,claims,advance})=>{
  await login('trae',{autoCheckin:true});service.start();assert.equal(claims.length,0);
  await delay(35);assert.equal(claims.length,0);
  await delay(160);await service.task;assert.equal(claims.length,1);
  advance(120_000);await delay(100);await service.task;assert.equal(claims.length,2);
  service.stop();advance(86_400_000);await delay(100);assert.equal(claims.length,2);
},{startupDelayMs:100,intervalMs:50}));
test('Qoder prior-period reward does not mark today complete and retries only after backoff',async()=>fixture(async({store})=>{
  let now=Date.parse('2026-10-26T01:00:00Z'),calls=0;
  const hub=new AccountHub({store,now:()=>now,protocol:{claimQoderDailyCheckin:async()=>({kind:++calls===1?'claimed':'already-claimed',credit:20,coversToday:calls!==1})}});
  try {await store.patchAccount('qoder',{credential,autoCheckin:true});const receipt=await hub.checkin('qoder');assert.equal(receipt.phase,'previous-period');assert.equal(receipt.coversToday,false);assert.equal(receipt.credit,20);
    await hub.tick();assert.equal(calls,1);now+=900_001;await hub.tick();assert.equal(calls,2);assert.equal(hub.state('qoder').checkin.phase,'already-claimed');
  } finally {await hub.stop();}
}));
test('native account tick never claims disabled accounts and persists intent before claim POST',async()=>fixture(async({store})=>{
  let sent=0;const hub=new AccountHub({store,protocol:{claimCodeArtsDailyCheckin:async()=>{await protocolFetch('https://fixture.test/claim',{method:'POST'});return {kind:'claimed',credit:8};}},fetchImpl:async()=>{sent++;assert.equal(store.get().accounts.codearts.checkin.phase,'claiming');return json({});}});
  try {await store.patchAccount('codearts',{credential,autoCheckin:true,enabled:false});await hub.tick();assert.equal(sent,0);await store.patchAccount('codearts',{enabled:true});await hub.tick();assert.equal(sent,1);assert.equal(hub.state('codearts').checkin.credit,8);}
  finally {await hub.stop();}
}));
test('Qoder native codec reports a prior refresh window instead of pretending today was covered',async()=>{
  const outcome=await channelOperation.run({purpose:'checkin',fetchImpl:async url=>String(url).endsWith('/claim')?json({status:'CLAIMED',benefit:{amount:25}}):json({campaigns:[{campaignId:'fixture',actionType:'CLAIM_BENEFIT',claimStatus:'CLAIMABLE'}]})},()=>sdk.claimQoderDailyCheckin(credential,sdk.QODER,protocolFetch,Date.parse('2026-10-26T16:01:00Z')));
  assert.equal(outcome.kind,'claimed');assert.equal(outcome.credit,25);assert.equal(outcome.coversToday,false);
});
test('HTTP batch jobs are asynchronous, same-origin authenticated, and removed channel calls are rejected',async()=>{
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-benefits-http-')),app=await createApplication({dataDir:dir});app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));const base=`http://127.0.0.1:${app.server.address().port}`;
  try {
    const home=await fetch(base),cookie=home.headers.get('set-cookie').split(';')[0],headers={cookie,origin:base,'Content-Type':'application/json'};
    const response=await fetch(base+'/api/benefits/run',{method:'POST',headers,body:'{}'});assert.equal(response.status,202);await app.benefits.task;
    const state=await(await fetch(base+'/api/state',{headers:{cookie}})).json();assert.equal(state.benefits.job.running,false);assert.equal(state.benefits.job.rows.length,0);assert.equal(state.accounts.length,9);
    for(const action of ['login','models','checkin','balance','logout'])assert.equal((await fetch(`${base}/api/accounts/lobsterai/${action}`,{method:'POST',headers,body:'{}'})).status,400);
    assert.equal((await fetch(base+'/api/benefits/run',{method:'POST',headers:{...headers,origin:'https://evil.test'},body:'{}'})).status,403);
  } finally {await app.close();await fs.rm(dir,{recursive:true,force:true});}
});

test('a next account disabled while a manual batch runs is skipped before submission',async()=>fixture(async({service,store,login,clients,claims})=>{
  await login('trae');await login('codearts');const blocked=gate(),entered=gate(),original=clients.checkin;
  clients.checkin=async id=>{entered.resolve();await blocked.promise;return original(id);};
  service.launch();await entered.promise;await store.patchAccount('codearts',{enabled:false});blocked.resolve();await service.task;
  assert.deepEqual(claims,['trae']);assert.equal(service.status().job.rows[1].phase,'skipped');
}));
test('native TRAE periodic helper also respects disabled account',async()=>fixture(async({store,login})=>{
  await login('trae',{enabled:false,autoCheckin:true});let requests=0;
  const client=new TraeClient({store,fetchImpl:async()=>{requests++;throw new Error('disabled account must not send');}});
  try {await client.tick();assert.equal(requests,0);}finally{client.stop();}
}));
