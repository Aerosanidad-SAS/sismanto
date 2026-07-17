# RBAC — integración de roles SISRES → Aeromanto

**Estado:** 🟡 en verificación final — León respondió (`RESPUESTAS_LEON.md`, 2026-07-17) con su hipótesis de que Regulador/Despachador↔REGULACION, Coordinador↔COORDINACION y OVEM↔OVEM son las mismas personas reales, y dejó las cédulas reales de los 24 usuarios de esos 3 cargos para verificarlo empíricamente (no solo asumirlo). **Falta un solo paso para cerrar esto:** que Daniel cruce esos nombres contra los usuarios actuales de Aeromanto — ver §1.1. Aeromanto no guarda cédula en `user_profiles`, así que el cruce es por nombre completo, no por número de documento. Hasta que ese cruce se confirme, no se crea ninguna política RLS nueva ni se arranca `feature/sisres-roles-permisos`.

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

## 1.1. Cómo cerrar la verificación (paso pendiente de Daniel)

León dejó, en `sisres/RESPUESTAS_LEON.md` §1, las cédulas y nombres completos reales de los usuarios activos de 3 cargos:
- **Cargo 2 (Coordinador):** 2 usuarios
- **Cargo 4 (Regulador/Despachador):** 5 usuarios
- **Cargo 7 (OVEM):** 17 usuarios (16 activos, 1 inactivo)

Para cruzarlos, corré esto en el **SQL Editor de producción de Aeromanto** (no en staging, que todavía no tiene usuarios reales) y compará los nombres contra la lista de `RESPUESTAS_LEON.md`:

```sql
SELECT up.nombre_completo, up.email, r.codigo AS rol
FROM user_profiles up
JOIN roles r ON r.id = up.role_id
WHERE r.codigo IN ('REGULACION', 'COORDINACION', 'OVEM')
  AND up.activo = true
ORDER BY r.codigo, up.nombre_completo;
```

- **Si los nombres coinciden** (aunque sea con variaciones de mayúsculas/orden, ej. "Yecica Mosquera Mosquera" vs "PAOLA MOSQUERA MOSQUERA" del lado SISRES) para la mayoría de los 24 → hipótesis confirmada, seguir el camino de §2 "Si son la misma persona".
- **Si no hay solapamiento real de personas** → seguir el camino de §2 "Si son personas distintas".
- Zona gris esperable: es normal que no sea un 100% exacto (alguien pudo cambiarse de cargo, o hay personal en un sistema que no usa el otro todavía) — la pregunta relevante es si la **mayoría** de cada cargo coincide, no si coinciden los 24 exactos.

---

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
