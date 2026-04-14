const { isAdmin } = require("./utils/permissions");

const sessions = new Map();

const GROUP_ID = -1003972898738;

// ========================
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// ========================
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getFileId(msg) {
  if (!msg) return null;
  if (msg.video) return msg.video.file_id;
  return null;
}

module.exports = (bot) => {
  bot.on("message", async (ctx) => {
    try {
      const userId = ctx.from.id;
      const text = ctx.message.text;

      if (!isAdmin(ctx)) return;

      let session = sessions.get(userId) || {};

      // ========================
      // 🚀 START
      // ========================
      if (text?.startsWith("$startUp")) {
        const args = text.split(" ")[1];

        const validArgs = [
          "c_r_n","si_pi","rdotp","sisiTevi",
          "al0ngr","cht_rh","anmul","dew"
        ];

        if (!validArgs.includes(args)) {
          return ctx.reply("❌ Invalid args");
        }

        sessions.set(userId, {
          uploading: true,
          category: args,
          tempVideos: [],
        });

        return ctx.reply(`✅ Upload started: ${args}`);
      }

      // ========================
      // 🎥 HANDLE MEDIA (NO TIMEOUT)
      // ========================
      if (session.uploading && ctx.message.video) {
        try {
          // direct forward
          const forwarded = await ctx.forwardMessage(GROUP_ID);

          const fileId =
            forwarded.video?.file_id ||
            forwarded.message?.video?.file_id;

          if (!fileId) {
            return ctx.reply("⚠️ Skipped (not video)");
          }

          session.tempVideos.push(fileId);
          sessions.set(userId, session);

          return ctx.reply(
            `📥 Added (${session.tempVideos.length})`
          );
        } catch (err) {
          console.error("Forward error:", err);
          return ctx.reply("❌ Forward failed");
        }
      }

      // ========================
      // ✅ DONE
      // ========================
      if (text === "$doneUp") {
        if (!session.uploading) return;

        const otp = generateOTP();
        session.doneOTP = otp;
        sessions.set(userId, session);

        return ctx.reply(`⚠️ Confirm: $doneUp ${otp}`);
      }

      if (text?.startsWith("$doneUp ")) {
        const otp = text.split(" ")[1];

        if (!session.uploading || otp !== session.doneOTP) return;

        const data = {
          category: session.category,
          videos: session.tempVideos,
        };

        sessions.delete(userId);

        await ctx.reply("✅ Saved!");
        await ctx.reply(
          "```json\n" + JSON.stringify(data, null, 2) + "\n```",
          { parse_mode: "Markdown" }
        );
      }

      // ========================
      // 🛑 STOP
      // ========================
      if (text === "$stopUp") {
        if (!session.uploading) return;

        const otp = generateOTP();
        session.stopOTP = otp;
        sessions.set(userId, session);

        return ctx.reply(`⚠️ Cancel: $stopUp ${otp}`);
      }

      if (text?.startsWith("$stopUp ")) {
        const otp = text.split(" ")[1];

        if (!session.uploading || otp !== session.stopOTP) return;

        sessions.delete(userId);
        return ctx.reply("🛑 Cancelled");
      }

    } catch (err) {
      console.error("Handler Error:", err);
      try { await ctx.reply("❌ Error"); } catch {}
    }
  });
};
