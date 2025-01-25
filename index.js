require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const {
  handleAbsenHadir,
  handleAbsenIzin,
  handleAbsenTidakHadir,
  handleCekAbsen,
} = require("./commands");
const {
  resetAbsenJikaHariBerganti,
  isBeforeAbsensiTime,
} = require("./utils/resetAbsen");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env.DISCORD_TOKEN;
const absenChannelId = "1332637422080757793";

client.once("ready", () => {
  console.log("Bot siap!");
  setInterval(resetAbsenJikaHariBerganti, 60 * 60 * 1000);
});

client.on("messageCreate", (message) => {
  if (message.author.bot || message.channel.id !== absenChannelId) return;

  resetAbsenJikaHariBerganti();

  if (isBeforeAbsensiTime()) {
    return message.reply("⏳ **Tunggu hingga jam 8 pagi untuk absen! 😊**");
  }

  const command = message.content.split(" ")[0];
  switch (command) {
    case "!absen":
      handleAbsenHadir(message);
      break;
    case "!izin":
      handleAbsenIzin(message);
      break;
    case "!tidakhadir":
      handleAbsenTidakHadir(message);
      break;
    case "!cekabsen":
      handleCekAbsen(message);
      break;
    default:
      message.reply(
        "😡 **Perintah tidak valid. Gunakan `!absen`, `!izin`, `!tidakhadir`, atau `!cekabsen`.** ⚠️"
      );
  }
});

client.login(token);
