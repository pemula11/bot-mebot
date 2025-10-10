const axios = require('axios');
const { isValidUrl } = require('../../lib/helper');

async function downloaderInstagram(url){
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

const handler = async (text) => {
    if ((!text || text === '')) return "Please provide a text!";
    return downloaderInstagram(text);

}

    handler.command = ['ig'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['ig <url>'];
    handler.limit = true;
    
    module.exports =  handler;