const axios = require('axios');

async function downloaderYTvid(url){
    if (!isValidUrl(url) || !isYouTubeURL(url)) {
        return "Invalid URL provided!";
    }
    if (isShortYouTubeURL(url)){
        url = convertShortToLongURL(url);
    }

    try {
        let res = await axios.get(`https://widipe.com/download/ytdl?url=${url}`);
       
        if (res.status === 500 || res.data === false){
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }
     //   console.log("res: ", res.data);
        let data = res.data.result;
        if (data === null || data.mp4 === null || data.mp4 === ''){
            return "Maaf, Video tidak dapat diconvert!";
        }

        const dataReceived ={
            title: data.title,
            url: data.mp4,
            type: "video",
          
            isMedia: true
            
        }
        return dataReceived;
    } catch (error) {
        console.log("error while use Downloader: ", error);
        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }    
}

const handler = async (text) => {
    return downloaderYTvid(text);

}

    handler.command = ['ytvid'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['ytvid <url>'];
    handler.limit = true;
    
    module.exports =  handler;