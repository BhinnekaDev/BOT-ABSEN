# 📌 Discord Absensi Bot

Selamat datang di **Discord Absensi Bot**! 🎉
Bot ini akan membantu mencatat absensi anggota dalam server Discord Anda secara otomatis dan memberikan rekap harian! 🚀

## 🌟 Fitur Utama

✅ **Absensi Otomatis**: Anggota bisa melakukan absen dengan mudah menggunakan perintah!
✅ **Notifikasi Pengingat**: Bot akan mengingatkan anggota untuk absen tepat waktu! 🔔
✅ **Batas Waktu Absensi**: Absensi hanya berlaku dari pukul **08:00 - 09:00 WIB** ⏰
✅ **Rekap Harian**: Bot akan mengirim rekap absensi setiap hari! 📊
✅ **Hapus Pesan Lama**: Pesan lama dihapus untuk menjaga kebersihan channel! 🧹

---

## 🚀 Cara Install & Menjalankan Bot

### 1️⃣ Clone Repository

```bash
git clone https://github.com/BhinnekaDev/BOT-ABSEN.git
cd BOT-ABSEN
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Konfigurasi `.env`

Buat file `.env` dan masukkan token bot Discord Anda:

```env
DISCORD_TOKEN=your_bot_token
```

### 4️⃣ Jalankan Bot 🚀

```bash
node bot.js
```

---

## 📖 Perintah yang Tersedia

| Perintah         | Fungsi                                                     |
| ---------------- | ---------------------------------------------------------- |
| `!absen`         | Melakukan absensi (hanya bisa antara 08:00 - 09:00 WIB) ✅ |
| `!izin <alasan>` | Mengajukan izin dengan alasan 📜                           |
| `!tidakhadir`    | Melaporkan ketidakhadiran 😔                               |
| `!cekabsen`      | Melihat daftar absensi hari ini 📋                         |

---

## 🔥 Fitur Tambahan

- **🔔 Notifikasi Otomatis**: Bot akan mengirim peringatan **10 menit** dan **1 menit** sebelum absensi dimulai!
- **📋 Rekap Absensi**: Rekap absensi otomatis dikirimkan setiap hari sebelum reset!
- **🧹 Pembersihan Otomatis**: Pesan lama dihapus, hanya menyisakan rekap terbaru!

---

## 🎯 Contoh Penggunaan

```bash
!absen
🎉 Yeay! @user telah berhasil absen hadir!
```

```bash
!izin Sakit
✅ @user telah mengajukan izin dengan alasan: *Sakit*
```

```bash
!cekabsen
📋 **Daftar Absen:**
@user1: Hadir (2024-02-11)
@user2: Izin (2024-02-11) - Alasan: Sakit
```

---

## 🤖 Teknologi yang Digunakan

- **Node.js** 🟢
- **Discord.js** 🤖
- **Moment.js** ⏳

---

## 💡 Kontribusi

Jika Anda ingin menambahkan fitur baru atau memperbaiki bug, silakan fork repo ini dan buat pull request! 🚀

🔗 **GitHub Repo:** [Tautan Repository](https://github.com/BhinnekaDev/BOT-ABSEN.git)

---

## 👥 Kontributor

Terima kasih kepada semua kontributor yang telah membantu pengembangan bot ini!

### Pembuat & Kontributor Utama:

- **@fifovalle** (Naufal FIFA)
- **@BhinnekaDev** (Bhinneka Developer)

🎉 **Selamat menggunakan Discord Absensi Bot!** 🚀
