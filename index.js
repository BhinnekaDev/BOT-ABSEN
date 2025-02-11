require("dotenv").config();
require("moment/locale/id");
const moment = require("moment-timezone");
const { Client, GatewayIntentBits } = require("discord.js");
moment.locale("id");

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
const absenChannelId = "1336579807919734795"; // Ganti dengan ID channel Anda

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

const resetAbsenJikaHariBerganti = async () => {
  const today = getTodayDate();
  if (today !== currentDate) {
    await kirimRekapAbsen(); // Kirim rekap sebelum reset
    await hapusPesanKecualiRekap(); // Hapus semua pesan kecuali rekap terbaru
    currentDate = today;
    absen = {}; // Reset data absen
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

const handleAbsen = (message) => {
  message.delete();
  if (isBeforeAbsensiTime()) {
    return message.channel.send(
      `⏳ **Silakan tunggu terlebih dahulu sampai jam 8 pagi** untuk melakukan absen! 😊`
    );
  }

  if (isAbsensiValid()) {
    absen[message.author.id] = { status: "Hadir", date: getTodayDate() };
    message.channel.send(
      `🎉 **Yeay!** ${message.author} telah berhasil absen hadir! 🚀 Terima kasih sudah bergabung hari ini! 😊`
    );
  } else {
    absen[message.author.id] = { status: "Terlambat", date: getTodayDate() };
    message.channel.send(
      `⏰ **Oops!** ${message.author} terlambat absen. Waktu absen sudah lewat, semoga bisa ikut di kesempatan berikutnya! 😔`
    );
  }
};

const handleIzin = (message) => {
  message.delete();
  const alasan = message.content.slice(5).trim();
  if (!alasan) {
    return message.channel.send(
      "❗ **Anda perlu memberikan alasan untuk izin.** Contoh: !izin Tidak Bisa Hadir Karena Urusan Pribadi."
    );
  }

  absen[message.author.id] = { status: "Izin", date: getTodayDate(), alasan };
  message.channel.send(
    `✅ **Terima kasih!** ${message.author} telah mengajukan izin dengan alasan: *${alasan}*. Semoga semuanya berjalan lancar! 💪`
  );
};

const handleTidakHadir = (message) => {
  message.delete();
  absen[message.author.id] = { status: "Tidak Hadir", date: getTodayDate() };
  message.channel.send(
    `😔 **Oh no!** ${message.author} telah absen tidak hadir. Semoga bisa hadir lain waktu! 💭`
  );
};

const handleCekAbsen = (message) => {
  message.delete();
  const daftarAbsen =
    Object.entries(absen)
      .map(
        ([id, data]) =>
          `<@${id}>: ${data.status} (${data.date})${
            data.alasan ? ` - Alasan: ${data.alasan}` : ""
          }`
      )
      .join("\n") || "Belum ada yang absen. Ayo, ikut absen sekarang! 😎";
  message.channel.send(`📋 **Daftar Absen:**\n${daftarAbsen}`);
};

// Kirim rekap absen ke channel dalam bentuk chat
const kirimRekapAbsen = async () => {
  try {
    if (Object.keys(absen).length === 0) {
      console.log("❌ Tidak ada data absen hari ini.");
      return;
    }

    const tanggalKemarin = moment()
      .tz("Asia/Jakarta")
      .subtract(1, "day")
      .format("dddd, D MMMM YYYY");

    const daftarAbsen =
      Object.entries(absen)
        .map(
          ([id, data]) =>
            `<@${id}>: ${data.status} (${data.date})${
              data.alasan ? ` - Alasan: ${data.alasan}` : ""
            }`
        )
        .join("\n") || "Belum ada yang absen. Ayo, ikut absen sekarang! 😎";

    const channel = client.channels.cache.get(absenChannelId);
    if (!channel) {
      console.error("❌ Gagal mendapatkan channel.");
      return;
    }

    await channel.send({
      content: `📋 **Rekap Absen (${tanggalKemarin}):**\n${daftarAbsen}`,
    });

    console.log(`✅ Rekap absen berhasil dikirim (${tanggalKemarin}).`);
  } catch (error) {
    console.error("❌ Gagal mengirim rekap absen:", error);
  }
};

// Hapus semua pesan kecuali rekap
const hapusPesanKecualiRekap = async () => {
  try {
    const channel = client.channels.cache.get(absenChannelId);
    if (!channel) {
      console.error("❌ Gagal mendapatkan channel.");
      return;
    }

    const messages = await channel.messages.fetch({ limit: 100 });
    const rekapPesan = messages
      .filter((msg) => msg.content.startsWith("📋 **Rekap Absen"))
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
      .first(); // Ambil rekap terbaru

    const pesanUntukDihapus = messages.filter(
      (msg) => !rekapPesan || msg.id !== rekapPesan.id
    );

    for (const msg of pesanUntukDihapus.values()) {
      await msg.delete();
    }

    console.log("✅ Semua pesan dihapus, kecuali rekap absen terbaru.");
  } catch (error) {
    console.error("❌ Gagal menghapus pesan:", error);
  }
};

// Event Listeners
client.once("ready", () => {
  console.log("Bot siap!");

  // Reset absen setiap jam dan kirim rekap
  setInterval(resetAbsenJikaHariBerganti, 60 * 60 * 1000);

  // Kirim notifikasi 10 menit sebelum absen
  const now = moment().tz("Asia/Jakarta");
  const targetTime = moment().tz("Asia/Jakarta").hour(7).minute(50).second(0);
  let delay = targetTime.diff(now);
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000;
  }
  setTimeout(() => {
    kirimNotifikasiAbsen();
    setInterval(kirimNotifikasiAbsen, 24 * 60 * 60 * 1000);
  }, delay);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== absenChannelId) return;

  resetAbsenJikaHariBerganti();

  if (message.content.startsWith("!absen")) handleAbsen(message);
  else if (message.content.startsWith("!izin")) handleIzin(message);
  else if (message.content.startsWith("!tidakhadir")) handleTidakHadir(message);
  else if (message.content.startsWith("!cekabsen")) handleCekAbsen(message);
});

client.login(token);
