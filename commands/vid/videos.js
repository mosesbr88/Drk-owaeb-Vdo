const { Keyboard } = require("grammy");

module.exports = {
  name: "videos",
  description: "Get Videos from the bot",
  execute(bot, ctx) {

    const keyboard = new Keyboard()
      .text("🎬 Video 1")
      .text("🎬 Video 2").row()
      .text("🎬 Video 3")
      .text("🎬 Video 4").row()
      .text("🎬 Video 5")
      .resized(); // mobile friendly

    return ctx.reply(
      "✅",
      {
        reply_markup: keyboard
      }
    );
  }
};
