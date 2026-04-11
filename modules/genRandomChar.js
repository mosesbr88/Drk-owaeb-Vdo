const crypto = require("crypto"),
CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateReferralToken(length = 10) { let result = ""; while (result.length < length) { const byte = crypto.randomBytes(1)[0]; if (byte < 62 * 4) { result += CHARS[byte % 62]; }}; return result;}
