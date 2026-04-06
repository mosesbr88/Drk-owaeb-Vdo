require("./express");
const { Bot } = require("grammy");
global.db = require("./DB/final.mongodb.js");
const execState = new Map();

let RFCode = {};
global.RFCode = RFCode;

const { token } = require("./config");

const bot = new Bot(token);

// middlewares
bot.use(require("./middlewares/logger"));
bot.use(require("./middlewares/session"));

// handlers
require("./handlers/commandHandler")(bot);
require("./handlers/buttonHandler")(bot);
require("./handlers/eventHandler")(bot);
require("./handlers/slashHandler")(bot);

// bot.start();

// capture console.log
function runCode(code) {
  let logs = [];

  const fakeConsole = {
    log: (...args) => {
      logs.push(args.map(a => String(a)).join(" "));
    }
  };

  try {
    const fn = new Function("console", `
      try {
        ${code}
      } catch (e) {
        throw e;
      }
    `);

    const result = fn(fakeConsole);

    return {
      output: logs.join("\n") || "✅ Executed",
      result
    };

  } catch (err) {
    return {
      error: err.stack || err.message
    };
  }
}

// start eval mode
bot.hears(".eval", (ctx) => {
  if (!isOwner(ctx)) return ctx.reply("❌ Not allowed");

  execState.set(ctx.from.id, true);
  return ctx.reply("🟢 Eval mode ON\nSend code...\nType `.exit` to stop");
});

// exit eval mode
bot.hears(".exit", (ctx) => {
  if (!isOwner(ctx)) return;

  execState.delete(ctx.from.id);
  return ctx.reply("🔴 Eval mode OFF");
});

// main handler
bot.on("message:text", async (ctx) => {
  if (!isOwner(ctx)) return;

  if (!execState.get(ctx.from.id)) return;

  const text = ctx.message.text;

  // ignore commands
  if (text === ".eval" || text === ".exit") return;

  const res = runCode(text);

  if (res.error) {
    return ctx.reply(`❌ Error:\n\`\`\`\n${res.error}\n\`\`\``, {
      parse_mode: "Markdown"
    });
  }

  let reply = "";

  if (res.output) reply += `📤 Output:\n\`\`\`\n${res.output}\n\`\`\`\n`;

  if (res.result !== undefined) {
    reply += `📦 Result: \`${String(res.result)}\``;
  }

  if (!reply) reply = "✅ Done";

  return ctx.reply(reply, {
    parse_mode: "Markdown"
  });
});

console.log("🚀 Bot running...");
bot.start({
  onStart: async (botInfo) => {
    console.log(`🤖|Logged in as @${botInfo.username} |✅`);
  }
});
