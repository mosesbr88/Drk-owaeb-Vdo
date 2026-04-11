const { InlineKeyboard } = require("grammy");
const generateRandomToken = require("../../modules/generateRandomToken.js");

function getJoinDate() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date());
}

function buildWelcomeMessage(user, bonus, refText, refCode, botUsername) {
  const link = `https://t.me/${bot.userName}?start=${refCode}`;

  return {
    text: `
<b>✨ Welcome ${user}!</b>

🎁 <b>Bonus Received:</b> +${bonus} credits  

${refText}

<blockquote>
🔗 <b>Your Referral Link</b>
${link}

🎟️ <b>Your Code:</b> <code>${refCode}</code>
</blockquote>

💡 <i>Invite friends & earn more rewards!</i>
❓ Use /help to explore all commands
`,
    link,
  };
}

module.exports = {
  name: "start",
  description: "Start bot",

  async execute(ctx, args, bot) {
    const userId = ctx.from.id;
    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : ctx.from.first_name;

    // Already registered
    if (await db.get(`users.${userId}`)) {
      if (args.length > 0) {
        return ctx.reply("❌ You are already registered. Referral not allowed.");
      }

      const data = await db.get(`users.${userId}`);
      return ctx.reply(
        `<b>💐 Welcome Back!</b>\n\n<pre>${JSON.stringify(data, null, 2)}</pre>`,
        { parse_mode: "HTML" }
      );
    }

    // Create new ref code
    const newRefCode = generateRandomToken();
    const botUsername = bot.userName;
    const referralLink = `https://t.me/${botUsername}?start=${newRefCode}`;

    // Keyboard
    const keyboard = new InlineKeyboard()
      .url(
        "🔗 Share",
        `https://t.me/share/url?url=${encodeURIComponent(
          referralLink
        )}&text=${encodeURIComponent(
          "🎉 Join & earn free credits now!"
        )}`
      )
      .text("📋 Copy", "copy_ref");

    // FULL COPY TEXT
    const fullText = `🎁 Join this bot & earn rewards!

🔗 Link: ${referralLink}
🎟️ Code: ${newRefCode}`;

    // No referral
    if (args.length < 1) {
      await db.set(`users.${userId}`, {
        $: 20,
        joined_at: Date.now(),
        ref_code: newRefCode,
        total_ref: 0,
      });

      await db.set(`refCodes.${newRefCode}.cId`, userId);

      const msg = buildWelcomeMessage(
        username,
        20,
        "🚀 <b>Welcome bonus unlocked!</b>",
        newRefCode,
        botUsername
      );

      await ctx.reply(msg.text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });

      tgLogger.log(`🤝 New user: ${userId} (${username}) | +20`);
    }

    // With referral
    else {
      if (!RFCode[args[0]]) {
        return ctx.reply("❌ Invalid or expired referral code.");
      }

      const refUserId = RFCode[args[0]].createdBy;
      const RFUser = await bot.api.getChat(refUserId);

      if (!RFUser) {
        return ctx.reply("⚠️ Invalid referrer.");
      }

      await db.set(`users.${userId}`, {
        $: 100,
        joined_at: Date.now(),
        ref_by: args[0],
        ref_code: newRefCode,
        total_ref: 0,
      });

      await db.set(`refCodes.${newRefCode}.cId`, userId);

      await db.add(`users.${refUserId}.total_ref`, 1);
      await db.add(`users.${refUserId}.$`, 50);

      const refName = RFUser.username
        ? `@${RFUser.username}`
        : RFUser.first_name;

      const msg = buildWelcomeMessage(
        username,
        100,
        `🎉 You joined using <b>${refName}</b>'s referral!`,
        newRefCode,
        botUsername
      );

      await ctx.reply(msg.text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });

      await bot.api.sendMessage(
        refUserId,
        `🎉 <b>New Referral Joined!</b>

👤 ${username}
🪙 +50 credits added  
👥 Total referrals updated!`,
        { parse_mode: "HTML" }
      );

      tgLogger.log(`🤝 ${username} joined via ${refName} | +100`);
    }
  },
};
