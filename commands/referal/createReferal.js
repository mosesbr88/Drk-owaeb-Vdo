function randomString(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// example: aB3xY9
module.exports = {
  name: "createreferal",
  async execute(ctx, args, bot) {
    let code = randomString(); 
    RFCode[`${code}`] = {
      ttl: (Date.now() + (1000 * 60 )),
      createdBy: ctx.from.id
    };
    ctx.reply(`Code created: ${code}, Created By: @${ctx.from.username} \n\nLink: https://t.me/${bot.userName}?start=${code}`);
    tgLogger.log(`New Code created: ${code}, Created By: @${ctx.from.username} \n\nLink: https://t.me/${bot.userName}?start=${code}`);
  
    const userId = ctx.from.id;
    const user = await bot.api.getChat(userId);
    console.log(user);
  }
};
