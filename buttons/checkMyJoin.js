const isUserJoined = require("../utils/checkChannels.js");


module.exports = {
  name: "check_my_join",

  async execute(bot, ctx) {
 const ok = await isUserJoined(ctx, ctx.from.id, true); // 👈 force

  if (!ok) {
    return ctx.answerCallbackQuery({
      text: "❌ You haven't joined all channels yet!",
      show_alert: true
    });
  }

  try {
    await ctx.deleteMessage();
  } catch {}

  await ctx.answerCallbackQuery({ text: "✅ Verified!" });

  await ctx.reply(
    `<b>🎉 Success!</b>\n\nNow you can use the bot.`,
    { parse_mode: "HTML" }
  );
  }};
