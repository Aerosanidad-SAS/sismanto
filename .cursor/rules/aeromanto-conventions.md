# Aeromanto — Project Conventions

## Stack

- **Framework:** Next.js 14, App Router, TypeScript strict
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL managed), Row Level Security (RLS) enforced
- **Auth:** Supabase Auth with middleware-based session refresh
- **Validation:** Zod schemas for all form inputs and Server Action payloads
- **Charts:** Recharts for KPI dashboards
- **Node.js:** >= 20 (enforced in package.json)

## Project Structure

```
src/
  app/
    (dashboard)/          # Rutas autenticadas + sidebar (vehiculos, mantenimientos, regulacion, kpis, …)
      ovem/               # Portal OVEM (F-12) — URL pública `/ovem`
    login/, pending/      # Auth y cuenta sin rol
    api/actions/          # Server Actions por dominio
  components/
  lib/
  types/
scripts/
```

## Coding Conventions

### Server Actions
- One file per module in `src/app/api/actions/` (e.g., `vehicles.ts`, `maintenance.ts`)
- Always validate input with Zod schema from `lib/validations.ts` before DB call
- Return typed responses, never throw unhandled errors to the client
- Use `"use server"` directive at the top of Server Action files

### Components
- Server Components by default; add `"use client"` only when state or browser APIs are needed
- Use shadcn/ui components as base; customize via Tailwind, never override shadcn internals
- Use `cn()` from `lib/utils.ts` for conditional class merging

### TypeScript
- Strict mode enabled; no `any` types unless explicitly justified with a comment
- Database types live in `types/database.types.ts` — regenerate after schema changes

### Naming
- Files: kebab-case for components (`vehicle-detail.tsx`), camelCase for utilities
- Database tables and columns: snake_case (PostgreSQL convention)
- TypeScript interfaces: PascalCase
- Server Action functions: camelCase verbs (`createVehicle`, `updateMaintenance`)

### Git
- Commit messages in English, imperative mood: "Add fuel log export", not "Added fuel logs"
- Never commit `.env.local`, `.env`, or any file with secrets
- Migrations get their own commit with descriptive message

## What NOT to Do
- Do NOT create API route handlers (`route.ts`) for operations that can be Server Actions
- Do NOT use `getServerSideProps` or `getStaticProps` (those are Pages Router, not App Router)
- Do NOT install new dependencies without explicit approval from the user
- Do NOT modify existing RLS policies without producing a numbered migration file
- Do NOT use `SUPABASE_SERVICE_ROLE_KEY` in any client-side code or file with `"use client"`
