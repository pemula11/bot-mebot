
const pino = require('pino');
require('dotenv').config();

const fileTransport = pino.transport({
    targets: [
        {   target: 'pino/file', 
            level: 'error',
            options: {  destination: `${process.cwd()}/log/appErr.log` } 
        },
        {
            target: "@logtail/pino",
            options: { sourceToken: process.env.LOG_TOKEN }
        },
        {   target: 'pino/file', 
            options: { destination: `${process.cwd()}/log/app.log` }
        },
        {
            target: 'pino-pretty',
        }
      ]
  
  });


const logger = pino({
    level: 'info',
    fileTransport
});
module.exports = logger;

