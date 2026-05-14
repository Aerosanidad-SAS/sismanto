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

## RBAC — 6 roles

| Role | Access |
|------|--------|
| OVEM | Driver portal: daily checks, km, own incidents |
| Regulación | Fleet state, driver assignment, availability |
| Gerencial | Read-only dashboard and reports |
| Admin | Full access + user management |
| Mantenimiento | Maintenance records and inspection |
| Coordinacion | Fleet overview, metrics, capacitaciones grading |

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

Numbered SQL files in `scripts/migrations/` — **never modify existing ones, always add new**. Next migration: `024_*.sql`. Migrations are idempotent; RLS policies must live in migration files, not the Supabase dashboard.

Last applied: `023_normalize_placas.sql` (plate normalization + OKL227 dedup).

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

## Conventions

- **File naming:** `kebab-case` / `PascalCase` for components
- **Git commits:** Conventional Commits (`feat:`, `fix:`, `chore:`)
- **No unreviewed deps** — check before `npm install`
- Regenerate `database.types.ts` after schema changes
