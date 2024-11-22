const axios = require('axios');
const { isYouTubeURL, isShortYouTubeURL, convertShortToLongURL, isValidUrl } = require('../../lib/helper');
const logger = require('../../lib/pino');


async function downloaderYTmp3(url){
    if (!isValidUrl(url) || !isYouTubeURL(url)) {
        return "Invalid URL provided!";
    }
    if (isShortYouTubeURL(url)){
        url = convertShortToLongURL(url);
    }

    try {
        let res = await axios.get(`https://api.botwa.space/api/ytmp4?url=${url}&apikey=wZkcnohdW3mJ`);
       
        if (res.status === 500 || res.data === false){
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }
        
        const result = res.data.result;
        let downloadData = Object.values(result["media"]).filter(option => {
            
            return option.key === '128kbps' || option.key === '320kbps';
        });
    
        if (downloadData.length === 0) {
            downloadData = [Object.values(result["media"])[0]];
        }

        const dataReceived ={
            title: result.metadata.title,
            url: downloadData[0].url,
            type: "audio",
            isMedia: true
        }

        return dataReceived;
    } catch (error) {
        logger.error("error while use Downloader: ", {error});
        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }    
}

const handler = async (text) => {
    if ((!text || text === '')) return "Please provide a text!";
    return downloaderYTmp3(text);

}

    handler.command = ['ytmp3'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['ytmp3 <url>'];
    handler.limit = true;
    

module.exports =  handler;