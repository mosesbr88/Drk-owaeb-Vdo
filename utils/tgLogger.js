module.exports = (bot) => {
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
