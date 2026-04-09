const os = require("os");

module.exports = {
  name: "status",
  execute(ctx) {
    const pingStart = Date.now();
    const msg = await ctx.reply("⏳ Checking status...");
    const ping = Date.now() - pingStart;

    const cpuLoad = os.loadavg()[0].toFixed(2);

  // RAM
    const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeRAM = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedRAM = totalRAM - freeRAM;
    
    
    let uptime = formatTime(Date.now() - serverStartTime);
      
    const text = `
╭━━━〔 🚀 BOT STATUS 〕━━━╮

⏱️ *Uptime:* \`${uptime}\`
📶 *Ping:* \`${ping} ms\`

🖥️ *CPU Load:* \`${cpuLoad} %\`
💾 *RAM:* \`${usedRAM}MB / ${totalRAM}MB\`
📦 *Storage:* \`{st.used} / ${1024 * 4} GB\`

🗄️ *Database:* Connected 🟢

📜 *Total Commands:* \`{totalCommands}\`
⚙️ *Event Listeners:* \`{listeners}\`

╰━━━━━━━━━━━━━━━━╯
  `;

    ctx.reply(text, { parse_mode: "Markdown" });
  }
};
