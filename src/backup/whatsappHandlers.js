const {  useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    default: makeWASocket,
    Browsers,
    DisconnectReason,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
   } =  require('baileys');
   const pino = require("pino");


class WhatsappHandlers {
    constructor(messageHandler) {
        this.instanceQr = {
            count: 0,
            qr: "",
          };
        this.messageHandler = messageHandler;
    }

    async defineAuthState() {
        return  await useMultiFileAuthState('auth_info')
        
    }

    async setSocket(){
        this.authState = await this.defineAuthState();
        const { state, saveCreds } = await useMultiFileAuthState("session")
        const { version } = await fetchLatestBaileysVersion();
        const browser = Browsers.ubuntu("chrome");
        return  makeWASocket({
            logger: pino({ level: "silent" }),
            printQRInTerminal: true,
            auth: state,
             browser,
            version,
            connectTimeoutMs: 60 * 1000,
            qrTimeout: 30000,
            emitOwnEvents: true,
            generateHighQualityLinkPreview: true,
        });
    
        
    
    }


    async connectionUpdate({ qr, connection, lastDisconnect }) {
       if (qr){

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
          
            this.sock = await this.setSocket()
        
            // this will be called as soon as the credentials are updated
             this.eventHandler()
        
            
            return this.sock;
        } catch (error) {
            console.log("error", error);
        }
    }

    async eventHandler() {
        this.sock.ev.process((events) => {
            console.log("events nya adalah:      ", events);
            console.log("---------------------------------");
            if (events["connection.update"]) {
              this.connectionUpdate(events["connection.update"]);
            }
      
            if (events["creds.update"]) {
              this.authState.saveCreds();
            }
      
            if (events["messages.upsert"]) {
                const payload = events["messages.upsert"];
                this.messageHandle["messages.upsert"](payload);
              }
            
          });
    }

    async messageHandle({messages, type}){
        console.log("payload:        ", messages);
       
    }



    
}

module.exports = WhatsappHandlers;