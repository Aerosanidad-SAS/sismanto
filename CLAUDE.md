---
description: 
alwaysApply: true
---

# CLAUDE.md

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:apply     # Apply database migrations
```

No test runner. CI: `.github/workflows/ci.yml` runs lint + build.

## Branches & deploy — read `ENTORNOS.md` for full detail

Three-tier flow, promotion by Pull Request only (never a direct push to `staging` or `main`):

```
dev (Daniel + León push here) → PR → staging (QA) → PR → main (production)
```

- `dev` → auto-deploys to `sismanto-dev.vercel.app` via a GitHub Actions Deploy Hook (`.github/workflows/deploy-dev.yml`) — pushed there because Vercel's Hobby plan blocks deploys triggered by a non-owner commit author on a private repo.
- `staging` → same mechanism, `sismanto-staging.vercel.app` (`deploy-staging.yml`). Same Supabase project as `dev` (`SISMANTO_Staging`, see `STAGING_SETUP.md`).
- `main` → production domain, deployed via Vercel's native Git integration (no Action needed — only Daniel merges to `main`, so the Hobby-plan author restriction never triggers). Own production Supabase project.

Never suggest a direct push/commit to `staging` or `main` — always a PR from the branch below it.

## Tech Stack

- **Framework:** Next.js 14 App Router (TypeScript strict)
- **Database/Auth:** Supabase (PostgreSQL 15+ with RLS)
- **UI:** Tailwind CSS + shadcn/ui + Recharts
- **Forms:** React Hook Form + Zod | **Node:** >= 20

Env vars in `.env.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.

## Architecture

```
src/app/
  (dashboard)/     # Protected — shared sidebar layout
  login/           # Public
  api/actions/     # Server Action modules (one per feature domain)
```

Middleware (`src/middleware.ts`) protects `(dashboard)` and refreshes sessions.

**Data flow:** Server Components → Supabase directly. Mutations via Server Actions (`src/app/api/actions/`) with Zod validation → `{ data, error }`. RLS enforces access at DB layer.

## RBAC — 10 roles

| Role | Access |
|------|--------|
| OVEM | Driver portal: daily checks, km, own incidents, own assigned services ("Mis servicios") |
| Regulación | Fleet state, driver/crew assignment, availability, creates & dispatches medical services, services board |
| Gerencial | Read-only dashboard and reports |
| Admin | Full access + user management |
| Mantenimiento | Maintenance records and inspection |
| Coordinacion | Fleet overview, metrics, capacitaciones grading |
| Analista | SISRES-origin: broad create/edit across most modules (scope still being finalized, see `ESTADO_INTEGRACION.md`) |
| Medico | Patients, own assigned medical services ("Mis servicios") |
| Auxiliar_enfermeria | Patients, own assigned medical services ("Mis servicios") |
| Vista | Read-only across Pacientes/Servicios |

Full role list lives in `src/lib/auth-utils.ts` (`UserRole` type) — treat this table as a summary, that file as the source of truth.

## Auth pattern — CRITICAL

```typescript
// CORRECT:
import { getProfile } from "@/app/api/actions/auth";
const profile = await getProfile();
if (!profile || profile.role_codigo !== "ADMIN") return { error: "Sin permisos" };

// WRONG — these do not exist:
import { getUserProfile } from "@/lib/auth-utils"; // ❌
profile.role   // ❌  →  profile.role_codigo  ✓
```

`auth-utils.ts` only exports helper predicates and `UserRole` type — no async functions.

## Database Migrations

Numbered SQL files in `scripts/migrations/` — **never modify existing ones, always add new**. Migrations are idempotent; RLS policies must live in migration files, not the Supabase dashboard. Registered in `scripts/apply-database.ts`'s `MIGRATIONS` array — add new ones there too, or `npm run db:apply` won't pick them up.

Check `ls scripts/migrations/ | sort | tail -1` for the actual latest number before naming a new one — don't trust a hardcoded number in this doc, it goes stale fast.

## Key Source Paths

| Path | Purpose |
|------|---------|
| `src/lib/supabase/` | Client factory (client / server / admin) |
| `src/lib/validations.ts` | All Zod schemas |
| `src/types/index.ts` | Shared TypeScript types |
| `src/components/ui/` | shadcn/ui base components |
| `src/app/api/actions/` | Server Actions by feature domain |
| `scripts/load-history.mjs` | One-shot Excel → DB loader (idempotent) |

## database.types.ts — editing rule

After any edit, verify brace balance:
```bash
node --input-type=module -e "import{readFileSync}from'fs';const c=readFileSync('src/lib/supabase/database.types.ts','utf-8');let d=0;for(const ch of c){if(ch==='{')d++;if(ch==='}')d--;}console.log(d===0?'OK':'BRACE MISMATCH depth='+d);"
```
Training tables live inside `Tables:`, before `Views:`. `Views:` block only contains `vehicle_maintenance_alerts`.

## Build errors — filtering

```bash
npm run build 2>&1 | grep -E "Error:|error TS|Module not found|Failed" | head -30
```

**`npm run build` does NOT type-check** — `next.config.mjs` sets `typescript.ignoreBuildErrors: true` (pre-existing, large codebase-wide `never`-typing issue from Supabase client inference, tolerated on purpose). A green build is not proof of type safety. After touching TypeScript files, also run `npx tsc --noEmit | grep <your-changed-files>` and confirm no *new* errors in them — ignore pre-existing noise in untouched files.

## Conventions

- **File naming:** `kebab-case` / `PascalCase` for components
- **Git commits:** Conventional Commits (`feat:`, `fix:`, `chore:`)
- **No unreviewed deps** — check before `npm install`
- Regenerate `database.types.ts` after schema changes
