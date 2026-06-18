# AI Campaign Workspace — Product Requirement Document (PRD V2)

> Versi: 2.0 | Tanggal: Juni 2026 | Status: MVP Frontend Complete, Backend Phase Pending

---

## 1. Executive Summary

AI Campaign Workspace adalah platform AI-powered marketing workflow yang membantu tim content marketing menjalankan proses ideasi, produksi, pengelolaan asset, dan scheduling dalam satu workspace terintegrasi.

Fokus utama produk bukan sekadar AI generation, tetapi **workflow acceleration** dan **content operation management**.

---

## 2. Product Vision

- Menjadi **operating system untuk workflow content marketing modern**.
- Mengurangi friction dalam proses produksi konten.
- Menyatukan ideation, asset generation, iteration, dan scheduling ke dalam satu platform.

---

## 3. Product Positioning

| Atribut | Detail |
|---|---|
| Kategori | AI Marketing Workflow Platform |
| Core Identity | AI Campaign Workspace |
| Value Proposition | Mempercepat workflow content marketing melalui AI-assisted campaign operation |

---

## 4. Core Problems

- Tim marketing menggunakan terlalu banyak tools terpisah.
- Workflow content production repetitive dan tidak efisien.
- Asset management sering berantakan.
- Revisi creative asset memakan waktu tinggi.
- Tidak ada centralized campaign workflow.

---

## 5. Target Market

- Creative Agency
- Social Media Agency
- Startup Marketing Team
- Freelance Creative Team
- Brand Content Team

### Ideal Customer Profile (ICP)

- Agency dengan 3–20 anggota tim.
- Memproduksi minimal 50 konten per bulan.
- Menggunakan tools terpisah: Canva, Notion, Google Drive, social media scheduler.
- Memiliki workflow revisi client yang tinggi.
- Membutuhkan workflow yang lebih cepat dan terstruktur.

---

## 6. Product Differentiation

- Campaign-centric workflow.
- AI iteration workspace berbasis conversation (bukan full chatbot).
- Brand-aware AI generation via Brand Kit system.
- Integrated content workflow: ideation → asset generation → scheduling.
- Centralized asset & campaign management.

---

## 7. Current Implementation Status

### Frontend MVP — Completed

Stack aktual yang sudah dibangun:

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4, design tokens lokal, font Geist |
| State (server) | TanStack Query v5 |
| State (client) | Zustand |
| Forms | React Hook Form + Zod |
| Animasi & Ikon | Framer Motion, Lucide React |
| Backend (current) | Mock services (semua data in-memory) |

### Halaman yang sudah ada

| Route | Fitur |
|---|---|
| `/` | Landing page |
| `/dashboard` | Ringkasan metrik: Assets, Scheduled, Readiness % |
| `/workspace` | Campaign Workspace utama — AI chat + asset canvas |
| `/content-studio` | AI generation form + histori generasi |
| `/assets` | Asset library dengan filter & search |
| `/brand-kit` | Manajemen brand color, voice, guardrails |
| `/scheduler` | Kalender jadwal posting |
| `/trends` | Trend discovery + brief generator |
| `/settings` | Pengaturan akun & workspace |

### Data Model yang sudah terdefinisi

```
User, Workspace, Campaign, BrandKit, Asset, AIGeneration, ScheduledPost
```

- `Workspace.plan`: `starter | pro | studio`
- `Campaign.channels`: `Instagram | LinkedIn | TikTok | Email`
- `Asset.kind`: `image | carousel | caption`
- `Asset.status`: `draft | saved | scheduled`
- `AIGeneration.mode`: `text-to-image | image-to-image`
- `AIGeneration.status`: `queued | processing | completed | error | retry`

### AI Chat System (sudah diimplementasikan di frontend)

- Mode: `text-to-image` dan `image-to-image`
- Multi-model selector: Auto, DALL·E, Midjourney, Stable Diffusion, Gemini Imagen, Adobe Firefly
- Image attachment: upload hingga 20 gambar
- Chat history dengan pesan user dan AI
- Trend brief injection dari halaman Trends

---

## 8. Core Workflow

```
Campaign Creation → AI Chat Ideation → Asset Generation → Asset Save/Edit → Scheduling → Publish
```

---

## 9. MVP Scope (V1) — Status

| Fitur | Status |
|---|---|
| Campaign Workspace (UI) | ✅ Done |
| AI Chat Ideation (UI + Mock) | ✅ Done |
| Text-to-Image (UI + Mock) | ✅ Done |
| Image-to-Image (UI + Mock) | ✅ Done |
| Asset Library (UI + Mock) | ✅ Done |
| Brand Kit (UI + Mock) | ✅ Done |
| Simple Scheduler (UI + Mock) | ✅ Done |
| Trend Discovery (UI + Mock) | ✅ Done |
| **Backend API** | 🔲 Pending |
| **Database** | 🔲 Pending |
| **Auth (real)** | 🔲 Pending |
| **AI Provider Integration** | 🔲 Pending |
| **File Storage** | 🔲 Pending |

---

## 10. Features Excluded from MVP

- Text-to-Video
- Image-to-Video
- Advanced Analytics
- Realtime Collaboration
- Enterprise Permission System
- Autonomous AI Agents
- Advanced Automation

---

## 11. UX Direction

- **Hybrid Workspace UI** — bukan full-chatbot interface.
- Menggabungkan visual workflow dan AI conversation.
- Dark mode premium sebagai default.
- Layout: Sidebar kiri + Center workspace + Right panel.

### Layout Structure

```
LEFT SIDEBAR     │  CENTER WORKSPACE                    │  RIGHT PANEL
─────────────────┼──────────────────────────────────────┼─────────────────
Dashboard        │  AI conversation + generated assets  │  Style settings
Campaigns        │  workflow timeline / asset canvas    │  Aspect ratio
AI Studio        │                                      │  Presets
Assets           │                                      │  Export config
Scheduler        │                                      │
Brand Kit        │                                      │
```

---

## 12. Brand Kit System

Menyimpan dan menyediakan context ke AI generation:

- Brand colors (hex values)
- Fonts & visual identity
- Tone of voice
- CTA style
- Guardrails (hal yang harus/tidak boleh dilakukan AI)

**Data model aktual:**
```ts
BrandKit {
  id, workspaceId, name,
  voice: string,           // tone of voice
  colors: string[],        // hex array
  logoUrl: string,
  guardrails: string[]     // ["No cartoon robots", ...]
}
```

---

## 13. Backend Architecture Plan

### Tech Stack (planned)

| Layer | Tech |
|---|---|
| Backend API | Next.js API Routes (tetap satu repo) |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma atau Drizzle |
| Auth | Supabase Auth |
| Storage | Supabase Storage atau Cloudflare R2 |
| AI Providers | OpenAI, Anthropic Claude, Google Gemini, Replicate |
| Queue | Supabase Edge Function / BullMQ |

### AI Architecture Strategy

- AI abstraction/orchestrator layer — tidak lock-in ke satu provider.
- Backend memilih model terbaik berdasarkan task type dan complexity.
- Async generation untuk heavy process (text-to-image, image-to-image).
- Queue system untuk generation requests.
- Model routing berdasarkan complexity tier.

### Backend Services yang perlu dibangun

Menggantikan semua file di `src/services/` dari mock ke real API:

| Service | Endpoint |
|---|---|
| `auth.service.ts` | `POST /api/auth/login`, `GET /api/auth/session` |
| `campaign.service.ts` | `GET/POST/PUT /api/campaigns` |
| `asset.service.ts` | `GET/POST/DELETE /api/assets` |
| `brand-kit.service.ts` | `GET/PUT /api/brand-kits` |
| `ai.service.ts` | `POST /api/generate`, `GET /api/generations/:campaignId` |
| `scheduler.service.ts` | `GET/POST/DELETE /api/scheduled-posts` |
| `dashboard.service.ts` | `GET /api/dashboard/summary` |
| `trend.service.ts` | `GET /api/trends` |

---

## 14. AI Cost Strategy

- Async generation — tidak blocking UI.
- Generation limits per plan tier.
- Queue system untuk rate limiting.
- Model routing: simple task → cheaper model, complex → premium model.
- Hindari expensive model sebagai default.

---

## 15. Monetization Strategy

| Plan | Target | Fitur |
|---|---|---|
| **Freemium** | Individual creator | Generasi terbatas, 1 brand kit, 1 campaign |
| **Pro** | Creator & small team | Unlimited campaign, lebih banyak generasi, semua channel |
| **Studio** | Agency (current mock plan) | Multi-brand kit, collaboration, priority queue |
| **Enterprise** (Future) | Organization besar | SSO, custom AI, dedicated support |

> Workspace plan sudah terdefinisi di domain: `starter | pro | studio`

---

## 16. Competitive Landscape

| Kompetitor | Keunggulan | Kelemahan vs Produk Ini |
|---|---|---|
| Canva AI | Design tools | Lemah di workflow operation |
| Notion AI | Productivity | Lemah di visual campaign workflow |
| Runway | AI generation | Lemah di campaign management |
| Buffer/Hootsuite | Scheduling | Lemah di AI workflow |

---

## 17. Success Metrics

- Jumlah active campaign per workspace
- Jumlah generated assets
- Retention 30 hari
- Scheduling usage rate
- Average workflow completion time (ideation → scheduled)

---

## 18. Validation Strategy

- Closed beta dengan small creative team (3–5 agency).
- Ukur apakah mereka mau memindahkan workflow content ke platform ini.
- Ukur workflow efficiency improvement.
- Kumpulkan feedback untuk prioritas roadmap berikutnya.

---

## 19. Product Roadmap

| Phase | Fokus |
|---|---|
| **Phase 1** | ✅ AI Campaign Workspace MVP (Frontend) |
| **Phase 2** | 🔲 Backend API + Database + Auth + AI Integration |
| **Phase 3** | 🔲 Team Collaboration & Approval Workflow |
| **Phase 4** | 🔲 AI Workflow Automation |
| **Phase 5** | 🔲 Analytics & Optimization |
| **Phase 6** | 🔲 Enterprise Features |

---

## 20. Strategic Notes

- Prioritaskan **workflow clarity** dibanding jumlah AI features.
- Fokus pada UX yang clean dan scalable.
- Hindari scope explosion di awal development.
- Validasi market lebih penting daripada langsung scale feature.
- Frontend sudah selesai dan siap dihubungkan ke backend — **next step adalah backend Phase 2**.
