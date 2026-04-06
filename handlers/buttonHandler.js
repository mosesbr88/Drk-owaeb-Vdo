const fs = require("fs");
const path = require("path");

module.exports = (bot) => {
  bot.buttons = new Map();

  const files = fs.readdirSync(path.join(__dirname, "../buttons"));

  for (const file of files) {
    const btn = require(`../buttons/${file}`);
    bot.buttons.set(btn.name, btn);
  }

  bot.on("callback_query:data", async (ctx) => {
    if (!ctx.from || ctx.from.is_bot) return;

    const btn = bot.buttons.get(ctx.callbackQuery.data);
    if (!btn) return;

    await btn.execute(ctx, bot);
  });
};