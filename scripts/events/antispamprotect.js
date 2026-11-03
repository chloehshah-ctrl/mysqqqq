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
    version: "1.0.1",
    author: "Siegfried Samá",
    category: "events"
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    const { logMessageType, logMessageData, threadID, author } = event;

    if (logMessageType !== "log:thread-name") return;

    const botID = String(api.getCurrentUserID());
    const authorID = String(author || "");
    if (!authorID || authorID === botID) return;

    try {
      const threadData = await threadsData.get(threadID);
      const adminIDs = (threadData.adminIDs || []).map(String);
      if (!adminIDs.includes(botID)) return;

      const oldName = savedThreadNames.get(threadID) || threadData.threadName || null;
      if (oldName) {
        try {
          await new Promise(resolve => api.setTitle(oldName, threadID, resolve));
        } catch {}
      }
      savedThreadNames.set(threadID, logMessageData.name || oldName || "Group Chat");

      const name = (await usersData.getName(authorID)) || "User";
      await roastAndKick(api, threadID, authorID, name, NAME_ROASTS);
    } catch (err) {
      console.error("[antispamprotect] Error:", err.message);
    }
  }
};
