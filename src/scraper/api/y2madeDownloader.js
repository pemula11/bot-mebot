const { default: axios } = require("axios");

const { convertShortToLongURL, isYouTubeURL, isShortYouTubeURL, isValidUrl } = require('../../lib/helper');

class YTdownloder {
    constructor(parameters) {
        this.url = "";
        this.videoID = "";
        this.headers = {
            Accept: "*/*",
            Origin: "https://id-y2mate.com",
           Referer: `https://id-y2mate.com/`,
            "User-Agent": "Postify/1.0.0",
            "X-Requested-With": "XMLHttpRequest"
          };
    }

    async getDownloadData(){

        
        this.headers.Referer = `https://id-y2mate.com/${this.url}`
        

        const res = await axios.post(`https://id-y2mate.com/mates/analyzeV2/ajax`, new URLSearchParams({
            k_query: this.url,
            k_page: "home",
            q_auto: 0
          }), {
            headers: this.headers
          });

          console.log("res ============"+  JSON.stringify(res.data));
        if (!res.data || !res.data.links || res.status !== 200){
            console.log("res: ", res);
            return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid!";
        }

        const { title, links } = res.data;
        
        let downloadData = Object.values(links["mp4"]).filter(option => {
            return (option.q === "480p" || option.q === "720p") && option.k !== '';
        });
    
        if (downloadData.length === 0) {
            downloadData = Object.values(links["mp4"]).filter(option => {
                return (option.q === "360p") && option.k !== '';
            });
        }
        if (downloadData.length === 0) {
            return null;
        }
        // console.log("===================================");
        // console.log("downloadData: ", downloadData);
        const convert = await axios.post("https://id-y2mate.com/mates/convertV2/index", new URLSearchParams({
            vid: this.videoID,
            k: downloadData[0].k
          }), {
            headers: this.headers
          });
        if (convert.data.status !== "ok" || convert.data.c_status === "FAILED") throw new Error("Error saat konversi.");

        const dataReceived ={
            title: convert.data.title,
            url: convert.data.dlink,
            type: "video",
            quality: convert.data.fquality
        }
        return dataReceived;
    }


    async getDownloadLink(url){
        if (!isValidUrl(url) || !isYouTubeURL(url)) {
            return "Invalid URL provided!";
        }
        this.url = url;
        if (isShortYouTubeURL(url)){
            this.url  = convertShortToLongURL(url);
        }

          try {
            console.log("url: ", this.url);
            this.videoID = this.extractYouTubeID(this.url);
           
            const videoData = await this.getDownloadData();


            console.log("downloadLinks: ", videoData);
            if (videoData.length === 0 || videoData === null) {
                return "Maaf, terdapat kesalahan tidak ada link yang valid ditemukan!";
            }
           // return videoData;
            return `Link dowload berhasil digenerate!\n\nJudul: ${videoData.title}\nKualitas: ${videoData.quality}\n\nLink: ${videoData.url}`;
           
          }
          catch (error) {
              console.log("error while use Downloader: ", error);
              return "Maaf, Terjadi Kesalahan. Mungkin link yang diberikan salah/tidak valid! \n silahkan cari video lainnya";
          }
    }

    extractYouTubeID(url) {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
    
    // Contoh penggunaan
   
    
}

module.exports = YTdownloder;