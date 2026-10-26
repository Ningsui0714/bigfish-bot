import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { QqBinding } from '../server/qq-binding.mjs';
import { createApplication } from '../server/index.mjs';
const url = 'https://q.qq.com/qqbot/openclaw/connect.html?fixture=1';
const credentials = [{ appId: '123456', appSecret: 'fixture-qq-secret' }];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) { for (let i=0;i<100;i++) { if(fn())return;await delay(5); }assert.fail('fixture timed out'); }
function fixture(options = {}) {
  const sessions = [], saved = [];
  const binding = new QqBinding({ onCredentials: async c => { saved.push(c); }, start: (callbacks, opts) => { const s={callbacks,opts,stopped:false};sessions.push(s);return()=>{s.stopped=true;}; }, ...options });
  return { binding, sessions, saved };
}
test('official QR connector yields a local PNG, persists only credentials, and never exposes the secret', async () => {
  const {binding,sessions,saved}=fixture();
  try {
    assert.equal(binding.begin().phase,'preparing');binding.begin();assert.equal(sessions.length,1);
    assert.equal(sessions[0].opts.displayQrCodeToConsole,false);assert.equal(sessions[0].opts.source,'');
    sessions[0].callbacks.onQrDisplayed(url);await until(()=>binding.status().phase==='waiting');
    assert.match(binding.status().qrImage,/^data:image\/png;base64,/);
    assert.ok(!JSON.stringify(binding.status()).includes('fixture=1'));
    sessions[0].callbacks.onSuccess(credentials);sessions[0].callbacks.onSuccess(credentials);
    await binding.task;assert.equal(saved.length,1);assert.equal(binding.status().phase,'bound');
    assert.equal(binding.status().appId,'123456');assert.ok(!JSON.stringify(binding.status()).includes('fixture-qq-secret'));
    assert.equal(sessions[0].stopped,true);
  } finally { await binding.close(); }
});
test('cancel and new QR sessions ignore old success, failure and image callbacks', async () => {
  let finishImage;
  const {binding,sessions,saved}=fixture({renderQr:()=>new Promise(resolve=>{finishImage=resolve;})});
  try {
    binding.begin();sessions[0].callbacks.onQrDisplayed(url);binding.cancel();binding.begin();
    finishImage('old-image');sessions[0].callbacks.onSuccess(credentials);sessions[0].callbacks.onFailure(new Error('old failure'));
    await delay(0);assert.equal(saved.length,0);assert.equal(binding.status().phase,'preparing');assert.equal(binding.status().qrImage,undefined);
    assert.equal(sessions[0].opts.signal.aborted,true);
    sessions[1].callbacks.onFailure(new Error('sensitive-token'));
    assert.equal(binding.status().phase,'error');assert.ok(!JSON.stringify(binding.status()).includes('sensitive-token'));
  } finally { await binding.close(); }
});
test('QR refresh clears old image; expired session stops polling and can start again', async () => {
  const {binding,sessions}=fixture({ttlMs:35,renderQr:async()=> 'data:image/png;base64,fixture'});
  try {
    binding.begin();sessions[0].callbacks.onQrDisplayed(url);await until(()=>binding.status().phase==='waiting');
    sessions[0].callbacks.onQrExpired();assert.equal(binding.status().phase,'refreshing');assert.equal(binding.status().qrImage,undefined);
    await until(()=>binding.status().phase==='expired');assert.equal(sessions[0].stopped,true);
    binding.begin();assert.equal(sessions.length,2);
  } finally { await binding.close(); }
});
test('QR refuses unexpected hosts and malformed credential arrays', async () => {
  const {binding,sessions,saved}=fixture();
  try {
    binding.begin();sessions[0].callbacks.onQrDisplayed('https://evil.test/qr');assert.equal(binding.status().phase,'error');
    binding.begin();sessions[1].callbacks.onSuccess([]);assert.equal(binding.status().phase,'error');
    binding.begin();sessions[2].callbacks.onSuccess([{appId:'x',appSecret:'x'}]);assert.equal(binding.status().phase,'error');
    assert.equal(saved.length,0);
  } finally { await binding.close(); }
});
test('credential commit is single-flight and cancellation waits for atomic save', async () => {
  let finish;const {binding,sessions}=fixture({onCredentials:()=>new Promise(resolve=>{finish=resolve;})});
  binding.begin();sessions[0].callbacks.onSuccess(credentials);await until(()=>!!finish);
  assert.equal(binding.cancel().phase,'saving');assert.throws(()=>binding.begin(),/正在保存/);
  finish();await binding.task;assert.equal(binding.status().phase,'bound');await binding.close();
});
test('QR synchronous SDK failures and save failures remain actionable without exposing secrets', async () => {
  const binding=new QqBinding({start:()=>{throw new Error('secret');},onCredentials:async()=>{}});
  assert.equal(binding.begin().phase,'error');assert.ok(!JSON.stringify(binding.status()).includes('secret'));await binding.close();
  const f=fixture({onCredentials:async()=>{throw new Error('fixture-qq-secret');}});
  f.binding.begin();f.sessions[0].callbacks.onSuccess(credentials);await f.binding.task;
  assert.equal(f.binding.status().phase,'error');assert.ok(!JSON.stringify(f.binding.status()).includes('fixture-qq-secret'));await f.binding.close();
});
test('HTTP QR binding is authenticated, revisioned, cancels on config save, and automatically connects saved official credentials', async () => {
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-qr-http-'));const sessions=[], bots=[];
  const app=await createApplication({dataDir:dir,qrStart:(callbacks,opts)=>{sessions.push({callbacks,opts});return()=>{};},officialBotFactory:options=>{
    const handlers={};let finish;const bot={options,on:(key,fn)=>{handlers[key]=fn;},start:()=>new Promise(resolve=>{finish=resolve;handlers.ready?.();}),stop:()=>finish?.()};bots.push(bot);return bot;
  }});
  app.server.listen(0,'127.0.0.1');await new Promise(resolve=>app.server.once('listening',resolve));const origin=`http://127.0.0.1:${app.server.address().port}`;
  try {
    const home=await fetch(origin),cookie=home.headers.get('set-cookie').split(';')[0];const headers={Cookie:cookie,Origin:origin,'Content-Type':'application/json'};
    const post=(path,data={})=>fetch(origin+'/api/'+path,{method:'POST',headers,body:JSON.stringify(data)});
    const save=(revision,config)=>fetch(origin+'/api/config',{method:'PUT',headers,body:JSON.stringify({revision,config})});
    assert.equal((await fetch(origin+'/api/qq/login',{method:'POST',body:'{}'})).status,401);
    assert.equal((await post('qq/login')).status,400);
    await save(0,{qq:{mode:'official'}});assert.equal((await post('qq/login')).status,200);
    // An explicit later edit wins over a stale scan result.
    await save(1,{qq:{mode:'napcat'}});sessions[0].callbacks.onSuccess(credentials);await delay(0);assert.equal(app.store.get().qq.official.appId,'');
    await save(2,{qq:{mode:'official'}});await post('qq/login');sessions[1].callbacks.onSuccess(credentials);await app.qqBinding.task;
    assert.equal(app.store.get().qq.official.appSecret,'fixture-qq-secret');assert.equal(app.store.get().qq.official.transport,'websocket');
    assert.equal(app.qq.status.state,'connected');assert.equal(bots[0].options.appId,'123456');assert.equal(bots[0].options.transport,'websocket');
    const state=await(await fetch(origin+'/api/state',{headers:{Cookie:cookie}})).json();assert.equal(state.revision,4);assert.equal(state.qqBinding.phase,'bound');
    assert.equal(state.config.qq.official.hasSecret,true);assert.ok(!JSON.stringify(state).includes('fixture-qq-secret'));
    assert.equal((await save(3,{qq:{mode:'napcat'}})).status,409);
  } finally { await app.close();await fs.rm(dir,{recursive:true,force:true}); }
});
