import fs from 'node:fs/promises';
import {join,resolve,basename} from 'node:path';
import {homedir} from 'node:os';
import {createHash,randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execute=promisify(execFile);
export const NATIVE_GUIDE='https://napneko.github.io/guide/boot/Shell';
export function nativePlatform(platform=process.platform,arch=process.arch) {
  if(platform==='darwin'&&['arm64','x64'].includes(arch))return {platform,arch,name:'macOS',repo:'NapNeko/NapCat-Mac-Installer',asset:'NapCatInstaller_arm64.amd64.zip',kind:'mac-installer',
    steps:['本机需要 QQ.app；下载后打开官方安装器。','在安装器中安装 NapCat，并按系统提示确认 QQ 入口授权。','启动 NapCat 后回到这里，点击“已完成安装，获取二维码”。']};
  if(platform==='win32'&&arch==='x64')return {platform,arch,name:'Windows x64',repo:'NapNeko/NapCatQQ',asset:'NapCat.Shell.Windows.OneKey.zip',kind:'windows-installer',
    steps:['下载后打开官方一键安装器，无需预先安装 QQ。','安装完成，在安装器生成的目录运行 napcat.bat。','返回这里获取二维码；管理 Token 可在高级管理配置填写。']};
  if(platform==='linux'&&['arm64','x64'].includes(arch))return {platform,arch,name:`Linux ${arch}`,repo:'NapNeko/NapCatAppImageBuild',kind:'appimage',
    steps:['下载内含 QQ 与 NapCat 的 AppImage；不使用 Docker。','系统需要 xvfb-run 和 xauth；无需 FUSE 时加 --appimage-extract-and-run。','打开下载目录，按下方命令运行，再返回这里获取二维码。']};
  return {platform,arch,name:`${platform} / ${arch}`,kind:'unsupported',steps:['当前架构暂无已适配的原生下载包，可连接已有 NapCat。']};
}
export function nativeAsset(release,profile) {
  const tag=release?.tag_name;
  if(typeof tag!=='string'||!/^v?[a-zA-Z0-9._-]{1,60}$/.test(tag))throw new Error('官方发布版本格式异常');
  const asset=release.assets?.find(a=>profile.asset?a.name===profile.asset:new RegExp(`-${profile.arch==='x64'?'amd64':'arm64'}\\.AppImage$`).test(a.name));
  if(!asset||basename(asset.name)!==asset.name||!/^sha256:[a-f0-9]{64}$/.test(asset.digest??''))throw new Error('官方发布包或 SHA-256 校验信息缺失');
  const prefix=`https://github.com/${profile.repo}/releases/download/${tag}/`;
  if(asset.browser_download_url!==prefix+asset.name||!Number.isSafeInteger(asset.size)||asset.size<1||asset.size>1024**3)throw new Error('官方安装包地址或大小异常');
  return {tag,name:asset.name,url:asset.browser_download_url,size:asset.size,sha256:asset.digest.slice(7),repo:profile.repo};
}
async function hashFile(file) {const hash=createHash('sha256'),handle=await fs.open(file);try{for await(const chunk of handle.createReadStream())hash.update(chunk);return hash.digest('hex');}finally{await handle.close();}}
async function boundedJson(response) {
  if(!response.ok)throw new Error(`官方发布查询失败（HTTP ${response.status}）`);
  const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>1024**2)throw new Error('官方发布信息过大');chunks.push(chunk);}
  return JSON.parse(Buffer.concat(chunks));
}
/** Downloads official installers only. QQ changes / OS authorization stay in the official UI. */
export class NativeNapcat {
  task=null;controller=null;closed=false;receipt=null;
  state={phase:'idle',downloaded:0,total:0,error:null};
  constructor({dataDir,platform=process.platform,arch=process.arch,home=homedir(),fetchImpl=fetch,run=execute}={}) {
    Object.assign(this,{dir:join(resolve(dataDir),'napcat-native'),home,fetchImpl,run});this.profile=nativePlatform(platform,arch);
  }
  status(){return {...structuredClone(this.state),profile:this.profile,releasePage:`https://github.com/${this.profile.repo??'NapNeko/NapCatQQ'}/releases/latest`,guide:NATIVE_GUIDE};}
  async check(){
    if(this.task)return this.status();
    this.state.error=null;
    if(this.profile.kind==='unsupported'){this.state.phase='unsupported';return this.status();}
    if(this.profile.platform==='darwin'){
      this.state.qqInstalled=await fs.access('/Applications/QQ.app').then(()=>true,()=>false);
      this.state.componentInstalled=await fs.access(join(this.home,'Library/Containers/com.tencent.qq/Data/Documents/napcat/napcat.mjs')).then(()=>true,()=>false);
    }
    try{
      const saved=JSON.parse(await fs.readFile(join(this.dir,'download.json'),'utf8'));
      if(saved.platform===this.profile.platform&&saved.arch===this.profile.arch){
        const item=nativeAsset({tag_name:saved.asset.tag,assets:[{name:saved.asset.name,size:saved.asset.size,digest:`sha256:${saved.asset.sha256}`,browser_download_url:saved.asset.url}]},this.profile);
        const file=join(this.dir,item.tag,item.name),stat=await fs.stat(file);
        if(stat.size===item.size&&await hashFile(file)===item.sha256){this.receipt=item;Object.assign(this.state,{phase:'downloaded',version:item.tag,assetName:item.name,total:item.size,downloaded:item.size});return this.status();}
      }
    }catch{} // A partial or missing download is not an installed package.
    this.state.phase='ready';return this.status();
  }
  download(){
    if(this.closed)throw new Error('原生安装服务已停止');
    if(this.task)return this.status();
    if(this.profile.kind==='unsupported')throw new Error('当前架构没有已适配的官方原生包');
    this.controller=new AbortController();const signal=this.controller.signal;
    Object.assign(this.state,{phase:'resolving',downloaded:0,total:0,error:null});
    this.task=this.#download(signal).catch(e=>{Object.assign(this.state,{phase:signal.aborted?'cancelled':'error',error:signal.aborted?'下载已取消':e.message?.includes('HTTP')||/校验|发布|安装包/.test(e.message)?e.message:'原生包下载失败，请检查 GitHub 网络后重试'});}).finally(()=>{this.task=null;});
    return this.status();
  }
  async #download(signal){
    const response=await this.fetchImpl(`https://api.github.com/repos/${this.profile.repo}/releases/latest`,{headers:{Accept:'application/vnd.github+json','User-Agent':'BigFish-NapCat-Setup'},signal:AbortSignal.any([signal,AbortSignal.timeout(20_000)]),redirect:'error'});
    const item=nativeAsset(await boundedJson(response),this.profile);signal.throwIfAborted();
    const target=join(this.dir,item.tag);await fs.mkdir(target,{recursive:true,mode:0o700});
    const file=join(target,item.name);
    const cached=await fs.stat(file).then(s=>s.size===item.size,()=>false);
    if(!cached||await hashFile(file)!==item.sha256){
      const temp=file+'.'+randomUUID()+'.part';let handle;
      try{
        const body=await this.fetchImpl(item.url,{signal:AbortSignal.any([signal,AbortSignal.timeout(15*60_000)]),redirect:'follow'});
        if(!body.ok)throw new Error(`安装包下载失败（HTTP ${body.status}）`);
        handle=await fs.open(temp,'wx',0o600);const hash=createHash('sha256');let received=0;
        Object.assign(this.state,{phase:'downloading',version:item.tag,assetName:item.name,total:item.size});
        for await(const chunk of body.body){signal.throwIfAborted();received+=chunk.length;if(received>item.size)throw new Error('安装包大小超出官方记录');hash.update(chunk);await handle.writeFile(chunk);this.state.downloaded=received;}
        signal.throwIfAborted();this.state.phase='verifying';
        if(received!==item.size||hash.digest('hex')!==item.sha256)throw new Error('安装包 SHA-256 校验失败，请重试下载');
        await handle.close();handle=null;await fs.rename(temp,file);
      }finally{await handle?.close();await fs.rm(temp,{force:true});}
    }
    const temp=join(this.dir,`download.${randomUUID()}.tmp`);
    await fs.writeFile(temp,JSON.stringify({platform:this.profile.platform,arch:this.profile.arch,asset:item}),{mode:0o600});await fs.rename(temp,join(this.dir,'download.json'));
    this.receipt=item;Object.assign(this.state,{phase:'downloaded',version:item.tag,assetName:item.name,total:item.size,downloaded:item.size,error:null});
  }
  async #file(){
    if(!this.receipt)await this.check();if(!this.receipt)throw new Error('请先下载原生安装包');
    const file=join(this.dir,this.receipt.tag,this.receipt.name);
    if(await hashFile(file)!==this.receipt.sha256)throw new Error('安装包校验不一致，请重新下载');
    return file;
  }
  async open(){
    const file=await this.#file(),dir=join(this.dir,this.receipt.tag,'unpacked');
    if(this.profile.platform==='darwin'){
      const list=await this.run('/usr/bin/unzip',['-Z1',file],{timeout:10_000,maxBuffer:4*1024**2});
      if(list.stdout.split(/\r?\n/).some(p=>p.startsWith('/')||p.split('/').includes('..')))throw new Error('安装包路径校验失败');
      await fs.mkdir(dir,{recursive:true,mode:0o700});await this.run('/usr/bin/ditto',['-x','-k',file,dir],{timeout:30_000});
      const entries=await fs.readdir(dir,{withFileTypes:true});const app=entries.find(e=>e.isDirectory()&&e.name.endsWith('.app'));
      if(!app)throw new Error('官方安装包中未找到 macOS 安装器');
      await this.run('/usr/bin/open',[join(dir,app.name)],{timeout:10_000});
    }else if(this.profile.platform==='win32'){
      // Paths go through environment variables, never interpolated into PowerShell.
      // Only the official installer handles its own elevation and QQ deployment.
      await this.run('powershell.exe',['-NoProfile','-NonInteractive','-Command',
        "Add-Type -AssemblyName System.IO.Compression.FileSystem; $z=[IO.Compression.ZipFile]::OpenRead($env:BIGFISH_ARCHIVE); try { foreach($e in $z.Entries) { $p=$e.FullName.Replace('\\','/'); if($p.StartsWith('/') -or $p -match '^[A-Za-z]:' -or ($p.Split('/') -contains '..')) { throw 'Unsafe archive path' } } } finally { $z.Dispose() }; Expand-Archive -LiteralPath $env:BIGFISH_ARCHIVE -DestinationPath $env:BIGFISH_UNPACK -Force"],
        {timeout:60_000,env:{...process.env,BIGFISH_ARCHIVE:file,BIGFISH_UNPACK:dir}});
      const files=await fs.readdir(dir,{withFileTypes:true});const installer=files.find(e=>e.isFile()&&e.name.toLowerCase()==='napcatinstaller.exe');
      if(!installer)throw new Error('官方安装包中未找到 Windows 安装器');
      await this.run('powershell.exe',['-NoProfile','-NonInteractive','-Command','Start-Process -FilePath $env:BIGFISH_INSTALLER'],{timeout:10_000,env:{...process.env,BIGFISH_INSTALLER:join(dir,installer.name)}});
    }else await this.run('xdg-open',[join(this.dir,this.receipt.tag)],{timeout:10_000});
    this.state.phase='installer-opened';return this.status();
  }
  async localWebui(){
    if(this.profile.platform!=='darwin')return null;
    // Runtime configuration is distinct from the installer binaries on macOS.
    const files=[join(this.dir,'runtime/config/webui.json'),
      join(this.home,'Library/Application Support/QQ/NapCat/config/webui.json'),
      join(this.home,'Library/Containers/com.tencent.qq/Data/Library/Application Support/QQ/NapCat/config/webui.json'),
      join(this.home,'Library/Containers/com.tencent.qq/Data/Documents/napcat/config/webui.json')];
    for(const file of files){
      let value;try{const stat=await fs.stat(file);if(stat.size>1024**2)continue;value=JSON.parse(await fs.readFile(file,'utf8'));}catch{continue;}
      const port=Number(value.port??6099);
      if(Number.isInteger(port)&&port>=1024&&port<=65535&&typeof value.token==='string'&&value.token&&value.token.length<=8192)return {webuiUrl:`http://127.0.0.1:${port}`,webuiToken:value.token};
    }
    return null;
  }

  cancel(){this.controller?.abort();return this.status();}
  async close(){this.closed=true;this.cancel();await this.task;}
}
