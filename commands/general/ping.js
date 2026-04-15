module.exports = {
  name: "ping",
  hidden: true,

  async execute(bot, ctx) {
    const start = Date.now();

    // loading message
    const msg = await ctx.reply("⏳ Checking ping...");

    const ping = Date.now() - start;

    // status color
    let status = "🟢 Fast";
    if (ping > 300) status = "🔴 Slow";
    else if (ping > 150) status = "🟡 Normal";

    const text = `
<b>⚡ BOT STATUS</b>

🏓 <b>Pong!</b>
⏱️ <b>Ping:</b> <code>${ping} ms</code>
📶 <b>Status:</b> ${status}
`;

    // edit message with final result
    await ctx.api.editMessageText(
      ctx.chat.id,
      msg.message_id,
      text,
      {
        parse_mode: "HTML",
      }
    );
  }
};
