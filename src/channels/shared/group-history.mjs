export function groupHistoryAttachments(message) {
  const attachments = [];
  for (const [type, sources] of [['image', message?.images], ['file', message?.files]]) {
    for (const [index, source] of (sources ?? []).entries()) {
      attachments.push({ ...source, key: `${type}:${index}`,
        name: source.name ?? source.fileName ?? `${type}-${index + 1}`,
        mediaType: source.mediaType ?? source.mimeType,
        load: source.loadStream ?? source.load,
      });
    }
  }
  return attachments;
}

export function groupHistoryEntry(channel, raw, message, { scope = '', groupName } = {}) {
  // [dsh-qq-free-bot] 裁剪：上游按渠道 if 链分派 whatsapp/telegram/discord/slack，
  // 但 QQ 在 qq-bridge.mjs 里手工构造 entry，并不走这个函数。
  // 本产品只保留 QQ，故此处不再分派其它渠道。
  const common = { channel, scope, groupName, senderId: message.senderId,
    senderName: message.contextSource?.()?.senderName, attachments: groupHistoryAttachments(message) };
  if (channel === 'qq') return { ...common, groupId: raw.groupId ?? raw.chatId ?? '',
    messageId: raw.messageId ?? raw.id ?? '', sentAt: raw.sentAt ?? raw.timestamp ?? 0,
    text: raw.text ?? message.content ?? '', type: 'text' };
  return null;
}

/** Record received groups before the response gate, without requiring a mention or an AI session. */
export async function captureGroupHistory(store, message, entry, { logger = console } = {}) {
  if (!store || !entry || message?.kind !== 'group') return message;
  try {
    const context = await store.capture({ ...entry,
      senderId: entry.senderId ?? message.senderId,
      text: entry.text ?? message.content ?? '',
      attachments: entry.attachments ?? groupHistoryAttachments(message),
    });
    // A context is a live service reference, not a model-controlled group selector.
    if (context) message.groupHistory = context;
  } catch (error) {
    logger.warn?.('[dsh-im] unable to save group message:', error?.message ?? 'archive unavailable');
  }
  return message;
}
