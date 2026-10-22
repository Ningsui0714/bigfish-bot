/**
 * Kilo 兜底车道。
 *
 * ## 它是什么
 *
 * Kilo AI 的公共网关在 `/models` 里明确标注 `isFree: true` 与
 * 「no credits required」—— 这是厂商自己开放的免费池，**不需要任何账号、
 * Key 或伪装**。请求直接打过去，`usage.cost` 实测为 0。
 *
 * ## 为什么它只是兜底
 *
 * Kilo 的免费池里**没有 DeepSeek**。实测（2026-10-21）免费清单共 17 个模型，
 * 全部是 MiniMax、NVIDIA Nemotron、Reflection Beam、Stealth、Dots、Liquid、
 * Poolside、Cohere 这类。
 *
 * 所以本产品的模型契约是「目录里只提供 DeepSeek」，Kilo 不进模型选择器 ——
 * 它一旦出现，QQ 用户的预期就破了。它的位置是**降级链的最后一环**：当所有
 * DeepSeek 账号渠道都不可用（积分领完、登录过期、上游下线）时，让机器人至少
 * 还能回一句话，而不是直接报错。
 *
 * 这个车道**默认关闭**，需要用户在设置页显式开启 —— 让用户明确知道「这时回答
 * 你的不是 DeepSeek」。
 *
 * @module src/product/kilo-adapter.js
 */

import { fetchKiloListing, postKiloStreamed, KILO_BASE } from '../model/kilo.js';
import { CODE } from '../model/http.js';
import { isDeepSeekModel } from './deepseek-filter.js';

/** 兜底车道的 provider 路由 id。 */
export const KILO_PROVIDER = 'dsh-free-fallback';
export const KILO_LABEL = '免费兜底（非 DeepSeek）';

/** 兜底车道使用的模型：Kilo 的自动路由池。 */
export const KILO_MODEL = 'kilo-auto/free';

/**
 * 把回调式的 SSE 生产者桥接成异步迭代器。
 *
 * `postKiloStreamed` 每收到一帧就同步调一次 `onData`；而 async generator 不能
 * 从回调里 `yield`。这个队列就是两者之间的桥：生产者 `push` 不阻塞，消费者
 * `read()` 没数据时挂起等待。
 *
 * `undefined` 结束、`Error` 失败 —— 与上游 `src/channel.js` 同一个约定。
 *
 * @returns {{push: (value: string|object|undefined|Error) => void, read: () => AsyncGenerator<string|object>}}
 */
function createQueue() {
  /** @type {Array<unknown>} */
  const queue = [];
  /** @type {Array<(value: unknown) => void>} */
  const waiting = [];
  let ended = false;
  return {
    push(value) {
      if (ended) return;
      const resolve = waiting.shift();
      if (resolve !== undefined) resolve(value);
      else queue.push(value);
      if (value === undefined || value instanceof Error) ended = true;
    },
    async *read() {
      while (true) {
        const next = queue.length > 0 ? queue.shift() : await new Promise((resolve) => waiting.push(resolve));
        if (next instanceof Error) throw next;
        if (next === undefined) return;
        yield next;
      }
    },
  };
}

/**
 * Kilo 适配器。
 */
export class KiloFallbackAdapter {
  /**
   * @param {object} [options]
   * @param {object} [options.logger]
   */
  constructor({ logger = console } = {}) {
    this.logger = logger;
    /** @type {Array<{id: string, name: string, contextWindow: number, maxOutput: number, vision: boolean}>} */
    this.rows = [];
  }

  providerInfo(provider) {
    return { id: provider, name: KILO_LABEL };
  }

  providerRetryPolicy() {
    return Object.freeze({
      mode: 'normal',
      maxRetries: 1,
      retryableCodes: Object.freeze(['EMPTY_RESPONSE', 'SERVER', 'TIMEOUT', 'TRANSPORT']),
      initialDelayMs: 700,
      maxDelayMs: 8000,
      jitterRatio: 0.2,
    });
  }

  imageRequestPricing() {
    return undefined;
  }

  /**
   * 拉取 Kilo 的免费模型清单。
   *
   * 只保留 `isFree` 的条目 —— 付费 id 在这个网关上会回
   * `PAID_MODEL_AUTH_REQUIRED`，把它们列进目录只会让用户选到一个必然失败的
   * 模型。
   */
  async refresh() {
    const listing = await fetchKiloListing();
    const rows = Array.isArray(listing?.data) ? listing.data : [];
    this.rows = rows
      .filter((row) => row?.isFree === true)
      .map((row) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? row.id ?? ''),
        contextWindow: Number(row.context_length ?? 0)
          || Number(row?.top_provider?.context_length ?? 0)
          || 131072,
        maxOutput: Number(row?.top_provider?.max_completion_tokens ?? 0) || 8192,
        vision: (row?.architecture?.input_modalities ?? []).includes('image'),
      }))
      .filter((row) => row.id !== '');
    return this.rows;
  }

  /**
   * 兜底车道**不向模型选择器广播任何模型**。
   *
   * 它只作为降级链的最后一环被内部调用，不该在 UI 里变成一个可选项 ——
   * 「目录里只有 DeepSeek」是产品的硬契约。
   */
  async listModels() {
    return [];
  }

  async resolveModel(provider, model) {
    const row = this.rows.find((candidate) => candidate.id === model);
    return {
      provider,
      id: model,
      name: row?.name ?? model,
      inputModalities: row?.vision ? ['text', 'image'] : ['text'],
      context: { contextWindow: row?.contextWindow ?? 131072 },
      defaultMaxTokens: row?.maxOutput ?? 8192,
    };
  }

  async prepareCall(provider, model) {
    return {
      model: await this.resolveModel(provider, model),
      stream: (options) => this.stream(options),
    };
  }

  /**
   * 一次调用。
   */
  async * stream(options) {
    const model = String(options?.model ?? KILO_MODEL);
    const signal = options?.signal;

    const body = {
      model,
      messages: toChatMessages(options?.messages ?? [], options?.system),
      stream: true,
    };
    if (typeof options?.maxTokens === 'number') body.max_tokens = options.maxTokens;
    if (typeof options?.temperature === 'number') body.temperature = options.temperature;
    if (Array.isArray(options?.tools) && options.tools.length > 0) body.tools = options.tools;

    const queue = createQueue();
    /** @type {string|null} */
    let upstreamFinish = null;

    // 生产者：把 SSE 帧解析成 DSH 的 StreamChunk 推进队列。
    //
    // ⚠️ `onData` 收到的是 **SSE 的 data 段字符串**（见 `http.js` 的
    // `readSse`：`onData(payload)`，payload 是 JSON 文本）。必须自己 `JSON.parse`，
    // 直接当对象用会永远拿不到 `choices`。
    postKiloStreamed({
      body,
      signal,
      onData: (raw) => {
        let payload;
        try {
          payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
        } catch {
          // 网关偶尔会发 `: KILO PROCESSING` 之类的注释帧，readSse 已经滤掉；
          // 这里再兜一次，不因为一帧坏数据结束整轮。
          return;
        }
        const choice = payload?.choices?.[0];
        if (choice?.finish_reason) upstreamFinish = String(choice.finish_reason);
        const delta = choice?.delta ?? choice?.message;
        if (!delta) return;

        const reasoning = typeof delta.reasoning === 'string' ? delta.reasoning : '';
        if (reasoning !== '') {
          queue.push({ type: 'block-start', index: 0, blockType: 'reasoning' });
          queue.push({ type: 'reasoning-delta', index: 0, text: reasoning });
        }
        const content = typeof delta.content === 'string' ? delta.content : '';
        if (content !== '') {
          queue.push({ type: 'block-start', index: 0, blockType: 'text' });
          queue.push({ type: 'text-delta', index: 0, text: content });
        }
        for (const call of Array.isArray(delta.tool_calls) ? delta.tool_calls : []) {
          const index = Number.isInteger(call?.index) ? call.index : 0;
          const id = typeof call?.id === 'string' && call.id !== '' ? call.id : `kilo-call-${index}`;
          const name = typeof call?.function?.name === 'string' ? call.function.name : '';
          const argumentsDelta = typeof call?.function?.arguments === 'string' ? call.function.arguments : '';
          if (name !== '') {
            queue.push({ type: 'block-start', index, blockType: 'tool-call' });
          }
          queue.push({
            type: 'tool-call-delta',
            index,
            id,
            ...(name !== '' ? { name } : {}),
            argumentsDelta,
          });
        }
      },
    })
      .then(() => queue.push(undefined))
      .catch((error) => queue.push(error instanceof Error ? error : new Error(String(error))));

    let sawText = false;
    try {
      for await (const chunk of queue.read()) {
        if (chunk?.type === 'text-delta') sawText = true;
        yield chunk;
      }
    } catch (error) {
      yield {
        type: 'finish',
        reason: {
          kind: 'error',
          failure: {
            message: error?.message ?? String(error),
            code: error?.code ?? CODE.server,
          },
        },
      };
      return;
    }

    // 上游通常会在最后一帧带 `finish_reason`。没有的话按「有没有正文」推断 ——
    // 一轮完全没输出属于 EMPTY_RESPONSE，不是正常结束。
    yield {
      type: 'finish',
      reason: finishReasonFor(upstreamFinish, sawText),
    };
  }
}

/**
 * 把上游的 `finish_reason` 映射成 DSH 的 FinishReason。
 *
 * @param {string|null} upstream
 * @param {boolean} sawText 这一轮有没有产出正文
 */
function finishReasonFor(upstream, sawText) {
  if (upstream === 'length') return { kind: 'max-tokens' };
  if (upstream === 'tool_calls' || upstream === 'function_call') return { kind: 'tool-calls' };
  if (upstream === 'content_filter') {
    return {
      kind: 'error',
      failure: { message: '上游内容过滤器中断了这一轮', code: CODE.client },
    };
  }
  if (upstream !== null) return { kind: 'stop' };
  if (!sawText) {
    return {
      kind: 'error',
      failure: { message: '免费兜底车道没有返回任何内容', code: CODE.empty },
    };
  }
  return { kind: 'stop' };
}

/**
 * 把 DSH 的消息形状转成 OpenAI 的 chat 形状。
 *
 * 必须保留**工具调用与工具结果**：QQ 机器人背后是 agent，丢掉这些会让模型
 * 看不到自己上一步做了什么，多步任务直接崩。
 *
 * @param {Array<object>} messages
 * @param {string} [system]
 * @returns {Array<object>}
 */
function toChatMessages(messages, system) {
  const result = [];
  if (typeof system === 'string' && system !== '') {
    result.push({ role: 'system', content: system });
  }
  for (const message of messages) {
    if (!message || typeof message !== 'object') continue;
    const role = typeof message.role === 'string' ? message.role : 'user';
    const content = message.content;

    if (typeof content === 'string') {
      result.push({ role, content });
      continue;
    }
    if (!Array.isArray(content)) continue;

    const texts = [];
    const images = [];
    const toolCalls = [];
    const toolResults = [];

    for (const block of content) {
      if (!block || typeof block !== 'object') continue;
      switch (block.type) {
        case 'text':
          if (typeof block.text === 'string') texts.push(block.text);
          break;
        case 'reasoning':
          // 思考内容不回传给上游：它不属于可见对话，多数网关会拒绝。
          break;
        case 'image': {
          const url = imageUrlOf(block);
          if (url !== null) images.push({ type: 'image_url', image_url: { url } });
          break;
        }
        case 'tool-call':
          toolCalls.push({
            id: String(block.id ?? ''),
            type: 'function',
            function: {
              name: String(block.name ?? ''),
              arguments: typeof block.arguments === 'string' ? block.arguments : '{}',
            },
          });
          break;
        case 'tool-result':
          toolResults.push({
            role: 'tool',
            tool_call_id: String(block.toolCallId ?? block.id ?? ''),
            content: toolResultText(block),
          });
          break;
        default:
          break;
      }
    }

    // 工具结果是独立的 assistant/tool 消息对，必须先展开。
    if (toolResults.length > 0) {
      result.push(...toolResults);
      if (texts.length > 0) result.push({ role, content: texts.join('\n') });
      continue;
    }

    if (toolCalls.length > 0) {
      result.push({
        role,
        content: texts.length > 0 ? texts.join('\n') : null,
        tool_calls: toolCalls,
      });
      continue;
    }

    if (images.length > 0) {
      const parts = texts.map((text) => ({ type: 'text', text }));
      result.push({ role, content: [...parts, ...images] });
      continue;
    }

    if (texts.length > 0) result.push({ role, content: texts.join('\n') });
  }
  return result;
}

/** 从 image block 里取一个可用的 URL（data URL 或远端地址）。 */
function imageUrlOf(block) {
  if (typeof block.url === 'string' && block.url !== '') return block.url;
  if (typeof block.data === 'string' && block.data !== '') {
    return `data:${block.mediaType ?? 'image/png'};base64,${block.data}`;
  }
  return null;
}

/** 工具结果的纯文本投影。 */
function toolResultText(block) {
  if (typeof block.text === 'string') return block.text;
  if (typeof block.content === 'string') return block.content;
  if (Array.isArray(block.content)) {
    return block.content
      .filter((part) => part?.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('\n');
  }
  try {
    return JSON.stringify(block.content ?? '');
  } catch {
    return '';
  }
}

export { KILO_BASE };
