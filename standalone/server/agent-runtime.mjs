import {scopePersona} from './persona-scope.mjs';
/** BigFish's own session and hook runtime. No AstrBot source is embedded. */
export const AGENT_STAGES=['access','deduplicate','command','participation','queue','context','before-model','model','after-model','delivery','history','after-delivery'];
const integer=(v,d,min,max)=>Number.isFinite(v)?Math.min(max,Math.max(min,Math.floor(v))):d;
export function normalizeAgentSettings(v={}){
  return {historyEnabled:v?.historyEnabled!==false,historyTurns:integer(v?.historyTurns,12,1,24),historyTtlHours:integer(v?.historyTtlHours,24,1,168),commandsEnabled:v?.commandsEnabled!==false};
}
export function normalizeConversations(value,settings,now=Date.now()){
  const cfg=normalizeAgentSettings(settings);if(!cfg.historyEnabled||!Array.isArray(value))return [];
  const unique=new Map();let size=0;
  for(const x of value){
    if(!x||typeof x.scope!=='string'||!x.scope||x.scope.length>400||typeof x.sender!=='string'||!x.sender||x.sender.length>128||!Array.isArray(x.turns))continue;
    const turns=x.turns.filter(t=>t&&Number.isFinite(t.at)&&t.at<=now&&now-t.at<cfg.historyTtlHours*3600000&&typeof t.user==='string'&&typeof t.assistant==='string'&&t.user&&t.assistant)
      .slice(-cfg.historyTurns).map(t=>({at:t.at,user:t.user.slice(0,30000),assistant:t.assistant.slice(0,12000)}));
    while(turns.length>1&&JSON.stringify(turns).length>24000)turns.shift();
    if(turns.length)unique.set(JSON.stringify([x.scope,x.sender]),{scope:x.scope,sender:x.sender,turns});
  }
  const result=[];
  for(const x of [...unique.values()].sort((a,b)=>b.turns.at(-1).at-a.turns.at(-1).at)){
    const n=JSON.stringify(x).length;if(result.length>=128||size+n>262144)continue;size+=n;result.push(x);
  }
  return result;
}
export class ConversationSessions {
  constructor(store){this.store=store;}
  history(scope,sender){const c=this.store.get();return normalizeConversations((c.conversations??[]).filter(x=>scopePersona(x.scope)===(c.activePersonaId??'default')),c.agent).find(x=>x.scope===scope&&x.sender===sender)?.turns??[];}
  messages(scope,sender){return this.history(scope,sender).flatMap(t=>[{role:'user',content:t.user},{role:'assistant',content:t.assistant}]);}
  async commit(message,text,signal){
    await this.store.appendConversation(message.groupOpenid,message.senderId,{at:Date.now(),user:JSON.stringify({sender:message.senderId,name:message.senderName,text:message.content}),assistant:text},signal);
  }
  clear(scope,sender){return this.store.clearConversation(scope,sender);}
  status(){const c=this.store.get(),sessions=normalizeConversations((c.conversations??[]).filter(x=>scopePersona(x.scope)===(c.activePersonaId??'default')),c.agent);return {count:sessions.length,turns:sessions.reduce((n,x)=>n+x.turns.length,0)};}
}
const HOOKS=new Set(['command','beforeModel','afterModel','afterDelivery']);
/** Extensions are trusted in-process developer modules, not AstrBot Python plugins. */
export class AgentPlugins {
  #plugins=[];
  register(plugin){
    if(!plugin||!/^[a-z][a-z0-9-]{0,63}$/.test(plugin.id)||this.#plugins.some(p=>p.id===plugin.id))throw new Error('插件标识无效或重复');
    for(const [hook,fn]of Object.entries(plugin.hooks??{}))if(!HOOKS.has(hook)||typeof fn!=='function')throw new Error('插件钩子无效');
    const p={...plugin,hooks:{...plugin.hooks},priority:Number(plugin.priority)||0};this.#plugins.push(p);this.#plugins.sort((a,b)=>b.priority-a.priority);
    return ()=>{this.#plugins=this.#plugins.filter(x=>x!==p);};
  }
  status(){return this.#plugins.map(p=>({id:p.id,name:String(p.name||p.id).slice(0,80),hooks:Object.keys(p.hooks),commands:(p.commands??[]).filter(x=>typeof x==='string').slice(0,16)}));}
  async run(hook,context){for(const p of this.#plugins){context.signal?.throwIfAborted();const result=await p.hooks[hook]?.(context);context.signal?.throwIfAborted();if(hook==='command'&&result?.handled)return result;}return null;}
}
export const builtinCommands={id:'conversation-commands',name:'会话与记忆命令',commands:['/help','/reset','/status','/memory'],priority:100,hooks:{command:async ctx=>{
  if(!ctx.addressed||!ctx.message.content.startsWith('/')||!ctx.commandsEnabled)return null;
  const command=ctx.message.content.trim().toLowerCase();
  const reply=text=>({handled:true,text,reason:'command'});
  if(command==='/help'||command==='/帮助')return reply('大肥鱼在呢～\n/reset 或 /new：开启新话题，保留明确记忆\n/memory：看看我记住了什么\n/status：查看当前会话状态\n也可以直接说“记住：…”、“忘记我”或“安静”。');
  if(['/reset','/new','/新对话'].includes(command)){await ctx.resetConversation();return reply('好，换个新话题～刚才的短期对话已清空，你明确让我记住的事还在。');}
  if(command==='/memory')return reply(ctx.memories.length?ctx.memories.map(m=>`· ${m.text}`).join('\n'):'还没有你让我记住的事。');
  if(command==='/status')return reply(`大肥鱼在线 · ${ctx.historyTurns} 轮短期对话 · ${ctx.memories.length} 条明确记忆\n${ctx.historyEnabled?'会话在本机加密保存':'短期会话记录已关闭'}。`);
  return reply('这个命令我还不认识，发 /help 看看我会什么。');
}}};
export function abortable(promise,signal){
  if(signal.aborted)return Promise.reject(signal.reason);
  return new Promise((resolve,reject)=>{const abort=()=>reject(signal.reason);signal.addEventListener('abort',abort,{once:true});Promise.resolve(promise).then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));});
}
