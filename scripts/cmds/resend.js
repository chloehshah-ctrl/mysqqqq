'use strict';

const axios = require('axios');
const { Readable } = require('stream');

const OPT_IN_PATH = 'data.resendOptInUsers';
const MAX_CACHED_MESSAGES = 500;
const MAX_ATTACHMENTS_PER_MESSAGE = 3;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const CACHE_TTL_MS = 30 * 60 * 1000;
const cachedMessages = new Map();

function isEnabledForThreadUsers(value, senderID) {
  return Array.isArray(value) && value.some(id => String(id) === String(senderID));
}

function isAllowedAttachmentUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return host === 'facebook.com' || host.endsWith('.facebook.com')
      || host === 'fbcdn.net' || host.endsWith('.fbcdn.net')
      || host === 'fbsbx.com' || host.endsWith('.fbsbx.com');
  } catch (_) {
    return false;
  }
}

function pruneCache() {
  const now = Date.now();
  for (const [messageID, item] of cachedMessages) {
    if (now - item.createdAt > CACHE_TTL_MS) cachedMessages.delete(messageID);
  }
  while (cachedMessages.size > MAX_CACHED_MESSAGES) {
    cachedMessages.delete(cachedMessages.keys().next().value);
  }
}

async function cacheAttachment(attachment) {
  if (!attachment?.url || !isAllowedAttachmentUrl(attachment.url)) return null;

  const response = await axios.get(attachment.url, {
    responseType: 'arraybuffer',
    timeout: 12000,
    maxContentLength: MAX_ATTACHMENT_BYTES,
    maxBodyLength: MAX_ATTACHMENT_BYTES,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const buffer = Buffer.from(response.data);
  if (!buffer.length || buffer.length > MAX_ATTACHMENT_BYTES) return null;

  return {
    buffer,
    filename: String(attachment.filename || attachment.name || `attachment_${Date.now()}`).replace(/[\\/\0]/g, '_'),
    contentType: String(attachment.contentType || response.headers['content-type'] || 'application/octet-stream')
  };
}

async function sendRecalledMessage(api, event, saved, usersData) {
  const name = await usersData.getName(saved.senderID).catch(() => 'A user');
  const bodyParts = [`↩️ ${name} unsent a message.`];
  if (saved.body) bodyParts.push(saved.body);

  const payload = { body: bodyParts.join('\n\n') };
  if (saved.attachments.length) {
    payload.attachment = saved.attachments.map(item => {
      const stream = Readable.from([item.buffer]);
      stream.path = item.filename;
      stream.contentType = item.contentType;
      return stream;
    });
  }

  await api.sendMessage(payload, event.threadID);
}

module.exports = {
  config: {
    name: 'resend',
    version: '2.0.0',
    author: 'Siegfried Samá',
    countDown: 3,
    role: 0,
    description: { en: 'Opt in/out of reposting your own unsent messages in this group.' },
    category: 'box chat',
    guide: { en: '{pn} on — allow the bot to repost your own unsent messages\n{pn} off — disable it' }
  },

  onStart: async function ({ args, event, threadsData, message }) {
    const option = String(args?.[0] || '').toLowerCase();
    if (!['on', 'off'].includes(option)) {
      return message.reply('Gamitin ang resend on para mag-opt in sa sarili mong unsent messages, o resend off para mag-opt out.');
    }

    const threadID = event.threadID;
    const senderID = String(event.senderID);
    const optedIn = await threadsData.get(threadID, OPT_IN_PATH, []);
    const next = new Set(Array.isArray(optedIn) ? optedIn.map(String) : []);

    if (option === 'on') next.add(senderID);
    else next.delete(senderID);

    await threadsData.set(threadID, [...next], OPT_IN_PATH);
    return message.reply(option === 'on'
      ? '✅ Naka-on: ire-repost lang ng bot ang sarili mong unsent messages sa group na ito.'
      : '✅ Naka-off: hindi na ire-repost ng bot ang sarili mong unsent messages.');
  },

  // Cache only messages from users who explicitly opted in. This hook receives
  // both normal messages and message_unsend events in this bot's event loader.
  onAnyEvent: async function ({ api, event, threadsData, usersData }) {
    if (!event?.threadID || !event?.messageID || !event?.senderID) return;
    pruneCache();

    const messageID = String(event.messageID);
    const senderID = String(event.senderID);
    const eventType = String(event.type || '').toLowerCase();

    if (eventType === 'message_unsend') {
      const saved = cachedMessages.get(messageID);
      cachedMessages.delete(messageID);
      if (!saved || saved.senderID !== senderID || saved.threadID !== String(event.threadID)) return;

      try {
        const optedIn = await threadsData.get(event.threadID, OPT_IN_PATH, []);
        if (!isEnabledForThreadUsers(optedIn, senderID)) return;
        await sendRecalledMessage(api, event, saved, usersData);
      } catch (err) {
        console.error('[resend] Failed to repost opted-in unsent message:', err?.message || err);
      }
      return;
    }

    if (eventType && !['message', 'message_reply'].includes(eventType)) return;
    if (event.logMessageType) return;

    const body = String(event.body || '');
    const attachments = Array.isArray(event.attachments) ? event.attachments : [];
    if (!body && !attachments.length) return;

    try {
      const optedIn = await threadsData.get(event.threadID, OPT_IN_PATH, []);
      if (!isEnabledForThreadUsers(optedIn, senderID)) return;

      const cachedAttachments = [];
      for (const attachment of attachments.slice(0, MAX_ATTACHMENTS_PER_MESSAGE)) {
        try {
          const cached = await cacheAttachment(attachment);
          if (cached) cachedAttachments.push(cached);
        } catch (err) {
          console.warn('[resend] Could not cache an attachment:', err?.message || err);
        }
      }

      cachedMessages.set(messageID, {
        senderID,
        threadID: String(event.threadID),
        body,
        attachments: cachedAttachments,
        createdAt: Date.now()
      });
      pruneCache();
    } catch (err) {
      console.error('[resend] Failed to cache opted-in message:', err?.message || err);
    }
  }
};
