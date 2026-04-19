function handleRedeemCodes(bot, ctx, rawRedeemCode, userDetails){
let {userId, username} = userDetails;
  let redeemCode = rawRedeemCode.replace("RC_");
  
  ctx.reply(`${redeemCode} \n ${userId} \n ${username}`);
};

module.export = handleRedeemCodes;
