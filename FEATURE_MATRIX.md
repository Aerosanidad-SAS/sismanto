# FEATURE_MATRIX — Aeromanto vs SISRES

**Fecha:** 2026-07-16
**Fuente:** `aeromanto/AUDIT_aeromanto.md` + `sisres/AUDIT_sisres.md`
**Propósito:** evitar duplicación de trabajo antes de diseñar la integración. No implica ninguna decisión de arquitectura — eso está en `RECOMENDACION_STACK.md`.

Clasificación usada:
- **exclusivo-aeromanto** / **exclusivo-sisres** — solo un sistema lo tiene, sin equivalente funcional en el otro.
- **duplicado** — ambos sistemas resuelven lo mismo con reglas de negocio equivalentes.
- **duplicado-parcial** — ambos tocan el mismo dominio pero con alcance, reglas o modelo de datos distintos → **casos de riesgo real** para la integración.

---

## Vehículos / Placas — atención especial

Este es el cruce más sensible: **ambos sistemas casi seguro referencian la misma flota física de ambulancias** (Aeromanto documenta 31-50 vehículos; SISRES tiene 36 filas reales en `movil` — **23 activas / 13 inactivas**, conteo exacto confirmado 2026-07-17, `RESPUESTAS_LEON.md` Q4). No son la misma tabla ni están sincronizadas hoy.

**Discrepancia pendiente de confirmar:** el "31-50" de Aeromanto solo es consistente con el total de SISRES (36) si Aeromanto tampoco filtra por estado activo/inactivo. Si el "31-50" de Aeromanto ya son solo vehículos activos, hay una brecha real (¿vehículos que un sistema tiene y el otro no?) que hay que investigar antes de dar por buena la reconciliación de placas — pendiente que Daniel confirme el conteo real de `vehicles` en Aeromanto y si distingue estado operativo.

**Sincronización durante la convivencia:** confirmado con evidencia (no solo estimado) que `movil` se edita con muy poca frecuencia — cero entradas en `log_sistema` (tabla de auditoría, instrumentación confirmada activa) en las últimas 7 semanas. Alcanza con acordar manualmente "actualizalo en los dos sistemas" durante la integración, no hace falta un mecanismo de sincronización continua (`RESPUESTAS_LEON.md` Q2).

| Aspecto | Aeromanto (`vehicles`) | SISRES (`movil`) |
|---|---|---|
| Campo de placa | `placa VARCHAR(10) UNIQUE NOT NULL` | `placa` (sin constraint de unicidad documentado) |
| Formato canónico forzado | **Sí** — mayúsculas, sin espacios, forzado por migración `023_normalize_placas.sql` (corrigió duplicados lógicos reales, ej. `OKL227`/`OKL 227`) | **No** — sin evidencia de normalización a nivel de BD o de inserción |
| Identificador primario del vehículo | `id UUID` (la placa es un campo único, no la PK) | `id` autoincremental (implícito; la placa es un campo más) |
| Otros campos de identificación | modelo, línea, tipo de llantas, combustible, centro operativo | imeiGps, ciudadPlaca, tipoMovil, marca, número de motor/chasis, color, cilindraje, carrocería |
| Vínculo con otras entidades | `maintenance_records`, `incidents`, `fuel_logs`, `mileage_logs`, `vehicle_assignments`, `vehicle_status_history` — todo por `vehicle_id UUID` (FK real) | `inventario.placa` (vínculo lógico, no FK), `mantenimiento.inventario_id` (FK real, pero a `inventario`, no a `movil` directamente) |
| Uso en integración externa | El pipeline de extracción de facturas por IA busca vehículo por placa normalizada (`ilike`) | Ninguna integración externa usa la placa como clave de búsqueda |

**Implicación directa:** cruzar los `~36-50` vehículos entre ambos sistemas **requiere un paso de normalización y mapeo manual o semi-automático** (mismo algoritmo que ya usó Aeromanto en su migración 023: uppercase + strip espacios) antes de poder hacer cualquier JOIN o sincronización. No se puede asumir que las placas ya coinciden carácter a carácter. Se recomienda, como primer paso técnico de cualquier camino de integración, generar un mapeo `placa_normalizada → {aeromanto.vehicles.id, sisres.movil.id}` y detectar huérfanos en cualquiera de los dos lados (vehículo en un sistema y no en el otro).

---

## Matriz de features

| Feature | Aeromanto | SISRES | Clasificación | Notas |
|---|---|---|---|---|
| **Gestión de flota de vehículos (CRUD)** | ✅ `vehicles` | ✅ `movil` | **duplicado-parcial** | Ver detalle arriba. Aeromanto modela el vehículo como activo operativo (estado, centro, disponibilidad); SISRES lo modela con más detalle documental (motor, chasis, pase, multas) porque también es objeto de trámite legal/administrativo. Ningún sistema es superset del otro. |
| **Alertas de vencimiento de documentos (SOAT/RTM/Tecno/Pase)** | ✅ vencimiento_rtm/soat en `vehicles`, alertas F-08/backlog F-15 pendiente | ✅ `includes/alertasVehiculos.php`, ya implementado y activo (rangos vencido/crítico/urgente/alerta/aviso) | **duplicado-parcial** | SISRES ya tiene alertas de vencimiento **funcionando en producción**; Aeromanto lo tiene como campos de datos pero la notificación proactiva (F-15) está **pendiente** en su propio backlog. Evitar reconstruir lo que SISRES ya resolvió. |
| **Mantenimientos (preventivo/correctivo)** | ✅ `maintenance_records` + `maintenance_schedule` (plan configurable por km/tiempo) | ✅ `mantenimiento` (preventivo/correctivo/calibración, ligado a `inventario`, no a `movil`) | **duplicado-parcial** | Dominios distintos: Aeromanto mantiene **vehículos**; SISRES mantiene **equipos biomédicos** (inventario), no vehículos. No es tan duplicado como parece a primera vista — ver "Mantenimiento de vehículos" abajo. |
| **Mantenimiento específico de vehículos** | ✅ core del producto | ❌ SISRES no tiene mantenimiento de `movil`, solo de `inventario` (equipos) | **exclusivo-aeromanto** | Confirma que Aeromanto es el sistema de mantenimiento de flota; SISRES no compite en este dominio. |
| **Inventario de equipos biomédicos + hoja de vida** | ❌ no existe en Aeromanto | ✅ `inventario` + `mantenimiento` + PDF de hoja de vida (formato institucional G-TECN-F 003/004) | **exclusivo-sisres** | Dominio completo sin equivalente en Aeromanto. |
| **Kilometraje** | ✅ `mileage_logs`, trigger que impide retroceder el odómetro salvo Admin | ❌ no existe | **exclusivo-aeromanto** | |
| **Consumo de combustible** | ✅ `fuel_logs`, cálculo km/galón | ❌ no existe | **exclusivo-aeromanto** | |
| **Portal del conductor / OVEM (checklist diario, mobile-first)** | ✅ `/ovem`, `daily_checks` | ❌ no existe (SISRES tiene rol OVEM pero sin portal dedicado tipo checklist) | **exclusivo-aeromanto** | Nota: SISRES sí tiene un cargo llamado "OVEM" (cargo 7) pero como operador de servicios médicos, no como conductor con checklist vehicular — **incompatibilidad de nombre, no de función** (ver más abajo). |
| **Asignación conductor↔vehículo** | ✅ `vehicle_assignments`, relación muchos-a-muchos gestionada por Regulación | ❌ no existe un equivalente formal | **exclusivo-aeromanto** | |
| **Novedades/incidentes de vehículo** | ✅ `incidents`, severidad, cierre ligado a mantenimiento, trigger que pone el vehículo FUERA_DE_SERVICIO | ❌ no existe a nivel de `movil` (SISRES tiene "novedadServicio"/"observaciones" en `servicios`, pero es sobre el servicio médico, no sobre el vehículo) | **exclusivo-aeromanto** | |
| **Registro y gestión de servicios médicos/traslados** | ❌ no existe | ✅ `servicios`, módulo central de SISRES (19.110 filas), con roles, etapas, tiempos, notificación WhatsApp | **exclusivo-sisres** | Dominio completo sin equivalente en Aeromanto — es la razón de ser de SISRES. |
| **Pacientes** | ❌ no existe | ✅ `paciente` | **exclusivo-sisres** | |
| **Proveedores** | ✅ `suppliers` (asociados a mantenimientos de vehículos) | ✅ `proveedores` (asociados a inventario/mantenimiento biomédico y a servicios) | **duplicado-parcial** | Mismo concepto genérico ("proveedor") pero con relaciones de negocio distintas — un proveedor de repuestos de ambulancia (Aeromanto) no es necesariamente el mismo tipo de entidad que un proveedor médico/aseguradora (SISRES). Requiere decidir si es un catálogo compartido o dos catálogos con propósitos distintos. |
| **Clientes / aseguradoras** | ❌ no existe | ✅ `clientes` | **exclusivo-sisres** | |
| **Centros operativos / Sedes** | ✅ `operational_centers` (4 centros: CRA_MEDELLIN, CRA_BOGOTA, AIRPLAN, CTG) | ✅ `sede` (17 sedes) | **duplicado-parcial — resuelto 2026-07-17** | **Confirmado con evidencia de BD** (`RESPUESTAS_LEON.md` Q5, no ya solo hipótesis): sí son jerarquías relacionadas. `sede.detalles` de SISRES agrupa las 17 sedes por operador/cliente del contrato, y esos valores coinciden literalmente con los centros operativos de Aeromanto: `INTERASSIST`→`CRA_MEDELLIN`+`CRA_BOGOTA`, `AIRPLAN`→`AIRPLAN` (6 sedes SISRES bajo ese único centro), `OINAC`→probable `CTG` (a confirmar). **Brecha real encontrada:** SISRES también opera bajo `AEROCALI` (Cali) y `ADO` (6 sedes: Cúcuta, Barrancabermeja, Bucaramanga, Santa Marta, Riohacha, Valledupar) — sin equivalente en los 4 centros operativos que documenta Aeromanto hoy. Pendiente confirmar con Daniel si la flota de esas sedes existe en `vehicles` (bajo algún centro existente, mal clasificada) o si Aeromanto simplemente no cubre esos operadores todavía. |
| **Gestión de usuarios + roles** | ✅ `user_profiles` + `roles` (6 roles: ADMIN, GERENCIAL, REGULACION, OVEM, MANTENIMIENTO, COORDINACION), RLS por rol | ✅ `usuarios` + 8 cargos (Administrador, Coordinador, Analista, Regulador/Despachador, Médico, Auxiliar, OVEM, Vista), permisos dinámicos en tabla `permisos` | **duplicado-parcial — en verificación** | León (`RESPUESTAS_LEON.md` Q1) sostiene la hipótesis de que Regulador/Despachador↔REGULACION, Coordinador↔COORDINACION y OVEM↔OVEM son las mismas personas reales (misma operación de despacho vista desde dos ángulos), y dejó las cédulas reales de los 24 usuarios de esos 3 cargos para verificarlo empíricamente. **Aeromanto no guarda cédula en `user_profiles`** (solo `nombre_completo`/`email`) — el cruce pendiente es por nombre, a cargo de Daniel. Si se confirma, la extensión de RBAC reusa esos 3 códigos de rol tal cual y solo se crean `ANALISTA`/`MEDICO`/`AUXILIAR_ENFERMERIA`/`VISTA` como roles nuevos — ver `RBAC_INTEGRACION.md`. |
| **Autenticación** | ✅ Supabase Auth (JWT, sesión refrescada por middleware) | ✅ sesión PHP nativa + `password_verify()`/bcrypt | **duplicado** | Mismo propósito, mecanismos incompatibles entre sí — cualquier unificación de usuarios implica migrar uno de los dos modelos de autenticación completo. |
| **Notificaciones WhatsApp** | ❌ no existe | ✅ WhatsApp Business API (Meta), notificación de estado de servicio + campañas masivas | **exclusivo-sisres** | |
| **Dashboard ejecutivo / KPIs** | ✅ `/kpis`, `/dashboard`, Recharts | ✅ dashboard de estadísticas de servicios, Chart.js | **duplicado-parcial** | Mismo tipo de feature (panel gerencial con gráficos) pero sobre datos completamente distintos (flota vs servicios médicos) — no es redundante, son dos vistas ejecutivas de dominios distintos que probablemente terminan **coexistiendo** en cualquier escenario de integración. |
| **Exportación de reportes (Excel/PDF)** | ⚠️ Pendiente (F-16 en backlog) | ✅ Excel (servicios, pacientes, campañas) + PDF (TCPDF: valoraciones, hoja de vida, informes de mantenimiento) | **exclusivo-sisres (hoy)** | Aeromanto tiene esto como backlog explícito — evaluar si conviene reutilizar el patrón/librería de SISRES (TCPDF) en vez de construir uno nuevo. |
| **Extracción de facturas por IA (OneDrive + Claude)** | ✅ pipeline completo (cron diario, cola `invoice_jobs`) | ❌ no existe | **exclusivo-aeromanto** | Sin equivalente ni necesidad aparente en SISRES. |
| **Chat/Insights con IA** | ✅ `/ai-chat`, `/ai-insights` (Claude) | ❌ no existe | **exclusivo-aeromanto** | |
| **Capacitaciones de personal** | ✅ módulo `capacitaciones` (rol Coordinación) | ❌ no existe | **exclusivo-aeromanto** | No mencionado en `PRD.md` (documentación desactualizada) pero existe en código — ver `AUDIT_aeromanto.md` §7. |
| **Seguimiento GPS de flota** | ❌ no existe | ✅ ProTrack365 + Leaflet, en tiempo real | **exclusivo-sisres** | Feature de flota que **SISRES tiene y Aeromanto no** — caso interesante porque es el dominio "natural" de Aeromanto (flota) pero la capacidad real está del lado de SISRES. |
| **Permisos dinámicos configurables en runtime** | ❌ RLS fijo en migraciones, requiere deploy de SQL para cambiar reglas | ✅ matriz editable en UI por Admin, con historial/revert | **exclusivo-sisres** | Modelo de autorización más flexible operativamente, aunque más frágil técnicamente (listas blancas duplicadas, ver `AUDIT_sisres.md` §7). |
| **Auditoría de acciones (log)** | ⚠️ no se detectó tabla de log genérica equivalente (sí hay `vehicle_status_history` para un caso puntual) | ✅ `log_sistema`, registra INSERT/UPDATE/DELETE/LOGIN | **exclusivo-sisres** | |

---

## Resumen de solapamiento real

De las ~24 features comparadas, el solapamiento **funcional genuino** (mismo problema de negocio, no solo mismo nombre) es bajo:

- **Verdadero duplicado sin matices:** solo autenticación (mecanismo distinto, propósito idéntico).
- **Duplicado-parcial (requieren decisión de negocio antes de tocar código):** vehículos/placas, mantenimientos (dominios distintos que comparten el nombre), proveedores, centros/sedes, usuarios/roles, dashboards.
- **La mayoría de las features son exclusivas de un solo sistema** — Aeromanto es un sistema de gestión de flota (activo físico), SISRES es un sistema de gestión de servicios médicos (operación clínica) que además carga con inventario biomédico y GPS de flota como features secundarias.

Esto sugiere que **no se trata de dos sistemas redundantes compitiendo por el mismo problema**, sino de dos sistemas con un único punto de solapamiento real y significativo: **la flota de ambulancias es la misma flota física**, referenciada de forma independiente en ambos. El resto del "duplicado-parcial" (proveedores, centros, usuarios) es solapamiento de infraestructura de datos (catálogos genéricos), no de lógica de negocio.
