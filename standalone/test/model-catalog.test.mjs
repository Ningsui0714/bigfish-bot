import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalModelId,unifiedModels,candidatesForModel} from '../server/model-catalog.mjs';
import {defaults,mergeConfig} from '../server/store.mjs';
import {generate} from '../server/providers.mjs';
const models=[{id:'deepseek-v4.1-flash',name:'DeepSeek V4.1 Flash'},{id:'DeepSeek-V4.1-Flash-1017',name:'DeepSeek V4.1 Flash 1017'}];
const config=()=>({...defaults(),activeModelId:'deepseek-v4.1-flash',activeProviderId:'trae-cn',trae:{loggedIn:true,enabled:true,models:[models[0]]},accounts:{zcode:{loggedIn:true,enabled:true,models:[models[1]]}}});
test('DeepSeek case, whitespace, separators, namespaces, and valid date suffixes share one logical id',()=>{
 for(const id of ['deepseek-v4.1-flash','DeepSeek V4.1 Flash','deepseekv4.1flash1017','deepseek-v4.1-flash-1017','deepseek-v4.1-flash-20261017','deepseek_v4_1_flash','cline-free/deepseek-v4.1-flash','DeepSeek-V4.1-Flash-Official'])assert.equal(canonicalModelId(id),'deepseek-v4.1-flash',id);
 assert.equal(canonicalModelId('opaque','DeepSeek V4.1 Flash 1017'),'deepseek-v4.1-flash');
});
test('different generations, Pro, vision, and preview never silently merge with Flash',()=>{
 const ids=['deepseek-v4-flash','deepseek-v4.1-pro','deepseek-v4.1-flash-vision','deepseek-v4.1-flash-preview','deepseek-v3.2'];
 for(const id of ids)assert.notEqual(canonicalModelId(id),'deepseek-v4.1-flash');
 assert.equal(canonicalModelId('glm-5.3-flash-1017'),'glm-5.3-flash');
 assert.notEqual(canonicalModelId('gpt-4-1399'),'gpt-4');
});
test('TRAE and ZCode aliases form one UI entry and preserve every native wire id',()=>{
 const list=unifiedModels(config());assert.equal(list.length,1);assert.equal(list[0].name,'DeepSeek V4.1 Flash');assert.equal(list[0].channelCount,2);assert.deepEqual(new Set(list[0].routes.map(r=>r.wireModel)),new Set(models.map(m=>m.id)));
 const routes=candidatesForModel(config(),'DeepSeek V4.1 Flash 1017');assert.equal(routes[0].type,'trae');assert.equal(routes[1].channelId,'zcode');assert.equal(routes[1].model,models[1].id);
});
test('unlogged or disabled channels never appear as a usable route and credentials never reach catalog',()=>{
 const c=config();c.accounts.zcode={...c.accounts.zcode,enabled:false,credential:{access_token:'fixture-secret'}};
 let list=unifiedModels(c);assert.equal(list[0].channelCount,1);assert.ok(!JSON.stringify(list).includes('fixture-secret'));
 c.trae.loggedIn=false;assert.equal(unifiedModels(c).length,0);
});
test('same model automatically routes to a second channel only before accepted output',async()=>{
 const c=config();const seen=[];
 const result=await generate(c,[{role:'user',content:'hello'}],{trae:{chat:async p=>{seen.push(p.model);throw new Error('preflight rejected');}},accounts:{chat:async p=>{seen.push(p.model);return '统一模型回复';}}});
 assert.equal(result.text,'统一模型回复');assert.equal(result.providerId,'account-zcode');assert.equal(result.modelId,'deepseek-v4.1-flash');assert.deepEqual(seen,[models[0].id,models[1].id]);
});
test('accepted output failure does not fan out into another channel and consume credits again',async()=>{
 let backup=0;await assert.rejects(generate(config(),[],{trae:{chat:async()=>{const e=new Error('stream cut');e.noFallback=true;throw e;}},accounts:{chat:async()=>{backup++;return 'unexpected';}}}),/stream cut/);assert.equal(backup,0);
});
test('logical model selection never falls back to another model family',async()=>{
 const c=config();c.activeModelId='deepseek-v4.1-pro';let sent=0;await assert.rejects(generate(c,[],{trae:{chat:async()=>{sent++;return 'wrong';}}}),/暂无/);assert.equal(sent,0);
});
test('duplicate aliases within a channel are grouped but inference visits that channel at most once',()=>{
 const c=config();c.trae.models=models;const g=unifiedModels(c)[0];assert.equal(g.routes.length,3);assert.equal(g.channelCount,2);assert.equal(candidatesForModel(c,g.id).length,2);
});
test('API and Ollama share logical groups without forwarding credentials or changing their model ids',()=>{
 const c=config();c.providers=[{id:'custom',type:'compatible',name:'自有接口',model:'DeepSeek-V4.1-Flash-1017',enabled:true,apiKey:'fixture-key',baseUrl:'https://example.test/v1'}];
 const g=unifiedModels(c)[0];assert.equal(g.channelCount,3);assert.ok(!JSON.stringify(g).includes('fixture-key'));
 assert.equal(candidatesForModel(c,g.id).find(p=>p.id==='custom').apiKey,'fixture-key');
});
test('model selection and output budget persist independently of account management',()=>{
 const c=mergeConfig({activeModelId:'DeepSeek V4.1 Flash 1017',modelMaxOutputTokens:'4096',accounts:{zcode:{enabled:false}}},defaults());assert.equal(c.activeModelId,'deepseek-v4.1-flash');assert.equal(c.modelMaxOutputTokens,4096);assert.equal(c.accounts.zcode.enabled,false);assert.equal(candidatesForModel({...config(),modelMaxOutputTokens:4096},c.activeModelId)[0].maxOutputTokens,4096);
});

test('Chinese labels and vendor names never change saved channel ids or wire models',async()=>{
 const {ACCOUNT_CHANNELS,TRAE_CHANNEL}=await import('../server/channel-state.mjs');
 assert.equal(TRAE_CHANNEL.id,'trae');assert.equal(TRAE_CHANNEL.displayName,'TRAE · 字节跳动');
 assert.equal(ACCOUNT_CHANNELS.find(x=>x.id==='codearts').displayName,'CodeArts · 华为云');
 assert.ok(ACCOUNT_CHANNELS.every(x=>x.displayName.includes(x.name)&&x.displayName.includes(x.brand)));
 const g=unifiedModels(config())[0];assert.equal(g.routes[0].channelName,'TRAE · 字节跳动');assert.equal(g.routes[0].wireModel,'deepseek-v4.1-flash');
});
