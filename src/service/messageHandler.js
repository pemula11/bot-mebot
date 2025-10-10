
const { downloadMediaMessage, isJidGroup, getContentType,  } = require("baileys");
const moment = require('moment-timezone');
const config = require('../lib/config');
const User = require('../model/user');
const logger = require("../lib/pino");
const {commands, helpMessage, profile, introMessage} = require("../lib/constant");


const timeJakarta = moment().tz(config.timezone);


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
    constructor({ userRepository, commandRouter }){
        this.userRepository = userRepository;
        this.commandRouter = commandRouter;
        this.message = '';
        this.messageType = '';
        this.commands = {
            help: '/help',
            start: '/start',
            stop: '/stop',
            profile: '/profile',
        }
    }

    async handleMessage(dataMessage){
    try{
        console.log("dataMessage: ", dataMessage);
        const {name, jid, isGroup, mediaMessage, text, file, location} = dataMessage;
        if (isGroup) {
            return `Maaf, Bot belum Dapat Digunakan Di Grup!`;
        }
        const userData = await this.userRepository.getUser(jid);
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
                    await this.userRepository.saveUser(jid, data);
                }
                return `💕💕💕 Selamat @${jid}, Kamu telah berhasil mendaftar pada Bot kami! 💕💕💕 \n\n ${this.commandRouter.getAllCommands()}`;
                
            case this.commands.stop:
                // if (userData){
                //     await databaseHandler.delete(jid);
                // }
                return `Halo ${name}, Bot Dihentikan!`;
            case this.commands.help:
                
                return this.commandRouter.getAllCommands();
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
        const res = await this.commandRouter.handleCommand(getCommand, question, userData, dataMessage);
        this.userRepository.addUsageData(jid);
        return res;
       
    }
    catch (error) {
       logger.error("error while handle message: ", error);
       console.log("error: ", error);
        return `Maaf, Terjadi Kesalahan!`;
    }
    }

    

}

module.exports = MessageHandler;