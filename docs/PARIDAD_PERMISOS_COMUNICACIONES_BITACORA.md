# Paridad SISRES → SISMANTO: matriz de permisos, campañas WhatsApp, GPS y bitácora

Auditoría de **solo lectura** hecha el 2026-09-24. Cierra los cuatro pendientes que `PARIDAD_SISTEMA.md` dejó como "no auditados" (sección 3). No cambia código: deja los hallazgos, la evidencia y lo que hay que decidir antes de construir.

**Fuentes.** SISRES: `DOCUMENTACION.md` §4.12 / §14, `adminPermisos.php`, `includes/getPermisos.php`, `campanasWhatsapp.php`, `includes/wa/*`, `wa_api/waWebhook.php`, `segumientoAmbulanciasMaps.php`, `mostrarLog.php`, `includes/registrarLog.php`, y la **copia local de la base real** (`juanlop7_aerosanidad`, solo `SELECT`, sin datos personales en este documento). SISMANTO: `src/lib/auth-utils.ts`, `src/app/(dashboard)/layout.tsx`, `src/app/api/actions/campanas.ts`, `src/components/comunicaciones/`, `src/lib/notifications/whatsapp.ts`, migraciones `035`, `041`, `055`, `064`.

**Qué NO se verificó:** nada se ejecutó contra Supabase ni contra WhatsApp/Google reales; no se revisó la base de producción (la copia local puede estar atrasada frente a producción).

Leyenda: ✅ existe · 🟡 existe a medias · ❌ no existe · ⛔ decidido no migrar.

---

## 1. Matriz de permisos dinámica

### Cómo funciona hoy en SISRES
- Tabla `permisos (cargo, funcionalidad, permitido)`; el Administrador la edita en `adminPermisos.php` (una matriz funcionalidad × cargo) y hay historial con reversión (`permisos_historial`, hasta 20 snapshots). `tienePermiso()` es *deny-by-default* desde el 2026-09-18.
- **La documentación está desactualizada frente a la base real:** dice 9 cargos y 90 funcionalidades; la base tiene **12 cargos** (los 9 de sistema **más 3 creados a mano: "Medico Aeropuerto", "Auxiliar de Enfermeria Aeropuerto", "Ovem Aeropuerto"**) y **112 funcionalidades** (112 filas por cargo, sin huecos).
- **Uso real:** la matriz se guardó **20 veces entre el 2026-07-10 y el 2026-09-01**, todas por una sola persona. Es una herramienta viva, no un dato sembrado y olvidado.

Permisos concedidos por cargo (base local) y usuarios por cargo:

| Cargo | Nombre | Funcionalidades permitidas (de 112) | Usuarios |
|---:|---|---:|---:|
| 1 | Administrador | 112 | 4 |
| 2 | Coordinador | 61 | 11 |
| 3 | Analista | 42 | 7 |
| 4 | Regulador | 37 | 15 |
| 5 | Médico | 31 | 48 |
| 6 | Auxiliar de Enfermería | 28 | 46 |
| 7 | OVEM | 28 | 56 |
| 8 | Vista | 16 | 1 |
| 9 | Técnico | 7 | 0 |
| 10 | Médico Aeropuerto | 4 | 1 |
| 11 | Auxiliar Enfermería Aeropuerto | 4 | 3 |
| 12 | OVEM Aeropuerto | 2 | 1 |

(194 usuarios en total; hay 1 con cargo 0.)

### Cómo funciona hoy en SISMANTO
- **10 roles fijos** (`UserRole`: OVEM, ADMIN, REGULACION, GERENCIAL, MANTENIMIENTO, COORDINACION, ANALISTA, MEDICO, AUXILIAR_ENFERMERIA, VISTA) y los permisos están **repartidos en tres sitios que hay que mantener a mano y en sincronía**: (a) las listas `roles: [...]` de cada ítem del menú en `layout.tsx`, (b) constantes `ROLES_*` en cada acción/página (p. ej. `ROLES_CAMPANAS = ["ADMIN", "COORDINACION"]`, `ROLES_FORMATOS_TI`), y (c) las políticas RLS con `get_user_role() IN (...)` en las migraciones. No hay una fuente única ni pantalla para cambiarlos.
- Ya hay dos bloques que **sí** están centralizados y son un buen modelo: `isAdminLike()` y `ROLES_POR_CENTRO` (`auth-utils.ts`).

### Brechas
| # | Brecha | Gravedad |
|---|---|---|
| P1 | **No hay forma de cambiar quién puede qué sin tocar código y migraciones.** En SISRES lo hace el Administrador y lo hizo 20 veces en 7 semanas. | Alta |
| P2 | **Los 3 cargos "Aeropuerto" no tienen equivalente.** Son roles creados por el equipo (de 1 a 3 usuarios cada uno, con muy pocos permisos: 4, 4 y 2 de 112). Habrá que decidir si son roles nuevos o el mismo rol + una restricción por sede. | Media |
| P3 | **El cargo Técnico (9)** existe en SISRES (7 permisos, 0 usuarios hoy) y no hay un rol equivalente en `dev`; los PRs de tickets de David (#27–#29) deberán resolver cómo se llama. | Media |
| P4 | **La granularidad es distinta:** SISRES tiene 112 funcionalidades (módulo + acción `registrar/editar/eliminar/exportar` + visibilidad de etapas y tipos de servicio); SISMANTO decide por módulo y rol. Acciones como "eliminar" o "exportar" no son configurables. | Media |
| P5 | **Sin historial ni reversión** de cambios de permisos. | Media |
| P6 | **Los 194 usuarios necesitan un mapeo cargo → rol** para el ETL de usuarios (que hoy no existe). El mapeo 1→ADMIN, 2→COORDINACION, 3→ANALISTA, 4→REGULACION, 5→MEDICO, 6→AUXILIAR_ENFERMERIA, 7→OVEM, 8→VISTA es evidente; **9–12 no**. | Alta (bloquea migrar usuarios) |

### Opciones (a decidir por el equipo)
- **A — Recomendada como primer paso:** una **tabla única en código** `permisos.ts` (funcionalidad × rol) de la que salgan el menú, las guardas de las acciones y un generador de las políticas RLS. Elimina las tres copias a mano, sembrada con la matriz real de SISRES para los roles que ya existen. No da pantalla de edición, pero corrige el riesgo de que menú, guardas y RLS se contradigan.
- **B — Paridad completa:** tabla `role_permissions` + pantalla de administración + historial/reversión, con la guarda leyendo la tabla (con caché corta). Cambia el modelo de seguridad: **las políticas RLS dejarían de poder listar roles fijos** y tendrían que consultar la tabla, con costo y riesgo de regresión en todas las migraciones existentes. Es un proyecto de varias semanas.
- **C — Híbrida:** RLS sigue con roles fijos (barrera dura) y la matriz dinámica solo controla lo que el menú y las acciones *muestran*. Menor riesgo, pero deja permisos que "se ven concedidos y la base rechaza".

**Preguntas para León / Daniel:**
1. ¿La edición dinámica se usa de verdad (20 cambios en 7 semanas sugiere que sí) o alcanza con un mapa fijo revisado por el equipo?
2. ¿Los 3 cargos Aeropuerto son roles o son "el mismo rol, otra sede"?
3. ¿Qué rol tendrá el Técnico de tickets?

---

## 2. Campañas WhatsApp

SISRES tiene uso real: **15 campañas** (14 finalizadas, 1 en curso) y **385 destinatarios**: 359 enviados, 21 fallidos, 5 pendientes. Solo Administrador y Coordinador tienen `mod_campanas`.

| # | Función | SISRES | SISMANTO | Estado |
|---|---|---|---|---|
| W1 | Crear campaña con plantilla aprobada de Meta | `crearCampana.php` | `crearCampana` (`wa_campaigns`, migración 041) | ✅ |
| W2 | Envío por lotes de 5 con pausa de 2 s (anti-throttling) | `procesarLoteCampana.php` | `procesarLoteCampana` (mismo ritmo) | ✅ |
| W3 | Modo simulación sin credenciales | por defecto | `whatsappConfigurado()` simula OK | ✅ |
| W4 | Destinatarios desde la **base de datos filtrada** (pacientes, clientes, proveedores…) | `crearCampana.php` (`SELECT … WHERE estado='1'`) | ❌ solo se pegan líneas `telefono;nombre;param1\|param2` (máx. 2.000) | ❌ |
| W5 | Destinatarios desde **Excel subido** + plantilla Excel descargable | `xlsxReader.php`, `generarPlantillaXlsx.php` | ❌ | ❌ |
| W6 | **Pausar / reanudar / cancelar** | `estadoCampana.php` (`pausada`, `cancelada`) | **ninguna acción para pausar, reanudar ni cancelar.** El estado `CANCELADA` existe en el CHECK y el panel lo pinta, pero nada en el código lo asigna (y no hay `PAUSADA`) | ❌ |
| W7 | **Imagen/PDF/video en el encabezado** (≤16 MB, se sube una vez a Meta y se reutiliza el `media_id`) | `waSubirMedia` | ❌ las columnas `media_*` existen en la tabla pero no hay UI ni subida | 🟡 |
| W8 | **Entregado / leído** vía webhook de Meta (con verificación HMAC `X-Hub-Signature-256`) | `wa_api/waWebhook.php` actualiza `fecha_entrega` / `fecha_lectura` por `wamid` | ❌ no hay ruta de webhook de WhatsApp (solo el de OneDrive); solo se sabe "ENVIADO/FALLIDO" al llamar a la API | ❌ |
| W9 | Exportar historial y detalle a Excel | `exportCampanaHistorial.php` | ❌ | ❌ |
| W10 | Diagnóstico del payload (error 132018) | `previewPayload.php` | ❌ | ❌ (baja prioridad) |
| W11 | Progreso por polling y reanudar tras cerrar la pestaña | AJAX + estado en BD | el lote se dispara desde el cliente; ver riesgo abajo | 🟡 |

**Riesgo a revisar (no verificado):** en SISMANTO el envío avanza mientras el navegador llama a `procesarLoteCampana` en un ciclo; si se cierra la pestaña la campaña queda `EN_PROCESO` sin avanzar (SISRES tiene el mismo patrón AJAX, pero con pausa/reanudar para retomarla). Sin pausar/cancelar (W6) no hay forma de detener una campaña equivocada ni de retomarla limpiamente.

**Orden propuesto:** W6 (pausa; migración chica: un estado y un CHECK) → W8 (webhook con verificación de firma; es lo que da valor real a las 385 entregas históricas) → W4/W5 (destinatarios desde la base o Excel; W4 depende de que Pacientes/Clientes tengan filtros por servidor, ya hechos en #19) → W7 → W9.

**A confirmar:** ¿el número/plantillas de Meta de producción son los mismos que usa SISRES? El webhook de SISRES apunta a `wa_api/waWebhook.php`; habría que **cambiar la URL de callback en Meta** al desplegar el de SISMANTO (o correr ambos durante la transición).

---

## 3. GPS ("Seguimiento de Ambulancias")

**Hallazgo principal: no es seguimiento.** `segumientoAmbulanciasMaps.php` (288 líneas) es un **calculador de ruta y costo**: se escribe un origen, un destino y un punto intermedio opcionales (o se usa el GPS del navegador), un valor por km, y con Google Maps (`DirectionsService`, `places`) calcula distancia, tiempo y costo. **No lee posiciones de ambulancias ni de ningún proveedor GPS**, no guarda nada en la base y no usa ninguna tabla.

- Lo pueden usar los cargos 1 a 7 (`mod_gps`).
- **SISMANTO no tiene nada equivalente** (`grep` de "gps/seguimiento" solo encuentra textos de pantallas de vehículos).
- ⚠️ **Hallazgo de seguridad en SISRES (fuera de la fusión):** la página trae la **clave de Google Maps escrita en el código** (`segumientoAmbulanciasMaps.php`, línea 285: `…maps.googleapis.com/maps/api/js?key=…`). Una clave de Maps JS va al navegador por diseño, así que no es un secreto, pero **debe tener restricción por referente HTTP y por API en la consola de Google Cloud**; si no la tiene, cualquiera puede usarla y generar costo. Conviene revisarlo y, en SISMANTO, leerla de `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.

**Decisión pedida a León:** ¿se porta el calculador de rutas (media jornada: una página cliente con la API de Maps y sin base de datos) o se descarta? Si lo que realmente quieren es **seguimiento en vivo de la flota**, eso es un proyecto distinto (necesita un proveedor GPS/telemetría) y no existe hoy en ninguno de los dos sistemas.

---

## 4. Bitácora de auditoría

SISRES: tabla `log_sistema` (usuario, cargo, acción, tabla, registro, detalle, IP, fecha) alimentada por **91 llamadas a `registrarLog()`** repartidas por todo el sistema. Pantalla `mostrarLog.php` (solo Administrador, `mod_log`) con filtros por usuario, acción, módulo y rango de fechas, paginada.

Volumen real (base local, 2026-05-28 → 2026-09-23): **19.302 eventos** — MODIFICAR 9.822, INSERTAR 8.638, LOGIN 739, LOGOUT 43, NOTIFICAR 29, ERROR 17. Por módulo: servicios 13.146, pacientes 4.376, usuarios 950, inventario 483, tickets 269, móviles 43, configuración 23.

SISMANTO: **no hay bitácora general.** Solo existen registros específicos: `055_candado_finalizado_auditoria.sql` (servicios finalizados), `ai_usage_log` (uso de IA) y las marcas `created_by/updated_at` de cada tabla. No se sabe *quién cambió qué* ni *cuándo* en Pacientes, Servicios, Inventario, Usuarios ni en los Formatos TI.

| # | Brecha | Gravedad |
|---|---|---|
| B1 | Sin registro de INSERTAR/MODIFICAR/ELIMINAR por módulo | Alta — es el rastro con el que hoy se responde "¿quién tocó este servicio/paciente?" |
| B2 | Sin registro de LOGIN/LOGOUT ni de intentos fallidos | Media |
| B3 | Sin pantalla de consulta con filtros | Media |
| B4 | Los correos/campañas enviados no dejan rastro (`NOTIFICAR` en SISRES) | Baja |

**Diseño propuesto (a validar):**
- Tabla `audit_log` (`id`, `at`, `user_id`, `user_email`, `role`, `action`, `entity`, `entity_id`, `detail`, `ip`), **solo INSERT** para los usuarios (sin UPDATE/DELETE, ni siquiera de Administrador) y lectura solo para ADMIN.
- Un ayudante `registrarAuditoria()` que se llama **desde las acciones de servidor** (no con triggers de Postgres): así queda el `detail` legible como en SISRES ("Acta de entrega #12 editada…") y la IP del cliente. Los triggers darían cobertura total pero sin contexto ni IP.
- Empezar por los módulos con más movimiento en SISRES (servicios, pacientes, usuarios, inventario) y por los Formatos TI, y **no registrar datos clínicos completos en `detail`** (identificador + qué cambió, no el contenido).
- Pantalla `/auditoria` con los mismos filtros de `mostrarLog.php`.
- **Migrar el histórico** (19.302 filas) como carga aparte: útil como evidencia, pero el `cargo` numérico necesita el mapeo de P6 y el `usuario` es una cédula, no un correo.

**Preguntas:** ¿se necesita el histórico de SISRES dentro de SISMANTO o basta con conservar la base MySQL de solo lectura? ¿Hay requisito legal de retención de la bitácora (habeas data / historia clínica)?

---

## 5. Resumen y orden sugerido

| Prioridad | Trabajo | Depende de |
|---|---|---|
| 1 | **Bitácora** (B1–B3): tabla + ayudante + pantalla; empezar por servicios/pacientes/formatos | nada |
| 2 | **Mapeo de cargos → roles** (P6) y decisión sobre los 3 cargos Aeropuerto y el Técnico | León / David |
| 3 | **Matriz de permisos**, opción A (mapa único en código) y, si el equipo lo confirma, B | decisión 1 de la sección 1 |
| 4 | **WhatsApp**: pausa (W6) → webhook de entregas/lecturas (W8) → destinatarios desde base/Excel (W4/W5) | cambio de URL de callback en Meta |
| 5 | **GPS**: portar el calculador de rutas o descartarlo | decisión de León |

**Hallazgos a comunicar aparte:** la clave de Google Maps en `segumientoAmbulanciasMaps.php` (revisar restricciones) y que la documentación de SISRES (`DOCUMENTACION.md` §3 y §14) dice 9 cargos / 90 funcionalidades cuando la base tiene 12 / 112.
