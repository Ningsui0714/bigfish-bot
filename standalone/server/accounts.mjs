/** Local account services. Uses protocol codecs only; no old host, gateway, or account pool. */
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import * as sdk from './vendor/channels.mjs';
import { channelOperation, protocolFetch } from './channel-transport.mjs';
import { ACCOUNT_CHANNELS, accountChannel, normalizeAccounts, publicAccounts } from './channel-state.mjs';
import { shanghaiDay } from './trae.mjs';
const products={lobsterai:sdk.LOBSTERAI,qoder:sdk.QODER,qodercn:sdk.QODER_CN,cline:sdk.CLINE,loomy:sdk.LOOMY,raccoon:sdk.RACCOON,zcode:sdk.ZCODE,minimax:sdk.MINIMAX,gemini:sdk.GEMINI};
const authTypes={codearts:sdk.CodeArtsAuth,lobsterai:sdk.LobsteraiAuth,qoder:sdk.QoderAuth,qodercn:sdk.QoderAuth,cline:sdk.ClineAuth,loomy:sdk.LoomyAuth,raccoon:sdk.RaccoonAuth,minimax:sdk.MinimaxAuth,gemini:sdk.GeminiAuth};
const adapterTypes={codearts:sdk.CodeArtsAdapter,lobsterai:sdk.LobsteraiAdapter,qoder:sdk.QoderAdapter,qodercn:sdk.QoderAdapter,cline:sdk.ClineAdapter,loomy:sdk.LoomyAdapter,raccoon:sdk.RaccoonAdapter,zcode:sdk.ZcodeAdapter,minimax:sdk.MinimaxAdapter,gemini:sdk.GeminiAdapter};
export class AccountError extends Error {constructor(message,code='account-error'){super(message);this.name='AccountError';this.code=code;}}
export class AccountHub {
  sessions=new Map(); epochs=new Map(); locks=new Map(); adapters=new Map(); stopped=false; ticker=null; stopController=new AbortController();
  constructor({store,fetchImpl=fetch,now=Date.now,protocol=sdk}={}){this.store=store;this.fetchImpl=fetchImpl;this.now=now;this.protocol=protocol;}
  state(id){if(!accountChannel(id))throw new AccountError('账号渠道不存在');return normalizeAccounts(this.store.get().accounts)[id];}
  statuses(){const states=publicAccounts(this.store.get().accounts);return ACCOUNT_CHANNELS.map(meta=>({...meta,...states[meta.id],login:this.sessions.get(meta.id)?.public??null}));}
  async patch(id,p){await this.store.patchAccount(id,p);}
  epoch(id){return this.epochs.get(id)??0;}
  valid(id,epoch){if(this.stopped||this.epoch(id)!==epoch)throw new AccountError('本次账号操作已取消','cancelled');}
  async run(id,purpose,fn,signal){
    const epoch=this.epoch(id);
    signal=AbortSignal.any([this.stopController.signal,...(signal?[signal]:[])]);
    const op={id,purpose,fetchImpl:this.fetchImpl,signal,inferenceSent:false,accepted:false};
    try{return await channelOperation.run(op,fn);}catch(e){
      if(e?.code==='cancelled'||signal?.aborted)throw new AccountError('操作已取消','cancelled');
      const status=e?.status;const detail=Number.isInteger(status)?`（HTTP ${status}）`:e?.code&&/^[A-Z_0-9-]{1,50}$/.test(e.code)?`（${e.code}）`:'';
      let raw=e?.message??'';for(const value of Object.values(this.state(id).credential??{}))if(typeof value==='string'&&value.length>8)raw=raw.replaceAll(value,'[已隐藏]');
      raw=raw.replace(/https?:\/\/[^\s]+/g,'[厂商地址]');
      const error=e instanceof AccountError?new AccountError(raw,e.code):new AccountError(`${accountChannel(id).name} ${purpose==='chat'?'聊天调用':purpose==='login'?'授权':purpose==='models'?'模型目录':'账号请求'}失败${detail}${raw?`：${raw}`:''}`);
      if(op.accepted||(op.inferenceSent&&op.lastInferenceStatus===undefined)||e?.noFallback)error.noFallback=true;
      if(this.epoch(id)===epoch)await this.patch(id,{lastError:error.message}).catch(()=>{});throw error;
    }
  }
  service(id,epoch=this.epoch(id)){
    const Type=authTypes[id];if(!Type)return null;
    const ctx={logger:{info(){},warn(){},error(){}},credentials:{
      resolve:async()=>{const c=this.state(id).credential;return c?{value:JSON.stringify(c)}:undefined;},
      describe:async()=>({configured:!!this.state(id).credential,source:'bigfish-local'}),
      set:async(_ref,value)=>{this.valid(id,epoch);await this.patch(id,{credential:JSON.parse(value)});},
      delete:async()=>{this.valid(id,epoch);await this.patch(id,{credential:null});},
    }};
    return new Type(ctx,{product:products[id],fetcher:protocolFetch,fetchImpl:protocolFetch,callbackPort:0});
  }
  async credential(id){const c=this.state(id).credential;if(!c)throw new AccountError('请先完成该厂商账号登录','auth-required');return c;}
  async refresh(id){
    const key=id+':refresh';if(this.locks.has(key))return this.locks.get(key);
    const epoch=this.epoch(id);const task=this.run(id,'refresh',async()=>{
      const c=await this.credential(id),auth=this.service(id,epoch);let next;
      if(auth?.refreshCredential)next=await auth.refreshCredential(c);
      else if(auth?.refreshCredentialFor)next=await auth.refreshCredentialFor(c);
      else if(auth?.refreshAccountCredential){await auth.refreshAccountCredential(products[id]?.defaultCredentialRef);next=this.state(id).credential;}
      else throw new AccountError('该厂商不支持静默续期，请重新授权');
      this.valid(id,epoch);if(next)await this.patch(id,{credential:next,lastError:null});return this.statuses().find(s=>s.id===id);
    }).finally(()=>this.locks.delete(key));this.locks.set(key,task);return task;
  }
  async startFlow(id,signal){const p=products[id],options={product:p,fetcher:protocolFetch,signal};const api=this.protocol;
    if(id==='codearts')return api.startOAuthFlow(options);
    if(id==='lobsterai')return api.startLobsteraiLoginFlow({...options,clientVersion:await this.service(id).resolveClientVersion()});
    if(id==='qoder'||id==='qodercn')return api.startQoderLoginFlow(options);
    if(id==='cline')return api.startClineLoginFlow(options);
    if(id==='loomy')return api.startLoomyWechatLoginFlow(options);
    if(id==='raccoon')return api.startRaccoonLoginFlow(options);
    if(id==='gemini')return api.startGeminiOAuthFlow({...options,callbackPort:0});
    if(id==='minimax'){const auth=await api.startMinimaxDeviceAuthorization(protocolFetch,p);return {loginUrl:auth.verificationUriComplete,userCode:auth.userCode,result:api.pollMinimaxDeviceToken(auth,{...options,signal}),close:()=>{}};}
    if(id==='zcode'){
      const flow=await api.startZcodeLogin(protocolFetch,{appVersion:p.appVersionFallback});
      const result=(async()=>{const end=this.now()+300_000;while(this.now()<end){signal.throwIfAborted();const o=await api.pollZcodeLogin(flow,protocolFetch,p.appVersionFallback);
        if(o.kind==='ready'){const r=o.result;return {zcode_jwt:r.zcodeJwt,device_mid:this.state(id).identity??randomUUID(),user_id:r.userId,account_label:r.displayName,bigmodel_access_token:r.bigmodelAccessToken,zai_access_token:r.zaiAccessToken,bigmodel_refresh_token:r.bigmodelRefreshToken};}
        if(o.kind==='failed')throw new AccountError('ZCode 授权被拒绝，请在厂商页面确认');await delay(flow.pollIntervalSec*1000,null,{signal});}throw new AccountError('授权等待超时');})();
      return {loginUrl:flow.authorizeUrl,result,close:()=>{}};
    }
    throw new AccountError('未知登录方式');
  }
  async login(id){this.state(id);await this.cancel(id);const epoch=this.epoch(id),controller=new AbortController();
    const session={controller,public:{state:'preparing',expiresAt:this.now()+600_000},close:()=>{}};this.sessions.set(id,session);
    try{return await this.run(id,'login',async()=>{
      const flow=await this.startFlow(id,controller.signal);session.close=flow.close??(()=>{});this.valid(id,epoch);
      const target=new URL(flow.loginUrl);if(target.protocol!=='https:'&&!(target.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(target.hostname)))throw new AccountError('厂商授权地址格式异常');
      session.public={state:'waiting',url:flow.loginUrl,userCode:flow.userCode??'',expiresAt:this.now()+600_000};
      session.timer=setTimeout(()=>{if(this.sessions.get(id)===session)void this.cancel(id);},600_000);session.timer.unref();
      const resultPromise=new Promise((resolve,reject)=>{const abort=()=>reject(new AccountError('操作已取消','cancelled'));controller.signal.addEventListener('abort',abort,{once:true});Promise.resolve(flow.result).then(resolve,reject).finally(()=>controller.signal.removeEventListener('abort',abort));});
      session.task=resultPromise.then(async result=>{
        this.valid(id,epoch);let credential=result?.access?JSON.parse(result.access):result;
        if(id==='raccoon'){const info=await this.protocol.fetchRaccoonUserInfo(products[id],credential,protocolFetch).catch(()=>null);if(info)credential={...credential,...(info.officeIdentity?{office_identity:info.officeIdentity}:{}),...(info.nickname?{nickname:info.nickname}:{}),...(info.userId?{user_id:info.userId}:{})};}
        if(id==='zcode'){credential={...credential,app_version:products[id].appVersionFallback,source:'plugin'};const key=await this.protocol.fetchCodingPlanApiKey(credential,protocolFetch).catch(()=>null);if(key?.key)credential={...credential,[credential.zai_access_token?'coding_plan_key_zai':'coding_plan_key_bigmodel']:key.key};}
        if(id==='loomy')credential={access_token:result.session,userid:result.userid,phone:result.phone,nickname:result.nickname,expires_at:String(this.now()+1_209_600_000)};
        if(!credential||typeof credential!=='object'||!(credential.access_token||credential.access_key_id||credential.zcode_jwt))throw new AccountError('授权完成但缺少登录凭据');
        this.valid(id,epoch);await this.patch(id,{credential,identity:credential.machine_id??credential.device_mid??this.state(id).identity,models:[],balance:null,checkin:null,testedAt:null,lastError:null});this.adapters.delete(id);
      }).catch(async e=>{if(this.epoch(id)===epoch&&!controller.signal.aborted)await this.patch(id,{lastError:e instanceof AccountError?e.message:'授权未完成或已超时，请重新打开厂商登录页'}).catch(()=>{});})
        .finally(()=>{clearTimeout(session.timer);void Promise.resolve().then(()=>session.close()).catch(()=>{});if(this.sessions.get(id)===session)this.sessions.delete(id);});
      return session.public;
    },controller.signal);}catch(e){if(this.sessions.get(id)===session)await this.cancel(id);throw e;}
  }
  async cancel(id){const s=this.sessions.get(id);this.epochs.set(id,this.epoch(id)+1);if(s){this.sessions.delete(id);clearTimeout(s.timer);s.controller.abort();await s.close();await s.task;}}
  async logout(id){await this.cancel(id);this.adapters.delete(id);await this.patch(id,{credential:null,models:[],balance:null,checkin:null,autoCheckin:false,lastError:null,testedAt:null});}
  async remoteModels(id){const c=await this.credential(id),p=products[id],auth=this.service(id);
    if(id==='codearts')return this.protocol.fetchCodeArtsRemoteModels(c,protocolFetch);
    if(id==='cline'){const r=await this.protocol.fetchClineRemoteModels(p,{credential:c,fetcher:protocolFetch});const list=[...(r.entries??[])];for(const item of r.remoteIds??[]){const id=typeof item==='string'?item:item.id;if(id&&!list.some(m=>m.id===id))list.push({id,name:id});}return list;}
    if(id==='lobsterai'||id==='raccoon')return auth.fetchModels();
    if(id==='minimax')return auth.fetchRemoteModelsOnly();
    if(id==='loomy'){const r=await protocolFetch(`${p.apiBase}/models`,{headers:{Accept:'application/json',token:c.access_token}});if(!r.ok)throw new AccountError(`模型目录 HTTP ${r.status}`);return this.protocol.parseLoomyRemoteModels(await r.json());}
    if(id==='zcode')return this.protocol.fetchZcodeModels(c,protocolFetch);
    return null; // Qoder and Gemini use the protocol snapshot's explicit catalogs.
  }
  adapter(id){if(this.adapters.has(id))return this.adapters.get(id);
    const options={product:products[id],fetchImpl:protocolFetch,...(id==='lobsterai'?{resolveClientVersion:()=>this.service(id).resolveClientVersion()}:{}),resolveCredential:()=>this.credential(id),refresh:()=>this.refresh(id),
      // Never start the old automated browser/captcha subsystem.
      mintCaptcha:async()=>{throw new AccountError('厂商要求交互验证，请先在官方客户端完成验证再重试');},
      fetchRemoteModels:async()=>{const list=await this.remoteModels(id);return Array.isArray(list)?list:[];},
    };
    const a=new adapterTypes[id](options);this.adapters.set(id,a);return a;
  }
  async models(id){const epoch=this.epoch(id);return this.run(id,'models',async()=>{
    await this.credential(id);this.adapters.delete(id);const a=this.adapter(id);let remote=await this.remoteModels(id),source='remote';
    let list;if(remote===null){list=await a.listModels(id);source='snapshot';}
    else {if(!Array.isArray(remote)&&remote&&typeof remote==='object')remote=remote.models??remote.entries??[];
      if(!remote?.length)throw new AccountError('厂商模型目录未返回可用结果；保留上次列表，可稍后重新获取');a.remoteModels=remote;list=remote;}
    const models=list.filter(m=>typeof m?.id==='string').map(m=>({id:m.id,name:m.name??m.displayName??m.id,source}));
    if(!models.length)throw new AccountError('模型目录为空');this.valid(id,epoch);await this.patch(id,{models,lastError:null});return models;
  });}
  async balance(id){const epoch=this.epoch(id);return this.run(id,'balance',async()=>{const c=await this.credential(id),p=products[id],f=protocolFetch;let balance;
    if(id==='codearts'){const r=await this.protocol.fetchCodeArtsAccountInfoDetailed(c,f);if(r?.ok===false)throw new AccountError(r.message||'额度查询失败');balance=r?.info?.credit??r?.balance??r?.creditBalance??r;}
    else if(id==='lobsterai')balance=await this.protocol.fetchLobsteraiCreditBalance(c,p,f);
    else if(id==='qoder'||id==='qodercn')balance=await this.protocol.fetchQoderCreditBalance(c,p,f);
    else if(id==='cline')balance=await this.protocol.fetchClineCreditBalance(c,p,f);
    else if(id==='loomy')balance=await this.protocol.fetchLoomyCreditBalance(c,p,f);
    else if(id==='raccoon')balance=await this.protocol.fetchRaccoonCreditBalance(p,c,f);
    else if(id==='zcode')balance=await this.protocol.fetchZcodeBalance(c,f);
    else if(id==='minimax')balance=await this.protocol.fetchMinimaxCreditBalance(c,f,p);
    else if(id==='gemini')balance=await this.protocol.fetchGeminiCreditBalance(c,p,{fetcher:f});
    if(balance?.error)throw new AccountError(balance.error);
    balance=balance?.balance??balance;
    // Only retain display amounts; never store upstream envelopes, URLs, or tokens in public state.
    const clean={total:Number.isFinite(balance?.total)?balance.total:null,updatedAt:new Date(this.now()).toISOString()};
    this.valid(id,epoch);await this.patch(id,{balance:clean,lastError:null});return clean;
  });}
  async checkin(id){if(!accountChannel(id)?.daily)throw new AccountError('该渠道没有独立的每日签到接口');const key=id+':checkin';if(this.locks.has(key))return this.locks.get(key);
    const epoch=this.epoch(id),task=this.run(id,'checkin',async()=>{const state=this.state(id),day=shanghaiDay(this.now());if(state.checkin?.day===day&&(!['inactive','status-error'].includes(state.checkin.phase)||state.checkin.retryAt>this.now()))return state.checkin;
      const c=await this.credential(id),p=products[id],f=protocolFetch;const op=channelOperation.getStore();
      op.onClaim=async()=>{this.valid(id,epoch);await this.patch(id,{checkin:{day,phase:'claiming',message:'领取已提交，正在确认结果'}});};
      let r;
      if(id==='codearts')r=await this.protocol.claimCodeArtsDailyCheckin(c,f);
      if(id==='lobsterai')r=await this.protocol.claimLobsteraiDailyCheckin(c,p,await this.service(id).resolveClientVersion(),f);
      if(id==='qoder'||id==='qodercn')r=await this.protocol.claimQoderDailyCheckin(c,p,f,this.now());
      if(id==='loomy')r=await this.protocol.claimLoomyDailyQuota(c,p,f);
      if(id==='minimax'){const status=await this.protocol.fetchMinimaxSigninStatus(c,f,p);if(!status)throw new AccountError('签到状态未返回，请稍后重查');r=status.todayCheckedIn?{kind:'already-claimed'}:status.active===false?{kind:'inactive'}:await this.protocol.claimMinimaxDailyCheckin(c,f,p);}
      this.valid(id,epoch);const success=['claimed','already-claimed'].includes(r?.kind)||r?.ok===true||r?.claimed===true||r?.alreadyClaimed===true;
      const checkin={day,phase:success?'claimed':r?.kind==='inactive'?'inactive':op.claimSent?'uncertain':'status-error',retryAt:success||op.claimSent?0:this.now()+900_000,message:success?'今日签到已完成':r?.kind==='inactive'?'当前没有可领取活动，稍后重新查询':'厂商未确认领取成功，请稍后查看'};
      await this.patch(id,{checkin,lastError:null});return checkin;
    }).catch(async e=>{if(this.epoch(id)===epoch){const submitted=this.state(id).checkin?.day===shanghaiDay(this.now())&&this.state(id).checkin?.phase==='claiming';await this.patch(id,{checkin:{day:shanghaiDay(this.now()),phase:submitted?'uncertain':'status-error',retryAt:submitted?0:this.now()+900_000,message:submitted?'领取结果待确认，不自动重复提交':'状态查询失败，稍后重试'}});}throw e;}).finally(()=>this.locks.delete(key));this.locks.set(key,task);return task;}
  async chat(provider,messages,{signal}={}){const id=provider.channelId,epoch=this.epoch(id),key=id+':chat';if(this.locks.has(key))throw new AccountError('该账号正在回复上一条消息');
    const task=this.run(id,'chat',async()=>{
      await this.credential(id);if(!this.state(id).models.length)await this.models(id);
      if(!this.state(id).models.some(m=>m.id===provider.model))throw new AccountError('请从该账号模型列表中选择模型');
      const a=this.adapter(id),system=messages.filter(m=>m.role==='system').map(m=>m.content).join('\n');
      const wire=messages.filter(m=>m.role!=='system').map(m=>({role:m.role,content:[{type:'text',text:m.content}]}));
      let text='',finished=false;
      for await(const chunk of a.stream({model:provider.model,messages:wire,system,tools:[],signal,maxTokens:provider.maxOutputTokens??undefined})){
        if(chunk.type==='text-delta')text+=chunk.text??'';if(chunk.type==='finish')finished=true;
      }
      this.valid(id,epoch);if(!finished||!text.trim())throw new AccountError('厂商回复未正常结束或没有文字内容');
      await this.patch(id,{testedAt:new Date(this.now()).toISOString(),lastError:null});return text.trim();
    },signal).finally(()=>this.locks.delete(key));this.locks.set(key,task);return task;
  }
  async tick(){for(const m of ACCOUNT_CHANNELS){const s=this.state(m.id);if(s.autoCheckin&&s.credential&&(s.checkin?.day!==shanghaiDay(this.now())||(['inactive','status-error'].includes(s.checkin?.phase)&&s.checkin.retryAt<=this.now())))await this.checkin(m.id).catch(()=>{});}}
  start(){this.ticker=setInterval(()=>void this.tick(),60_000);this.ticker.unref();void this.tick();}
  async stop(){this.stopped=true;this.stopController.abort();clearInterval(this.ticker);await Promise.all([...this.sessions.keys()].map(id=>this.cancel(id)));for(const m of ACCOUNT_CHANNELS)this.epochs.set(m.id,this.epoch(m.id)+1);await Promise.allSettled([...this.locks.values()]);for(const a of this.adapters.values())a.stop?.();}
}
