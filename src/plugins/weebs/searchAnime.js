const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const { type } = require('os');
const path = require('path');
const logger = require('../../lib/pino');
const directoryName = process.cwd();
const tmpDir = path.resolve(directoryName, 'src/tmp');


async function whatanime(url){
    
    const encodedUrl = encodeURIComponent(url);


    try {
        let res = await axios.get(`https://api.ryzendesu.vip/api/weebs/whatanime?url=${encodedUrl}`);
        
        if (res.status === 500 || res.data === false || res.data === null || res.status !== 200){
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }
        console.log("res: ", res.data);
       
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
    
    if (!dataMessage || !dataMessage.stream || !dataMessage.fileName) {
        return "Please provide a valid image!";
    }

     const tempFilePath = path.join(tmpDir, dataMessage.fileName);
        // Membuat direktori sementara jika belum ada
    // Membuat form data
    
    // Membuat direktori sementara jika belum ada
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

   
    fs.writeFileSync(tempFilePath, dataMessage.stream);



    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(tempFilePath), dataMessage.fileName);
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
    
        fs.unlinkSync(tempFilePath);
       
        // Mendapatkan URL dari respons API
        const imageUrl = uploadResponse.data.link;
        const res = whatanime(imageUrl);
        return res;
    } catch (error) {
        logger.error("Error while processing:", {error});
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

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