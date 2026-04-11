const fullText = `🎁 Join this bot & watch V¡deos 🌚;
${atob("Qw==")}¡${atob("UA==")}¡ • ԁ${atob("cg==")κ ${atob("dw==")}€${atob("Yg==")} • ${atob("YzByTg==")}

🔗 Link: $link
🎟️ Code: $code`;

module.exports = {
  name: "copy_ref",

  async execute(bot, ctx) {
    let code = await db.get(`users.${ctx.from.id}.ref_code`);
    
    let link = `https://t.me/${bot.userName}?start=${code}`;
    
    await ctx.answerCallbackQuery({
        text: "✅ Invite text ready to copy!",
        show_alert: false, // 👈 toast instead of popup
      });

      await ctx.reply(
        `<b>📋 Copy Your Invite:</b>\n\n<pre>${fullText.replace("$link", link).replace("$code", code)}</pre>`,
        { parse_mode: "HTML" }
      );
  }
};
