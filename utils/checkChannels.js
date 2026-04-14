const TTL = 15 * 60 * 1000; // 15 minutes
const joinCache = new Map();

// Replace with your channels (must be public or bot must be admin)
const channels = [
  "@channelA",
  "@channelB",
  "@channelC"
];

async function isUserJoined(ctx, userId) {
  try {
    for (const ch of channels) {
      const member = await ctx.api.getChatMember(ch, userId);

      const status = member.status;
      if (status === "left" || status === "kicked") {
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error("Join check error:", err);
    return false;
  }
}

function getJoinKeyboard() {
  return {
    inline_keyboard: [
      ...channels.map(ch => ([
        { text: `Join ${ch}`, url: `https://t.me/${ch.replace("@", "")}` }
      ])),
      [
        { text: "✅ I've Joined", callback_data: "check_join" }
      ]
    ]
  };
}

module.export = isUserJoined;

/*module.exports = (bot) => {

  // 🔁 Middleware for every message
  bot.use(async (ctx, next) => {
    if (!ctx.from) return next();

    const userId = ctx.from.id;

    // ✅ Check cache
    const cached = joinCache.get(userId);
    if (cached && cached > Date.now()) {
      return next();
    }

    const joined = await isUserJoined(ctx, userId);

    if (joined) {
      // store in cache
      joinCache.set(userId, Date.now() + TTL);
      return next();
    }

    // ❌ Not joined → send message
    await ctx.reply(
      `<b>⚠️ Access Restricted</b>\n\n` +
      `You must join all the required channels to use this bot.\n\n` +
      `After joining, click the button below.`,
      {
        parse_mode: "HTML",
        reply_markup: getJoinKeyboard()
      }
    );
  });

  // 🔘 Button handler
  bot.callbackQuery("check_join", async (ctx) => {
    const userId = ctx.from.id;

    const joined = await isUserJoined(ctx, userId);

    if (!joined) {
      return ctx.answerCallbackQuery({
        text: "❌ You haven't joined all channels yet!",
        show_alert: true
      });
    }

    // ✅ success → cache + delete message
    joinCache.set(userId, Date.now() + TTL);

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    await ctx.answerCallbackQuery({
      text: "✅ Verified!"
    });

    await ctx.reply(
      `<b>🎉 Success!</b>\n\nYou can now use the bot.`,
      { parse_mode: "HTML" }
    );
  });

  // 🧹 Auto cleanup expired cache (optional but good)
  setInterval(() => {
    const now = Date.now();
    for (const [userId, expiry] of joinCache.entries()) {
      if (expiry < now) {
        joinCache.delete(userId);
      }
    }
  }, 5 * 60 * 1000); // every 5 min
};*/
