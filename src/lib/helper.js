const mime = require("mime-types");
const  {  uuidv4 } =  require('uuid');
const { downloadMediaMessage, isJidGroup, getContentType, proto, downloadAndProcessHistorySyncNotification, getHistoryMsg } = require("baileys");
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
                 console.log("messageContextInfo: ", messageTypeInfo);
                     // Extract text from protocolMessage if available
                     if (messageTypeInfo.ephemeralMessage) {
                         msg = messageTypeInfo.ephemeralMessage.message;
                         console.log("=========================================---------------====-----------------------===");
                         console.log("msg: ", msg);
                     } else if (messageTypeInfo.revoke) {
                         msg =messageTypeInfo.revoke.message.extendedTextMessage.text;
                     } 
                    //  else {
                         
                    //      throw new Error("Unknown protocol message type, please contact the developer");
                         
                    //  }
        }
        else{
            console.log("=========================================---------------====-----------------------===");
                         console.log("msg: ", msg);
        }

        for (const type of TypeMediaMessage) {
          
       
           
            mediaMessage = msg[type];
            console.log("================================================");
          //  console.log("mediaMessage: ",  msg);
            
            if (mediaMessage) {
                if (type === TypeMediaMessage[0]){
                    text = mediaMessage.text;
                    mediaMessage = null;
                    break;
                }
                else if (type === TypeMediaMessage[1]){
                    text = mediaMessage;
                    mediaMessage = null;
                    break;
                }
               
                
                

               
                text = mediaMessage[keyText[type]];
                console.log("text: ", mediaMessage[keyText[type]]);
                console.log("OR text: ", mediaMessage["caption"]);
                break;
            }
        }

        if (mediaMessage) {
           
            if (typeof mediaMessage["mediaKey"] === "object"){
                message.message = JSON.parse(JSON.stringify(message.message));
            }
            const buffer = await downloadMediaMessage(
                { key: message?.key, message: message?.message },
                'buffer', 
                { },
                { 
                    logger: { level: "silent" },
                }
            );
  
            const ext = mime.extension(mediaMessage?.mimetype);
            const fileName = mediaMessage?.["fileName"] || `${message.key.id}.${ext}` || `${uuidv4()}.${ext}`;
       
          file = {
            fileName,
            stream: buffer,
            ext,
          };
            
        }

        return {
            name: message.pushName,
            jid: message.key.remoteJid.split("@")[0],
            isGroup: isJidGroup(message.key.remoteJid),
            mediaMessage,
            text,
            file,
            location: message.message?.locationMessage,
            
        }
    } catch (error) {
        logger.error("-------------------- error ---------------------" , error);
    }


    
    

}
function convertShortToLongURL(shortURL) {
    const regex = /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const match = shortURL.match(regex);
    if (match) {
        const videoID = match[1];
        return `https://www.youtube.com/watch?v=${videoID}`;
    }
    return shortURL; // Return the original URL if it doesn't match the short URL pattern
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
    const regex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+$/;
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

module.exports = { getDataMessage, convertShortToLongURL, isYouTubeURL, isShortYouTubeURL, isValidUrl, isTikTokURL };
