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

let { buildWelcomeMessage, buildStartMessage, newUserLogTemplate } = require("../../helper/buildStartMessage.js");

module.exports = {
  name: "start",
  description: "Start bot",

  async execute(bot, ctx, args) {
    const userId = ctx.from.id;
    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : ctx.from.first_name;
// ✅
    
    // Already registered
    const deta = await db.get(`users.${userId}`);
    if (deta) {
      if (args.length > 0) {
        return ctx.reply("❌ You are already registered. Referral not allowed. Try /start instead.");
      } // ✅

      ctx.reply(
        `<b>💐 Welcome Back!</b>\n\n<pre>${JSON.stringify(deta, null, 2)}</pre>`,
        { parse_mode: "HTML" }
      );

      const msg = buildStartMessage({
        credit: deta.$,
        user: username,
        totalRefferals: deta.total_ref,
        refCode: deta.ref_code,
        botUsername: bot.userName
      });
      
    const keyboard = new InlineKeyboard()
      .url(
        "🔗 Share",
        `https://t.me/share/url?url=${encodeURIComponent(
          msg.link
        )}&text=${encodeURIComponent(
          `🎁 Join this bot & watch V¡deos 🌚;

» ${atob("Qw==")}¡${atob("UA==")}¡ • ԁ${atob("cg==")}κ ${atob("dw==")}€${atob("Yg==")} • ${atob("YzByTg==")}`
        )}`
      )
      .text("📋 Copy", "copy_ref");
      
      await ctx.reply(msg.text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
      return;
    } // ✅

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
          `🎁 Join this bot & watch V¡deos 🌚;

» ${atob("Qw==")}¡${atob("UA==")}¡ • ԁ${atob("cg==")}κ ${atob("dw==")}€${atob("Yg==")} • ${atob("YzByTg==")}`
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
// ✅
      tgLogger.log(newUserLogTemplate({
    username,
    id: userId,
    referrerId: "None",
    refCode: "N/A",
    refCount: "N/A",
    userRefCode: newRefCode,
    joinDate: getJoinDate(),
    bonus: 20
  }),
  { parse_mode: "HTML" });
      // ✅
    }

    // With referral
    else {
      const refUserId = await db.get(`refCodes.${args[0]}.cId`);
      if (!refUserId) {
        return ctx.reply("❌ Invalid referral code Provided.");
      } // ✅

      const RFUser = await bot.api.getChat(refUserId);

      if (!RFUser) {
        return ctx.reply("⚠️ Invalid referrer.");
      }

      await db.set(`users.${userId}`, {
        $: 70,
        joined_at: Date.now(),
        ref_by: args[0],
        ref_code: newRefCode,
        total_ref: 0,
      });

      await db.set(`refCodes.${newRefCode}.cId`, userId);

      let updatedReferral = await db.add(`users.${refUserId}.total_ref`, 1);
      await db.add(`users.${refUserId}.$`, 50);

      const refName = RFUser.username
        ? `@${RFUser.username}`
        : RFUser.first_name;

      const msg = buildWelcomeMessage(
        username,
        70,
        `🎉 You joined using <b>${refName}</b>'s referral!`,
        newRefCode,
        botUsername
      );

      await ctx.reply(msg.text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });

      let refData = await db.get(`users.${refUserId}`);
      await bot.api.sendMessage(
        refUserId,
        `🎉 <b>New Referral Joined!</b>

👤 ${username}
🪙 +50 credits added  
👥 Total referrals ${refData.total_ref -1} +1!`,
        { parse_mode: "HTML" }
      );

      //tgLogger.log(`🤝 ${username} joined via ${refName} | +70`);
      tgLogger.log(newUserLogTemplate({
    username,
    id: userId,
    referrerId: `${refUserId} : ${refName}`,
    refCode: refData.ref_code,
    refCount: refData.total_ref,
    userRefCode: newRefCode,
    joinDate: getJoinDate(),
    bonus: 70
  }),
  { parse_mode: "HTML" });
    }
  },
};
