import fs from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import QRCode from 'qrcode';

const execute = promisify(execFile);
export const NAPCAT_IMAGE = 'mlikiowa/napcat-docker:latest';
const sleep = (ms, signal) => new Promise((resolve, reject) => {
  if(signal.aborted)return reject(signal.reason);
  const done=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);};
  const abort=()=>{done();reject(signal.reason);};
  const timer=setTimeout(()=>{done();resolve();},ms);signal.addEventListener('abort',abort,{once:true});
});
const fault = (message, code) => Object.assign(new Error(message),{code});
async function atomic(path, data) {
  const temp=path+'.'+randomUUID()+'.tmp';
  try{await fs.copyFile(path,path+'.bak');}catch(e){if(e.code!=='ENOENT')throw e;}
  await fs.writeFile(temp,JSON.stringify(data,null,2),{mode:0o600});await fs.rename(temp,path);
}

export function managedCompose(dir, q) {
  const owner=createHash('sha256').update(resolve(dir)).digest('hex').slice(0,12);
  return { name:`bigfish-napcat-${owner}`, services:{napcat:{image:NAPCAT_IMAGE,restart:'unless-stopped',
    labels:{'io.bigfish.owner':owner},environment:{TZ:'Asia/Shanghai',NAPCAT_UID:String(process.getuid?.()??1000),NAPCAT_GID:String(process.getgid?.()??1000)},
    ports:[`127.0.0.1:${q.napcat.webPort}:6099`,`127.0.0.1:${q.napcat.wsPort}:3001`],
    volumes:[`${join(resolve(dir),'config')}:/app/napcat/config`,`${join(resolve(dir),'qq')}:/app/.config/QQ`,`${join(resolve(dir),'plugins')}:/app/napcat/plugins`],
  }} };
}

// Independently implemented adapter to NapCat's documented WebUI endpoints.
// No NapCat or AstrBot implementation code is copied or loaded into BigFish.
export class NapcatManager {
  #state={phase:'idle',runtime:'unknown'};#controller=new AbortController();#epoch=0;#timer;#session;#qr='';#connected=false;
  constructor({store,dataDir,onPrepare,onReady,fetchImpl=fetch,run=execute,pollMs=2500,startupDelayMs=1500}) {
    Object.assign(this,{store,dir:join(resolve(dataDir),'napcat'),onPrepare,onReady,fetchImpl,run,pollMs,startupDelayMs});
  }
  status(){return structuredClone(this.#state);}
  #set(patch){this.#state={...this.#state,...patch};}
  #newSession(){this.cancel();return{epoch:this.#epoch,signal:this.#controller.signal};}
  #live(epoch){if(epoch!==this.#epoch||this.#controller.signal.aborted)throw fault('NapCat 操作已取消','CANCELLED');}
  async #docker(args,signal,timeout=10000){return this.run('docker',args,{signal,timeout,maxBuffer:2*1024*1024,windowsHide:true});}
  async checkRuntime(){
    try{await this.#docker(['info','--format','{{.ServerVersion}}'],this.#controller.signal,5000);await this.#docker(['compose','version','--short'],this.#controller.signal,5000);this.#set({runtime:'ready',runtimeMessage:'Docker 与 Compose 已就绪'});}
    catch(e){const missing=e.code==='ENOENT';this.#set({runtime:missing?'missing':'unavailable',runtimeMessage:missing?'尚未安装 Docker。安装并启动 Docker Desktop 或兼容的 Docker 运行环境后，即可一键启动 NapCat。':'Docker 或 Compose 尚未就绪，请先启动 Docker 引擎并确认 Compose 可用。'});}
    return this.status();
  }
  async #request(path,body={},authenticated=true){
    const signal=this.#controller.signal;
    const q=this.store.get().qq;
    const base=q.napcat.webuiUrl.replace(/\/webui\/?$/,'').replace(/\/$/,'');
    let response;
    try{response=await this.fetchImpl(base+'/api/'+path,{method:'POST',redirect:'error',signal:AbortSignal.any([signal,AbortSignal.timeout(8000)]),headers:{'Content-Type':'application/json',...(authenticated?{Authorization:`Bearer ${this.#session}`}: {})},body:JSON.stringify(body)});}
    catch{signal.throwIfAborted();throw fault('NapCat 管理服务未启动或地址不可达','NAPCAT_OFFLINE');}
    const chunks=[];let size=0;
    for await(const chunk of response.body){size+=chunk.length;if(size>1_000_000)throw fault('NapCat 响应超过 1 MB','PROTOCOL');chunks.push(chunk);}
    signal.throwIfAborted();
    let data;try{data=JSON.parse(Buffer.concat(chunks).toString());}catch{throw fault('NapCat 管理接口返回格式异常','PROTOCOL');}
    if(!response.ok||data.code!==0){
      if(/[Uu]nauthor|[Aa]uthorization|[Tt]oken|[Ll]ogin.*limit/.test(String(data.message)))throw fault('NapCat WebUI 授权失效，请核对管理 Token 后重新连接','AUTH');
      throw fault('NapCat 尚未完成当前操作，请在其管理页检查登录状态','PROTOCOL');
    }
    return data.data;
  }
  async #authenticate(totpCode){
    const token=this.store.get().qq.napcat.webuiToken;
    if(!token)throw fault('请填写 NapCat WebUI 管理 Token；它与 OneBot Token 不同','AUTH');
    const result=await this.#request('auth/login',{hash:createHash('sha256').update(token+'.napcat').digest('hex'),...(totpCode?{totpCode}:{})},false);
    if(result?.require2FA)throw fault('NapCat 开启了两步验证，请输入当前验证码后再连接','TOTP');
    if(typeof result?.Credential!=='string'||!result.Credential)throw fault('NapCat 未返回有效管理凭据','AUTH');
    this.#session=result.Credential;
  }
  startManaged(){
    if(['checking','pulling','starting'].includes(this.#state.phase))return this.status();
    const {epoch,signal}=this.#newSession();this.#set({phase:'checking',error:null,qrImage:null});
    this.task=(async()=>{
      await this.checkRuntime();this.#live(epoch);
      if(this.#state.runtime!=='ready'){this.#set({phase:'runtime-required'});return;}
      const q=await this.onPrepare();this.#live(epoch);
      await this.#writeManaged(q);this.#live(epoch);
      const args=['compose','-f',join(this.dir,'compose.json')];
      this.#set({phase:'pulling'});await this.#docker([...args,'pull','--quiet'],signal,10*60_000);this.#live(epoch);
      this.#set({phase:'starting'});await this.#docker([...args,'up','-d'],signal,90000);this.#live(epoch);
      for(let i=0;i<50;i++){
        try{await this.#authenticate();this.#live(epoch);await this.#poll(epoch);return;}
        catch(e){this.#live(epoch);if(e.code!=='NAPCAT_OFFLINE')throw e;await sleep(this.startupDelayMs,signal);}
      }
      throw fault('NapCat 容器已启动，管理服务还未就绪，请稍后点击“获取登录二维码”','NAPCAT_OFFLINE');
    })().catch(e=>{if(epoch===this.#epoch)this.#set({phase:'error',error:e.code==='ABORT_ERR'?'操作已取消':e.code==='NAPCAT_OFFLINE'||e.code==='AUTH'||e.code==='TOTP'||e.code==='PROTOCOL'?e.message:'NapCat 启动未完成，请检查 Docker 镜像网络、磁盘和端口占用'});});
    return this.status();
  }
  async #writeManaged(q){
    for(const name of ['','config','qq','plugins'])await fs.mkdir(join(this.dir,name),{recursive:true,mode:0o700});
    await atomic(join(this.dir,'compose.json'),managedCompose(this.dir,q));
    // Keep QQ profile and existing WebUI settings across starts.
    const initial=async(name,data)=>{try{await fs.access(join(this.dir,'config',name));}catch(e){if(e.code!=='ENOENT')throw e;await atomic(join(this.dir,'config',name),data);}};
    await initial('webui.json',{host:'0.0.0.0',port:6099,token:q.napcat.webuiToken,loginRate:3});
    await initial('onebot11.json',{network:{httpServers:[],httpClients:[],websocketClients:[],websocketServers:[{name:'bigfish',enable:true,host:'0.0.0.0',port:3001,messagePostFormat:'array',reportSelfMessage:false,token:q.token,heartInterval:30000}]}});
  }
  openLogin(totpCode){
    const {epoch}=this.#newSession();this.#set({phase:'authorizing',error:null,qrImage:null});
    this.task=(async()=>{await this.#authenticate(totpCode);this.#live(epoch);await this.#poll(epoch);})().catch(e=>{if(epoch===this.#epoch)this.#set({phase:e.code==='TOTP'?'two-factor':'error',error:['AUTH','TOTP','PROTOCOL','NAPCAT_OFFLINE'].includes(e.code)?e.message:'NapCat 登录查询未完成，请重试'});});
    return this.status();
  }
  async #poll(epoch){
    this.#live(epoch);const data=await this.#request('QQLogin/CheckLoginStatus');this.#live(epoch);
    if(data?.isLogin===true&&data.coreReady!==false){
      this.#set({phase:'online',qrImage:null,error:null});this.#qr='';
      if(!this.#connected){if(this.store.get().qq.napcat.deployment==='native'){try{await this.configureLocalChannel(false);this.#set({onebotError:null});}catch{this.#set({onebotError:'个人 QQ 已登录，本机 OneBot 自动配置未完成，可点击下方按钮重试'});}this.#live(epoch);}await this.onReady();this.#live(epoch);this.#connected=true;}
    }else{
      this.#connected=false;
      const accepted=data?.qrLoginAccepted===true||['qrcode_scanned','initializing'].includes(data?.loginPhase);
      let url=data?.qrcodeurl;
      if(!url&&!accepted&&!data?.isOffline){try{url=(await this.#request('QQLogin/GetQQLoginQrcode'))?.qrcode;}catch(e){if(e.code!=='PROTOCOL')throw e;}}
      this.#live(epoch);
      if(url&&!accepted&&!data?.isOffline){
        let u;try{u=new URL(url);}catch{throw fault('NapCat 返回的二维码链接格式异常','PROTOCOL');}
        if(u.protocol!=='https:'||!(u.hostname==='qq.com'||u.hostname.endsWith('.qq.com')))throw fault('NapCat 二维码不是 QQ 官方 HTTPS 链接','PROTOCOL');
        if(url!==this.#qr){const image=await QRCode.toDataURL(url,{width:260,margin:2});this.#live(epoch);this.#qr=url;this.#set({qrImage:image});}
        this.#set({phase:'waiting-qr',error:null});
      }else{this.#qr='';this.#set({phase:accepted?'initializing':data?.isOffline?'offline':'generating-qr',qrImage:null,error:null});}
    }
    this.#live(epoch);this.#timer=setTimeout(()=>{this.task=this.#poll(epoch).catch(e=>{if(epoch===this.#epoch)this.#set({phase:'error',qrImage:null,error:['AUTH','PROTOCOL','NAPCAT_OFFLINE'].includes(e.code)?e.message:'NapCat 状态查询未完成，请重新连接'});});},this.pollMs);this.#timer.unref();
  }
  async refreshQr(){if(!this.#session)throw new Error('请先连接 NapCat 管理服务');await this.#request('QQLogin/RefreshQRcode');this.#qr='';return this.status();}
  async configureLocalChannel(connect=true){
    const q=this.store.get().qq;
    const url=new URL(q.url),web=new URL(q.napcat.webuiUrl);
    if(!['127.0.0.1','localhost','[::1]'].includes(web.hostname)||!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||url.protocol!=='ws:')throw new Error('远端 NapCat 请在其 WebUI 配置正向 WS；自动配置仅用于本机实例');
    if(!this.#session)throw new Error('请先获取 NapCat 登录状态');
    const config=await this.#request('OB11Config/GetConfig');
    if(!config?.network||!Array.isArray(config.network.websocketServers))throw new Error('NapCat 未返回可编辑的 OneBot 配置');
    const servers=config.network.websocketServers;
    const port=q.napcat.deployment==='managed'?3001:Number(url.port||80);
    if(servers.some(s=>s.name!=='bigfish'&&s.enable&&Number(s.port)===port))throw new Error('该端口已有其他 OneBot 服务，请在 NapCat 管理页确认后使用现有连接配置');
    const entry={name:'bigfish',enable:true,host:q.napcat.deployment==='managed'?'0.0.0.0':'127.0.0.1',port,messagePostFormat:'array',reportSelfMessage:false,token:q.token,heartInterval:30000};
    config.network.websocketServers=[...servers.filter(s=>s.name!=='bigfish'),entry];
    await this.#request('OB11Config/SetConfig',{config:JSON.stringify(config)});
    if(connect)await this.onReady();return this.status();
  }
  async stopManaged(){
    if(this.store.get().qq.napcat.deployment!=='managed')throw new Error('已有 NapCat 服务由其部署方管理');
    this.cancel();
    const compose=JSON.parse(await fs.readFile(join(this.dir,'compose.json'),'utf8'));
    const expected=managedCompose(this.dir,this.store.get().qq);
    if(compose.name!==expected.name||compose.services?.napcat?.labels?.['io.bigfish.owner']!==expected.services.napcat.labels['io.bigfish.owner'])throw new Error('NapCat 实例归属不匹配，未执行停止');
    await this.#docker(['compose','-f',join(this.dir,'compose.json'),'stop'],this.#controller.signal,30000);
    this.#set({phase:'stopped',qrImage:null,error:null});return this.status();
  }
  cancel(){this.#epoch++;clearTimeout(this.#timer);this.#controller.abort();this.#controller=new AbortController();this.#session=null;this.#qr='';this.#connected=false;this.#set({phase:'idle',qrImage:null,error:null});}
  async close(){this.cancel();await this.task;}
}
