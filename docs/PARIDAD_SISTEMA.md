# Paridad de sistema: SISRES → SISMANTO (todo lo que no cubre PARIDAD_REGULACION.md)

**Para:** León (yo) · **Alcance:** módulos completos y funcionalidades
transversales de SISRES que `PARIDAD_REGULACION.md` (David, rol Regulación)
no cubre o cubre solo de refilón. Mismo criterio y formato que ese
documento — leer ese primero si no lo has leído.

Fuente: lectura del código real de SISRES (`sisres` repo, rama `main`,
`DOCUMENTACION.md` como mapa + código fuente citado abajo) contra el
código real de `sismanto` (`dev`, hoy). No se asume nada de
`FEATURE_MATRIX.md`/`RBAC_INTEGRACION.md` (repo `aeromanto`, obsoletos).

Leyenda: ✅ existe · 🟡 existe a medias · ❌ no existe · ⛔ decidido no migrar.

---

## 1. Módulos completos sin ningún equivalente en SISMANTO

Estos cuatro no tienen ni tabla en el esquema ni pantalla — verificado
contra `scripts/migrations/*.sql` y `src/app/(dashboard)/`.

### 1.1 Tickets de Tecnología / Soporte Técnico — ❌ completo

En SISRES: `registroTicket.php`, `mostrarMisTickets.php`,
`mostrarTicketsTecnologia.php`, `gestionarTicket.php`,
`reportesTickets.php`, `configurarTickets.php` — 5 funcionalidades de
permiso, 2 tablas (`tickets_tecnologia`, `tickets_tecnologia_historial`),
3 catálogos configurables (áreas/categorías/sedes), SLA configurable,
correo propio, indicadores (tiempo de respuesta, FCR, SLA, MTTR/MTBF).
**Ayer mismo (2026-09-23) corregí ahí un bug real**: los indicadores de
tiempo contaban de reloj, no de horario laboral — ver
`sisres/DOCUMENTACION.md` §16, entrada 2026-09-23, y
`includes/horarioLaboralHelper.php`.

`PARIDAD_REGULACION.md` ya trackea la parte de Regulación (TIC-01 a
TIC-14, todo ❌, Prio B) — lo que falta ahí es la nota de que **TIC-14
señala explícitamente que "Gestión de tickets" e "Indicadores" son de
Sistemas, no de Regulación** — ese es el resto del módulo, sin dueño
asignado todavía en ningún documento.

**Alcance completo si se construye:**
- Tabla `tickets` + `tickets_historial` (evento por evento, igual patrón
  que `medical_services`/`incidents` de SISMANTO).
- 3 catálogos configurables (reusar el patrón ya usado en SISMANTO para
  `operational_centers`/`maintenance_categories`).
- SLA + horario laboral configurables (`configuracion` genérica, mismo
  patrón que `company_settings`).
- Adjunto de imagen (Supabase Storage, mismo patrón que la boleta de
  salida de servicios).
- Correo al crear/cambiar estado (reusa `src/lib/notifications/email.ts`,
  ya existente y con un solo llamador real hoy — PR #12).
- Indicadores con horario laboral (portar la lógica de
  `includes/horarioLaboralHelper.php::minutosLaboralesEntre()`).

### 1.2 Captación de Pacientes Aeroportuarios — ❌ completo

SISRES: `registroCaptacion.php`, `mostrarCaptaciones.php`,
`editarCaptacion.php`, 4 informes regulatorios (ACM, Aerocivil, PME, PAE),
tabla `captacion_aeroportuaria`, catálogo CIE-10 (ya existe en SISMANTO,
`cie10`, migración 037) + catálogo global de aeropuertos (ver 1.3).

**⛔ Ya hay una decisión tomada al respecto**: `PLAN_INTEGRACION_SISRES.md`
(repo `aeromanto`, obsoleto pero esta decisión puntual la confirmó Daniel
en su momento) dice *"Aeroportuaria: captaciones + 4 informes — Daniel
confirmó que casi no se usa; se hace después del corte"* — y
`PARIDAD_REGULACION.md` (MEN-09) lo repite como ⛔ para Regulación. **No
hay contradicción, pero vale la pena confirmarlo de nuevo con Daniel
antes de asumir que sigue sin uso** — han pasado ~2 meses.

### 1.3 Catálogo global de Aeropuertos/Aerolíneas — ❌ completo

SISRES: tabla `aeropuertos` (85.818 filas, dataset OurAirports),
buscador AJAX (`includes/buscarAeropuertoAjax.php`, no `<datalist>` por
el volumen), tabla `aerolineas` (50 filas, catálogo chico). Usado hoy
por Captación y Valoraciones (Origen/Destino de vuelo).

Como Captación está en ⛔, esto solo importa si se decide portar
Valoraciones con Origen/Destino de vuelo real (ver 2.1) o si se revierte
la decisión de 1.2.

### 1.4 Formatos TI del SIG — ❌ completo

SISRES (4 formatos, `sql`/`DOCUMENTACION.md` §4.19): Acta de Entrega de
Equipos (G-TECN-F 028/031), Diagnóstico de Mantenimiento de Equipos
(G-TECN-F 047), Baja de Dispositivos (G-TECN-F 020), Entrega/Préstamo de
Equipos Informáticos (G-TECN-F 018). Comparten: firma digital en
`<canvas>` con hash de integridad, firma remota por correo con token de
un solo uso, número de orden autoincremental por formato, buscador que
prediligencia desde Inventario.

Ninguna tabla, ninguna pantalla en SISMANTO. Es TI interno (activos de
cómputo, no equipos biomédicos ni flota) — **dominio distinto a los
cuatro que tengo asignados** (servicios, pacientes, notificaciones,
biomédico). Lo dejo anotado, no lo tomo como propio sin confirmarlo.

---

## 2. Mi dominio (servicios, pacientes, notificaciones, biomédico) — brechas que PARIDAD_REGULACION.md no cubre

Ese documento mira Servicios/Pacientes **desde la óptica de Regulación**
— esto es lo que falta mirando el módulo completo, para cualquier rol.

### 2.1 Valoraciones Médicas — 🟡 parcial, sin auditar a fondo todavía

SISRES: `registroValoracion.php`/`editarValoracion.php`, buscador AJAX
de aeropuertos real en Origen/Destino de vuelo (`includes/
buscarAeropuertoAjax.php`), PDF real (`tcpdf/DescargarValoracion_PDF.php`)
+ envío por correo (`tcpdf/EnviarValoracionCorreo.php`).

SISMANTO tiene `/valoraciones` (tabla `medical_assessments`, migración
039) pero:
- **Origen/Destino de vuelo**: sin el catálogo de aeropuertos (ver 1.3),
  probablemente texto libre — confirmar.
- **PDF descargable**: no encontré generador de PDF para valoraciones
  (sí existe para Hoja de Vida biomédica, `@react-pdf/renderer` — ver
  2.3, así que la librería ya está disponible, falta el documento).
- **Envío por correo**: no verificado.

**Pendiente: revisar el componente de Valoraciones línea por línea antes
de abrir cualquier PR** — esta sección es la menos verificada de todo el
documento, lo marco como tarea para la próxima sesión, no para hoy.

### 2.2 Pacientes — lo que falta más allá de EPS (ya en PR #13)

- **Ciudad en cascada** (`PARIDAD_REGULACION.md` PAC-06, 🟡): el
  catálogo (`MUNICIPIOS_POR_DEPARTAMENTO`) ya existe en
  `src/lib/colombia-geo.ts` y ya está conectado en Servicios — falta en
  Pacientes. Candidato natural para un PR chico, mismo patrón que el de
  EPS (PR #13).
- **Exportar a Excel** (PAC-04, ❌, Prio B): SISRES tiene
  `export/exportExcelPacientes.php`. SISMANTO ya exporta Servicios (PR
  #6, con protección de inyección de fórmulas) — reusar ese patrón para
  Pacientes es mecánico.
- **Eliminar** (PAC-10): SISRES no deja a Regulación eliminar pacientes;
  SISMANTO sí lo deja desactivar. Es una decisión de alcance por rol, no
  de construcción — queda para cuando se revise RBAC completo, no es
  "falta construir algo".

### 2.3 Inventario Biomédico + Mantenimiento + Hoja de Vida — 🟡, con un hueco real encontrado hoy

- Hoja de Vida con PDF: **✅ ya existe** (`@react-pdf/renderer`,
  confirmado en el código — `ESTADO_INTEGRACION.md` de `aeromanto` decía
  que el formato visual no era un espejo exacto de SISRES; no re-verificado
  hoy si se corrigió).
- Mantenimiento (`biomedical_maintenance`, `maintenance_categories`
  reusado del patrón de flota): ✅ existe.
- **Vencimiento de Parche (BIOMÉDICA) — ❌ no encontrado.** SISRES tiene
  dos campos independientes (`ultimoVencimientoParche`/
  `ultimoVencimientoParchePediatrico`, adulto y pediátrico, sección 4.5
  de `DOCUMENTACION.md`) con semáforo propio y dos tipos de alerta en el
  correo de vencimientos. No encontré ninguna columna ni referencia a
  "parche" en `040_sisres_inventario_biomedico.sql` ni en el código de
  `equipos`/`inventario-biomedico.ts`. **Esto es un hueco real, no una
  decisión — candidato a PR** (columna nueva + semáforo, patrón ya
  resuelto en SISRES que se puede portar directo).
- **Alertas de vencimiento de equipos biomédicos por correo — ❌ no
  encontrada.** SISRES manda un correo periódico (`includes/
  alertasInventarioNotificacion.php`) con mantenimiento/calibración/parche
  próximos a vencer, por área. SISMANTO sí tiene esto para **vehículos**
  (`vehicle_maintenance_alerts`, y ahora PR #12 lo manda por correo) pero
  no encontré el equivalente para equipos biomédicos. Candidato a PR,
  reusando el patrón recién construido en PR #12 (`src/lib/notifications/
  expiry-digest.ts`) — mismo mecanismo, tabla de origen distinta.

### 2.4 Notificaciones — ✅ en su mayoría, un par de huecos menores

- WhatsApp de servicios (`servicio_programado`/`servicio_en_curso`/
  `servicio_terminado`, solo Medicina Domiciliaria): ✅ ya conectado
  (confirmado en `servicios-medicos.ts`).
- Correo de vencimientos de flota: ✅ (PR #12, recién mergeado a `dev`
  vía... revisar si ya se mergeó o sigue en PR).
- **Correo de vencimientos biomédicos**: ❌ — ver 2.3.
- **"Actualizar mis datos" por enlace público con token** (`SRV-19` de
  `PARIDAD_REGULACION.md`, ya trackeado ahí): ❌. Nota de seguridad
  propia: en SISRES esto se corrigió el 17-18/09 para usar un token
  opaco de 256 bits en vez del id/cédula crudo — si se construye acá,
  hacerlo con ese mismo criterio desde el diseño, no como algo a
  corregir después.
- **Campañas WhatsApp masivas**: ✅ ya existe (`comunicaciones`,
  `campanas.ts`) — no audité el detalle fino (plantillas, lotes,
  webhook de entregas) porque no es parte de las brechas reportadas por
  nadie hasta ahora; queda pendiente si se necesita a fondo.

---

## 3. Diferencias de arquitectura ya decididas (no son "huecos" a cerrar)

- **Permisos dinámicos configurables en runtime** (SISRES:
  `adminPermisos.php`, matriz editable por Admin sin deploy) — SISMANTO
  usa RLS estático, decisión ya tomada en `RBAC_INTEGRACION.md` (repo
  `aeromanto`): *"no se replica por defecto... si después de la
  migración el equipo extraña esa flexibilidad, se evalúa como una
  iniciativa aparte"*. No construir esto sin que el equipo lo pida
  explícitamente — no es un gap, es un tradeoff ya asumido.
- **Campos Obligatorios Configurables** (transversal a 9 módulos en
  SISRES): SISMANTO valida con Zod estático — mismo patrón de decisión
  que arriba, confirmado en `PARIDAD_REGULACION.md` SRG-24 ("no se
  migra"). No construir sin pedido explícito.

---

## 4. Resumen priorizado — candidatos reales a PR, en mi dominio

Orden sugerido (no vinculante, a discutir con el equipo):

1. **Vencimiento de Parche BIOMÉDICA** (2.3) — hueco real confirmado,
   patrón ya resuelto en SISRES, PR chico (columna + semáforo).
2. **Correo de vencimientos biomédicos** (2.3) — reusa directo el
   mecanismo de PR #12, solo cambia la tabla de origen.
3. **Ciudad en cascada en Pacientes** (2.2) — mismo patrón que EPS
   (PR #13), catálogo ya existe.
4. **Exportar Pacientes a Excel** (2.2) — reusa el patrón ya construido
   para Servicios (PR #6).
5. **Auditar Valoraciones a fondo** (2.1) — antes de tocar código ahí,
   falta leer el módulo completo, es el menos verificado de este
   documento.
6. **Tickets de Tecnología** (1.1) — el más grande de todos, sin dueño
   asignado en ningún documento del equipo todavía. Antes de arrancar,
   confirmar con Daniel/David si me lo asignan a mí o se reparte.

No incluyo aquí nada de Captación/Aeropuertos/Formatos TI (sección 1) —
son decisión de negocio (⛔ o dominio ajeno), no trabajo listo para
tomar.
