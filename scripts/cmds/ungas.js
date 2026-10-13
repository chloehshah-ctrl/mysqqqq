const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");

const MEDIA_PAGES = [
  { url: "https://imgur.com/a/Oc4t62M.jpeg", type: "image" },
  { url: "https://imgur.com/a/ozCDTid", type: "image" },
  { url: "https://imgur.com/a/wMB2WSI.mp4", type: "video" }
];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

async function getMediaUrl(pageUrl, type) {
  const { data } = await axios.get(pageUrl, {
    timeout: 20000,
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const $ = cheerio.load(data);
  const property = type === "video" ? "og:video" : "og:image";
  const mediaUrl = $(`meta[property="${property}"]`).attr("content");

  if (!mediaUrl) {
    throw new Error(`Hindi makita ang ${type === "video" ? "video" : "larawan"} sa Imgur page.`);
  }
  return mediaUrl;
}

module.exports = {
  config: {
    name: "ungas",
    version: "1.0.0",
    author: "Siegfried Samá",
    countDown: 0,
    role: 0,
    description: { en: "ungas na jm 😂" },
    category: "fun",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const cacheDir = path.join(__dirname, "cache");
    const filePaths = [];

    try {
      await fs.ensureDir(cacheDir);
      const attachments = [];

      for (const [index, media] of MEDIA_PAGES.entries()) {
        const mediaUrl = await getMediaUrl(media.url, media.type);
        const response = await axios.get(mediaUrl, {
          responseType: "arraybuffer",
          timeout: 30000,
          maxContentLength: MAX_FILE_SIZE,
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const buffer = Buffer.from(response.data);

        if (buffer.length > MAX_FILE_SIZE) {
          throw new Error("May media file na lampas sa 25 MB na limit.");
        }

        const extension = media.type === "video" ? ".mp4" : ".jpg";
        const filePath = path.join(cacheDir, `ungas_${Date.now()}_${index}${extension}`);
        await fs.writeFile(filePath, buffer);
        filePaths.push(filePath);
        attachments.push(fs.createReadStream(filePath));
      }

      return api.sendMessage({
        body: "HAHAHAHAHAHHAAHHAHAHHAAHHAHAAHHAHAH",
        attachment: attachments
      }, threadID, () => {
        Promise.all(filePaths.map(filePath => fs.remove(filePath).catch(() => {})));
      }, messageID);
    } catch (err) {
      await Promise.all(filePaths.map(filePath => fs.remove(filePath).catch(() => {})));
      console.error("[ungas] Hindi naipadala ang media:", err.message);
      return api.sendMessage(
        "Hindi ma-fetch o maipadala ang media mula sa Imgur. Pakisubukan ulit mamaya.",
        threadID,
        messageID
      );
    }
  }
};
