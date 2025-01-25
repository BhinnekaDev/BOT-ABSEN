const { getTodayDate } = require("../utils/dateUtils");
let absen = {};

function handleAbsenIzin(message) {
  if (!absen[message.author.id]) {
    const alasan = message.content.slice(5).trim();
    if (!alasan) {
      return message.reply(
        "❗ **Harap tambahkan alasan izin.** Contoh: `!izin Urusan Pribadi`."
      );
    }
    absen[message.author.id] = { status: "Izin", date: getTodayDate(), alasan };
    message.reply(
      `✅ **Izin diterima:** *${alasan}*. Semoga semuanya berjalan lancar! 💪`
    );
  } else {
    message.reply("🔔 **Anda sudah mengajukan izin!** 🤞");
  }
}

module.exports = handleAbsenIzin;
