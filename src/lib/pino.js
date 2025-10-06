
const pino = require('pino');
const config = require('./config');

const fileTransport = pino.transport({
    targets: [
        {   target: 'pino/file', 
            level: 'error',
            options: { mkdir: true, destination: `${process.cwd()}/logs/appErr.log` } 
        },
        ...(config.logToken ? [{
            target: "@logtail/pino",
            options: { sourceToken: config.logToken }
        }] : []),
        {   target: 'pino/file', 
            options: { mkdir: true, destination: `${process.cwd()}/logs/app.log` }
        },
        {
            target: 'pino-pretty',
        }
      ]
  
  });


const logger = pino(fileTransport);

function getLogger(bindings = {}) {
  return logger.child(bindings);
}

module.exports = logger;
module.exports.getLogger = getLogger;

