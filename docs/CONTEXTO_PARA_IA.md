# Contexto del proyecto (handoff para IA y equipo)

**Propósito:** un solo documento que puedas `@` en Cursor o pegar al inicio de un chat para continuar el trabajo sin perder el hilo. **Mantenimiento:** actualízalo cuando cambien rutas críticas, flujos de deploy, migraciones SQL o decisiones de producto relevantes.

---

## Stack y repo

| Item | Valor |
|------|--------|
| Framework | Next.js 14 (App Router), TypeScript, Tailwind |
| Backend / datos | Supabase (Postgres + Auth + RLS) |
| Repo remoto | `https://github.com/daniel891025/aeromanto` · rama principal `main` |
| Documentación larga | [README.md](../README.md) (setup, env, tablas) · [PRD.md](../PRD.md) (requisitos y roadmap) |

**Variables de entorno:** `.env.local` en la raíz (ver `README.md`). Mínimo: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Arranque local:** `cd` al repo → `npm install` → `npm run dev`.

---

## Roles y rutas importantes

Rutas bajo `src/app/(dashboard)/`. El menú lateral filtra por rol en `src/app/(dashboard)/layout.tsx` (`ALL_NAV`).

- **ADMIN:** dashboard, coordinación, vehículos, mantenimientos, novedades, KPIs, **combustible** (`/combustible`), regulación, OVEM, capacitaciones, configuración, usuarios.
- **GERENCIAL:** dashboard, KPIs, combustible.
- **REGULACION / MANTENIMIENTO:** subconjuntos (ver layout).
- **OVEM:** redirige desde `/` a `/ovem` si intenta dashboard financiero; portal preoperacional en `/ovem`.
- **COORDINACION:** ruta principal `/coordinacion` + acceso de lectura a `/capacitaciones`.

**Nota:** `/consumo` redirige a `/combustible` (módulo renombrado en UI).

---

## Decisiones recientes de producto / código (mantener al día)

*Actualizar esta subsección cuando merges importantes cambien el comportamiento.*

### Dashboard (`/`)

- Filtros **globales** en query: `gInicio`, `gFin`, `gCentro`. Unifican período (y centro opcional) para: costo por vehículo, disponibilidad, resolución de novedades.
- Al **aplicar filtros dentro** de las tarjetas Costo o Disponibilidad, se eliminan `gInicio`, `gFin`, `gCentro` (modo “por tarjeta”).
- Costo: además `tipoCosto`, `inicio`/`fin` (si no hay global), `costoCentro`, `costoPlacas`, `costoBusqueda`.
- Disponibilidad: `dispInicio`, `dispFin`, `dispCentro` si no hay global.
- Archivos clave: `src/app/(dashboard)/page.tsx`, `src/components/dashboard/dashboard-global-filters.tsx`, `src/lib/dashboard-search-params.ts`, `src/app/api/actions/dashboard-metrics.ts`, `src/components/dashboard/costo-por-vehiculo-card.tsx`, `src/components/dashboard/disponibilidad-card.tsx`, `src/components/dashboard/estado-flota-detalle.tsx`.

### Combustible

- Página: `src/app/(dashboard)/combustible/page.tsx` · UI: `src/components/consumo/consumo-cliente.tsx` · métricas server: `src/app/api/actions/consumo.ts`.
- Placas eléctricas de referencia (insight en ficha): constantes en `src/lib/electric-reference.ts`.
- El cálculo de rendimiento considera baseline histórico para la primera carga del período (combina `fuel_logs`, `mileage_logs` y fallback de `maintenance_records`).

### Mantenimientos

- Filtros por URL: `mPlaca`, `mDesde`, `mHasta`, `mCat`, `mTipo`, `mProv`, `mFac` · `src/app/(dashboard)/mantenimientos/page.tsx` + `src/components/mantenimientos/mantenimiento-filtros.tsx`.
- Importación masiva (`src/app/api/actions/carga-masiva.ts`) ahora detecta posibles duplicados por clave (con/sin factura) y los reporta en `omitidos`.

### Coordinación (`/coordinacion`)

- Panel operativo consolidado para coordinación CRA: estado flota, OVEM activos y asignaciones vigentes, novedades abiertas y alertas preventivas.
- Archivos: `src/app/(dashboard)/coordinacion/page.tsx`, rol en `src/lib/auth-utils.ts` y menú en `src/app/(dashboard)/layout.tsx`.

### Capacitaciones (`/capacitaciones`)

- Nuevo módulo con cursos, banco de preguntas MC, preguntas abiertas, asignaciones, intentos, revisión Admin y evidencia imprimible.
- Archivos clave:
  - Server actions: `src/app/api/actions/capacitaciones.ts`
  - Páginas: `src/app/(dashboard)/capacitaciones/page.tsx`, `src/app/(dashboard)/capacitaciones/[assignmentId]/page.tsx`, `src/app/(dashboard)/capacitaciones/evidencia/[assignmentId]/page.tsx`
  - Componentes: `src/components/capacitaciones/*`

### Vehículos

- Lista expandible + KM: `src/components/vehiculos/vehiculos-tabla-expandible.tsx`, `vehicle-kilometraje-form.tsx` · acción `registrarKilometrajeVehiculo` en `src/app/api/actions/vehiculos.ts`.
- Detalle: `src/app/(dashboard)/vehiculos/[id]/page.tsx` + `electric-vehicle-insight.tsx` para placas E-Star.

### OVEM

- `src/components/ovem/ovem-portal.tsx` · server `src/app/api/actions/ovem.ts` · ítems checklist en BD `checklist_items` (seed en migración 005; ajustes en 008 si aplica).

### Base de datos (SQL manual en Supabase)

- Scripts en `scripts/migrations/` (numerados). **El deploy de Next no ejecuta SQL:** cada migración nueva debe correrse en el **SQL Editor** de Supabase (staging/prod según corresponda).
- **008** — `scripts/migrations/008_fleet_vencimientos_checklist.sql`: vencimientos SOAT/RTM/técnico, estados FDS, perfil eléctrico en placas indicadas, checklist OVEM. *Si ya se aplicó en tu proyecto, indícalo en chats nuevos para no repetir.*
- **013** — `scripts/migrations/013_coordinacion_role_access.sql`: rol `COORDINACION` + políticas de lectura operativa.
- **014** — `scripts/migrations/014_training_module.sql`: tablas/políticas del módulo de capacitaciones y evaluaciones.

---

## Flujo Git y deploy (resumen)

1. `git pull` en `main` (o tu rama).
2. Cambios → `git add` / `git commit` / `git push` (idealmente rama + PR si el equipo lo pide).
3. **Vercel** (u otro): build al mergear; no sustituye ejecutar migraciones SQL en Supabase.

---

## Instrucción sugerida para un chat nuevo en Cursor

> Lee `@docs/CONTEXTO_PARA_IA.md` y el `README.md` si hace falta setup. Continuamos en Aeromanto: [describe la tarea].

---

*Última revisión de este archivo: mantener fecha o nota breve al editar (opcional).*
