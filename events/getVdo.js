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

    // ✅ set cooldown (reset warning)
    userCooldowns.set(userId, {
      lastUsed: now,
      warned: false
    });

    let userDetails = await db.get(`users.${userId}`);
    let user_ref = userDetails.total_ref;
    let user_bal = userDetails.$;
    // 🔒 referral check
    if (video.ref_req && user_ref < video.ref_req) {
      return ctx.reply(
        `🔒 Need ${video.ref_req} referral(s) to unlock this video! \n\nShare your referral Link to your friends: use /start to get your referral link..`
      );
    } else
      if(video.price && user_bal < video.price){
        return ctx.reply(
        `💰 Need ${video.pricd} Credits to get this video! \n\nYou have ${user_bal} credits in yout account.`
      );
      };



    // 🎬 send video
    return ctx.reply(`✅ // -$${video.price}`);
    // return ctx.replyWithVideo(video.file);
  }
};

setInterval(() => {
  const now = Date.now();

  for (const [userId, data] of userCooldowns) {
    if (now - data.lastUsed > coolDown) {
      userCooldowns.delete(userId);
    }
  }
}, 1000 * 60 * 5);
