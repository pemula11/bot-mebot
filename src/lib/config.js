require('dotenv').config();

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  logToken: process.env.LOG_TOKEN || '',
  timezone: process.env.TZ || 'Asia/Jakarta',
};

module.exports = appConfig;


