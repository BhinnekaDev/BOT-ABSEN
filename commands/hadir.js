const { getTodayDate, isAbsensiValid } = require("../utils/dateUtils");
let absen = {};

function handleAbsenHadir(message) {
  if (!absen[message.author.id]) {
    if (isAbsensiValid()) {
      absen[message.author.id] = { status: "Hadir", date: getTodayDate() };
      message.reply("🎉 **Yeay!** Anda telah berhasil absen hadir! 🚀");
    } else {
      absen[message.author.id] = { status: "Terlambat", date: getTodayDate() };
      message.reply(
        "⏰ **Oops!** Anda terlambat absen. Semoga lebih tepat waktu lain kali! 😔"
      );
    }
  } else {
    message.reply("🔔 **Anda sudah absen hadir!** 🙌");
  }
}

module.exports = handleAbsenHadir;
