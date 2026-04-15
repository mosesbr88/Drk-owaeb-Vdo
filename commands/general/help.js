module.exports = {
  name: "help",
  hidden: true,
  description: "Show help",

  execute(bot, ctx, args) {
    const cmds = [...bot.commands.keys()].join(", ");
    ctx.reply(`Commands: ${cmds}`);
  }
};
