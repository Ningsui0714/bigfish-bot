// Keep the decision after the SDK sanitizes the mention out of the content.
const addressedToBot = Symbol('qq.addressedToBot');
const passiveGroupChatbot = Symbol('qq.passiveGroupChatbot');

export const DEFAULT_QQ_GROUP_CHATBOT_GUIDANCE = `你正在参与一个 QQ 群聊。请针对用户刚发送的内容作出简短、具体、自然的评价或接话：
- 优先回应内容本身，不要复述来源信息或解释自己的任务；
- 通常控制在 1 到 3 句话，有明确问题时直接回答；
- 保持有观点但不过度攻击，不为凑字数强行总结。`;

export const DEFAULT_QQ_GROUP_CHATBOT_CONFIG = Object.freeze({
  enabled: true,
  guidance: DEFAULT_QQ_GROUP_CHATBOT_GUIDANCE,
});

/** Normalize the host-level QQ group chatbot setting. */
export function normalizeQqGroupChatbotConfig(value) {
  if (value === false) return Object.freeze({ enabled: false, guidance: '' });
  if (!value || value === true || typeof value !== 'object' || Array.isArray(value)) {
    return DEFAULT_QQ_GROUP_CHATBOT_CONFIG;
  }
  const enabled = value.enabled !== false;
  const guidance = Object.hasOwn(value, 'guidance') && typeof value.guidance === 'string'
    ? value.guidance.trim().slice(0, 4_000)
    : DEFAULT_QQ_GROUP_CHATBOT_GUIDANCE;
  return Object.freeze({ enabled, guidance });
}

function selfMentions(message) {
  return Array.isArray(message?.mentions)
    ? message.mentions.filter((mention) => mention?.is_you === true)
    : [];
}

export function isQqMessageAddressed(message) {
  return Boolean(message) && (message.kind !== 'group'
    || message[addressedToBot] === true
    || message.rawEventType === 'GROUP_AT_MESSAGE_CREATE'
    || selfMentions(message).length > 0);
}

export function isQqPassiveGroupChatbotMessage(message) {
  return message?.kind === 'group' && message[passiveGroupChatbot] === true;
}

/**
 * Turn an ordinary group message into a chatbot turn without weakening the
 * existing rule that slash commands in groups require an explicit mention.
 */
export function applyQqGroupChatbotTrigger(message, value) {
  if (!message || message.kind !== 'group' || message.senderIsBot === true) return false;
  if (isQqMessageAddressed(message)) return false;
  const config = normalizeQqGroupChatbotConfig(value);
  if (!config.enabled) return false;
  const content = typeof message.content === 'string' ? message.content.trim() : '';
  if (content.startsWith('/')) return false;
  message[addressedToBot] = true;
  message[passiveGroupChatbot] = true;
  return true;
}

/** Restore the trigger decision captured before a queued message was persisted. */
export function restoreQqPassiveGroupChatbotTrigger(message) {
  if (!message || message.kind !== 'group') return message;
  message[addressedToBot] = true;
  message[passiveGroupChatbot] = true;
  return message;
}

/** botIds belongs to one runtime; only platform-marked self mentions add IDs. */
export function normalizeQqMentions(message, botIds = new Set()) {
  if (message?.kind !== 'group') return message;
  for (const mention of selfMentions(message)) {
    for (const id of [mention.id, mention.user_openid, mention.member_openid]) {
      if (typeof id === 'string' && id.trim()) botIds.add(id.trim());
    }
  }
  const marker = /<@!?([^<>\s]+)>/gu;
  const content = typeof message.content === 'string' ? message.content : '';
  // raw.content is still the current message, never the quoted message snapshot.
  const rawContent = typeof message.raw?.content === 'string' ? message.raw.content : '';
  const mentioned = isQqMessageAddressed(message)
    || [...`${content}\n${rawContent}`.matchAll(marker)].some((match) => botIds.has(match[1]));
  // Match the SDK sanitizer's in-place contract: later sender enrichment must
  // remain visible to the existing queued message and source-context capture.
  message[addressedToBot] = mentioned;
  message.content = content.replace(/<@!?([^<>\s]+)>[ \t]*/gu,
    (match, id) => botIds.has(id) ? '' : match).trim();
  return message;
}
