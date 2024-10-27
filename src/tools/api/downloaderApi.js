const axios = require('axios');

const { convertShortToLongURL, isYouTubeURL, isShortYouTubeURL, isValidUrl, isTikTokURL } = require('../../lib/helper');


class DownloaderApi {
    constructor(parameters) {
        
    }
    async downloaderYTmp3(url){
        if (!isValidUrl(url) || !isYouTubeURL(url)) {
            return "Invalid URL provided!";
        }
        if (isShortYouTubeURL(url)){
            url = convertShortToLongURL(url);
        }

        try {
            let res = await axios.get(`http://api.ryzendesu.vip/api/downloader/ytmp4?url=${url}`);
            
            if (res.status === 500 || res.data === false){
                return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
            }
         //   console.log("res: ", res.data);
            let data = res.data;
            const dataReceived ={
                title: data.title,
                url: data.url,
                type: "audio",
                isTiktok: true
            }
            return dataReceived;
        } catch (error) {
            console.log("error while use Downloader: ", error);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }    
    }

    async downloaderTT(url){
        if (!isValidUrl(url) || !isTikTokURL(url)) {
            return "Invalid URL provided!";
        }
        const encodedUrl = encodeURIComponent(url);


        try {
            let res = await axios.get(`http://api.ryzendesu.vip/api/downloader/ttdl?url=${encodedUrl}`);
            
            if (res.status === 500 || res.data === false || res.data === null || res.status !== 200){
                return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
            }
         //   console.log("res: ", res.data);
            let data = res.data;
            const dataReceived ={
                
                url: data.data.play,
                title: data.data.title,
                type: "video"
            }
            return dataReceived;
        } catch (error) {
            console.log("error while use Downloader: ", error);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }    
    }


}

module.exports = DownloaderApi;