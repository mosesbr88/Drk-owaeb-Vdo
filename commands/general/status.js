module.exports = {
  name: "status",
  execute(ctx) {
    let uptime = serverStartTime - Date.now();
      const text = `
╭━━━〔 🚀 BOT STATUS 〕━━━╮

⏱️ *Uptime:* \`${uptime}\`
📶 *Ping:* \`{ping} ms\`

🖥️ *CPU Load:* \`{cpuLoad}\`
💾 *RAM:* \`{usedRAM}MB / {totalRAM}MB\`
📦 *Storage:* \`{storage}\`

🗄️ *Database:* {dbStatus}

📜 *Total Commands:* \`{totalCommands}\`
⚙️ *Event Listeners:* \`{listeners}\`

╰━━━━━━━━━━━━━━━━━━━╯
  `;

    ctx.reply(text);
  };
};
