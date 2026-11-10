'use strict';

const axios = require('axios');
const { Readable } = require('stream');

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
    // Continue if the sender's display name is unavailable.
  }

  const bodyParts = [`${name} unsent a message.`];
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
    version: '2.2.0',
    author: 'Siegfried Samá',
    countDown: 0,
    role: 0,
    description: { en: 'Automatically repost messages when they are unsent.' },
    category: 'box chat',
    guide: { en: 'Automatic. No command needed.' }
  },

  // GoatBot invokes onAnyEvent for incoming messages and message_unsend events.
  // Reposting is active by default; no command or per-thread setting is needed.
  onAnyEvent: async function ({ api, event, usersData }) {
    if (!event?.threadID || !event?.messageID || !event?.senderID) return;
    pruneCache();

    const threadID = String(event.threadID);
    const messageID = String(event.messageID);
    const senderID = String(event.senderID);
    const eventType = String(event.type || '').toLowerCase();

    if (eventType === 'message_unsend') {
      const saved = cachedMessages.get(messageID);
      cachedMessages.delete(messageID);
      if (!saved || saved.senderID !== senderID || saved.threadID !== threadID) return;

      try {
        await sendRecalledMessage(api, event, saved, usersData);
      } catch (err) {
        console.error('[resend] Failed to repost recalled message:', err?.message || err);
      }
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
  }
};
