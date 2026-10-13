const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_BASE = "https://api.freetouse.com/v3";
const MAX_AUDIO_SIZE = 24 * 1024 * 1024;

function getArtistNames(artists) {
  if (!Array.isArray(artists)) return "Unknown artist";

  const names = artists
    .map((artist) => {
      const item = Array.isArray(artist) ? artist[1] : artist;
      return item && typeof item.name === "string" ? item.name : "";
    })
    .filter(Boolean);

  return names.join(", ") || "Unknown artist";
}

function formatDuration(seconds) {
  if (!Number.isFinite(Number(seconds)) || Number(seconds) < 0) return "Unknown";
  const totalSeconds = Math.floor(Number(seconds));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function isAllowedAudioUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "data.freetouse.com" || url.hostname.endsWith(".data.freetouse.com"));
  } catch (_) {
    return false;
  }
}

module.exports = {
  config: {
    name: "music",
    aliases: ["song"],
    version: "1.0.0",
    author: "Siegfried Samá",
    countDown: 5,
    role: 0,
    category: "music",
    description: { en: "Search and send a free track from Free To Use." },
    guide: { en: "{pn} <song title or artist>" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ").trim();

    if (!query) {
      return api.sendMessage(
        "Maglagay ng title o artist. Halimbawa: music sleepy",
        threadID,
        messageID
      );
    }

    let filePath;
    try {
      const searchResponse = await axios.get(`${API_BASE}/music/tracks/search`, {
        params: { query, limit: 10, order: "plays", sort: "desc" },
        timeout: 20000
      });
      const searchData = searchResponse.data;

      if (!searchData || searchData.ok === false) {
        throw new Error(searchData?.error || "Hindi sumagot nang tama ang Free To Use API.");
      }

      const tracks = Array.isArray(searchData.data) ? searchData.data : [];
      const track = tracks.find(item =>
        item &&
        item.is_premium === false &&
        typeof item.files?.mp3 === "string" &&
        isAllowedAudioUrl(item.files.mp3)
      );

      if (!track) {
        return api.sendMessage(
          `Walang libreng track na makita para sa "${query}". Subukan ang ibang title o artist.`,
          threadID,
          messageID
        );
      }

      const audioResponse = await axios.get(track.files.mp3, {
        responseType: "arraybuffer",
        timeout: 60000,
        maxContentLength: MAX_AUDIO_SIZE,
        maxBodyLength: MAX_AUDIO_SIZE
      });
      const audio = Buffer.from(audioResponse.data);

      if (!audio.length || audio.length > MAX_AUDIO_SIZE) {
        throw new Error("Walang audio data o lampas ito sa 24 MB Messenger limit.");
      }

      const contentType = audioResponse.headers["content-type"] || "";
      if (contentType && !contentType.startsWith("audio/") && contentType !== "application/octet-stream") {
        throw new Error("Hindi MP3 audio file ang ibinalik ng Free To Use.");
      }

      await fs.ensureDir(path.join(__dirname, "cache"));
      filePath = path.join(__dirname, "cache", `music_${Date.now()}_${messageID}.mp3`);
      await fs.writeFile(filePath, audio);

      const artist = getArtistNames(track.artists);
      const body = [
        `🎵 ${track.title || query}`,
        `👤 ${artist}`,
        `⏱ ${formatDuration(track.duration)}`,
        "",
        "Music from Free To Use",
        "Source: https://freetouse.com/music"
      ].join("\n");

      await new Promise((resolve, reject) => {
        api.sendMessage({
          body,
          attachment: fs.createReadStream(filePath)
        }, threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        }, messageID);
      });
    } catch (err) {
      console.error("[music] Error:", err.message || err);
      return api.sendMessage(
        "Hindi ma-search o maipadala ang kanta. Subukan ulit mamaya o gumamit ng ibang search.",
        threadID,
        messageID
      );
    } finally {
      if (filePath) await fs.remove(filePath).catch(() => {});
    }
  }
};
