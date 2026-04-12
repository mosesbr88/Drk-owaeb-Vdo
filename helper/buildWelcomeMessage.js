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
    , refText = arg.refText || "*"
    , refCode = arg.refCode || "/\\"
    , botUsername = arg.botUsername || null;
  const link = `https://t.me/${botUsername}?start=${refCode}`;

  return {
    text: `
<b>✨ Welcome Back ${user}!</b>

🪙 <b>Balance:</b> $${credit} 

${refText}

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

module.exports = { buildWelcomeMessage, buildStartMessage };

/**
✨ Welcome back @user!

🎁 Credit: $100

🔗 Your Referral Link <your referral link>

🎟️ Your Referral Code: <your referral code>

💡 Invite friends & earn more rewards!
❓ Use /help to explore all commands
🎬 Use /videos to open category panel

*/
