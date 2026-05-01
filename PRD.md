# PRD — Product Requirement Document

**Producto:** Aeromanto (gestión de flota de ambulancias)  
**Versión del documento:** 1.0  
**Última actualización:** 2026-05-01

Este documento registra **qué debe poder hacer el sistema**, el **estado** de cada requisito y un **log de avance** cuando se van cerrando objetivos. Debe actualizarse al entregar funcionalidades o cambiar prioridades.

---

## 1. Visión y alcance

### Visión

Ofrecer una aplicación web única para **operaciones y gestión** de una flota de ambulancias: mantenimientos preventivos y correctivos, seguimiento de novedades/incidentes, combustible y kilometraje, métricas ejecutivas y cumplimiento operativo, con acceso diferenciado por rol (conductores OVEM, regulación, gerencia, administración).

### Alcance actual

- Aplicación **Next.js 14** con datos en **Supabase** (PostgreSQL, Auth, RLS).
- **CI** en GitHub Actions: `lint` + `build` (`.github/workflows/ci.yml`); **sin** E2E automatizado — la validación funcional en producción sigue siendo **manual** por rol.

### Fuera de alcance explícito (por ahora)

- Notificaciones push/email de vencimientos (backlog).
- Exportación masiva de reportes PDF/Excel desde la UI (backlog), distinta de la carga masiva ya existente.

---

## 2. Requisitos funcionales

Leyenda de estado: **Hecho** | **En progreso** | **Pendiente**

| ID | Módulo / capacidad | Criterio de aceptación (resumen) | Estado |
|----|--------------------|----------------------------------|--------|
| F-01 | Autenticación | Usuario inicia sesión con Supabase Auth; sesión refrescada vía middleware | Hecho |
| F-02 | RBAC y navegación | Menú y rutas visibles según rol (OVEM, Admin, Regulación, Gerencial); redirecciones coherentes (p. ej. OVEM → portal) | Hecho |
| F-03 | Usuario sin rol | Usuario autenticado sin perfil válido accede a flujo `/pending` | Hecho |
| F-04 | Dashboard ejecutivo | Resumen, costos por vehículo, disponibilidad, novedades, alertas de documentos y mantenimientos | Hecho |
| F-05 | Vehículos | CRUD/listado/detalle, perfil técnico, filtros; historial mantenimientos y novedades en detalle | Hecho |
| F-06 | Centros y proveedores | CRUD en configuración; proveedores asociados a mantenimientos | Hecho |
| F-07 | Mantenimientos | Alta/listado con categorías, proveedor, validación de km; cierre de novedades asociadas | Hecho |
| F-08 | Novedades / incidentes | Severidad, estados, métricas de resolución | Hecho |
| F-09 | KPIs | Panel con métricas y gráficos (Recharts) | Hecho |
| F-10 | Consumo combustible | Registro y visualización km/gal, km recorridos (`fuel_logs`) | Hecho |
| F-11 | Regulación | Vista de flota; disponible / fuera de servicio; asignación OVEM ↔ vehículo | Hecho |
| F-12 | Portal OVEM | Checklist diario, kilometraje, novedades en vehículos asignados | Hecho |
| F-13 | Configuración | Vehículos, centros, proveedores, carga masiva Excel/CSV | Hecho |
| F-14 | Admin usuarios | Crear usuarios, roles, activar/desactivar (según variables y políticas Supabase) | Hecho |
| F-15 | Notificaciones de vencimientos | Avisos proactivos (email/in-app) para SOAT, RTM u otros vencimientos configurados | Pendiente |
| F-16 | Exportación de reportes | Exportar vistas clave a PDF y/o Excel desde la aplicación | Pendiente |
| F-17 | Programa de mantenimiento | Plantilla/configuración de tareas recurrentes por km o tiempo, integrable con alertas | Pendiente |
| F-18 | Alertas por kilometraje | Avisos cuando un vehículo se acerca a umbral de mantenimiento por km | Pendiente |

---

## 3. Requisitos no funcionales

| ID | Requisito | Notas / objetivo |
|----|-----------|------------------|
| NF-01 | Seguridad de datos | Uso de RLS en Supabase; políticas revisables según evolución de roles |
| NF-02 | Rendimiento | Páginas usables en red corporativa típica; listados con filtros razonables |
| NF-03 | Mantenibilidad | TypeScript estricto; validación **Zod** en formularios y en Server Actions antes de persistir datos |
| NF-04 | Entorno | Node.js **≥ 20** (ver `package.json`); navegadores modernos (Chromium, Firefox, Safari recientes) |

---

## 4. Dependencias externas

| Dependencia | Uso |
|-------------|-----|
| Supabase | PostgreSQL, Auth, API anon; opcional service role para admin de usuarios |
| Variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente en navegador y servidor |
| `SUPABASE_SERVICE_ROLE_KEY` (opcional) | Operaciones administrativas de usuarios |
| Scripts SQL | `scripts/schema.sql` → `scripts/migrations/002_iteracion2.sql` → `scripts/migrations/003_rbac.sql` → `scripts/migrations/004_reserved_rls.sql` (placeholder RLS hasta políticas futuras revisadas); verificación rápida opcional `scripts/supabase-verify-smoke.sql` |
| Seed | `npx tsx scripts/seed-categorias.ts` para categorías de mantenimiento |

---

## 5. Registro de avance (changelog del PRD)

Registrar aquí cada hito relevante: fecha, objetivo, resultado breve, evidencia (commit, PR, nota).

| Fecha | Objetivo | Qué se hizo | Evidencia |
|-------|----------|-------------|-----------|
| 2026-05-01 | Camino hasta primer deploy | Guía en README (GitHub, Supabase verify, Vercel, checklist QA manual por rol); `004_reserved_rls.sql` placeholder; CI GitHub Actions; script SQL smoke RLS/perfiles | `README.md`, `scripts/migrations/004_reserved_rls.sql`, `.github/workflows/ci.yml` |
| 2026-03-27 | Formalizar requisitos y trazabilidad | Creación inicial del PRD con estado alineado al README y código | `PRD.md` v1.0 |
| 2026-03-27 | Documentación y verificación local | Enlace a `PRD.md` desde README; alineación de versión de Node (20+); `npm run dev` OK (`/login` 200, `/` redirige) | README, servidor en `http://localhost:3000` |
| 2026-03-27 | Nombre del producto y del paquete npm | Unificación a **Aeromanto** (`package.json`, UI, README, `INSTRUCCIONES_LOCAL.md`) | `aeromanto` en npm; título y encabezados en app |

---

## 6. Matriz de acceso UI (sidebar)

Fuente en código: `src/app/(dashboard)/layout.tsx` (`ALL_NAV`). **SUPERADMIN** ve las mismas entradas que **ADMIN** (filtro: ítems cuyo arreglo `roles` incluye `ADMIN`). El layout redirige en cliente a **OVEM** si intenta acceder a `/`, `/kpis` o `/consumo`; **GERENCIAL** queda limitado efectivamente a `/`, `/kpis`, `/consumo` y rutas bajo `/admin` si el menú las expusiera.

| Rol | Enlaces del menú lateral |
|-----|---------------------------|
| **OVEM** | Portal OVEM (`/ovem`) |
| **REGULACION** | Dashboard (`/`), Vehículos (`/vehiculos`), Novedades (`/novedades`), Regulación (`/regulacion`) |
| **GERENCIAL** | Dashboard (`/`), KPIs (`/kpis`), Consumo (`/consumo`) |
| **ADMIN** | Dashboard, Vehículos, Mantenimientos (`/mantenimientos`), Novedades, KPIs, Consumo, Regulación, Portal OVEM (`/ovem`), Configuración (`/configuracion`), Usuarios (`/admin/usuarios`) |
| **SUPERADMIN** | Igual que **ADMIN** en la práctica (mismo conjunto de ítems de menú que para Admin). |

---

## 7. Backlog explícito (priorizable)

1. Notificaciones de vencimientos (F-15).
2. Exportación de reportes PDF/Excel (F-16).
3. Programa de mantenimiento configurable (F-17).
4. Alertas de mantenimiento por kilometraje (F-18).

*Reordenar o añadir ítems según negocio; al completar uno, mover el estado en la tabla de la sección 2 y añadir fila en la sección 5.*
