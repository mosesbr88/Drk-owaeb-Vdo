const { isAdmin } = require("./utils/permissions");
const sessions = new Map(); // userId => session

const GROUP_ID = -1003972898738; // yaha apna group id daalo

function generateOTP() {
  return Math.floor(10 + Math.random() * 90).toString(); // 2 digit
}

bot.on("message", async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  // ❌ Ignore non-admins
  if (!isAdmin(ctx)) return;

  // get session
  let session = sessions.get(userId) || {};

  // ========================
  // 🚀 START UPLOAD
  // ========================
  if (text && text.startsWith("$startUp")) {
    const args = text.split(" ")[1];

    const validArgs = [
      "c_rr_n",
      "ci_st_pi",
      "r.dot.p",
      "sisiTeve",
      "al_n.gr",
      "cht_rh",
      "anmul",
      "dewww",
    ];

    if (!args || !validArgs.includes(args)) {
      return ctx.reply(
        `❌ Invalid or missing args!\n\nSupported args:\n` +
        validArgs.map((v, i) => `${i + 1}. ${v}`).join("\n")
      );
    }

    // start session
    sessions.set(userId, {
      uploading: true,
      category: args,
      tempVideos: [],
    });

    return ctx.reply(`✅ Upload session started for: ${args}`);
  }

  // ========================
  // 🎥 HANDLE VIDEO UPLOAD
  // ========================
  if (session.uploading) {
    if (ctx.message.video) {
      try {
        const forwarded = await ctx.forwardMessage(GROUP_ID);

        const fileId = ctx.message.video.file_id;

        session.tempVideos.push(fileId);
        sessions.set(userId, session);

        return ctx.reply(`📥 Video added (${session.tempVideos.length})`);
      } catch (err) {
        console.log(err);
        return ctx.reply("❌ Failed to forward video");
      }
    }
  }

  // ========================
  // ✅ DONE UPLOAD
  // ========================
  if (text && text.startsWith("$doneUp")) {
    if (!session.uploading) return;

    const otp = generateOTP();
    session.doneOTP = otp;
    sessions.set(userId, session);

    return ctx.reply(`⚠️ Confirm upload\nType: $doneUp ${otp}`);
  }

  // confirm done
  if (text && text.startsWith("$doneUp ")) {
    const otp = text.split(" ")[1];

    if (!session.uploading || otp !== session.doneOTP) return;

    // 👉 SAVE TO PERMANENT DB (example)
    const data = {
      category: session.category,
      videos: session.tempVideos,
    };

    // db push logic yaha likho
    // await db.push("videos", data);

    sessions.delete(userId);

    return ctx.reply("✅ Upload completed & saved!");
  }

  // ========================
  // 🛑 STOP UPLOAD
  // ========================
  if (text && text === "$stopUp") {
    if (!session.uploading) return;

    const otp = generateOTP();
    session.stopOTP = otp;
    sessions.set(userId, session);

    return ctx.reply(`⚠️ Cancel upload?\nType: $stopUp ${otp}`);
  }

  // confirm stop
  if (text && text.startsWith("$stopUp ")) {
    const otp = text.split(" ")[1];

    if (!session.uploading || otp !== session.stopOTP) return;

    sessions.delete(userId);

    return ctx.reply("🛑 Upload session cancelled!");
  }
});
