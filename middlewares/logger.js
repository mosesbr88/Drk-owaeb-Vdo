module.exports = async (ctx, next) => {
  // ❌ ignore if no user (channel posts etc.)
  if (!ctx.from) return next();

  // ❌ ignore bots
  if (ctx.from.is_bot) return next();

  console.log(`📩 ${ctx.from.id}:`, ctx.update);

  await next();
};
