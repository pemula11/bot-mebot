
const { downloadMediaMessage, isJidGroup, getContentType,  } = require("baileys");
const DatabaseHandler = require('./databaseHandler');
const ApiAI = require('../tools/api/AI');
const DownloaderVideo = require('../tools/api/downloaderVideo');
const DownloaderApi = require('../tools/api/downloaderApi');
const YTdownloder = require('../tools/y2madeDownloader');
const YTMusicdownloder = require('../tools/y2AudioDownloader');

const databaseHandler = new DatabaseHandler();
const chatGPT = new ApiAI();
const downloaderVideo = new DownloaderVideo();
const y2mateDownloader = new YTdownloder();
const y2AudioDownloader = new YTMusicdownloder();
const downloaderApi = new DownloaderApi();

class MessageHandler{
    constructor(){
        this.message = '';
        this.messageType = '';
        this.commands = {
            'help': '/help',
            'start': '/start',
            'stop': '/stop',
            'tanyaAI': '/tanyaAI',
            'downloadFB': '/downloadFB',
            'findAnime': '/findAnime',
            'downloadYTvideo': '/YTvideo',
            'downloadYTmp3': '/YTmp3',
            'downloadTT': '/TT',
        }
    }

    async handleMessage(dataMessage){
        console.log("dataMessage: ", dataMessage);
        const {name, jid, isGroup, mediaMessage, text, file, location} = dataMessage;
        if (isGroup) {
            return `Halo ${name}, Bot Tidak Dapat Digunakan Di Grup!`;
        }
        const isRegister = await databaseHandler.get(jid);
        
        switch (text) {
            case this.commands.start:
                if (!isRegister){
                    await databaseHandler.save(jid);
                }
                return `Halo ${name}, Bot Dijalankan!`;
                
            case this.commands.stop:
                if (isRegister){
                    await databaseHandler.delete(jid);
                }
                return `Halo ${name}, Bot Dihentikan!`;
            case this.commands.help:
                
                return `Halo ${name},  data : ${dataMessage}`;
            
            default:
                break;
        }
        if (!isRegister) {
            return `Halo ${name}, Kamu Belum Terdaftar!`;
        }

        if (text === 'halo') {
            return `Halo juga ${name}!`;
        }
        if (text.charAt(0) !== '/') {
            return `Perintah Tidak Dikenal!`;
        }
        const getCommand = text.split(' ')[0];
        let question = text.replace(getCommand, "").trim();
        switch (getCommand) {
            case this.commands.tanyaAI:
                
                const res = await chatGPT.ChatGPTResponse(question);
                return res;
            case this.commands.downloadYTvideo:
                return await y2mateDownloader.getDownloadLink(question);
            case this.commands.downloadYTmp3:
                return await y2AudioDownloader.getDownloadLink(question);
            case this.commands.downloadTT:
                return await downloaderApi.downloaderTT(question);
            default:
                return `Perintah Tidak Dikenal!`;
        }

    }

    

}

module.exports = MessageHandler;