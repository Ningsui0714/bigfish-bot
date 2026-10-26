/** Minimal protocol value types; no DSH runtime, RPC, tools, or agent execution. */
export class Service { constructor(ctx) { this.ctx = ctx; } }
export class LlmAdapter {}
export class LlmError extends Error { constructor(message, code, options = {}) { super(message); this.code = code; Object.assign(this, options); } }
export const credentialRef = value => value;
export const ToolCallId = String, ReasoningEffortId = String;
export const createUserMessage = content => ({ role: 'user', content });
export const attributionHeaders = () => ({});
export const CONTEXT_WINDOW_EXCEEDED_CODE = 'CONTEXT_WINDOW_EXCEEDED', QUOTA_EXCEEDED_CODE = 'QUOTA_EXCEEDED', EMPTY_RESPONSE_CODE = 'EMPTY_RESPONSE';
export const isContextWindowExceededError = e => e?.code === CONTEXT_WINDOW_EXCEEDED_CODE;
export const isQuotaExceededError = e => e?.code === QUOTA_EXCEEDED_CODE;
// Upstream settings metadata is inert in this subset; the standalone store validates configuration.
const schema = new Proxy(function(){ return schema; }, { get: () => schema });
export default schema;
