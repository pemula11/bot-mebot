const mime = require("mime-types");
const  {  uuidv4 } =  require('uuid');
const { downloadMediaMessage, isJidGroup } = require("baileys");
const logger = require("./pino");

async function getDataMessage(message) {
  const TypeMediaMessage = [
    "extendedTextMessage",
    "conversation",
    "imageMessage",
    "documentMessage",
    "audioMessage",
    "videoMessage",
    "stickerMessage",
  ];
  const keyText = {
    imageMessage: "caption",
    documentMessage: "caption",
    videoMessage: "caption",
    audioMessage: null,
    stickerMessage: null,
  };

  try {
    let mediaMessage;
    let text;
    let file = null;
    let msg = message.message;

    if (message.message.ephemeralMessage || message.message.revoke) {
      const messageTypeInfo = message.message;
      if (messageTypeInfo.ephemeralMessage) {
        msg = messageTypeInfo.ephemeralMessage.message;
      } else if (messageTypeInfo.revoke) {
        msg = messageTypeInfo.revoke.message.extendedTextMessage.text;
      }
    }

    for (const type of TypeMediaMessage) {
      mediaMessage = msg[type];
      if (mediaMessage) {
        if (type === TypeMediaMessage[0]) {
          text = mediaMessage.text;
          mediaMessage = null;
          break;
        } else if (type === TypeMediaMessage[1]) {
          text = mediaMessage;
          mediaMessage = null;
          break;
        }
        text = mediaMessage[keyText[type]];
        break;
      }
    }

    if (mediaMessage) {
      if (typeof mediaMessage["mediaKey"] === "object") {
        message.message = JSON.parse(JSON.stringify(message.message));
      }
      const buffer = await downloadMediaMessage(
        { key: message?.key, message: message?.message },
        'buffer',
        { },
        { logger: { level: "silent" } }
      );

      const ext = mime.extension(mediaMessage?.mimetype);
      const fileName = mediaMessage?.["fileName"] || `${message.key.id}.${ext}` || `${uuidv4()}.${ext}`;
      file = { fileName, stream: buffer, ext };
    }

    return {
      name: message.pushName,
      jid: message.key.remoteJid.split("@")[0],
      isGroup: isJidGroup(message.key.remoteJid),
      mediaMessage,
      text,
      file,
      location: message.message?.locationMessage,
    };
  } catch (error) {
    logger.error("getDataMessage error", { error });
  }
}

module.exports = { getDataMessage };


