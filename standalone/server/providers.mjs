import { candidatesForModel } from './model-catalog.mjs';
/** Direct model transport. No Harness, tools or shell access. TRAE uses the explicit experimental account adapter. */
export async function completion(provider, messages, { fetchImpl = fetch, signal, trae, accounts } = {}) {
  if (!provider?.enabled) throw new Error('模型账号未启用');
  if (provider.type === 'account') {
    if (!accounts) throw new Error('账号渠道未启动');
    return accounts.chat(provider, messages, {signal});
  }
  if (provider.type === 'trae') {
    if (!trae) throw new Error('TRAE 客户端适配器未启动');
    return trae.chat(provider, messages, { signal });
  }
  if (provider.type !== 'ollama' && !provider.apiKey) throw new Error('请先填写该模型账号的 API Key');
  const response = await fetchImpl(`${provider.baseUrl}/chat/completions`, {
    method: 'POST', redirect: 'error',
    headers: { 'Content-Type': 'application/json', ...(provider.apiKey ? { Authorization: `Bearer ${provider.apiKey}` } : {}) },
    body: JSON.stringify({ model: provider.model, messages, stream: false, temperature: 0.8, ...(provider.maxOutputTokens ? { max_tokens: provider.maxOutputTokens } : {}) }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000),
  }).catch(e=>{e.noFallback=true;throw e;});
  // Error bodies may contain credentials echoed by a third party; never surface them.
  if (!response.ok) { await response.body?.cancel(); throw new Error(`模型服务 HTTP ${response.status}`); }
  try {
    const reader = response.body.getReader(); let size = 0; const chunks = [];
    try {
      while (true) { const { value, done } = await reader.read(); if (done) break;
        size += value.length; if (size > 16_000_000) throw new Error('模型响应超过 16 MB 容量上限'); chunks.push(value); }
    } finally { await reader.cancel().catch(() => {}); }
    let data; try { data = JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new Error('模型服务返回了非 JSON 数据'); }
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('模型没有返回文字答案');
    return answer.trim();
  } catch (e) { e.noFallback = true; throw e; }
}
export async function generate(config, messages, options) {
  const enabled = config.providers.filter(p => p.enabled);
  const primary = enabled.find(p => p.id === config.activeProviderId);
  const providers = config.activeModelId ? candidatesForModel(config, config.activeModelId) : primary ? [primary, ...enabled.filter(p => p !== primary)] : enabled;
  if (!providers.length) throw new Error(config.activeModelId?'所选模型暂无已登录且已启用的接入渠道，请登录账号或刷新模型列表':'还未配置模型，请先添加模型账号');
  const errors = [];
  for (const p of providers) {
    try { return { text: await completion(p, messages, options), providerId: p.id, modelId: config.activeModelId || p.model }; }
    catch (e) {
      if (options?.signal?.aborted) throw e;
      if (e.noFallback) throw e;
      errors.push(`${p.name}: ${(p.type === 'trae' && e.name === 'TraeError' || p.type === 'account' && e.name === 'AccountError') ? e.message : /^模型服务 HTTP \d+$/.test(e.message) ? e.message : '调用失败，请检查配置或网络'}`);
    }
  }
  throw new Error(errors.join('；'));
}
