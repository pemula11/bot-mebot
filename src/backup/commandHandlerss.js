const glob = require('glob');
const fg = require('fast-glob');
const syntaxerror = require('syntax-error');

const lodash = require('lodash');
const path = require('path');
const {
    readdirSync,
    statSync,
    unlinkSync,
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync,
    rmSync,
    createWriteStream,
  } =  require('fs');
const logger = require('../lib/pino');


const directoryName = process.cwd();
global.plugins = {};
const pluginsDirectory = path.resolve(directoryName, 'src/plugins');
const pattern = '**/*.js'; // Pola untuk mencocokkan semua file


async function loadPlugins() {
 // const CommandsFiles = glob.sync("D:/programming/Project/belajar-bot-wa/plugins/**/*.*");
 const CommandsFiles = fg.sync(fg.convertPathToPattern(pluginsDirectory+'/**/*.*'));

    console.log("directoryName: ", pluginsDirectory);
    console.log("CommandsFiles: ", CommandsFiles);
    
    const importPromises = CommandsFiles.map(async (filePath) => {
     
      try {
        const handler = require(filePath);
       
        if (handler) {
          if (handler.command) {
            handler.command.forEach((command) => {
              plugins[command] = handler;
            });
          }
          return {
            filePath,
            success: true,
          };
        }
        return {
          filePath,
          error: 'No handler found',
          success: false,
        };
      } catch (e) {
        return {
          filePath,
          error: e.message,
          success: false,
        };
      }
    });


    try {
      const results = await Promise.all(importPromises);
      const successResults = results.filter((result) => result.success);
      const errorResults = results.filter((result) => !result.success);
      plugins = lodash
        .chain(plugins)
        ?.toPairs()
        ?.sortBy(([a]) => a)
        ?.fromPairs()
        ?.value();
      const loadedPluginsMsg = `Loaded ${CommandsFiles.length} JS Files total.`;
      const successPluginsMsg = `✅ Success Plugins:\n${successResults.length} total.`;
      const errorPluginsMsg = `❌ Error Plugins:\n${errorResults.length} total`;
     
      const errorMessagesText = errorResults
        .map(
          (error, index) =>
            `❗ *Error ${index + 1}:* ${error.filePath}\n - ${error.error}`,
        )
        .join("\n");
      const messageText =
        `- 🤖 *Loaded Plugins Report* 🤖\n` +
        `🔧 *Total Plugins:* ${CommandsFiles.length}\n` +
        `✅ *Success:* ${successResults.length}\n` +
        `❌ *Error:* ${errorResults.length}\n` +
        (errorResults.length > 0 ? errorMessagesText : "");
     
        console.log(messageText);
        console.log(": ", plugins);
      //  console.log("plugins: ", plugins["ytvid"].call("https://www.youtube.com/watch?v=6Dh-RL__uN4"));
    } catch (e) {
      logger.error(`\nError sending message: ${e}`);
    }
  }

  

  loadPlugins();
  