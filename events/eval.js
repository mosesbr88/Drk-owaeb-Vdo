async function runCode(code) {
  let logs = [];

  const fakeConsole = {
    log: (...args) => {
      logs.push(args.map(a => String(a)).join(" "));
    }
  };

  try {
    const fn = new Function("console", `
      return (async () => {
        try {
          ${code}
        } catch (e) {
          throw e;
        }
      })();
    `);

    const result = await fn(fakeConsole);

    // 🟢 small delay so pending logs (microtasks/macrotasks) complete
    await new Promise(res => setTimeout(res, 0));

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

module.exports = {
  event: "message:text",

  async execute(ctx) {
    
  if (!execState.get(ctx.from.id)) return;

  const text = ctx.message.text;

  // ignore commands
  if (text.startsWith("/") || text === ".exit") return;

  const res = await runCode(text);

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
  }
};
