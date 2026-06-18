# AI Campaign Workspace

A frontend-first MVP foundation for a premium dark-mode AI SaaS workspace. The main surface is the Campaign Workspace, with AI ideation, mocked asynchronous generation, asset saving, brand guardrails, and a simple scheduler.

## Stack

- Next.js App Router, React 19, TypeScript strict mode
- Tailwind CSS v4 with local design tokens and Geist font
- TanStack Query for async/server-like state
- Zustand for local UI state
- React Hook Form and Zod for generation forms
- Framer Motion and Lucide React for restrained motion and iconography

## Architecture

- `src/app` keeps route files thin and follows App Router conventions.
- `src/components/ui` contains local shadcn-style primitives.
- `src/components/layout` contains the app shell, sidebar, topbar, and mobile navigation.
- `src/features` owns feature UI for campaigns, AI workspace, assets, brand kit, scheduler, and dashboard summary.
- `src/services` is the mocked backend boundary: AI, campaign, asset, scheduler, and auth calls all route through service files.
- `src/types/domain.ts` defines backend-aware MVP entities: `User`, `Workspace`, `Campaign`, `BrandKit`, `AIGeneration`, `Asset`, and `ScheduledPost`.

## Commands

```bash
npm.cmd run dev
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

Open `http://localhost:3000` to use the MVP shell.

---

## Struktur File

### `src/app/`
Route files Next.js App Router. Dibuat seminimal mungkin, hanya memanggil komponen dari `features/`.

| File | Keterangan |
|------|-----------|
| `layout.tsx` | Root layout: font Geist, metadata, wraps `AppProviders` |
| `page.tsx` | Halaman root `/`, redirect atau render `LandingPage` |
| `loading.tsx` | Skeleton loading global |
| `globals.css` | CSS global, design tokens Tailwind v4 |

#### `src/app/(workspace)/`
Route group untuk semua halaman yang membutuhkan app shell (sidebar + topbar).

| File | Keterangan |
|------|-----------|
| `layout.tsx` | Layout workspace dengan `AppShell` |
| `dashboard/page.tsx` | Halaman `/dashboard` |
| `workspace/page.tsx` | Halaman `/workspace` — Campaign Workspace utama |
| `content-studio/page.tsx` | Halaman `/content-studio` — AI generation |
| `assets/page.tsx` | Halaman `/assets` — Asset library |
| `brand-kit/page.tsx` | Halaman `/brand-kit` |
| `scheduler/page.tsx` | Halaman `/scheduler` |
| `settings/page.tsx` | Halaman `/settings` |
| `trends/page.tsx` | Halaman `/trends` — Trend discovery |

---

### `src/components/`

#### `src/components/layout/`
Komponen app shell dan navigasi.

| File | Keterangan |
|------|-----------|
| `app-shell.tsx` | Wrapper utama layout: sidebar + topbar + konten |
| `sidebar.tsx` | Sidebar navigasi kiri dengan daftar menu |
| `topbar.tsx` | Header atas dengan judul halaman dan aksi global |
| `mobile-nav.tsx` | Navigasi bawah untuk tampilan mobile |

#### `src/components/ui/`
Primitif UI ala shadcn — reusable dan stateless.

| File | Keterangan |
|------|-----------|
| `button.tsx` | Komponen Button dengan varian (primary, ghost, dll.) |
| `card.tsx` | Card container dengan padding dan border |
| `badge.tsx` | Badge label kecil dengan varian warna |
| `input.tsx` | Input teks dengan styling konsisten |
| `toast.tsx` | Komponen notifikasi toast |

#### `src/components/shared/`
Komponen bersama lintas fitur.

| File | Keterangan |
|------|-----------|
| `empty-state.tsx` | Tampilan kosong generik (ikon + pesan + CTA opsional) |
| `error-boundary.tsx` | React error boundary untuk menangkap error UI |
| `section-heading.tsx` | Heading bagian dengan judul dan deskripsi opsional |

#### `src/components/providers/`

| File | Keterangan |
|------|-----------|
| `app-providers.tsx` | Menyusun semua providers: TanStack Query, dsb. |

---

### `src/features/`
Logika UI per fitur. Setiap subfolder adalah satu domain fungsional.

#### `src/features/campaigns/`
| File | Keterangan |
|------|-----------|
| `campaign-workspace.tsx` | Halaman utama Campaign Workspace: kanvas aset + AI ideation |
| `workspace-asset-card.tsx` | Kartu aset individual dalam kanvas campaign |
| `workspace-settings-popup.tsx` | Popup pengaturan campaign (nama, platform, dsb.) |
| `image-edit-modal.tsx` | Modal edit/crop gambar aset |

#### `src/features/ai-workspace/`
| File | Keterangan |
|------|-----------|
| `content-studio-view.tsx` | View utama Content Studio dengan histori generasi |
| `generation-form.tsx` | Form input untuk request AI generation (React Hook Form + Zod) |

#### `src/features/assets/`
| File | Keterangan |
|------|-----------|
| `asset-library.tsx` | View galeri aset dengan filter dan search |
| `components/asset-card.tsx` | Kartu aset individual di library |

#### `src/features/dashboard/`
| File | Keterangan |
|------|-----------|
| `dashboard-view.tsx` | View halaman dashboard utama |
| `dashboard-summary.tsx` | Ringkasan statistik/metrik di dashboard |

#### `src/features/brand-kit/`
| File | Keterangan |
|------|-----------|
| `brand-kit-view.tsx` | Manajemen warna merek, tipografi, dan panduan merek |

#### `src/features/scheduler/`
| File | Keterangan |
|------|-----------|
| `scheduler-view.tsx` | Kalender dan daftar jadwal posting konten |

#### `src/features/trends/`
| File | Keterangan |
|------|-----------|
| `trend-discovery-view.tsx` | Eksplorasi tren dengan data mock dan brief generator |

#### `src/features/settings/`
| File | Keterangan |
|------|-----------|
| `settings-view.tsx` | Pengaturan akun, workspace, dan preferensi |

#### `src/features/landing/`
| File | Keterangan |
|------|-----------|
| `landing-page.tsx` | Halaman landing/marketing sebelum masuk workspace |

---

### `src/services/`
Mocked backend boundary — semua panggilan API/data melewati file ini.

| File | Keterangan |
|------|-----------|
| `mock-runtime.ts` | Helper simulasi delay async untuk semua service |
| `ai.service.ts` | Generasi konten AI (teks, gambar) — mocked async |
| `campaign.service.ts` | CRUD campaign |
| `asset.service.ts` | Upload, list, dan hapus aset |
| `brand-kit.service.ts` | Baca dan update brand kit |
| `dashboard.service.ts` | Data statistik dan ringkasan untuk dashboard |
| `scheduler.service.ts` | Jadwal posting: create, list, update status |
| `trend.service.ts` | Fetch data tren mock |
| `auth.service.ts` | Login/logout dan session user mock |

---

### `src/stores/`
State lokal UI menggunakan Zustand.

| File | Keterangan |
|------|-----------|
| `ui-store.ts` | State UI global: sidebar open/close, active panel |
| `toast-store.ts` | Antrian notifikasi toast |
| `chat-store.ts` | State sesi chat AI di workspace |
| `trend-brief-store.ts` | State brief yang dibuat dari halaman trends |

---

### `src/hooks/`

| File | Keterangan |
|------|-----------|
| `use-workspace-data.ts` | Custom hook TanStack Query untuk data workspace (campaign, assets, brand kit) |

---

### `src/lib/`
Utilitas dan data statis.

| File | Keterangan |
|------|-----------|
| `utils.ts` | Helper `cn()` untuk class merging (clsx + tailwind-merge) |
| `mock-data.ts` | Data seed mock: campaign, aset, user |
| `template-data.ts` | Template konten AI yang tersedia |
| `trend-data.ts` | Data tren mock untuk halaman Trend Discovery |

---

### `src/types/`

| File | Keterangan |
|------|-----------|
| `domain.ts` | Type definitions domain: `User`, `Workspace`, `Campaign`, `BrandKit`, `AIGeneration`, `Asset`, `ScheduledPost` |
