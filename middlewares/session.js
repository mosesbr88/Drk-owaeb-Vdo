const { session } = require("grammy");

module.exports = session({
  initial: () => ({
    lastCmd: 0,
    warned: false
  })
});


/*
bot.use(session({
  initial: () => ({
    lastCmd: 0,
    warned: false
  })
}));
*/
