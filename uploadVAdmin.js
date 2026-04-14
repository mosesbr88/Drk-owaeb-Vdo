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
  if (msg.message?.video) return msg.message.video.file_id;
  return null;
}

module.exports = (bot) => {
  bot.on("message", async (ctx) => {
    try {
      const userId = ctx.from.id;
      const text = ctx.message.text;

      if (!isAdmin(ctx)) return;

      let session = sessions.get(userId);

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
          return ctx.reply(
            "❌ Invalid args\n\n" +
            validArgs.map((v, i) => `${i+1}. ${v}`).join("\n")
          );
        }

        sessions.set(userId, {
          uploading: true,
          category: args,
          tempVideos: [],
          videoSet: new Set(),
          duplicateCount: 0,
        });

        return ctx.reply(`✅ Upload started: ${args}`);
      }

      if (!session || !session.uploading) return;

      // ========================
      // 🎥 HANDLE VIDEO
      // ========================
      if (ctx.message.video) {
        try {
          const forwarded = await ctx.forwardMessage(GROUP_ID);

          const fileId = getFileId(forwarded);

          if (!fileId) {
            return ctx.reply("⚠️ Skipped (not video)");
          }

          // 🔥 DUPLICATE CHECK
          if (session.videoSet.has(fileId)) {
            session.duplicateCount++;
            sessions.set(userId, session);

            return ctx.reply(
              `⚠️ Duplicate ignored\n📊 Duplicates: ${session.duplicateCount}`
            );
          }

          // ✅ SAVE UNIQUE
          session.videoSet.add(fileId);
          session.tempVideos.push(fileId);
          sessions.set(userId, session);

          return ctx.reply(
            `📥 Added (${session.tempVideos.length})\n⚠️ Duplicates: ${session.duplicateCount}`
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
        const otp = generateOTP();
        session.doneOTP = otp;
        sessions.set(userId, session);

        return ctx.reply(`⚠️ Confirm: $doneUp ${otp}`);
      }

      if (text?.startsWith("$doneUp ")) {
        const otp = text.split(" ")[1];

        if (otp !== session.doneOTP) return;

        const data = {
          category: session.category,
          totalVideos: session.tempVideos.length,
          duplicatesIgnored: session.duplicateCount,
          videos: session.tempVideos,
        };

        sessions.delete(userId);
        for(let i = 0; i < data.videos.length; i++){
          try{
            await db.push(`vdo.${data.category}`, data.videos[i]);
          }catch{
            console.log("err-hehehe");
           await db.set(`vdo.${data.category}`, [data.videos[i]]);
          }
        }

        await ctx.reply(`✅ Upload completed! \n\nvid_count: ${data.totalVideos} . \nSaved: ${data.videos.length} \nCat: ${data.category}`);

       /* await ctx.reply(
          "```json\n" + JSON.stringify(data, null, 2) + "\n```",
          { parse_mode: "Markdown" }
        );*/

        return;
      }

      // ========================
      // 🛑 STOP
      // ========================
      if (text === "$stopUp") {
        const otp = generateOTP();
        session.stopOTP = otp;
        sessions.set(userId, session);

        return ctx.reply(`⚠️ Cancel: $stopUp ${otp}`);
      }

      if (text?.startsWith("$stopUp ")) {
        const otp = text.split(" ")[1];

        if (otp !== session.stopOTP) return;

        sessions.delete(userId);
        return ctx.reply("🛑 Upload cancelled");
      }

    } catch (err) {
      console.error("Handler Error:", err);
      try { await ctx.reply("❌ Error"); } catch {}
    }
  });
};
