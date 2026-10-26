import { NativeNapcatRuntime, parseNativeBinding } from './napcat-runtime.mjs';
import { NativeNapcat } from './napcat-native.mjs';
import { DailyBenefits } from './benefits.mjs';
import http from 'node:http';
import fs from 'node:fs/promises';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { LocalStore } from './store.mjs';
import { SocialAgent } from './agent.mjs';
import { QqConnection } from './qq.mjs';
import { QqBinding } from './qq-binding.mjs';
import { NapcatManager } from './napcat.mjs';
import { TraeClient } from './trae.mjs';
import { unifiedModels } from './model-catalog.mjs';
import { AccountHub } from './accounts.mjs';
import { generate } from './providers.mjs';
import { completion } from './providers.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const equal = (a, b) => { const x = Buffer.from(a ?? ''), y = Buffer.from(b ?? ''); return x.length === y.length && timingSafeEqual(x, y); };
export async function createApplication({ dataDir = process.env.BIGFISH_DATA_DIR || join(root, 'data'), model, fetchImpl, officialBotFactory, qrStart, napcatRun, napcatFetch, nativeNapcatOptions, nativeRuntimeOptions, agentPlugins } = {}) {
  const store = await new LocalStore(dataDir).load();
  const trae = new TraeClient({ store, fetchImpl });
  const accounts = new AccountHub({store, fetchImpl});
  const benefits = new DailyBenefits({store,accounts,trae});
  benefits.start();
  const agent = new SocialAgent({ store, plugins:agentPlugins, model: model ?? ((config, messages, options) => generate(config, messages, { ...options, fetchImpl, trae, accounts })) });

  const qq = new QqConnection({ officialBotFactory, onMessage: async (m, send) => {
    try { await agent.receive(m, { send }); }
    catch { agent.log('qq-turn-failed'); }
  } });
  const token = randomBytes(32).toString('hex');
  let revision = 0, labActive = 0, saving = false;
  const qqBinding = new QqBinding({ start: qrStart, onCredentials: async ({ appId, appSecret }) => {
    if (saving) throw new Error('配置正在保存');
    saving = true;
    try {
      const q = store.get().qq, sameBot = q.official.appId === appId;
      await store.update({ qq: { mode: 'official', official: { appId, appSecret, transport: 'websocket',
        ...(!sameBot ? { allowedGroupIds: [], allowedUserIds: [], privateEnabled: false } : {}) } } });
      revision++; agent.reset(); qq.connect(store.get().qq);
    } finally { saving = false; }
  } });
  const nativeRuntime = new NativeNapcatRuntime({dataDir,...nativeRuntimeOptions});
  const nativeNapcat = new NativeNapcat({dataDir,...nativeNapcatOptions});
  const napcat = new NapcatManager({store,dataDir,run:napcatRun,fetchImpl:napcatFetch,onPrepare:async()=>{
    if(saving||qqBinding.committing)throw new Error('配置正在保存，请稍候');
    saving=true;
    try{
      const q=store.get().qq,n=q.napcat;
      if(q.mode!=='napcat'||n.deployment!=='managed')throw new Error('请先选择并保存内置管理的 NapCat');
      await store.update({qq:{url:`ws://127.0.0.1:${n.wsPort}`,token:q.token||randomBytes(24).toString('hex'),napcat:{webuiUrl:`http://127.0.0.1:${n.webPort}`,webuiToken:n.webuiToken||randomBytes(24).toString('hex')}}});
      revision++;agent.reset();qq.stop();return store.get().qq;
    }finally{saving=false;}
  },onReady:async()=>{if(store.get().qq.mode==='napcat'){agent.reset();qq.connect(store.get().qq);}}});
  const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };
  async function body(req) {
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 100_000) throw new Error('请求超过 100 KB'); chunks.push(chunk); }
    try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new Error('请求必须是 JSON'); }
  }
  const server = http.createServer(async (req, res) => {
    const port = server.address()?.port;
    const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if (!hosts.includes(req.headers.host) || req.headers['sec-fetch-site'] === 'cross-site') return json(res, 403, { error: '仅接受本机同源请求' });
    const origin = req.headers.origin;
    if (origin && !hosts.map(h => `http://${h}`).includes(origin)) return json(res, 403, { error: '来源不匹配' });
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      const cookie = req.headers.cookie?.split(';').map(x => x.trim()).find(x => x.startsWith('bigfish_session='))?.slice(16);
      if (!equal(cookie, token)) return json(res, 401, { error: '请从本地界面访问' });
      if (req.method !== 'GET' && (!origin || req.headers['content-type']?.split(';')[0] !== 'application/json')) return json(res, 403, { error: '操作需要同源 JSON 请求' });
      try {
        if (req.method === 'GET' && url.pathname === '/api/state') return json(res, 200, { config: store.publicConfig(), modelCatalog: unifiedModels(store.get()), trae: trae.status(), accounts: accounts.statuses(), benefits: benefits.status(), qq: qq.status, qqBinding: qqBinding.status(), napcat:napcat.status(), nativeNapcat:{...nativeNapcat.status(),runtime:nativeRuntime.status()}, agent:agent.status(), events: agent.events.slice(-30), revision });
        if (req.method === 'GET' && url.pathname === '/api/memories') return json(res, 200, { items: agent.memories(), revision });
        if(req.method==='POST'&&url.pathname==='/api/personas/delete'){
          const input=await body(req);
          if(saving||qqBinding.committing||input.revision!==revision)return json(res,409,{error:'配置已改变或正在保存，请刷新后重试'});
          if(input.confirmed!==true)throw new Error('请先确认删除人格及其独立记忆');
          saving=true;
          try{const wasActive=store.get().activePersonaId===input.id;const config=await store.deletePersona(input.id);revision++;agent.personaDeleted(input.id,wasActive);return json(res,200,{config,revision});}
          finally{saving=false;}
        }
        if (req.method === 'PUT' && url.pathname === '/api/config') {
          const input = await body(req);
          if (saving || qqBinding.committing || input.revision !== revision) return json(res, 409, { error: '配置已改变或正在保存，请刷新后重试' });
          saving = true;
          try {
            const previousQq=store.get().qq;
            const config = await store.update(input.config); revision++; agent.reset();
            // Personality, memory and model changes must not tear down a healthy
            // QQ login. Only transport/access changes require reconnection.
            if(JSON.stringify(previousQq)!==JSON.stringify(store.get().qq)){qqBinding.cancel();napcat.cancel();qq.stop();}
            return json(res, 200, { config, revision });
          } finally { saving = false; }
        }
        if(req.method==='POST'&&url.pathname.startsWith('/api/napcat/')){
          const input=await body(req),action=url.pathname.slice('/api/napcat/'.length);
          if(saving||qqBinding.committing)throw new Error('配置正在保存，请稍候');
          if(action==='native-check'){await nativeRuntime.check(store.get().qq);return json(res,200,{nativeNapcat:await nativeNapcat.check(),nativeRuntime:nativeRuntime.status()});}
          if(action==='check')return json(res,200,{napcat:await napcat.checkRuntime()});
          if(store.get().qq.mode!=='napcat')throw new Error('请先选择并保存 NapCat 接入方式');
          if(action.startsWith('native-')){
            if(store.get().qq.napcat.deployment!=='native')throw new Error('请先选择并保存原生安装方式');
            if(action==='native-download')return json(res,202,{nativeNapcat:nativeNapcat.download()});
            if(action==='native-open')return json(res,200,{nativeNapcat:await nativeNapcat.open()});
            if(action==='native-cancel')return json(res,200,{nativeNapcat:nativeNapcat.cancel()});
            if(action==='native-stop'){napcat.cancel();qq.stop();return json(res,200,{nativeRuntime:await nativeRuntime.stop()});}
            if(action==='native-start'){
              const q=store.get().qq;
              return json(res,202,{nativeRuntime:nativeRuntime.start(q,{confirmNoSandbox:input.confirmNoSandbox===true,
                onPrepared:async()=>{
                  if(saving||qqBinding.committing)throw new Error('配置正在保存，请稍候');
                  saving=true;
                  try{await store.update({qq:{token:q.token||randomBytes(24).toString('hex'),napcat:{webuiToken:q.napcat.webuiToken||randomBytes(24).toString('hex')}}});revision++;agent.reset();qq.stop();return store.get().qq;}
                  finally{saving=false;}
                },onBinding:async binding=>{
                  if(saving||qqBinding.committing)throw new Error('配置正在保存，请重新连接 NapCat');
                  saving=true;
                  try{await store.update({qq:{napcat:binding}});revision++;}finally{saving=false;}
                },onReady:()=>{napcat.openLogin();}
              })});
            }
            if(action==='native-connect'||action==='native-pair'){
              const q=store.get().qq;
              const local=action==='native-pair'?parseNativeBinding(input.linkOrToken,q.napcat.webuiUrl):
                q.napcat.webuiToken?null:await nativeNapcat.localWebui();
              if(!local&&!q.napcat.webuiToken)throw new Error('NapCat 已启动但尚未绑定：请粘贴一次控制台 WebUI 链接，之后会加密记住，无需每次填写');
              const target=new URL(local?.webuiUrl??q.napcat.webuiUrl);
              if(!['127.0.0.1','localhost','[::1]'].includes(target.hostname))throw new Error('原生模式只连接本机服务；远端服务请选择连接已有 NapCat');
              saving=true;
              try{napcat.cancel();await store.update({qq:{token:q.token||randomBytes(24).toString('hex'),...(local?{napcat:local}:{})}});revision++;agent.reset();qq.stop();}
              finally{saving=false;}
              return json(res,200,{napcat:napcat.openLogin(),revision});
            }
          }
          if(action==='start'){if(store.get().qq.napcat.deployment!=='managed')throw new Error('请先选择“大肥鱼管理实例”');agent.reset();qq.stop();return json(res,200,{napcat:napcat.startManaged()});}
          if(action==='login')return json(res,200,{napcat:napcat.openLogin(typeof input.totpCode==='string'&&/^\d{6}$/.test(input.totpCode)?input.totpCode:undefined)});
          if(action==='refresh-qr')return json(res,200,{napcat:await napcat.refreshQr()});
          if(action==='configure')return json(res,200,{napcat:await napcat.configureLocalChannel()});
          if(action==='cancel'){napcat.cancel();return json(res,200,{napcat:napcat.status()});}
          if(action==='stop'){await napcat.stopManaged();agent.reset();qq.stop();return json(res,200,{napcat:napcat.status()});}
        }
        if (req.method === 'POST' && url.pathname === '/api/qq/login') {
          await body(req);
          if (saving || qqBinding.committing) return json(res, 409, { error: '正在保存配置，请稍候' });
          if (store.get().qq.mode !== 'official') throw new Error('请先选择并保存官方 QQ Bot 接入方式');
          return json(res, 200, { binding: qqBinding.begin() });
        }
        if (req.method === 'POST' && url.pathname === '/api/qq/cancel-login') {
          await body(req); return json(res, 200, { binding: qqBinding.cancel() });
        }
        if (req.method === 'POST' && url.pathname === '/api/qq/connect') {
          await body(req); if (qqBinding.committing) throw new Error('正在保存扫码结果，请稍候'); qqBinding.cancel(); agent.reset(); qq.connect(store.get().qq); return json(res, 200, { status: qq.status });
        }
        if (req.method === 'POST' && url.pathname === '/api/qq/disconnect') {
          await body(req); if (qqBinding.committing) throw new Error('正在保存扫码结果，请稍候'); qqBinding.cancel(); napcat.cancel(); agent.reset(); qq.stop(); return json(res, 200, { status: qq.status });
        }
        if (req.method === 'POST' && url.pathname === '/api/provider/test') {
          const { id } = await body(req), p = store.get().providers.find(p => p.id === id);
          if (!p) throw new Error('先保存模型账号，再测试');
          await completion(p, [{ role: 'user', content: '只回复 OK' }], { fetchImpl, trae, accounts });
          return json(res, 200, { ok: true });
        }
        if (req.method === 'POST' && url.pathname === '/api/models/test') {
          await body(req);const result=await generate(store.get(),[{role:'user',content:'只回复 OK'}],{fetchImpl,trae,accounts});
          return json(res,200,{ok:true,...result});
        }
        if (req.method === 'POST' && url.pathname === '/api/models/refresh') {
          await body(req);const jobs=[];
          if(trae.status().loggedIn)jobs.push({id:'trae',task:()=>trae.models()});
          for(const a of accounts.statuses())if(a.loggedIn)jobs.push({id:a.id,task:()=>accounts.models(a.id)});
          const results=await Promise.all(jobs.map(async j=>{try{await j.task();return{id:j.id,ok:true};}catch(e){return{id:j.id,ok:false,error:e.message};}}));
          return json(res,200,{models:unifiedModels(store.get()),results});
        }
        if (req.method === 'POST' && url.pathname.startsWith('/api/benefits/')) {
          await body(req);
          if(saving)throw new Error('配置正在保存，请稍候');
          const action=url.pathname.slice('/api/benefits/'.length);
          if(action==='run')return json(res,202,{benefits:benefits.launch()});
          if(action==='stop')return json(res,200,{benefits:benefits.stopRemaining()});
        }
        if (req.method === 'POST' && url.pathname.startsWith('/api/accounts/')) {
          const input = await body(req), [, , , id, action] = url.pathname.split('/');
          accounts.state(id);
          if (action === 'login') return json(res, 200, await accounts.login(id));
          if (action === 'cancel-login') {await accounts.cancel(id); return json(res, 200, {ok:true});}
          if (action === 'logout') {await accounts.logout(id); agent.reset(); return json(res, 200, {ok:true});}
          if (action === 'models') return json(res, 200, {models:await accounts.models(id)});
          if (action === 'balance') return json(res, 200, {balance:await accounts.balance(id)});
          if (action === 'refresh') return json(res, 200, await accounts.refresh(id));
          if (action === 'checkin') return json(res, 200, {checkin:await accounts.checkin(id)});
        }
        if (req.method === 'POST' && url.pathname.startsWith('/api/trae/')) {
          await body(req);
          const action = url.pathname.slice('/api/trae/'.length);
          if (action === 'login') return json(res, 200, await trae.beginLogin());
          if (action === 'cancel-login') { trae.cancelLogin(); return json(res, 200, trae.status()); }
          if (action === 'logout') { await trae.logout(); agent.reset(); return json(res, 200, trae.status()); }
          if (action === 'models') return json(res, 200, { models: await trae.models() });
          if (action === 'balance') return json(res, 200, { balance: await trae.balance() });
          if (action === 'checkin') return json(res, 200, { checkin: await trae.checkin() });
          if (action === 'refresh') { await trae.refresh(); return json(res, 200, trae.status()); }
        }
        if (req.method === 'POST' && url.pathname === '/api/chat') {
          const input = await body(req), text = typeof input.text === 'string' ? input.text.trim() : '';
          if (!text || text.length > 4000) throw new Error('消息需为 1～4000 字符');
          if (labActive >= 4) return json(res, 429, { error: '最多同时进行 4 个实验，请稍后再试' });
          labActive++;
          try {
            const result = await agent.receive({ kind: 'group', groupOpenid: 'playground', senderId: 'local-user', senderName: '你', messageId: randomBytes(8).toString('hex'), content: text }, { local: true, passive: input.passive === true });
            return json(res, 200, result);
          } finally { labActive--; }
        }
        if (req.method === 'POST' && url.pathname === '/api/memories/delete') {
          const input = await body(req);
          const memory = agent.memories()[input.index];
          if (input.revision !== revision || !memory || JSON.stringify(memory) !== JSON.stringify(input.item)) return json(res, 409, { error: '记忆列表已改变，请刷新' });
          await agent.deleteMemory(input.index); return json(res, 200, { ok: true });
        }
        return json(res, 404, { error: '接口不存在' });
      } catch (e) { return json(res, 400, { error: e instanceof Error && !/fetch|ECONN|aborted/i.test(e.message) ? e.message : '请求未完成，请检查配置或网络' }); }
    }
    if (req.method !== 'GET') return json(res, 405, { error: '仅支持 GET' });
    try {
      const path = url.pathname === '/' ? '/index.html' : url.pathname;
      const full = resolve(root, 'dist', `.${path}`);
      if (!full.startsWith(join(root, 'dist') + '/')) return json(res, 404, { error: '不存在' });
      const bytes = await fs.readFile(full);
      const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
      if (path === '/index.html') res.setHeader('Set-Cookie', `bigfish_session=${token}; HttpOnly; SameSite=Strict; Path=/`);
      res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }); res.end(bytes);
    } catch { json(res, 404, { error: '界面尚未构建，请先运行 npm run build' }); }
  });
  server.requestTimeout = 15_000; server.headersTimeout = 10_000;
  return { server, store, agent, qq, qqBinding, napcat, nativeNapcat, nativeRuntime, trae, accounts, benefits, close: async () => { benefits.stop(); await nativeRuntime.close(); await nativeNapcat.close(); await napcat.close(); await qqBinding.close(); trae.stop(); await accounts.stop(); await benefits.task; agent.stop(); qq.stop(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); } };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = await createApplication();
  const port = Number(process.env.PORT || 3210);
  app.server.listen(port, '127.0.0.1', () => console.log(`大肥鱼本地控制台：http://127.0.0.1:${app.server.address().port}\nQQ 默认断开；在界面选择官方 Bot 或 NapCat 并连接。`));
  app.server.on('error', e => { console.error(`启动失败：${e.code ?? 'unknown'}`); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => app.close().then(() => process.exit(0)));
}
