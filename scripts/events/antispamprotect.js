const savedThreadInfo = new Map();

const NAME_ROASTS = [
  "[name] bobo to ah, sino nagsabi sayo na pwede palitan ang group gc?🤔",
  "[name] kick kana tanga, tas subo mo utenko",
  "[name], feeling admin ka ba? supa mo utenko",
  "[name] bye bitch",
  "[name] feeling admin si tanga, alis ka 👍🏿",
  "[name] pinalitan nanaman, bye bitch 🫩",
  "tanga kaba [name]? alam mo bang pinoprotektahan ko ang gc nato 🤔",
  "[name] alis dog",
  "bye [name] sana sinupa mo nalang ako"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAdminIDs(threadData) {
  const adminIDs = threadData?.adminIDs || [];
  return adminIDs.map(admin => {
    if (admin && typeof admin === 'object') {
      return String(admin.id || admin.userID || admin.uid || '');
    }
    return String(admin || '');
  }).filter(Boolean);
}

function getImageUrl(logMessageData) {
  return logMessageData?.image?.url || logMessageData?.url || logMessageData?.imageSrc || null;
}

function updateSavedThreadInfo(threadID, changes = {}) {
  const current = savedThreadInfo.get(String(threadID)) || {};
  savedThreadInfo.set(String(threadID), { ...current, ...changes });
}

function callApi(api, method, args, timeoutMs = 20000) {
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
      if (result && typeof result.then === 'function') result.then(() => finish(), finish);
      else if (api[method].length <= args.length) finish();
    } catch (err) {
      finish(err);
    }
  });
}

async function restoreThreadName(api, threadID, title) {
  if (!title || typeof api.setTitle !== 'function') return;
  await callApi(api, 'setTitle', [title, threadID]);
}

async function restoreThreadImage(api, threadID, imageUrl) {
  if (!imageUrl) throw new Error('Walang naka-save na dating group photo URL para maibalik.');
  if (typeof api.changeGroupImage !== 'function') {
    throw new Error('Hindi available ang api.changeGroupImage sa kasalukuyang FCA client.');
  }

  const axios = require('axios');
  const { Readable } = require('stream');
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 20000,
    maxContentLength: 8 * 1024 * 1024,
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const imageStream = Readable.from(Buffer.from(response.data));
  try {
    await callApi(api, 'changeGroupImage', [imageStream, threadID], 30000);
  } finally {
    imageStream.destroy();
  }
}

async function roastAndKick(api, threadID, userID, name, roastPool) {
  const rawRoast = getRandom(roastPool);
  const body = rawRoast.replace(/\[name\]/g, name);

  const mentions = [];
  let idx = 0;
  while ((idx = body.indexOf(name, idx)) !== -1) {
    mentions.push({ tag: name, id: userID, fromIndex: idx });
    idx += name.length;
  }

  await new Promise(resolve => api.sendMessage({ body, mentions }, threadID, resolve));
  await new Promise(resolve => setTimeout(resolve, 1500));
  await new Promise(resolve => api.removeUserFromGroup(userID, threadID, resolve));
}

module.exports = {
  config: {
    name: "antispamprotect",
    version: "1.0.3",
    author: "Siegfried Samá",
    category: "events"
  },

  onLoad: async function ({ threadsData }) {
    // Snapshot the legitimate group name/photo before any change event arrives.
    try {
      const threads = await threadsData.getAll();
      for (const thread of threads || []) {
        if (!thread?.threadID) continue;
        savedThreadInfo.set(String(thread.threadID), {
          threadName: thread.threadName || null,
          imageSrc: thread.imageSrc || null
        });
      }
    } catch (err) {
      console.error('[antispamprotect] Failed to load group info snapshots:', err?.message || err);
    }
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    const { logMessageType, logMessageData, threadID, author } = event;
    const allowedEvents = ["log:thread-name", "log:thread-image"];
    if (!allowedEvents.includes(logMessageType) || !threadID) return;

    const botID = String(api.getCurrentUserID());
    const authorID = String(author || '');
    const threadKey = String(threadID);

    try {
      const threadData = await threadsData.get(threadID);
      const cached = savedThreadInfo.get(threadKey) || {};

      // Changes made by the bot are allowed and become the new rollback baseline.
      if (!authorID || authorID === botID) {
        if (logMessageType === 'log:thread-name') {
          updateSavedThreadInfo(threadID, { threadName: logMessageData?.name || null });
        } else {
          updateSavedThreadInfo(threadID, { imageSrc: getImageUrl(logMessageData) || null });
        }
        return;
      }

      let adminIDs = getAdminIDs(threadData);
      if (!adminIDs.includes(botID) && typeof api.getThreadInfo === 'function') {
        try {
          adminIDs = getAdminIDs(await api.getThreadInfo(threadID));
        } catch (err) {
          console.error('[antispamprotect] Failed to check group admins:', err?.message || err);
          return;
        }
      }
      if (!adminIDs.includes(botID)) return;

      // Restore the saved value first, then preserve the existing roast-and-kick flow.
      if (logMessageType === 'log:thread-name') {
        const oldName = cached.threadName || threadData?.threadName || null;
        if (oldName) {
          try {
            await restoreThreadName(api, threadID, oldName);
          } catch (err) {
            console.error('[antispamprotect] Failed to restore group name:', err?.message || err);
          }
        }
      } else {
        const oldImage = cached.imageSrc || threadData?.imageSrc || null;
        try {
          await restoreThreadImage(api, threadID, oldImage);
        } catch (err) {
          console.error('[antispamprotect] Failed to restore group photo:', err?.stack || err);
        }
      }

      let name = 'User';
      try {
        name = (await usersData.getName(authorID)) || 'User';
      } catch (err) {
        console.error('[antispamprotect] Failed to get user name:', err?.message || err);
      }
      await roastAndKick(api, threadID, authorID, name, NAME_ROASTS);
    } catch (err) {
      console.error('[antispamprotect] Error:', err?.stack || err);
    }
  }
};
