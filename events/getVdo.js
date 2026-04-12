let vdoConfig = require("../vdoConfig");

const vdoMap = Object.fromEntries(
  vdoConfig.map(v => [v.name, v])
);

module.exports = {
  event: "message:text",

  async execute(bot, ctx) {
    const text = ctx.message.text
    , video = videoMap[text];
    if (!video) return;

    // 👉 user referral count (example)
    const userReferrals = 0;

    // 🔒 referral check
    if (video.ref_req && userReferrals < video.ref_req) {
      return ctx.reply(
        `🔒 Need ${video.ref_req} referral(s) to unlock this video`
      );
    }

    // ✅ send video
    return ctx.reply(
        `✅`
      );
    //return ctx.replyWithVideo(video.file);
  }
};
