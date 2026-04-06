module.exports = async (bot) => {
  const commands = [];

  bot.commands.forEach((cmd) => {
    commands.push({
      command: cmd.name,
      description: cmd.description || "No desc"
    });
  });

  await bot.api.setMyCommands(commands);
};