import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {WebSocketServer} from 'ws';
import {NapcatManager,managedCompose,NAPCAT_IMAGE} from '../server/napcat.mjs';
import {LocalStore,defaults,mergeConfig} from '../server/store.mjs';
import {createApplication} from '../server/index.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<150;i++){if(fn())return;await wait(5);}assert.fail('fixture timed out');}
async function fixture(options={}){
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-napcat-')),store=await new LocalStore(dir).load();
  await store.update({qq:{token:'fixture-onebot-token',napcat:{deployment:'managed',webuiToken:'fixture-webui-token'}}});
  let ready=0,prepared=0;const calls=[];
  const manager=new NapcatManager({store,dataDir:dir,pollMs:15,startupDelayMs:5,
    onPrepare:async()=>{prepared++;return store.get().qq;},onReady:async()=>{ready++;},
    run:async(cmd,args)=>{calls.push({cmd,args});return{stdout:'fixture'};},fetchImpl:async url=>new Response(JSON.stringify({code:0,data:url.endsWith('/auth/login')?{Credential:'fixture-credential'}:{isLogin:false,qrcodeurl:'https://txz.qq.com/p?k=fixture'}})),...options});
  return {dir,store,manager,calls,get ready(){return ready;},get prepared(){return prepared;},close:async()=>{await manager.close();await fs.rm(dir,{recursive:true,force:true});}};
}
test('NapCat settings migrate, encrypt WebUI token separately, and drop it when the endpoint changes',async()=>{
  const old=mergeConfig({qq:{url:'ws://127.0.0.1:3001'}},defaults());assert.equal(old.qq.napcat.webPort,6099);
  const f=await fixture();try{
    assert.equal(f.store.publicConfig().qq.napcat.hasToken,true);assert.ok(!JSON.stringify(f.store.publicConfig()).includes('fixture-webui-token'));
    assert.equal(mergeConfig({qq:{napcat:{webuiUrl:'https://example.test'}}},f.store.get()).qq.napcat.webuiToken,'');
    assert.equal(mergeConfig({qq:{napcat:{webuiToken:''}}},f.store.get()).qq.napcat.webuiToken,'fixture-webui-token');
    assert.throws(()=>mergeConfig({qq:{napcat:{webPort:3001,wsPort:3001}}},defaults()),/不同/);
    assert.throws(()=>mergeConfig({qq:{napcat:{webuiUrl:'http://example.test'}}},defaults()),/HTTPS/);
    assert.equal((await new LocalStore(f.dir).load()).get().qq.napcat.webuiToken,'fixture-webui-token');
  }finally{await f.close();}
});
test('managed NapCat has deterministic ownership, persistent profiles, and loopback-only published ports',()=>{
  const c=managedCompose('/tmp/bigfish-fixture',defaults().qq),service=c.services.napcat;
  assert.equal(service.image,NAPCAT_IMAGE);assert.deepEqual(service.ports,['127.0.0.1:6099:6099','127.0.0.1:3001:3001']);
  assert.equal(service.privileged,undefined);assert.equal(service.network_mode,undefined);assert.ok(!JSON.stringify(c).includes('docker.sock'));
  assert.equal(c.name,managedCompose('/tmp/bigfish-fixture',defaults().qq).name);assert.notEqual(c.name,managedCompose('/tmp/another-fixture',defaults().qq).name);
  assert.equal(service.volumes.length,3);
});
test('missing Docker is an explicit prerequisite, not an endless OneBot retry or a fake QR',async()=>{
  const f=await fixture({run:async()=>{throw Object.assign(new Error('not found'),{code:'ENOENT'});}});
  try{f.manager.startManaged();await f.manager.task;assert.equal(f.manager.status().runtime,'missing');assert.equal(f.manager.status().phase,'runtime-required');assert.equal(f.prepared,0);assert.equal(f.manager.status().qrImage,null);}finally{await f.close();}
});
test('managed start pulls upstream image, writes private configuration and keeps existing QQ profile/settings',async()=>{
  const f=await fixture();try{
    f.manager.startManaged();await f.manager.task;assert.equal(f.manager.status().phase,'waiting-qr');assert.match(f.manager.status().qrImage,/^data:image\/png;base64,/);
    assert.equal(f.prepared,1);assert.ok(f.calls.some(c=>c.args.includes('pull')));assert.ok(f.calls.some(c=>c.args.includes('up')));
    const configPath=join(f.dir,'napcat/config/webui.json');const config=JSON.parse(await fs.readFile(configPath));assert.equal(config.token,'fixture-webui-token');
    if(process.platform!=='win32')assert.equal((await fs.stat(configPath)).mode&0o777,0o600);
    const ob=JSON.parse(await fs.readFile(join(f.dir,'napcat/config/onebot11.json')));assert.equal(ob.network.websocketServers[0].token,'fixture-onebot-token');assert.equal(ob.network.websocketServers[0].messagePostFormat,'array');
    await fs.writeFile(configPath,JSON.stringify({...config,theme:'user-choice'}));await fs.writeFile(join(f.dir,'napcat/qq/profile-fixture'),'keep');
    f.manager.cancel();f.manager.startManaged();await f.manager.task;
    assert.equal(JSON.parse(await fs.readFile(configPath)).theme,'user-choice');assert.equal(await fs.readFile(join(f.dir,'napcat/qq/profile-fixture'),'utf8'),'keep');
    assert.ok(!JSON.stringify(f.manager.status()).includes('fixture-webui-token'));
  }finally{await f.close();}
});
test('WebUI auth uses SHA256(token + .napcat); core initialization is not misreported as logged in',async()=>{
  let loginBody,ready=false;
  const f=await fixture({fetchImpl:async(url,options)=>{if(url.endsWith('/auth/login')){loginBody=JSON.parse(options.body);return new Response(JSON.stringify({code:0,data:{Credential:'signed-fixture'}}));}assert.equal(options.headers.Authorization,'Bearer signed-fixture');return new Response(JSON.stringify({code:0,data:ready?{isLogin:true,coreReady:true}:{isLogin:false,qrLoginAccepted:true,loginPhase:'initializing',qrcodeurl:'https://txz.qq.com/p?k=fixture'}}));}});
  try{f.manager.openLogin();await f.manager.task;assert.equal(loginBody.hash,createHash('sha256').update('fixture-webui-token.napcat').digest('hex'));assert.equal(f.manager.status().phase,'initializing');assert.equal(f.ready,0);assert.equal(f.manager.status().qrImage,null);ready=true;await until(()=>f.ready===1);await wait(40);assert.equal(f.ready,1);assert.equal(f.manager.status().phase,'online');}finally{await f.close();}
});
test('NapCat two-factor challenge is surfaced without storing or bypassing it',async()=>{
  let submitted;
  const f=await fixture({fetchImpl:async(url,o)=>{if(url.endsWith('/auth/login')){submitted=JSON.parse(o.body);return new Response(JSON.stringify({code:0,data:submitted.totpCode?{Credential:'fixture'}:{require2FA:true}}));}return new Response(JSON.stringify({code:0,data:{isLogin:true}}));}});
  try{f.manager.openLogin();await f.manager.task;assert.equal(f.manager.status().phase,'two-factor');assert.equal(f.ready,0);f.manager.openLogin('123456');await f.manager.task;assert.equal(submitted.totpCode,'123456');assert.equal(f.ready,1);assert.ok(!JSON.stringify(f.manager.status()).includes('123456'));}finally{await f.close();}
});
test('late NapCat login response after cancellation cannot reconnect or replace a new session',async()=>{
  let finish;const f=await fixture({fetchImpl:async()=>new Promise(resolve=>{finish=()=>resolve(new Response(JSON.stringify({code:0,data:{Credential:'old-secret'}})));})});
  try{f.manager.openLogin();const pending=f.manager.task;await until(()=>!!finish);f.manager.cancel();finish();await pending;assert.equal(f.manager.status().phase,'idle');assert.equal(f.ready,0);assert.equal(f.manager.status().qrImage,null);}finally{await f.close();}
});
test('local OneBot auto-configuration preserves other NapCat transports and JSON-string API contract',async()=>{
  let saved;
  const f=await fixture({fetchImpl:async(url,o)=>{let data={};if(url.endsWith('/auth/login'))data={Credential:'fixture'};else if(url.endsWith('/CheckLoginStatus'))data={isLogin:true};else if(url.endsWith('/GetConfig'))data={network:{httpClients:[{name:'keep'}],websocketClients:[{url:'ws://fixture'}],websocketServers:[{name:'other',port:3999,enable:true}]},other:'keep'};else if(url.endsWith('/SetConfig'))saved=JSON.parse(JSON.parse(o.body).config);return new Response(JSON.stringify({code:0,data}));}});
  try{f.manager.openLogin();await f.manager.task;await f.manager.configureLocalChannel();assert.equal(saved.other,'keep');assert.equal(saved.network.httpClients[0].name,'keep');assert.equal(saved.network.websocketServers.length,2);const s=saved.network.websocketServers.find(s=>s.name==='bigfish');assert.equal(s.token,'fixture-onebot-token');assert.equal(s.messagePostFormat,'array');assert.equal(s.port,3001);}finally{await f.close();}
});
test('stop touches only an owned compose instance and preserves QQ data',async()=>{
  const f=await fixture();try{f.manager.startManaged();await f.manager.task;await fs.writeFile(join(f.dir,'napcat/qq/profile'),'keep');await f.manager.stopManaged();assert.ok(f.calls.some(c=>c.args.at(-1)==='stop'));assert.equal(await fs.readFile(join(f.dir,'napcat/qq/profile'),'utf8'),'keep');const path=join(f.dir,'napcat/compose.json');const c=JSON.parse(await fs.readFile(path));c.name='someone-else';await fs.writeFile(path,JSON.stringify(c));const calls=f.calls.length;await assert.rejects(f.manager.stopManaged(),/归属/);assert.equal(f.calls.length,calls);}finally{await f.close();}
});
test('real local HTTP WebUI + OneBot fixture: authenticated login automatically connects and delivers chat',async()=>{
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-napcat-e2e-'));let delivered,socket;
  const arrived=new Promise(r=>{delivered=r;});const ws=new WebSocketServer({host:'127.0.0.1',port:0});await new Promise(r=>ws.once('listening',r));
  ws.on('connection',(client,req)=>{socket=client;assert.equal(req.headers.authorization,'Bearer fixture-onebot');client.on('message',raw=>{const m=JSON.parse(raw);client.send(JSON.stringify({status:'ok',retcode:0,echo:m.echo,data:m.action==='get_login_info'?{user_id:789,nickname:'fixture'}:{message_id:1}}));if(m.action==='send_group_msg')delivered(m.params);});});
  const web=http.createServer(async(req,res)=>{const chunks=[];for await(const c of req)chunks.push(c);const body=JSON.parse(Buffer.concat(chunks));if(req.url==='/api/auth/login')assert.equal(body.hash,createHash('sha256').update('fixture-webui.napcat').digest('hex'));else assert.equal(req.headers.authorization,'Bearer web-credential');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({code:0,data:req.url==='/api/auth/login'?{Credential:'web-credential'}:{isLogin:true,coreReady:true}}));});
  web.listen(0,'127.0.0.1');await new Promise(r=>web.once('listening',r));const app=await createApplication({dataDir:dir,model:async()=>({text:'肥鱼已接入',providerId:'fixture'})});
  app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));const origin=`http://127.0.0.1:${app.server.address().port}`;
  try{
    await app.store.update({qq:{url:`ws://127.0.0.1:${ws.address().port}`,token:'fixture-onebot',allowedGroupIds:['123'],napcat:{deployment:'external',webuiUrl:`http://127.0.0.1:${web.address().port}`,webuiToken:'fixture-webui'}}});app.agent.reset();
    assert.equal((await fetch(origin+'/api/napcat/login',{method:'POST',body:'{}'})).status,401);
    const home=await fetch(origin),cookie=home.headers.get('set-cookie').split(';')[0];
    const login=await fetch(origin+'/api/napcat/login',{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:'{}'});assert.equal(login.status,200);
    await until(()=>app.qq.status.state==='connected');assert.equal(app.napcat.status().phase,'online');
    socket.send(JSON.stringify({post_type:'message',message_type:'group',group_id:123,user_id:456,self_id:789,message_id:42,message:[{type:'at',data:{qq:'789'}},{type:'text',data:{text:'你好'}}]}));
    const params=await Promise.race([arrived,wait(1000).then(()=>{throw new Error('fixture delivery timed out');})]);assert.equal(params.message[0].data.text,'肥鱼已接入');
  }finally{await app.close();web.closeAllConnections();await new Promise(r=>web.close(r));for(const client of ws.clients)client.terminate();await new Promise(r=>ws.close(r));await fs.rm(dir,{recursive:true,force:true});}
});

test('native QQ online configures a loopback OneBot transport before connecting, without recursive callbacks',async()=>{
  let written,connected=0;
  const f=await fixture({onReady:async()=>{connected++;assert.ok(written);},fetchImpl:async(url,opts)=>{
    const data=url.endsWith('/auth/login')?{Credential:'fixture'}:url.endsWith('/CheckLoginStatus')?{isLogin:true,coreReady:true}:url.endsWith('/GetConfig')?{network:{websocketServers:[],httpServers:[],httpClients:[],websocketClients:[]}}:{};
    if(url.endsWith('/SetConfig'))written=JSON.parse(JSON.parse(opts.body).config);
    return new Response(JSON.stringify({code:0,data}));
  }});
  try{await f.store.update({qq:{napcat:{deployment:'native'}}});f.manager.openLogin();await f.manager.task;assert.equal(connected,1);assert.equal(written.network.websocketServers[0].host,'127.0.0.1');await wait(35);assert.equal(connected,1);}
  finally{await f.close();}
});
