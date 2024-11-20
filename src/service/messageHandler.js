
const { downloadMediaMessage, isJidGroup, getContentType,  } = require("baileys");
const moment = require('moment-timezone');
const DatabaseHandler = require('./databaseHandler');
const User = require('../model/user');
const logger = require("../lib/pino");
const CommandHandler = require('./commandHandler');
const {commands, helpMessage, profile, introMessage} = require("../lib/constant");


const databaseHandler = new DatabaseHandler();
const commandHandler = new CommandHandler();


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
            profile: '/profile',
            tanyaAI: '/tanyaAI',
            downloadFB: '/fb',
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
            return `Maaf, Bot belum Dapat Digunakan Di Grup!`;
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
                return `💕💕💕 Selamat @ ${jid}, Kamu telah berhasil mendaftar pada Bot kami! 💕💕💕 \n\n ${helpMessage}`;
                
            case this.commands.stop:
                // if (userData){
                //     await databaseHandler.delete(jid);
                // }
                return `Halo ${name}, Bot Dihentikan!`;
            case this.commands.help:
                
                return helpMessage;
            default:
                break;
        }
        if (!userData) {
            return introMessage;
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
        const res = commandHandler.handleCommand(getCommand, question, userData);
        databaseHandler.addUsageData(jid);
        return res;
       
    }
    catch (error) {
       logger.error("error while handle message: ", error);
        return `Maaf, Terjadi Kesalahan!`;
    }
    }

    

}

module.exports = MessageHandler;