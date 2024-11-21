const axios = require('axios');
const fs = require('fs');
const { type } = require('os');
const path = require('path');
const directoryName = process.cwd();
const tmpDir = path.resolve(directoryName, 'src/tmp');


async function whatanime(url){
    
    const encodedUrl = encodeURIComponent(url);


    try {
        let res = await axios.get(`http://api.ryzendesu.vip/api/ai/chatgpt?text=${encodedUrl}`);
        
        if (res.status === 500 || res.data === false || res.data === null || res.status !== 200){
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }
       
        const caption = `Result: 
        *Title*: ${res.data.judul}
        Episode: ${res.data.episode}
        Similarity: ${res.data.similarity}`;
       
        const dataReceived ={
            url: res.data.videoURL,
            thumbnail: res.data.videoIMG,
            title: caption,
            isMedia: true,
            type: "video"
        }
        return dataReceived;
    } catch (error) {
        console.log("error while use Downloader: ", error);
        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }    
}

const handler = async (text, dataMessage) => {
    console.log("=================================================================");
       
     const tempFilePath = path.join(tmpDir, dataMessage.fileName);
        // Membuat direktori sementara jika belum ada
    // Membuat form data
    

    try {
        const form = new FormData(),
        blob = new Blob([dataMessage.stream], {
        type: dataMessage.ext,
        });
        form.append('file', blob, dataMessage.fileName);
        form.append('expires', '1d');
        form.append('maxDownloads', '1');
        form.append('autoDelete', 'true');

        // Mengunggah gambar ke API
        const uploadResponse = await axios.post('https://file.io/', form, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${process.env.FILE_IO_API}`,
                'Content-Type': 'multipart/form-data'
            },
        });
    
        
       
        // Mendapatkan URL dari respons API
        const imageUrl = uploadResponse.data.link;
        const res = whatanime(imageUrl);
       return res;
    } catch (error) {
        console.error("Error while processing:", error);
        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }

    return "Maaf, fitur ini belum tersedia!";
}

    handler.command = ['whatanime'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['whatanime <image>'];
    handler.limit = true;
    handler.disabled = false;
    module.exports =  handler;