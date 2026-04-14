const { isAdmin } = require("./utils/permissions");

const sessions = new Map(); // userId => session
const mediaGroups = new Map(); // media_group_id => { userId, videos: [], timeout }

const GROUP_ID = -1003972898738;

// ========================
// 🔐 GLOBAL CRASH HANDLER
// ========================
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

// ========================
// 🔢 OTP
// ========================
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit (better)
}

module.exports = (bot) => {
  bot.on("message", async (ctx) => {
    try {
      const userId = ctx.from.id;
      const text = ctx.message.text;

      // ❌ Ignore non-admins
      if (!isAdmin(ctx)) return;

      let session = sessions.get(userId) || {};

      // ========================
      // 🚀 START UPLOAD
      // ========================
      if (text && text.startsWith("$startUp")) {
        const args = text.split(" ")[1];

        const validArgs = [
          "c_r_n",
          "si_pi",
          "rdotp",
          "sisiTevi",
          "al0ngr",
          "cht_rh",
          "anmul",
          "dew",
        ];

        if (!args || !validArgs.includes(args)) {
          return ctx.reply(
            `❌ Invalid or missing args!\n\nSupported args:\n` +
              validArgs.map((v, i) => `${i + 1}. ${v}`).join("\n")
          );
        }

        sessions.set(userId, {
          uploading: true,
          category: args,
          tempVideos: [],
        });

        return ctx.reply(`✅ Upload session started for: ${args}`);
      }

      // ========================
      // 🎥 HANDLE VIDEO / ALBUM
      // ========================
      if (session.uploading && ctx.message.video) {
        const mediaGroupId = ctx.message.media_group_id;

        // ========================
        // 📦 ALBUM CASE
        // ========================
        if (mediaGroupId) {
          if (!mediaGroups.has(mediaGroupId)) {
            mediaGroups.set(mediaGroupId, {
              userId,
              videos: [],
            });

            // wait to collect all album items
            setTimeout(async () => {
              try {
                const group = mediaGroups.get(mediaGroupId);
                if (!group) return;

                let savedCount = 0;

                for (const msg of group.videos) {
                  const forwarded = await bot.telegram.forwardMessage(
                    GROUP_ID,
                    msg.chat.id,
                    msg.message_id
                  );

                  const fileId = forwarded.video.file_id;

                  session.tempVideos.push(fileId);
                  savedCount++;
                }

                sessions.set(userId, session);
                mediaGroups.delete(mediaGroupId);

                await ctx.reply(
                  `📦 Album added (${savedCount} videos)`
                );
              } catch (err) {
                console.error("Album Error:", err);
                mediaGroups.delete(mediaGroupId);
              }
            }, 1500); // wait for all messages
          }

          // push message into album
          mediaGroups.get(mediaGroupId).videos.push(ctx.message);
          return;
        }

        // ========================
        // 🎬 SINGLE VIDEO
        // ========================
        try {
          const forwarded = await ctx.forwardMessage(GROUP_ID);

          const fileId = forwarded.message.video.file_id;

          session.tempVideos.push(fileId);
          sessions.set(userId, session);

          return ctx.reply(
            `📥 Video added (${session.tempVideos.length})`
          );
        } catch (err) {
          console.error(err);
          return ctx.reply("❌ Failed to forward video");
        }
      }

      // ========================
      // ✅ DONE UPLOAD
      // ========================
      if (text === "$doneUp") {
        if (!session.uploading) return;

        const otp = generateOTP();
        session.doneOTP = otp;
        sessions.set(userId, session);

        return ctx.reply(`⚠️ Confirm upload\nType: $doneUp ${otp}`);
      }

      if (text && text.startsWith("$doneUp ")) {
        const otp = text.split(" ")[1];

        if (!session.uploading || otp !== session.doneOTP) return;

        const data = {
          category: session.category,
          videos: session.tempVideos,
        };

        // 👉 SAVE TO DB HERE
        // await db.push("videos", data);

        sessions.delete(userId);

        return ctx.reply("✅ Upload completed & saved!");
      }

      // ========================
      // 🛑 STOP UPLOAD
      // ========================
      if (text === "$stopUp") {
        if (!session.uploading) return;

        const otp = generateOTP();
        session.stopOTP = otp;
        sessions.set(userId, session);

        return ctx.reply(`⚠️ Cancel upload?\nType: $stopUp ${otp}`);
      }

      if (text && text.startsWith("$stopUp ")) {
        const otp = text.split(" ")[1];

        if (!session.uploading || otp !== session.stopOTP) return;

        sessions.delete(userId);

        return ctx.reply("🛑 Upload session cancelled!");
      }
    } catch (err) {
      console.error("❌ Handler Error:", err);
      try {
        ctx.reply("❌ Something went wrong, try again.");
      } catch {}
    }
  });
};
