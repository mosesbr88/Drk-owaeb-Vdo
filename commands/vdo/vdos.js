const { Keyboard } = require("grammy");
let vdoConfig = require("../../vdoConfig");

module.exports = {
  name: "videos",
  description: "Get Videos from the bot",
  execute(bot, ctx) {

    try {
    ctx.deleteMessage();
    } catch {};
    const keyboard = new Keyboard().resized().placeholder("Choose A Category...");

      for(let i=0; i<vdoConfig.length; i++){
        keyboard.text(vdoConfig[i].name);
        if(vdoConfig[i].row) keyboard.row();
      };
          
    /*  .text("🎬 Video 1")
      .text("🎬 Video 2").row()
      .text("🎬 Video 3")
      .text("🎬 Video 4").row()
      .text("🎬 Video 5")
      .resized(); // mobile friendly*/

    return ctx.reply(
      "✅",
      {
        reply_markup: keyboard
      }
    );
  }
};
