# Aeromanto — Database & Migrations

## Migration Discipline

- All schema changes go through numbered SQL files in `scripts/migrations/`
- Current sequence: `schema.sql` → `002_iteracion2.sql` → `003_rbac.sql`
- Next migration MUST be `004_*.sql` (increment from last existing)
- Each migration file must be idempotent where possible (use `IF NOT EXISTS`, `IF EXISTS`)
- Include rollback comments at the bottom of each migration (what to DROP/ALTER to undo)

## Schema Conventions

- Table names: plural snake_case (`vehicles`, `fuel_logs`, `maintenance_records`)
- Column names: snake_case (`created_at`, `vehicle_id`, `is_active`)
- Primary keys: `id` as UUID with `gen_random_uuid()` default
- Foreign keys: `{referenced_table_singular}_id` (e.g., `vehicle_id`, `provider_id`)
- Timestamps: always include `created_at` (default `now()`) and `updated_at`
- Soft deletes: prefer `is_active` boolean over physical deletion
- Enums: define as PostgreSQL enums when the set is stable; use text with CHECK for volatile sets

## After Schema Changes

1. Run the migration in Supabase SQL Editor
2. Regenerate TypeScript types: update `types/database.types.ts` to reflect new columns/tables
3. Update Zod schemas in `lib/validations.ts` if the change affects form inputs
4. Update affected Server Actions in `src/app/api/actions/`

## Supabase-Specific

- Use Supabase client from `lib/supabase/` (browser client for client components, server client for Server Actions)
- RLS policies are part of migrations, not separate files
- Triggers and functions go in migration files with clear naming: `fn_{purpose}`, `trg_{purpose}`
- Indexes: add for columns used in WHERE clauses and JOIN conditions on tables > 1000 rows

## Key Tables (reference, not exhaustive)

- `vehicles` — fleet registry with technical profile
- `maintenances` / `maintenance_records` — preventive and corrective maintenance
- `novedades` — incidents with severity and resolution tracking
- `fuel_logs` — consumption records with km/gal calculations
- `profiles` — user profiles linked to Supabase Auth, includes role
- `centers` — operational centers
- `providers` — maintenance service providers
