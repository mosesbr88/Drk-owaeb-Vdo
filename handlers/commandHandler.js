const fs = require("fs");
const path = require("path");
const { isOwner, isAdmin } = require("../utils/permissions");

module.exports = (bot) => {
  bot.commands = new Map();

  const load = (dir) => {
    const files = fs.readdirSync(dir);
    console.log(files);
    for (const file of files) {
      const full = path.join(dir, file);

      if (fs.lstatSync(full).isDirectory()) {
  load(full);
  continue;
      }
      
      const cmd = require(full);

      if (!cmd.name || !cmd.execute){
        console.log(`❌ | /${cmd.name}`);
        continue;
      }

      bot.commands.set(cmd.name, cmd);
      console.log(`✅ | /${cmd.name}`);
      if (cmd.aliases) {
        cmd.aliases.forEach(a => bot.commands.set(a, cmd));
      }
    }
  };

  load(path.join(__dirname, "../commands"));

  bot.on("message:text", async (ctx) => {
    if (!ctx.from || ctx.from.is_bot) return;

    const text = ctx.message.text;
    if (!text.startsWith("/")) return;

    const parts = text.split(" ");
    const name = parts[0].slice(1).split("@")[0];
    const args = parts.slice(1);

    const cmd = bot.commands.get(name);
    if (!cmd) return;

    if (cmd.isOwner && !isOwner(ctx)) return ctx.reply("❌ Owner only");
    if (cmd.isAdmin && !(await isAdmin(ctx))) return ctx.reply("❌ Admin only");

    await cmd.execute(ctx, args, bot);
  });
};
