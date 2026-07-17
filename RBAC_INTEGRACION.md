# RBAC — integración de roles SISRES → Aeromanto

**Estado:** 🔴 bloqueado en la pregunta 1 del prompt a León (`PLAN_INTEGRACION_SISRES.md` §7) — no se crea ninguna política RLS nueva ni se decide el mapeo final hasta tener esa respuesta. Este documento es el worksheet para cuando llegue, no una decisión ya tomada.

## 1. Punto de partida

| Aeromanto (6 roles, tabla `roles`) | SISRES (8 cargos) | ¿Misma persona real? |
|---|---|---|
| ADMIN | Administrador | Hipótesis: sí — pendiente confirmar |
| GERENCIAL | — (sin cargo equivalente) | N/A |
| REGULACION | Regulador/Despachador | Hipótesis: sí — pendiente confirmar |
| OVEM | OVEM | Hipótesis: sí — pendiente confirmar |
| MANTENIMIENTO | — (sin cargo equivalente) | N/A |
| COORDINACION | Coordinador | Hipótesis: sí — pendiente confirmar |
| — (sin rol equivalente) | Analista | Rol nuevo a crear: `ANALISTA` |
| — (sin rol equivalente) | Médico | Rol nuevo a crear: `MEDICO` |
| — (sin rol equivalente) | Auxiliar de Enfermería | Rol nuevo a crear: `AUXILIAR_ENFERMERIA` |
| — (sin rol equivalente) | Vista | Rol nuevo a crear: `VISTA` |

## 2. Las dos ramas posibles según la respuesta de León

**Si son la misma persona (hipótesis confirmada):**
- Las políticas RLS de las tablas nuevas (`patients`, `servicios`, `inventory_items`, etc.) se agregan sobre los códigos de rol que ya existen (`REGULACION`, `COORDINACION`, `OVEM`), igual que ya se hizo para `COORDINACION` en la migración `013_coordinacion_role_access.sql`.
- Solo se crean 4 roles nuevos: `ANALISTA`, `MEDICO`, `AUXILIAR_ENFERMERIA`, `VISTA`.
- El sidebar de un usuario "REGULACION", por ejemplo, pasaría a tener tanto los ítems de flota (Vehículos, Regulación) como los nuevos de servicios médicos (si le corresponden) — **hay que revisar con cuidado que esto no sature la navegación de alguien que hoy solo usa la mitad**, ver §4.

**Si son personas distintas con nombre de rol coincidente por casualidad:**
- No se reusan los códigos existentes para los módulos clínicos — se crean roles separados con sufijo o prefijo que evite la ambigüedad (a definir, ej. `REGULACION_MEDICA` vs `REGULACION` de flota), y ahí sí conviene evaluar un modelo de permisos más granular por módulo en vez de solo por rol (más parecido al sistema dinámico que ya tiene SISRES — ver `AUDIT_sisres.md` §7).

## 3. Matriz de permisos — plantilla a llenar por módulo

Mismo formato que ya usa `ROLES_AND_FLOWS.md` para los módulos actuales de Aeromanto — extenderla ahí, no crear una tabla paralela, para que quede una sola fuente de verdad. Adelanto de las filas que van a faltar (SELECT/INSERT/UPDATE/DELETE por rol, una tabla por cada una):

| Tabla nueva | Módulo | Roles con SELECT | Roles con INSERT | Roles con UPDATE | Roles con DELETE | Notas |
|---|---|---|---|---|---|---|
| `patients` | Pacientes | *pendiente* | *pendiente* | *pendiente* | *pendiente* | Datos clínicos — revisar si aplica algún filtro extra (ej. por centro/sede) |
| `servicios` | Servicios | *pendiente* | *pendiente* | *pendiente* | *pendiente* | Módulo central — heredar exactamente el comportamiento condicional por `tipoServicio` que hoy tiene SISRES, no solo el permiso de tabla |
| `inventory_items` | Inventario biomédico | *pendiente* | *pendiente* | *pendiente* | *pendiente* | |
| `biomedical_maintenance` | Mantenimiento biomédico | *pendiente* | *pendiente* | *pendiente* | *pendiente* | Paralelo a `maintenance_records` pero para equipos, no vehículos |
| `clients` | Clientes/aseguradoras | *pendiente* | *pendiente* | *pendiente* | *pendiente* | |
| `campaigns` / `campaign_recipients` | Campañas WhatsApp | *pendiente* | *pendiente* | *pendiente* | *pendiente* | |

## 4. Checklist de revisión por rol — "que cada quien vea lo que necesita, ni más ni menos"

Esto aplica una vez esté cada módulo migrado, como parte del testing en staging (ver `STAGING_SETUP.md` y la plantilla de bugs). Por cada rol, antes de dar un módulo por terminado:

- [ ] **¿Qué ve en el sidebar?** — solo los módulos que ese rol necesita para su trabajo real, no todo lo que técnicamente podría ver. Un OVEM no necesita ver "Campañas WhatsApp" en el menú aunque la política RLS se lo permitiera a nivel de tabla.
- [ ] **¿Qué puede crear/editar/eliminar?** — comparar contra lo que ese cargo hacía en SISRES (o en Aeromanto, según el módulo) y confirmar que no ganó ni perdió capacidades sin que fuera una decisión explícita.
- [ ] **¿La navegación por defecto lo lleva a lo que usa todos los días?** — mismo criterio que ya aplica hoy (OVEM entra directo a `/ovem`, Gerencial a `/`), no a una pantalla genérica.
- [ ] **¿Hay algo que veía en SISRES y ya no aparece en ningún lado de Aeromanto?** — si es así, confirmar si fue intencional (feature descartada) o un olvido de la migración.
- [ ] **Probar con un usuario de prueba real de ese rol en staging**, no solo revisar el código de la política RLS — la política puede estar bien y la UI igual mostrar un botón que no debería.

Esta checklist se llena por rol y por módulo a medida que cada `feature/sisres-*` se prueba en staging — no es un paso único al final, es parte de cerrar cada módulo (ver Definition of Done, `PLAN_INTEGRACION_SISRES.md` §8).

## 5. Próximo paso

En cuanto `RESPUESTAS_LEON.md` conteste la pregunta 1, este documento se actualiza con la decisión tomada (§2) y recién ahí arranca `feature/sisres-roles-permisos`.
