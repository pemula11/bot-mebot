
const { downloadMediaMessage, isJidGroup, getContentType,  } = require("baileys");
const moment = require('moment-timezone');
const DatabaseHandler = require('./databaseHandler');
const User = require('../model/user');
const ApiAI = require('../tools/api/AI');
const DownloaderVideo = require('../tools/api/downloaderVideo');
const DownloaderApi = require('../tools/api/downloaderApi');
const YTdownloder = require('../tools/y2madeDownloader');
const YTMusicdownloder = require('../tools/y2AudioDownloader');
const logger = require("../lib/pino");

const databaseHandler = new DatabaseHandler();
const chatGPT = new ApiAI();
const downloaderVideo = new DownloaderVideo();
const y2mateDownloader = new YTdownloder();
const y2AudioDownloader = new YTMusicdownloder();
const downloaderApi = new DownloaderApi();

const timeJakarta = moment().tz('Asia/Jakarta');


const userVar = {
    name: 'name',
    jid: 'jid',
    isRegister: 'isRegister',
    registeredTime: 'registeredTime',
    premium: 'premium',
    banned: 'banned',
    bannedTime: 'bannedTime',
    bannedReason: 'bannedReason',
    limit: 'limit',
    lastClaimTime: 'lastClaimTime',
    totalUsage: 'totalUsage'
}

class MessageHandler{
    constructor(){
        this.message = '';
        this.messageType = '';
        this.commands = {
            help: '/help',
            start: '/start',
            stop: '/stop',
            tanyaAI: '/tanyaAI',
            downloadFB: '/downloadFB',
            findAnime: '/findAnime',
            downloadYTvideo: '/ytvid',
            downloadYTmp3: '/ytmp3',
            downloadTT: '/tt',
            downloadIG: '/ig',
        }
    }

    async handleMessage(dataMessage){
    try{
        console.log("dataMessage: ", dataMessage);
        const {name, jid, isGroup, mediaMessage, text, file, location} = dataMessage;
        if (isGroup) {
            return `Halo ${name}, Bot Tidak Dapat Digunakan Di Grup!`;
        }
        const userData = await databaseHandler.getUser(jid);
        switch (text) {
            case this.commands.start:
                if (!userData){
                    const data = new User(
                        name,
                        jid,
                        true,
                        timeJakarta.format('YYYY-MM-DD HH:mm:ss'),
                        false,
                        false,
                        '',
                        '',
                        20,
                        timeJakarta.format('YYYY-MM-DD HH:mm:ss'),
                        0
                    )
                    await databaseHandler.saveUser(jid, data);
                }
                return `Halo ${name}, Bot Dijalankan!`;
                
            case this.commands.stop:
                if (userData){
                    await databaseHandler.delete(jid);
                }
                return `Halo ${name}, Bot Dihentikan!`;
            case this.commands.help:
                
                return `Halo ${name},  data : ${dataMessage}`;
            
            default:
                break;
        }
        if (!userData) {
            return `Halo ${name}, Kamu Belum Terdaftar!`;
        }
        console.log("register Data: ", userData[userVar.name]);

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
                databaseHandler.addUsageData(jid);
                return res;
            case this.commands.downloadYTvideo:
                databaseHandler.addUsageData(jid);
                return await y2mateDownloader.getDownloadLink(question);
            case this.commands.downloadYTmp3:
                databaseHandler.addUsageData(jid);
                return await y2AudioDownloader.getDownloadLink(question);
            case this.commands.downloadTT:
                databaseHandler.addUsageData(jid);
                return await downloaderApi.downloaderTT(question);
            case this.commands.downloadIG:
                databaseHandler.addUsageData(jid);
                return await downloaderApi.downloaderInstagram(question);
            default:
                return `Perintah Tidak Dikenal!`;
        }
    }
    catch (error) {
       logger.error("error while handle message: ", error);
        return `Maaf, Terjadi Kesalahan!`;
    }
    }

    

}

module.exports = MessageHandler;