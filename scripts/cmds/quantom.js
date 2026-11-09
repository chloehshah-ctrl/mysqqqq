'use strict';

const adminState = new Map();

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

function reactToMessage(api, event) {
  try {
    const p = api?.setMessageReaction?.('🥷🏿', event?.messageID, () => {}, true);
    if (p?.catch) p.catch(() => {});
  } catch (_) {}
}

function pickReplyText(body) {
  const text = String(body || '').trim().toLowerCase();
  if (/\bmeron\b/i.test(text)) return 'meron';
  if (/\bwala\b/i.test(text)) return 'wala';
  return null;
}

function shouldTriggerIris(body) {
  return typeof body === 'string' && /\biris\b/i.test(body);
}

function registerQuestion(api, threadID, senderID, questionID) {
  if (!global.GoatBot?.onReply) return;
  global.GoatBot.onReply.set(String(questionID), {
    commandName: 'iris',
    author: String(senderID),
    messageID: String(questionID),
    threadID: String(threadID)
  });
}

async function runIrisFlow({ api, event }) {
  reactToMessage(api, event);
  if (!isAdmin(event.senderID)) return;

  const key = getFlowKey(event);
  const state = adminState.get(key) || { step: 0, questionMessageID: null };

  if (state.step === 0) {
    adminState.set(key, { step: 1, questionMessageID: event.messageID });
    const info = await api.sendMessage('yohooo', event.threadID, event.messageID);
    if (info?.messageID) registerQuestion(api, event.threadID, event.senderID, info.messageID);
    return;
  }

  adminState.set(key, { step: 2, questionMessageID: event.messageID });
  const info = await api.sendMessage('may kukulatain ba ako boss?', event.threadID, event.messageID);
  if (info?.messageID) registerQuestion(api, event.threadID, event.senderID, info.messageID);
}

module.exports = {
  config: {
    name: 'iris',
    aliases: ['kuwantom', 'qntm'],
    version: '1.1.1',
    author: 'Siegfried Samá',
    countDown: 0,
    role: 0,
    category: 'fun',
    description: { en: 'Admin keyword-triggered iris flow' },
    guide: { en: '{pn} iris' }
  },

  onChat: async function ({ api, event }) {
    if (!event || !event.body || !shouldTriggerIris(event.body)) return;
    await runIrisFlow({ api, event });
  },

  onReply: async function ({ api, event, Reply }) {
    if (!event || !event.body || !Reply || String(Reply.commandName || '') !== 'iris') return;
    if (String(event.senderID) !== String(Reply.author)) return;

    const answer = pickReplyText(event.body);
    if (!answer) return;

    const key = getFlowKey(event);
    adminState.delete(key);

    if (global.GoatBot?.onReply) {
      global.GoatBot.onReply.delete(String(Reply.messageID));
    }

    if (answer === 'meron') {
      return api.sendMessage('sige boss, command mo lang ako wlang tulugan kami', event.threadID, event.messageID);
    }

    if (answer === 'wala') {
      return api.sendMessage('pasabi lang kong may kukulatain', event.threadID, event.messageID);
    }
  },

  onStart: async function ({ api, event, args }) {
    const body = (args || []).join(' ').trim();
    // The command itself (iris) should run without needing to repeat the keyword.
    if (body && !shouldTriggerIris(body)) return;
    await runIrisFlow({ api, event });
  }
};

module.exports.run = module.exports.onStart;
