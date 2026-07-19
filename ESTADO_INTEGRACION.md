# Estado de la integración SISRES → Aeromanto

**Fecha:** 2026-07-19 · **Rama:** `integration/sisres` · Ejecutado según `PLAN_INTEGRACION_SISRES.md`.

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
4. **PDF de hoja de vida**: la hoja de vida existe como vista en pantalla (ficha + historial). La generación PDF (TCPDF→Node) quedó pendiente — única pieza técnica nueva del stack, evaluar `@react-pdf/renderer` (requiere aprobar dependencia).

## ⏭ Próximos pasos (en orden)

1. `npm run db:apply` contra **SISMANTO_Staging** para aplicar 035-041 (2 min).
2. Crear usuarios de prueba con los roles nuevos en staging y recorrer los 6 módulos (plantilla de bugs en `.github/ISSUE_TEMPLATE/`).
3. Daniel: cruce de cédulas en producción (`RBAC_INTEGRACION.md` §1.1) — sigue siendo el bloqueante para tocar producción.
4. León: validar reglas de negocio de servicios + exportar CSVs de prueba y ensayar `npm run etl:sisres` contra staging.
5. Credenciales sandbox de WhatsApp (número de prueba de Meta) → variables `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` en Vercel Preview; `NOTIFICATIONS_MAIL_FROM` para correo.
6. Nada de esto toca `main` ni producción: todo vive en `integration/sisres`.
