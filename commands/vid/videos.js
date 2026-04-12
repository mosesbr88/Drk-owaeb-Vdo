const { InlineKeyboard } = require("grammy");

module.exports = {
  name: "videos",
  description: "Get Videos from the bot",
  execute(bot, ctx) {

    const keyboard = new InlineKeyboard()
      .text("🎬 Video 1", "video_1")
      .text("🎬 Video 2", "video_2").row()
      .text("🎬 Video 3", "video_3")
      .text("🎬 Video 4", "video_4").row()
      .text("🎬 Video 5", "video_5");

    return ctx.reply("✅", {
      reply_markup: keyboard
    });
  }
};
