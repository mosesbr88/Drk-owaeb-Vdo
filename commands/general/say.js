module.exports = {
  name: "say",
  execute(ctx, args, bot) {
    if(!args || args.length < 1){
      return ctx.reply("Say something to echo");
    }
    let textToSay = args.join(" ");
    ctx.reply(`${textToSay}`);
  }
};
