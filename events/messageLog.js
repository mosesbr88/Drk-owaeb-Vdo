module.exports = {
  event: "message:text",

  execute(bot, ctx) {
    console.log("Message:", ctx.message.text);
  }
};
