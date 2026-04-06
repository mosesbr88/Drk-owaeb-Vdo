module.exports = {
  name: "start",
  description: "Start bot",

  async execute(ctx, args, bot) {
    if(!args || args.length < 1){
      ctx.reply("👋 Welcome!");
    } else {
      if(!RFCode[args[0]]){
        return ctx.reply(`❌| Invalid or expired Referral Code Provided..`);
      }else if(!RFCode[args[0]].ttl || isNaN(RFCode[args[0]].ttl) || RFCode[args[0]].ttl < Date.now()){
        return ctx.reply("⌛| Your Referal Code is expired. please create new one");
      }else if(RFCode[args[0]].createdBy === ctx.from.id){
        return ctx.reply("👾 | You cannot use your own Referral Code. Sent it to your friends!");
      }
      const RFUser = await bot.api.getChat(RFCode[args[0]].createdBy);
      if(!RFUser){ return ctx.reply("⚠️ | Referal creator is not a valid user"); }
      
      ctx.reply(`👋 Welcome!, Referred By: @${RFUser.username}`);
    };
  }
};
