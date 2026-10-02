# Historial de cambios de SISMANTO

Lo genera `npm run release` a partir de los archivos de `changelog/unreleased/`. No se edita a mano (ver `changelog/README.md`).

## v0.4.0 — 2026-10-02

Migraciones incluidas: 087, 089, 090, 091, 092, 093, 094, 095, 096, 097, 098, 099, 100, 101, 102, 103, 104, 105, 106, 107, 108, 110.

### Funcionalidades

- **admin** — Nueva pantalla Administración del sistema → Integraciones: el administrador escribe la cuenta y la llave de ProTrack365 (rastreo GPS), la plantilla de WhatsApp del aviso de ubicación y la llave de Google Maps, sin esperar un despliegue. Las llaves nunca se muestran completas y hay un botón para probar la conexión con ProTrack365. _Roles: ADMIN. Migración: 104._
- **admin** — En Administración → Permisos, el administrador elige qué módulos del menú ve cada rol, sin esperar un despliegue. Si alguien abre un módulo que se le ocultó, el sistema lo lleva a otro que sí tenga. _Roles: ADMIN. Migración: 107._
- **captacion** — En Captación aeroportuaria hay un botón «Informes» con los informes ACM, Aerocivil, PME y PAE de SISRES, calculados con las captaciones del período y el aeropuerto elegidos, listos para imprimir. _Roles: ADMIN, ANALISTA, COORDINACION, REGULACION, MEDICO, AUXILIAR_ENFERMERIA._
- **combustible** — Carga semanal de combustible desde la web: se sube el Excel del proveedor tal cual, se ve una vista previa (nuevas, ya existentes, errores, km sospechosos, placas desconocidas) y se confirma. Repetir o solapar con la semana anterior no duplica. Actualiza el kilometraje de cada vehículo con la lectura válida más reciente y muestra la fecha de la última carga. _Roles: ADMIN, ANALISTA. Migración: 093._
- **coordinacion** — Coordinación tiene su propio inicio: resumen operativo de servicios de su CRA (Bogotá solo Bogotá, Medellín solo Medellín), vehículos operando hoy con su tripulación y servicios asignados, y accesos a informes. Coordinación pasa a ver solo su centro (se asigna en Administración → Usuarios), puede consultar y exportar la base de servicios, y su menú ya no muestra Equipos biomédicos, Comunicaciones ni Captación aeroportuaria. _Roles: COORDINACION, ADMIN._
- **dashboard** — Dashboard y Tablero ejecutivo se organizan en pestañas: Vehículos y Operación, Servicios, Biomédicos y Financiero (cada rol ve solo las suyas). La pantalla de Coordinación se fusionó en «Vehículos y Operación» y `/coordinacion` redirige al Dashboard. El menú lateral gana contraste (grupo e ítem activo). _Roles: ADMIN, GERENCIAL, ANALISTA, MANTENIMIENTO, COORDINACION._
- **equipos** — Al registrar un mantenimiento biomédico aparece la lista de chequeo del tipo de equipo (o la general), con todos los ítems en «Cumple» para desmarcar los que no cumplen. Las 47 listas de SISRES vienen cargadas y se administran en Equipos → Listas de chequeo. _Roles: ADMIN, MANTENIMIENTO, ANALISTA. Migración: 097._
- **equipos** — Cada equipo biomédico puede tener documentos adjuntos (Registro INVIMA, manuales, guías, fichas técnicas, certificados) en PDF, JPG o PNG de hasta 15 MB. Se ven y se suben desde la pestaña «Documentos» de la hoja de vida y al registrar un mantenimiento. _Roles: ADMIN, MANTENIMIENTO, ANALISTA, COORDINACION, VISTA. Migración: 099._
- **equipos** — Al registrar un mantenimiento biomédico, la descripción, las observaciones y las observaciones de reparación tienen «Usar plantilla…» para pegar un texto predefinido. Si el campo ya tiene texto, se puede reemplazar o agregar al final. Las plantillas se administran en Equipos → Plantillas de texto. _Roles: ADMIN, MANTENIMIENTO, ANALISTA. Migración: 098._
- **equipos** — El administrador elige a qué correos llega el aviso diario de vencimientos de cada área del inventario (Biomédica y Sistemas). Los equipos de Sistemas ahora también avisan a los correos que se configuren; en Biomédica, si no se configura nada, sigue llegando a los mismos usuarios de antes. _Roles: ADMIN. Migración: 100._
- **flota** — En la ficha de cada vehículo se pueden registrar el SOAT, la póliza y la revisión técnico-mecánica reales, con su vigencia, valor, fecha de pago, proveedor y número de documento. Un registro real reemplaza el estimado de esas fechas. _Roles: ADMIN, ANALISTA, MANTENIMIENTO. Migración: 089._
- **flota** — El costo por vehículo (dashboard y KPIs) sale de una sola función de la base. SOAT, póliza y RTM pasan a registrarse con fecha de vigencia y su valor se reparte por día; los valores actuales quedan marcados como estimados hasta cargar los reales. _Roles: ADMIN, ANALISTA, GERENCIAL, REGULACION, MANTENIMIENTO, COORDINACION. Migración: 089._
- **kpis** — KPIs y Métricas suma una sección «Mantenimiento y operación»: cumplimiento del preoperacional, combustible (galones, costo y costo por galón), hojas de vida y documentos al día, y costo por km con el km actual de cada vehículo. _Roles: ADMIN, GERENCIAL, ANALISTA._
- **login** — En la pantalla de inicio de sesión hay un enlace «¿Olvidó su contraseña?»: con la cédula llega al correo registrado un código de 6 dígitos, válido 15 minutos, para poner una contraseña nueva sin pedírsela a un administrador. _Roles: todos. Migración: 102._
- **menu** — En el menú lateral, Aerolíneas y Aeropuertos pasan de «Pacientes» a «Administración del sistema», y «Coordinación» deja de aparecer para el administrador (que puede verla con «Ver como»). _Roles: todos._
- **ovem** — El portal OVEM se actualiza solo cada 30 segundos y te avisa cuando Regulación te asigna un servicio; el vehículo de hoy llega preseleccionado, el preoperacional guarda tu borrador y pide revisar el resumen antes de enviar. _Roles: OVEM._
- **pacientes** — El administrador puede volver obligatorios campos opcionales del formulario de pacientes (celular, EPS, dirección, fecha de nacimiento y otros) desde «Configurar campos obligatorios». Los campos elegidos se marcan con * y no se puede guardar sin llenarlos. _Roles: ADMIN. Migración: 101._
- **preoperacional** — El preoperacional tiene dos listas: ambulancia (TAB y TAM) y automóvil o van (DOMI, VAN y ADMIN). Cada vehículo responde solo los ítems de su tipo; un vehículo sin tipo responde la lista completa. _Roles: OVEM, ADMIN. Migración: 096._
- **preoperacional** — Motor de alertas del preoperacional: las fallas se vuelven novedades automáticas. Los hallazgos críticos (sin aceite de motor, fuga de líquidos, frenos, dirección, cinturón, SOAT o técnico-mecánica vencidos) sacan el vehículo de servicio con fecha e historial; el resto queda como novedad abierta. En «Reportar novedad» el OVEM puede marcar un hallazgo crítico en un toque. _Roles: OVEM, REGULACION, MANTENIMIENTO, ADMIN. Migración: 094._
- **preoperacional** — El inicio de Coordinación muestra el preoperacional de hoy de su CRA: cuántos vehículos ya lo hicieron, cuáles faltan y cuáles lo hicieron con fallas. _Roles: COORDINACION._
- **preoperacional** — La sala de control de Regulación muestra el preoperacional de hoy: cuántos vehículos con tripulación ya lo hicieron, cuáles faltan (en rojo pasadas las 08:00) y cuáles lo hicieron con fallas. _Roles: REGULACION, ADMIN, ANALISTA._
- **proveedores** — En Proveedores se ven todos los prestadores, también los inactivos, con su estado y un filtro por estado; antes solo aparecían 3 de 1.332. Administradores y analistas pueden crear y editar prestadores desde ahí. _Roles: ADMIN, ANALISTA, REGULACION._
- **regulacion** — Regulación tiene «Programación del día»: cada vehículo con 1 o 2 conductores titulares, ajustes de un solo día o definitivos, y vista por vehículo o por conductor. Cada día queda registrado quién operó qué vehículo (hoy y mañana se completan solos cada madrugada), para cruzarlo después con novedades y daños. El preoperacional «esperado» sale de esta programación. _Roles: ADMIN, REGULACION, ANALISTA, COORDINACION, GERENCIAL, MANTENIMIENTO. Migración: 108._
- **regulacion** — En la sala de control ahora armas la tripulación de un vehículo (OVEM, médico y auxiliar) en un solo diálogo con búsqueda y puedes repetir la de ayer; los botones dicen «Marcar fuera de servicio» / «Marcar operativo» con confirmación y «Deshacer», los errores se ven dentro del diálogo, los servicios retrasados se marcan con borde rojo, «Nuevo servicio» abre el formulario directo y los avisos sonoros de servicios también suenan en esta pantalla. _Roles: ADMIN, REGULACION, ANALISTA._
- **servicios** — Nuevo «Cotizador de rutas» en Operación: se calcula la ruta con tráfico en Google Maps (origen, punto intermedio y destino), se elige una de las alternativas y se guarda una cotización numerada (km × valor por km + valor adicional) que se descarga en PDF con el mapa del trazo, se imprime o se envía por correo. _Roles: ADMIN, REGULACION, ANALISTA. Migración: 106._
- **servicios** — El Excel de Servicios trae a la derecha los datos del paciente (documento, nombres, nacimiento y edad, dirección, RH, EPS, contacto y estado) y la columna «PACIENTE REGISTRADO». Solo para los roles que ya pueden exportar pacientes. _Roles: ADMIN, REGULACION, COORDINACION, ANALISTA._
- **servicios** — En la lista de servicios, la placa de un servicio en PROGRAMADO o CURSO abre el mapa con la ubicación en vivo de la ambulancia (GPS ProTrack365). Desde ahí se le puede enviar al paciente, por WhatsApp y correo, un enlace para ver la ambulancia en camino, válido 24 horas mientras el servicio esté activo. _Roles: ADMIN, REGULACION, ANALISTA, MEDICO, AUXILIAR_ENFERMERIA, VISTA. Migración: 105._
- **servicios** — En Servicios, «Nuevo servicio» abre el formulario directo (también desde /servicios?nuevo=1) con la etapa PROGRAMADO por defecto, errores junto a cada campo con un resumen que lleva al campo, opción «Guardar y crear otro», confirmaciones propias en lugar de las del navegador y, en el celular, una lista de tarjetas con menú de acciones. _Roles: ADMIN, REGULACION, MEDICO, AUXILIAR_ENFERMERIA, ANALISTA._
- **servicios** — La lista de Servicios se ve más compacta (filtros en una franja, barra única con paginación, exportar y registrar, filas más bajas). Se puede filtrar por ciudad —Bogotá, Medellín o ambas— en Servicios, Estadísticas de servicios, Tablero ejecutivo y la sala de control. La ciudad es la del CRA que recibió la solicitud, y al registrar un servicio nuevo se propone la del CRA de quien registra. _Roles: ADMIN, REGULACION, MEDICO, AUXILIAR_ENFERMERIA, ANALISTA, VISTA, GERENCIAL, COORDINACION._
- **servicios** — El administrador puede agregar o quitar opciones de siete listas del formulario de servicios (turno, aislamiento, perímetro, finalidad del traslado, método de pago y motivos externo e interno) desde «Configurar opciones del formulario», sin esperar un despliegue. Los servicios que ya tenían guardada una opción quitada la conservan. _Roles: ADMIN. Migración: 091._
- **servicios** — En Servicios, dentro de «Más filtros», se puede buscar los servicios sin gestionar: los que siguen en PROGRAMADO o CURSO después de cierta cantidad de días, meses o años desde su hora programada. El Excel exporta lo mismo que se ve en pantalla. _Roles: ADMIN, REGULACION, ANALISTA, MEDICO, AUXILIAR_ENFERMERIA, VISTA._
- **servicios** — El administrador puede activar o apagar el aviso de servicios estancados y elegir después de cuántas horas en PROGRAMADO o en CURSO se marca un servicio con ⏰, desde Configuración → Servicios. Antes estaba fijo en 4 horas. _Roles: ADMIN. Migración: 103._
- **usuarios** — Carga masiva de usuarios desde una plantilla Excel (cédula, nombre, rol, centro operativo), con vista previa. Cada persona entra con su cédula o con un código de acceso de 6 números y una clave inicial, y el sistema le obliga a elegir su propia clave en el primer ingreso. _Roles: ADMIN, ANALISTA. Migración: 095._
- **vehiculos** — La página de Vehículos muestra las alertas de las hojas de vida: fuera de servicio por más de 7 días o sin fecha de inicio, SOAT y técnico-mecánica vencidos o por vencer, y hojas de vida incompletas con lo que les falta. _Roles: ADMIN, MANTENIMIENTO, ANALISTA, REGULACION._
- **vehiculos** — Base para la hoja de vida de vehículos: tipo de vehículo, color, propietario, fecha de matrícula y un kilometraje único por vehículo (siempre la lectura más alta registrada; las alertas del plan de mantenimiento corren contra ese valor). Se permiten hojas de vida incompletas, se agregan los costos de impuesto vehicular, leasing y GPS, y las especificaciones técnicas por modelo. _Roles: ADMIN, ANALISTA, MANTENIMIENTO. Migración: 092._
- **vehiculos** — Carga masiva de la hoja de vida de vehículos desde la plantilla Excel: vista previa antes de escribir, reporte de errores por fila y de hojas de vida incompletas, sin duplicar al repetir la carga. Incluye vehículos, documentos con costos y último mantenimiento por tarea del plan. _Roles: ADMIN, ANALISTA._

### Correcciones

- **admin** — En Bitácora, el filtro «Módulo» ahora incluye «role_switch» (los cambios de «Ver como» del administrador), que se registraban pero no se podían filtrar. _Roles: ADMIN, ANALISTA._
- **admin** — Vuelve a aparecer «Integraciones» en el menú de Administración; la página seguía funcionando, pero se había perdido su entrada en el menú. _Roles: ADMIN._
- **admin** — Se cierra una fuga de seguridad: ya no se puede consultar el nombre completo ni el rol de otra persona a partir de su identificador interno, sin haber iniciado sesión. _Roles: ADMIN._
- **dashboard** — Las tarjetas de Costo, Novedades y Próximos vencimientos del dashboard se adaptan a su propio ancho: la cifra no se sale ni se corta y el título y el icono de ayuda no se descuadran. _Roles: ADMIN, GERENCIAL, MANTENIMIENTO, ANALISTA._
- **equipos** — Al registrar un mantenimiento biomédico, la fecha del próximo mantenimiento (o de la próxima calibración) se recalcula según la frecuencia del equipo, y el equipo deja de aparecer «Vencido» y de avisar por correo. Al crear o editar un equipo, si falta la fecha próxima, se calcula sola desde la última. _Roles: ADMIN, MANTENIMIENTO, ANALISTA._
- **graficas** — Las gráficas de KPIs, consumo, soporte y estadísticas son más legibles y accesibles: colores con buen contraste, meta del 95 % en disponibilidad con los vehículos más bajos primero, resumen en texto, tabla «Ver datos» y líneas distinguibles por forma además del color. _Roles: todos._
- **infra** — Las rutas de cron comparan el secreto de autorización de forma segura ante ataques de temporización. Sin cambios visibles en la app. _Roles: ADMIN._
- **infra** — Se registran las migraciones 094, 095 y 096 (motor de alertas de preoperacional, login por código de acceso y checklist por tipo de vehículo), que existían como archivo pero no se estaban aplicando a la base de datos. _Roles: ADMIN._
- **infra** — Las migraciones 100 a 105 vuelven a estar registradas para que se apliquen en producción y en bases nuevas. Sin cambios visibles en la app. _Roles: ADMIN._
- **interfaz** — Mejoras de legibilidad y accesibilidad en toda la aplicación: botones, títulos y textos secundarios con más contraste, bordes de campos visibles, estados (éxito, advertencia) legibles, ventanas emergentes que ya no se cortan en el celular y con botón de cerrar táctil, menú móvil sin tabulación fantasma y enlace «Saltar al contenido», ayudas «?» que abren con un toque, título propio por pantalla y respeto de la preferencia de reducir animaciones. _Roles: todos._
- **login** — En el inicio de sesión se quita el botón «Entrar con mi correo»: el mismo campo acepta cédula o correo. La pantalla vuelve a tener su título principal para lectores de pantalla. _Roles: todos._
- **login** — La pantalla «¿Olvidó su contraseña?» volvió a abrirse sin sesión: una combinación de cambios había quitado su ruta de las públicas y redirigía a inicio de sesión. _Roles: todos._
- **mantenimiento** — En el celular, vehículos y mantenimientos se ven como tarjetas; el detalle del vehículo se abre con teclado, la descripción del mantenimiento se edita con Guardar/Cancelar, y las cargas de archivos revisan solas al elegir el archivo y dicen cuántos registros vas a confirmar. _Roles: ADMIN, MANTENIMIENTO, REGULACION._
- **migracion** — Al migrar los aeropuertos desde SISRES, las coordenadas con tres decimales ya no se multiplican por mil. _Roles: ninguno._
- **ovem** — Entre las 7:00 p. m. y las 11:59 p. m. ya se puede volver a editar el preoperacional y la dotación del día; antes el guardado fallaba en ese horario. _Roles: OVEM._
- **ovem** — El preoperacional guarda el resultado de todos los ítems, pide describir cada falla y solo se puede registrar o corregir el del día. _Roles: OVEM, ADMIN, ANALISTA. Migración: 090._
- **pacientes** — Se agiliza la verificación de permisos sobre Pacientes para que no se vuelva a frenar como pasó con Servicios en septiembre, a medida que crece la base. Sin cambios visibles. _Roles: ADMIN, REGULACION, COORDINACION, ANALISTA, MEDICO, AUXILIAR_ENFERMERIA, VISTA. Migración: 110._
- **preoperacional** — El preoperacional se responde ítem por ítem (se quita «Marcar todo OK»). Una falla que ya está reportada no abre otra novedad cada día: la primera basta hasta que se cierre. El OVEM ya no puede sacar un vehículo de servicio a criterio: solo un hallazgo crítico de la lista del sistema lo hace, y en ese caso se avisa de inmediato por correo a Regulación y Coordinación del CRA y a los responsables de Mantenimiento. _Roles: OVEM, REGULACION, COORDINACION, MANTENIMIENTO._
- **seguridad** — Se agrega una política de seguridad de contenido (CSP) en modo de solo reporte, sin bloquear nada, para prepararla antes de imponerla; y un límite de intentos a la firma remota de Formatos TI, que es pública. _Roles: ADMIN._
- **seguridad** — Las alertas automáticas (vencimientos, biomédico, facturas) vuelven a ejecutarse, se cierra un endpoint sin control de acceso y se añaden cabeceras de seguridad. _Roles: ADMIN._
- **servicios** — En «Nuevo servicio» y en los demás formularios emergentes ya se puede escribir en los buscadores (paciente, CIE-10, ciudad, cliente) y elegir un resultado. _Roles: todos._
- **servicios** — La lista de Servicios vuelve a cargar con todo el histórico de SISRES, sin el error de tiempo de espera. _Roles: todos. Migración: 087._
- **servicios** — La boleta de salida y el logo de la empresa ahora se validan por el contenido real del archivo, no por lo que declara el navegador; el logo ya no acepta SVG. _Roles: ADMIN, REGULACION, ANALISTA._

### Mantenimiento

- **infra** — La revisión automática de Aegis corre una vez por PR (al abrirlo o marcarlo listo) y no en cada push; para repetirla se usa la etiqueta `re-review`. Sin cambios visibles en la app. _Roles: ADMIN._
- **infra** — Se actualizan dependencias con parches de seguridad (lodash, ws y herramientas de desarrollo); sin cambios visibles. _Roles: ADMIN._
- **soporte** — Se agregan pruebas automáticas para el cálculo de indicadores de soporte técnico (horas laborales, SLA, FCR, MTTR, MTBF y disponibilidad); sin cambios de comportamiento. _Roles: ADMIN, ANALISTA, COORDINACION, TECNICO._
- **ui** — Base de componentes de formularios y avisos (campos con error asociado, confirmaciones, avisos con «Deshacer», carga de archivos, estados vacíos y tablas que se vuelven tarjetas en el celular) para las próximas pantallas. Sin cambios visibles todavía. _Roles: ninguno._

## v0.3.0 — 2026-09-25

### Funcionalidades

- **infra** — Los administradores pueden ver el sistema como cualquier otro rol («Ver como…») para probar permisos, solo en dev y staging. _Roles: ADMIN._
- **menu** — El menú lateral tiene secciones desplegables que recuerdan lo que abriste. _Roles: todos._

### Correcciones

- **auditoria** — En la bitácora ahora se puede filtrar por todos los módulos que registran (vehículos, regulación, mantenimientos, novedades, clientes, proveedores, capacitaciones y cargas masivas). _Roles: ADMIN._
- **flota** — Las fechas y los costos fijos (SOAT, póliza y técnico-mecánica) ahora se calculan igual en cualquier computador y en producción: el dashboard y los KPIs muestran la misma cifra, las fechas ya no aparecen un día antes, y el resumen del día y las estadísticas de servicios cuentan el día completo de Colombia. _Roles: todos._
- **infraestructura** — Al crear un ambiente nuevo desde cero (por ejemplo un staging vacío) ya no falla la instalación de la base de datos en la migración de captación. _Roles: ninguno._

### Mantenimiento

- **infra** — Los PR piden la revisión automáticamente al abrirse. _Roles: ninguno._

## v0.2.0 — 2026-09-25

Migraciones incluidas: 065, 066, 067, 068, 069, 070, 071, 072, 073, 074, 075, 076, 077, 078, 079, 080, 081, 082, 083, 084, 085, 086.

### Funcionalidades

- **auditoria** — Nueva bitácora de auditoría: quién hizo qué y cuándo en servicios, pacientes, valoraciones, tickets, campañas, formatos y exportaciones. _Roles: ADMIN. Migración: 077, 081, 082._
- **biomedico** — Equipos biomédicos: vencimiento del parche (adulto y pediátrico) y aviso por correo de vencimientos. _Roles: ADMIN, MANTENIMIENTO, COORDINACION, ANALISTA. Migración: 065, 066, 067._
- **captacion** — El Administrador puede elegir qué campos de la captación son obligatorios («Configurar campos»). _Roles: ADMIN. Migración: 086._
- **captacion** — La captación tiene PDF individual, la aerolínea se elige del catálogo y cada registro o descarga queda en la bitácora. _Roles: ADMIN, ANALISTA, COORDINACION, REGULACION, MEDICO, AUXILIAR_ENFERMERIA. Migración: 085._
- **captacion** — Nuevo módulo «Captación aeroportuaria»: registra las atenciones en aeropuertos y descarga el reporte SISPRO del mes en Excel, con las mismas columnas del libro. _Roles: ADMIN, ANALISTA, COORDINACION, REGULACION, MEDICO, AUXILIAR_ENFERMERIA. Migración: 080, 081._
- **comunicaciones** — Campañas de WhatsApp: pausar, reanudar y cancelar, adjuntar imagen o documento, elegir destinatarios desde la base de datos y ver el estado de entrega y lectura. _Roles: ADMIN, COORDINACION. Migración: 078, 079, 080._
- **equipos** — Equipos: filtros por área, tipo y sanidad, y búsqueda por serie en el inventario de Sistemas. _Roles: ADMIN, MANTENIMIENTO, COORDINACION, ANALISTA, VISTA._
- **formatos-ti** — Formatos TI: acta de entrega, diagnóstico, baja y préstamo de equipos, con firma digital y firma remota por correo. _Roles: según los permisos del módulo. Migración: 070, 071, 072, 073, 074._
- **infra** — Al pie del menú lateral aparece la versión y el commit que estás usando; al pulsarla se abre el historial de cambios. _Roles: todos._
- **pacientes** — Pacientes: catálogo real de EPS, ciudad según el departamento, exportar a Excel, y búsqueda y paginación en el servidor. _Roles: ADMIN, REGULACION, COORDINACION, ANALISTA, MEDICO, AUXILIAR_ENFERMERIA, VISTA._
- **roles** — Nuevos roles TECNICO (gestiona tickets) y AEROPUERTO (solo registra y consulta sus tickets), con el acceso limitado también a nivel de base de datos. _Roles: TECNICO, AEROPUERTO. Migración: 076._
- **soporte** — Configuración del soporte (catálogos, SLA, horario laboral, correos y disponibilidad) para el Administrador, e indicadores de respuesta, cumplimiento del SLA y resolución. _Roles: ADMIN, ANALISTA, COORDINACION. Migración: 067._
- **soporte** — Avisos por correo de los tickets (nuevo, tomado, resuelto y reabierto); se activan cuando el correo institucional esté configurado. _Roles: todos._
- **soporte** — Nueva pantalla «Gestión de tickets»: tomar, registrar el primer contacto, cambiar estado y prioridad, resolver y registrar tickets a nombre de otra persona. _Roles: ADMIN, ANALISTA, COORDINACION. Migración: 066._
- **soporte** — Ya puedes pedir soporte técnico desde el menú «Soporte»: registra un ticket con imagen adjunta, sigue su estado y reábrelo si no quedó resuelto. _Roles: todos. Migración: 065._
- **valoraciones** — Valoraciones: certificado en PDF, eliminación segura, catálogos de aerolíneas y aeropuertos, y envío del certificado por correo. _Roles: ADMIN, MEDICO, ANALISTA, VISTA. Migración: 068, 069, 075._

### Correcciones

- **captacion** — Se cargó el catálogo CIE-10 y el reporte SISPRO ahora muestra el nombre del diagnóstico. _Roles: ADMIN, ANALISTA, COORDINACION, REGULACION, MEDICO, AUXILIAR_ENFERMERIA. Migración: 083._
- **estadisticas** — Las estadísticas de servicios y la exportación de campañas ya no se cortan en 1.000 registros. _Roles: ADMIN, GERENCIAL, ANALISTA, COORDINACION._
- **flota** — Coordinación vuelve a ver la flota de vehículos. _Roles: COORDINACION. Migración: 084._
- **ia** — El chat con IA y los insights de IA vuelven a responder a los roles que tienen permiso (antes rechazaban a todos). _Roles: ADMIN, GERENCIAL, COORDINACION._
- **seguridad** — Las páginas restringidas ahora también se protegen en el servidor: un rol sin permiso ya no puede abrirlas escribiendo la dirección. _Roles: todos._

### Mantenimiento

- **infra** — Procesos manuales, con revisor y confirmación escrita, para migrar y desplegar producción, con guía paso a paso. _Roles: ninguno._
