const fs = require("fs");
const path = require("path");

module.exports = (bot) => {
  const files = fs.readdirSync(path.join(__dirname, "../events"));

  bot.EventListenerCount = 0;
  
  for (const file of files) {
    const event = require(`../events/${file}`);
bot.EventListenerCount += 1;
    bot.on(event.event, (ctx, next) => {
      if (!ctx.from || ctx.from.is_bot) return next();
      event.execute(bot, ctx);
      next();
    });
  }
};
