import fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {spawn} from 'node:child_process';
import net from 'node:net';

const QQ_EXEC='/Applications/QQ.app/Contents/MacOS/QQ';
const QQ_PACKAGE='/Applications/QQ.app/Contents/Resources/app/package.json';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
export async function localPortOpen(port){
  return new Promise(resolve=>{
    const socket=net.createConnection({host:'127.0.0.1',port});
    const finish=value=>{socket.destroy();resolve(value);};
    socket.once('connect',()=>finish(true));socket.once('error',()=>finish(false));socket.setTimeout(800,()=>finish(false));
  });
}
export function parseNativeBinding(input,currentUrl='http://127.0.0.1:6099'){
  if(typeof input!=='string'||!input.trim()||input.length>16_384)throw new Error('请粘贴 NapCat WebUI 链接或管理 Token');
  const raw=input.trim();let token=raw,target;
  if(/^https?:\/\//i.test(raw)){
    target=new URL(raw);
    if(target.username||target.password||target.hash||target.searchParams.getAll('token').length!==1)throw new Error('请使用控制台中的本机 WebUI 链接，包含一个 token 参数');
    token=target.searchParams.get('token');
  }else target=new URL(currentUrl);
  if(target.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(target.hostname))throw new Error('原生绑定只接受本机 HTTP WebUI 链接');
  const port=Number(target.port||80);
  if(!Number.isInteger(port)||port<1024||port>65535||typeof token!=='string'||!token||token.length>8192||!/^[\x21-\x7e]+$/.test(token))throw new Error('WebUI 端口或 Token 格式异常');
  return {webuiUrl:target.origin,webuiToken:token};
}

/** Own only the child we start. Never terminate a user's existing QQ / Terminal. */
export class NativeNapcatRuntime {
  child=null;task=null;closed=false;epoch=0;
  state={phase:'idle',entryReady:false,webuiReady:false,owned:false,error:null};
  constructor({dataDir,platform=process.platform,spawnImpl=spawn,probe=localPortOpen,readFile=fs.readFile,startupMs=60_000,pollMs=500}={}) {
    Object.assign(this,{dir:join(resolve(dataDir),'napcat-native/runtime'),platform,spawnImpl,probe,readFile,startupMs,pollMs});
  }
  status(){return structuredClone(this.state);}
  async check(q){
    const target=new URL(q.napcat.webuiUrl);
    if(target.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(target.hostname))throw new Error('后台托管仅连接本机 HTTP NapCat；远端服务请选择连接已有 NapCat');
    let entryReady=false;
    if(this.platform==='darwin'){
      try{const p=JSON.parse(await this.readFile(QQ_PACKAGE,'utf8'));entryReady=typeof p.main==='string'&&/loadnapcat\.js/i.test(p.main);}catch{}
    }
    const webuiReady=await this.probe(Number(target.port||80));
    this.state={...this.state,entryReady,webuiReady,owned:!!this.child,
      ...(!this.task?{phase:webuiReady?(this.child?'running':'external'):this.child?'starting':'idle'}:{})};
    return this.status();
  }
  start(q,{confirmNoSandbox=false,onPrepared,onBinding,onReady}={}){
    if(this.closed)throw new Error('原生托管服务已关闭');
    if(this.task)return this.status();
    const epoch=++this.epoch;
    this.state={...this.state,phase:'checking',error:null};
    this.task=(async()=>{
      await this.check(q);if(epoch!==this.epoch)return;
      if(this.state.webuiReady){
        this.state.phase=this.child?'running':'external';
        if(q.napcat.webuiToken)await onReady?.();
        else this.state.error='检测到已运行的 NapCat。首次粘贴一次控制台 WebUI 链接即可绑定，或退出该实例后由大肥鱼启动。';
        return;
      }
      if(this.child)throw new Error('托管 QQ 仍在运行，请先停止托管实例，再重新启动');
      if(this.platform!=='darwin')throw new Error('此系统请先用官方安装器启动一次，再在这里绑定；后台托管启动当前适配 macOS');
      if(!this.state.entryReady)throw new Error('首次安装还未完成，请展开安装与修复，在官方安装器切换 NapCat 入口');
      if(confirmNoSandbox!==true)throw new Error('首次启动请确认 --no-sandbox 参数：它会关闭此 QQ 进程的 Chromium 沙盒');
      const prepared=await onPrepared?.();if(epoch!==this.epoch)return;
      const config=prepared??q;
      if(!config.napcat.webuiToken)throw new Error('启动管理凭据未准备完成');
      await fs.mkdir(this.dir,{recursive:true,mode:0o700});
      if(epoch!==this.epoch)return;
      // QQ is a sandboxed macOS app: let NapCat keep its own supported data
      // directory. These upstream settings configure credentials/port without
      // writing into QQ's protected container or redirecting its workdir.
      const env={...process.env,NAPCAT_WEBUI_SECRET_KEY:config.napcat.webuiToken,
        NAPCAT_WEBUI_PREFERRED_PORT:String(new URL(config.napcat.webuiUrl).port||6099)};
      delete env.NAPCAT_WORKDIR;
      this.state.phase='starting';
      const child=this.spawnImpl(QQ_EXEC,['--no-sandbox'],{cwd:this.dir,env,stdio:['ignore','pipe','pipe'],windowsHide:true});
      this.child=child;this.state.owned=true;this.state.pid=child.pid??null;
      // Inspect only our child's boot stream. Retain no raw logs, tokens, QR
      // payloads or chat messages. NapCat may select another port if occupied.
      let bootError=null,binding=null,partial='';
      const observe=chunk=>{
        if(this.state.webuiReady)return;
        const text=String(chunk).replace(/\x1b\[[0-9;]*m/g,'');
        partial=(partial+text).slice(-32_768);
        const lines=partial.split(/\r?\n/);partial=lines.pop();
        for(const line of lines){
          if(!line.includes('[WebUi] WebUi User Panel Url:'))continue;
          const url=line.match(/https?:\/\/[^\s]+/)?.[0];
          try{const found=parseNativeBinding(url);if(found.webuiToken===config.napcat.webuiToken)binding=found;}catch{}
        }
        if(/EPERM|EACCES|Operation not permitted|Permission denied/.test(text))bootError='QQ 启动遇到文件访问错误，请检查 NapCat 安装与原生数据目录权限';
        else if(/Cannot find module|MODULE_NOT_FOUND/.test(text))bootError='QQ 启动入口依赖缺失，请在安装与修复中更新 NapCat 加载器';
        else if(/wrong architecture|incompatible architecture/.test(text))bootError='原生模块与 QQ 架构不匹配，请更新对应架构的 NapCat';
        else if(/EADDRINUSE/.test(text))bootError='NapCat 管理端口被其他程序占用';
        if(bootError)this.state.error=bootError;
      };
      child.stdout?.on('data',observe);child.stderr?.on('data',observe);
      child.once('error',()=>{if(this.child===child){this.child=null;this.state={...this.state,phase:'error',owned:false,error:'QQ 原生进程启动失败，请检查安装与系统授权'};}});
      child.once('exit',()=>{if(this.child===child){this.child=null;this.state={...this.state,phase:'stopped',owned:false,webuiReady:false,pid:null,error:this.state.phase==='starting'?'QQ 在管理服务就绪前退出，请检查 NapCat 入口与系统授权':null};}});
      const end=Date.now()+this.startupMs;
      while(Date.now()<end&&epoch===this.epoch&&this.child===child){
        if(binding&&await this.probe(Number(new URL(binding.webuiUrl).port))){
          if(epoch!==this.epoch||this.child!==child)return;
          await onBinding?.(binding);
          if(epoch!==this.epoch||this.child!==child)return;
          partial='';this.state={...this.state,phase:'running',webuiReady:true,error:null};await onReady?.();return;
        }
        await delay(this.pollMs);
      }
      if(epoch===this.epoch&&this.child===child)this.state={...this.state,phase:'error',error:bootError??'QQ 进程已启动，管理服务尚未就绪，可稍后重新获取二维码'};
    })().catch(e=>{if(epoch===this.epoch)this.state={...this.state,phase:'error',error:e.message};}).finally(()=>{this.task=null;});
    return this.status();
  }
  async stop(){
    ++this.epoch;const child=this.child;
    if(!child){this.state.owned=false;return this.status();}
    const exited=new Promise(resolve=>child.once('exit',resolve));child.kill('SIGTERM');
    let timer;await Promise.race([exited,new Promise(resolve=>{timer=setTimeout(resolve,8000);})]);clearTimeout(timer);
    if(this.child===child)throw new Error('托管 QQ 仍在退出，请稍候再试；没有结束其他 QQ 实例');
    return this.status();
  }
  async close(){this.closed=true;await this.stop().catch(()=>{});await this.task;}
}
