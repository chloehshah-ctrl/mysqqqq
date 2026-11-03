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

async function changeGroupTitle(api, threadID, title) {
  if (typeof api.changeThreadTitle === 'function') {
    await api.changeThreadTitle(title, threadID);
    return;
  }
  if (typeof api.changeThreadName === 'function') {
    await api.changeThreadName(threadID, title);
    return;
  }
  throw new Error('Walang available na API para palitan ang pangalan ng group.');
}

function changeGroupPhoto(api, imagePath, threadID) {
  const method = api.changeGroupImage || api.changeThreadImage;
  if (typeof method !== 'function') {
    throw new Error('Hindi suportado ng bot API ang pagpapalit ng group photo.');
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = err => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve();
    };
    const timer = setTimeout(() => finish(new Error('Nag-timeout ang pagpapalit ng group photo.')), 30000);

    try {
      const result = method.call(api, fs.createReadStream(imagePath), threadID, finish);
      if (result && typeof result.then === 'function') result.then(() => finish(), finish);
    } catch (err) {
      finish(err);
    }
  });
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
  if (response.data.byteLength > MAX_IMAGE_BYTES) throw new Error('Lampas 8 MB ang image.');

  await fs.writeFile(filePath, Buffer.from(response.data));
}

module.exports = {
  config: {
    name: 'set',
    version: '1.0.0',
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
        return message.reply(`✅ Napalitan ang pangalan ng group sa: ${title}`);
      } catch (err) {
        console.error('[set] Group title update failed:', err?.message || err);
        return message.reply(`❌ Hindi napalitan ang pangalan ng group: ${err?.message || 'may error sa API'}`);
      }
    }

    const attachment = (event.messageReply?.attachments || []).find(item =>
      ['photo', 'image', 'animated_image'].includes(String(item?.type || '').toLowerCase()) &&
      typeof item?.url === 'string'
    );
    if (!attachment) {
      return message.reply('Gamitin ang `set <bagong pangalan>`, o mag-reply sa isang larawan gamit ang `set`.');
    }

    await fs.ensureDir(CACHE_DIR);
    const imagePath = path.join(CACHE_DIR, `set_group_photo_${threadID}_${Date.now()}.img`);
    try {
      await downloadImage(attachment.url, imagePath);
      await changeGroupPhoto(api, imagePath, threadID);
      return message.reply('✅ Napalitan ang group photo.');
    } catch (err) {
      console.error('[set] Group photo update failed:', err?.message || err);
      return message.reply(`❌ Hindi napalitan ang group photo: ${err?.message || 'may error sa API'}`);
    } finally {
      await fs.remove(imagePath).catch(() => {});
    }
  }
};
