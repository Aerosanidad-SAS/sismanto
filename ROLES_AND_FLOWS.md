# ROLES_AND_FLOWS.md — Aeromanto

**Última actualización:** 2026-05-01  
**Propósito:** Fuente de verdad para permisos, políticas RLS, navegación UI, y reglas de negocio. Este documento gobierna lo que Vault implementa en RLS y lo que Forge implementa en Server Actions y UI.

---

## 1. Roles del sistema

Hay 4 roles. No existe SUPERADMIN — Admin tiene todos los privilegios.

| Rol | Propósito | Alcance de datos | Dispositivo típico |
|-----|-----------|------------------|-------------------|
| **Admin** | Administración completa | Todos los datos, todos los centros | Desktop |
| **Gerencial** | Supervisión ejecutiva y financiera | Lectura de todos los datos, todos los centros | Desktop |
| **Regulación** | Despacho y operaciones de flota | Todos los vehículos; escribe en asignaciones, estado de vehículo, y novedades | Desktop |
| **OVEM** | Operador de vehículo en campo | Vehículos de su centro operativo | Celular (mobile-first) |

### Creación de usuarios
- Solo Admin puede crear cuentas (invitación). No hay registro abierto.
- Solo Admin puede ver la lista completa de usuarios y roles.
- Un usuario autenticado sin rol va a `/pending` hasta que Admin le asigne rol.

---

## 2. Centros operativos

- Aerosanidad tiene 3-5 centros operativos.
- **AIRPLAN** es el único centro con reglas especiales: documentos adicionales (Pase Aeroportuario) y mantenimientos preventivos siempre por tiempo (no por km).
- Un OVEM pertenece a un solo centro operativo.
- Admin y Gerencial son globales — ven todos los centros.
- Regulación ve todos los centros.

---

## 3. Permisos por rol

### Admin

**Rutas:** `/dashboard`, `/vehiculos`, `/mantenimientos`, `/novedades`, `/kpis`, `/consumo`, `/regulacion`, `/configuracion`, `/admin/usuarios`

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| vehicles | ✅ todos | ✅ | ✅ | ✅ (soft delete) |
| maintenance_records | ✅ todos | ✅ | ✅ | ✅ |
| incidents | ✅ todos | ✅ | ✅ | ✅ |
| fuel_logs | ✅ todos | ✅ | ✅ | ✅ |
| mileage_logs | ✅ todos | ✅ | ✅ (incluye corrección de km) | ❌ |
| operational_centers | ✅ todos | ✅ | ✅ | ✅ |
| suppliers | ✅ todos | ✅ | ✅ | ✅ |
| maintenance_categories | ✅ todos | ✅ | ✅ | ❌ |
| user_profiles | ✅ todos | ✅ | ✅ | ❌ |
| roles | ✅ todos | ❌ | ❌ | ❌ |
| vehicle_assignments | ✅ todos | ✅ | ✅ | ✅ |
| daily_checks | ✅ todos | ❌ | ❌ | ❌ |

**UI:** Ve todos los módulos en sidebar. Ve costos y datos financieros. Puede crear/editar/eliminar en todos los módulos. Gestiona usuarios y configuración.

### Gerencial

**Rutas:** `/dashboard`, `/vehiculos` (lectura), `/mantenimientos` (lectura), `/novedades` (lectura), `/kpis`, `/consumo` (lectura)

**NO accede a:** `/regulacion`, `/configuracion`, `/admin/usuarios`, `/portal`

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| vehicles | ✅ todos | ❌ | ❌ | ❌ |
| maintenance_records | ✅ todos | ❌ | ❌ | ❌ |
| incidents | ✅ todos | ❌ | ❌ | ❌ |
| fuel_logs | ✅ todos | ❌ | ❌ | ❌ |
| mileage_logs | ✅ todos | ❌ | ❌ | ❌ |
| operational_centers | ✅ todos | ❌ | ❌ | ❌ |
| suppliers | ✅ todos | ❌ | ❌ | ❌ |
| maintenance_categories | ✅ todos | ❌ | ❌ | ❌ |
| user_profiles | ✅ propio | ❌ | ❌ | ❌ |
| roles | ✅ todos | ❌ | ❌ | ❌ |
| vehicle_assignments | ✅ todos | ❌ | ❌ | ❌ |
| daily_checks | ✅ todos | ❌ | ❌ | ❌ |

**UI:** No ve botones de crear/editar/eliminar. Ve costos y datos financieros. Dashboard y KPIs son su vista principal.

### Regulación

**Rutas:** `/regulacion` (home), `/vehiculos` (lectura), `/novedades` (crear + leer)

**NO accede a:** `/dashboard`, `/mantenimientos`, `/kpis`, `/consumo`, `/configuracion`, `/admin/usuarios`, `/portal`

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| vehicles | ✅ todos | ❌ | ✅ solo campo estado | ❌ |
| maintenance_records | ✅ todos | ❌ | ❌ | ❌ |
| incidents | ✅ todos | ✅ | ✅ | ❌ |
| fuel_logs | ❌ | ❌ | ❌ | ❌ |
| mileage_logs | ✅ todos | ❌ | ❌ | ❌ |
| operational_centers | ✅ todos | ❌ | ❌ | ❌ |
| suppliers | ❌ | ❌ | ❌ | ❌ |
| maintenance_categories | ✅ todos | ❌ | ❌ | ❌ |
| user_profiles | ✅ todos (necesario para asignar OVEMs) | ❌ | ❌ | ❌ |
| roles | ✅ todos | ❌ | ❌ | ❌ |
| vehicle_assignments | ✅ todos | ✅ | ✅ | ✅ |
| daily_checks | ✅ todos | ❌ | ❌ | ❌ |

**UI:** Tabla de flota con toggle Disponible/Mantenimiento/Fuera de Servicio. Panel de asignación OVEM ↔ vehículo. Puede crear novedades. No ve costos.

### OVEM

**Rutas:** `/portal` (única ruta, mobile-first)

**NO accede a:** Ninguna otra ruta. Redirige a `/portal`.

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| vehicles | ✅ su centro operativo | ❌ | ❌ | ❌ |
| maintenance_records | ❌ | ❌ | ❌ | ❌ |
| incidents | ✅ su centro operativo | ✅ vehículos de su centro | ❌ | ❌ |
| fuel_logs | ❌ | ✅ vehículos asignados | ❌ | ❌ |
| mileage_logs | ✅ propios | ✅ vehículos asignados | ❌ | ❌ |
| operational_centers | ✅ propio | ❌ | ❌ | ❌ |
| suppliers | ❌ | ❌ | ❌ | ❌ |
| maintenance_categories | ❌ | ❌ | ❌ | ❌ |
| user_profiles | ✅ propio | ❌ | ✅ propio | ❌ |
| roles | ✅ propio | ❌ | ❌ | ❌ |
| vehicle_assignments | ✅ propias | ❌ | ❌ | ❌ |
| daily_checks | ✅ propios | ✅ vehículos asignados | ✅ propios del día | ❌ |

**UI:** Portal mobile-first con tabs: Checklist Diario, Kilometraje, Novedades, Combustible. Puede crear novedades para cualquier vehículo de su centro operativo (no solo asignados). Registra combustible al momento del tanqueo en vehículos asignados.

---

## 4. Reglas de negocio

### Kilometraje
- El odómetro siempre es incremental en operación normal.
- Solo Admin puede corregir (bajar) un registro de km. El Server Action debe validar esto por rol.

### Estados de vehículo
- Tres estados: `DISPONIBLE`, `MANTENIMIENTO`, `FUERA_DE_SERVICIO`.
- Cualquier transición es válida entre ellos.
- Regulación y Admin pueden cambiar el estado.

### Mantenimientos
- Solo Admin crea y edita registros de mantenimiento.
- Gerencial solo lee.
- Al crear un mantenimiento, el usuario selecciona manualmente qué novedades cerrar (no es automático).
- Mantenimientos preventivos se programan por km O por tiempo, lo que ocurra primero.
- Excepción: vehículos de AIRPLAN siempre se programan por tiempo.

### Asignación OVEM ↔ Vehículo
- Relación muchos-a-muchos dinámica (tabla `vehicle_assignments`).
- Un OVEM se asigna según operación y disponibilidad.
- Un vehículo puede tener varios OVEMs (turnos).
- Regulación gestiona las asignaciones.

### Documentos con vencimiento
- **Todos los vehículos:** SOAT, RTM, Seguro.
- **Solo vehículos AIRPLAN:** Pase Aeroportuario (adicional a los anteriores).
- Anticipación de alerta configurable por Admin.

### Checklist diario
- OVEM completa checklist pre-operacional para vehículos asignados.
- Futuro (F-19): alert engine que cambia estado del vehículo automáticamente según fallas críticas (ej: exceso de humo, falta de refrigerante, fallas que si se opera generan daño mayor).

### Combustible
- OVEM registra cada tanqueada desde el portal (celular) en vehículos asignados.
- Se calcula km/galón automáticamente.
- Datos también disponibles en plataforma del proveedor.

---

## 5. Notificaciones (F-15)

- **Canal:** Email + notificación in-app (banner/badge).
- **Destinatarios:** Admin + correos adicionales que Admin configure (no atados a roles del sistema).
- **Anticipación:** Configurable por Admin (días antes del vencimiento).
- **Requiere:** tabla de configuración de notificaciones, servicio de email, componente in-app de alertas.

---

## 6. Navegación y redirecciones

### Sidebar por rol

| Ruta | Admin | Gerencial | Regulación | OVEM |
|------|-------|-----------|------------|------|
| Dashboard | ✅ | ✅ | ❌ | ❌ |
| Vehículos | ✅ CRUD | ✅ lectura | ✅ lectura | ❌ |
| Mantenimientos | ✅ CRUD | ✅ lectura | ❌ | ❌ |
| Novedades | ✅ CRUD | ✅ lectura | ✅ crear+leer | ❌ |
| KPIs | ✅ | ✅ | ❌ | ❌ |
| Consumo | ✅ CRUD | ✅ lectura | ❌ | ❌ |
| Regulación | ✅ | ❌ | ✅ | ❌ |
| Configuración | ✅ | ❌ | ❌ | ❌ |
| Admin Usuarios | ✅ | ❌ | ❌ | ❌ |
| Portal OVEM | ❌ | ❌ | ❌ | ✅ |

### Redirección post-login

| Rol | Redirige a |
|-----|-----------|
| Admin | `/dashboard` |
| Gerencial | `/dashboard` |
| Regulación | `/regulacion` |
| OVEM | `/portal` |
| Sin rol | `/pending` |

---

## 7. Filtrado de datos por centro operativo (para RLS de OVEM)

1. `user_profiles` debe tener campo `operational_center_id` (FK a `operational_centers`).
2. Para `vehicles`: OVEM ve vehículos donde `vehicles.operational_center_id = user_profile.operational_center_id`.
3. Para `incidents`: OVEM puede crear novedades en vehículos de su centro (JOIN vehicles → center match).
4. Para `daily_checks` y `mileage_logs`: filtro por `user_id = auth.uid()` (solo propios).
5. Para `fuel_logs`: OVEM inserta solo en vehículos asignados (JOIN vehicle_assignments).

**Nota para Vault:** verificar si `user_profiles` ya tiene `operational_center_id`. Si no, agregarlo en migración 004.

---

## 8. Idioma y UI

- Toda la interfaz de usuario en español.
- Código y variables en inglés.
- Modo oscuro: no es prioridad, se puede agregar después.
- Portal OVEM: debe ser mobile-first (responsive design prioritario).

---

## 9. Escala actual

- 31-50 vehículos en la flota.
- 16-30 usuarios del sistema.
- 3-5 centros operativos.
- Supabase Free tier suficiente para esta escala.

---

## 10. Backlog actualizado (incluye features nuevas de esta sesión)

| ID | Feature | Prioridad | Notas |
|----|---------|-----------|-------|
| F-15 | Notificaciones de vencimientos | Alta | Email + in-app, destinatarios configurables, anticipación configurable |
| F-16 | Exportación de reportes | Media | Excel primero. Mantenimientos y costos por placa seleccionada. Dashboard es más prioritario que exportar. |
| F-17 | Programa de mantenimiento configurable | Alta | Por km O tiempo. AIRPLAN siempre por tiempo. |
| F-18 | Alertas por kilometraje | Alta | Acoplado a F-17 |
| F-19 | Alert engine de checklist | Media | Fallas críticas cambian estado del vehículo automáticamente. Requiere definir qué items son críticos. |
| F-20 | Rentabilidad por vehículo (B/C) | Media | Ingresos por servicios vs costos (SOAT + RTM + póliza + combustible + mantenimientos). Requiere tabla de ingresos por vehículo/mes. |
