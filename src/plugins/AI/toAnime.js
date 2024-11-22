const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const  Jimp  = require("jimp");
const { type } = require('os');
const path = require('path');
const directoryName = process.cwd();
const tmpDir = path.resolve(directoryName, 'src/tmp');


async function toanime(url){
    
    const encodedUrl = encodeURIComponent(url);


    try {
        let res = await axios.get(`https://api.botwa.space/api/toanime?url=${encodedUrl}&apikey=${process.env.BOTWA_API}`, { responseType: 'arraybuffer' });
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
        return "Maaf, Terjadi Kesalahan";
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
        const forms = new FormData();
        forms.append('file', fs.createReadStream(tempFilePath), dataMessage.fileName);
        forms.append('expires', '1d');
        forms.append('maxDownloads', '1');
        forms.append('autoDelete', 'true');

        // Mengunggah gambar ke API
        const uploadResponse = await axios.post('https://file.io/', forms, {
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${process.env.FILE_IO_API}`,
                'Content-Type': 'multipart/form-data'
            },
        });
    
        fs.unlinkSync(tempFilePath);
       
        // Mendapatkan URL dari respons API
        const imageUrl = uploadResponse.data.link;
        const res = toanime(imageUrl);
        return res;
    } catch (error) {
        console.error("Error while processing:", error);
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }

        return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
    }

    return "Maaf, fitur ini belum tersedia!";
}


    handler.command = ['toanime'];
    handler.premium = false;
    handler.register = true;
    handler.help = ['toanime <image>'];
    handler.limit = true;
    
    module.exports =  handler;