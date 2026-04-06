require("./express");
const { Bot } = require("grammy");

let RFCode = {};
global.RFCode = RFCode;

const { token } = require("./config");

const bot = new Bot(token);

// middlewares
bot.use(require("./middlewares/logger"));
bot.use(require("./middlewares/session"));

// handlers
require("./handlers/commandHandler")(bot);
require("./handlers/buttonHandler")(bot);
require("./handlers/eventHandler")(bot);
require("./handlers/slashHandler")(bot);

bot.start();

console.log("🚀 Bot running...");
