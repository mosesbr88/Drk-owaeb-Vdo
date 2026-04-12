let vdoConfig = require("../../vdoConfig");

const vdoMap = Object.fromEntries(
  vdoConfig.map(v => [v.name, v])
);

module.exports = {
  event: "message:text",

  execute(bot, ctx) {
    console.log("Message:", ctx.message.text);
  }
};
