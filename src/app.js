const express = require('express');
const WhatsappHandler = require('./service/whatsappHandler');
const MessageHandler = require('./service/messageHandler');
const DatabaseHandler = require('./service/databaseHandler');
const CommandRouter = require('./service/commandHandler');
const {  useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    default: makeWASocket,
    Browsers,
    DisconnectReason,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
   } =  require('baileys');

// Compose dependencies
const userRepository = new DatabaseHandler();
const commandRouter = new CommandRouter();
const messageHandler = new MessageHandler({ userRepository, commandRouter });
const whatsappHandler = new WhatsappHandler(messageHandler);
const pino = require("pino");
const app = express();



async function connectToWhatsApp () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_bailey')
        const { version } = await fetchLatestBaileysVersion();
        const browser = Browsers.ubuntu("chrome");
    const sock = makeWASocket({
        // can provide additional config here
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
         browser,
        version,
        connectTimeoutMs: 60 * 1000,
        qrTimeout: 30000,
        emitOwnEvents: true,
        generateHighQualityLinkPreview: true,
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error )?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    // this will be called as soon as the credentials are updated
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('messages.upsert', async m => {
        if(m.messages[0].key.fromMe) return; // ignore self messages
        console.log(JSON.stringify(m, undefined, 2))

        console.log('replying to', m.messages[0].key.remoteJid)
        await sock.sendMessage(m.messages[0].key.remoteJid, { text: 'Hello there!' })
    })
}

// run in main file
whatsappHandler.connectToWhatsApp();

//connectToWhatsApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
