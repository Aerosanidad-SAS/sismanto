# Estado de la integración SISRES → Aeromanto

> **Lo más reciente está en la primera sección** («Cierre de brechas funcionales», actualizada el 2026-10-01). Las
> secciones de más abajo son la historia de julio y se dejan como registro.

## 🔄 Cierre de brechas funcionales SISRES → SISMANTO (actualizado 2026-10-01)

**Qué es:** una revisión del código actual de SISRES (`C:\xampp\htdocs\sisres`, que sigue recibiendo commits casi a
diario) contra SISMANTO, para portar lo que falta. `FEATURE_MATRIX.md` (julio) quedó desactualizada: hoy SISMANTO
ya tiene casi todos los **módulos** de SISRES (servicios, pacientes, captación, aerolíneas, aeropuertos, formatos
TI, soporte, equipos, campañas). Las brechas que quedan son **funciones dentro de esos módulos**. Se porta una por
PR contra `dev`.

**SISRES revisado hasta el commit `07ae2f6` (2026-10-01 11:15).** La próxima revisión arranca ahí:
`git -C C:/xampp/htdocs/sisres log 07ae2f6..origin/main`.

### PRs de esta tanda

| PR | Brecha (origen en SISRES) | Migración | Estado al 2026-10-01 |
|---|---|---|---|
| #121 | Informes ACM, Aerocivil, PME y PAE de captación (`informe*.php`) → `/captacion/informes` | — | ✅ en `dev` |
| #122 | Filtro «servicios sin gestionar» (`f5fd5ff`) | — | ✅ en `dev` |
| #123 | Opciones administrables de 7 selects del formulario de servicios (`2726772`) → `/servicios/configuracion` | 091 | ✅ en `dev` |
| #124 | Listas de chequeo del mantenimiento biomédico (`mantenimiento_checklist`) → `/equipos/checklists` | 097 | ✅ en `dev` |
| #125 | Plantillas de texto del mantenimiento biomédico (`9df77b1`) → `/equipos/plantillas` | 098 | ✅ en `dev` |
| #126 | Documentos del equipo: INVIMA, manuales, guías (`1c93eb9`); bucket privado `equipos-documentos` | 099 | ✅ en `dev` |
| #127 | Destinatarios de avisos de vencimiento por área Biomédica/Sistemas | 100 | ✅ en `dev` |
| #130 + #131 | Campos obligatorios configurables: motor genérico + **pacientes** y **clientes** → `/admin/campos-obligatorios` | 101 | ✅ en `dev` |
| #132 | 🐞 Registrar un mantenimiento biomédico recalcula el próximo mantenimiento / calibración | — | ✅ en `dev` |
| #133 | Prestadores médicos: crear y editar; el directorio muestra los 1.332 (antes 3) | — | ✅ en `dev` |
| #134 | Recuperar contraseña con código por correo (`/recuperar`). Necesita las variables de Microsoft Graph | 102 | ✅ en `dev` |
| #135 | Umbral configurable de servicios estancados (Configuración → Servicios) | 103 | ✅ en `dev` |
| #136 + #137 | Integraciones editables (`/admin/integraciones`: ProTrack365, plantilla de WhatsApp, llave de Google Maps) y **rastreo GPS** de la ambulancia con enlace público para el paciente | 104, 105 | ✅ en `dev` |
| #152 | **Permisos editables:** `/admin/permisos`, qué módulos del menú ve cada rol. Solo restringe la interfaz; la RLS no cambia | 107 | ✅ en `dev` |
| #154 | Excel de Servicios con los datos del paciente (`07ae2f6`). Solo para los roles que ya exportan pacientes | — | abierto |
| #155 | Bitácora: el filtro «Módulo» incluye `role_switch` + prueba que lo vigila (`b137a58`) | — | abierto |
| #156 | 🐞 Vuelve «Integraciones» al menú (se perdió al mezclar #136 con #152) | — | abierto |
| #157 | 🐞 Registra las migraciones 100–105 en `apply-database.ts` + prueba en CI que exige registrar toda migración | — | abierto |
| #158 | **Cotizador de rutas** con PDF, impresión y correo (`segumientoAmbulanciasMaps.php`). Va después de #157 | 106 | abierto |

**De la revisión del 2026-10-01 que no aplica a SISMANTO:** `a9a7fa0` (no hay `type="number"` en campos de
identificación), `f9fd84b` y `982f111` (bugs propios del PHP de SISRES), y la parte de `b137a58` sobre fechas sueltas
(en SISMANTO cada fecha ya se aplica por separado).

### ⚠️ Dos accidentes de merge del 2026-10-01 (para no repetirlos)

1. **PRs apilados que se quedan fuera de `dev`.** El cotizador se mergeó dos veces dentro de la rama de otro PR (#138
   en `feat/daniel-rastreo-gps`, #153 en `feat/daniel-integraciones-config`) **después** de que esa rama ya había
   entrado a `dev`. GitHub solo cambia la base a `dev` si se borra la rama de abajo. Regla: **antes de mergear un PR,
   verificar que su base sea `dev`**. Si no, cambiarla primero.
2. **Líneas perdidas en `scripts/apply-database.ts`.** Al resolver conflictos de ese archivo en los squash merges se
   borraron las líneas de 094–096 (#151) y de 100–105 (#157). Las migraciones se aplicaron en staging, pero producción
   y cualquier base nueva no las aplicarían. Desde #157, `src/lib/migraciones-registradas.test.ts` (corre en CI) falla
   si una migración no está registrada ni explicada en el comentario de exclusiones.

**Cómo se verificó (sirve de guía para las próximas):**
- La lógica se escribe como funciones puras en `src/lib/*.ts`, con pruebas `*.test.ts` (`npm test` las corre en
  UTC, Bogotá y Tokio). Cuando existe un PHP equivalente, se comparan las salidas del PHP de SISRES y del TS nuevo
  con los mismos datos (reales si hay; si no, aleatorios).
- Cada migración se ensayó **contra staging dentro de una transacción con `ROLLBACK`**: se corre dos veces
  (idempotencia) y se prueba la RLS por rol simulando el JWT con `set_config('request.jwt.claims',
  '{"sub":"<user_id>","role":"authenticated"}', true)` + `SET LOCAL ROLE authenticated` (en dos consultas separadas).
  No queda nada aplicado: las migraciones las aplica `db-migrate.yml` al mergear, nunca a mano en la base compartida.
- Pantallas: Playwright con un usuario `test.<rol>@sismanto.test` sobre `next start`. **No hay usuario `test.admin`**,
  así que las pantallas solo-ADMIN no se probaron de punta a punta.
- Conocido: en `next dev`, un rol que no es ADMIN al abrir una página solo-ADMIN ve «Application error» (`Rendered
  more hooks` en el Router interno de Next). En `next build && next start` redirige bien: es solo de desarrollo.

**Pendiente de probar en `dev`** (las tablas ya existen en staging; falta el recorrido como usuario):
- #123: agregar o quitar una opción en `/servicios/configuracion` como ADMIN y verla en «Nuevo servicio».
- #124: registrar un mantenimiento y ver la lista de chequeo del tipo de equipo; editar una lista.
- #125: «Usar plantilla…» en los 3 campos (campo vacío, reemplazar y agregar al final).
- #126: subir un PDF y una imagen, verlos (enlace firmado) y eliminarlos. Probar que un archivo que no es
  PDF/JPG/PNG pero se renombró a `.pdf` se rechaza.
- #130: como ADMIN, marcar «Celular» en `/admin/campos-obligatorios?modulo=pacientes` y comprobar que el formulario lo
  marca con * y no deja guardar sin él.
- #132: registrar un mantenimiento a un equipo «Vencido» y ver que pasa a «Al día».
- #133: crear un prestador y editar uno existente como ANALISTA.
- #134: con un usuario de correo real, pedir el código, cambiar la clave y entrar con la nueva.
- #135: como ADMIN, bajar el umbral de CURSO a 1 h y ver aparecer el ⏰ en la lista.
- #136/#137: cargar las credenciales de ProTrack365 en `/admin/integraciones` y abrir el seguimiento de un servicio con
  móvil asignado. Ojo: 18 móviles tienen IMEI «0».
- #152: como ADMIN, ocultarle «Valoraciones» a MEDICO y comprobar con «Ver como» que desaparece del menú y que la URL
  lo redirige.
- #127: configurar un correo de prueba en el área Sistemas y lanzar el cron a mano
  (`POST /api/cron/send-biomedical-alerts` con `Authorization: Bearer $CRON_SECRET`). **Ojo:** escribe en
  `biomedical_alerts_log` y envía correos reales.

**Resueltas desde la última revisión de esta tabla (2026-10-05):**
- Tipos de servicio visibles por rol: ya estaba hecho desde el 2026-08-03 (`servicios-tabla.tsx`,
  `TIPOS_SERVICIO_REGULACION`) — Regulador solo ve MD/TAB/TAM al **crear** un servicio, igual que
  `registroServicios.php`; al editar, como en `editarServicio.php`, no se restringe. Esta tabla tenía la entrada
  por error, sin haber revisado el código actual.
- Equipo biomédico: foto, descripción e instrucciones de uso → PR #183 (migración 112).
- Fotos del vehículo (Vehículos y Preoperacional) → PR #182 (migración 111); no estaba en esta tabla, venía de la
  revisión de SISRES del 2026-10-05 (ver arriba).

### Brechas que quedan (no empezadas)

| Brecha | En SISRES | Qué hace falta |
|---|---|---|
| **Campos obligatorios en los demás módulos** | `configurarCampos*.php`, 12 módulos en SISRES | Pacientes y clientes ya están. Faltan: servicios (50 campos; ojo, el formulario oculta secciones según el tipo de servicio y bloquea campos según el rol, así que solo se puede exigir lo que el formulario muestra), proveedores, acta de entrega (37), diagnóstico (33), baja (28), móviles (22), usuarios (17), valoraciones (17), préstamo (4) y aerolíneas (2). Receta para sumar un módulo: comentario al inicio de `src/lib/campos-obligatorios.ts`. |
| **Permisos finos por acción** | `adminPermisos.php`, `adminRoles.php` (permisos por cargo, con historial y revertir) | #152 resolvió la visibilidad de módulos. Permisos de ver/editar por acción y roles nuevos quedan fuera: tocarían las server actions y la RLS. Daniel decidió empezar solo por la visibilidad. |
| **Mantenimiento biomédico incompleto** | Editar mantenimiento (`editarMantenimientoBiomedica.php`), tipo PREVENTIVO/CORRECTIVO/CALIBRACION como lista, evidencia PDF del proveedor externo, **orden de mantenimiento en PDF** (`OrdenMantenimientoRender.php`) e impresión por rango | SISMANTO solo registra (sin editar), el tipo es texto libre, y no hay evidencia ni orden PDF. |
| Catálogo de sedes del inventario | `configurarInventario.php` (sedes para el selector «Aeropuerto / Sede» del equipo) | Menor: en SISMANTO ese campo es texto libre. |
| Títulos coloreados en el Excel de Servicios | `includes/xlsxWriter.php` (`07ae2f6`) | `xlsx` 0.18 (community) no escribe estilos. Solo vale la pena si se adopta otra librería. |

**Bloqueado por algo externo:** el cotizador (#158) necesita una llave de Google Maps **con facturación** (la de SISRES
responde `REQUEST_DENIED`), y el rastreo GPS necesita cargar las credenciales de ProTrack365 en `/admin/integraciones`.

**Antes de portar cualquier brecha**, revisar `git -C C:/xampp/htdocs/sisres log 07ae2f6..origin/main`, porque SISRES
cambia seguido.

---

**Fecha de lo que sigue:** 2026-07-21 · **Rama:** `integration/sisres` · Ejecutado según `PLAN_INTEGRACION_SISRES.md`.

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
2. Daniel: revisar el módulo de KPIs/costos en `sisres-v2-staging.vercel.app` con los datos reales ya cargados, buscar los bugs de costos de mantenimiento conocidos.
3. Daniel: completar cédula de los usuarios actuales de Aeromanto (columna nueva, migración `043`) + correr el cruce de identidad en producción (`RBAC_INTEGRACION.md` §1.1) — sigue siendo el bloqueante para tocar producción.
4. Portar la lógica condicional del formulario de servicios por cargo (Regulador / Médico-Auxiliar) y por tipo de servicio, usando el detalle que dio León en Ronda 2.
5. Credenciales sandbox de WhatsApp (número de prueba de Meta) → variables `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` en Vercel Preview; `NOTIFICATIONS_MAIL_FROM` para correo — necesario para probar de punta a punta la notificación automática ya conectada.
6. Ensayar `npm run etl:sisres` contra un export real de producción cuando León lo entregue, teniendo en cuenta las notas de calidad de dato de `DB_MAP.md`.
7. Corregir los 2 bugs preexistentes documentados arriba cuando haya tiempo (no bloquean la integración SISRES, pero sí afectan Carga Masiva de vehículos en general).
8. Nada de esto toca `main` ni producción: todo vive en `integration/sisres`.
