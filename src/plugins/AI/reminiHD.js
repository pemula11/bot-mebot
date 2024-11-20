const axios = require('axios');


async function reminiHd(){
    
    const encodedUrl = encodeURIComponent(url);


    try {
        let res = await axios.get(`http://api.ryzendesu.vip/api/ai/remini?url=${encodedUrl}`);
        
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

const handler = async (text) => {
    return downloaderFacebook(text);

}

    handler.command = ['hd'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['hd <image>'];
    handler.limit = true;
    
    module.exports =  handler;