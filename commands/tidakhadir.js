const { getTodayDate } = require("../utils/dateUtils");
let absen = {};

function handleAbsenTidakHadir(message) {
  if (!absen[message.author.id]) {
    absen[message.author.id] = { status: "Tidak Hadir", date: getTodayDate() };
    message.reply(
      "😔 **Anda telah memilih tidak hadir. Semoga bisa ikut lain waktu!**"
    );
  } else {
    message.reply("⚠️ **Anda sudah absen tidak hadir!** 🤞");
  }
}

module.exports = handleAbsenTidakHadir;
