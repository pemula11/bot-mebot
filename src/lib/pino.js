
const pino = require('pino');
require('dotenv').config();

const fileTransport = pino.transport({
    targets: [
        {   target: 'pino/file', 
            level: 'error',
            options: { mkdir: true, destination: `${process.cwd()}/logs/appErr.log` } 
        },
        {
            target: "@logtail/pino",
            options: { sourceToken: process.env.LOG_TOKEN }
        },
        {   target: 'pino/file', 
            options: { mkdir: true, destination: `${process.cwd()}/logs/app.log` }
        },
        {
            target: 'pino-pretty',
        }
      ]
  
  });


const logger = pino(fileTransport);
module.exports = logger;

