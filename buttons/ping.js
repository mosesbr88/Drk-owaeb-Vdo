module.exports = {
  name: "ping_btn",

  async execute(ctx) {
    //await ctx.answerCallbackQuery();
   await ctx.answerCallbackQuery({
  text: "YOU CLICKED THE BUTTON",
  show_alert: true
});
    //ctx.reply("🏓 Button Pong");
  }
};
