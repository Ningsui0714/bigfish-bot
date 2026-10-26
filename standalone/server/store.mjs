import {mergePersonas,personaMemories,personaConversations,removePersona} from './persona-state.mjs';
import {scopePersona} from './persona-scope.mjs';
import { normalizeAgentSettings } from './agent-runtime.mjs';
import { normalizeBenefits } from './benefits-state.mjs';
import { canonicalModelId } from './model-catalog.mjs';
import { normalizeAccounts, publicAccounts, accountChannel } from './channel-state.mjs';
import { traeDefaults, normalizeTraeState, publicTraeState } from './trae.mjs';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes, createCipheriv, createDecipheriv, randomUUID } from 'node:crypto';
import { normalizeQqGroupChatbotConfig } from '../../src/channels/qq/qq-mention.mjs';
import { normalizeSocialMemory } from '../../src/channels/qq/group-mind.mjs';

export const defaults = () => {const data=({ version: 1, providers: [], activeProviderId: '', activeModelId: '', modelMaxOutputTokens: null,
  persona: { ...normalizeQqGroupChatbotConfig(), guidance: normalizeQqGroupChatbotConfig().guidance.replaceAll('海鸥', '大肥鱼').replace('只在明确要求实际执行任务时使用工具；', '你仅参与聊天，不执行工具或代码；') + '\n你的形象是小小一只的蓝发鲸尾 Q 版女仆吉祥物。圆脸、呆毛、抱着饭碗发呆，平时呆萌、贪吃、反应慢半拍，可以偶尔会错意再自己反应过来，但不要每句都演笨蛋。认真问题仍准确回答，不为人设编造事实。不使用成熟暧昧语气，不默认称呼用户为主人，不机械扮演客服，不贬低他人。', nicknames: ['大肥鱼', '肥鱼'], interests: ['电影', '游戏', '音乐', '编程'] },
  trae: traeDefaults(), accounts: normalizeAccounts(), benefits: normalizeBenefits(),
  agent:normalizeAgentSettings(), conversations:[],
  qq: { mode: 'napcat', url: 'ws://127.0.0.1:3001', token: '', allowedGroupIds: [], allowedUserIds: [], privateEnabled: false,
    napcat: { deployment: 'native', webuiUrl: 'http://127.0.0.1:6099', webuiToken: '', webPort: 6099, wsPort: 3001 },
    official: { appId: '', appSecret: '', transport: 'websocket', port: 3211, allowedGroupIds: [], allowedUserIds: [], privateEnabled: false } }, memories: [] });return {...data,activePersonaId:'default',personas:[{id:'default',name:'大肥鱼',kind:'persona',persona:structuredClone(data.persona),agent:structuredClone(data.agent)}]};};
const text = (v, max = 4000) => typeof v === 'string' ? v.trim().slice(0, max) : '';
export function endpoint(value, schemes) {
  let u;
  try { u = new URL(value); } catch { throw new Error('请输入完整的服务地址'); }
  if (!schemes.includes(u.protocol) || u.username || u.password || u.search || u.hash) throw new Error('服务地址协议或格式不受支持');
  if (u.protocol === 'http:' || u.protocol === 'ws:') {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)) throw new Error('非本机连接必须使用 HTTPS / WSS');
  }
  return u.toString().replace(/\/$/, '');
}
export function mergeConfig(input, current, {loading=false}={}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('配置必须是对象');
  const next = structuredClone(current);
  if (input.providers !== undefined) {
    if (!Array.isArray(input.providers) || input.providers.length > 16) throw new Error('最多配置 16 个模型账号');
    const ids = new Set(), accountIds = new Set();
    next.providers = input.providers.map(p => {
      const id = text(p.id, 80) || randomUUID();
      if (ids.has(id)) throw new Error('模型账号标识重复');
      ids.add(id);
      const old = current.providers.find(x => x.id === id);
      const type = ['ollama', 'trae', 'account'].includes(p.type) ? p.type : 'compatible';
      if (type === 'trae' && [...ids].some(other => other !== id && input.providers.find(x => x.id === other)?.type === 'trae')) throw new Error('TRAE 当前只支持一个账号配置');
      const channelId = type === 'account' ? text(p.channelId, 40) : '';
      if (type === 'account' && !accountChannel(channelId)) throw new Error('未知账号渠道');
      if (type === 'account') {if (accountIds.has(channelId)) throw new Error('同一厂商只需一个账号配置');accountIds.add(channelId);}
      const baseUrl = type === 'account' ? `account:${channelId}` : type === 'trae' ? 'https://trae-api-cn.mchost.guru' : endpoint(text(p.baseUrl), ['https:', 'http:']);
      // Do not forward a saved credential to a newly edited endpoint.
      const unchanged = old?.baseUrl === baseUrl;
      const apiKey = type === 'trae' || type === 'account' || p.clearKey === true ? '' : text(p.apiKey, 8192) || (unchanged ? old?.apiKey ?? '' : '');
      const model = text(p.model, 200);
      if (!model || !text(p.name, 80)) throw new Error('模型账号名称和模型 ID 必填');
      const maxOutputTokens = p.maxOutputTokens == null || p.maxOutputTokens === '' ? null : Number(p.maxOutputTokens);
      if (maxOutputTokens !== null && (!Number.isSafeInteger(maxOutputTokens) || maxOutputTokens < 1)) throw new Error('输出 Token 上限需为正整数或留空');
      return { ...(type === 'account' ? {channelId} : {}), maxOutputTokens, id, name: text(p.name, 80), type, baseUrl, model, apiKey, enabled: p.enabled !== false };
    });
  }
  if (input.activeProviderId !== undefined) next.activeProviderId = text(input.activeProviderId, 80);
  if (next.activeProviderId && !next.providers.some(p => p.id === next.activeProviderId)) throw new Error('主模型账号不存在');
  if (input.activeModelId !== undefined) next.activeModelId = input.activeModelId ? canonicalModelId(text(input.activeModelId,200)) : '';
  if (input.modelMaxOutputTokens !== undefined) {const v=input.modelMaxOutputTokens;next.modelMaxOutputTokens=v===null||v===''?null:Number(v);if(next.modelMaxOutputTokens!==null&&(!Number.isSafeInteger(next.modelMaxOutputTokens)||next.modelMaxOutputTokens<1))throw new Error('输出 Token 上限需为正整数或留空');}
  if (input.persona !== undefined) next.persona = { ...normalizeQqGroupChatbotConfig(input.persona) };
  if (input.trae !== undefined) {
    next.trae = { ...normalizeTraeState(current.trae), autoCheckin: input.trae.autoCheckin === undefined ? current.trae.autoCheckin : input.trae.autoCheckin === true, enabled: input.trae.enabled !== false };
  }
  if (input.accounts !== undefined) {
    next.accounts = normalizeAccounts(current.accounts);
    for (const [id, value] of Object.entries(input.accounts ?? {})) if (accountChannel(id)) {if(value?.autoCheckin!==undefined)next.accounts[id].autoCheckin=accountChannel(id).daily&&value.autoCheckin===true;if(value?.enabled!==undefined)next.accounts[id].enabled=value.enabled!==false;}
  }
  if(input.agent!==undefined)next.agent=normalizeAgentSettings({...current.agent,...input.agent});
  if (input.benefits !== undefined) next.benefits = {...normalizeBenefits(current.benefits),enabled:input.benefits.enabled === undefined ? current.benefits?.enabled !== false : input.benefits.enabled === true};
  if (input.qq !== undefined) {
    const q = input.qq;
    const mode = q.mode ?? current.qq.mode ?? 'napcat';
    if (!['napcat', 'official'].includes(mode)) throw new Error('QQ 接入方式请选择官方 Bot 或 NapCat');
    const url = endpoint(text(q.url ?? current.qq.url), ['ws:', 'wss:']);
    const ids = (v, official = false) => {
      const pattern = official ? /^[a-zA-Z0-9_-]{1,128}$/ : /^\d{1,20}$/;
      if (!Array.isArray(v) || v.length > 200 || v.some(x => !pattern.test(String(x)))) throw new Error(official ? '官方白名单需为 OpenID 列表（字母、数字、下划线或连字符，最多 200 项）' : '白名单必须是 QQ 数字 ID 列表（最多 200 项）');
      return [...new Set(v.map(String))];
    };
    const old = current.qq.official ?? defaults().qq.official, o = q.official ?? {};
    const appId = text(o.appId ?? old.appId, 80);
    if (appId && !/^\d{1,40}$/.test(appId)) throw new Error('AppID 应为开放平台提供的数字标识');
    const port = Number(o.port ?? old.port);
    const transport = o.transport ?? old.transport ?? 'websocket';
    if (!['websocket', 'webhook'].includes(transport)) throw new Error('官方消息接收请选择 WebSocket 或 Webhook');
    if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('回调端口需为 1024～65535 的整数');
    const appSecret = o.clearSecret === true ? '' : text(o.appSecret, 1024) || (appId === old.appId ? old.appSecret : '');
    if (appSecret && !/^[\x21-\x7e]+$/.test(appSecret)) throw new Error('AppSecret 应为开放平台提供的 ASCII 密钥');
    const n = q.napcat ?? {}, previousNapcat = current.qq.napcat ?? defaults().qq.napcat;
    const deployment = n.deployment ?? previousNapcat.deployment;
    if (!['native', 'managed', 'external'].includes(deployment)) throw new Error('NapCat 请选择原生安装、Docker 或已有服务');
    const webuiUrl = endpoint(text(n.webuiUrl ?? previousNapcat.webuiUrl), ['http:', 'https:']);
    const napcatPort = key => {const value=Number(n[key] ?? previousNapcat[key]);if(!Number.isInteger(value)||value<1024||value>65535)throw new Error('NapCat 端口需为 1024～65535 的整数');return value;};
    const webPort=napcatPort('webPort'),wsPort=napcatPort('wsPort');
    if(webPort===wsPort)throw new Error('NapCat 管理端口和通信端口应不同');
    const webuiToken = n.clearToken === true ? '' : text(n.webuiToken,8192) || (webuiUrl===previousNapcat.webuiUrl?previousNapcat.webuiToken:'');
    next.qq = { mode, url, token: q.clearToken === true ? '' : text(q.token, 8192) || (url === current.qq.url ? current.qq.token : ''),
      napcat: {deployment,webuiUrl,webuiToken,webPort,wsPort},
      allowedGroupIds: ids(q.allowedGroupIds ?? current.qq.allowedGroupIds), allowedUserIds: ids(q.allowedUserIds ?? current.qq.allowedUserIds), privateEnabled: (q.privateEnabled ?? current.qq.privateEnabled) === true,
      official: { appId, appSecret, transport, port, allowedGroupIds: ids(o.allowedGroupIds ?? old.allowedGroupIds, true), allowedUserIds: ids(o.allowedUserIds ?? old.allowedUserIds, true), privateEnabled: (o.privateEnabled ?? old.privateEnabled) === true } };
  }
  mergePersonas(input,current,next,{allowRemoval:loading});
  next.conversations=personaConversations(current.conversations,next);
  return next;
}
export class LocalStore {
  #dir; #key; #data = defaults(); #tail = Promise.resolve();
  constructor(dir) { this.#dir = dir; }
  async load() {
    await fs.mkdir(this.#dir, { recursive: true, mode: 0o700 });
    try { this.#key = await fs.readFile(join(this.#dir, 'local.key')); }
    catch (e) {
      if (e.code !== 'ENOENT') throw e;
      // Never replace a missing key beside existing encrypted data.
      try { await fs.access(join(this.#dir, 'state.enc')); throw new Error('local.key 缺失，请恢复备份；未覆盖原始数据'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      this.#key = randomBytes(32);
      await fs.writeFile(join(this.#dir, 'local.key'), this.#key, { mode: 0o600, flag: 'wx' });
    }
    if (this.#key.length !== 32) throw new Error('local.key 长度错误');
    try {
      const packed = await fs.readFile(join(this.#dir, 'state.enc'));
      const d = createDecipheriv('aes-256-gcm', this.#key, packed.subarray(0, 12));
      d.setAuthTag(packed.subarray(12, 28));
      const data = JSON.parse(Buffer.concat([d.update(packed.subarray(28)), d.final()]).toString());
      if (data.version !== 1) throw new Error('不支持的本地数据版本');
      // Migrate removed channels without breaking decryption of an older profile.
      const providers=(data.providers??[]).filter(p=>!(p.type==='account'&&p.channelId==='lobsterai'));
      const removedPrimary=(data.providers??[]).some(p=>p.type==='account'&&p.channelId==='lobsterai'&&p.id===data.activeProviderId);
      const activeProviderId=removedPrimary?'':data.activeProviderId??'';
      this.#data = mergeConfig({...data,providers,activeProviderId}, defaults(),{loading:true});
      this.#data.benefits = normalizeBenefits(data.benefits);
      this.#data.memories = personaMemories(data.memories,this.#data);
      this.#data.conversations = personaConversations(data.conversations,this.#data);
      this.#data.trae = normalizeTraeState(data.trae);
      this.#data.accounts = normalizeAccounts(data.accounts);
      if(!this.#data.activeModelId){const p=this.#data.providers.find(p=>p.id===this.#data.activeProviderId);if(p){this.#data.activeModelId=canonicalModelId(p.model);if(data.modelMaxOutputTokens===undefined)this.#data.modelMaxOutputTokens=p.maxOutputTokens??null;}}
    } catch (e) { if (e.code !== 'ENOENT') throw new Error('本地数据读取或解密失败，原件保持不变', { cause: e }); }
    return this;
  }
  get() { return structuredClone(this.#data); }
  publicConfig() {
    const d = this.get();
    delete d.memories;
    delete d.conversations;
    d.trae = publicTraeState(d.trae);
    d.accounts = publicAccounts(d.accounts);
    d.providers = d.providers.map(({ apiKey, ...p }) => ({ ...p, hasKey: !!apiKey }));
    const { token, official, napcat, ...qq } = d.qq;
    const { webuiToken, ...publicNapcat } = napcat;
    const { appSecret, ...publicOfficial } = official;
    d.qq = { ...qq, hasToken: !!token, napcat: {...publicNapcat,hasToken:!!webuiToken}, official: { ...publicOfficial, hasSecret: !!appSecret } };
    return d;
  }
  async deletePersona(id) {return this.#change(data=>removePersona(data,id));}
  async update(input) { return this.#change(data => mergeConfig(input, data)); }
  async patchAccount(id, patch) {
    if (!accountChannel(id)) throw new Error('账号渠道不存在');
    return this.#change(data => {const accounts = normalizeAccounts(data.accounts);accounts[id] = {...accounts[id], ...patch};return {...data, accounts: normalizeAccounts(accounts)};});
  }
  async patchBenefits(patch) { return this.#change(data => ({...data,benefits:normalizeBenefits({...data.benefits,...patch})})); }
  async patchTrae(patch) { return this.#change(data => ({ ...data, trae: normalizeTraeState({ ...data.trae, ...patch }) })); }
  async appendConversation(scope,sender,turn,signal) {
    return this.#change(data=>{signal?.throwIfAborted();const conversations=personaConversations(data.conversations,data),current=conversations.find(x=>x.scope===scope&&x.sender===sender);
      const next={scope,sender,turns:[...(current?.turns??[]),turn]};return {...data,conversations:personaConversations([...conversations.filter(x=>x!==current),next],data)};});
  }
  async clearConversation(scope,sender) {return this.#change(data=>({...data,conversations:personaConversations(data.conversations,data).filter(x=>x.scope!==scope||x.sender!==sender)}));}
  async personaMemories(id,value) {return this.#change(data=>({...data,memories:personaMemories([...data.memories.filter(m=>scopePersona(m.room)!==id),...normalizeSocialMemory(value).filter(m=>scopePersona(m.room)===id)],data)}));}
  async memories(value) {return this.personaMemories(this.#data.activePersonaId??'default',value);}
  async #change(fn) {
    const op = this.#tail.then(async () => {
      const next = fn(this.#data);
      const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', this.#key, iv);
      const body = Buffer.concat([c.update(JSON.stringify(next)), c.final()]);
      const path = join(this.#dir, 'state.enc'), tmp = `${path}.${randomUUID()}.tmp`;
      try { await fs.copyFile(path, `${path}.bak`); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      await fs.writeFile(tmp, Buffer.concat([iv, c.getAuthTag(), body]), { mode: 0o600 });
      await fs.rename(tmp, path);
      this.#data = next;
    });
    this.#tail = op.catch(() => {});
    await op;
    return this.publicConfig();
  }
}
