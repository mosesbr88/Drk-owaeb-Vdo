function buildWelcomeMessage(user, bonus, refText, refCode, botUsername) {
  const link = `https://t.me/${botUsername}?start=${refCode}`;

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

function buildStartMessage(arg){
  let user = arg.user || null
    , credit = arg.credit || 0
    , totalRefferals = arg.totalRefferals || 0
    , refCode = arg.refCode || "/\\"
    , botUsername = arg.botUsername || null;
  const link = `https://t.me/${botUsername}?start=${refCode}`;

  return {
    text: `
<b>✨ Welcome Back ${user}!</b>

🪙 <b>Balance:</b> $${credit} 

👥 <b>Total Referrals:</b> ${totalRefferals}

<blockquote>
🔗 <b>Your Referral Link</b>
${link}

🎟️ <b>Your Referral Code:</b> <code>${refCode}</code>
</blockquote>

💡 <i>Invite friends & earn more rewards!</i>
❓ Use /help to explore all commands
🎬 Use /videos to open category panel
`,
    link,
  };
}

function newUserLogTemplate({
  username = "N/A",
  id = 0000,
  referrerId = "None",
  refCode = "N/A",
  refCount = 0,
  userRefCode = "N/A",
  joinDate,
  bonus = 0
}) {
  return `
<b>🧤 NEW USER JOINED</b>

<pre>
👤 Username   : ${username}
🆔 ID         : ${id}

🤝 Referred By: ${referrerId}
   ↳ Code     : ${refCode} (${refCount})

🔑 Ref Code   : ${userRefCode}
📅 Joined At  : ${joinDate}

🪙 Bonus      : +${bonus}
</pre>
`;
}

// usage
/*ctx.reply(
  newUserTemplateHTML({
    username: ctx.from.username ? "@" + ctx.from.username : "N/A",
    id: ctx.from.id,
    referrerId: referrer?.id || "None",
    refCode: referrer?.code || "N/A",
    refCount: referrer?.count || 0,
    userRefCode: user.code,
    joinDate: new Date().toLocaleDateString(),
    bonus: 100
  }),
  { parse_mode: "HTML" }
);*/

module.exports = { buildWelcomeMessage, buildStartMessage, newUserLogTemplate };

/**
✨ Welcome back @user!

🎁 Credit: $100

🔗 Your Referral Link <your referral link>

🎟️ Your Referral Code: <your referral code>

💡 Invite friends & earn more rewards!
❓ Use /help to explore all commands
🎬 Use /videos to open category panel

*/
