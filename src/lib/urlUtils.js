function convertShortToLongURL(shortURL) {
  const regex = /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const match = shortURL.match(regex);
  if (match) {
    const videoID = match[1];
    return `https://www.youtube.com/watch?v=${videoID}`;
  }
  return shortURL;
}

function isYouTubeURL(url) {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return regex.test(url);
}

function isShortYouTubeURL(url) {
  const regex = /^https?:\/\/youtu\.be\/.+/;
  return regex.test(url);
}

function isTikTokURL(url) {
  const regex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)\/.+$/;
  return regex.test(url);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = { convertShortToLongURL, isYouTubeURL, isShortYouTubeURL, isTikTokURL, isValidUrl };


