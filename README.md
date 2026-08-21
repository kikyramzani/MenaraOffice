# Menara Office — Website Company Profile

Website company profile + panel administrator untuk Menara Office (Virtual Office, Serviced Office, Meeting Room, Pendirian PT & CV, Legal Consultant), dibangun ulang dari menaraoffice.id dengan redesign Modern-SaaS ala Hostinger dan identitas warna biru logo Menara Office.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** dengan design tokens (`src/styles/tokens.css`)
- **next-intl** — bilingual `/id` (default) dan `/en`
- **Supabase** (opsional) — Postgres + Auth; tanpa env Supabase site berjalan dalam **mode demo** (data seed + persistensi file lokal `.data/db.json`)
- **Resend** (opsional) — notifikasi email leads & booking
- **Playwright** — 46 E2E test (fungsional, a11y axe-core, responsive 320–1920px)

## Menjalankan Lokal

```bash
npm install
cp .env.example .env.local   # isi minimal ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET
npm run dev                  # http://localhost:3000
```

Panel admin: `http://localhost:3000/admin`

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Build & serve produksi |
| `npm run typecheck` | TypeScript check |
| `npm run test:e2e` | Seluruh suite Playwright (build dulu) |
| `npm run scrape:assets` | Tarik ulang aset foto dari menaraoffice.id |
| `npm run profile:pdf` | Render company profile PDF (A4 portrait, server harus jalan) |

## Company Profile PDF

Dokumen company profile bukan file yang disusun manual: isinya halaman cetak di
`/company-profile` yang membaca data live dari `getStore()`, lalu dirender ke PDF
oleh Playwright. Jadi setiap kali layanan, harga, lokasi, atau kontak berubah di
admin, cukup generate ulang — dokumennya ikut ter-update.

```bash
npm run build && npm start   # server harus sudah jalan
npm run profile:pdf          # → assets/company-profile/Menara-Office-Company-Profile-ID.pdf
```

Perintah itu juga membuat turunan JPEG di `public/images/print/` lebih dulu, karena
Chromium tidak bisa menyalin WebP ke PDF dan akan me-render ulang tanpa kompresi
(46 MB vs 3 MB). Keduanya di-gitignore dan selalu bisa dibuat ulang.

Kalau server sudah jalan sebelum turunan foto dibuat, `next start` tidak akan
melayani file barunya — script akan berhenti dengan pesan jelas; restart server
lalu ulangi.

## Mode Demo vs Supabase

Data layer memakai repository pattern (`src/lib/data/`):

- **Tanpa env Supabase** → `LocalStore`: konten seed + perubahan admin disimpan ke `.data/db.json` (di Vercel: `/tmp`, bertahan selama instance hidup — cukup untuk preview).
- **Dengan env Supabase** → `SupabaseStore`: semua konten, leads, dan booking tersimpan permanen; anti-double-booking dijaga exclusion constraint Postgres.

### Langkah Go-Live Supabase

1. Buat project di [supabase.com](https://supabase.com) → SQL Editor → jalankan seluruh isi `supabase/schema.sql`.
2. (Opsional) Authentication → Users → buat user admin (email+password) untuk login panel.
3. Isi env di Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Redeploy. Konten seed otomatis dipakai sampai admin menyimpan perubahan pertama.

## Environment Variables

Lihat `.env.example`. Wajib di produksi: `AUTH_SECRET` (string acak panjang), `ADMIN_EMAIL`+`ADMIN_PASSWORD` (mode demo) **atau** trio env Supabase. Opsional: `RESEND_API_KEY`+`NOTIFY_EMAIL_TO`, `NEXT_PUBLIC_GA_ID`, `SITE_URL`.

## Struktur Penting

```
src/app/[locale]/        halaman publik bilingual (force-dynamic, konten dari store)
src/app/admin/           panel admin (Indonesia, session cookie HMAC)
src/app/api/             leads, bookings, availability (zod + rate limit)
src/lib/data/            types, seed, DataStore interface, LocalStore, SupabaseStore
supabase/schema.sql      DDL + RLS + exclusion constraint anti-double-booking
tests/e2e/               5 spec Playwright berurutan (01–05)
```
