'use strict';

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const CACHE_DIR = path.join(__dirname, 'cache');
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function isBotAdmin(senderID) {
  const adminList = global.GoatBot?.config?.adminBot || [];
  return adminList.some(id => String(id) === String(senderID));
}

function callApiMethod(api, method, args, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = err => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve();
    };
    const timer = setTimeout(() => finish(new Error(`${method} timed out`)), timeoutMs);

    try {
      const result = api[method](...args, finish);
      if (result && typeof result.then === 'function') {
        result.then(() => finish(), finish);
      } else if (api[method].length <= args.length) {
        finish();
      }
    } catch (err) {
      finish(err);
    }
  });
}

async function changeGroupTitle(api, threadID, title) {
  const methods = [
    { name: 'setTitle', args: [title, threadID] },
    { name: 'changeThreadTitle', args: [title, threadID] },
    { name: 'changeThreadName', args: [threadID, title] },
    { name: 'setThreadName', args: [threadID, title] }
  ];

  for (const { name, args } of methods) {
    if (typeof api[name] !== 'function') continue;
    await callApiMethod(api, name, args);
    return;
  }
  throw new Error('Walang available na API para palitan ang pangalan ng group.');
}

async function changeGroupPhoto(api, imageBuffer, threadID) {
  // @dongdev/fca-unofficial expects (image, threadID, callback).
  // Pass the image bytes directly instead of a ReadStream, which is not
  // handled consistently by the installed FCA client.
  if (typeof api.changeGroupImage === 'function') {
    await callApiMethod(api, 'changeGroupImage', [imageBuffer, threadID], 30000);
    return;
  }
  if (typeof api.changeThreadImage === 'function') {
    await callApiMethod(api, 'changeThreadImage', [imageBuffer, threadID], 30000);
    return;
  }
  throw new Error('Walang changeGroupImage/changeThreadImage method ang FCA API na naka-install.');
}

async function downloadImage(url, filePath) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (_) {
    throw new Error('Hindi valid ang image URL.');
  }
  if (parsed.protocol !== 'https:') throw new Error('HTTPS image lang ang puwede.');

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 15000,
    maxContentLength: MAX_IMAGE_BYTES,
    maxBodyLength: MAX_IMAGE_BYTES,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const contentType = String(response.headers['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('image/')) throw new Error('Ang nireply na attachment ay hindi image.');
  const imageBuffer = Buffer.from(response.data);
  if (imageBuffer.length > MAX_IMAGE_BYTES) throw new Error('Lampas 8 MB ang image.');

  await fs.writeFile(filePath, imageBuffer);
  return imageBuffer;
}

module.exports = {
  config: {
    name: 'set',
    version: '1.0.2',
    author: 'Siegfried Samá',
    countDown: 5,
    role: 2,
    category: 'admin',
    description: { en: 'Palitan ang pangalan o larawan ng group chat (bot admin lang).' },
    guide: {
      en: '{pn} <bagong pangalan> — palitan ang pangalan ng group\nReply sa isang larawan gamit ang {pn} — palitan ang group photo'
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, senderID, isGroup } = event;
    if (!threadID || isGroup !== true) return message.reply('Group chat lang puwedeng gamitin ang command na ito.');
    if (!isBotAdmin(senderID)) return message.reply('Bot admin lang ang puwedeng gumamit ng command na ito.');

    const title = (args || []).join(' ').trim();
    if (title) {
      try {
        await changeGroupTitle(api, threadID, title);
      } catch (err) {
        console.error('[set] Group title update failed:', err?.message || err);
        return message.reply('❌ Hindi napalitan ang group name. Tingnan ang bot log para sa error.');
      }
      return;
    }

    const attachment = (event.messageReply?.attachments || []).find(item =>
      ['photo', 'image', 'animated_image'].includes(String(item?.type || '').toLowerCase()) &&
      typeof item?.url === 'string'
    );
    if (!attachment) {
      return message.reply('Mag-reply sa image gamit ang `set`, o gamitin ang `set <bagong pangalan>`.');
    }

    await fs.ensureDir(CACHE_DIR);
    const imagePath = path.join(CACHE_DIR, `set_group_photo_${threadID}_${Date.now()}.img`);
    try {
      const imageBuffer = await downloadImage(attachment.url, imagePath);
      await changeGroupPhoto(api, imageBuffer, threadID);
      // Silent on success, as requested.
    } catch (err) {
      console.error('[set] Group photo update failed:', err?.stack || err);
      return message.reply(`❌ Hindi napalitan ang group photo: ${err?.message || 'may error sa API'}`);
    } finally {
      await fs.remove(imagePath).catch(() => {});
    }
  }
};
