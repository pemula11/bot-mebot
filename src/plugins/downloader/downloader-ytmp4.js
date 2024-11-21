const axios = require('axios');
const { isYouTubeURL, isShortYouTubeURL, convertShortToLongURL, isValidUrl } = require('../../lib/helper');

async function downloaderYTvid(url){
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
            console.log("option: ", option);
            return option.key === '480' || option.key === '720';
        });
    
        if (downloadData.length === 0) {
            downloadData = [Object.values(result["media"])[0]];
        }
        console.log("downloadData: ", downloadData);
        const dataReceived ={
            title: result.metadata.title,
            url: downloadData[0].url,
            type: "video",
            thumbnail: result.metadata.thumbnail,
            isMedia: true
            
        }
        return dataReceived;
    } catch (error) {
        console.log("error while use Downloader: ", error);
        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }    
}

const handler = async (text) => {
    if ((!text || text === '')) return "Please provide a text!";
    return downloaderYTvid(text);

}

    handler.command = ['ytvid'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['ytvid <url>'];
    handler.limit = true;
    
    module.exports =  handler;