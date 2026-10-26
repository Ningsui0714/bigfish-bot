import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
export const channelOperation = new AsyncLocalStorage();
/** Lexically injected into protocol code, never replaces the process-wide fetch. */
export async function protocolFetch(url, options = {}) {
  const op = channelOperation.getStore();
  const signal = AbortSignal.any([AbortSignal.timeout(180_000), ...(options.signal ? [options.signal] : []), ...(op?.signal ? [op.signal] : [])]);
  const pathname = new URL(url).pathname;
  const inference = /(?:chat\/completions|messages$|generateContent|streamGenerateContent|llm_utils_chat|\/infer(?:\/|$)|\/chat$)/i.test(pathname);
  if (op?.purpose === 'chat' && inference) {
    if (op.inferenceSent) {
      if (op.lastInferenceStatus === 401 && !op.authRetried) op.authRetried = true;
      else {const e = new Error('该请求已发送，不自动重复推理；请查看本轮错误后再决定是否重试');e.noFallback = op.accepted || op.lastInferenceStatus === undefined;throw e;}
    }
    op.inferenceSent = true;
  }
  if (op?.purpose === 'checkin' && (options.method??'GET').toUpperCase() === 'POST' && /claim|receive|daily_quota|sign_in/i.test(pathname) && !/status|query|list/i.test(pathname)) {
    const key = pathname + createHash('sha256').update(String(options.body??'')).digest('hex');
    if (op.claims?.has(key)) throw new Error('领取请求已提交，不自动重复发送');
    op.claims ??= new Set(); op.claims.add(key); await op.onClaim?.(); op.claimSent = true;
  }
  const response = await (op?.fetchImpl ?? fetch)(url, {...options, signal});
  if (inference && op) { op.lastInferenceStatus = response.status; if(response.ok) op.accepted = true; }
  return response;
}
