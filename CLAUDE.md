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

No test runner. CI on every PR into `dev`/`staging`/`main`: `.github/workflows/ci.yml` (lint + build) and `.github/workflows/claude-review.yml` (Claude review as Aegis + new type errors; fails on BLOCK; runs once per PR on open/ready, re-run with the `re-review` label; skips docs-only PRs).

## Branches & deploy — read `ENTORNOS.md` for full detail

Every change enters by Pull Request — nobody pushes directly to `dev`, `staging` or `main`:

```
feat/<name>-<topic> → PR → dev → PR → staging (QA) → PR → main (production)
```

- `dev` and `staging` are deployed by `.github/workflows/deploy.yml` with the Vercel CLI (`VERCEL_TOKEN`, project `sismanto` in the `tecnicoaerosanidad` team). Vercel's native Git integration cannot be used while the team is on Hobby: it refuses private organization repos. Nobody but the token needs Vercel access. `main` → production is deployed by Daniel by hand until the go-live checklist in `ENTORNOS.md` is done.
- `dev` and `staging` share the `SISMANTO_Staging` Supabase project (see `STAGING_SETUP.md`). `.github/workflows/db-migrate.yml` runs `npm run db:apply` against it on every push to those branches, i.e. only after a PR is merged, using the repo secret `DATABASE_URL_STAGING`.
- `main` → production. No production database credentials live in GitHub for now, so production migrations and the production Supabase project are handled by Daniel by hand until the go-live checklist in `ENTORNOS.md` is done.

Never suggest a direct push/commit to `dev`, `staging` or `main` — always a PR from the branch below it.

## Team workflow (Daniel, León, David)

Three people push to this repo in parallel, each with their own Claude Code. These rules apply to all of them:

- **Branching:** start from fresh `origin/dev` as `feat/<name>-<topic>` or `fix/<name>-<topic>`. Rebase on `origin/dev` daily; keep branches under 3 days. Open the PR into `dev`.
- **One PR = one concern.** No drive-by refactors or reformatting — it creates conflicts for the other two.
- **Before opening a PR:** `npm run lint`, `npm run build`, and `npx tsc --noEmit` filtered to the files you touched (no *new* errors). Fill in `.github/pull_request_template.md` — roles affected, migrations, how it was verified (screenshot for UI).
- **Shared database:** `dev` and `staging` use ONE Supabase project. Never run `npm run db:apply` by hand against it — `db-migrate.yml` applies migrations automatically after the PR is merged into `dev` (or `staging`). A `[DB-DESTRUCTIVE]` migration therefore runs the moment the PR merges: review it as if it were already running.
- **Testing roles:** don't log out/in per role. With `ROLE_SWITCHER_ENABLED=true` in `.env.local`, an ADMIN gets a "Ver como" selector in the sidebar footer (real session switch to `test.<rol>@sismanto.test`, so RLS applies). Seed the users once with `npm run db:seed-role-users`. Never enable it in Production (see `ENTORNOS.md`).
- **Migration numbers:** right before opening the PR, check the highest number on `origin/dev`. If someone merged the same number, renumber the file and its entry in `scripts/apply-database.ts`. Any DROP or type change → PR title starts with `[DB-DESTRUCTIVE]`.
- **Conflict-prone files — touch minimally:** `src/lib/validations.ts`, `src/lib/supabase/database.types.ts`, `src/app/(dashboard)/layout.tsx`, `scripts/apply-database.ts`.
- **Merge into `dev`** requires: CI green + Claude review with no BLOCK + one approval from someone other than the author. Squash merge. `staging → main` is approved only by Daniel.
- **Personal data:** real patient or staff data (ETL CSVs, cédulas, emails, `RESPUESTAS_LEON.md`) never goes into the repo, PR descriptions or review comments.
- **Domain ownership** (who reviews first, not who is allowed to touch): León → servicios, pacientes, notificaciones, biomédico · Daniel → roles/RBAC, flota, infra, ETL · David → same domains as León, as his junior (León reviews and approves David's PRs).

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

- **Dates: a business date is a DAY (`"YYYY-MM-DD"`), not an instant.** Use `src/lib/fechas.ts` (`hoyBogota()`, `sumarDias`, `diasEntre`, `formatoDia`, `limitesInstante`…). Never `new Date("2024-01-01")`, `getFullYear()/getMonth()/getDate()/setMonth()` or `new Date().toISOString().slice(0, 10)`: they answer in the machine's time zone (Vercel = UTC, your PC = Bogotá) so local and production disagree. ESLint enforces it and `npm test` runs the tests under three time zones. Fixed costs come from `src/lib/costos-fijos.ts` only.

- **Versioning:** every PR into `dev` adds `changelog/unreleased/<topic>.md` (type/area/roles/migration + one user-facing line in Spanish); nobody edits `package.json`'s version or `CHANGELOG.md` in a PR — only the release PR (`npm run release`). Full rules: `changelog/README.md`.
- **File naming:** `kebab-case` / `PascalCase` for components
- **Git commits:** Conventional Commits (`feat:`, `fix:`, `chore:`)
- **No unreviewed deps** — check before `npm install`
- Regenerate `database.types.ts` after schema changes
