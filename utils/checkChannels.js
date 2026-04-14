const TTL = 15 * 60 * 1000; // 15 minutes
const joinCache = new Map();

const channels = [
  "@fexh4b"
];

let cleanerStarted = false;

// 🔍 Main function → returns ONLY true/false
async function isUserJoined(ctx, userId) {
  startCleaner();

  const now = Date.now();

  // ✅ cache check
  const cached = joinCache.get(userId);
  if (cached && cached.expiry > now) {
    return cached.value; // true / false
  }

  try {
    for (const ch of channels) {
      const member = await ctx.api.getChatMember(ch, userId);
      const status = member.status;

      if (status === "left" || status === "kicked") {
        // ❌ not joined → cache false
        joinCache.set(userId, {
          value: false,
          expiry: now + TTL
        });
        return false;
      }
    }

    // ✅ all joined
    joinCache.set(userId, {
      value: true,
      expiry: now + TTL
    });

    return true;

  } catch (err) {
    console.error("Join check error:", err);
    return false;
  }
}

// 🔘 Get only NOT joined channels (no cache intentionally)
isUserJoined.getJoinKeyboard = async function (ctx, userId) {
  let notJoined = [];

  for (const ch of channels) {
    try {
      const member = await ctx.api.getChatMember(ch, userId);
      const status = member.status;

      if (status === "left" || status === "kicked") {
        notJoined.push(ch);
      }
    } catch {
      notJoined.push(ch);
    }
  }

  return {
    inline_keyboard: [
      ...notJoined.map(ch => ([
        {
          text: `Join ${ch}`,
          url: `https://t.me/${ch.replace("@", "")}`
        }
      ])),
      [
        { text: "✅ I've Joined", callback_data: "check_join" }
      ]
    ]
  };
};

// 🧹 cleaner (auto once)
function startCleaner() {
  if (cleanerStarted) return;
  cleanerStarted = true;

  setInterval(() => {
    const now = Date.now();

    for (const [userId, data] of joinCache.entries()) {
      if (data.expiry < now) {
        joinCache.delete(userId);
      }
    }
  }, 5 * 60 * 1000);
}

module.exports = isUserJoined;

      
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
