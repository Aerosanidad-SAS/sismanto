# Estado de la integración SISRES → Aeromanto

**Fecha:** 2026-07-21 · **Rama:** `integration/sisres` · Ejecutado según `PLAN_INTEGRACION_SISRES.md`.

## ✅ Construido y compilando (build + lint en verde)

| Pieza | Dónde | Fase del plan |
|---|---|---|
| Roles nuevos `ANALISTA`, `MEDICO`, `AUXILIAR_ENFERMERIA`, `VISTA` | `scripts/migrations/035_sisres_roles.sql` | 1 |
| Campos de `movil` en `vehicles` (motor, chasis, carrocería, IMEI GPS, pase aeroportuario, multas…) | `036_vehicles_campos_sisres.sql` | 1 |
| Catálogos `clients` + `cie10` con RLS | `037_sisres_clientes_cie10.sql` | 3 |
| `patients` con RLS clínico (GERENCIAL/OVEM sin acceso) | `038_sisres_pacientes.sql` | 3 |
| `medical_services` (51 columnas de SISRES, etapas con CHECK) + `medical_assessments` | `039_sisres_servicios_valoraciones.sql` | 3 |
| `biomedical_equipment` + `biomedical_maintenance` | `040_sisres_inventario_biomedico.sql` | 4 |
| `wa_campaigns` + `wa_campaign_recipients` + `notification_log` | `041_sisres_campanas.sql` | 2 |
| Cliente WhatsApp Cloud API (port de `waClient.php`, modo dev sin credenciales) | `src/lib/notifications/whatsapp.ts` | 2 |
| Correo vía Microsoft Graph sendMail (reemplaza PHPMailer) | `src/lib/notifications/email.ts` | 2 |
| Server Actions: pacientes, clientes, servicios (cálculo de tiempos + guarda optimista de etapa), valoraciones, inventario biomédico, campañas, estadísticas | `src/app/api/actions/*.ts` | 3-5 |
| UI Pacientes (`/pacientes`), Valoraciones (`/valoraciones`), Servicios (`/servicios`), Equipos (`/equipos`), Comunicaciones (`/comunicaciones`), Estadísticas (`/estadisticas`) | `src/app/(dashboard)/…` + `src/components/…` | 3-5 |
| Pestaña Clientes en Configuración | `src/components/configuracion/clientes-tab.tsx` | 3 |
| **Navegación unificada por dominios** (implementa `NAVEGACION_UNIFICADA.md`: Regulación absorbida en "Operación", grupos Flota/Pacientes/Reportes/Administración) | `src/app/(dashboard)/layout.tsx` | 1 |
| ETL CSV (export MySQL) → Postgres, idempotente, con reporte de placas huérfanas | `scripts/etl-sisres.ts` (`npm run etl:sisres <carpeta>`) | 6 |

Las 7 migraciones están registradas en `apply-database.ts` — `npm run db:apply` las aplica en staging/producción.

## 🟡 Decisiones tomadas que requieren validación

1. **Roles**: el código asume la hipótesis de León (misma persona real). Si el cruce de cédulas (`RBAC_INTEGRACION.md` §1.1) la desmiente, se ajusta con una migración de códigos nuevos — nada del código lo impide.
2. **Comportamiento condicional del formulario de servicios**: se portó la estructura completa (51 campos, secciones Paciente/Servicio/Ruta/Cierre) y los cálculos de tiempos de `insertarServicios.php`. **León debe validar** los matices condicionales por rol/tipo que solo él conoce (Fase 3 del plan lo asigna a él).
3. **Tipos de servicio**: lista provisional en `servicios-tabla.tsx` (`TIPOS_SERVICIO`) — confirmar contra los valores reales de producción de SISRES.
4. ~~**PDF de hoja de vida**~~ — ✅ construido 2026-07-20 con `@react-pdf/renderer` (`src/lib/pdf/hoja-vida-biomedica.tsx` + acción `generarHojaVidaPdf`). Formato provisional: pendiente de que León confirme si SISRES necesita un membrete/formato específico (Ronda 2, pregunta 6).

## 🐛 Bugs reales encontrados al cargar datos de producción en staging (2026-07-20)

No son bugs de la integración SISRES — son fallas preexistentes en Aeromanto, descubiertas al cargar el roster real de 36 vehículos y 541 mantenimientos reales en staging para pruebas.

1. ~~**Carga Masiva de vehículos rompe con specs incompletas.**~~ — ✅ corregido 2026-07-20. La migración `022_vehicle_specs_required.sql` volvió `NOT NULL` 10 columnas (bombillería x3, baterías x2, refrigerante, aceite, 2 filtros), pero la acción `importarVehiculos` (`src/app/api/actions/carga-masiva.ts`) las mandaba como `null` si faltaban en el archivo, rompiendo el lote completo. Ahora usa el mismo valor de respaldo ("Pendiente definir") que ya usaba el backfill de esa migración.
2. **`vehicles.centro_operativo` es un ENUM de Postgres desincronizado de la tabla `operational_centers`.** Son dos fuentes de verdad distintas: agregar una fila nueva a `operational_centers` (como se hizo con `ADO` en la migración `042`) no alcanza — hay que extender también el ENUM (`044_enum_centro_operativo_ado.sql`) o cualquier INSERT/UPDATE con ese centro falla con "invalid input value for enum operational_center". Cualquier centro operativo nuevo que se agregue en el futuro va a repetir este problema si no se recuerda tocar los dos lugares.

## ✅ Datos reales cargados en staging (2026-07-20)

- **36 vehículos reales** (hoja `SPECS` del Excel de control), con centro operativo correcto por ciudad — incluye la corrección de 2 vehículos de prueba (`IVK968`, `LQW155`) que ya existían con el centro equivocado.
- **541 mantenimientos reales** (de 1370 filas del Excel, filtrado a los vehículos que ya existen en staging) — vía `node scripts/load-history.mjs --solo-manto`, con imputación de kilometraje.
- Con esto, el módulo de KPIs/costos en staging ya tiene datos reales para revisar — pendiente de que Daniel lo recorra buscando los bugs de costos de mantenimiento ya conocidos.

## ✅ Ronda 2 de León — respondida y aplicada al código (2026-07-21)

León respondió las 7 preguntas de `PREGUNTAS_LEON_RONDA2.md` verificando contra la BD/código real de producción de SISRES (`sisres/RESPUESTAS_LEON.md`, rama `audit/integration-analysis`, commit `535ceb3`). Lo que cambiaba código ya construido, corregido hoy mismo:

1. **Tipos de servicio** (`servicios-tabla.tsx`) — la lista provisional no coincidía con la real. Reemplazada por los 10 valores reales medidos contra 20.101 filas de producción: `MEDICINA DOMICILIARIA` (84%, faltaba por completo), `TAB SIMPLE/DOBLE/SENCILLO`, `TAM SIMPLE/DOBLE`, `TELEMEDICINA`, `ENFERMERIA DOMICILIARIA`, `TRASLADO AEREO`.
2. **Etapas de servicio** — el modelo asumido (máquina de estados fija `PROGRAMADO→CURSO→cierre`) no es como funciona SISRES: es un dropdown gobernado por permisos por cargo (`etapa_ver_*`), sin restricción de transición. Se quitó `TRANSICIONES` de `servicios-medicos.ts` — el UPDATE ya no valida "de A a B", solo mantiene la guarda optimista (`WHERE etapa = actual`). Se corrigió `NO_EFECTIVO` → `"NO EFECTIVO"` (con espacio, valor real) y se agregó `DUPLICADO` como etapa terminal viva. Migración `045_etapa_servicio_no_efectivo_duplicado.sql` aplicada en staging.
3. **Notificaciones WhatsApp** — no estaban conectadas al flujo de servicios (solo existían para el módulo de Campañas). Con los 4 nombres reales de plantilla confirmados por León, se conectó el envío automático en `servicios-medicos.ts`: `servicio_programado`/`servicio_en_curso`/`servicio_terminado` (`es_CO`) al crear/cambiar etapa, **solo si `tipo_servicio === "MEDICINA DOMICILIARIA"`** (igual que SISRES), al celular del paciente, con log en `notification_log`.
4. **ETL** (`etl-sisres.ts`) — `normalizarEtapa()` mapeaba cualquier valor desconocido a `PROGRAMADO`, lo que habría desclasificado silenciosamente los históricos `SOLUCIONADO` (19 filas, alias legacy de `CANCELADO` pre-2026-07-16), `REPROGRAMADO`/`RE-PROGRAMADO` (5 filas) y `DUPLICADO` (23 filas, vivo hoy). Corregido con mapeo explícito.

**Pendiente, sin resolver todavía (requiere más trabajo o una decisión de Daniel):**

- **Rol ANALISTA — decisión de producto pendiente.** León confirmó que en producción NO es de solo lectura: tiene create/edit en 6 módulos + export (todo salvo borrar), usado activamente por 6 personas. El RLS actual de Aeromanto para `ANALISTA` en `medical_services`/`patients` etc. lo trata como solo-lectura. Hay que decidir: (a) igualar los permisos reales para no quitarle capacidad el día del corte, o (b) recortarlo a solo-lectura a propósito y avisar a esos 6 usuarios antes. **No implementado — es criterio de negocio, no de código.**
- **Formulario de servicios — lógica condicional por cargo incompleta.** León confirmó que `registroServicios.php` (oculta secciones completas para Regulador) y `editarServicio.php` (bloquea campos de logística para Médico/Auxiliar) son dos formularios que llevan años divergiendo, con reglas de cargo *distintas* entre sí, más una capa fina de condicionales por tipo de servicio (traslado vs. no, "dirección intermedia" solo en dobles+aéreo). El formulario plano actual de Aeromanto no replica ninguna de las dos ramas — sigue siendo el mismo formulario para todos los cargos. Queda como trabajo de Fase 3 pendiente.
- **PDF de hoja de vida — formato no coincide con el de SISRES.** León dio el formato exacto de `HojaVidaEquipoRender.php` (colores `#1B6368`, layout de 4 secciones, tamaño carta, membrete con logo). El PDF ya construido (`hoja-vida-biomedica.tsx`) usa un formato propio (color `#0E7490`, layout distinto) — funcional pero no es un espejo visual de SISRES. Pendiente decidir si vale la pena rehacerlo para que coincida exactamente o si el formato propio es aceptable.
- **53 cédulas + correos de usuarios activos de SISRES** — están en `sisres/RESPUESTAS_LEON.md` (rama de acceso controlado). Dato sensible: además de cédula ahora incluye correo/celular real de personas. Falta decidir el mecanismo concreto para usarlos en el backfill de `user_profiles.cedula` sin dejarlos sueltos en más lugares de los necesarios — no se copiaron a ningún otro archivo de este repo.

**Otro hallazgo de León (independiente, vía `sisres/DB_MAP.md`, commit `85b3ddd`):** de las relaciones entre tablas de SISRES, solo 3 tienen Foreign Key real en el motor — el resto (`servicios`↔`paciente`, `movil`, `usuarios`, `cie10`, etc.) es relación por valor de texto sostenida por convención en PHP, sin integridad referencial en la BD. Además: fechas guardadas como `varchar` en vez de `date`/`datetime`, patrón `NOT NULL + ''` en vez de `NULL`, y `correo` a veces contiene un celular. Todo esto hay que tenerlo en cuenta al escribir/probar el ETL real contra un export de producción — el CSV de origen no va a tener la limpieza que asume `etl-sisres.ts` hoy.

## ⏭ Próximos pasos (en orden)

1. Daniel: decidir el alcance de permisos de ANALISTA (ver arriba) — bloquea terminar el RLS del módulo de servicios/pacientes.
2. Daniel: revisar el módulo de KPIs/costos en `sismanto-staging.vercel.app` con los datos reales ya cargados, buscar los bugs de costos de mantenimiento conocidos.
3. Daniel: completar cédula de los usuarios actuales de Aeromanto (columna nueva, migración `043`) + correr el cruce de identidad en producción (`RBAC_INTEGRACION.md` §1.1) — sigue siendo el bloqueante para tocar producción.
4. Portar la lógica condicional del formulario de servicios por cargo (Regulador / Médico-Auxiliar) y por tipo de servicio, usando el detalle que dio León en Ronda 2.
5. Credenciales sandbox de WhatsApp (número de prueba de Meta) → variables `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` en Vercel Preview; `NOTIFICATIONS_MAIL_FROM` para correo — necesario para probar de punta a punta la notificación automática ya conectada.
6. Ensayar `npm run etl:sisres` contra un export real de producción cuando León lo entregue, teniendo en cuenta las notas de calidad de dato de `DB_MAP.md`.
7. Corregir los 2 bugs preexistentes documentados arriba cuando haya tiempo (no bloquean la integración SISRES, pero sí afectan Carga Masiva de vehículos en general).
8. Nada de esto toca `main` ni producción: todo vive en `integration/sisres`.
