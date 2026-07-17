# AUDIT_aeromanto

**Rama:** `audit/integration-analysis` (no se toca `main`)
**Fecha auditoría:** 2026-07-16
**Alcance:** solo lectura/documentación — no se modificó código de producto.

---

## 1. Stack real detectado

| Capa | Tecnología | Versión (evidencia) |
|---|---|---|
| Runtime | Node.js | `>=20.0.0` (`package.json` → `engines.node`) |
| Framework | Next.js (App Router) | `^14.2.0` |
| UI | React | `^18.3.0` |
| Lenguaje | TypeScript (strict, según `CLAUDE.md`) | `^5` |
| Estilos | Tailwind CSS + shadcn/ui (Radix primitives) | Tailwind `^3.4.1` |
| Formularios | React Hook Form + Zod | RHF `^7.49.3`, Zod `^3.22.4` |
| Gráficos | Recharts | `^2.10.3` |
| Base de datos / Auth | Supabase (PostgreSQL con RLS) | `@supabase/supabase-js ^2.39.0`, `@supabase/ssr ^0.1.0` |
| IA (extracción de facturas + chat/insights) | Anthropic SDK (Claude) | `@anthropic-ai/sdk ^0.96.0` |
| Integración documental | Microsoft Graph API (OneDrive, client-credentials) | sin SDK — `fetch` directo (`src/lib/graph/client.ts`) |
| Hosting / CI | Vercel (deploy + Cron Jobs) + GitHub Actions (lint+build) | `vercel.json`, `.github/workflows/ci.yml` |
| Cliente Postgres directo (solo scripts locales) | `pg` | `^8.20.0` (devDependency, usado por `scripts/apply-database.ts`) |
| Excel | `xlsx` | `^0.18.5` (carga masiva / `scripts/load-history.mjs`) |

No hay test runner (`CLAUDE.md` lo confirma explícitamente: "No test runner"). CI solo corre `lint` + `build`, sin validación funcional automatizada — la QA es manual por rol (confirmado en `PRD.md` §1, "Alcance actual").

**Nota de brecha de documentación:** `PRD.md` y `ROLES_AND_FLOWS.md` (ambos fechados 2026-05-01, ambos con encabezado "Última actualización: 2026-05-01") describen el sistema en un estado anterior al actual — ver hallazgos §7.

---

## 2. Estructura y módulos

```
aeromanto/
├── src/
│   ├── app/
│   │   ├── (dashboard)/            # Layout protegido con sidebar por rol
│   │   │   ├── admin/              # Gestión de usuarios (solo ADMIN)
│   │   │   ├── ai-chat/            # Chat con Claude sobre datos de flota
│   │   │   ├── ai-insights/        # Panel de insights generados por IA
│   │   │   ├── capacitaciones/     # Módulo de capacitaciones (rol COORDINACION)
│   │   │   ├── combustible/        # Consumo de combustible / km-galón
│   │   │   ├── configuracion/      # CRUD vehículos, centros, proveedores, carga masiva
│   │   │   ├── consumo/            # Vista de consumo (lectura, rol GERENCIAL)
│   │   │   ├── coordinacion/       # Vista operativa para rol COORDINACION
│   │   │   ├── invoices/           # Revisión de facturas extraídas por IA
│   │   │   ├── kpis/               # Panel ejecutivo de métricas
│   │   │   ├── mantenimientos/     # Alta/listado de mantenimientos
│   │   │   ├── novedades/          # Incidentes/novedades de vehículos
│   │   │   ├── ovem/               # Portal móvil del conductor (checklist, km, novedades)
│   │   │   ├── regulacion/         # Despacho: disponibilidad + asignación OVEM↔vehículo
│   │   │   └── vehiculos/          # CRUD y detalle de vehículos
│   │   ├── api/
│   │   │   ├── actions/            # Server Actions (mutaciones validadas con Zod)
│   │   │   ├── ai/                 # Endpoints de chat/insights (Claude)
│   │   │   ├── cron/               # Jobs de Vercel Cron (ver §5)
│   │   │   └── webhooks/           # Webhook entrante de OneDrive (ver §5)
│   │   ├── login/                  # Público
│   │   └── pending/                # Usuario autenticado sin rol asignado
│   ├── components/                 # Un directorio por dominio + `ui/` (shadcn base)
│   ├── lib/
│   │   ├── graph/                  # Cliente Microsoft Graph (OneDrive)
│   │   ├── invoice/                # Extractor de facturas vía Claude
│   │   └── supabase/               # Factories de cliente (browser/server/admin)
│   └── types/                      # Tipos compartidos + `database.types.ts` (generado)
├── scripts/
│   ├── schema.sql                  # Esquema base (idempotente)
│   ├── migrations/                 # 35 migraciones numeradas (ver §4)
│   ├── apply-database.ts           # Aplica schema+migraciones (npm run db:apply)
│   ├── load-history.mjs            # Carga histórica Excel → BD (mantenimientos/combustible)
│   ├── register-onedrive-webhook.ts
│   ├── seed-categorias.ts
│   └── create-test-users.ts / set-auth-passwords.ts / verify-user-profiles.ts / check-tables.ts
├── docs/                           # (no auditado línea a línea; ver README para índice)
├── PRD.md                          # Requisitos funcionales — desactualizado, ver §7
├── ROLES_AND_FLOWS.md              # RBAC/RLS "fuente de verdad" — desactualizado, ver §7
├── CLAUDE.md                       # Guía operativa para agentes — más reciente y precisa
├── vercel.json                     # Config de Cron Jobs
└── .github/workflows/ci.yml        # Lint + build
```

**Módulos funcionales (nombrable sin reabrir código):**

| Módulo | Qué hace | Rol(es) principal(es) |
|---|---|---|
| Dashboard | Resumen ejecutivo, costos por vehículo, disponibilidad, alertas | Admin, Gerencial |
| Vehículos | CRUD, ficha técnica, filtros, historial | Admin (CRUD), Gerencial/Regulación (lectura) |
| Mantenimientos | Alta/listado por categoría y proveedor, cierre de novedades asociadas | Admin |
| Novedades (incidentes) | Reporte de fallas, severidad, estado, cierre ligado a mantenimiento | Regulación, OVEM (crear), Admin |
| KPIs | Métricas y gráficos ejecutivos (Recharts) | Admin, Gerencial |
| Consumo / combustible | Registro de tanqueos, cálculo km/galón | OVEM (registra), Admin/Gerencial (lectura) |
| Regulación | Disponibilidad de flota, asignación OVEM↔vehículo | Regulación, Admin |
| Portal OVEM | Checklist diario, kilometraje, novedades, combustible — mobile-first | OVEM |
| Configuración | Vehículos, centros operativos, proveedores, carga masiva Excel/CSV | Admin |
| Admin de usuarios | Alta de usuarios, asignación de rol/centro | Admin |
| Capacitaciones | Gestión de capacitaciones del personal (agregado tras el PRD) | Coordinación, Admin |
| Facturas (invoices) | Cola de revisión de facturas extraídas automáticamente por IA | Admin, Mantenimiento |
| AI Chat / AI Insights | Chat y panel de insights sobre datos de flota vía Claude | Según RLS — no documentado en PRD/ROLES |
| Coordinación | Vista operativa de solo lectura (flota, OVEM, novedades, plan preventivo) | Coordinación |

---

## 3. Dependencias (completo)

### `package.json` — dependencies

```json
{
  "@anthropic-ai/sdk": "^0.96.0",
  "@hookform/resolvers": "^3.3.4",
  "@radix-ui/react-alert-dialog": "^1.1.15",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-radio-group": "^1.3.8",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-tooltip": "^1.2.8",
  "@supabase/ssr": "^0.1.0",
  "@supabase/supabase-js": "^2.39.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "cmdk": "^1.1.1",
  "date-fns": "^3.0.0",
  "lucide-react": "^0.344.0",
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-hook-form": "^7.49.3",
  "recharts": "^2.10.3",
  "tailwind-merge": "^2.2.0",
  "xlsx": "^0.18.5",
  "zod": "^3.22.4"
}
```

### `package.json` — devDependencies

```json
{
  "@types/node": "^20",
  "@types/pg": "^8.20.0",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "autoprefixer": "^10.0.1",
  "eslint": "^8",
  "eslint-config-next": "^14.2.0",
  "pg": "^8.20.0",
  "postcss": "^8",
  "tailwindcss": "^3.4.1",
  "tailwindcss-animate": "^1.0.7",
  "tsx": "^4.7.0",
  "typescript": "^5"
}
```

### Observaciones sobre dependencias

- **`@supabase/ssr ^0.1.0`** es una versión temprana (la librería llegó a 1.x); no es un riesgo de seguridad conocido, pero vale la pena revisar el changelog antes de actualizar Supabase Auth helpers.
- **`xlsx ^0.18.5` (SheetJS)** — la distribución de npm de `xlsx` dejó de recibir parches de seguridad en el registro público tras vulnerabilidades conocidas (ReDoS / prototype pollution en versiones anteriores a 0.19.3 vía CVE reportados); SheetJS movió su distribución oficial fuera de npm. Vale la pena confirmar la versión exacta instalada contra los avisos de GitHub Advisory (`GHSA-4r6h-8v6p-xvw6` y relacionados) antes de exponer la carga de Excel a archivos no confiables.
- **`eslint ^8`** — ESLint 8 ya no recibe soporte activo (ESLint 9 es la rama mantenida); no es bloqueante pero es deuda técnica menor.
- Todo lo demás (Next 14, React 18, Radix, Zod, RHF, Recharts, date-fns) está en versiones razonablemente recientes y mantenidas activamente.
- **Sin `composer.json`** — no aplica (proyecto Node puro).
- **Dependencia de IA no trivial:** `@anthropic-ai/sdk` está en el path crítico de un flujo de negocio real (extracción de facturas, cron diario), no es solo un experimento — ver §5.

---

## 4. Esquema de datos / migraciones

**Mecanismo:** `scripts/schema.sql` (base idempotente) + 35 migraciones numeradas en `scripts/migrations/`, aplicadas con `npm run db:apply` (`scripts/apply-database.ts`, usa `pg` directo contra la cadena de conexión de Supabase). Las migraciones son idempotentes (`CREATE TABLE IF NOT EXISTS`, bloques `DO $$ ... EXCEPTION WHEN duplicate_object$$`) y nunca se modifican una vez aplicadas — solo se agregan nuevas (regla explícita en `CLAUDE.md`). Última aplicada: `034_corregir_historial_fds.sql`.

### Tablas base (`schema.sql`)

| Tabla | Propósito |
|---|---|
| `vehicles` | Maestro de flota — placa (única), modelo, línea, combustible, vencimientos SOAT/RTM, estado, centro operativo |
| `maintenance_categories` | Catálogo normalizado de categorías de mantenimiento |
| `maintenance_records` | Historial de mantenimientos por vehículo (costo, proveedor, factura, tiempo fuera de servicio) |
| `incidents` | Novedades/incidentes — severidad, estado, cierre opcional ligado a un mantenimiento |
| `mileage_logs` | Lecturas de kilometraje (trigger que impide bajar el km salvo excepción de rol) |
| `maintenance_schedule` | Plantilla de tareas de mantenimiento preventivo (por km y/o por meses) |

### Migraciones relevantes (no exhaustivo, 35 en total)

| # | Qué agrega |
|---|---|
| 002 | Iteración 2 del esquema (detalle no releído línea a línea) |
| 003 | RBAC — tabla `roles`, `user_profiles`, roles iniciales ADMIN/GERENCIAL/REGULACION/OVEM |
| 004 (`rls_roles`) | RLS granular por rol y tabla; agrega `operational_center_id`, `get_user_center()` |
| 004 (`reserved_rls`) | Placeholder de RLS previo a políticas revisadas |
| 005 | Checklist de ítems para `daily_checks` |
| 006 | Rol **MANTENIMIENTO** + políticas de flota/OVEM |
| 007–011 | Ajustes de checklist, vencimientos, historial de estado de vehículo, campos de proveedores |
| 012 | Plan de mantenimiento preventivo configurable |
| 013 (`coordinacion_capacitaciones`) | Módulo de capacitaciones + rol **COORDINACION** |
| 013 (`coordinacion_role_access`) | Rol COORDINACION (duplicado/paralelo — ver hallazgo §7) + RLS de solo lectura para Coordinación en 10 tablas |
| 015–018 | Vencimientos SOAT/tecnomecánica, historial de mantenimientos y combustible (carga masiva histórica — estas dos migraciones concentran >12.000 líneas de `INSERT` de datos históricos), vehículo nuevo (Kia Picanto Bogotá) |
| 019 | Hardening de seguridad y performance en RLS (agrega acceso `MANTENIMIENTO` a más tablas) |
| 020–022 | Vehículo de referencia, reset manual de `fuel_logs`, specs de vehículo obligatorias |
| **023** | **`normalize_placas`** — normaliza formato de placa (sin espacios, mayúsculas) y elimina duplicados lógicos (ver hallazgo crítico de datos, ya corregido) |
| 024 | Log de uso de IA (`ai_usage_log`) + `maintenance_valor_review` |
| 025 | **`invoice_jobs`** — cola de trabajos de extracción de facturas por IA |
| 026–028 | Limpieza de registros de mantenimiento, seed de debug TCO, costos fijos reales |
| 029 | RLS sobre `schema_migrations` |
| 030–034 | Campo `numero_venta` en combustible, vehículos nuevos, histórico RTM, corrección de historial de fuera-de-servicio |

### Roles reales (tabla `roles`, confirmado por grep de migraciones — no por consulta a BD, PHP CLI no disponible)

`ADMIN`, `GERENCIAL`, `REGULACION`, `OVEM` (migración 003/004) + `MANTENIMIENTO` (migración 006) + `COORDINACION` (migración 013) = **6 roles**, coincide con `CLAUDE.md` pero **no** con `ROLES_AND_FLOWS.md` (ver §7).

### Vehículos / placas — detalle relevante para la Fase 2

- `vehicles.placa VARCHAR(10) UNIQUE NOT NULL` — restricción de unicidad a nivel de BD.
- Formato canónico: **mayúsculas, sin espacios** (ej. `TRG542`), forzado por la migración 023 tras detectar placas cargadas con espacios (`"TRG 542"`) que rompían JOINs silenciosamente, y un duplicado lógico real (`OKL227` / `OKL 227`).
- El flujo de extracción de facturas por IA (§5) normaliza la placa detectada con `.toUpperCase().replace(/\s/g, "")` antes de buscarla — coherente con la migración 023.
- Escala: 31-50 vehículos según `ROLES_AND_FLOWS.md` §9 (no re-verificado contra BD real por falta de acceso CLI).

---

## 5. Integraciones externas

| Integración | Archivos clave | Qué hace | Criticidad operativa | Atada al entorno actual (Vercel) |
|---|---|---|---|---|
| **Supabase** | `src/lib/supabase/*` | BD, Auth, RLS — es el backend completo de la app | Crítica (sin esto no hay app) | No — Supabase es independiente del hosting del frontend |
| **Anthropic (Claude)** | `src/lib/invoice/extractor.ts`, `src/app/api/ai/chat`, `src/app/api/ai/insights`, `src/components/ai/*` | (a) Extrae placa/fecha/proveedor/valor/tipo de trabajo de facturas PDF/imagen subidas a OneDrive; (b) chat conversacional sobre datos de flota; (c) panel de insights generado por IA | Alta para el flujo de facturación (automatiza carga de `maintenance_records`); media para chat/insights (asistencia, no bloqueante) | No directamente — es una API HTTP externa, portable a cualquier runtime que pueda hacer `fetch`/usar el SDK Node |
| **Microsoft Graph API (OneDrive)** | `src/lib/graph/client.ts`, `src/app/api/webhooks/onedrive/route.ts`, `src/app/api/cron/renew-webhook/route.ts` | OAuth client-credentials contra Azure AD; lista/descarga/mueve/renombra archivos en el OneDrive de un usuario específico (`ONEDRIVE_USER`); mantiene una suscripción de webhook que **expira cada ~2.9 días** y debe renovarse | Alta — es la entrada del flujo de facturación (Luzmary sube facturas a una carpeta de OneDrive) | **Sí, parcialmente** — el webhook de Graph necesita una URL pública HTTPS estable (`NEXT_PUBLIC_APP_URL`) y un cron que renueve la suscripción antes de que expire; ambos hoy dependen de Vercel Cron |
| **Vercel Cron Jobs** | `vercel.json` (`/api/cron/process-invoices` diario 08:00, `/api/cron/renew-webhook` diario 08:00) | Procesa lote de hasta 5 facturas pendientes por corrida; renueva la suscripción de webhook de OneDrive | Alta — sin el cron de renovación, el webhook de OneDrive deja de recibir notificaciones en ~3 días | **Sí, fuertemente** — es infraestructura serverless específica de Vercel (`maxDuration`, cron nativo). Migrar a otro hosting (incl. hosting compartido tipo HostGator) requiere reemplazar esto por un cron de sistema (`cPanel cron` + script PHP/Node, o un worker separado) |
| **GitHub Actions** | `.github/workflows/ci.yml` | Lint + build en cada push/PR a main/master | Media (calidad, no producción) | No |

**Nota de riesgo (relevante para Fase 3):** el pipeline de facturación (OneDrive → Claude → Supabase) es la única lógica de negocio "no trivial" de integración en Aeromanto, y depende de tres piezas atadas a runtimes serverless modernos (Vercel Cron con `maxDuration`, webhooks HTTPS entrantes, Azure AD app registration). Portar esto a un entorno de hosting compartido tradicional (como el de SISRES en HostGator) es factible pero no trivial — requeriría un mecanismo de cron distinto y probablemente reescribir el cliente Graph y el extractor en PHP, perdiendo el SDK oficial de Anthropic para Node.

---

## 6. Evidencia de hosting/deploy actual

- **`vercel.json`** — declara 2 Cron Jobs; confirma despliegue en Vercel.
- **`.env.local.example`** — `NEXT_PUBLIC_APP_URL=https://aeromanto.vercel.app` (dominio de producción real).
- **`.github/workflows/ci.yml`** — CI en GitHub Actions, sin step de deploy (el deploy a Vercel es automático vía integración Git nativa de Vercel, no vía Action).
- **Sin Dockerfile, sin docker-compose** — no hay containerización; el proyecto asume el modelo serverless de Vercel (Server Actions, Route Handlers, Cron nativo).
- **Base de datos gestionada:** Supabase (Postgres as a Service) — no hay instancia de BD auto-hospedada.
- **Variables de entorno de producción:** Supabase (URL, anon key, service role), Anthropic API key, Azure AD (tenant/client id/secret), rutas de carpetas OneDrive, `GRAPH_WEBHOOK_SECRET`, `CRON_SECRET` (inyectado automáticamente por Vercel en prod).

**Conclusión de hosting:** Aeromanto es **100% serverless / managed** (Vercel + Supabase + Anthropic + Microsoft Graph). No hay servidor propio que administrar, pero sí 4 proveedores externos con sus propias credenciales y límites de plan (ej. `maxDuration` de 60s en plan Hobby vs 300s en Pro, mencionado explícitamente en el código).

---

## 7. Complejidad y deuda técnica

### LOC (conteo manual, `node_modules`/`.next` excluidos — no se dispuso de `cloc` en el entorno)

| Tipo | Líneas | Notas |
|---|---|---|
| `.tsx` | ~15.371 | Componentes y páginas (App Router) |
| `.ts` | ~8.448 | Server Actions, lib, tipos, scripts |
| `.mjs` | ~1.063 | Scripts one-shot (`load-history.mjs`, `fix-maintenance-values.mjs`) |
| `.sql` (schema + migraciones) | ~16.667 | **~13.000 de estas líneas son datos** (migraciones 016/017 de carga histórica de mantenimientos/combustible), no lógica — el SQL de esquema/RLS real es de orden de 2.500-3.000 líneas |
| Archivos `.ts`/`.tsx` | 137 |

### Lógica de negocio no trivial (costosa de portar)

- **RLS granular por rol y tabla** (migración 004 + incrementales 006/013/019) — 6 roles × ~12 tablas con reglas distintas de SELECT/INSERT/UPDATE/DELETE, algunas con filtro por centro operativo o por usuario propio. Esto es lógica de autorización real, no CRUD — portarla a otro modelo de seguridad (ej. el esquema de permisos dinámicos de SISRES, basado en tabla `permisos` + PHP) exige reproducir cada regla exactamente o arriesgar fugas de datos.
- **Pipeline de extracción de facturas por IA** (§5) — no es CRUD, es orquestación entre 3 sistemas externos con manejo de estados (`pending → processing → completed/needs_review/error`), reintentos implícitos y normalización de placa.
- **Reglas de mantenimiento preventivo por km O tiempo, con excepción por centro operativo (AIRPLAN siempre por tiempo)** — lógica de negocio específica del dominio, no genérica.
- **Trigger de BD `validar_kilometraje_incremental`** y `actualizar_estado_vehiculo_por_incidente` — reglas de integridad a nivel de Postgres, no replicables automáticamente en MySQL (sintaxis de triggers distinta).

### Código CRUD simple (rápido de migrar)

- Vehículos, proveedores, centros operativos, categorías de mantenimiento: CRUD estándar con formularios Zod + Server Actions — patrón repetitivo, portable mecánicamente.
- Dashboard/KPIs: consultas de agregación + Recharts — el patrón visual tiene equivalentes directos en Chart.js (que SISRES ya usa).

### Deuda técnica identificada

1. **Documentación desactualizada (hallazgo principal):** `PRD.md` y `ROLES_AND_FLOWS.md` están fechados 2026-05-01 y describen **4 roles** ("No existe SUPERADMIN — Admin tiene todos los privilegios"; sin mención de MANTENIMIENTO ni COORDINACION). El código real (migraciones 006, 013, 019 y `CLAUDE.md`, todas posteriores) tiene **6 roles** (ADMIN, GERENCIAL, REGULACION, OVEM, MANTENIMIENTO, COORDINACION) y módulos completos no descritos en el PRD (`ai-chat`, `ai-insights`, `invoices`, `capacitaciones`, `coordinacion`). Cualquier decisión de integración basada solo en `PRD.md`/`ROLES_AND_FLOWS.md` partiría de información obsoleta — `CLAUDE.md` es la fuente más confiable hoy.
2. **Dos migraciones con el mismo número (`013_coordinacion_capacitaciones.sql` y `013_coordinacion_role_access.sql`)** — ambas insertan el rol `COORDINACION` (`ON CONFLICT DO NOTHING`, así que no rompe), pero la duplicación de número de secuencia es una señal de que el flujo de migraciones no siempre se coordina entre sesiones/autores.
3. **`xlsx` (SheetJS) en versión con avisos de seguridad conocidos** — revisar antes de exponer la carga masiva a archivos de terceros no confiables.
4. **Dependencia fuerte en infraestructura serverless de un solo proveedor (Vercel)** para el pipeline de facturación — sin plan de contingencia documentado si cambia de hosting.
5. **Sin tests automatizados** (confirmado en `CLAUDE.md`) — toda la validación funcional es manual por rol; para un sistema con RLS granular de 6 roles esto es un riesgo de regresión no trivial.
6. **`ROLES_AND_FLOWS.md` §9 declara "31-50 vehículos"** como rango de escala — impreciso comparado con el conteo exacto que sí tiene SISRES (36 filas en `movil`, ver `AUDIT_sisres.md`), sugiere que Aeromanto no se ha verificado contra el conteo operativo real de la flota compartida.

No fue posible correr `npm run build`/`npm run lint` ni consultar Supabase en vivo durante esta auditoría (sin acceso de red/CLI en el entorno de auditoría) — todos los hallazgos de esquema y roles se basan en lectura estática de migraciones SQL, no en el estado real de la base de datos de producción.
