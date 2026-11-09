const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const checkCooldown = require('./utils/mediaCooldown');
const canvasText = require('./utils/canvasText');

const cacheDir = path.resolve(__dirname, "cache");
const bgCachePath = path.join(cacheDir, "billboard_bg.jpg");
const BG_URL = "https://i.imgur.com/aOZUbNm.jpg";

async function ensureBg() {
  fs.ensureDirSync(cacheDir);
  if (!fs.existsSync(bgCachePath)) {
    const res = await axios.get(BG_URL, { responseType: "arraybuffer" });
    fs.writeFileSync(bgCachePath, Buffer.from(res.data));
  }
}

module.exports = {
  config: {
    name: "billboard",
    version: "9.7.6",
    author: "John Lester - Convert by Siegfried Samá",
    countDown: 5,
    role: 0,
    description: { en: "Put text on a billboard image" },
    category: "image",
    usages: "[text]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const senderID = event.senderID;
    if (!await checkCooldown("billboard", senderID, api, threadID)) return;
    const { loadImage, createCanvas } = require("canvas");
    const text = args.join(" ");
    if (!text) return api.sendMessage("Enter the content of the comment on the board", threadID, messageID);

    try {
      await ensureBg();
      canvasText.ensureFonts();
      const baseImage = await loadImage(bgCachePath);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";

      const MAX_WIDTH = 420;
      const TEXT_X = 330;
      const TEXT_Y_START = 75;
      const LINE_HEIGHT_RATIO = 1.2;

      let fontSize = 90;
      ctx.font = `bold ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
      while (fontSize > 20 && canvasText.measureText(ctx, text, fontSize) > MAX_WIDTH) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
      }

      const lines = canvasText.wrapText(ctx, text, MAX_WIDTH, fontSize);
      if (!lines.length) return api.sendMessage("❌ Text too long for the billboard.", threadID, messageID);

      const lineHeight = fontSize * LINE_HEIGHT_RATIO;
      let startY = TEXT_Y_START + lineHeight / 2;
      if (lines.length > 1) startY = TEXT_Y_START + lineHeight * 0.3;

      for (let i = 0; i < lines.length; i++) {
        await canvasText.fillText(ctx, lines[i], TEXT_X, startY + i * lineHeight, fontSize);
      }

      const pathImg = path.join(cacheDir, `billboard_${Date.now()}.png`);
      fs.writeFileSync(pathImg, canvas.toBuffer("image/png"));
      return api.sendMessage(
        { attachment: fs.createReadStream(pathImg) },
        threadID,
        () => fs.remove(pathImg).catch(() => {}),
        messageID
      );
    } catch (err) {
      console.error("[billboard] Image generation failed:", err?.stack || err);
      return api.sendMessage("❌ Failed to create the billboard image. Please try again.", threadID, messageID);
    }
  }
};
