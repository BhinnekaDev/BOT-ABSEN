let absen = {};

function handleCekAbsen(message) {
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

module.exports = handleCekAbsen;
