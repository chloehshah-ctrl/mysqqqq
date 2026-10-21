const TARGET_ADMIN_UID = "100070646281323";

module.exports = {
  config: {
    name: "goiadmin",
    version: "1.0.0",
    author: "Siegfried Samá",
    countDown: 0,
    role: 0,
    description: {
      en: "Automatically responds when admin is tagged or name is mentioned"
    },
    category: "events",
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const { threadID, messageID, mentions } = event;
    const taggedUIDs = Object.keys(mentions || {}).map(String);
    if (!taggedUIDs.includes(TARGET_ADMIN_UID)) return;

    const tagReplies = [
      "busy owner ko ☺️",
      "may ginagawa owner ko 👍🏿",
      "tulog pa ata owner ko 😴💤💤",
      "isang ment pa sa owner ko, kakantutin koyang bibig mo haha"
    ];

    const reply = tagReplies[Math.floor(Math.random() * tagReplies.length)];
    try {
      return api.sendMessage(reply, threadID, (err) => {
        if (err) console.error("[goiadmin] hindi mapadala ang tag reply:", err.message || err);
      }, messageID);
    } catch (err) {
      console.error("[goiadmin] hindi mapadala ang tag reply:", err.message || err);
    }
  }
};
