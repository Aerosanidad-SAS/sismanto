# Estado de la integración SISRES → Aeromanto

**Fecha:** 2026-07-20 · **Rama:** `integration/sisres` · Ejecutado según `PLAN_INTEGRACION_SISRES.md`.

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

1. **Carga Masiva de vehículos rompe con specs incompletas.** La migración `022_vehicle_specs_required.sql` volvió `NOT NULL` 10 columnas (bombillería x3, baterías x2, refrigerante, aceite, 2 filtros), pero `filaVehiculoImportSchema` (`src/lib/validations.ts`) y la acción `importarVehiculos` (`src/app/api/actions/carga-masiva.ts`) siguen tratándolas como opcionales y mandan `null` si faltan. Cualquier CSV real que no incluya esos 10 campos específicos (la mayoría no los trae) hace fallar el lote completo con "violates not-null constraint". **No corregido todavía** — se rodeó manualmente con un valor de respaldo al cargar los datos de prueba, pero el bug sigue ahí para cualquier carga real vía la UI.
2. **`vehicles.centro_operativo` es un ENUM de Postgres desincronizado de la tabla `operational_centers`.** Son dos fuentes de verdad distintas: agregar una fila nueva a `operational_centers` (como se hizo con `ADO` en la migración `042`) no alcanza — hay que extender también el ENUM (`044_enum_centro_operativo_ado.sql`) o cualquier INSERT/UPDATE con ese centro falla con "invalid input value for enum operational_center". Cualquier centro operativo nuevo que se agregue en el futuro va a repetir este problema si no se recuerda tocar los dos lugares.

## ✅ Datos reales cargados en staging (2026-07-20)

- **36 vehículos reales** (hoja `SPECS` del Excel de control), con centro operativo correcto por ciudad — incluye la corrección de 2 vehículos de prueba (`IVK968`, `LQW155`) que ya existían con el centro equivocado.
- **541 mantenimientos reales** (de 1370 filas del Excel, filtrado a los vehículos que ya existen en staging) — vía `node scripts/load-history.mjs --solo-manto`, con imputación de kilometraje.
- Con esto, el módulo de KPIs/costos en staging ya tiene datos reales para revisar — pendiente de que Daniel lo recorra buscando los bugs de costos de mantenimiento ya conocidos.

## ⏭ Próximos pasos (en orden)

1. Daniel: revisar el módulo de KPIs/costos en `sismanto-staging.vercel.app` con los datos reales ya cargados, buscar los bugs de costos de mantenimiento conocidos.
2. Daniel: completar cédula de los usuarios actuales de Aeromanto (columna nueva, migración `043`) + correr el cruce de identidad en producción (`RBAC_INTEGRACION.md` §1.1) — sigue siendo el bloqueante para tocar producción.
3. León: responder Ronda 2 (`PREGUNTAS_LEON_RONDA2.md`, 7 preguntas) + exportar CSVs reales y ensayar `npm run etl:sisres` contra staging.
4. Credenciales sandbox de WhatsApp (número de prueba de Meta) → variables `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` en Vercel Preview; `NOTIFICATIONS_MAIL_FROM` para correo.
5. Corregir los 2 bugs preexistentes documentados arriba cuando haya tiempo (no bloquean la integración SISRES, pero sí afectan Carga Masiva de vehículos en general).
6. Nada de esto toca `main` ni producción: todo vive en `integration/sisres`.
