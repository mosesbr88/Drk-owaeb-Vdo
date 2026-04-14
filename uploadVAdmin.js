const { isAdmin } = require("./utils/permissions");

const sessions = new Map();
const mediaGroups = new Map();

const GROUP_ID = -1003972898738;

// ========================
// 🔐 CRASH HANDLER
// ========================
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// ========================
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getFileIdFromForward(forwarded) {
  if (!forwarded) return null;
  if (forwarded.video) return forwarded.video.file_id;
  if (forwarded.message?.video) return forwarded.message.video.file_id;
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
      // 🎥 HANDLE MEDIA (FIXED)
      // ========================
      if (
        session.uploading &&
        (ctx.message.video || ctx.message.photo || ctx.message.document)
      ) {
        const mediaGroupId = ctx.message.media_group_id;

        // ========================
        // 📦 ALBUM FIXED
        // ========================
        if (mediaGroupId) {
          let group = mediaGroups.get(mediaGroupId);

          if (!group) {
            group = {
              userId,
              messages: [],
              timer: null,
            };
            mediaGroups.set(mediaGroupId, group);
          }

          group.messages.push(ctx.message);

          // 🔥 RESET TIMER EVERY TIME
          if (group.timer) clearTimeout(group.timer);

          group.timer = setTimeout(async () => {
            try {
              let saved = 0;
              let skipped = 0;

              for (const msg of group.messages) {
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
                } catch (e) {
                  console.error("Album item error:", e);
                }
              }

              mediaGroups.delete(mediaGroupId);

              await bot.telegram.sendMessage(
                group.userId,
                `📦 Album added (${saved} videos)\n⚠️ Skipped: ${skipped}`
              );
            } catch (err) {
              console.error("Album process error:", err);
            }
          }, 1000); // 👈 IMPORTANT (debounce)

          return;
        }

        // ========================
        // 🎬 SINGLE VIDEO
        // ========================
        try {
          const forwarded = await ctx.forwardMessage(GROUP_ID);
          const fileId = getFileIdFromForward(forwarded);

          if (!fileId) {
            return ctx.reply("⚠️ Not a video (skipped)");
          }

          session.tempVideos.push(fileId);
          sessions.set(userId, session);

          return ctx.reply(
            `📥 Video added (${session.tempVideos.length})`
          );
        } catch (err) {
          console.error(err);
          return ctx.reply("❌ Failed");
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
