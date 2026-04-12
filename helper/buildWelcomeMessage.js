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
