module.exports = {
  name: "eval",
  hidden: true,
  aliases: ["run"],
  isOwner: true,
  execute(bot, ctx) {
    execState.set(ctx.from.id, true);
    return ctx.reply("🟢 Eval mode ON\nSend code...\nType /exit to stop");
  }
};


