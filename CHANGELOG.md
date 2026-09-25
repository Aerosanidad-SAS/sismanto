# Historial de cambios de SISMANTO

Lo genera `npm run release` a partir de los archivos de `changelog/unreleased/`. No se edita a mano (ver `changelog/README.md`).

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
