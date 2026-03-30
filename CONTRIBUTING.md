# Contributing Guide

Terima kasih telah berkontribusi pada Sistem Absensi Sekolah.

Dokumen ini menjelaskan standar kontribusi agar proses pengembangan tetap konsisten, aman, dan mudah ditinjau.

## Cara Berkontribusi

1. Fork repository.
2. Buat branch baru dari branch utama.
3. Kerjakan perubahan pada branch tersebut.
4. Pastikan build berhasil.
5. Buka Pull Request dengan deskripsi yang jelas.

## Standar Branch

Gunakan format nama branch berikut:

- `feat/nama-fitur`
- `fix/nama-perbaikan`
- `docs/nama-dokumen`
- `refactor/nama-refactor`

Contoh:

- `feat/kotak-surat-guru`
- `fix/upload-foto-profil`

## Standar Commit

Gunakan pesan commit yang ringkas dan deskriptif.

Contoh:

- `feat: tambah halaman pengaturan akun guru`
- `fix: perbaiki render foto profil murid`
- `docs: tambah panduan struktur proyek`

## Aturan Kode

- Gunakan TypeScript secara konsisten.
- Pertahankan penamaan file dan folder yang sudah dipisah per fitur.
- Hindari perubahan besar dalam satu PR jika tidak diperlukan.
- Tambahkan komentar kode hanya jika benar-benar perlu untuk menjelaskan logika kompleks.
- Pastikan tidak menambahkan data sensitif.

## Checklist Sebelum Pull Request

- Kode berjalan di mode pengembangan.
- Build produksi berhasil (`npm run build`).
- Tidak ada error TypeScript yang tersisa.
- Tidak ada file sampah atau data sementara yang ikut ter-commit.
- Perubahan terdokumentasi jika berdampak pada alur kerja pengguna.

## Panduan Pull Request

Isi deskripsi PR minimal mencakup:

- Ringkasan perubahan.
- Masalah yang diselesaikan.
- Area fitur yang terdampak (guru, murid, admin, data store, atau autentikasi).
- Bukti uji singkat (contoh: build berhasil).

## Pelaporan Bug

Saat melaporkan bug, sertakan:

- Langkah reproduksi.
- Hasil yang diharapkan.
- Hasil aktual.
- Tangkapan layar (jika relevan).
- Browser dan versi.

## Kode Etik

Dengan berkontribusi, Anda setuju mengikuti `CODE_OF_CONDUCT.md`.