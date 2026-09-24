# Plan: integrar SISRES en Aeromanto — repos, entorno de pruebas y trabajo en paralelo con León

## Contexto

La auditoría previa (`aeromanto/AUDIT_aeromanto.md`, `sisres/AUDIT_sisres.md`, `FEATURE_MATRIX.md`, `RECOMENDACION_STACK.md`, todos en `SISMANTO/`) encontró que el solapamiento funcional real entre los dos sistemas es bajo — el único punto crítico compartido es la flota de ambulancias (vehículos/placas) — y por eso la evidencia por sí sola inclinaba hacia una integración liviana por API (opción b). **Ya decidiste ir por la opción (a): absorber SISRES dentro de Aeromanto, con Aeromanto como repo final.** Este plan respeta esa decisión de negocio; no la vuelve a cuestionar.

Confirmado contigo:
- **León** construyó SISRES y lo conoce a fondo (incluida la lógica de notificaciones — WhatsApp, SMS, correo). Está dispuesto a moverse al stack de Aeromanto (Next.js/TypeScript/Supabase) y programar directamente ahí, no solo asesorar desde PHP.
- **SISRES sigue vivo en producción durante toda la integración** — no hay congelamiento temprano ni corte agresivo. Esto significa: nada de lo que hagamos en Aeromanto puede depender de "apagar" SISRES antes de que la migración esté completa y validada.

Este plan cubre: cómo quedan los dos repos, el entorno de pruebas compartido, la estrategia de ramas para trabajar en paralelo sin pisarse, el reparto de trabajo entre vos y León, el orden de los módulos a migrar, y el prompt que le vas a pasar a León para que su Claude Code te devuelva las respuestas que hoy solo él tiene.

---

## 1. Cómo quedan los repos

| Repo | Qué pasa con él |
|---|---|
| **`aeromanto`** (GitHub, Vercel, Supabase producción actuales) | **Se convierte en el repo final.** Todo el código nuevo de SISRES se reescribe aquí, en TypeScript/Next.js, siguiendo las convenciones que ya existen (`CLAUDE.md`, patrón de Server Actions + Zod, migraciones numeradas aditivas). No se crea un repo nuevo — se preserva el historial de git, el CI (`lint`+`build`) y la continuidad para los usuarios que ya usan Aeromanto a diario (OVEM, Regulación, Gerencial). |
| **`sisres`** | Sigue existiendo tal cual, **en modo mantenimiento**: León solo lo toca para bugs críticos de producción (sigue teniendo pacientes y servicios reales todos los días), no para features nuevas. Es la fuente de verdad de negocio mientras se porta cada módulo, y el origen de los datos para la migración final. Una vez completado el corte (ver Fase 6), el repo se **archiva en GitHub (read-only)** — no se borra, por trazabilidad y por retención de datos clínicos (confirmar con León/negocio si aplica algún requisito legal de retención antes de archivar o borrar cualquier dato). |
| **Carpeta `SISMANTO/`** | Sigue siendo el espacio de trabajo compartido con ambos repos + los documentos de auditoría/planeación. Útil como bitácora del proyecto de integración incluso después del corte. |

**No hay ambigüedad aquí:** Aeromanto es el destino, SISRES es el origen. La pregunta real no es "cuál repo gana" sino "cómo evitamos romper el uso diario de ambos mientras se hace la transición" — eso es lo que cubren las secciones 2-6.

---

## 2. Entorno de pruebas compartido (staging)

Hoy Aeromanto tiene un solo proyecto de Supabase y un solo proyecto de Vercel (producción). Para que vos y León prueben en paralelo sin arriesgar los datos reales de flota que ya están en uso:

### 2.1 Supabase — proyecto de staging nuevo

- Crear un segundo proyecto Supabase, `SISRES_V2_Staging` (el plan free de Supabase permite varios proyectos gratuitos por organización — sin costo adicional).
- Aplicarle `scripts/schema.sql` + todas las migraciones existentes vía `npm run db:apply` (mismo mecanismo que ya usa el repo).
- **No copiar datos reales de pacientes/servicios ahí.** Es un entorno compartido entre dos personas y no debe contener PII/datos clínicos reales. Poblar con datos sintéticos (nombres/cédulas ficticias, servicios de prueba) — más abajo, en la Fase 1, se define un seed sintético a partir de la forma de los datos reales (columnas, rangos, distribución de `etapaServicio`, etc.) pero sin usar los valores reales.
- Variables de entorno de staging (Anthropic, Microsoft Graph, WhatsApp Cloud API, ProTrack365): usar credenciales de **sandbox/test** de cada proveedor, nunca las de producción — así nadie manda un WhatsApp real a un paciente mientras prueba. Esto es parte de lo que hay que pedirle a León (¿existen credenciales de prueba para WhatsApp/ProTrack, o hay que gestionarlas?).

### 2.2 Vercel — despliegue de staging

- Aeromanto ya usa Vercel; cada rama/PR genera automáticamente un **Preview Deployment** (incluido sin costo extra en el plan actual).
- Configurar las **Preview Environment Variables** de Vercel para que apunten al proyecto `SISRES_V2_Staging` (distintas de las de Production) — así cualquier rama que se despliegue como preview usa la base de staging, no la real.
- Además de los previews efímeros por PR, conviene una **URL de staging estable**: apuntar el dominio/alias de preview de la rama larga `integration/sisres` (ver §3) como el entorno "de referencia" que ambos usan para probar el estado acumulado de la integración, sin depender de que cada PR individual siga vivo.

### 2.3 Qué NO hace falta

- No hace falta Docker ni una base de datos local — Aeromanto ya es 100% cloud (Supabase + Vercel), y así seguimos. Mantiene consistencia con cómo ya trabajás vos.
- No hace falta un entorno de staging para SISRES — no se toca su código salvo bugs, y sigue corriendo tal cual en HostGator.

---

## 3. Estrategia de ramas para trabajar en paralelo

```
main                              ← producción real, siempre desplegable
  └── integration/sisres          ← rama larga, base de todo el trabajo de integración
        ├── feature/sisres-roles-permisos       (bloqueante, va primero — ver §5)
        ├── feature/sisres-vehiculos-reconciliacion
        ├── feature/sisres-notificaciones       (WhatsApp/SMS/correo — León)
        ├── feature/sisres-pacientes-servicios  (el módulo más grande — León)
        ├── feature/sisres-inventario-biomedico
        ├── feature/sisres-dashboard-estadisticas
        └── feature/sisres-data-migration       (al final, ver Fase 6)
```

**Reglas:**
- `feature/*` sale de `integration/sisres`, nunca de `main` directamente, y se mergea de vuelta a `integration/sisres` por PR.
- `integration/sisres` se resincroniza con `main` regularmente (al menos semanal, o cuando `main` reciba un hotfix) para no acumular deriva.
- **Merge de módulos completos y probados en staging → `main` de forma incremental**, no en un solo big-bang al final. Esto es clave dado que Aeromanto ya tiene usuarios reales (OVEM, Regulación) a diario: cada módulo que se mergea a `main` debe ser invisible para roles que no lo necesitan todavía (reutilizando el patrón que ya existe de sidebar/rutas filtradas por rol) hasta que esté listo para salir a producción real. Así `main` nunca deja de ser desplegable, y no dependés de terminar *todo* SISRES para poder mergear *algo*.
- Revisión cruzada obligatoria (PR review del otro) en: migraciones SQL, políticas RLS, y el módulo de roles/permisos (§5). En módulos aislados (ej. dashboard de estadísticas) la revisión puede ser más liviana.

---

## 4. Reparto de trabajo Daniel / León

Con León programando directo en el stack de Aeromanto, la forma más simple de evitar choques es dividir por **dominio de carpeta** (ya es el patrón que usa Aeromanto: un directorio por feature en `src/app/(dashboard)/`, `src/components/`, `src/app/api/actions/`), no por capa:

| Área | Quién | Por qué |
|---|---|---|
| Pacientes + Servicios (el módulo central de SISRES, 53 columnas, lógica condicional por rol/tipo de servicio) | **León** | Es quien construyó y entiende cada regla de negocio de este módulo — el de mayor riesgo de perder matices si lo porta otra persona. |
| Notificaciones (WhatsApp Cloud API, SMS, correo — hoy en `PHPMailer/`, `includes/wa/`) | **León** | Es quien sabe qué servicios de mensajería usa cada flujo y con qué plantillas/credenciales. |
| Inventario biomédico + Mantenimiento + Hoja de Vida (PDF) | **León** (con vos de soporte en la parte de generación de PDF en Node, que es nueva para el stack) | Dominio clínico/biomédico, mismo conocimiento que el módulo central. |
| Vehículos/placas — reconciliación `movil` ↔ `vehicles`, roles, permisos, staging, CI/infra | **Vos (Daniel)** | Ya conocés el modelo de datos y RLS de Aeromanto a fondo; es además el módulo bisagra que todos los demás necesitan resuelto primero. |
| Dashboard/estadísticas (Chart.js → Recharts) | El que esté libre primero | Bajo riesgo, patrón ya existente en Aeromanto (KPIs con Recharts). |
| Migración de datos final | Ambos | Requiere validar desde los dos lados (schema origen y destino). |

Esto no es rígido — es el punto de partida para que cada quien tenga un dominio claro desde el día 1 sin esperar a coordinarse por cada archivo.

---

## 5. El problema que hay que resolver primero: mapeo de roles

Antes de portar cualquier módulo hace falta decidir cómo conviven los roles. Esto bloquea todo lo demás porque define las políticas RLS de las tablas nuevas.

**Roles hoy:**

| Aeromanto (6, en `roles`) | SISRES (8 cargos) |
|---|---|
| ADMIN | Administrador |
| GERENCIAL | — |
| REGULACION | Regulador/Despachador |
| OVEM | OVEM |
| MANTENIMIENTO | — |
| COORDINACION | Coordinador |
| — | Analista |
| — | Médico |
| — | Auxiliar de Enfermería |
| — | Vista |

**Hipótesis a validar con León (ver §7):** los nombres que coinciden (Regulación/Regulador, Coordinación/Coordinador, OVEM/OVEM) probablemente son **la misma persona real** operando dos sistemas distintos hoy (ej. un conductor de ambulancia hace el checklist vehicular en Aeromanto y además es "OVEM" del lado clínico en SISRES). Si eso se confirma, la extensión de RBAC es simple: las políticas RLS de las tablas nuevas (`patients`, `servicios`, etc.) se agregan sobre los **mismos códigos de rol que ya existen**, y solo hace falta crear roles nuevos para los cargos sin equivalente: `ANALISTA`, `MEDICO`, `AUXILIAR_ENFERMERIA`, `VISTA`. Si la hipótesis es falsa (son personas distintas con el mismo nombre de rol por coincidencia), el modelo de permisos necesita ser más granular (permisos por módulo, no solo por rol) — más parecido al sistema de permisos dinámicos que ya tiene SISRES.

**Actualización 2026-07-17:** León respondió con evidencia a favor de la hipótesis (ver `RESPUESTAS_LEON.md` Q1) y dejó las cédulas reales de los 24 usuarios de esos 3 cargos. Falta un solo paso para cerrarlo: que Daniel cruce esos nombres contra los usuarios actuales de Aeromanto (que no guarda cédula, así que el cruce es por nombre) — instrucciones y query exacta en `RBAC_INTEGRACION.md` §1.1. No se arranca `feature/sisres-roles-permisos` hasta que ese cruce confirme o descarte la hipótesis.

**Sobre el sistema de permisos dinámicos de SISRES** (editable en runtime por el Admin, distinto del RLS estático de Aeromanto): no se replica por defecto. Aeromanto ya tiene la decisión tomada de que las políticas de acceso viven en migraciones (`CLAUDE.md`), y construir una capa de permisos configurable en UI es una feature nueva no trivial que no está justificada solo por portar SISRES. Si después de la migración el equipo extraña esa flexibilidad, se evalúa como una iniciativa aparte.

---

## 6. Fases de integración (orden y dependencias)

| Fase | Contenido | Depende de |
|---|---|---|
| **0. Fundaciones** | Alta de León en Aeromanto (repo, Supabase, Vercel), lectura de `CLAUDE.md`/`PRD.md`/`ROLES_AND_FLOWS.md` (avisarle que estos dos últimos están desactualizados — ver `AUDIT_aeromanto.md` §7 — y corregirlos de paso), creación de `SISRES_V2_Staging` (Supabase) + variables de Preview en Vercel, creación de rama `integration/sisres`. | — |
| **1. Roles + reconciliación de vehículos/placas** | Resolver el mapeo de roles (§5) y crear las migraciones de roles nuevos + políticas RLS base. En paralelo: normalizar `movil.placa` con el mismo criterio que la migración `023_normalize_placas.sql` de Aeromanto (aunque `RESPUESTAS_LEON.md` Q3 confirma 0 placas sucias hoy en SISRES, mantener la normalización como buena práctica en la capa de integración), y decidir la fuente de verdad de vehículo (recomendación: `vehicles` de Aeromanto pasa a ser la autoritativa desde ahora, con un import **único** — no sincronización continua — de los campos que solo tiene `movil`: motor, chasis, carrocería, pase aeroportuario, multas). **Confirmado (Q2): `movil` se edita con muy poca frecuencia** (0 entradas en `log_sistema` en 7 semanas) — no hace falta sync continuo durante la convivencia, alcanza con acordar "actualizalo en los dos" manualmente. **Pendiente:** confirmar el conteo real de `vehicles` en Aeromanto contra los 23 activos/36 totales de SISRES (`FEATURE_MATRIX.md`), y si los operadores `AEROCALI`/`ADO` (sin equivalente en los 4 centros operativos de Aeromanto, ver Q5) tienen flota que también deba incorporarse. **También en esta fase:** retirar el enlace/permiso `mod_pre_operacional` en SISRES (acción de León, sin riesgo — ver §6 hallazgo del módulo roto en `AUDIT_sisres.md`) y evaluar portar ese checklist de 161 columnas como plantilla adicional de `daily_checks` en Aeromanto, comparando primero contra `G-TECN-F 002 LISTA DE CHEQUEO PREOPERACIONAL AMBULANCIAS.xlsx` (ya en este repo). **Además (2026-07-17):** rediseño de la navegación — `NAVEGACION_UNIFICADA.md` (nuevo) es la propuesta de arquitectura de información para que el sidebar no sea la suma lineal de los ~30 ítems de menú de ambos sistemas; agrupa por dominio/función y absorbe ítems sueltos (ej. "Regulación" deja de ser un ítem plano, pasa a submenú de "Operación"). Avanza en paralelo con el mapeo de roles, no antes ni después — la columna de roles de esa propuesta depende de la respuesta a la Pregunta 1. Se convierte en el nuevo `ALL_NAV` de `src/app/(dashboard)/layout.tsx` como parte del trabajo de código de esta fase. | Fase 0 |
| **2. Notificaciones (WhatsApp/SMS/correo)** | León porta el cliente de WhatsApp Cloud API y el envío de correo a Server Actions/Route Handlers de Next.js, como servicio reutilizable (no atado todavía a Pacientes/Servicios) — mismo patrón arquitectónico que ya usa Aeromanto para Microsoft Graph (`src/lib/graph/client.ts`). | Fase 0 |
| **3. Pacientes + Servicios** | El módulo más grande y sensible. León lo lleva de punta a punta: modelo de datos, formularios con comportamiento condicional por rol/tipo de servicio, cálculos automáticos de tiempos, y conexión con el módulo de notificaciones de la Fase 2. | Fases 1 y 2 |
| **4. Inventario biomédico + Mantenimiento + Hoja de Vida (PDF)** | Reutiliza el patrón de `maintenance_records`/`maintenance_categories` que ya existe para vehículos, extendido a equipos. La generación de PDF es la única pieza técnicamente nueva del stack (TCPDF no tiene equivalente directo en Node — evaluar `@react-pdf/renderer` o similar). | Fase 0 (puede correr en paralelo a la Fase 3) |
| **5. Dashboard/estadísticas de servicios** | Portar los 9 gráficos de Chart.js a Recharts, reusando el patrón de KPIs que ya existe. | Fase 3 (necesita que existan datos de `servicios`) |
| **6. Migración de datos + corte final** | ETL de MySQL (SISRES) → Postgres (Supabase producción de Aeromanto): `paciente`, `servicios` (19.110 filas), `inventario`, `mantenimiento`, `proveedores`, `clientes`, `sede`, `cie10`, `subregiones`, `campana`. Se ensaya primero contra staging con un dump de prueba, se valida conteo de filas e integridad, y solo entonces se corre una vez contra producción real. **Bloqueante nuevo (2026-07-17, `RESPUESTAS_LEON.md` Q7):** antes del corte, alguien del equipo comercial/facturación de Aerosanidad debe confirmar si `vista_data_seguros_bolivar` (2.897 filas activas hoy, no es código muerto) alimenta un reporte externo real (Power BI/Excel conectado). Si es así, replicar la misma consulta contra el modelo nuevo en Postgres **antes** de apagar SISRES, o el reporte de Seguros Bolívar se rompe sin aviso el día del corte. Después del corte, cada rol empieza a usar Aeromanto para lo que antes hacía en SISRES; SISRES pasa a solo-lectura por el período de retención que se defina, y luego se archiva (§1). | Fases 1-5 completas y validadas en staging |

**Nota importante:** como SISRES sigue vivo todo este tiempo, la Fase 6 es la única que "corta". Todo lo anterior se construye y prueba en Aeromanto sin tocar ni depender de apagar nada en SISRES.

---

## 7. Preguntas para León + prompt para su Claude Code

Hay varias cosas que solo León sabe (o que su Claude Code puede investigar más rápido dentro del propio repo de SISRES, con acceso real a la BD vía PHP CLI, algo que yo no tuve en esta auditoría). Copiá y pegale esto tal cual a su Claude Code:

---

> **Prompt para pasarle a León (para su Claude Code, dentro del repo `sisres`):**
>
> ```
> Estamos integrando SISRES dentro de Aeromanto (el sistema de gestión de flota de
> Aerosanidad, Next.js + Supabase). Daniel ya hizo una auditoría completa de ambos
> repos — deberías tener o pedirle estos archivos antes de responder:
>   - En este mismo repo (sisres), rama `audit/integration-analysis`: AUDIT_sisres.md
>   - En el repo aeromanto (ya te dieron acceso como colaborador en GitHub),
>     rama `audit/integration-analysis`, raíz del repo: AUDIT_aeromanto.md,
>     FEATURE_MATRIX.md, RECOMENDACION_STACK.md, PLAN_INTEGRACION_SISRES.md
> Leelos primero. Ya identifican bastante de lo que hace SISRES, pero hay preguntas
> que solo alguien con acceso real a la base de datos y al conocimiento de negocio
> puede responder con certeza. Investigá cada una en el código/BD de SISRES (tenés
> PHP CLI y acceso a la BD real, cosa que Daniel no tuvo al auditar) y escribí las
> respuestas en un archivo nuevo `RESPUESTAS_LEON.md` en la raíz de sisres, en la
> rama `audit/integration-analysis` (no toques main). Si alguna pregunta no es
> respondible desde el código (es una decisión de negocio o algo que solo sabés de
> memoria), respondela igual con tu mejor conocimiento y marcala como "no verificado
> en código".
>
> PREGUNTAS:
>
> 1. ROLES — ¿Los cargos "Regulador/Despachador", "Coordinador" y "OVEM" de SISRES
>    son, en la práctica, las mismas personas que ya usan los roles "REGULACION",
>    "COORDINACION" y "OVEM" en Aeromanto (mismo empleado usando dos sistemas), o
>    son roles distintos que casualmente se llaman parecido? Esto determina si
>    podemos extender el RBAC de Aeromanto reusando esos códigos de rol o si
>    necesitamos un modelo de permisos más granular.
>
> 2. VEHÍCULOS/PLACAS — ¿Qué tan seguido se edita la tabla `movil` en producción hoy
>    (alta de vehículo nuevo, renovación de SOAT/RTM, cambio de estado)? Necesitamos
>    saber si durante la convivencia (SISRES y Aeromanto corriendo en paralelo)
>    hace falta sincronizar cambios de vehículo entre los dos sistemas o si es tan
>    poco frecuente que alcanza con acordar manualmente "actualizalo en los dos"
>    mientras dure la integración.
>
> 3. PLACAS SUCIAS — ¿Sabés de casos reales en `movil.placa` con espacios, minúsculas,
>    o formatos inconsistentes (como el caso OKL227/OKL 227 que sí se encontró y
>    corrigió en Aeromanto)? Si podés correr una consulta tipo
>    `SELECT placa FROM movil WHERE placa != UPPER(REPLACE(placa,' ',''))`
>    y pegar el resultado, mejor.
>
> 4. CONTEO REAL DE FLOTA — ¿Cuántos vehículos activos hay hoy exactamente
>    (`SELECT COUNT(*) FROM movil WHERE estado = 1`)? La documentación de Aeromanto
>    dice "31-50 vehículos" y SISRES tenía 36 filas totales en la última auditoría
>    (2026-07-15) — necesitamos el número exacto y actual.
>
> 5. CENTROS vs SEDES — Aeromanto tiene 3-5 "centros operativos" (CRA_MEDELLIN,
>    CRA_BOGOTA, AIRPLAN, CTG). SISRES tiene 17 "sedes". ¿Son jerarquías
>    relacionadas (una sede pertenece a un centro operativo) o son conceptos
>    organizacionales independientes que no se corresponden 1 a 1?
>
> 6. MÓDULO PRE-OPERACIONAL ROTO — Confirmado en la auditoría que la tabla
>    `preoperacional` no existe pero el formulario sigue activo y pierde datos al
>    usarse. ¿Lo reconstruimos como parte de esta integración (¿con qué columnas
>    exactas, ya que el INSERT actual las espera?), o directamente no se porta y
>    se retira el enlace/permiso de una vez en SISRES mientras tanto?
>
> 7. TABLAS/VISTAS HUÉRFANAS — `invhojasvida` (0 filas) y la vista
>    `vista_data_seguros_bolivar`: ¿alguna herramienta externa (Power BI, Excel
>    conectado, un reporte para la aseguradora Seguros Bolívar) consulta la vista
>    directamente? Si es así, hay que replicar esa vista en el lado de Aeromanto
>    antes del corte final, o esa integración se rompe sin aviso.
>
> 8. NOTIFICACIONES — Además de WhatsApp Cloud API (ya documentado), ¿hay algún
>    canal de SMS aparte, o "SMS" se refiere a las plantillas de WhatsApp? ¿Qué
>    proveedor de correo (más allá de PHPMailer/SMTP genérico) y qué credenciales
>    de prueba/sandbox existen hoy para no mandar mensajes reales durante testing
>    (número de WhatsApp de pruebas de Meta, cuenta SMTP de pruebas)?
>
> 9. PROTRACK365 (GPS) — ¿Existe un ambiente/token de pruebas de ProTrack365, o
>    solo hay credenciales de producción? Si solo hay producción, ¿es seguro
>    usarlas en un entorno de staging (no rompe nada, no genera costos) o hay que
>    pedir credenciales nuevas al proveedor?
>
> 10. DATOS PARA STAGING — Vamos a crear un Supabase de staging sin datos reales de
>     pacientes (por sensibilidad de datos clínicos). ¿Podés generar o ayudarnos a
>     generar un dataset sintético de `servicios`/`paciente` con la misma forma
>     (distribución de `etapaServicio`, `tipoServicio`, rangos de fechas) pero sin
>     información real, para probar la migración y los formularios sin exponer
>     datos reales?
>
> 11. ACCESOS — Para empezar a trabajar en el repo `aeromanto`: ¿qué email usás para
>     que te invitemos a GitHub (repo aeromanto), Supabase (org) y Vercel (team)?
>
> Devolveme todo esto en `RESPUESTAS_LEON.md`, con una sección por pregunta,
> indicando para cada una si la respuesta viene de una consulta real a la BD/código
> (pegá el resultado) o si es de memoria/negocio (marcalo como tal).
> ```

---

## 8. Definition of Done por fase

| Fase | Se considera lista cuando... |
|---|---|
| 0 | León puede correr `npm run dev` localmente contra `SISRES_V2_Staging` y loguearse; `integration/sisres` existe y protegida igual que `main` (CI en verde obligatorio para mergear). |
| 1 | Existe una migración de roles nuevos + políticas RLS documentadas; `vehicles` tiene los campos que antes solo estaban en `movil`; hay un mapeo 1:1 (o un reporte de huérfanos) entre placas de ambos sistemas. |
| 2 | Un mensaje de WhatsApp de prueba (a un número de pruebas, no real) se envía correctamente desde Aeromanto en staging. |
| 3 | Un servicio de prueba se puede registrar, editar y pasar por sus etapas desde Aeromanto en staging, replicando el comportamiento condicional por rol que hoy tiene SISRES (validado por León contra su conocimiento del sistema original). |
| 4 | Un mantenimiento biomédico se puede registrar y su PDF de Hoja de Vida se genera correctamente en staging. |
| 5 | El dashboard de estadísticas en Aeromanto muestra los mismos números que el de SISRES para el mismo rango de fechas (validación cruzada). |
| 6 | Migración ensayada al menos una vez contra staging con conteos de filas verificados; corrida en producción con ventana de mantenimiento comunicada a los usuarios de SISRES; usuarios reales operando en Aeromanto sin depender de SISRES para nada del día a día. |

---

## Qué no cubre este plan (fuera de alcance por ahora)

- La fecha/duración exacta de cada fase — depende de la disponibilidad real de vos y León, y de las respuestas de León en §7 (especialmente la pregunta de roles, que puede cambiar el tamaño de la Fase 1).
- El diseño detallado de esquema de tablas nuevas (`patients`, `servicios`, etc.) — eso es trabajo de la Fase 1/3 una vez resuelto el mapeo de roles, no de este documento.
- Decisión legal/regulatoria sobre retención de datos clínicos de SISRES tras el corte — señalado como pendiente de confirmar, no asumido aquí.
