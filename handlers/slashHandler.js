module.exports = async (bot) => {
  const commands = [];

  bot.commands.forEach((cmd) => {
    if(!(cmd.hidden)){
    commands.push({
      command: cmd.name,
      description: cmd.description || "No desc"
    });
    }
  });

  await bot.api.setMyCommands(commands);
};
