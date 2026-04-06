module.exports = {
  name: "ping_btn",

  async execute(ctx) {
    await ctx.answerCallbackQuery();
    ctx.reply("🏓 Button Pong");
  }
};
