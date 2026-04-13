let vdoConfig = require("../vdoConfig");

let coolDown = 5000; // 5 seconds

const vdoMap = Object.fromEntries(
  vdoConfig.map(v => [v.name, v])
);

// 🧠 store user cooldown data
const userCooldowns = new Map();

module.exports = {
  event: "message:text",

  async execute(bot, ctx) {
    const text = ctx.message.text;
    const video = vdoMap[text];
    if (!video) return;

    const userId = ctx.from.id;
    const now = Date.now();

    // ⏱️ cooldown check
    if (userCooldowns.has(userId)) {
      const data = userCooldowns.get(userId);
      const timePassed = now - data.lastUsed;

      if (timePassed < coolDown) {
        // 👉 first time: send warning
        if (!data.warned) {
          data.warned = true;
          userCooldowns.set(userId, data);

          return ctx.reply(
            `⏳ Please wait ${Math.ceil((coolDown - timePassed) / 1000)}s`
          );
        }

        // 👉 second+ time: ignore completely
        return;
      }
    }

    // 👉 user referral count (example)
    const userReferrals = 0;

    // 🔒 referral check
    if (video.ref_req && userReferrals < video.ref_req) {
      return ctx.reply(
        `🔒 Need ${video.ref_req} referral(s) to unlock this video`
      );
    }

    // ✅ set cooldown (reset warning)
    userCooldowns.set(userId, {
      lastUsed: now,
      warned: false
    });

    // 🎬 send video
    return ctx.reply(`✅`);
    // return ctx.replyWithVideo(video.file);
  }
};
