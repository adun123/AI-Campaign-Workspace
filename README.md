# AI Campaign Workspace

Campaign-centric AI marketing workflow platform for agencies, content teams, and creators.

## Stack

- Next.js 15 (App Router) · TypeScript strict
- Tailwind CSS · shadcn/ui-style primitives · Lucide icons
- Zustand (UI state) · TanStack Query (server state)
- React Hook Form · Zod
- Framer Motion

## Getting started

```bash
npm install
npm run dev
```

## Architecture

Feature-first layout. UI, state, business logic and services are separated.

```
src/
  app/                 # Next.js App Router pages + root layout
  components/
    ui/                # Reusable design system primitives
    layout/            # App shell pieces (sidebar, topbar)
    shared/            # Cross-feature shared components
  features/
    campaigns/
    ai-workspace/      # Main Campaign Workspace screen
    assets/
    scheduler/
    brand-kit/
    dashboard/
  services/            # Service abstraction layer (mock today, API tomorrow)
  hooks/               # Cross-cutting hooks
  stores/              # Zustand stores
  types/               # Domain types
  lib/                 # Utilities (cn, formatters, ids, ...)
  styles/              # Global styles + tokens
```

The primary screen is the **Campaign Workspace** (`/campaigns/[id]/workspace`),
not the Dashboard. The Dashboard is a supporting overview surface.

## Backend readiness

All data flows through `src/services/*`. Today these resolve mock data with
artificial latency. Swapping to a real API is a single-file change per service.
Domain types in `src/types/*` are the contract.
