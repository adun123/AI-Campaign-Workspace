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
