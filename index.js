require("dotenv").config();
const moment = require("moment-timezone");
const { Client, GatewayIntentBits } = require("discord.js");

// Setup client bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Token bot
const token = process.env.DISCORD_TOKEN;

// ID channel #absen
const absenChannelId = "1332637422080757793"; // Ganti dengan ID channel Anda

// Utility Functions
const getTodayDate = () => moment().tz("Asia/Jakarta").format("YYYY-MM-DD");

// Menyimpan data absen
let absen = {};
let currentDate = getTodayDate();

const isAbsensiValid = () => {
  const now = moment().tz("Asia/Jakarta");
  return now.hour() >= 8 && now.hour() < 9; // Absensi valid antara jam 8 hingga 9 pagi WIB
};

const isBeforeAbsensiTime = () => moment().tz("Asia/Jakarta").hour() < 8; // Sebelum jam 8 pagi WIB

const resetAbsenJikaHariBerganti = () => {
  const today = getTodayDate();
  if (today !== currentDate) {
    currentDate = today;
    absen = {}; // Reset data absen
    console.log("🔄 Data absen telah di-reset untuk hari baru:", currentDate);
  }
};

const kirimNotifikasiAbsen = () => {
  const channel = client.channels.cache.get(absenChannelId);
  if (channel) {
    channel.send(
      "@everyone ⏳ **Perhatian!** Waktu absen akan dimulai dalam 10 menit (08:00 WIB). Jangan lupa untuk absen tepat waktu! 😊"
    );
    setTimeout(() => {
      channel.send(
        "@everyone ⚠️ **Perhatian!** Waktu absen akan dimulai dalam 1 menit (08:00 WIB). Pastikan Anda tidak terlambat! ⏰"
      );
    }, 9 * 60 * 1000); // Kirim peringatan 1 menit sebelum absen dimulai
  }
};

// Handlers
const handleAbsen = (message) => {
  if (isBeforeAbsensiTime()) {
    return message.reply(
      "⏳ **Silakan tunggu terlebih dahulu sampai jam 8 pagi** untuk melakukan absen! 😊"
    );
  }

  if (isAbsensiValid()) {
    absen[message.author.id] = { status: "Hadir", date: getTodayDate() };
    message.reply(
      "🎉 **Yeay!** Anda telah berhasil absen hadir! 🚀 Terima kasih sudah bergabung hari ini! 😊"
    );
  } else {
    absen[message.author.id] = { status: "Terlambat", date: getTodayDate() };
    message.reply(
      "⏰ **Oops!** Anda terlambat absen. Waktu absen sudah lewat, semoga bisa ikut di kesempatan berikutnya! 😔"
    );
  }
};

const handleIzin = (message) => {
  const alasan = message.content.slice(5).trim();
  if (!alasan) {
    return message.reply(
      "❗ **Anda perlu memberikan alasan untuk izin.** Contoh: `!izin Tidak Bisa Hadir Karena Urusan Pribadi`."
    );
  }

  absen[message.author.id] = { status: "Izin", date: getTodayDate(), alasan };
  message.reply(
    `✅ **Terima kasih!** Anda telah mengajukan izin dengan alasan: *${alasan}*. Semoga semuanya berjalan lancar! 💪`
  );
};

const handleTidakHadir = (message) => {
  absen[message.author.id] = { status: "Tidak Hadir", date: getTodayDate() };
  message.reply(
    "😔 **Oh no!** Anda telah absen tidak hadir. Semoga bisa hadir lain waktu! 💭"
  );
};

const handleCekAbsen = (message) => {
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
};

// Event Listeners
client.once("ready", () => {
  console.log("Bot siap!");

  // Reset absen setiap jam
  setInterval(resetAbsenJikaHariBerganti, 60 * 60 * 1000); // Setiap 1 jam

  // Kirim notifikasi 10 menit sebelum absen
  const now = moment().tz("Asia/Jakarta");
  const targetTime = moment().tz("Asia/Jakarta").hour(7).minute(50).second(0);
  let delay = targetTime.diff(now);
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000;
  }
  setTimeout(() => {
    kirimNotifikasiAbsen();
    setInterval(kirimNotifikasiAbsen, 24 * 60 * 60 * 1000); // Kirim setiap hari
  }, delay);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  // Periksa perintah absen yang diizinkan
  const allowedCommands = ["!absen", "!izin", "!tidakhadir", "!cekabsen"];
  if (!allowedCommands.some((command) => message.content.startsWith(command)))
    return;

  // Pastikan hanya di channel #absen
  if (message.channel.id !== absenChannelId) {
    return message.reply(
      "😡 **Awas!** Perintah absen hanya bisa dilakukan di channel **#absen**. Silakan pindah ke channel yang benar! ⚠️"
    );
  }

  // Reset data absen jika hari sudah berganti
  resetAbsenJikaHariBerganti();

  // Menangani perintah
  switch (true) {
    case message.content === "!absen" && !absen[message.author.id]:
      handleAbsen(message);
      break;
    case message.content === "!cekabsen":
      handleCekAbsen(message);
      break;
  }
});

// Login bot
client.login(token);
