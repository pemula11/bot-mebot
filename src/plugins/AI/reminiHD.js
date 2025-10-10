const axios = require('axios');
const fs = require('fs');
const { type } = require('os');
const path = require('path');
const directoryName = process.cwd();
const tmpDir = path.resolve(directoryName, 'src/tmp');
const  Jimp  = require("jimp");

async function reminiHd(url){
    console.log("=================================================================");   
    console.log("url: ", url);
    const encodedUrl = encodeURIComponent(url);


    try {
        let res = await axios.get(`http://api.ryzendesu.vip/api/ai/remini?url=${encodedUrl}`, { responseType: 'arraybuffer' });
        const buffer64 = Buffer.from(res.data, 'binary');
        if (res.status === 500 || res.data === false || res.data === null || res.status !== 200){
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }
        // Menggunakan Jimp untuk memproses gambar
        const image = await Jimp.read(buffer64);
        // Contoh pemrosesan: mengubah ukuran gambar
        
        const processedImage = await image.getBufferAsync(Jimp.MIME_JPEG);
     //   console.log("res: ", res.data);
       
        const dataReceived ={
            url: processedImage,
            title: "Success",
            isMedia: true,
            type: "image"
        }
        return dataReceived;
    } catch (error) {
        console.log("error while use Downloader: ", error);
        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }    
}

const handler = async (text, dataMessage) => {
    console.log("=================================================================");
    console.log("dataMessage: ", dataMessage);
    if (!dataMessage || !dataMessage.stream || !dataMessage.fileName) {
        return "Please provide a valid image!";
    }
     const tempFilePath = path.join(tmpDir, dataMessage.fileName);
        // Membuat direktori sementara jika belum ada
    // Membuat form data
    const form = new FormData(),
    blob = new Blob([dataMessage.stream], {
      type: dataMessage.ext,
    });
    form.append('file', blob, dataMessage.fileName);
    form.append('expires', '1d');
    form.append('maxDownloads', '1');
    form.append('autoDelete', 'true');

    try {
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
        console.log("imageUrl: ",  uploadResponse.data.link);
        const res = reminiHd(imageUrl);
       return res;
    } catch (error) {
        console.error("Error while processing:", error);
        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }

    return "Maaf, fitur ini belum tersedia!";
}

    handler.command = ['hd'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['hd <image>'];
    handler.limit = true;
    
    module.exports =  handler;