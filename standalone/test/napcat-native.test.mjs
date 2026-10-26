import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {NativeNapcat,nativePlatform,nativeAsset} from '../server/napcat-native.mjs';
import {defaults,mergeConfig} from '../server/store.mjs';
import {createApplication} from '../server/index.mjs';
const bytes=Buffer.from('fixture installer bytes'),digest=createHash('sha256').update(bytes).digest('hex');
const release=(profile=nativePlatform('darwin','arm64'),patch={})=>({tag_name:'v1.7',assets:[{name:profile.asset??'QQ-53644_NapCat-v4.18.41-arm64.AppImage',size:bytes.length,digest:`sha256:${digest}`,browser_download_url:`https://github.com/${profile.repo}/releases/download/v1.7/${profile.asset??'QQ-53644_NapCat-v4.18.41-arm64.AppImage'}`,...patch}]});
const json=value=>new Response(JSON.stringify(value),{headers:{'Content-Type':'application/json'}});
async function fixture(fn,options={}) {
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-native-')),requests=[],commands=[];
  const service=new NativeNapcat({dataDir:dir,platform:'darwin',arch:'arm64',home:dir,
    fetchImpl:async url=>{requests.push(String(url));return String(url).includes('api.github.com')?json(release()):new Response(bytes);},
    run:async(cmd,args)=>{commands.push({cmd,args});if(cmd.endsWith('unzip'))return{stdout:'NapCatInstaller.app/Contents/MacOS/NapCatInstaller\n'};if(cmd.endsWith('ditto'))await fs.mkdir(join(args.at(-1),'NapCatInstaller.app'),{recursive:true});return{stdout:''};},...options});
  try {await fn({service,dir,requests,commands});}finally{await service.close();await fs.rm(dir,{recursive:true,force:true});}
}
test('new users default to native, while existing Docker and external choices survive',()=>{
  assert.equal(defaults().qq.napcat.deployment,'native');
  for(const mode of ['native','managed','external'])assert.equal(mergeConfig({qq:{napcat:{deployment:mode}}},defaults()).qq.napcat.deployment,mode);
});
test('native platform selection uses official Mac/Windows/Linux releases without Docker',()=>{
  assert.equal(nativePlatform('darwin','arm64').repo,'NapNeko/NapCat-Mac-Installer');assert.equal(nativePlatform('darwin','x64').kind,'mac-installer');
  assert.equal(nativePlatform('win32','x64').asset,'NapCat.Shell.Windows.OneKey.zip');assert.equal(nativePlatform('linux','arm64').repo,'NapNeko/NapCatAppImageBuild');
  assert.equal(nativePlatform('win32','arm64').kind,'unsupported');
});
test('release pinning rejects missing digest, redirected metadata paths and incorrect sizes',()=>{
  const profile=nativePlatform('darwin','arm64');assert.equal(nativeAsset(release(),profile).sha256,digest);
  for(const patch of [{digest:''},{browser_download_url:'https://evil.test/install.zip'},{size:2**32},{name:'../bad.zip'}])assert.throws(()=>nativeAsset(release(profile,patch),profile));
  const bad=release();bad.tag_name='../escape';assert.throws(()=>nativeAsset(bad,profile));
});
test('official native package download verifies size/hash, persists and reuses a good cache',async()=>fixture(async({service,dir,requests,commands})=>{
  service.download();service.download();await service.task;assert.equal(service.status().phase,'downloaded');assert.equal(requests.length,2);assert.equal(commands.length,0);
  const file=join(dir,'napcat-native/v1.7/NapCatInstaller_arm64.amd64.zip');assert.deepEqual(await fs.readFile(file),bytes);assert.equal((await fs.stat(file)).mode&0o777,0o600);
  service.download();await service.task;assert.equal(requests.length,3);
  const restart=new NativeNapcat({dataDir:dir,platform:'darwin',arch:'arm64'});try{await restart.check();assert.equal(restart.status().phase,'downloaded');}finally{await restart.close();}
}));
test('corrupt native archive is removed instead of being offered as an installer',async()=>fixture(async({service,dir})=>{
  service.download();await service.task;assert.equal(service.status().phase,'error');assert.match(service.status().error,/校验/);
  const entries=await fs.readdir(join(dir,'napcat-native/v1.7'));assert.ok(entries.every(n=>!n.endsWith('.part')&&!n.endsWith('.zip')));
},{fetchImpl:async url=>String(url).includes('api.github.com')?json(release()):new Response(Buffer.alloc(bytes.length))}));
test('tampered cached installer is never opened',async()=>fixture(async({service,dir,commands})=>{
  service.download();await service.task;await fs.writeFile(join(dir,'napcat-native/v1.7/NapCatInstaller_arm64.amd64.zip'),'tampered');
  await assert.rejects(service.open(),/校验/);assert.equal(commands.length,0);
}));
test('Mac installer opens through system UI without sudo, QQ edits or protection changes',async()=>fixture(async({service,commands})=>{
  service.download();await service.task;await service.open();assert.equal(service.status().phase,'installer-opened');
  assert.deepEqual(commands.map(c=>c.cmd),['/usr/bin/unzip','/usr/bin/ditto','/usr/bin/open']);assert.match(commands.at(-1).args[0],/NapCatInstaller\.app$/);
  assert.ok(!JSON.stringify(commands).includes('sudo'));assert.ok(!JSON.stringify(commands).includes('xattr'));
}));
test('zip traversal entries cannot reach native installer extraction',async()=>fixture(async({service,commands})=>{
  service.download();await service.task;await assert.rejects(service.open(),/路径校验/);assert.equal(commands.length,0);
},{run:async cmd=>cmd.endsWith('unzip')?{stdout:'../escape\n'}:{stdout:''}}));
test('cancelling native download interrupts the network and permits a later retry',async()=>fixture(async({service})=>{
  service.download();service.cancel();await service.task;assert.equal(service.status().phase,'cancelled');
},{fetchImpl:async(_url,{signal})=>{if(signal.aborted)throw new Error('aborted');return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));}}));
test('Mac local WebUI imports only valid loopback port and token, never publishes credentials',async()=>fixture(async({service,dir})=>{
  const config=join(dir,'Library/Containers/com.tencent.qq/Data/Documents/napcat/config');await fs.mkdir(config,{recursive:true});
  assert.equal(await service.localWebui(),null);await fs.writeFile(join(config,'webui.json'),JSON.stringify({port:6099,token:'fixture-secret',other:'ignored'}));
  assert.deepEqual(await service.localWebui(),{webuiUrl:'http://127.0.0.1:6099',webuiToken:'fixture-secret'});assert.ok(!JSON.stringify(service.status()).includes('fixture-secret'));
  await fs.writeFile(join(config,'webui.json'),JSON.stringify({port:99999,token:'fixture-secret'}));assert.equal(await service.localWebui(),null);
}));
test('Linux selects only its own architecture and opens its directory, not an automatic root installer',async()=>fixture(async({service,commands})=>{
  service.download();await service.task;assert.equal(service.status().phase,'downloaded');await service.open();assert.equal(commands.at(-1).cmd,'xdg-open');
},{platform:'linux',arch:'arm64',fetchImpl:async url=>String(url).includes('api.github.com')?json(release(nativePlatform('linux','arm64'))):new Response(bytes)}));
test('Windows extracts and opens only its official installer with literal paths, no Docker',async()=>{
  const calls=[];await fixture(async({service})=>{
    service.download();await service.task;await service.open();assert.equal(service.status().phase,'installer-opened');
    assert.equal(calls.length,2);assert.ok(calls.every(c=>c.cmd==='powershell.exe'));
    assert.match(calls[0].options.env.BIGFISH_ARCHIVE,/NapCat\.Shell\.Windows\.OneKey\.zip$/);
    assert.match(calls[1].options.env.BIGFISH_INSTALLER,/NapCatInstaller\.exe$/);
  },{platform:'win32',arch:'x64',fetchImpl:async url=>String(url).includes('api.github.com')?json(release(nativePlatform('win32','x64'))):new Response(bytes),
    run:async(cmd,args,options)=>{calls.push({cmd,args,options});if(options.env.BIGFISH_UNPACK){await fs.mkdir(options.env.BIGFISH_UNPACK,{recursive:true});await fs.writeFile(join(options.env.BIGFISH_UNPACK,'NapCatInstaller.exe'),'fixture');}return {stdout:''};}});
});
test('HTTP native setup is authenticated, downloads without invoking Docker, and keeps setup honest',async()=>{
  const dir=await fs.mkdtemp(join(tmpdir(),'bigfish-native-http-'));let docker=0;
  const app=await createApplication({dataDir:dir,napcatRun:async()=>{docker++;throw new Error('unexpected Docker');},nativeNapcatOptions:{platform:'darwin',arch:'arm64',home:dir,fetchImpl:async url=>String(url).includes('api.github.com')?json(release()):new Response(bytes)}});
  app.server.listen(0,'127.0.0.1');await new Promise(r=>app.server.once('listening',r));const base=`http://127.0.0.1:${app.server.address().port}`;
  try{assert.equal((await fetch(base+'/api/napcat/native-download',{method:'POST',body:'{}'})).status,401);
    const home=await fetch(base),cookie=home.headers.get('set-cookie').split(';')[0],headers={cookie,origin:base,'Content-Type':'application/json'};
    assert.equal((await fetch(base+'/api/napcat/native-download',{method:'POST',headers,body:'{}'})).status,202);await app.nativeNapcat.task;
    assert.equal(app.nativeNapcat.status().phase,'downloaded');assert.equal(docker,0);
    const connect=await fetch(base+'/api/napcat/native-connect',{method:'POST',headers,body:'{}'});assert.equal(connect.status,400);assert.match((await connect.json()).error,/尚未绑定/);
  }finally{await app.close();await fs.rm(dir,{recursive:true,force:true});}
});
