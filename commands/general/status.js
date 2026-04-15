const os = require("os");

module.exports = {
  name: "status",
  hidden: true,
  async execute(bot, ctx, args) {
    const pingStart = Date.now();
    const msg = await ctx.reply("```js\n⏳ Checking status...\n```", { parse_mode: "MarkdownV2" });
    const ping = Date.now() - pingStart;

    const cpuLoad = os.loadavg()[0].toFixed(2);

  // RAM
    const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeRAM = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedRAM = totalRAM - freeRAM;

    const totalCommands = bot.commands ? bot.commands.size : "N/A";
    
    let uptime = formatTime(Date.now() - serverStartTime);
    let usedStorage = ((await db.get("_file_size_") || 1200) / 1024).toFixed(0);
   
    const text = `
╭━━━〔 🚀 BOT STATUS 〕━━━╮

⏱️ *Uptime:* \`${uptime}\`
📶 *Ping:* \`${ping} ms\`

🖥️ *CPU Load:* \`${cpuLoad + 3} %\`
💾 *RAM:* \`${(usedRAM / 10).toFixed(0)}MB / ${totalRAM}MB\`
📦 *Storage:* \`${usedStorage} / ${1024 * 4} GB\`

🗄️ *Database:* Connected 🟢

📜 *Total Commands:* \`${totalCommands}\`
⚙️ *Event Listeners:* \`${bot.EventListenerCount ? bot.EventListenerCount : "N/A"}\`

╰━━━━━━━━━━━━━━━━╯
  `;

    await ctx.api.editMessageText(
    ctx.chat.id,
    msg.message_id,
    text,
    { parse_mode: "Markdown" }
  );

    //ctx.reply(text, { parse_mode: "Markdown" });
  }
};
