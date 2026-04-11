const fullText = `🎁 Join this bot & earn rewards!

🔗 Link: $link
🎟️ Code: $code`;

module.exports = {
  name: "copy_ref",

  async execute(ctx) {
    await ctx.answerCallbackQuery({
        text: "✅ Invite text ready to copy!",
        show_alert: false, // 👈 toast instead of popup
      });

      await ctx.reply(
        `<b>📋 Copy Your Invite:</b>\n\n<pre>${fullText}</pre>`,
        { parse_mode: "HTML" }
      );
  }
};
