# ETL SISRES → SISMANTO: cómo correrlo y qué se verificó

Ensayo hecho el 2026-09-23 con la copia local de la base real de SISRES (`juanlop7_aerosanidad`, MySQL) contra un Postgres desechable en la máquina de León. **No se escribió nada en Supabase (staging ni producción).**

## Cómo se corre

1. **Exportar** de MySQL a CSV (contiene datos personales: guardarlos **fuera** de los repos, nunca en git). El exportador vive en SISRES, rama `audit/integration-analysis`: `php sql/generar_csv_etl.php <carpeta>`. Además de sus 8 tablas hay que exportar `eps` y `proveedores` (`SELECT *`).
2. **Ensayo en seco** (todo dentro de una transacción que se revierte; valida contra las restricciones reales de la BD):
   `DATABASE_URL=<staging> npx tsx scripts/etl-sisres.ts <carpeta> --validar`
3. **Carga real** (mismo comando sin `--validar`). Es idempotente: cada tabla hace upsert por `sisres_id` (o clave natural), así que repetirlo no duplica.
4. Revisar en la carpeta de los CSV `etl-rechazos-*.csv` (filas que no entraron, con el motivo) y `etl-avisos-*.csv` (campos que entraron vacíos). Contienen datos personales: no subirlos.

`DATABASE_SSL=off` desactiva SSL en `etl-sisres.ts` y `apply-database.ts`, para probar contra un Postgres local. Con Supabase no se usa.

Requiere las migraciones al día (`npm run db:apply`), en particular 058 (identidad de origen) y 067 (ver abajo).

## Resultado con los datos reales (base local)

| Tabla | Origen (MySQL) | Cargadas | Comentario |
|---|---:|---:|---|
| `patients` | 19.503 | 19.499 | 4 no entran, todas explicadas en `etl-rechazos-patients.csv`: 1 sin cédula y 3 cédulas repetidas (ver abajo) |
| `medical_services` | 40.608 | 40.608 | 6.480 no tienen paciente en el maestro y conservan `cedula_paciente`; 190 tienen fecha de registro `0000-00-00` (queda vacía) |
| `biomedical_equipment` | 1.155 | 1.155 | Antes del ensayo entraban solo 524 (ver hallazgos 1 y 2) |
| `biomedical_maintenance` | 15 | 13 | 2 no tienen `inventario_id` ni código de equipo: irrecuperables |
| `medical_assessments` | 6 | 6 | |
| `clients`, `cie10`, `eps`, `medical_providers` | 128 · 12.634 · 30 · 1.332 | igual | |

Además: **segunda ejecución sobre la misma base = mismos conteos** (idempotente); **0 referencias huérfanas** (servicios→pacientes, mantenimientos→equipos, valoraciones→pacientes); una muestra de 300 pacientes y 300 fechas de servicios, campo a campo contra MySQL, sin diferencias; las horas de los servicios coinciden al minuto con SISRES (40.418 de 40.419 fechas válidas; la restante es del año 2205 y se carga vacía); los valores en formato colombiano (`150.000`) entran como 150000.

## Hallazgos y decisiones

1. **611 equipos rechazados por tamaño de columna.** `voltaje`, `corriente`, `potencia`, `humedad`, `peso` y `temperatura` eran `VARCHAR(40)`; SISRES los tiene en `VARCHAR(100)` desde 2026-08-28 y hay valores de hasta 76 caracteres. → Migración **067** (solo amplía, no puede perder datos).
2. **La placa de un equipo no es única en SISRES** (20 placas repetidas, 4 equipos sin placa; son equipos distintos: p. ej. un DEA y otro con la misma placa). El ETL usaba `ON CONFLICT (placa_equipo)`, así que el segundo **pisaba en silencio** al primero. → Ahora la identidad es `sisres_id`; la fila de menor id conserva la placa y las demás quedan como `<placa>-<id>`; sin placa → `SIN-PLACA-<id>`. Cada caso queda en `etl-avisos-biomedical_equipment.csv` (29). ⚠️ **Decisión de negocio pendiente:** que alguien de Biomédica revise esas 29 placas y las corrija en el sistema.
3. **Cédulas repetidas de pacientes: 3.** Se diferencian solo por un espacio no separable al final (`0xC2A0`) que el `TRIM` de MySQL no quita. En 2 de los 3 pares es la misma persona; en 1 par **los nombres son distintos** (dos personas con la misma cédula). Antes la segunda pisaba a la primera; ahora gana la fila más completa (regla de `pacientes_duplicados_2_fusionar` de SISRES) y la otra va a rechazos con el motivo. ⚠️ Revisar a mano el par con nombres distintos.
4. **369 servicios se enlazan a su paciente solo porque el ETL normaliza los espacios de la cédula**; en SISRES esa búsqueda exacta no los encontraba.
5. **`oportunidad_atencion` con valores absurdos** (hasta ~957 millones de minutos) hacían rechazar el servicio completo (2). Ahora el servicio entra y solo ese dato queda vacío, con aviso.
6. **Vencimientos de parche** (`ultimoVencimientoParche*`) no se cargaban; ahora se mapean a las columnas de la migración 065 (29 equipos con fecha real).
7. **Mantenimientos**: el código a mano `CTA - 014` no encontraba la placa `CTA-014`; ahora se compara sin espacios (recupera 2). Valores de servicio en formato `201,010.00` ahora se reconocen.
8. **El inventario de Sistemas (191 equipos: computadores, tablets) vive en la misma tabla** (`area = 'SISTEMAS'`). Las alertas por correo y las del dashboard de equipos biomédicos lo excluyen (sin ese filtro, 111 equipos de Sistemas habrían generado correos biomédicos).

## Pendiente / por confirmar

- `inventario.estado` tiene valores 0, 1 y 2; el ETL trata solo `0` como inactivo. Confirmar qué significa `2` (57 equipos quedaron inactivos con la regla actual).
- Columnas de SISRES que el ETL aún no lleva: en valoraciones `correo`, `edad`, `usuarioRegistra`, `firma` y la bandera `estado` separada de `estadoServicio` (ver `docs/PARIDAD_VALORACIONES.md`); en inventario `imagen`, `descripcionEquipo`, `instruccionesUso`, `usuarioRegistro`.
- Las 44 placas de `movil` sin vehículo en SISMANTO se debieron a que la base del ensayo no tenía flota; con la flota real de staging debe volver a revisarse.
- Este ensayo fue en un Postgres local (PGlite), no en el de Supabase. Falta correr `--validar` contra `SISMANTO_Staging` antes de la carga real.
