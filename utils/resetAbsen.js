const { getTodayDate } = require("./dateUtils");

let absen = {};
let currentDate = getTodayDate();

function resetAbsenJikaHariBerganti() {
  const today = getTodayDate();
  if (today !== currentDate) {
    currentDate = today;
    absen = {};
    console.log("🔄 Data absen telah di-reset untuk hari baru:", currentDate);
  }
}

module.exports = { resetAbsenJikaHariBerganti };
