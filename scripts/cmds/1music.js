const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const SHAZAM_API = "https://betadash-api-swordslush-production.up.railway.app/shazam";
const MAX_PREVIEW_SIZE = 12 * 1024 * 1024;

function isAppleHost(value, allowedHost) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === allowedHost || url.hostname.endsWith(`.${allowedHost}`));
  } catch (_) {
    return false;
  }
}

function normalizeTrack(track) {
  const rawArtists = Array.isArray(track.artists)
    ? track.artists.map(artist => artist && typeof artist === "object" ? artist.name : artist).filter(Boolean).join(", ")
    : "";
  const appleUrl = track.appleMusicUrl || track.apple_music_url || track.share?.href || "";
  const previewUrl = track.previewUrl || track.preview || track.audioUrl || "";

  return {
    title: track.title || track.name || track.song || "",
    artist: track.artistName || track.subtitle || track.artist || track.author || rawArtists || "Unknown artist",
    album: track.albumName || track.album || "",
    cover: track.thumbnail || track.cover || track.coverart || track.image || track.images?.coverart || "",
    previewUrl: isAppleHost(previewUrl, "itunes.apple.com") ? previewUrl : "",
    appleUrl: isAppleHost(appleUrl, "apple.com") ? appleUrl : "",
    durationInMillis: Number(track.durationInMillis) || 0
  };
}

function getTracks(data) {
  const results = data?.results || data?.tracks || data?.data || (Array.isArray(data) ? data : []);
  return Array.isArray(results)
    ? results.map(normalizeTrack).filter(track => track.title)
    : [];
}

function formatDuration(durationInMillis) {
  if (!durationInMillis) return "";
  const seconds = Math.floor(durationInMillis / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function sendWithCallback(api, content, threadID, messageID) {
  return new Promise((resolve, reject) => {
    api.sendMessage(content, threadID, (err, info) => {
      if (err) reject(err);
      else resolve(info);
    }, messageID);
  });
}

module.exports = {
  config: {
    name: "music",
    aliases: ["song"],
    version: "2.0.0",
    author: "Siegfried Samá",
    countDown: 5,
    role: 0,
    category: "music",
    description: { en: "Search and play an official music preview." },
    guide: { en: "{pn} <song title or artist>" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage("Ilagay ang title o artist.\nHalimbawa: music Blinding Lights", threadID, messageID);
    }

    try {
      const response = await axios.get(SHAZAM_API, {
        params: { title: query, limit: 5 },
        timeout: 20000
      });
      const tracks = getTracks(response.data).slice(0, 5);

      if (!tracks.length) {
        return api.sendMessage(`Walang Music result para sa "${query}". Subukan ang ibang title o artist.`, threadID, messageID);
      }

      const lines = tracks.map((track, index) => {
        const details = [`${index + 1}. ${track.title}`, `   Artist: ${track.artist}`];
        if (track.album) details.push(`   Album: ${track.album}`);
        if (track.previewUrl) details.push(`   Preview: ${track.previewUrl}`);
        if (track.appleUrl) details.push(`   Apple Music: ${track.appleUrl}`);
        return details.join("\n");
      });
      const body = [
        `🔎 Music results for "${query}"`,
        "",
        ...lines,
        "",
        `Reply with 1-${tracks.length} to receive the official preview (up to 30 seconds).`,
        "For the full song, open its Apple Music link."
      ].join("\n");

      const info = await sendWithCallback(api, body, threadID, messageID);
      if (info?.messageID && global.GoatBot?.onReply) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          author: String(senderID),
          tracks
        });
      }
    } catch (err) {
      console.error("[music] search error:", err.message || err);
      return api.sendMessage("Hindi ma-search ang kanta sa Music API. Subukan ulit mamaya.", threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, senderID } = event;
    if (String(senderID) !== String(Reply.author)) return;

    const choice = event.body.trim();
    if (!/^\d+$/.test(choice)) {
      return api.sendMessage(`Pumili ng number mula 1-${Reply.tracks.length}.`, threadID, messageID);
    }

    const track = Reply.tracks[Number(choice) - 1];
    if (!track) {
      return api.sendMessage(`Pumili ng number mula 1-${Reply.tracks.length}.`, threadID, messageID);
    }
    if (!track.previewUrl) {
      const appleText = track.appleUrl ? `\nApple Music: ${track.appleUrl}` : "";
      return api.sendMessage(`Walang official preview para sa "${track.title}".${appleText}`, threadID, messageID);
    }

    let filePath;
    try {
      const response = await axios.get(track.previewUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
        maxContentLength: MAX_PREVIEW_SIZE,
        maxBodyLength: MAX_PREVIEW_SIZE
      });
      const audio = Buffer.from(response.data);
      const contentType = response.headers["content-type"] || "";

      if (!audio.length || audio.length > MAX_PREVIEW_SIZE) {
        throw new Error("Walang audio preview o lampas ito sa 12 MB limit.");
      }
      if (contentType && !contentType.startsWith("audio/") && contentType !== "application/octet-stream") {
        throw new Error(`Hindi audio preview ang ibinalik (${contentType}).`);
      }

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const safeSenderID = String(senderID).replace(/[^a-zA-Z0-9_-]/g, "");
      filePath = path.join(cacheDir, `shazam_preview_${Date.now()}_${safeSenderID}.m4a`);
      await fs.writeFile(filePath, audio);

      const details = [
        `🎵 ${track.title}`,
        `👤 ${track.artist}`,
        track.album ? `💿 ${track.album}` : "",
        formatDuration(track.durationInMillis) ? `⏱ ${formatDuration(track.durationInMillis)}` : "",
        "Official Shazam/Apple preview (up to 30 seconds).",
        track.appleUrl ? `Apple Music: ${track.appleUrl}` : ""
      ].filter(Boolean).join("\n");

      await sendWithCallback(api, {
        body: details,
        attachment: fs.createReadStream(filePath)
      }, threadID, messageID);
    } catch (err) {
      console.error("[music] Preview error:", err.message || err);
      return api.sendMessage("Hindi ma-download o maipadala ang preview. Subukan ulit mamaya.", threadID, messageID);
    } finally {
      if (filePath) await fs.remove(filePath).catch(() => {});
    }
  }
};
