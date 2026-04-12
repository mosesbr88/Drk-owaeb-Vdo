module.exports = {
  name: "help",
  description: "Show help",

  execute(bot, ctx, args) {
    const cmds = [...bot.commands.keys()].join(", ");
    ctx.reply(`Commands: ${cmds}`);
  }
};
