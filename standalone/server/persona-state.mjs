import {normalizeQqGroupChatbotConfig} from '../../src/channels/qq/qq-mention.mjs';
import {normalizeSocialMemory} from '../../src/channels/qq/group-mind.mjs';
import {normalizeAgentSettings,normalizeConversations} from './agent-runtime.mjs';
import {DEFAULT_PERSONA_ID,scopePersona} from './persona-scope.mjs';
export function mergePersonas(input,current,next,{allowRemoval=false}={}){
  const existing=current.personas?.length?current.personas:[{id:DEFAULT_PERSONA_ID,name:'大肥鱼',kind:'persona',persona:current.persona,agent:current.agent}];
  const list=input.personas??existing;
  if(!Array.isArray(list)||!list.length||list.length>16)throw new Error('人格 / 模板需保留 1～16 项');
  const ids=new Set();
  const profiles=list.map(p=>{
    if(!p||typeof p.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(p.id)||ids.has(p.id))throw new Error('人格标识无效或重复');ids.add(p.id);
    if(typeof p.name!=='string'||!p.name.trim()||p.name.trim().length>80)throw new Error('请填写 1～80 字的人格 / 模板名称');
    if(!['persona','template'].includes(p.kind??'persona'))throw new Error('人格类型请选择人格或模板');
    const old=existing.find(x=>x.id===p.id);
    return {id:p.id,name:p.name.trim(),kind:p.kind??'persona',persona:{...normalizeQqGroupChatbotConfig(p.persona??old?.persona??{})},agent:normalizeAgentSettings(p.agent??old?.agent)};
  });
  if(!allowRemoval&&existing.some(p=>!ids.has(p.id)))throw new Error('删除人格 / 模板请使用专门的删除入口');
  const active=input.activePersonaId??current.activePersonaId??DEFAULT_PERSONA_ID;
  const profile=profiles.find(p=>p.id===active);if(!profile)throw new Error('所选人格 / 模板不存在');
  if(input.persona!==undefined)profile.persona={...normalizeQqGroupChatbotConfig(input.persona)};
  if(input.agent!==undefined)profile.agent=normalizeAgentSettings({...profile.agent,...input.agent});
  next.personas=profiles;next.activePersonaId=active;next.persona=structuredClone(profile.persona);next.agent=structuredClone(profile.agent);
  return next;
}
export function personaMemories(value,data){
  return (data.personas??[]).flatMap(p=>normalizeSocialMemory((Array.isArray(value)?value:[]).filter(m=>scopePersona(m?.room)===p.id)));
}
export function personaConversations(value,data){
  const list=Array.isArray(value)?value:[];
  const groups=(data.personas??[]).flatMap(p=>normalizeConversations(list.filter(x=>scopePersona(x?.scope)===p.id),p.agent));
  return normalizeConversations(groups,{historyEnabled:true,historyTurns:24,historyTtlHours:168});
}

export function removePersona(data,id){
  if(typeof id!=='string'||!data.personas.some(p=>p.id===id))throw new Error('人格 / 模板不存在，请刷新列表');
  if(data.personas.length<=1)throw new Error('至少保留一个人格或模板，最后一项不能删除');
  const personas=data.personas.filter(p=>p.id!==id);
  const activePersonaId=data.activePersonaId===id?(personas.find(p=>p.id===DEFAULT_PERSONA_ID)??personas.find(p=>p.kind==='persona')??personas[0]).id:data.activePersonaId;
  const active=personas.find(p=>p.id===activePersonaId);
  return {...data,personas,activePersonaId,persona:structuredClone(active.persona),agent:structuredClone(active.agent),
    memories:data.memories.filter(m=>scopePersona(m.room)!==id),conversations:data.conversations.filter(c=>scopePersona(c.scope)!==id)};
}
