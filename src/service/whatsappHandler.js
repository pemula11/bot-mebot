const {  useMultiFileAuthState,
    fetchLatestBaileysVersion,
    fetchLatestWaWebVersion,
    makeCacheableSignalKeyStore,
    default: makeWASocket,
    Browsers,
    DisconnectReason,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    
   } =  require('baileys');

   const { get } = require('http');
const fs = require("fs");
const Long = require("long");

const pinoLogger = require('../lib/pino');
const { getDataMessage } = require('../lib/helper');
const logger = pinoLogger.getLogger ? pinoLogger.getLogger({ module: "whatsapp" }) : pinoLogger.child({ module: "whatsapp" });


const readline = require("readline");


const question = (text) => 
    {
       
         const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); 
         return new Promise((resolve) => { rl.question(text, resolve) }) 
        
    };


class WhatsappHandler {
    constructor(messageHandler) {
        this.instanceQr = {
            count: 0,
            qr: "",
          };
        this.messageHandler = messageHandler;
        this.loginMethod = process.env.LOGIN_METHOD || "pairing";
        // this.store was using makeInMemoryStore from older Baileys versions; removing as it's not exported in current version
        if (this.loginMethod !== "pairing" && this.loginMethod !== "qr") {
            throw new Error("Invalid login method");
        }
    }

    async defineAuthState() {
        return  await useMultiFileAuthState('auth')
        
    }

    async createSocket(){
        console.log("===========================" + this.loginMethod + "===========================");
        this.authState = await this.defineAuthState();
        const { version } = await fetchLatestWaWebVersion();
        
        const browser = ["Ubuntu", "Chrome", "20.0.04"];
        const additionalConfig = {
            ...this.loginMethod === "pairing" && {
                printQRInTerminal: false,
            },
            ...this.loginMethod === "qr" && {
                printQRInTerminal: true,
                qrTimeout: 30000,
            },
            version
        };

        

        return  makeWASocket({
                // can provide additional config here
               
                logger: logger,
                auth: {
                    creds: this.authState.state.creds,
                    keys: makeCacheableSignalKeyStore(this.authState.state.keys, logger),
                  },
                browser: browser,
                connectTimeoutMs: 60 * 1000,
                shouldSyncHistoryMessage: msg => {
                    console.log(`\x1b[32mMemuat Chat [${msg.progress}%]\x1b[39m`);
                    return !!msg.syncType;
                  },
                  syncFullHistory: true,
                
                emitOwnEvents: true,
                generateHighQualityLinkPreview: true,
                
            }, additionalConfig);
    
    
    
    }

    // Backward compatibility
    async setSocket() {
        return this.createSocket();
    }


    async connectionUpdate({ qr, connection, lastDisconnect }) {
        if (qr && this.loginMethod === "qr") {
            logger.info("Please scan the QR code");
            if (this.instanceQr.count > 3) {
              this.instanceQr.count = 0;
              this.instanceQr.qr = "";
              this.sock.close();
              this.sock = await this.setSocket();
            }
      
            this.instanceQr.count++;
            this.instanceQr.qr = qr;
          }
        
        if (connection === "close") {
            const statusCode = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;
            if (this.loginMethod === "pairing" && statusCode === 428) {
                logger.info({ statusCode }, "waiting for pairing code, not reconnecting");
                return;
            }
            const shouldReconnect = !isLoggedOut;
            logger.info({ error: lastDisconnect.error, shouldReconnect }, "connection closed");
            if (shouldReconnect) {
                await this.connectToWhatsApp();
            }
        } 
        if (connection === "open") {
            logger.info("opened connection");
            logger.info({ version: await fetchLatestBaileysVersion() }, "connected as");
            logger.info({ web: await fetchLatestWaWebVersion() }, "connected web");
            
        }
      
    }

    async  connectToWhatsApp() {
        try {
            this.instanceQr.count = 0;
            this.sock = await this.createSocket()
            //await this.sock.updateProfileName("Sipaling")
        
            

            // this will be called as soon as the credentials are updated
             this.bindSocketEvents()
             if (!this.sock.authState.creds.registered && this.loginMethod === "pairing") {
                await this.enterCode();
            }

            
            // no in-memory store binding in current Baileys version
            return this.sock;
        } catch (error) {
            pinoLogger.error("error: ", {error});
        }
    }

    bindSocketEvents() {
        this.sock.ev.process((events) => {
            // console.log("events nya adalah:      ", events);
            // console.log("---------------------------------");
            if (events["connection.update"]) {
              this.connectionUpdate(events["connection.update"]);
              
            }
      
            if (events["creds.update"]) {
              this.authState.saveCreds();
            }
      
            if (events["messages.upsert"]) {
                const payload = events["messages.upsert"];
                this.handleUpsert(payload);
               // this.store.writeToFile('./baileys_store.json')
              }
            
          });
    }

    async handleUpsert({messages, type}){
        if(messages[0].key.fromMe) return; // ignore self messages
        // console.log("payload:        ", messages);
        // console.log("+++++++++++++++++++++++++++++++++++++++++++++");
        //console.log('replying to', messages[0].key.remoteJid)
        //await this.sock.sendMessage(messages[0].key.remoteJid, { text: 'Hello there!' })
        for (const received of messages) {
            logger.info({ type });
            logger.info( {received});
            if (type !== "notify" || !received?.message){
                return ;
            }
            if (received.message.protocolMessage) {
                return;
            }
            if (Long.isLong(received.messageTimestamp)) {
                received.messageTimestamp = received.messageTimestamp?.toNumber();
                
              }

            const dataMessage = await getDataMessage(received);
            
            if (!dataMessage ) return logger.info("not a message");
            
            const result = await this.messageHandler.handleMessage(dataMessage);
            logger.info("result: ", {result});
            if (result) {
                if (typeof result === "object") {
                  await this.sendMediaFromResult(received, messages, result);
                  return;
                }
                await this.sendText(received.key.remoteJid, result, messages[0]);
            }
            
          }
       
    }

    async sendText(remoteJid, text, quoted) {
        try {
            await this.sock.sendMessage(remoteJid, { text }, { quoted });
        } catch (error) {
            logger.error({ error, text }, "error while send text");
        }
    }

    async sendMediaFromResult(received, messages, result) {
        try {
            if (!result.url) return;
            await this.sock.sendMessage(
                received.key.remoteJid,
                { text: "Media sedang diproses⌛⌛⌛" }, { quoted: messages[0] });

            if (result.type == "audio") {
                await this.sock.sendMessage(
                    received.key.remoteJid,
                    { audio: { url: result.url }, ppt: false },
                    { quoted: messages[0] }
                );
                return;
            }

            if (result.isMedia) {
                let additionalConfig = {};
                if (result.type === "video") {
                    additionalConfig = {
                        mimetype: "video/mp4",
                        caption: result.title,
                        thumbnail: result.thumbnail
                    };
                } else if (result.type === "image") {
                    await this.sock.sendMessage(
                        received.key.remoteJid,
                        {
                            image: result.url,
                            caption: result.title ? result.title : '',
                            thumbnail: result.thumbnail ? result.thumbnail : null,
                        },
                        { quoted: messages[0] }
                    );
                    logger.info("send image success", {result});
                    return;
                } else if (result.type === "audio") {
                    additionalConfig = { mimetype: "audio/mp3", ptt: false };
                } else if (result.type === "document") {
                    if (result.isVideo) {
                        additionalConfig = { mimetype: "video/mp4", caption: result.title };
                    }
                }

                await this.sock.sendMessage(received.key.remoteJid, {
                    [result.type] : { url: result.url, mimetype: [additionalConfig.mimetype] },
                    ...additionalConfig
                }, { quoted: messages[0], thumbnail: result.thumbnail });
                logger.info("send video success", {result});
                return;
            }

            const generateMedia = await this.mediaSender({
                url: result.url,
                title: result.title? result.title : null,
                type: result.type,
                thumbnail: result.thumbnail? result.thumbnail : null,
            });

            logger.info("prepareMedia done");
            const messageToSend = { ...generateMedia.message };
            let ownerJid = this.sock.user.id.replace(/:\d+/, "");
            await this.sock.sendMessage(
                received.key.remoteJid,
                {
                    forward: {
                        key: { remoteJid: ownerJid, fromMe: true },
                        message: messageToSend,
                    },
                },
                { quoted: messages[0] }
            );
        } catch (error) {
            logger.error({error}, "error while send media");
            await this.sock.sendMessage(
                received.key.remoteJid,
                { text: "error while send media " }, { quoted: messages[0] });
        }
    }


    async mediaSender(mediaMessage){
       try {
       logger.info("prepareMedia");
            const prepareMedia = await prepareWAMessageMedia(
                {
                [mediaMessage.type]: { url: mediaMessage.url },
                },
                {
                upload: this.sock.waUploadToServer,
                }
            );
            const mediaType = mediaMessage.type + "Message";
            const mimetype = mediaMessage.type ;

            prepareMedia[mediaType].caption = mediaMessage?.caption;
            prepareMedia[mediaType].mimetype = mimetype;
            prepareMedia[mediaType].fileName = mediaMessage.title? mediaMessage.title : "media";

            if (mediaMessage.mediatype === "video") {
                
                prepareMedia[mediaType].gifPlayback = false;
                prepareMedia[mediaType].thumbnail = mediaMessage.thumbnail;
            }
            // keep silent logs
            let ownerJid = this.sock.user.id.replace(/:\d+/, "");
            return await generateWAMessageFromContent(
                "",
                { [mediaType] : prepareMedia[mediaType] },
                { userJid: ownerJid }
            );
       } catch (error) {
            logger.error({error}, "error while prepare media");
       }
    }


    async enterCode() {
        console.clear();
        const phoneNumber = await question('Input Number Start With Code Cuntry 62xxxx :\n');
        let code = await this.sock.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(`𝑻𝑯𝑰𝑺 𝑼𝑹 𝑪𝑶𝑫𝑬 :`, code);
      }
    
}

module.exports = WhatsappHandler;