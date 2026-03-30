# Struktur Proyek

Struktur proyek dipisah per domain fitur agar mudah dirawat, diuji, dan dikembangkan.

## Peta Folder

```text
src/
├─ App.tsx
├─ main.tsx
├─ index.css
├─ types.ts
├─ context/
│  └─ AuthContext.tsx
├─ data/
│  └─ store.ts
├─ hooks/
│  └─ useStoreVersion.ts
├─ layout/
│  └─ Sidebar.tsx
├─ utils/
│  ├─ cn.ts
│  └─ gambar.ts
└─ fitur/
   ├─ autentikasi/
   │  └─ LoginPage.tsx
   ├─ admin/
   │  └─ PanelAdminModal.tsx
   ├─ bersama/
   │  └─ ModalPotongFoto.tsx
   ├─ guru/
   │  ├─ DasborGuru.tsx
   │  ├─ HalamanAbsensi.tsx
   │  ├─ HalamanLaporan.tsx
   │  ├─ ManajemenSiswa.tsx
   │  ├─ AturRosterGuru.tsx
   │  ├─ AturPengumumanGuru.tsx
   │  ├─ AturTugasOnlineGuru.tsx
   │  ├─ KotakSuratGuru.tsx
   │  └─ ProfilGuru.tsx
   ├─ murid/
   │  ├─ DasborMurid.tsx
   │  ├─ RiwayatAbsensi.tsx
   │  ├─ RosterKelas.tsx
   │  ├─ KantongTugas.tsx
   │  ├─ KirimSuratMurid.tsx
   │  ├─ TagihanSekolah.tsx
   │  └─ ProfilMurid.tsx
   └─ pengaturan/
      └─ PengaturanAkun.tsx
```

## Tanggung Jawab File Utama

- `src/App.tsx`: routing utama berdasarkan peran pengguna.
- `src/context/AuthContext.tsx`: login, logout, dan sinkronisasi data pengguna aktif.
- `src/data/store.ts`: seluruh CRUD dan inisialisasi data localStorage.
- `src/layout/Sidebar.tsx`: menu navigasi guru dan murid.
- `src/types.ts`: kontrak tipe data aplikasi.

## Panduan Edit Cepat

- Ubah menu sidebar: `src/layout/Sidebar.tsx`
- Ubah route halaman: `src/App.tsx`
- Ubah fitur guru: `src/fitur/guru/`
- Ubah fitur murid: `src/fitur/murid/`
- Ubah data default dan CRUD: `src/data/store.ts`
- Ubah aturan autentikasi: `src/context/AuthContext.tsx`