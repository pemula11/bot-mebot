const axios = require('axios');
const mime = require('mime-types');


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
                type: "audio"
                
            }
            return dataReceived;
        } catch (error) {
            console.log("error while use Downloader: ", error);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }    
    }

    async downloaderTT(url){
        if (!isValidUrl(url) && !isTikTokURL(url)) {
            return "Invalid URL provided!";
        }
        const encodedUrl = encodeURIComponent(url);


        try {
            let res = await axios.get(`http://api.ryzendesu.vip/api/downloader/ttdl?url=${encodedUrl}`);
            
            if (res.status === 500 || res.data === false || res.data === null || res.status !== 200){
                return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
            }
             console.log("res: ", res.data);
            const typevid= this.getFileType(res.data.data.play);
            let data = res.data;
            const dataReceived ={
                
                url: data.data.play,
                title: data.data.title,
                type: typevid,
                isMedia: true
            }
            return dataReceived;
        } catch (error) {
            console.log("error while use Downloader: ", error);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }    
    }

    async downloaderFacebook(url){
        if (!isValidUrl(url) ) {
            return "Invalid URL provided!";
        }
        const encodedUrl = encodeURIComponent(url);


        try {
            let res = await axios.get(`http://api.ryzendesu.vip/api/downloader/fbdl?url=${encodedUrl}`);
            
            if (res.status === 500 || res.data === false || res.data === null || res.status !== 200){
                return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
            }

            let datavid = (res.data.data).filter(option => {
                return option.url !== "";
            });
            

         //   console.log("res: ", res.data);
            let data = res.data;
            const dataReceived ={
                title: datavid[0].resolution,
                url: datavid[0].url,
                thumbnail: datavid[0].thumbnail,
                type: "video",
                isMedia: true
            }
            return dataReceived;
        } catch (error) {
            console.log("error while use Downloader: ", error);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }    
    }
    async downloaderInstagram(url){
        if (!isValidUrl(url) ) {
            return "Invalid URL provided!";
        }
        const encodedUrl = encodeURIComponent(url);


        try {
            let res = await axios.get(`http://api.ryzendesu.vip/api/downloader/igdl?url=${encodedUrl}`);
            
            if (res.status === 500 || res.data === false || res.data === null || res.status !== 200){
                return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
            }
         //   console.log("res: ", res.data);
            let data = res.data;
            const dataReceived ={
                title: '',
                url: data.data[0].url,
                thumbnail: data.data[0].thumbnail,
                type: "video",
                isMedia: true
            }
            return dataReceived;
        } catch (error) {
            console.log("error while use Downloader: ", error);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }    
    }


    getFileType(fileUrl) {
        const mimeType = mime.lookup(fileUrl);
        if (mimeType === 'audio/mpeg') {
            return 'audio';
        } else{
            return 'video';
        }
    }
}

module.exports = DownloaderApi;