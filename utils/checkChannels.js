
const TTL = 10 * 60 * 1000; // 15 minutes
const joinCache = new Map();
const channels = [
  "@fexh4b" /*,
  "@devflins",
  "@flinsbots"*/
];

let cleanerStarted = false;

// 🔍 Main function
async function isUserJoined(ctx, userId, force = false) {
  startCleaner();

  const now = Date.now();

  // ✅ skip cache if force = true
  if (!force) {
    const cached = joinCache.get(userId);
    if (cached && cached.expiry > now) {
      return cached.value;
    }
  }

  try {
    for (const ch of channels) {
      const member = await ctx.api.getChatMember(ch, userId);
      const status = member.status;

      if (status === "left" || status === "kicked") {
        // ❌ cache false
        joinCache.set(userId, {
          value: false,
          expiry: now + TTL
        });
        return false;
      }
    }

    // ✅ cache true
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

// 🔘 Keyboard (fresh check always)
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
        { text: "✅ I've Joined", callback_data: "check_my_join" }
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
