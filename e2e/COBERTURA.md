# Cobertura E2E: caso del plan → prueba

Fuente de los casos: `PLAN_PRUEBAS_REGULACION_OVEM.md` (IDs `O-`, `R-`, `X-`) y los planes de prueba existentes (IDs `A`, `G`).
**Oráculo:** quién fijó el resultado esperado. `observado` = lo vi en staging el 2026-10-21 y falta que Daniel lo confirme; `Daniel` = decisión escrita por él.
**Estado:** `auto` (hay prueba), `pendiente` (falta escribirla), `manual` (no se automatiza; se anota fecha de la última prueba a mano).

| ID | Caso | Spec | Oráculo | Estado |
|---|---|---|---|---|
| A2 | Login con usuario inexistente muestra mensaje claro | `smoke/acceso.spec.ts` | observado | auto |
| A3 | Rutas protegidas sin sesión redirigen a `/login` | `smoke/acceso.spec.ts` | observado | auto |
| A5 | Rutas prohibidas por rol no muestran su contenido | `smoke/permisos.spec.ts` | observado | auto (7 roles; faltan COORDINACION, GERENCIAL, ANALISTA y VISTA) |
| G5 | Ruta inexistente muestra la 404 propia | `smoke/roles-cargan.spec.ts` | observado | auto |
| R-01 / O-01 | Cada rol aterriza en su ruta sin error, excepción ni 5xx | `smoke/roles-cargan.spec.ts` | observado | auto |
| R-02 / R-03 | Regulación solo ve vehículos de su ciudad (pantalla) | `smoke/aislamiento.spec.ts` | Daniel | auto |
| O-02 / O-03 | OVEM solo ve vehículos de su ciudad en el selector | `smoke/ovem@mobile.spec.ts` | Daniel | auto |
| O-33 | OVEM sin scroll horizontal (390 y 360) | `smoke/ovem@mobile.spec.ts` | observado | auto |
| R-04 / R-05 | Aislamiento por URL y por API (RLS con el token del usuario) | — | Daniel | pendiente |
| O-04 a O-11 | Preoperacional (validaciones, falla, novedad, km) | — | observado | pendiente |
| O-12 a O-18 | Recibir el servicio y la tripulación | — | observado | pendiente |
| O-19 a O-24 | Pasos del servicio (orden, doble clic, horas, sin conexión) | — | observado | pendiente |
| O-25 a O-30 | Tanqueo, novedad, siniestro y cierre de turno | — | observado | pendiente |
| R-06 a R-14 | FDS y tripulación (Programación del día como fuente única) | — | Daniel | pendiente |
| R-15 a R-33 | Crear, asignar, choque, cancelar, filtros, edición de FINALIZADO | — | R-28 sin decidir | pendiente |
| X-01 a X-05 | Cruce Regulación ↔ OVEM con dos contextos | — | observado | pendiente |
| Regresión | Novedad en el vehículo elegido (#326) | — | Daniel | pendiente (primera prueba tras los cimientos) |
| O-09 / O-11 / O-24 / O-35 | Borrador, fotos, señal débil y celular real | — | — | manual |

## Pendiente de decisión (oráculos)

1. ¿Regulación puede editar un servicio FINALIZADO? (R-28)
2. ¿OVEM puede abrir `/pacientes` y `/vehiculos`? (hoy abren; la matriz de permisos no los prohíbe)
3. ¿Un servicio sin móvil, fecha ni destino es válido? (R-20)
4. Mecanismo de limpieza de datos `TEST-` (cuenta de servicio con permiso acotado, o la cuenta de administración).
