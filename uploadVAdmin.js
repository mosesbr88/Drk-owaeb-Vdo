const { isAdmin } = require("./utils/permissions");

const sessions = new Map();
const mediaGroups = new Map();

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
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ========================
// 🎯 FILE ID EXTRACTOR
// ========================
function getFileIdFromForward(forwarded) {
  if (!forwarded) return null;

  if (forwarded.video) return forwarded.video.file_id;

  if (forwarded.message && forwarded.message.video)
    return forwarded.message.video.file_id;

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
            `❌ Invalid args!\n\n` +
              validArgs.map((v, i) => `${i + 1}. ${v}`).join("\n")
          );
        }

        sessions.set(userId, {
          uploading: true,
          category: args,
          tempVideos: [],
        });

        return ctx.reply(`✅ Upload started: ${args}`);
      }

      // ========================
      // 🎥 HANDLE MEDIA
      // ========================
      if (
        session.uploading &&
        (ctx.message.video || ctx.message.photo || ctx.message.document)
      ) {
        const mediaGroupId = ctx.message.media_group_id;

        // ========================
        // 📦 ALBUM
        // ========================
        if (mediaGroupId) {
          if (!mediaGroups.has(mediaGroupId)) {
            mediaGroups.set(mediaGroupId, {
              userId,
              videos: [],
            });

            setTimeout(async () => {
              const group = mediaGroups.get(mediaGroupId);
              if (!group) return;

              let saved = 0;
              let skipped = 0;

              for (const msg of group.videos) {
                try {
                  const forwarded = await bot.telegram.forwardMessage(
                    GROUP_ID,
                    msg.chat.id,
                    msg.message_id
                  );

                  const fileId = getFileIdFromForward(forwarded);

                  if (!fileId) {
                    skipped++;
                    continue;
                  }

                  const userSession = sessions.get(group.userId);
                  if (!userSession) continue;

                  userSession.tempVideos.push(fileId);
                  sessions.set(group.userId, userSession);

                  saved++;
                } catch (err) {
                  console.error("Album item error:", err);
                }
              }

              mediaGroups.delete(mediaGroupId);

              await bot.telegram.sendMessage(
                group.userId,
                `📦 Album added (${saved} videos)\n⚠️ Skipped: ${skipped}`
              );
            }, 1500);
          }

          mediaGroups.get(mediaGroupId).videos.push(ctx.message);
          return;
        }

        // ========================
        // 🎬 SINGLE MEDIA
        // ========================
        try {
          const forwarded = await ctx.forwardMessage(GROUP_ID);

          const fileId = getFileIdFromForward(forwarded);

          if (!fileId) {
            return ctx.reply("⚠️ Not a valid video (skipped)");
          }

          session.tempVideos.push(fileId);
          sessions.set(userId, session);

          return ctx.reply(
            `📥 Video added (${session.tempVideos.length})`
          );
        } catch (err) {
          console.error("Forward error:", err);

          return ctx.reply("❌ Failed to process media");
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

        return ctx.reply(`⚠️ Confirm\nType: $doneUp ${otp}`);
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

        // ✅ SEND JSON BACK
        await ctx.reply("✅ Upload saved!\n\n📦 Data:");
        await ctx.reply(
          "```json\n" + JSON.stringify(data, null, 2) + "\n```",
          { parse_mode: "Markdown" }
        );

        return;
      }

      // ========================
      // 🛑 STOP
      // ========================
      if (text === "$stopUp") {
        if (!session.uploading) return;

        const otp = generateOTP();
        session.stopOTP = otp;
        sessions.set(userId, session);

        return ctx.reply(`⚠️ Cancel?\nType: $stopUp ${otp}`);
      }

      if (text && text.startsWith("$stopUp ")) {
        const otp = text.split(" ")[1];

        if (!session.uploading || otp !== session.stopOTP) return;

        sessions.delete(userId);

        return ctx.reply("🛑 Upload cancelled");
      }
    } catch (err) {
      console.error("❌ Handler Error:", err);
      try {
        await ctx.reply("❌ Something went wrong");
      } catch {}
    }
  });
};
