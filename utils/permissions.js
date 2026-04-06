const { owners, admins } = require("../config");

function isOwner(ctx) {
  return owners.includes(ctx.from.id);
}

function isAdmin(ctx) {
  const id = ctx.from.id;

  if (owners.includes(id)) return true;
  if (admins.includes(id)) return true;

  return false;
}

module.exports = { isOwner, isAdmin };
