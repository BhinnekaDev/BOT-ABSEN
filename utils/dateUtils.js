const moment = require("moment-timezone");

function getTodayDate() {
  return moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
}

function isAbsensiValid() {
  const now = moment().tz("Asia/Jakarta");
  return now.hour() >= 8 && now.hour() < 9;
}

function isBeforeAbsensiTime() {
  const now = moment().tz("Asia/Jakarta");
  return now.hour() < 8;
}

module.exports = { getTodayDate, isAbsensiValid, isBeforeAbsensiTime };
