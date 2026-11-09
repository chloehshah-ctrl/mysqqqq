'use strict';

const fs = require('fs-extra');
const path = require('path');
const { registerFont, loadImage } = require('canvas');
const twemoji = require('twemoji');

const fontDir = path.resolve(__dirname, '../assets/font');
const emojiDir = path.resolve(path.dirname(require.resolve('twemoji')), '../assets/72x72');
const emojiCache = new Map();
let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) return;

  const regularFont = path.join(fontDir, 'BeVietnamPro-Regular.ttf');
  const boldFont = path.join(fontDir, 'BeVietnamPro-Bold.ttf');
  if (fs.existsSync(regularFont)) {
    registerFont(regularFont, { family: 'Be Vietnam Pro', weight: '400' });
  }
  if (fs.existsSync(boldFont)) {
    registerFont(boldFont, { family: 'Be Vietnam Pro', weight: '700' });
  }
  fontsRegistered = true;
}

function graphemes(text) {
  if (typeof Intl.Segmenter === 'function') {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(item => item.segment);
  }
  return Array.from(text);
}

function isEmoji(text) {
  return /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u.test(text);
}

async function getEmojiImage(glyph) {
  const codepoints = twemoji.convert.toCodePoint(glyph);
  const filePath = path.join(emojiDir, `${codepoints}.png`);
  if (!fs.existsSync(filePath)) return null;

  if (!emojiCache.has(filePath)) {
    emojiCache.set(filePath, loadImage(filePath).catch(() => null));
  }
  return emojiCache.get(filePath);
}

function measureText(ctx, text, fontSize) {
  return graphemes(String(text)).reduce((width, part) => {
    return width + (isEmoji(part) ? fontSize : ctx.measureText(part).width);
  }, 0);
}

function wrapText(ctx, text, maxWidth, fontSize) {
  const paragraphs = String(text).split(/\r?\n/);
  const lines = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      continue;
    }

    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (measureText(ctx, candidate, fontSize) <= maxWidth) {
        line = candidate;
        continue;
      }

      if (line) lines.push(line);
      line = '';
      for (const part of graphemes(word)) {
        const candidatePart = line + part;
        if (line && measureText(ctx, candidatePart, fontSize) > maxWidth) {
          lines.push(line);
          line = part;
        } else {
          line = candidatePart;
        }
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

async function fillText(ctx, text, x, y, fontSize) {
  const parts = graphemes(String(text));
  const width = measureText(ctx, text, fontSize);
  let cursorX = x;
  if (ctx.textAlign === 'center') cursorX -= width / 2;
  else if (ctx.textAlign === 'right' || ctx.textAlign === 'end') cursorX -= width;

  const baseline = ctx.textBaseline || 'alphabetic';
  const emojiY = baseline === 'top'
    ? y
    : baseline === 'middle'
      ? y - fontSize / 2
      : baseline === 'bottom' || baseline === 'ideographic'
        ? y - fontSize
        : y - fontSize * 0.86;

  for (const part of parts) {
    if (isEmoji(part)) {
      const image = await getEmojiImage(part);
      if (image) {
        ctx.drawImage(image, cursorX, emojiY, fontSize, fontSize);
        cursorX += fontSize;
        continue;
      }
    }
    ctx.fillText(part, cursorX, y);
    cursorX += ctx.measureText(part).width;
  }
}

module.exports = { ensureFonts, measureText, wrapText, fillText };
