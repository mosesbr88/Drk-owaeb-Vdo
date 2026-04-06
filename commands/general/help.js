module.exports = {
  name: "help",
  description: "Show help",

  execute(ctx, args, bot) {
    const cmds = [...bot.commands.keys()].join(", ");
    ctx.reply(`Commands: ${cmds}`);
  }
};