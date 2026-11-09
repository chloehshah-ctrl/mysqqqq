'use strict';

const adminState = new Map();
const reactedMessages = new Map();

function getAdminList() {
  const list = global.GoatBot?.config?.adminBot || global.config?.adminBot || [];
  return Array.isArray(list) ? list.map(String) : [];
}

function isAdmin(senderID) {
  return getAdminList().includes(String(senderID));
}

function getFlowKey(event) {
  return `${event?.threadID || '0'}:${event?.senderID || '0'}`;
}

function shouldTriggerIris(body) {
  return typeof body === 'string' && /\biris\b/i.test(body);
}

function reactToMessage(api, event) {
  const messageID = String(event?.messageID || '');
  const threadID = String(event?.threadID || '');
  if (!messageID || !threadID || typeof api?.setMessageReaction !== 'function') return;

  // onChat and command dispatch can both see the same message; avoid duplicate reactions.
  if (reactedMessages.has(messageID)) return;
  reactedMessages.set(messageID, Date.now());
  setTimeout(() => reactedMessages.delete(messageID), 30000);

  try {
    // FCA API signature: reaction, message ID, thread ID, callback, forceCustomReaction.
    const result = api.setMessageReaction('🥷🏿', messageID, threadID, err => {
      if (err) console.error('[iris] Reaction failed:', err?.message || err);
    }, true);
    if (result && typeof result.catch === 'function') {
      result.catch(err => console.error('[iris] Reaction failed:', err?.message || err));
    }
  } catch (err) {
    console.error('[iris] Reaction failed:', err?.message || err);
  }
}

function pickReplyText(body) {
  const text = String(body || '').trim().toLowerCase();
  if (/\bmeron\b/i.test(text)) return 'meron';
  if (/\bwala\b/i.test(text)) return 'wala';
  return null;
}

function registerQuestion(threadID, senderID, questionID) {
  if (!global.GoatBot?.onReply) return;
  global.GoatBot.onReply.set(String(questionID), {
    commandName: 'iris',
    author: String(senderID),
    messageID: String(questionID),
    threadID: String(threadID)
  });
}

async function runIrisFlow({ api, event }) {
  if (!isAdmin(event.senderID)) return;

  const key = getFlowKey(event);
  const state = adminState.get(key) || { step: 0, questionMessageID: null };

  if (state.step === 0) {
    adminState.set(key, { step: 1, questionMessageID: event.messageID });
    const info = await api.sendMessage('yohooo', event.threadID, event.messageID);
    if (info?.messageID) registerQuestion(event.threadID, event.senderID, info.messageID);
    return;
  }

  adminState.set(key, { step: 2, questionMessageID: event.messageID });
  const info = await api.sendMessage('may kukulatain ba ako boss?', event.threadID, event.messageID);
  if (info?.messageID) registerQuestion(event.threadID, event.senderID, info.messageID);
}

module.exports = {
  config: {
    name: 'iris',
    aliases: ['kuwantom', 'qntm'],
    version: '1.1.3',
    author: 'Siegfried Samá',
    countDown: 0,
    role: 0,
    category: 'fun',
    description: { en: 'Admin keyword-triggered iris flow' },
    guide: { en: '{pn} iris' }
  },

  // React to the keyword from any user; do not run the admin-only conversation here.
  onChat: async function ({ api, event }) {
    if (!event || !shouldTriggerIris(event.body)) return;
    reactToMessage(api, event);
  },

  onReply: async function ({ api, event, Reply }) {
    if (!event || !event.body || !Reply || String(Reply.commandName || '') !== 'iris') return;
    if (String(event.senderID) !== String(Reply.author)) return;

    const answer = pickReplyText(event.body);
    if (!answer) return;

    adminState.delete(getFlowKey(event));
    if (global.GoatBot?.onReply) global.GoatBot.onReply.delete(String(Reply.messageID));

    if (answer === 'meron') {
      return api.sendMessage('sige boss, command mo lang ako wlang tulugan kami', event.threadID, event.messageID);
    }
    if (answer === 'wala') {
      return api.sendMessage('pasabi lang kong may kukulatain', event.threadID, event.messageID);
    }
  },

  onStart: async function ({ api, event, args }) {
    const body = (args || []).join(' ').trim();
    if (body && !shouldTriggerIris(body)) return;
    await runIrisFlow({ api, event });
  }
};

module.exports.run = module.exports.onStart;
