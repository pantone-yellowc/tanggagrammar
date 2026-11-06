# Tangga Grammar

Aplikasi web untuk belajar grammar bahasa Inggris dari A1 sampai C1, unit demi unit, untuk persiapan IELTS.

- 59 unit (A1 → C1). Setiap unit berisi penjelasan, tips, tabel, flashcard, latihan menulis, catatan **Fokus IELTS**, dan kuis pilihan ganda.
- Unit berikutnya terbuka setelah kamu lulus kuis (skor minimal 75%). Kalau mau membuka semua unit sekaligus, aktifkan **Mode bebas** di Pengaturan.
- Ada glosarium 29 istilah, Mode Kuis acak, XP, dan streak harian.
- Mode gelap/terang. Bisa di-install di HP (PWA) dan tetap bisa dibuka offline setelah kunjungan pertama.
- Progres tersimpan di browser. Untuk memindahkannya ke perangkat lain, pakai fitur **kode progres** di Pengaturan.

App ini statis (HTML, CSS, dan JS biasa), jadi tidak perlu server, database, atau proses build. Karena itu bisa di-hosting gratis.

## Struktur folder

```
tangga-grammar/
├── index.html            halaman utama
├── assets/style.css      tampilan
├── assets/app.js         logika app
├── data/content.js       materi 59 unit + glosarium (edit di sini untuk mengubah materi)
├── data/ielts.js         catatan IELTS + soal kuis tiap unit
├── manifest.webmanifest  supaya bisa di-install di HP
├── sw.js                 supaya bisa dibuka offline
└── icons/                ikon app
```

## Coba di komputer sendiri

Cara paling cepat: klik dua kali `index.html`. Semua fitur jalan, kecuali mode offline/install (itu hanya aktif setelah app online).

---

## Cara publish online gratis

Pilih **salah satu** cara di bawah. Kalau baru pertama kali, pakai **Cara 1**.

### Cara 1 — Netlify Drop (paling mudah, ±3 menit, tanpa coding)

1. Buka **https://app.netlify.com/drop**.
2. Seret (drag) **folder `tangga-grammar`** ke kotak di halaman itu. Folder yang diseret harus berisi `index.html` langsung di dalamnya.
3. Tunggu beberapa detik. Kamu langsung mendapat link seperti `https://nama-acak-123.netlify.app`.
4. Daftar/login (gratis, bisa pakai akun Google atau GitHub) lalu klik **Claim site**. Tanpa langkah ini, situsnya terhapus otomatis setelah sekitar satu jam.
5. Ganti nama link: **Site configuration → Change site name**, misalnya `tangga-grammar-dika` → `https://tangga-grammar-dika.netlify.app`.

Untuk update: di halaman situsmu, buka tab **Deploys**, lalu seret lagi folder yang sudah diubah ke area upload.

### Cara 2 — GitHub Pages (gratis selamanya, cocok kalau mau sering update)

1. Buat akun di **https://github.com** (gratis).
2. Klik **New repository**. Isi nama, misalnya `tangga-grammar`, pilih **Public**, lalu klik **Create repository**.
3. Di halaman repo yang masih kosong, klik **uploading an existing file**.
4. Buka folder `tangga-grammar`, pilih **semua isinya** (index.html, assets, data, icons, dan file lainnya), lalu seret ke halaman upload. Upload isinya, bukan foldernya.
5. Klik **Commit changes**.
6. Buka **Settings → Pages**. Di bagian **Source**, pilih **Deploy from a branch**. Branch: `main`, folder: `/ (root)`. Klik **Save**.
7. Tunggu 1–2 menit, lalu refresh. Link akan muncul: `https://USERNAME.github.io/tangga-grammar/`.

Untuk update: buka file di GitHub, klik ikon pensil untuk mengedit (atau **Add file → Upload files** untuk mengganti file), lalu klik **Commit**. Situs akan ter-update dalam 1–2 menit.

Kalau lebih suka pakai terminal:

```bash
cd tangga-grammar
git init
git add .
git commit -m "Tangga Grammar"
git branch -M main
git remote add origin https://github.com/USERNAME/tangga-grammar.git
git push -u origin main
```

Setelah itu, lanjutkan dari langkah 6 di atas.

### Cara 3 — Cloudflare Pages (alternatif, cepat di Indonesia)

1. Daftar di **https://dash.cloudflare.com** (gratis).
2. Buka **Workers & Pages → Create → Pages → Upload assets**.
3. Beri nama proyek, lalu seret folder `tangga-grammar`.
4. Klik **Deploy**. Link: `https://nama-proyek.pages.dev`.

---

## Install di HP

Buka link app-nya di HP.
- **Android (Chrome):** menu ⋮ → **Add to Home screen / Install app**.
- **iPhone (Safari):** tombol Share → **Add to Home Screen**.

Setelah itu app muncul seperti aplikasi biasa dan bisa dibuka tanpa internet.

## Mengubah materi atau soal

- **Materi unit** (penjelasan, tips, tabel, flashcard, latihan menulis) ada di `data/content.js`.
- **Catatan IELTS dan soal kuis** ada di `data/ielts.js`. Format satu soal:
  `["Soal dengan ___", ["opsi A", "opsi B", "opsi C"], indeksJawabanBenar, "Penjelasan"]`.
  Indeks dimulai dari 0, jadi opsi pertama = 0.
- Setelah mengubah file, **naikkan versi** di `sw.js` (misalnya `tg-v1` → `tg-v2`). Tanpa itu, pengguna yang pernah membuka app bisa saja masih melihat versi lama.
- Unggah ulang ke hosting (lihat bagian "Untuk update" di cara yang kamu pilih).
