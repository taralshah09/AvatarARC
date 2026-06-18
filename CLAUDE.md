# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AvatarARC is an AI-powered platform that creates a personalized RPG/FIFA-style player card from real-world activity data (fitness, chess, coding, gaming). The entire infrastructure runs on free tiers ($0 budget, serverless-first, no always-on servers).

**Status:** Pre-implementation. All code is yet to be written. See `PLAN.md` for the full spec and `plan/plan-index.md` for phase-by-phase implementation plans.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript — frontend + API routes in one app
- **Database + Auth + Storage:** Supabase (PostgreSQL via Prisma ORM, Auth, Storage)
- **Hosting:** Vercel Hobby (serverless, free-tier cron jobs)
- **Styling:** TailwindCSS + Framer Motion
- **3D Rendering:** React Three Fiber + drei (client-side, no server GPU)
- **Avatar:** Ready Player Me (Phase 2+); 2.5D layered SVG/PNG builder for MVP
- **State:** Zustand
- **Scheduling:** Vercel Cron → `/api/sync/all` (no Redis/BullMQ)

## Bootstrap Commands

```bash
npx create-next-app@latest avatararc --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @supabase/supabase-js @supabase/ssr prisma @prisma/client zustand framer-motion
npx prisma init --datasource-provider postgresql
npx prisma migrate dev --name init
npx prisma generate
npm run dev
npm run build
npm run lint
```

## Architecture

### Data Flow

```
External API → Adapter → Signal rows (DB) → Score calculator → scores table → Card renderer
```

Every external data source normalizes into a `Signal` shape before scoring. The scoring engine never changes when new sources are added — only new adapters are written.

### Signal Interface (central contract)

```typescript
interface Signal {
  userId: string;
  source: "github" | "chess_com" | "lichess" | "strava" | "codeforces" | "google_health";
  metric: string;       // e.g. "commits_365d", "rapid_rating", "total_distance_km"
  value: number;
  unit: string;
  timestamp: Date;
  rawPayload?: object;
}
```

### Six Score Axes (0–99 each)

| Axis | Primary Sources |
|---|---|
| Vitality | Strava (distance, pace, HR), Google Health |
| Discipline | Cross-source streaks (GitHub, Strava, chess) |
| Logic | Codeforces rating, Chess puzzle rating |
| Strategy | Chess rating, win rate, opening breadth |
| Craft | GitHub repos, language diversity, OSS contributions |
| Grit | Sustained trends over time, long session completion |

OVR = mean of **populated axes only** (empty axes are greyed out, not scored 0).

### Key API Routes

- `GET /api/connect/[provider]` — OAuth initiation
- `GET /api/callback/[provider]` — OAuth callback, token storage
- `POST /api/sync/[provider]` — Trigger sync for one provider
- `POST /api/sync/all` — Cron target (all providers)
- `POST /api/score/calculate` — Recompute scores from signals
- `GET /api/card/[username]` — Public card data
- `GET /api/card/[username]/og` — OG image via `@vercel/og`

### Planned File Structure

```
src/
  app/                    # Next.js App Router pages + API routes
  components/
    card/                 # PlayerCard, RadarHexagon, CardThemes
    avatar/               # AvatarCanvas (R3F), AvatarConfigurator (RPM)
    dashboard/            # ConnectButton, SyncStatus, StatsOverview
  lib/
    adapters/             # types.ts (Signal/adapter interface) + per-source adapters
    scoring/              # curves.ts, axes.ts, overall.ts
    db/client.ts          # Prisma client
    auth/providers.ts     # OAuth config
    utils/encryption.ts   # Token encryption (at app layer, not schema)
  types/index.ts
prisma/schema.prisma
vercel.json               # Cron config
```

## Database Schema (4 tables)

`users`, `connected_providers` (unique on `userId+provider`), `signals` (append-only, indexed on `userId+source+metric+recordedAt`), `scores` (unique per user), `score_history`.

Supabase connection: use Transaction pooler URL (port 6543) for `DATABASE_URL`.

## Scoring Design

- Use **absolute rubric curves** (not percentile) — avoids cold-start instability on day one. Migrate to percentile-based scoring later at 1000+ users.
- Curves map raw values through sigmoid or piecewise functions to 0–99.
- Scoring functions must be pure and unit-testable.
- Archetype label derived from top-2 dominant axes (8–12 labels defined in `scoring/overall.ts`).

## Data Sources (MVP)

**Tier 1 (build first):** GitHub (OAuth REST/GraphQL), Chess.com (public API, no auth), Lichess (OAuth), Strava (OAuth2), Codeforces (public API).

**Do not build for MVP:** LeetCode (no stable API), Riot/Valorant (approval friction), Google Health (submit review early, integrate when approved).

## Avatar Strategy

- **MVP (Phase 1–3):** 2.5D layered card — SVG/PNG asset layers, no photo upload, no GPU cost.
- **Phase 4:** Ready Player Me iframe/SDK → store RPM GLB URL, render via R3F (`useGLTF`). Client-side only.
- Do not add per-user AI image generation (Stable Diffusion, DALL-E, etc.) — GPU cost is incompatible with free infra.

## OG Image Sharing

Use `@vercel/og` (Edge Function) or `satori` to render card as PNG server-side. Store in Supabase Storage. Shareable URL: `/card/[username]` with Open Graph meta tags.

## Environment Variables

See `PLAN.md § Environment Variables` for the full list. Key variables:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (Supabase Transaction pooler, port 6543)
- `TOKEN_ENCRYPTION_KEY` (for OAuth tokens at rest)
- `CRON_SECRET` (Vercel Cron auth header)
- Per-provider: `GITHUB_CLIENT_ID/SECRET`, `STRAVA_CLIENT_ID/SECRET`, `LICHESS_CLIENT_ID/SECRET`

## Implementation Phases

See `plan/plan-index.md` for the full breakdown. Dependency order is strict:

```
plan-0 (infra) → plan-1 (adapters) → plan-2 (scoring) → plan-3 (card) → plan-4 (avatar) → plan-5/6 (parallel)
```
