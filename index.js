require("dotenv").config();
const moment = require("moment-timezone");
const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const PDFDocument = require("pdfkit");
const fs = require("fs");

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
  return true;
};

const isBeforeAbsensiTime = () => false; // Sebelum jam 8 pagi WIB

const resetAbsenJikaHariBerganti = async () => {
  const today = getTodayDate();
  if (today !== currentDate) {
    await kirimRekapAbsen(); // Kirim rekap sebelum reset
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

// Fungsi untuk membuat PDF rekap absen
const generatePDFRekap = () => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filePath = `rekap_absen_${currentDate}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(20).text("Rekap Absen Harian", { align: "center" }).moveDown();
    doc
      .fontSize(14)
      .text(`Tanggal: ${currentDate}`, { align: "center" })
      .moveDown(2);
    if (Object.keys(absen).length === 0) {
      doc
        .fontSize(12)
        .text("Belum ada data absen hari ini.", { align: "center" });
    } else {
      Object.entries(absen).forEach(([id, data]) => {
        doc
          .fontSize(12)
          .text(
            `👤 ${data.name} (${id}) | ${data.status} | ${data.date} ${
              data.alasan ? `| Alasan: ${data.alasan}` : ""
            }`
          );
        doc.moveDown();
      });
    }
    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

// Kirim rekap absen ke channel
const kirimRekapAbsen = async () => {
  try {
    const pdfFilePath = await generatePDFRekap();
    const pdfFile = fs.readFileSync(pdfFilePath);
    const channel = client.channels.cache.get(absenChannelId);
    if (channel) {
      const attachment = new AttachmentBuilder(pdfFile, {
        name: `rekap_absen_${currentDate}.pdf`,
      });
      await channel.send({
        content: "📄 **Rekap Absen Hari Ini:**",
        files: [attachment],
      });
    }
  } catch (error) {
    console.error("❌ Gagal mengirim rekap absen:", error);
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
  else if (message.content.startsWith("!rekap")) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.channel.send(
        "❌ **Hanya admin yang bisa menjalankan perintah ini!**"
      );
    }
    kirimRekapAbsen();
    message.channel.send(
      "📄 **Rekap absen sedang diproses dan akan dikirim segera!**"
    );
  }
});

client.login(token);
