const generateRandomToken = require("../../modules/generateRandomToken.js");
function getJoinDate() {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date());
}

function newUserTemplateHTML({
  username = "N/A",
  id,
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

module.exports = {
  name: "start",
  description: "Start bot",

  async execute(ctx, args, bot) {
    if(await db.get(`users.${ctx.from.id}`)){
      if(args.length > 0){
        return ctx.reply("❌ | You are already registered, so you can't use a referral code.");
      }
      ctx.reply("💐 Welcome Back!");
      let deta = await db.get(`users.${ctx.from.id}`);
      ctx.reply(`<pre>${JSON.stringify(deta, null, 2)}</pre>`, {
  parse_mode: "HTML"
});
      return;
    }
    if(args.length < 1){
      let newRefCode = generateRandomToken();
      ctx.reply(`👋 Welcome! @${ctx.from.username} \nYou Got 20 credit as a welcome bonus 🤗 \nYour referal code: ${newRefCode} // https://t.me/${bot.userName}?start=${newRefCode}`);
      await db.set(`users.${ctx.from.id}`, {
          $: 20,
          joined_at: Date.now(),
          ref_code: newRefCode,
          total_ref: 0
      });
      await db.set(`refCodes.${newRefCode}.cId`, ctx.from.id);
      
      tgLogger.log(`🤝 | New user joined: ${ctx.from.id} / @${ctx.from.username} \nReffered By: None \nCredit: +20`);
    } else {
      if(!RFCode[args[0]]){
        return ctx.reply(`❌| Invalid or expired Referral Code Provided..`);
      }else if(!RFCode[args[0]].ttl || isNaN(RFCode[args[0]].ttl) || RFCode[args[0]].ttl < Date.now()){
        return ctx.reply("⌛| Your Referal Code is expired. please create new one");
      } /*else if(RFCode[args[0]].createdBy === ctx.from.id){
        return ctx.reply("👾 | You cannot use your own Referral Code. Sent it to your friends!");
      }*/
      const RFUser = await bot.api.getChat(RFCode[args[0]].createdBy);
      if(!RFUser){ return ctx.reply("⚠️ | Referal creator is not a valid user"); }
      let newRefCode = generateRandomToken();
      
      await db.set(`users.${ctx.from.id}`, {
          $: 100,
          joined_at: Date.now(),
          ref_by: args[0],
          ref_code: newRefCode,
          total_ref: 0
      });
      await db.set(`refCodes.${newRefCode}.cId`, ctx.from.id);
      
      let refUserId = RFCode[args[0]].createdBy;
      
      ctx.reply(`👋 Welcome, ${ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name} !
🎁 You received 100 credits for using ${RFUser.username ? "@" + RFUser.username : RFUser.first_name}'s referral code. \nYour Referral Code: ${newRefCode} // https://t.me/${bot.userName}?start=${newRefCode}`);
                              
      tgLogger.log(`New user joined: ${ctx.from.id} : @${ctx.from.username} \nReffered By: @${RFUser.username} : ${RFCode[args[0]].createdBy} / ${args[0]} \nCredit: +100`);
     //+"(
      tgLogger.log(
  newUserTemplateHTML({
    username: ctx.from.username ? "@" + ctx.from.username : ctx.from.first_name,
    id: ctx.from.id ,
    referrerId: RFCode[args[0]].createdBy,
    refCode: args[0],
    refCount: 0,
    userRefCode: newRefCode,
    joinDate: getJoinDate(),
    bonus: 100
  }),
  { parse_mode: "HTML" }
);
      
      await db.add(`users.${RFCode[args[0]].createdBy}.total_ref`, 1);
      let totalRef = await db.get(`users.${refUserId}.total_ref`);
      let userName = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
      
      //await bot.api.sendMessage(RFCode[args[0]].createdBy, `User @${ctx.from.id} joined using your referral Code. Now you have ${await db.get('users.${RFCode[args[0]}.total_ref')} referrals \nYou got +50 Credit as Bonus 🪙`);
      await bot.api.sendMessage(refUserId, `🎉 ${userName} joined using your referral code!
👥 Total referrals: ${totalRef}
🪙 You received +50 credits as a bonus!`);
      await db.add(`users.${RFCode[args[0]].createdBy}.$`, 50);
   
    };
  }
};
