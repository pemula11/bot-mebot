const axios = require('axios');

async function downloaderTT(url){
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
        const typevid= getFileType(res.data.data.play);
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

const handler = async (text) => {
    if ((!text || text === '')) return "Please provide a text!";
    return downloaderTT(text);

}

    handler.command = ['tt'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['tt <url>'];
    handler.limit = true;
    
    module.exports =  handler;

function getFileType(fileUrl) {
    const mimeType = mime.lookup(fileUrl);
    if (mimeType === 'audio/mpeg') {
        return 'audio';
    } else{
        return 'video';
    }
}