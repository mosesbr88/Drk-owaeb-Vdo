
async function handleRedeemCodes(bot, ctx, rawRedeemCode, userDetails) {
  try {
    let { userId, username } = userDetails;

    // Remove prefix
    let redeemCode = rawRedeemCode.replace("RC_", "").trim();

    // Database se codes lao 
        let redeemCodes = await db.get(`redeemCodes.${redeemCode}`);
        

    let codeData = redeemCodes;

    // ❌ Invalid code
    if (!codeData) {
      return ctx.reply("❌ Invalid redeem code.");
    }

    // ❌ Expired
    if (Date.now() > codeData.validUntil) {
      return ctx.reply("⏳ This code has expired.");
    }

    // ❌ Max users reached
    if (codeData.users.length >= codeData.max_users) {
      return ctx.reply("🚫 This code has already been fully redeemed.");
    }

    // ❌ Already used
    if (codeData.users.includes(userId)) {
      return ctx.reply("⚠️ You have already used this code.");
    }

    // ✅ Reward add karo
   /* let userDb = await db.get("users") || {};*/
    db.push(`redeemCodes.${redeemCode}.users`, userId);
    db.add(`users.${userId}.$`, codeData["$"])
    //codeData.users.push(userId);

    // ✅ Success reply
    tgLogger.log(
  `User redeemed code: ${redeemCode}

UserId: ${userId}
Username: ${username}
Reward: $${codeData["$"]}
Total Users: [${codeData.users.join(", ")}]

Slots Left: ${codeData.max_users - (codeData.users.length + 1)}`
);
    return ctx.reply(
      `🎉 Redeem successful!\n\n💰 Reward: ${codeData["$"]}\n👤 User: ${username}`
    );

  } catch (err) {
    console.error(err);
    return ctx.reply("⚠️ Something went wrong. Try again later.");
  }
}

module.exports = handleRedeemCodes;
