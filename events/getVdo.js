const text = `
<b>🎬 Unlock This Video</b>

💰 <b>Required Credits:</b> <code>Not Available</code>
👤 <b>Your Credits:</b> <code>0</code>

━━━━━━━━━━━━━━━

🚨 <b>Rewards Pending!</b>

• 📅 You haven’t claimed your <b>Daily Reward</b>
   ➤ Use: <code>/daily</code>

• 🗓️ You haven’t claimed your <b>Weekly Reward</b>
   ➤ Use: <code>/weekly</code>

━━━━━━━━━━━━━━━

💡 <i>Earn credits & unlock more videos!</i>
`;

ctx.reply(text, {
  parse_mode: "HTML"
});

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
        `
<b>🎬 Unlock This Video Category</b>

💰 <b>Required Credits:</b> <code>${video.price}</code>
👤 <b>Your Credits:</b> <code>${user_bal}</code>
${if (userDetails
━━━━━━━━━━━━━━━

🚨 <b>Rewards Pending!</b>

• 📅 You haven’t claimed your <b>Daily Reward</b>
   ➤ Use: <code>/daily</code>

• 🗓️ You haven’t claimed your <b>Weekly Reward</b>
   ➤ Use: <code>/weekly</code>

━━━━━━━━━━━━━━━

💡 <i>Earn credits & unlock more videos!</i>
`, 
          {parse_mode: "HTML"});
      };
    //subtract balance
    db.subtract(`users.${userId}.$`, video.price);

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
