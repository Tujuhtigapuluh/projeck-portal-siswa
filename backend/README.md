# Backend Starter (Opsional)

Folder ini adalah landasan awal untuk migrasi dari penyimpanan `localStorage` ke backend + database terpusat.

Tujuan:
- Menjadi fondasi saat aplikasi akan di-hosting multi-user.
- Menyediakan pola API terpisah dari frontend Vite.
- Menyediakan skema database awal untuk autentikasi guru, murid, kelas, dan absensi.

## Struktur

```text
backend/
  prisma/
    schema.prisma
  src/
    config/
      env.ts
    routes/
      health.route.ts
      index.ts
    server.ts
  .env.example
  package.json
  tsconfig.json
```

## Cara Menjalankan (Nanti)

1. Masuk ke folder backend:
   - `cd backend`
2. Install dependensi:
   - `npm install`
3. Copy env:
   - `cp .env.example .env`
4. Jalankan database PostgreSQL (lokal/cloud), lalu isi `DATABASE_URL`.
5. Generate Prisma client:
   - `npm run prisma:generate`
6. Jalankan migrasi:
   - `npm run prisma:migrate`
7. Jalankan server dev:
   - `npm run dev`

## Endpoint Dasar

- `GET /api/health`
  - Cek status server.

## Catatan Integrasi Frontend

Saat siap migrasi:
- Pindahkan logika baca/tulis dari `src/data/store.ts` ke API call.
- Tambahkan layer service di frontend (contoh: `src/services/api.ts`).
- Gunakan token autentikasi untuk role guru/murid/admin.
