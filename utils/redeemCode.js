let redeemCodes = {
      "100_member_special": {
        "$": 100,
        users: [],
        validUntil: Date.now() + 1000 * 30, // 10 min
        max_users: 1
      }
    };

async function handleRedeemCodes(bot, ctx, rawRedeemCode, userDetails, db) {
  try {
    let { userId, username } = userDetails;

    // Remove prefix
    let redeemCode = rawRedeemCode.replace("RC_", "").trim();

    // Database se codes lao (fallback demo object)
  //  let redeemCodes;

    let codeData = redeemCodes[redeemCode];

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
   /* let userDb = await db.get("users") || {};

    if (!userDb[userId]) {
      userDb[userId] = { balance: 0 };
    }*/

   // userDb[userId].balance += codeData["$"];

    // Mark as used
    codeData.users.push(userId);

    // Save back
  //  redeemCodes[redeemCode] = codeData;
 //   await db.set("redeemCodes", redeemCodes);
//    await db.set("users", userDb);

    // ✅ Success reply
    return ctx.reply(
      `🎉 Redeem successful!\n\n💰 Reward: ${codeData["$"]}\n👤 User: ${username} \n\n${codeData.users.join("/")}`
    );

  } catch (err) {
    console.error(err);
    return ctx.reply("⚠️ Something went wrong. Try again later.");
  }
}

module.exports = handleRedeemCodes;
