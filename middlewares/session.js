const { session } = require("grammy");

module.exports = session({
  initial: () => ({
    count: 0
  })
});
