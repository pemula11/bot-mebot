const {  useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    default: makeWASocket,
    Browsers,
    DisconnectReason,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
   } =  require('baileys');
const { get } = require('http');
const pino = require("pino");
const fs = require("fs");
const Long = require("long");

const { getDataMessage } = require('../lib/helper');

//const readline = require("readline");
//const question = (text) => { const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); return new Promise((resolve) => { rl.question(text, resolve) }) };


class WhatsappHandler {
    constructor(messageHandler) {
        this.instanceQr = {
            count: 0,
            qr: "",
          };
        this.messageHandler = messageHandler;
    }

    async defineAuthState() {
        return  await useMultiFileAuthState('auth')
        
    }

    async setSocket(){
        
        this.authState = await this.defineAuthState();
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_bailey')
        const { version } = await fetchLatestBaileysVersion();
        const browser = Browsers.ubuntu("chrome");
        return  makeWASocket({
                // can provide additional config here
                logger: pino({ level: "silent" }),
                printQRInTerminal: true,
                auth:  this.authState.state,
                browser,
                version,
                connectTimeoutMs: 60 * 1000,
                qrTimeout: 30000,
                emitOwnEvents: true,
                generateHighQualityLinkPreview: true,
            });
    
        
    
    }


    async connectionUpdate({ qr, connection, lastDisconnect }) {
        if (qr) {
            console.log("Please scan the QR code");
            if (this.instanceQr.count > 3) {
              this.instanceQr.count = 0;
              this.instanceQr.qr = "";
              this.client.close();
              this.client = await this.setSocket();
            }
      
            this.instanceQr.count++;
            this.instanceQr.qr = qr;
          }
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
            if (shouldReconnect) {
            await this.connectToWhatsApp();
            }
        } else if (connection === "open") {
            console.log("opened connection");
        }
      
    }

    async  connectToWhatsApp() {
        try {
            this.instanceQr.count = 0;
            this.sock = await this.setSocket()
            //await this.sock.updateProfileName("Sipaling")
        
            // this will be called as soon as the credentials are updated
             this.eventHandler()
        
            
            return this.sock;
        } catch (error) {
            console.log("error", error);
        }
    }

    async eventHandler() {
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
                this.messageHandle(payload);
              }
            
          });
    }

    async messageHandle({messages, type}){
        if(messages[0].key.fromMe) return; // ignore self messages
        // console.log("payload:        ", messages);
        // console.log("+++++++++++++++++++++++++++++++++++++++++++++");
        //console.log('replying to', messages[0].key.remoteJid)
        //await this.sock.sendMessage(messages[0].key.remoteJid, { text: 'Hello there!' })
        for (const received of messages) {
            console.log("type: ", type);
            console.log("received: ", received);

            if (type !== "notify" || !received?.message){
                return ;
            }
            if (Long.isLong(received.messageTimestamp)) {
                received.messageTimestamp = received.messageTimestamp?.toNumber();
                
              }

            const dataMessage = await getDataMessage(received);
            
            if (!dataMessage ) return console.log("+++++++++++++++++++++not a message+++++++++++++++++++++++++++++");
            
            const result = await this.messageHandler.handleMessage(dataMessage);
            
            if (result) {
               
                if (typeof result === "object") {
                   
                    if (result.url) {
                        /////////////////////////+////////////////////////
                        //if type audio
                            if (result.type == "audio") {
                              const up = await this.sock.sendMessage(
                                received.key.remoteJid, {
                                    audio: { url: result.url },
                                    ptt: false,
                                }, 
                                { quoted: messages[0] });
                                
                                return;
                            }
                            /////////////////////////
      
                            //if type video tiktok
                            if (result.isTiktok) {
                                await this.sock.sendMessage(received.key.remoteJid, {
                                        video: {
                                        url: result.url
                                        },
                                        thumbnail: result.thumbnail,
                                        mimetype: "video/mp4",
                                        caption: `🎥Video telah berhasil didownload \n Judul: ${result.title}`
                                    }, {
                                        quoted: messages[0], thumbnail: result.thumbnail
                                    });

                                return;
                            }

                            ///////////////////////// if type any media
                        const generateMedia = await this.mediaSender({url: result.url, title: result.title, type: result.type, thumbnail: result.thumbnail? result.thumbnail : null,});
                        
                        const messageToSend = { ...generateMedia.message };
                        let ownerJid = this.sock.user.id.replace(/:\d+/, "");
                        const resultSend = await this.sock.sendMessage(
                            received.key.remoteJid,
                            {
                                forward: {
                                    key: { remoteJid: ownerJid, fromMe: true },
                                    message: messageToSend,
                                },
                            },
                            { quoted: messages[0] }
                        )
                        /////////////////////////+////////////////////////
                    }
                    await this.sock.sendMessage(
                        received.key.remoteJid,
                        { text: "send media failed" }, { quoted: messages[0] });
                    return;
                }
                await this.sock.sendMessage(
                    received.key.remoteJid,
                    { text: result }, { quoted: messages[0] });
            }
            
          }
       
    }


    async mediaSender(mediaMessage){
       try {
       console.log("===============================prepareMedia==============================");
            const prepareMedia = await prepareWAMessageMedia(
                {
                [mediaMessage.type]: { url: "https://p16-sign-va.tiktokcdn.com/tos-maliva-p-0068/7d87a0d8280f4d2288c5e95f158c9e91_1723031827~tplv-tiktokx-360p.image?dr=14555&nonce=66305&refresh_token=94eae05079fefcdb90730f12ea1d684b&x-expires=1730142000&x-signature=MPsxelbQ6nvkUdXWA37tih0phH0%3D&ftpl=1&idc=maliva&ps=13740610&s=AWEME_DETAIL&shcp=34ff8df6&shp=d05b14bd&t=4d5b0474" },
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
            console.log("prepareMedia: ", prepareMedia);
            console.log("prepareMedia Type: ", prepareMedia[mediaType]);
            let ownerJid = this.sock.user.id.replace(/:\d+/, "");
            return await generateWAMessageFromContent(
                "",
                { [mediaType] : prepareMedia[mediaType] },
                { userJid: ownerJid }
            );
       } catch (error) {
            console.log("error while send media: ", error);
       }
    }



    
}

module.exports = WhatsappHandler;