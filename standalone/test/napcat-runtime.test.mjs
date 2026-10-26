import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {EventEmitter} from 'node:events';
import {NativeNapcatRuntime,parseNativeBinding} from '../server/napcat-runtime.mjs';
import {defaults} from '../server/store.mjs';
import {createApplication} from '../server/index.mjs';
const q=()=>({...defaults().qq,napcat:{...defaults().qq.napcat,webuiToken:'fixture-webui-private'}});
const json=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
function child(){const c=new EventEmitter();c.pid=123;c.stdout=new EventEmitter();c.stderr=new EventEmitter();c.kill=signal=>{c.lastSignal=signal;c.emit('exit',0);};return c;}
async function fixture(fn,options={}){
 const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-native-runtime-'));const spawned=[];let listening=false;
 const runtime=new NativeNapcatRuntime({dataDir:dir,platform:'darwin',startupMs:100,pollMs:1,readFile:async()=>JSON.stringify({main:'/fixture/loadNapCat.js'}),probe:async()=>listening,spawnImpl:(file,args,opts)=>{const c=child();spawned.push({file,args,opts,child:c});listening=true;queueMicrotask(()=>c.stdout.emit('data',Buffer.from('[NapCat] [WebUi] WebUi User Panel Url: http://127.0.0.1:6099/webui?token='+opts.env.NAPCAT_WEBUI_SECRET_KEY+'\n')));return c;},...options});
 try{await fn({runtime,dir,spawned,setListening:value=>listening=value});}finally{await runtime.close();await fs.rm(dir,{recursive:true,force:true});}
}
test('native WebUI pairing strips credentials out of public URLs and only accepts loopback',()=>{
 assert.deepEqual(parseNativeBinding('http://localhost:6099/webui?token=fixture-private'),{webuiUrl:'http://localhost:6099',webuiToken:'fixture-private'});
 assert.equal(parseNativeBinding('fixture-private').webuiUrl,'http://127.0.0.1:6099');
 for(const s of ['https://evil.test/?token=abc','http://localhost:6099/?token=a&token=b','http://u:p@localhost:6099/?token=a','http://localhost:80/?token=x','http://localhost:6099/'])assert.throws(()=>parseNativeBinding(s));
});
test('existing external NapCat is reused without spawning QQ, prompting for sandbox or killing it',async()=>fixture(async({runtime,spawned})=>{
 let connected=0;runtime.start(q(),{onReady:async()=>connected++});await runtime.task;
 assert.equal(runtime.status().phase,'external');assert.equal(connected,1);assert.equal(spawned.length,0);await runtime.stop();assert.equal(runtime.status().owned,false);
},{probe:async()=>true}));
test('unbound external instance explicitly requires first pairing, never claims a QR is ready',async()=>fixture(async({runtime})=>{
 const config=q();config.napcat.webuiToken='';let ready=0;runtime.start(config,{onReady:async()=>ready++});await runtime.task;
 assert.equal(runtime.status().phase,'external');assert.match(runtime.status().error,/首次/);assert.equal(ready,0);
},{probe:async()=>true}));
test('owned native start requires explicit sandbox consent and completes first-time entry checks',async()=>fixture(async({runtime,spawned})=>{
 runtime.start(q());await runtime.task;assert.match(runtime.status().error,/no-sandbox/);assert.equal(spawned.length,0);
}));
test('only an installed NapCat entry may be started, ordinary QQ is never silently patched',async()=>fixture(async({runtime,spawned})=>{
 runtime.start(q(),{confirmNoSandbox:true});await runtime.task;assert.match(runtime.status().error,/首次安装/);assert.equal(spawned.length,0);
},{readFile:async()=>JSON.stringify({main:'./application/app_launcher/index.js'})}));
test('owned process runs in background with QQ native data directory, no installer or terminal, secrets stay private',async()=>fixture(async({runtime,dir,spawned})=>{
 let ready=0;runtime.start(q(),{confirmNoSandbox:true,onPrepared:async()=>q(),onReady:async()=>ready++});runtime.start(q());await runtime.task;
 assert.equal(spawned.length,1);assert.equal(ready,1);assert.equal(runtime.status().phase,'running');assert.equal(runtime.status().owned,true);
 const {file,args,opts,child:c}=spawned[0];assert.equal(file,'/Applications/QQ.app/Contents/MacOS/QQ');assert.deepEqual(args,['--no-sandbox']);assert.equal(opts.env.NAPCAT_WORKDIR,undefined);assert.equal(opts.env.NAPCAT_WEBUI_SECRET_KEY,'fixture-webui-private');assert.equal(opts.env.NAPCAT_WEBUI_PREFERRED_PORT,'6099');assert.deepEqual(opts.stdio,['ignore','pipe','pipe']);
 await assert.rejects(fs.access(join(dir,'napcat-native/runtime/config/webui.json')),{code:'ENOENT'});
 c.stdout.emit('data',Buffer.from('secret-webui-token QQ message body'));assert.ok(!JSON.stringify(runtime.status()).includes('secret-webui-token'));
 await runtime.stop();assert.equal(c.lastSignal,'SIGTERM');assert.equal(runtime.status().owned,false);
}));
test('native process startup failure and exit are visible, not a fake connected state',async()=>fixture(async({runtime,spawned})=>{
 runtime.start(q(),{confirmNoSandbox:true});await runtime.task;spawned[0].child.emit('exit',1);assert.equal(runtime.status().phase,'stopped');assert.equal(runtime.status().webuiReady,false);
}));
test('non-Mac and remote URL paths never spawn an unsupported or remote native process',async()=>{
 await fixture(async({runtime,spawned})=>{runtime.start(q(),{confirmNoSandbox:true});await runtime.task;assert.match(runtime.status().error,/此系统/);assert.equal(spawned.length,0);},{platform:'win32'});
 await fixture(async({runtime,spawned})=>{const config=q();config.napcat.webuiUrl='https://remote.test';runtime.start(config,{confirmNoSandbox:true});await runtime.task;assert.match(runtime.status().error,/本机/);assert.equal(spawned.length,0);});
});
test('HTTP pairing encrypts the token, displays QR through native WebUI and never returns the raw link',async()=>{
 const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-native-pair-'));
 const app=await createApplication({dataDir:dir,nativeRuntimeOptions:{probe:async()=>true},napcatFetch:async url=>json({code:0,data:url.endsWith('/auth/login')?{Credential:'fixture-session'}:{isLogin:false,qrcodeurl:'https://txz.qq.com/p?k=fixture'}})});
 app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));const base=`http://127.0.0.1:${app.server.address().port}`;
 try{
  const home=await fetch(base),cookie=home.headers.get('set-cookie').split(';')[0],headers={cookie,origin:base,'Content-Type':'application/json'};
  const response=await fetch(base+'/api/napcat/native-pair',{method:'POST',headers,body:JSON.stringify({linkOrToken:'http://127.0.0.1:6099/webui?token=fixture-native-pair-secret'})});assert.equal(response.status,200);await app.napcat.task;
  assert.equal(app.napcat.status().phase,'waiting-qr');assert.match(app.napcat.status().qrImage,/^data:image/);
  assert.equal(app.store.get().qq.napcat.webuiToken,'fixture-native-pair-secret');assert.ok(!JSON.stringify(app.store.publicConfig()).includes('fixture-native-pair-secret'));
  assert.ok(!(await fs.readFile(join(dir,'state.enc'))).includes('fixture-native-pair-secret'));
 }finally{await app.close();await fs.rm(dir,{recursive:true,force:true});}
});
test('owned startup follows a split loopback boot URL and persists the actual fallback port',async()=>fixture(async({runtime})=>{
 let binding,ready=0;
 runtime.start(q(),{confirmNoSandbox:true,onBinding:async value=>binding=value,onReady:async()=>ready++});await runtime.task;
 assert.deepEqual(binding,{webuiUrl:'http://127.0.0.1:6100',webuiToken:'fixture-webui-private'});assert.equal(ready,1);
 assert.ok(!JSON.stringify(runtime.status()).includes('fixture-webui-private'));
},{probe:async port=>port===6100,spawnImpl:()=>{const c=child();queueMicrotask(()=>{c.stdout.emit('data','[NapCat] [WebUi] WebUi User Panel Url: http://127.0.0.1:6100/webui?tok');c.stdout.emit('data','en=fixture-webui-private\n');});return c;}}));
test('untrusted startup URLs and mismatched tokens never bind or claim readiness',async()=>fixture(async({runtime})=>{
 let ready=0;runtime.start(q(),{confirmNoSandbox:true,onReady:async()=>ready++});await runtime.task;
 assert.equal(runtime.status().phase,'error');assert.equal(ready,0);assert.equal(runtime.status().webuiReady,false);
},{startupMs:12,probe:async()=>false,spawnImpl:()=>{const c=child();queueMicrotask(()=>c.stdout.emit('data','[WebUi] WebUi User Panel Url: http://evil.test:6099/webui?token=fixture-webui-private\n[WebUi] WebUi User Panel Url: http://127.0.0.1:6099/webui?token=wrong\n'));return c;}}));
test('startup permission failures are classified without retaining private child output',async()=>fixture(async({runtime})=>{
 runtime.start(q(),{confirmNoSandbox:true});await runtime.task;
 assert.match(runtime.status().error,/文件访问/);assert.equal(runtime.bootTail,undefined);assert.ok(!JSON.stringify(runtime).includes('private-chat-body'));
},{startupMs:12,probe:async()=>false,spawnImpl:()=>{const c=child();queueMicrotask(()=>c.stderr.emit('data','EPERM private-chat-body fixture-webui-private\n'));return c;}}));
test('retry after startup timeout never spawns over an already-owned QQ child',async()=>fixture(async({runtime,spawned})=>{
 runtime.start(q(),{confirmNoSandbox:true});await runtime.task;
 runtime.start(q(),{confirmNoSandbox:true});await runtime.task;
 assert.equal(spawned.length,1);assert.match(runtime.status().error,/先停止/);
},{startupMs:5,probe:async()=>false}));
