# Aeromanto — RBAC & Roles

## Roles

| Role | Access | Home Route | Notes |
|------|--------|------------|-------|
| **Gerencial** | Full dashboard, KPIs, all modules read | `/dashboard` | Executive view, read-heavy |
| **Admin** | Full CRUD all modules, user management, configuration | `/dashboard` | Operational admin |
| **Regulación** | Fleet view, vehicle availability, OVEM assignment | `/regulation` | Dispatch operations |
| **OVEM** | Portal only: assigned vehicles, checklist, km, novedades | `/portal` | Field operators (ambulance crew) |

## Route Protection

- Middleware checks session on every request; redirects unauthenticated users to `/login`
- Authenticated users without a valid profile/role go to `/pending`
- Menu items and sidebar links render conditionally based on role
- Server Actions must verify role before executing — UI-only restrictions are NOT sufficient

## RLS Principles

- Every table with user-facing data MUST have RLS enabled
- Policies are defined in numbered SQL migration files (`scripts/migrations/`)
- OVEM users should only access data for vehicles assigned to them
- Admin and Gerencial roles have broader read access but still through RLS, not by bypassing it
- `service_role` key bypasses RLS — use ONLY in admin user management Server Actions, never in client code

## When Modifying Roles or Permissions

1. Design the policy change in SQL first
2. Create a new migration file (next number after existing ones)
3. Test with each role manually: can role X see what it should? Can it NOT see what it shouldn't?
4. Never modify policies via Supabase dashboard UI — always via migration files for traceability
