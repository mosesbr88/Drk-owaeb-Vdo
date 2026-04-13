function getProgress(current = 0, required = 20) {
  const totalBars = 10;

  const ratio = Math.min(current / required, 1);
  const filledBars = Math.round(ratio * totalBars);

  return "▰".repeat(filledBars) + "▱".repeat(totalBars - filledBars);
}

module.exports = {
  name: "weekly",
  description: "Claim weekly reward",

  async execute(bot, ctx, args) {
    const userId = ctx.from.id;

    const now = Date.now();
    const cooldown = 7 * 24 * 60 * 60 * 1000;
    const userDetails = await db.get(`users.${userId}`);
    
    const lastWeekly = userDetails.weekly || 0;
    const refs = userDetails.total_ref || 0;

    const requiredRefs = 20;

    // ❌ Not enough referrals
    if (refs < requiredRefs) {
      const progress = getProgress(refs, requiredRefs);
      const remainingRefs = requiredRefs - refs;

      const botUsername = (await bot.api.getMe()).username;
      const shareLink = `https://t.me/${bot.userName}?start=${userDetails.ref_code}`;

      return ctx.reply(
        `<b>🔒 Weekly Locked</b>\n\n` +
        `${progress}\n` +
        `<b>${refs}/${requiredRefs} referrals</b>\n` +
        `Only <b>${remainingRefs}</b> referral${remainingRefs === 1 ? "" : "s"} left!\n\n` +
        `Invite more friends to unlock 🎁`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔗 Share Link",
                  url: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}`
                }
              ]
            ]
          }
        }
      );
    }

    // ⏳ Cooldown
    if (now - lastWeekly < cooldown) {
      const remaining = cooldown - (now - lastWeekly);

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      return ctx.reply(
        `<b>⏳ Already Claimed!</b>\n\n` +
        `Come back in <b>${days}d ${hours}h</b>.`,
        { parse_mode: "HTML" }
      );
    }

    // ✅ Reward
    const reward = 200;

    await db.add(`users.${userId}.$`, reward);
    await db.set(`users.${userId}.weekly`, now);

    const totalCredits = userDetails.$ + reward;

    await ctx.reply(
      `<b>🎁 Weekly Reward</b>\n\n` +
      `💰 <b>+${reward}</b> credits\n` +
      `🪙 Balance: <b>${totalCredits}</b>\n\n` +
      `⏳ Come back in <b>7 days</b> for more!`,
      { parse_mode: "HTML" }
    );
  }
};
