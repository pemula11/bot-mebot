const axios = require('axios');

class DownloaderVideo {
    constructor(parameters) {
        
    }
    async downloaderYT(url){
        if (!this.isValidUrl(url)) {
            return "Invalid URL provided!";
        }
        
        try {
            let res = await axios.get(`http://api.ryzendesu.vip/api/downloader/ytmp4?url=${url}`);
            
            if (res.status === 500 || res.data === false){
                return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
            }
            console.log("res: ", res.data);
            let data = res.data;
            data['title'] = "video.mp4";
            data['type'] = "video";
            const dataReceived ={
                
                url: data.url,
                type: "video"
            }
            return dataReceived;
        } catch (error) {
            console.log("error while use Downloader: ", error);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }    
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

module.exports = DownloaderVideo;