# RECOMENDACION_STACK — Aeromanto + SISRES

**Fecha:** 2026-07-16
**Fuente:** `aeromanto/AUDIT_aeromanto.md`, `sisres/AUDIT_sisres.md`, `FEATURE_MATRIX.md`
**Rol de este documento:** presentar evidencia y tradeoffs de los tres caminos posibles. **No es una decisión** — la decisión final la toma el negocio. No se ha hecho ningún merge de código; ambos repos siguen en `audit/integration-analysis` sin tocar `main`.

---

## 0. Punto de partida (resumen de evidencia)

- El solapamiento **funcional real** entre los dos sistemas es bajo (`FEATURE_MATRIX.md`): la mayoría de las features son exclusivas de un solo sistema. El único punto de solapamiento genuino y de alto riesgo es la **flota de vehículos/placas** (Aeromanto `vehicles`, SISRES `movil` — misma flota física, ~36 unidades, sin normalización de placa compatible entre sí hoy).
- Aeromanto: Next.js 14 + TypeScript + Supabase (Postgres/RLS), ~24.000 líneas TS/TSX, 137 archivos, sin tests automatizados, con un pipeline de negocio no trivial (extracción de facturas por IA) **atado a infraestructura serverless de Vercel** (Cron nativo, `maxDuration`, webhook HTTPS entrante de Microsoft Graph que expira cada ~3 días).
- SISRES: PHP vanilla + MySQL, ~22.600 líneas PHP, 146 archivos, sin framework ni gestor de dependencias, sin tests automatizados, con un sistema de permisos dinámicos configurable en runtime (más flexible operativamente que el RLS estático de Aeromanto) y una auditoría de seguridad interna activa y disciplinada (4 rondas documentadas, sin inyecciones SQL conocidas pendientes). Corre en hosting compartido HostGator (MySQL puro, sin CI/CD, sin contenedores).
- **Ninguna integración externa de SISRES está atada de forma dura a PHP** — WhatsApp Cloud API, ProTrack365 GPS y SMTP son todas HTTP estándar, portables a cualquier stack. El único elemento realmente atado al entorno actual es la configuración de sesión vía `php.ini`/`.user.ini` (trivial, prescindible).
- **La integración que sí está atada de forma dura a un entorno específico es la de Aeromanto** (OneDrive/Microsoft Graph + Vercel Cron) — esto es relevante sobre todo para la opción (c).

---

## 1. Las tres opciones

### (a) Migrar SISRES hacia el stack de Aeromanto (Next.js + Supabase)

**Qué implica:** reescribir los 146 archivos PHP de SISRES (~22.600 líneas) como módulos Next.js/React/TypeScript, portar el esquema MySQL a Postgres, migrar ~19.110 filas de `servicios` + `paciente` (datos médicos, requiere cuidado de integridad y posiblemente cumplimiento normativo) + `inventario` (885 filas) + catálogos (`cie10`: 12.711 filas, `subregiones`: 1.119 filas), reconstruir el generador de PDF (TCPDF → librería Node equivalente), portar el worker de campañas WhatsApp, y **rediseñar el sistema de permisos dinámicos** (hoy editable en runtime por el Admin desde una UI) como políticas RLS — lo cual es un downgrade funcional a menos que se invierta en construir una capa de autorización configurable en la app (no en RLS puro), replicando lo que SISRES ya tiene hoy.

**Bloqueantes/riesgos duros:** ninguno técnico de integración externa (ver §0). El riesgo es **volumen y complejidad de negocio**, no imposibilidad técnica.

**Riesgos específicos:**
- Pérdida de flexibilidad operativa del sistema de permisos si se reemplaza por RLS estático (cualquier cambio de permiso pasaría de "click en una UI" a "requiere deploy de migración SQL").
- Migración de datos médicos/clínicos (`paciente`, `servicios`) es sensible — requiere plan de migración con validación, no solo un `INSERT ... SELECT`.
- Reescribir manualmente ~40 archivos `includes/insertarXxx.php`/`modificarXxx.php` con lógica condicional por rol y por `tipoServicio` (comportamiento dinámico de formularios) es trabajo fino, no mecánico — alto riesgo de introducir regresiones sutiles en reglas de negocio que hoy solo están documentadas en `DOCUMENTACION.md` y en el propio código.
- El equipo que mantiene SISRES hoy es de PHP; requiere upskilling a TypeScript/React/Postgres o contratar/asignar a alguien del stack de Aeromanto.

### (b) Integración por API manteniendo ambos sistemas

**Qué implica:** no tocar el código interno de ninguno de los dos. Construir una capa de integración delgada (API propia, o sincronización directa punto a punto) para el único dominio de solapamiento real y crítico: **vehículos/placas** (y opcionalmente catálogos genéricos compartidos como proveedores/centros, si el negocio decide que deben ser el mismo catálogo — ver `FEATURE_MATRIX.md`, fila "Centros operativos / Sedes", que señala que la granularidad hoy es distinta y debe aclararse antes de fusionar).

**Bloqueantes/riesgos duros:** ninguno — es la opción de menor superficie de cambio.

**Riesgos específicos:**
- Normalización de placa debe hacerse en la capa de integración (ya que solo Aeromanto tiene esa garantía a nivel de BD hoy) — mismo algoritmo que la migración `023_normalize_placas.sql` de Aeromanto (uppercase + strip espacios), aplicado también a `sisres.movil.placa`.
- Dos sistemas de autenticación/autorización distintos conviven indefinidamente (Supabase Auth vs sesión PHP nativa) — no hay una identidad de usuario unificada a menos que se construya explícitamente (SSO o mapeo de cuentas), lo cual es trabajo adicional no incluido en el alcance mínimo de esta opción.
- Mantenimiento continuo de dos stacks, dos bases de datos, dos pipelines de deploy — no reduce la carga operativa total del equipo, solo evita el costo de migración.
- Requiere definir un dueño de la verdad (source of truth) para el dato compartido de vehículo: ¿Aeromanto crea el vehículo y SISRES lo consume, o viceversa, o ambos escriben y se reconcilian? Esto es una decisión de negocio, no solo técnica.

### (c) Portar Aeromanto a PHP dentro de SISRES

**Qué implica:** reescribir ~24.000 líneas TS/TSX (137 archivos) como PHP vanilla siguiendo el patrón de SISRES, portar el esquema Postgres (incl. 2 triggers de integridad: `validar_kilometraje_incremental`, `actualizar_estado_vehiculo_por_incidente`) a MySQL, y **reconstruir el pipeline de extracción de facturas por IA** (Anthropic Claude + Microsoft Graph/OneDrive + cron) en PHP.

**Bloqueantes/riesgo alto — integraciones atadas al entorno actual de Aeromanto:**
- El webhook de suscripción de Microsoft Graph **expira cada ~2.9 días** y depende de un cron de renovación — HostGator (cPanel) sí soporta cron de sistema, así que es *técnicamente* portable, pero hoy no existe ningún cron de sistema en SISRES (su único job recurrente, campañas WhatsApp, es iniciado por el usuario vía polling AJAX, no cron) — es infraestructura nueva para el equipo de SISRES, no una migración de algo que ya operan.
- `@anthropic-ai/sdk` es un SDK oficial de Node; en PHP habría que hacer las llamadas HTTP a la API de Anthropic directamente (factible, sin SDK oficial mantenido por Anthropic para PHP) — no es un bloqueante duro, pero es más trabajo y menos soporte oficial.
- El límite `maxDuration` de Vercel (60s Hobby / 300s Pro) desaparece en hosting tradicional (PHP permite `max_execution_time` configurable), así que en ese aspecto específico portar a PHP **relaja** una restricción actual, no la empeora.
- Downgrade tecnológico real: se pierde TypeScript estricto, Zod, RLS declarativo, y el patrón de Server Actions — se gana el patrón de permisos dinámicos de SISRES (que es, de los dos, el más flexible operativamente) pero se pierde tipado estático y la superficie de testing implícita que da TypeScript.

**Riesgos específicos:**
- Es la opción con **mayor volumen de líneas a portar** (~24.000 TS/TSX vs ~22.600 PHP de la opción (a), pero con la complicación añadida de reconstruir integraciones externas no triviales, no solo CRUD).
- El equipo de Aeromanto (asumiendo que es distinto del de SISRES, dado el patrón de nombres de agentes en `CLAUDE.md` — "Vault", "Forge") tendría que re-familiarizarse con un stack sin tipado y sin framework.

---

## 2. Estimado aproximado de esfuerzo por módulo (si se migra/porta)

Estimados en semanas-persona, orden de magnitud (no un cronograma comprometido — depende del tamaño real del equipo asignado). Aplican a las opciones (a) y (c) por igual en la dirección correspondiente; la opción (b) no requiere esto.

| Módulo/dominio | Complejidad | Estimado | Motivo |
|---|---|---|---|
| CRUD genérico (vehículos/móvil, proveedores, clientes, centros/sedes, usuarios) | Baja | 1-2 semanas por entidad | Patrón mecánico en ambos stacks, bien delimitado |
| Autenticación + RBAC/permisos | Alta | 3-5 semanas | Requiere decidir y construir el modelo de autorización de destino (RLS estático vs permisos dinámicos), no solo trasladar código |
| Módulo de Servicios (SISRES) — 53 columnas, comportamiento condicional por rol y tipo | Alta | 4-6 semanas | Lógica de negocio densa, sin tests automatizados que confirmen equivalencia funcional post-migración |
| Mantenimientos de flota (Aeromanto) + plan preventivo por km/tiempo | Media-alta | 3-4 semanas | Incluye triggers de integridad y reglas por centro operativo (excepción AIRPLAN) |
| Inventario + Hoja de Vida de equipos biomédicos + PDF (SISRES) | Media | 3-4 semanas | Incluye generación de PDF con formato institucional — reescribir con librería equivalente en el stack de destino |
| Campañas WhatsApp + webhook Meta (SISRES) | Media | 2-3 semanas | Orquestación de estados y lotes, pero sin dependencia de infraestructura serverless |
| GPS ProTrack365 + mapas (SISRES) | Baja-media | 1-2 semanas | API HTTP estándar |
| Pipeline de facturas por IA (Aeromanto) — solo relevante para opción (c) | Alta | 4-6 semanas | Reescribir cliente Graph OAuth, extractor Claude, y mecanismo de cron/webhook en el nuevo entorno |
| Chat/Insights IA, capacitaciones, coordinación (Aeromanto) | Media | 2-3 semanas cada uno | Módulos más nuevos, RLS/lógica más simple que el core de flota |
| Migración de datos (ambos sentidos) | Alta | 2-4 semanas | Validación de integridad, especialmente datos clínicos (`paciente`, `servicios`) |

**Total orden de magnitud para (a) o (c) completos:** varias veces el esfuerzo de (b), y con riesgo de regresión funcional no cubierto por tests automatizados en ninguno de los dos sistemas actuales.

---

## 3. Comparación de costo/riesgo total

| Criterio | (a) SISRES → stack Aeromanto | (b) Integración por API | (c) Aeromanto → PHP en SISRES |
|---|---|---|---|
| Volumen de código a reescribir | ~22.600 líneas PHP | Ninguno (solo capa nueva delgada) | ~24.000 líneas TS/TSX |
| Bloqueantes técnicos duros de integración externa | Ninguno detectado | Ninguno (no aplica) | Sí — pipeline OneDrive/Graph + Cron atado a Vercel, requiere reconstrucción en un entorno sin esa infraestructura |
| Pérdida funcional si no se invierte extra | Sistema de permisos dinámicos (downgrade a RLS estático) | Ninguna — ambos sistemas conservan sus capacidades actuales | Tipado estricto, RLS declarativo, ausencia de tests implícita se vuelve más notoria sin TypeScript |
| Riesgo sobre datos sensibles (clínicos) | Alto — migración de `paciente`/`servicios` | Bajo — los datos no se mueven de sistema | N/A (SISRES no se toca) |
| Impacto en equipo/skillset | Requiere que el equipo de SISRES adopte TS/React/Postgres | Ninguno — cada equipo sigue en lo suyo | Requiere que el equipo de Aeromanto adopte PHP vanilla (downgrade de tooling) |
| Reduce carga operativa de mantener 2 stacks | Sí, a largo plazo | No | Sí, a largo plazo |
| Esfuerzo inicial estimado | Alto (semanas → meses) | Bajo (semanas) | Alto (semanas → meses), mayor que (a) por las integraciones externas |
| Resultado si el solapamiento funcional real es bajo (confirmado en `FEATURE_MATRIX.md`) | Se paga el costo completo de una migración para unificar dominios que en su mayoría **no compiten entre sí** | Se resuelve exactamente el problema real (flota compartida) sin pagar el costo de fusionar dominios que no lo necesitan | Mismo problema que (a): costo alto para un solapamiento funcional bajo, agravado por las integraciones externas |

---

## 4. Lectura de la evidencia (no es la decisión final)

Con base estrictamente en lo encontrado — **no en preferencia de stack** — los datos apuntan a que el solapamiento funcional real entre los dos sistemas se limita casi por completo al dominio de vehículos/placas (`FEATURE_MATRIX.md`), mientras que el resto de cada sistema (gestión clínica de servicios en SISRES; gestión de activos, IA de facturación y portal de conductor en Aeromanto) no tiene equivalente en el otro. Migrar o portar un sistema completo dentro del otro (opciones a/c) paga el costo total de una reescritura para resolver un problema de integración que, según la evidencia recolectada, es acotado a un solo dominio de datos compartido.

La opción (c) tiene, adicionalmente, un riesgo técnico concreto que las otras dos no tienen: reconstruir una integración (OneDrive/Microsoft Graph + cron de renovación de webhook) que hoy depende de infraestructura serverless específica de Vercel, en un entorno de hosting compartido que no tiene ese tipo de infraestructura hoy.

Esto no descarta (a) o (c) como decisión de negocio a mediano/largo plazo (por ejemplo, si el objetivo estratégico es consolidar en un solo equipo/stack independientemente del costo de esta fase) — pero si el objetivo inmediato es resolver la fricción operativa real detectada (la misma flota gestionada dos veces sin sincronía), la evidencia de esta auditoría no encuentra una necesidad técnica de fusionar los dos sistemas completos para lograrlo.

**La decisión final —incluyendo si el horizonte estratégico justifica pagar el costo de (a) o (c) más allá del problema inmediato de la flota— queda en manos del negocio.**
