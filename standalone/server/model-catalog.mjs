/** Logical model identity is independent of channel wire ids. Pure, shared by store and routing. */
import {ACCOUNT_CHANNELS,TRAE_CHANNEL} from './channel-state.mjs';
const dateSuffix=/(?:[-_\s](?:20\d{6}|\d{4})|(?<=[a-z])(?:20\d{6}|\d{4}))$/i;
function stripDate(s){const m=s.match(dateSuffix);if(!m)return s;const n=m[0].replace(/^[-_\s]/,'');const mm=Number(n.slice(-4,-2)),dd=Number(n.slice(-2));return mm>=1&&mm<=12&&dd>=1&&dd<=31?s.slice(0,m.index):s;}
function clean(raw){return String(raw??'').normalize('NFKC').trim().toLowerCase().split('/').at(-1).replace(/\s*[·|]?\s*[\d.]+\s*[x×倍]\s*$/i,'').replace(/(?:[-_\s]+official)$/,'').trim();}
export function canonicalModelId(id,name=''){
  for(const raw of [id,name]){
    let s=stripDate(clean(raw)).replace(/[_](?=\d)/g,'.').replace(/[-_\s]+/g,'');
    s=s.replace(/official$/,'');
    const ds=s.match(/(?:^|.*?)(deepseek)v?(\d+(?:\.\d+)*)(flash|pro|chat|reasoner)?(.*)$/);
    if(ds){const tail=stripDate(ds[4]);return `deepseek-v${ds[2]}${ds[3]?`-${ds[3]}`:''}${tail?`-${tail}`:''}`;}
  }
  const raw=/^(?:[sq]model|model[_-]?\d)/i.test(String(id))&&name?name:id;
  return stripDate(clean(raw)).replace(/_/g,'-').replace(/\s+/g,'-').replace(/-+/g,'-');
}
export function modelDisplayName(id){const ds=id.match(/^deepseek-v([\d.]+)(?:-(.*))?$/);return ds?`DeepSeek V${ds[1]}${ds[2]?' '+ds[2].split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' '):''}`:id;}
export function unifiedModels(config){
  const groups=new Map();
  function add(id,name,route){const key=canonicalModelId(id,name);if(!key)return;let g=groups.get(key);if(!g){g={id:key,name:key.startsWith('deepseek-')?modelDisplayName(key):name||id,routes:[]};groups.set(key,g);}if(!g.routes.some(r=>r.channelId===route.channelId&&r.providerId===route.providerId&&r.wireModel===id))g.routes.push({...route,wireModel:id});}
  const t=config.trae;
  if(t&&(t.credential||t.loggedIn)&&!t.authRequired&&t.enabled!==false){for(const m of t.models??[])add(m.id,m.name,{type:'trae',channelId:'trae',channelName:TRAE_CHANNEL.displayName,providerId:config.providers?.find(p=>p.type==='trae')?.id??'trae-cn',source:'remote'});}
  for(const meta of ACCOUNT_CHANNELS){const a=config.accounts?.[meta.id];if(!a||!(a.credential||a.loggedIn)||a.enabled===false)continue;for(const m of a.models??[])add(m.id,m.name,{type:'account',channelId:meta.id,channelName:meta.displayName,providerId:`account-${meta.id}`,source:m.source??'remote',testedAt:a.testedAt});}
  for(const p of config.providers??[]){if(p.enabled&&!['trae','account'].includes(p.type))add(p.model,p.model,{type:p.type,providerId:p.id,channelId:p.id,channelName:p.name,source:'configured'});}
  return [...groups.values()].map(g=>({...g,channelCount:new Set(g.routes.map(r=>r.channelId)).size})).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
}
export function candidatesForModel(config,id){const target=canonicalModelId(id),g=unifiedModels(config).find(m=>m.id===target);if(!g)return[];
  const routes=[...g.routes].sort((a,b)=>Number(b.providerId===config.activeProviderId)-Number(a.providerId===config.activeProviderId)||Number(!!b.testedAt)-Number(!!a.testedAt)||Number(b.source==='remote')-Number(a.source==='remote'));
  // Try at most one alias per channel. Keep its exact wire id, never replace it with the logical id.
  const seen=new Set();return routes.filter(r=>{if(seen.has(r.channelId))return false;seen.add(r.channelId);return true;}).map(r=>{
    const p=['account','trae'].includes(r.type)?{id:r.providerId,type:r.type,channelId:r.channelId,name:r.channelName,enabled:true,model:r.wireModel}:config.providers.find(p=>p.id===r.providerId);
    return {...p,model:r.wireModel,...(config.modelMaxOutputTokens?{maxOutputTokens:config.modelMaxOutputTokens}:{})};
  });
}
