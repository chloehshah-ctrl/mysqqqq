'use strict';

const axios = require('axios');
const { Readable } = require('stream');

const RESEND_SETTING = 'data.resend';
const MAX_CACHED_MESSAGES = 500;
const MAX_ATTACHMENTS_PER_MESSAGE = 3;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const CACHE_TTL_MS = 30 * 60 * 1000;
const cachedMessages = new Map();

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
    maxRedirects: 0,
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
  let name = 'A user';
  try {
    name = await usersData.getName(saved.senderID) || name;
  } catch (_) {
    // The message can still be reposted if the user's display name is unavailable.
  }

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
    aliases: [],
    version: '2.1.0',
    author: 'Siegfried Samá',
    countDown: 3,
    role: 1,
    description: { en: 'Enable or disable reposting recalled messages in this group.' },
    category: 'box chat',
    guide: {
      en: '{pn} on — enable reposting recalled messages in this group\n{pn} off — disable it\n{pn} status — show the current setting'
    }
  },

  onStart: async function ({ args, event, threadsData, message }) {
    const option = String(args?.[0] || 'status').toLowerCase();
    if (!['on', 'off', 'status'].includes(option)) {
      return message.reply('Gamitin: resend on, resend off, o resend status.');
    }

    const threadID = event?.threadID;
    if (!threadID) return message.reply('Hindi makita ang group/thread para sa command na ito.');

    if (option === 'status') {
      const enabled = await threadsData.get(threadID, RESEND_SETTING, false);
      return message.reply(`Resend sa group na ito ay ${enabled ? 'ON' : 'OFF'}.`);
    }

    const enabled = option === 'on';
    await threadsData.set(threadID, enabled, RESEND_SETTING);
    return message.reply(enabled
      ? '✅ Naka-on ang resend sa group na ito. Maaaring ma-repost ang mga mensaheng i-unsend ng kahit sinong member.'
      : '✅ Naka-off ang resend sa group na ito.');
  },

  // GoatBot invokes onAnyEvent for incoming messages and message_unsend events.
  onAnyEvent: async function ({ api, event, threadsData, usersData }) {
    if (!event?.threadID || !event?.messageID || !event?.senderID) return;
    pruneCache();

    const threadID = String(event.threadID);
    const messageID = String(event.messageID);
    const senderID = String(event.senderID);
    const eventType = String(event.type || '').toLowerCase();

    try {
      const enabled = await threadsData.get(event.threadID, RESEND_SETTING, false);
      if (!enabled) {
        if (eventType === 'message_unsend') cachedMessages.delete(messageID);
        return;
      }

      if (eventType === 'message_unsend') {
        const saved = cachedMessages.get(messageID);
        cachedMessages.delete(messageID);
        if (!saved || saved.senderID !== senderID || saved.threadID !== threadID) return;
        await sendRecalledMessage(api, event, saved, usersData);
        return;
      }

      if (eventType && !['message', 'message_reply'].includes(eventType)) return;
      if (event.logMessageType || senderID === String(api.getCurrentUserID?.() || '')) return;

      const body = String(event.body || '');
      const attachments = Array.isArray(event.attachments) ? event.attachments : [];
      if (!body && !attachments.length) return;

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
        threadID,
        body,
        attachments: cachedAttachments,
        createdAt: Date.now()
      });
      pruneCache();
    } catch (err) {
      console.error('[resend] Failed to process message event:', err?.message || err);
    }
  }
};
