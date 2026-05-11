# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run dev:host     # Dev server on 0.0.0.0 (if localhost fails)
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:apply     # Apply database migrations
```

No test runner is configured in this repository; optional **CI**: GitHub Actions (`.github/workflows/ci.yml`) runs `lint` and `build`.

## Tech Stack

- **Framework:** Next.js 14 with App Router (TypeScript, strict mode)
- **Database/Auth:** Supabase (PostgreSQL 15+ with RLS)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives) + Recharts
- **Forms:** React Hook Form + Zod
- **Node:** >= 20.0.0 required

Environment variables go in `.env.local` — see `.env.local.example` for required keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.

## Architecture

### Route Structure

```
src/app/
  (dashboard)/        # Protected routes — shared sidebar layout
  login/              # Public
  pending/            # Public (shown after login, before role assignment)
  api/actions/        # 11 Server Action modules (one per feature domain)
```

The `(dashboard)` route group is protected by middleware (`src/middleware.ts`), which refreshes the Supabase session on every request and redirects unauthenticated users to `/login`.

### Data Flow

1. **Server Components** fetch data directly from Supabase — default unless interactivity is needed.
2. **Server Actions** (`src/app/api/actions/`) handle all mutations. Each action validates input with Zod before touching the DB and returns `{ data, error }`.
3. **Client Components** are used only for state, browser APIs, or interactive UI. They call Server Actions for writes.
4. **RLS** (Row Level Security) enforces access control at the DB layer for every user-facing table — not just in application code.

### RBAC (4 roles)

| Role | Access |
|------|--------|
| OVEM | Driver portal: daily checks, km entry, own incidents |
| Regulación | Fleet state, driver assignment, availability toggle |
| Gerencial | Read-only dashboard and reports |
| Admin | Full access + user management |

Role is stored in `user_profiles.role`. Middleware and Server Actions check `user_profiles` to gate access; RLS policies enforce the same rules at DB level.

### Backlog / notas de producto

- **OVEM - tanqueo (pendiente)**: añadir en Portal OVEM una opción para registrar tanqueo con campos requeridos: `placa`, `fecha`, `km`, `galones`, `valor_total` (y persistir en `fuel_logs` o tabla equivalente según el flujo).

### Database Migrations

All schema changes go in numbered SQL files — never modify existing ones:

```
scripts/schema.sql              # Base schema
scripts/migrations/
  002_iteracion2.sql
  003_rbac.sql
  004_reserved_rls.sql          # Reserved (placeholder unless extended with new RLS)
  005_maintenance_items_checklist.sql
  006_mantenimiento_flota_ovem.sql
  007_daily_check_items_cantidad_ok.sql
  008_fleet_vencimientos_checklist.sql  # Aplicada en Supabase
  009_vehicle_fds_desde.sql             # ADD COLUMN fds_desde + datos iniciales FDS
```

Migrations are idempotent. RLS policies must live in migration files, not be set via the Supabase dashboard UI.

### Key Source Paths

| Path | Purpose |
|------|---------|
| `src/lib/supabase/` | Supabase client factory (client / server / admin variants) |
| `src/lib/validations.ts` | All Zod schemas |
| `src/types/index.ts` | Shared TypeScript types |
| `src/components/ui/` | shadcn/ui base components |
| `src/app/api/actions/` | Server Actions by feature domain |

## Conventions (from `.cursor/rules/`)

- **File naming:** `kebab-case` for files/folders; `PascalCase` for components.
- **Git commits:** Conventional Commits format (`feat:`, `fix:`, `chore:`, etc.).
- **No unreviewed dependencies** — check before `npm install` anything new.
- **TypeScript types:** Regenerate `database.types.ts` after any schema change.
- After adding/changing migrations, run `npm run db:apply` and verify RLS policies still pass.
