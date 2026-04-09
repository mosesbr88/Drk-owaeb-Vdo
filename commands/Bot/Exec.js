module.exports = {
  name: "eval",
  aliases: ["run"],
  isOwner: true,
  execute(ctx) {
    execState.set(ctx.from.id, true);
    return ctx.reply("🟢 Eval mode ON\nSend code...\nType /exit to stop");
  }
};


