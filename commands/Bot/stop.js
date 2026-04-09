module.exports = {
  name: "stop",
  aliases: ["kill"],
  isOwner: true,
  async execute(ctx) {
    await ctx.reply("🛑 Stopping bot..., 💤💤💤");
    await bot.stop(); // polling stop karega
    process.exit(0); // clean exit
  }
};

