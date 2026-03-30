# Sistem Absensi Sekolah

Aplikasi web absensi sekolah berbasis React, Vite, dan Tailwind CSS untuk operasional guru, murid, dan admin internal.

## Ringkasan

Sistem ini menyediakan alur kerja terpisah untuk:

- Guru: absensi, laporan, roster, pengumuman, tugas online, kotak surat.
- Murid: riwayat absensi kalender, roster, kirim surat, tagihan sekolah, profil.
- Admin internal: pengelolaan data akun, kelas, tagihan, dan pengumuman admin.

## Fitur Utama

- Autentikasi multi-peran: guru, murid, admin guru, admin siswa.
- Absensi harian murid oleh guru.
- Laporan absensi per kelas dan periode.
- Roster kelas per hari (Senin sampai Sabtu).
- Pengumuman kelas dari guru dan pengumuman umum dari admin.
- Tugas online dan pengumpulan jawaban murid.
- Kotak surat izin/sakit dengan status validasi.
- Profil guru dan murid dengan unggah serta potong foto.
- Pengaturan akun mandiri (NIP/NIS dan kata sandi).
- Tagihan uang sekolah per bulan, pembayaran, dan unduh rekap PDF tahunan.

## Teknologi

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- localStorage untuk penyimpanan data lokal pada browser

## Menjalankan Proyek

Prasyarat:

- Node.js 20+ (disarankan LTS terbaru)
- npm 10+

Langkah:

1. Instal dependensi.

```bash
npm install
```

2. Jalankan mode pengembangan.

```bash
npm run dev
```

3. Build produksi.

```bash
npm run build
```

4. Preview hasil build.

```bash
npm run preview
```

## Struktur Folder Proyek

```text
.
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ index.css
│  ├─ types.ts
│  ├─ context/
│  │  └─ AuthContext.tsx
│  ├─ data/
│  │  └─ store.ts
│  ├─ hooks/
│  │  └─ useStoreVersion.ts
│  ├─ layout/
│  │  └─ Sidebar.tsx
│  ├─ utils/
│  │  ├─ cn.ts
│  │  └─ gambar.ts
│  └─ fitur/
│     ├─ admin/
│     │  └─ PanelAdminModal.tsx
│     ├─ autentikasi/
│     │  └─ LoginPage.tsx
│     ├─ bersama/
│     │  └─ ModalPotongFoto.tsx
│     ├─ guru/
│     │  ├─ DasborGuru.tsx
│     │  ├─ HalamanAbsensi.tsx
│     │  ├─ HalamanLaporan.tsx
│     │  ├─ ManajemenSiswa.tsx
│     │  ├─ AturRosterGuru.tsx
│     │  ├─ AturPengumumanGuru.tsx
│     │  ├─ AturTugasOnlineGuru.tsx
│     │  ├─ KotakSuratGuru.tsx
│     │  └─ ProfilGuru.tsx
│     ├─ murid/
│     │  ├─ DasborMurid.tsx
│     │  ├─ RiwayatAbsensi.tsx
│     │  ├─ RosterKelas.tsx
│     │  ├─ KantongTugas.tsx
│     │  ├─ KirimSuratMurid.tsx
│     │  ├─ TagihanSekolah.tsx
│     │  └─ ProfilMurid.tsx
│     └─ pengaturan/
│        └─ PengaturanAkun.tsx
├─ CONTRIBUTING.md
├─ CODE_OF_CONDUCT.md
├─ LICENSE
├─ README.md
└─ STRUKTUR_PROYEK.md
```

Catatan detail edit cepat tetap tersedia di `STRUKTUR_PROYEK.md`.

## Deploy Global

Proyek ini berbentuk aplikasi front-end statis hasil build Vite, sehingga bisa di-hosting global di:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Hosting statis lain yang mendukung file `dist/`

Langkah umum deploy:

1. Jalankan `npm run build`.
2. Upload isi folder `dist/` ke hosting statis.
3. Pastikan domain menggunakan HTTPS.

Catatan operasional penting:

- Data aplikasi saat ini disimpan di `localStorage` browser.
- Artinya data tidak otomatis sinkron antar perangkat atau antar browser.
- Untuk skala sekolah lintas perangkat/global secara penuh, disarankan menambahkan backend dan database terpusat.

## Status Kualitas

- Build produksi terakhir berhasil dengan perintah `npm run build`.
- Tidak ditemukan error build pada revisi terakhir.
- Pengujian fungsional end-to-end tetap disarankan setelah deploy, terutama untuk alur upload file dan pembayaran.

## Akun Demo

Konfigurasi akun demo tersedia di halaman login dan data awal pada `src/data/store.ts`. Ubah akun demo sebelum digunakan di lingkungan operasional.

## Kontribusi

Kontribusi terbuka untuk perbaikan bug, peningkatan pengalaman pengguna, dan penyempurnaan standar operasional sekolah.

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`

## Lisensi

Proyek ini menggunakan lisensi MIT. Detail tersedia di `LICENSE`.