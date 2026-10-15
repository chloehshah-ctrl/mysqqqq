const axios = require("axios");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

const MEDIA = [
  {
    url: "https://i.imgur.com/aGrda4bh.jpg",
    name: "axu-1.jpg"
  },
  {
    url: "https://i.imgur.com/HyfQAvvh.jpg",
    name: "axu-2.jpg"
  },
  {
    url: "https://i.imgur.com/RsIshUOh.jpg",
    name: "axu-3.jpg"
  },
  {
    url: "https://i.imgur.com/daHXOO3h.jpg",
    name: "axu-4.jpg"
  },
  {
    url: "https://i.imgur.com/HlQo3HP.mp4",
    name: "axu-video.mp4"
  },
  {
    url: "https://i.imgur.com/IuV43zhh.jpg",
    name: "axu-5.jpg",
    convertToJpeg: true
  },
  {
    url: "https://i.imgur.com/oRC9GVC.jpeg",
    name: "axu-6.jpg",
    convertToJpeg: true
  },
  {
    url: "https://i.imgur.com/bkSFERi.jpeg",
    name: "axu-7.jpg",
    convertToJpeg: true
  },
  {
    url: "https://i.imgur.com/vsXfeNX.jpeg",
    name: "axu-8.jpg",
    convertToJpeg: true
  },
  {
    url: "https://i.imgur.com/E1xX46O.jpeg",
    name: "axu-9.jpg",
    convertToJpeg: true
  },
  {
    url: "https://i.imgur.com/FCUSfML.jpeg",
    name: "axu-10.jpg",
    convertToJpeg: true
  }
];

const SEND_INTERVAL_MS = 3000;

const DOWNLOAD_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  "Accept": "image/avif,image/webp,image/apng,image/*,video/*,*/*;q=0.8",
  "Referer": "https://imgur.com/"
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadMedia(url) {
  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000,
        maxContentLength: 25 * 1024 * 1024,
        headers: DOWNLOAD_HEADERS
      });
    } catch (err) {
      lastError = err;
      if (err.response?.status !== 429 || attempt === 2) throw err;
      await wait(2500 * (attempt + 1));
    }
  }

  throw lastError;
}

module.exports = {
  config: {
    name: "okita",
    version: "1.1.0",
    author: "Siegfried Samá",
    countDown: 5,
    role: 0,
    shortDescription: "piksyur ni okitadogs😭😭😭",
    longDescription: "mga piksyur ni okitagay na nakalkal sa socmed😭😭😭",
    category: "media",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID } = event;
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "axu-"));

    try {
      // Download one at a time because Imgur rate-limits parallel requests.
      for (const { url, name, convertToJpeg } of MEDIA) {
        const response = await downloadMedia(url);
        const media = convertToJpeg
          ? await sharp(response.data).jpeg({ quality: 90 }).toBuffer()
          : response.data;
        await fs.writeFile(path.join(tempDir, name), media);
        await wait(700);
      }

      // Send separately: this FCA build can hang when several streams are
      // passed in one attachment array.
      for (const { name } of MEDIA) {
        await new Promise((resolve, reject) => {
          api.sendMessage(
            {
              body: "☺️☺️☺️",
              attachment: fs.createReadStream(path.join(tempDir, name))
            },
            threadID,
            (err, info) => err ? reject(err) : resolve(info),
            messageID
          );
        });
        await wait(SEND_INTERVAL_MS);
      }

      await fs.remove(tempDir);
      return;
    } catch (err) {
      await fs.remove(tempDir).catch(() => {});
      console.error("[axu] Media download/send error:", err.message);
      return api.sendMessage(
        "❌ Hindi maipadala ang Axu media ngayon. Subukan ulit mamaya.",
        threadID,
        null,
        messageID
      );
    }
  }
};
