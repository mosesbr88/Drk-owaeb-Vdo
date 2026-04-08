const fs = require("fs");
const path = require("path");

module.exports = (bot) => {
  const files = fs.readdirSync(path.join(__dirname, "../events"));

  for (const file of files) {
    const event = require(`../events/${file}`);

    bot.on(event.event, (ctx, next) => {
      if (!ctx.from || ctx.from.is_bot) return next();
      event.execute(ctx, bot);
      next();
    });
  }
};
