# Navegación unificada — arquitectura de información Aeromanto + SISRES

**Estado:** 🟡 propuesta de trabajo, no decidida. Sirve como punto de partida para que Daniel (y León) la ajusten — no es la versión final.
**Cuándo se ejecuta:** Fase 1 del plan (`PLAN_INTEGRACION_SISRES.md`), en paralelo con el mapeo de roles (§5/§7) — el menú final depende de qué roles terminen existiendo y qué ve cada uno, así que este documento y la resolución de RBAC avanzan juntos, no uno antes que el otro.

---

## 1. Inventario real de menús (sacado del código, no de documentación)

### Aeromanto hoy — 14 ítems, todos al mismo nivel (`src/app/(dashboard)/layout.tsx`, `ALL_NAV`)

| Ítem | Ruta | Roles que lo ven hoy |
|---|---|---|
| Dashboard | `/` | ADMIN, GERENCIAL, REGULACION, MANTENIMIENTO |
| Coordinación | `/coordinacion` | COORDINACION |
| Vehículos | `/vehiculos` | ADMIN, REGULACION, MANTENIMIENTO |
| Mantenimientos | `/mantenimientos` | ADMIN, MANTENIMIENTO |
| Novedades | `/novedades` | ADMIN, REGULACION, MANTENIMIENTO |
| KPIs | `/kpis` | ADMIN, GERENCIAL |
| Combustible | `/combustible` | ADMIN, GERENCIAL |
| **Regulación** | `/regulacion` | ADMIN, REGULACION |
| Portal OVEM | `/ovem` | ADMIN, OVEM |
| Capacitaciones | `/capacitaciones` | ADMIN, OVEM, COORDINACION |
| Configuración | `/configuracion` | ADMIN |
| Usuarios | `/admin/usuarios` | ADMIN |
| Chat IA | `/ai-chat` | ADMIN, GERENCIAL |
| AI Insights | `/ai-insights` | ADMIN, GERENCIAL, COORDINACION |

Este es el caso que mencionás como ejemplo: **"Regulación"** hoy es un ítem plano más, al mismo nivel que "Vehículos" o "KPIs" — pero conceptualmente es una *función* (despacho), no un *dominio* de datos.

### SISRES hoy — ya agrupado en submenús (`includes/sidebar.php`)

```
Servicios                              (top-level)
Pacientes                              (top-level)
Proveedores                            (top-level)
Clientes                               (top-level)
Flota ▾
  ├── Mostrar Vehículos
  ├── Pre-Operacional                  (se retira, ver PLAN_INTEGRACION_SISRES.md Fase 1)
  └── GPS
Inventario/Mantenimiento ▾
  ├── Mostrar Inventario
  ├── Ver Mantenimientos
  └── Registro de Mantenimientos
Valoraciones                           (top-level)
Usuarios/Sistema ▾
  ├── Mostrar Usuarios
  ├── Campañas WhatsApp
  ├── Log del Sistema
  ├── Permisos
  └── Configuración
```

(La "Dashboard de estadísticas" vive embebida en la home, no es un ítem de menú aparte. "Hoja de Vida de Equipos" es un drill-down desde Inventario, tampoco es ítem de menú.)

**Total real a reconciliar: 14 ítems planos de Aeromanto + ~19 ítems (algunos ya agrupados) de SISRES = si se suman tal cual, ~30 entradas de menú.** Ahí está el problema que señalás.

---

## 2. Propuesta — agrupar por dominio/función, no por sistema de origen

Criterio: un ítem de nivel 1 es un **dominio de trabajo** (algo que alguien hace todos los días), no una tabla de base de datos. Los submenús son las tareas específicas dentro de ese dominio.

| # | Menú principal | Submenús | Origen | Reemplaza / absorbe |
|---|---|---|---|---|
| 1 | **Inicio** | (adaptativo por rol, como ya es hoy) | Aeromanto | Dashboard actual + el equivalente de "resumen operativo" que SISRES muestra embebido en su home |
| 2 | **Operación** | Despacho de Servicios · Disponibilidad de Flota · Asignación de conductores | SISRES `servicios` + Aeromanto `/regulacion` | **Absorbe "Regulación"** (deja de ser top-level) — es el ejemplo exacto que diste. Un Regulador despacha vehículo y servicio médico en el mismo lugar, no en dos menús distintos |
| 3 | **Pacientes** | Registro · Valoraciones médicas | SISRES `paciente` + `valoraciones` | Absorbe "Valoraciones" (deja de ser top-level, pasa a submenú) |
| 4 | **Flota** | Vehículos · Mantenimientos · Novedades · Combustible · Seguimiento GPS | Aeromanto (`/vehiculos`, `/mantenimientos`, `/novedades`, `/combustible`) + SISRES (GPS) | Absorbe "GPS" de SISRES (deja de ser submenú de "Flota" en SISRES, pasa a submenú de "Flota" acá — incorporado, no perdido) |
| 5 | **Equipos Biomédicos** | Inventario · Mantenimiento Biomédico · Hoja de Vida (drill-down) | SISRES `inventario` + `mantenimiento` | Dominio nuevo para Aeromanto — **deliberadamente separado de "Flota"**, aunque ambos tengan "mantenimiento": son activos distintos (vehículo vs equipo médico) con roles y flujos distintos. Fusionarlos en un "Mantenimientos" genérico confundiría a MANTENIMIENTO (que hoy solo piensa en vehículos) |
| 6 | **Comunicaciones** | Campañas WhatsApp · Notificaciones automáticas | SISRES `campanas` | Dominio nuevo — hoy no existe nada parecido en Aeromanto |
| 7 | **Capacitaciones** | (igual que hoy) | Aeromanto | Sin cambios |
| 8 | **Reportes** | KPIs de Flota · Estadísticas de Servicios · AI Insights | Aeromanto `/kpis` + `/ai-insights` + SISRES dashboard de estadísticas | Unifica los 3 paneles ejecutivos que hoy están sueltos en 2-3 ítems distintos |
| 9 | **Coordinación** | (igual que hoy, o absorbe "visión operativa" de SISRES si aplica) | Aeromanto | Sin cambios mayores, a revisar con más detalle en la Fase 1 |
| 10 | **Configuración** | Vehículos · Centros/Sedes · Proveedores · Clientes · Carga masiva · Identidad de la app · Sesión | Aeromanto (ya existe) + SISRES (`proveedores`, `clientes`, `configuracionSistema.php`) | Absorbe "Proveedores" y "Clientes" de SISRES (dejan de ser top-level, pasan a ser catálogos dentro de Configuración — mismo patrón que Aeromanto ya usa hoy para sus propios proveedores) |
| 11 | **Administración** | Usuarios · Roles y Permisos · Log de auditoría | Aeromanto `/admin/usuarios` + SISRES (`adminPermisos.php`, `mostrarLog.php`) | Absorbe "Permisos" y "Log del Sistema" de SISRES |
| — | **Portal OVEM** | (se mantiene aparte, no es un menú de escritorio) | Aeromanto | Sigue siendo una experiencia mobile-first separada, no un ítem más del sidebar |

**Resultado: de ~30 entradas sumadas, quedan 11 menús principales** (+ el Portal OVEM aparte, que ya no cuenta como "menú" tradicional).

### Decisión abierta, no resuelta acá: **Chat IA**

Hoy es un ítem de sidebar más. Candidato a convertirse en un widget flotante/persistente (accesible desde cualquier pantalla) en vez de una sección con su propia página — es más un "modo de interactuar con todo lo demás" que un dominio de datos propio. Lo dejo como pregunta abierta para vos, no lo decidí en la tabla de arriba.

---

## 3. RBAC — quién ve cada menú principal (borrador, pendiente de Q1)

Esto **no se puede cerrar del todo** hasta que confirmes el cruce de cédulas de `RBAC_INTEGRACION.md` §1.1 (si Regulación/Coordinación/OVEM son las mismas personas en los dos sistemas). Con esa salvedad, un borrador razonable:

| Menú principal | Roles (borrador) |
|---|---|
| Inicio | Todos (contenido adaptado por rol) |
| Operación | ADMIN, REGULACION |
| Pacientes | ADMIN, REGULACION, MEDICO*, AUXILIAR_ENFERMERIA*, ANALISTA* |
| Flota | ADMIN, REGULACION, MANTENIMIENTO |
| Equipos Biomédicos | ADMIN, MANTENIMIENTO |
| Comunicaciones | ADMIN, COORDINACION |
| Capacitaciones | ADMIN, OVEM, COORDINACION *(sin cambios)* |
| Reportes | ADMIN, GERENCIAL, COORDINACION |
| Coordinación | COORDINACION *(sin cambios)* |
| Configuración | ADMIN |
| Administración | ADMIN |
| Portal OVEM | OVEM |

`*` = roles nuevos que todavía no existen en Aeromanto (`ANALISTA`, `MEDICO`, `AUXILIAR_ENFERMERIA`, `VISTA` — ver `RBAC_INTEGRACION.md` §2).

---

## 4. Qué falta para cerrar esto (próximos pasos, en orden)

1. **Vos revisás esta propuesta** — decís qué grupos tienen sentido, cuáles no, y si hay algo que falta o sobra.
2. Se cierra la Pregunta 1 de roles (`RBAC_INTEGRACION.md` §1.1) — sin eso, la columna de roles de la tabla del punto 3 sigue siendo un borrador.
3. Con ambas cosas resueltas, esto se convierte en el nuevo `ALL_NAV` de `src/app/(dashboard)/layout.tsx` — trabajo de código real, parte de `feature/sisres-roles-permisos` (Fase 1).
4. La decisión de Chat IA (widget vs. sección) se resuelve aparte, no bloquea el resto.

Este documento vive en la Fase 1 del plan — no es una tarea de UX/UI "profunda" aparte (esa la dejamos para más adelante, según lo hablado), es la arquitectura de información mínima necesaria antes de empezar a portar módulos, para no construir sobre una estructura de menú que ya sabemos que hay que rehacer.
