require("dotenv").config();
const moment = require("moment-timezone");

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Token bot Anda
const token = process.env.DISCORD_TOKEN;

// Fungsi untuk mendapatkan tanggal hari ini
const getTodayDate = () => moment().tz("Asia/Jakarta").format("YYYY-MM-DD");

// Menyimpan absen dengan status
let absen = {};
let currentDate = getTodayDate(); // Tanggal hari ini saat bot dijalankan

// Fungsi untuk mengecek apakah waktu saat ini dalam rentang 08:00 - 09:00
const isAbsensiValid = () => {
  const now = moment().tz("Asia/Jakarta");
  const hour = now.hour();
  return hour >= 8 && hour < 9; // Absensi valid antara jam 8 hingga 9 pagi WIB
};

// Fungsi untuk mengecek apakah waktu saat ini sebelum jam 8 pagi
const isBeforeAbsensiTime = () => {
  const now = moment().tz("Asia/Jakarta");
  return now.hour() < 8; // Sebelum jam 8 pagi WIB
};

// Fungsi untuk mereset data absen jika sudah hari berikutnya
const resetAbsenJikaHariBerganti = () => {
  const today = getTodayDate();
  if (today !== currentDate) {
    currentDate = today;
    absen = {}; // Reset data absen
    console.log("🔄 Data absen telah di-reset untuk hari baru:", currentDate);
  }
};

client.once("ready", () => {
  console.log("Bot siap!");

  // Periksa reset absen setiap jam
  setInterval(() => {
    resetAbsenJikaHariBerganti();
  }, 60 * 60 * 1000); // Periksa setiap 1 jam
});

// Perintah untuk absen
client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  // Perintah yang diizinkan
  const allowedCommands = ["!absen", "!izin", "!tidakhadir", "!cekabsen"];
  if (!allowedCommands.some((command) => message.content.startsWith(command))) {
    return;
  }

  // Memastikan hanya di channel #absen
  const absenChannelId = "1330326308298817587"; // Gantilah dengan ID channel #absen Anda
  if (message.channel.id !== absenChannelId) {
    return message.reply(
      "😡 **Awas!** Perintah absen hanya bisa dilakukan di channel **#absen**. Silakan pindah ke channel yang benar! ⚠️"
    );
  }

  // Reset data absen jika hari sudah berganti
  resetAbsenJikaHariBerganti();

  // Jika waktu masih sebelum jam 8 pagi
  if (isBeforeAbsensiTime()) {
    return message.reply(
      "⏳ **Silakan tunggu terlebih dahulu sampai jam 8 pagi** untuk melakukan absen! 😊"
    );
  }

  // Perintah untuk absen hadir
  if (message.content === "!absen" && !absen[message.author.id]) {
    if (isAbsensiValid()) {
      const today = getTodayDate();
      absen[message.author.id] = { status: "Hadir", date: today };

      message.reply(
        "🎉 **Yeay!** Anda telah berhasil absen hadir! 🚀 Terima kasih sudah bergabung hari ini! 😊"
      );
    } else {
      absen[message.author.id] = { status: "Terlambat", date: getTodayDate() };
      message.reply(
        "⏰ **Oops!** Anda terlambat absen. Waktu absen sudah lewat, semoga bisa ikut di kesempatan berikutnya! 😔"
      );
    }
  } else if (message.content === "!absen") {
    message.reply(
      "🔔 **Anda sudah absen hadir!** Terima kasih telah meluangkan waktu untuk hadir! 🙌"
    );
  }

  // Perintah untuk absen izin
  if (message.content.startsWith("!izin") && !absen[message.author.id]) {
    const alasan = message.content.slice(5).trim();
    if (!alasan) {
      return message.reply(
        "❗ **Anda perlu memberikan alasan untuk izin.** Contoh: `!izin Tidak Bisa Hadir Karena Urusan Pribadi`."
      );
    }

    const today = getTodayDate();
    absen[message.author.id] = { status: "Izin", date: today, alasan: alasan };

    message.reply(
      `✅ **Terima kasih!** Anda telah mengajukan izin dengan alasan: *${alasan}*. Semoga semuanya berjalan lancar! 💪`
    );
  } else if (message.content === "!izin") {
    message.reply(
      "🔔 **Anda sudah mengajukan izin!** Kami berharap Anda bisa hadir di kesempatan berikutnya! 🤞"
    );
  }

  // Perintah untuk absen tidak hadir
  if (message.content === "!tidakhadir" && !absen[message.author.id]) {
    absen[message.author.id] = { status: "Tidak Hadir", date: getTodayDate() };
    message.reply(
      "😔 **Oh no!** Anda telah absen tidak hadir. Semoga bisa hadir lain waktu! 💭"
    );
  } else if (message.content === "!tidakhadir") {
    message.reply(
      "⚠️ **Anda sudah absen tidak hadir!** Kami berharap Anda bisa hadir di kesempatan berikutnya! 🤞"
    );
  }

  // Perintah untuk cek absen
  if (message.content === "!cekabsen") {
    const daftarAbsen =
      Object.entries(absen)
        .map(
          ([id, data]) =>
            `<@${id}>: ${data.status} (${data.date})${
              data.alasan ? ` - Alasan: ${data.alasan}` : ""
            }`
        )
        .join("\n") || "Belum ada yang absen. Ayo, ikut absen sekarang! 😎";
    message.reply(`📋 **Daftar Absen:**\n${daftarAbsen}`);
  }
});

// Masukkan token bot Anda
client.login(token);
