module.exports = {
  name: "status",
  execute(ctx) {
    let uptime = formatTime(Date.now() - serverStartTime);
      const text = `
╭━━━〔 🚀 BOT STATUS 〕━━━╮

⏱️ *Uptime:* \`${uptime}\`
📶 *Ping:* \`-1 ms\`

🖥️ *CPU Load:* \`{cpuLoad}\`
💾 *RAM:* \`{usedRAM}MB / {totalRAM}MB\`
📦 *Storage:* \`{storage}\`

🗄️ *Database:* Connected 🟢

📜 *Total Commands:* \`{totalCommands}\`
⚙️ *Event Listeners:* \`{listeners}\`

╰━━━━━━━━━━━━━━━━━━━╯
  `;

    ctx.reply(text, { parse_mode: "Markdown" });
  }
};
