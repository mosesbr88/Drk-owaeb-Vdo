module.exports = {
  name: "start",
  description: "Start bot",

  async execute(ctx, args, bot) {
    if(await db.get(`users.${ctx.from.id}`)){
      ctx.reply("💐 Welcome Back!");
      let deta = await db.get(`users.${ctx.from.id}`);
      // ctx.reply(JSON.stringify(deta));
      ctx.reply(`<pre>${JSON.stringify(deta, null, 2)}</pre>`, {
  parse_mode: "HTML"
});
      return;
    }
    if(!args || args.length < 1){
      ctx.reply("👋 Welcome!");
      await db.set(`users.${ctx.from.id}`, {
          $: 100,
          joined_at: Date.now(),
          ref_code: null,
          total_ref: 0
      });
      tgLogger.log(`New user joined: ${ctx.from.id}`);
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
      await db.set(`users.${ctx.from.id}`, {
          $: 100,
          joined_at: Date.now(),
          ref_by: args[0],
          ref_code: null,
          total_ref: 0
      });
      ctx.reply(`👋 Welcome!, Referred By: @${RFUser.username}`);
      tgLogger.log(`New user joined: ${ctx.from.id}, Reffered By: @${RFUser.username} / ${args[0]}`);
      await bot.api.sendMessage(RFCode[args[0]].createdBy, `User @${ctx.from.id} joined using your referral Code. Now you have {referal_count} referral`);
      await db.add(`users.${RFCode[args[0]].createdBy}.total_ref`, 1);
    };
  }
};
