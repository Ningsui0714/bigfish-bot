import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApiClient} from '../ui/api.mjs';
import {createApplication} from '../server/index.mjs';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
const home=()=>new Response('<!doctype html><title>BigFish</title>',{headers:{'Content-Type':'text/html; charset=utf-8'}});

test('local API submits JSON once and keeps original response contract',async()=>{
  const calls=[];const api=createApiClient(async(path,options)=>{calls.push({path,options});return json({ok:true});});
  assert.deepEqual(await api('napcat/start',{}),{ok:true});assert.equal(calls.length,1);assert.equal(calls[0].path,'/api/napcat/start');
  assert.equal(calls[0].options.method,'POST');assert.equal(calls[0].options.body,'{}');assert.equal(calls[0].options.credentials,'same-origin');
});
test('expired local session renews from home and replays only the rejected POST once',async()=>{
  const calls=[];const api=createApiClient(async(path,options)=>{calls.push({path,options});return path==='/'?home():calls.length===1?json({error:'expired'},401):json({ok:true});});
  assert.deepEqual(await api('napcat/start',{test:1}),{ok:true});assert.deepEqual(calls.map(c=>c.path),['/api/napcat/start','/','/api/napcat/start']);
  assert.deepEqual(calls[0].options,calls[2].options);assert.equal(calls[1].options.cache,'no-store');assert.equal(calls[1].options.redirect,'error');
});
test('concurrent polling and clicks share one session renewal instead of a retry storm',async()=>{
  let renewed=false,homes=0;const api=createApiClient(async path=>{
    if(path==='/'){homes++;await new Promise(r=>setTimeout(r,5));renewed=true;return home();}
    return renewed?json({ok:true}):json({error:'expired'},401);
  });
  const results=await Promise.all(Array.from({length:8},()=>api('state')));assert.ok(results.every(r=>r.ok));assert.equal(homes,1);
});
test('ordinary server errors are not retried or turned into a local session renewal',async()=>{
  for(const status of [400,403,409,429,500]){let calls=0;const api=createApiClient(async()=>{calls++;return json({error:'fixture-error'},status);});await assert.rejects(api('napcat/start',{}),/fixture-error/);assert.equal(calls,1);}
});
test('network timeout never replays a possibly accepted action',async()=>{
  let calls=0;const api=createApiClient(async()=>{calls++;throw new Error('network-timeout');});
  await assert.rejects(api('napcat/start',{}),/network-timeout/);assert.equal(calls,1);
});
test('session renewal failure and repeated 401 stop with actionable errors',async()=>{
  for(const failedHome of [true,false]){let calls=0;const api=createApiClient(async path=>{calls++;return path==='/'?(failedHome?json({error:'not-html'}):home()):json({error:'expired'},401);});
    await assert.rejects(api('napcat/start',{}),/刷新页面/);assert.equal(calls,failedHome?2:3);
  }
});
test('actual local HTTP: stale cookie recovers and missing Docker is surfaced without downloading or duplicate starts',async()=>{
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-session-'));let commands=0;
  const app=await createApplication({dataDir:dir,napcatRun:async()=>{commands++;throw Object.assign(new Error('fixture missing'),{code:'ENOENT'});}});
  app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));const origin=`http://127.0.0.1:${app.server.address().port}`;
  let cookie='bigfish_session=expired';
  const api=createApiClient(async(path,options)=>{
    const response=await fetch(origin+path,{...options,headers:{...options.headers,Cookie:cookie,...(options.method?{Origin:origin}:{})}});
    if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return response;
  });
  try {await app.store.update({qq:{napcat:{deployment:'managed'}}});await api('napcat/start',{});await app.napcat.task;const state=await api('state');
    assert.equal(commands,1);assert.equal(state.napcat.phase,'runtime-required');assert.equal(state.napcat.runtime,'missing');assert.match(state.napcat.runtimeMessage,/尚未安装 Docker/);assert.equal(state.napcat.qrImage,null);
  }finally{await app.close();await fs.rm(dir,{recursive:true,force:true});}
});
