const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");
const checkCooldown = require('./utils/mediaCooldown');
const canvasText = require('./utils/canvasText');

module.exports = {
  config: {
    name: "siegfried",
    version: "3.0.2",
    author: "Siegfried Sama",
    countDown: 10,
    role: 0,
    description: { en: "Comment on the board" },
    category: "edit-img",
    guide: { en: "{pn} [text]" }
  },

  onStart: async function ({ api, event, args }) {
    const { senderID, threadID, messageID } = event;
    if (!await checkCooldown("siegfried", senderID, api, threadID)) return;
    const bgPath = path.join(__dirname, 'cache', 'siegfried_bg.jpg');
    const text = args.join(" ");

    if (!text) return api.sendMessage("Add text lmao", threadID, messageID);

    try {
      canvasText.ensureFonts();
      const baseImage = await loadImage(bgPath);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      ctx.textAlign = "start";

      const maxWidth = Math.floor(canvas.width * 0.92);
      let fontSize = Math.floor(canvas.width * 0.035) + 2;
      ctx.font = `400 ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
      while (canvasText.measureText(ctx, text, fontSize) > maxWidth && fontSize > 20) {
        fontSize--;
        ctx.font = `400 ${fontSize}px "Be Vietnam Pro", Arial, sans-serif`;
      }

      const lines = canvasText.wrapText(ctx, text, maxWidth, fontSize);
      if (!lines.length) return api.sendMessage("Text is too long or too wide to fit.", threadID, messageID);

      const startX = Math.floor(canvas.width * 0.015);
      const lineSpacing = Math.floor(fontSize * 0.3);
      const lineHeight = fontSize + lineSpacing;
      const totalTextHeight = lines.length * lineHeight;
      const contentTop = Math.floor(canvas.height * 0.35);
      const contentBottom = Math.floor(canvas.height * 0.72);
      const contentMid = (contentTop + contentBottom) / 2;
      const startY = Math.floor(contentMid - totalTextHeight / 2) + fontSize;

      let y = startY;
      for (const line of lines) {
        await canvasText.fillText(ctx, line, startX, y, fontSize);
        y += lineHeight;
      }

      const pathImg = path.join(__dirname, 'cache', `siegfried_${Date.now()}.png`);
      fs.writeFileSync(pathImg, canvas.toBuffer("image/png"));
      return api.sendMessage(
        { attachment: fs.createReadStream(pathImg) },
        threadID,
        () => fs.remove(pathImg).catch(() => {}),
        messageID
      );
    } catch (err) {
      console.error("[siegfried] Image generation failed:", err?.stack || err);
      return api.sendMessage("❌ Failed to create the image. Please try again.", threadID, messageID);
    }
  }
};
