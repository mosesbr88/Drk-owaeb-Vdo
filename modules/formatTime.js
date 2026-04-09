const os = require("os");
const fs = require("fs");

// 🔹 Track start time
const startTime = Date.now();

// 🔹 Example DB (replace with your actual DB check)
async function checkDB() {
  try {
    // put your db ping logic here
    return "✅ Connected";
  } catch (e) {
    return "❌ Disconnected";
  }
}

// 🔹 Format uptime
function formatUptime(ms) {
  let s = Math.floor(ms / 1000);
  let m = Math.floor(s / 60);
  let h = Math.floor(m / 60);
  let d = Math.floor(h / 24);

  h %= 24;
  m %= 60;
  s %= 60;

  return `${d}d ${h}h ${m}m ${s}s`;
}

// 🔹 /status command
bot.command("status", async (ctx) => {
  const pingStart = Date.now();

  const msg = await ctx.reply("⏳ Checking status...");

  const ping = Date.now() - pingStart;

  // CPU
  const cpuLoad = os.loadavg()[0].toFixed(2);

  // RAM
  const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(0);
  const freeRAM = (os.freemem() / 1024 / 1024).toFixed(0);
  const usedRAM = totalRAM - freeRAM;

  // Storage (root)
  let storage = "N/A";
  try {
    const stats = fs.statSync("/");
    storage = "Accessible";
  } catch {
    storage = "Unavailable";
  }

  // DB
  const dbStatus = await checkDB();

  // Commands count (manual or dynamic)
  const totalCommands = bot.commands ? bot.commands.length : "N/A";

  // Event listeners (approx)
  const listeners = bot.listenerCount ? bot.listenerCount("message") : "N/A";

  const uptime = formatUptime(Date.now() - startTime);

  const text = `
╭━━━〔 🚀 BOT STATUS 〕━━━╮

⏱️ *Uptime:* \`${uptime}\`
📶 *Ping:* \`${ping} ms\`

🖥️ *CPU Load:* \`${cpuLoad}\`
💾 *RAM:* \`${usedRAM}MB / ${totalRAM}MB\`
📦 *Storage:* \`${storage}\`

🗄️ *Database:* ${dbStatus}

📜 *Total Commands:* \`${totalCommands}\`
⚙️ *Event Listeners:* \`${listeners}\`

╰━━━━━━━━━━━━━━━━━━━╯
  `;

  await ctx.api.editMessageText(
    ctx.chat.id,
    msg.message_id,
    text,
    { parse_mode: "Markdown" }
  );
});
