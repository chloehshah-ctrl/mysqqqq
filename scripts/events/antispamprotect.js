const savedThreadNames = new Map();

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
    version: "1.0.2",
    author: "Siegfried Samá",
    category: "events"
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    const { logMessageType, logMessageData, threadID, author } = event;

    // Run the same protection flow for group-name and group-photo changes.
    if (!["log:thread-name", "log:thread-image"].includes(logMessageType)) return;

    const botID = String(api.getCurrentUserID());
    const authorID = String(author || "");
    if (!threadID || !authorID || authorID === botID) return;

    try {
      const threadData = await threadsData.get(threadID);
      let adminIDs = getAdminIDs(threadData);

      // Thread data can be stale or store admin IDs as either strings or objects.
      // Refresh once before deciding whether the bot currently has admin rights.
      if (!adminIDs.includes(botID) && typeof api.getThreadInfo === 'function') {
        try {
          const liveThreadInfo = await api.getThreadInfo(threadID);
          adminIDs = getAdminIDs(liveThreadInfo);
        } catch (err) {
          console.error("[antispamprotect] Failed to check group admins:", err?.message || err);
          return;
        }
      }
      if (!adminIDs.includes(botID)) return;

      if (logMessageType === "log:thread-name") {
        const oldName = savedThreadNames.get(threadID) || threadData?.threadName || null;
        if (oldName) {
          try {
            await new Promise(resolve => api.setTitle(oldName, threadID, resolve));
          } catch {}
        }
        savedThreadNames.set(threadID, logMessageData?.name || oldName || "Group Chat");
      }

      let name = "User";
      try {
        name = (await usersData.getName(authorID)) || "User";
      } catch (err) {
        console.error("[antispamprotect] Failed to get user name:", err?.message || err);
      }
      await roastAndKick(api, threadID, authorID, name, NAME_ROASTS);
    } catch (err) {
      console.error("[antispamprotect] Error:", err.message);
    }
  }
};
