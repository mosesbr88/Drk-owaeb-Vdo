/*module.exports = (bot) => {
  const loggingGroup = -1003935136005;

  return {
    log: async (...args) => {
      try {
        // convert all args to string
        const message = args
          .map((a) =>
            typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
          )
          .join(" ");

        // send to telegram group
        await bot.api.sendMessage(loggingGroup, `📌 ${message}`);
      } catch (err) {
        console.error("TG Logger Error:", err);
      }
    },
  };
};
*/

module.exports = (bot) => {
  const loggingGroup = -1003935136005;

  return {
    log: async (...args) => {
      try {
        let text = "";
        let extra = {};

        // if last arg is object → treat as options
        if (typeof args[args.length - 1] === "object") {
          extra = args.pop();
        }

        // build message from remaining args
        text = args
          .map((a) =>
            typeof a === "object"
              ? JSON.stringify(a, null, 2)
              : String(a)
          )
          .join(" ");

        await bot.api.sendMessage(loggingGroup, text, extra);

      } catch (err) {
        console.error("TG Logger Error:", err);
      }
    },
  };
};
