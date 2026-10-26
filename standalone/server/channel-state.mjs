export const ACCOUNT_CHANNELS = Object.freeze([
  {id:'codearts',name:'CodeArts',brand:'华为云',loginKind:'浏览器授权',daily:true},
  {id:'lobsterai',name:'LobsterAI',chineseName:'有道龙虾',brand:'网易有道',loginKind:'浏览器授权',daily:true},
  {id:'zcode',name:'ZCode',brand:'智谱',loginKind:'浏览器授权',daily:false},
  {id:'cline',name:'Cline',chineseName:'开源编程助手',brand:'Cline Bot Inc.',loginKind:'设备码',daily:false},
  {id:'loomy',name:'Loomy',brand:'科大讯飞',loginKind:'微信扫码',daily:true},
  {id:'raccoon',name:'Raccoon',chineseName:'小浣熊',brand:'商汤科技',loginKind:'扫码 / 短信',daily:false},
  {id:'minimax',name:'MiniMax Code',brand:'稀宇科技',loginKind:'设备码',daily:true},
  {id:'gemini',name:'Gemini Code Assist',brand:'谷歌 Google',loginKind:'浏览器授权',daily:false},
  {id:'qoder',name:'Qoder',brand:'阿里云',loginKind:'浏览器授权',daily:true},
  {id:'qodercn',name:'Qoder 中国版',brand:'阿里云',loginKind:'浏览器授权',daily:true},
].map(p=>Object.freeze({...p,displayName:`${p.name}${p.chineseName?' · '+p.chineseName:''} · ${p.brand}`})));
export const TRAE_CHANNEL=Object.freeze({id:'trae',name:'TRAE',brand:'字节跳动',loginKind:'浏览器授权',daily:true,displayName:'TRAE · 字节跳动'});
export const accountChannel = id => ACCOUNT_CHANNELS.find(p=>p.id===id);
export const accountDefaults = () => ({credential:null,identity:null,models:[],balance:null,checkin:null,autoCheckin:false,enabled:true,lastError:null,testedAt:null});
export function normalizeAccounts(input) {
  const out={};
  for(const meta of ACCOUNT_CHANNELS){const p=input?.[meta.id]??{},d=accountDefaults();
    d.credential=p.credential&&typeof p.credential==='object'&&!Array.isArray(p.credential)?structuredClone(p.credential):null;
    d.identity=typeof p.identity==='string'?p.identity:null;
    d.models=Array.isArray(p.models)?p.models.filter(m=>typeof m?.id==='string').map(m=>({id:m.id,name:typeof m.name==='string'?m.name:m.id,source:m.source==='remote'?'remote':'snapshot'})):[];
    d.balance=p.balance&&typeof p.balance==='object'?structuredClone(p.balance):null;
    d.checkin=p.checkin&&/^\d{4}-\d{2}-\d{2}$/.test(p.checkin.day)?structuredClone(p.checkin):null;
    d.enabled=p.enabled!==false;d.autoCheckin=meta.daily&&p.autoCheckin===true;d.lastError=typeof p.lastError==='string'?p.lastError:null;d.testedAt=typeof p.testedAt==='string'?p.testedAt:null;out[meta.id]=d;
  } return out;
}
export function publicAccounts(input){const out={};for(const [id,p] of Object.entries(normalizeAccounts(input))){out[id]={...p,credential:undefined,identity:undefined,loggedIn:!!p.credential,nickname:p.credential?.nickname||p.credential?.display_name||p.credential?.account_label||p.credential?.user_name||'',refreshable:!!(p.credential?.refresh_token||p.credential?.bigmodel_refresh_token)};}return out;}
