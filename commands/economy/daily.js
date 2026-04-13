module.exports = {
  name: "daily",
  description: "Claim daily reward",

  async execute(bot, ctx, args) {
    const userId = ctx.from.id;

    const lastDaily = await db.get(`users.${userId}.daily`) || 0;

    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000; // 24h

    // check cooldown
    if (now - lastDaily < cooldown) {
      const remaining = cooldown - (now - lastDaily);

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      return ctx.reply(
        `<b>⏳ Already Claimed!</b>\n\n` +
        `Come back in <b>${hours}h ${minutes}m</b>.`,
        { parse_mode: "HTML" }
      );
    }

    // random reward (20–40)
    const reward = Math.floor(Math.random() * 21) + 20;

    // add credits
    await db.add(`users.${userId}.$`, reward);

    // set last claim time
    await db.set(`users.${userId}.daily`, now);

    const totalCredits = await db.get(`users.${userId}.$`);

    await ctx.reply(
      `<b>🎁 Daily Reward</b>\n\n` +
      `💰 <b>+${reward}</b> credits\n` +
      `🪙 Balance: <b>${totalCredits}</b>\n\n` +
      `⏳ Come back in <b>24 hours</b> for more!`,
      { parse_mode: "HTML" }
    );
  }
};
