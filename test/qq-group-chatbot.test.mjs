import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyQqGroupChatbotTrigger,
  isQqMessageAddressed,
  isQqPassiveGroupChatbotMessage,
  normalizeQqGroupChatbotConfig,
  normalizeQqMentions,
} from '../src/channels/qq/qq-mention.mjs';

test('ordinary group messages trigger the chatbot without a mention', () => {
  const message = {
    kind: 'group',
    rawEventType: 'GROUP_MESSAGE_CREATE',
    senderId: 'member-1',
    content: '这电影结尾有点仓促',
  };

  assert.equal(isQqMessageAddressed(message), false);
  assert.equal(applyQqGroupChatbotTrigger(message), true);
  assert.equal(isQqMessageAddressed(message), true);
  assert.equal(isQqPassiveGroupChatbotMessage(message), true);
});

test('explicit group mentions keep their original command semantics', () => {
  const message = normalizeQqMentions({
    kind: 'group',
    rawEventType: 'GROUP_AT_MESSAGE_CREATE',
    senderId: 'member-1',
    content: '<@bot-app> /status',
  }, new Set(['bot-app']));

  assert.equal(message.content, '/status');
  assert.equal(isQqMessageAddressed(message), true);
  assert.equal(applyQqGroupChatbotTrigger(message), false);
  assert.equal(isQqPassiveGroupChatbotMessage(message), false);
});

test('unmentioned group slash commands still require an explicit mention', () => {
  const message = {
    kind: 'group',
    rawEventType: 'GROUP_MESSAGE_CREATE',
    senderId: 'member-1',
    content: '/model 2',
  };

  assert.equal(applyQqGroupChatbotTrigger(message), false);
  assert.equal(isQqMessageAddressed(message), false);
});

test('the group chatbot can be disabled or given custom guidance', () => {
  assert.equal(normalizeQqGroupChatbotConfig(false).enabled, false);
  assert.equal(normalizeQqGroupChatbotConfig(false).guidance, '');
  assert.equal(normalizeQqGroupChatbotConfig({ guidance: '只吐槽，不总结。' }).guidance, '只吐槽，不总结。');

  const message = {
    kind: 'group',
    rawEventType: 'GROUP_MESSAGE_CREATE',
    senderId: 'member-1',
    content: '测试',
  };
  assert.equal(applyQqGroupChatbotTrigger(message, false), false);
});

test('direct messages and bot-authored group messages are not passive triggers', () => {
  const direct = { kind: 'c2c', senderId: 'user-1', content: '你好' };
  const botMessage = {
    kind: 'group',
    rawEventType: 'GROUP_MESSAGE_CREATE',
    senderId: 'bot-2',
    senderIsBot: true,
    content: '机器人消息',
  };

  assert.equal(applyQqGroupChatbotTrigger(direct), false);
  assert.equal(isQqMessageAddressed(direct), true);
  assert.equal(applyQqGroupChatbotTrigger(botMessage), false);
  assert.equal(isQqMessageAddressed(botMessage), false);
});
