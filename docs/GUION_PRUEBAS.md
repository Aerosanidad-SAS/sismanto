# Guion de pruebas por rol: SISMANTO (dev y staging)

Contrastado con la rama `dev` (base `b5fc823`, PR #400) el 2026-11-25; C17 y la nota sobre direcciones de la sección B, revisados contra `4b98d1d` (PR #405) el 2026-11-26. Es un guion para recorrer a mano; las pruebas automáticas están en `e2e/` (ver `e2e/README.md`).

**Certeza de cada punto**
- **Confirmado en código**: leído en el archivo que se cita.
- **Deducido**: viene de documentos (libro de roles SISRES, `docs/PARIDAD_*.md`, `e2e/COBERTURA.md`) o de una inferencia; falta comprobarlo.
- **NO VERIFICADO**: no se pudo comprobar con el código del repo (pantalla, base de datos o decisión pendiente).

**Datos**: solo sintéticos con prefijo `PRUEBA-` (cédulas, nombres, direcciones). Nunca pacientes ni personal reales. No se anotan contraseñas.

## Cómo se entra con cada rol

- **Confirmado en código**: los usuarios de prueba son `test.<rol>@sismanto.test`, sin contraseña ni buzón (`src/lib/role-switcher.ts`, `scripts/seed-role-test-users.ts`). No se entra con ellos directamente: un ADMIN real usa el selector «Ver como (solo pruebas)» del pie del menú y un botón «Volver a ADMIN».
- **Confirmado en código**: el selector existe solo con `ROLE_SWITCHER_ENABLED=true` y `VERCEL_ENV` distinto de `production`. Sembrar los usuarios: `npm run db:seed-role-users` (idempotente; solo corre si `NEXT_PUBLIC_SUPABASE_URL` apunta al proyecto de staging y se detiene si `VERCEL_ENV=production`). Dev y staging comparten base: basta correrlo una vez.
- **Confirmado en código**: son 11 roles en el selector (todos menos ADMIN, que es la sesión real): REGULACION, OVEM, MEDICO, AUXILIAR_ENFERMERIA, MANTENIMIENTO, COORDINACION, GERENCIAL, ANALISTA, VISTA, TECNICO, AEROPUERTO.
- **Confirmado en código**: el seed asigna el centro `CRA_MEDELLIN` a los roles limitados por centro (REGULACION, OVEM, MEDICO, AUXILIAR_ENFERMERIA, COORDINACION; `ROLES_POR_CENTRO` en `src/lib/auth-utils.ts`). Para probar Bogotá hace falta otro usuario o cambiar el centro del usuario de prueba (Administración → Usuarios): NO VERIFICADO cómo conviene hacerlo.
- **Confirmado en código**: los usuarios de prueba aparecen en Administración → Usuarios con el nombre `[TEST] …`. Un OVEM, MEDICO o AUXILIAR de prueba ve «Mis servicios» vacío hasta que Regulación lo ponga en la tripulación de un móvil de hoy (`ENTORNOS.md`).
- **Conflicto por resolver**: `docs/PRODUCCION_PASO_A_PASO.md` dice que esos usuarios también viven en la base de producción, y el seed solo corre contra staging. Aclararlo antes de probar en producción.
- Los usuarios `regulacion.mde` y `regulacion.bgt` de `PARIDAD_REGULACION.md` no existen en el seed; no se usan aquí. Los usuarios de las pruebas automáticas (`E2E_<ROL>_USER`) son aparte.

## A. Prueba de humo

- [ ] A1 Abrir `/login`: carga sin error en consola ni 5xx; formulario visible. Nota: el nombre visible del sistema en pantalla es SISRES (changelog `nombre-visible-sisres`); SISMANTO es el nombre interno. | Deducido (COBERTURA A2/A3).
- [ ] A2 Login con `PRUEBA-noexiste@sismanto.test`: mensaje «Usuario o contraseña incorrectos» y no entra. | Confirmado en código (`CREDENCIALES_INVALIDAS` en `src/app/api/actions/auth.ts`).
- [ ] A3 Login con una cédula `PRUEBA-` de 5 a 15 dígitos que no existe: mismo mensaje, sin revelar si la cédula existe. Entrar con cédula real exige `SUPABASE_SERVICE_ROLE_KEY` en el entorno. | Confirmado en código (`resolverEmailLogin`).
- [ ] A4 Sin sesión, abrir `/servicios`: redirige a `/login`. | Deducido (middleware; COBERTURA A3).
- [ ] A5 Entrar como ADMIN y recorrer el menú: ninguna pantalla con excepción o 5xx. | Deducido (COBERTURA R-01/O-01).
- [ ] A6 «Cerrar sesión» (pie del menú): vuelve a `/login` y `/servicios` ya no carga sin sesión. | El botón existe (Confirmado en código, `dashboard-shell.tsx` y `signOut`); el resultado, NO VERIFICADO.
- [ ] A7 Ruta inexistente muestra la página 404 propia. | Confirmado en código (`src/app/not-found.tsx`, `(dashboard)/not-found.tsx`); en pantalla, Deducido (COBERTURA G5).
- [ ] A8 Con viewport de 390 y 360 px de ancho, rol OVEM: sin scroll horizontal. | Deducido (COBERTURA O-33; `e2e/specs/smoke/ovem@mobile.spec.ts`).

## B. Qué ve cada rol (selector «Ver como…»)

La columna «Debe ver» sale del menú real (`src/lib/navegacion.ts`) y de la pantalla de inicio de cada rol (`getDefaultRoute`, `src/lib/auth-utils.ts`). Lo esperado es que lo que el menú oculta tampoco se abra escribiendo la URL. La seguridad de los datos la da la base (RLS), no el menú.

**Diferencias conocidas** (confirmadas en código; anotarlas como hallazgo conocido): cada página tiene su propia guarda y no todas usan la lista del menú.
- Mientras no se mergee el PR #413, se abren por URL: `/servicios` (OVEM, MANTENIMIENTO), `/novedades` (OVEM, MEDICO, AUXILIAR_ENFERMERIA, VISTA), `/clientes` y `/proveedores` (esos cuatro y MANTENIMIENTO).
- COORDINACION abre `/equipos` y `/comunicaciones` aunque su menú no los muestre.
- A ANALISTA el menú le muestra Chat IA y AI Insights, pero esas páginas no lo dejan entrar.

| Rol | Inicio | Debe ver (menú) | NO debe ver | Certeza |
|---|---|---|---|---|
| ADMIN (sesión real) | `/` | Todo, incluidos Bitácora `/auditoria`, Permisos, Integraciones, Estado del entorno | Nada | Confirmado en código |
| REGULACION | `/servicios` | Sala de control, Servicios, Cotizador, Pacientes, Vehículos, Novedades, Clientes, Proveedores, Captación aeroportuaria, Soporte técnico | Mantenimientos, Equipos, KPIs, Combustible, Estadísticas, Comunicaciones, Valoraciones, Dashboard `/`, Usuarios, Bitácora; servicios de otra ciudad | Menú: Confirmado en código; ciudad: Deducido |
| OVEM | `/ovem` | Portal OVEM, Capacitaciones, Soporte técnico; en «Mis servicios» solo los suyos | Pacientes, Vehículos (ya no se abren por URL, changelog `ovem-sin-pacientes-ni-vehiculos`), Servicios, `/kpis`, `/combustible`; datos de servicios ajenos | Confirmado en código; datos ajenos: Deducido |
| MEDICO | `/pacientes` | Servicios (lista corta «Mis servicios asignados»), Pacientes, Valoraciones, Aerolíneas, Aeropuertos, Captación, Soporte | Logística del servicio (móvil, tripulación, ruta, horas) al editar | Confirmado en código (`soloLecturaLogistica`) |
| AUXILIAR_ENFERMERIA | `/pacientes` | Servicios («Mis servicios asignados»), Pacientes, Dotación e insumos, Captación, Soporte técnico (sin Valoraciones, Aerolíneas ni Aeropuertos) | Igual que MEDICO | Confirmado en código |
| MANTENIMIENTO | `/vehiculos` | Dashboard, Vehículos, Mantenimientos, Novedades, Equipos, Soporte técnico | Servicios, Sala de control, KPIs, Combustible, Configuración, `/admin`, `/ovem` | Confirmado en código (`role-redirects.ts`, menú) |
| COORDINACION | `/` | Dashboard (solo «Vehículos y Operación»), Servicios (solo lectura), Pacientes, Capacitaciones, Estadísticas, AI Insights, Soporte con gestión e indicadores de tickets | Bitácora, Usuarios, Comunicaciones, Configuración; datos de otra ciudad | Menú: Confirmado en código; el libro dice que gestiona usuarios y campañas y el menú no se lo da: anotar |
| GERENCIAL | `/` | Dashboard, Tablero ejecutivo, Combustible, KPIs, Estadísticas, AI Insights, Chat IA, Soporte técnico | Servicios, Pacientes, Vehículos, Sala de control | Confirmado en código (menú y `GERENCIAL_ALLOWED`); sin cargo en SISRES |
| ANALISTA | `/` | Casi todo el menú: Sala de control, Servicios, Pacientes, Valoraciones, Vehículos, Mantenimientos, Equipos, KPIs, Comunicaciones, Configuración, Usuarios, Formatos TI | Permisos, Bitácora, Integraciones, Estado del entorno (solo ADMIN) | Confirmado en código (menú) |
| VISTA | `/servicios` | Servicios, Pacientes, Valoraciones, Equipos, Aerolíneas, Aeropuertos, Soporte técnico | Sala de control, Vehículos; crear, editar, exportar | Menú: Confirmado en código; sin editar: Confirmado (`ROLES_EDICION` no la incluye) |
| TECNICO | `/soporte` | Solo soporte: Soporte técnico, Gestión de tickets, Indicadores | Cualquier otra pantalla (redirige a `/soporte`) | Confirmado en código (`ROLES_RESTRINGIDOS`) |
| AEROPUERTO | `/soporte` | Solo registrar y consultar sus propios tickets | Gestión de tickets, indicadores, servicios, pacientes | Confirmado en código (`ROLES_RESTRINGIDOS`, `puedeGestionarTickets`) |

- [ ] B1 Recorrer las 11 filas del selector: elegir el rol, comprobar que el menú coincide con «Debe ver» y que al pegar en la URL una ruta de «NO debe ver» no se muestra el contenido (redirige al inicio del rol). Anotar cualquier diferencia con la tabla como hallazgo. | Confirmado en código; en pantalla, NO VERIFICADO.
- [ ] B2 Regulación de Bogotá: lista y contadores solo de Bogotá. Requiere un usuario de Bogotá (ver «Cómo se entra»). | Confirmado en código (`veSoloSuCentro`); en pantalla, Deducido (PARIDAD SRV-02).
- [ ] B3 En producción el selector «Ver como…» no aparece. | Confirmado en código (`roleSwitcherEnabled`); en el despliegue, NO VERIFICADO. Ver el conflicto de la sección «Cómo se entra».

## C. Flujo de un servicio

Tipos de servicio que ve Regulación al crear: MEDICINA DOMICILIARIA, TAB SIMPLE, TAB DOBLE, TAM SIMPLE, TAM DOBLE (`TIPOS_SERVICIO_REGULACION`, `servicios-tabla.tsx`). TELEMEDICINA y TRASLADO AEREO los crea ADMIN (u otros roles con el formulario completo). «Enfermería domiciliaria» ya no se ofrece. El nombre anterior «TAB SENCILLO» sobrevive solo en datos históricos. Confirmado en código.

- [ ] C1 Regulación registra `PRUEBA-TAB-01` (TAB SIMPLE): el tipo está entre los 5 del regulador y el método de pago queda N/A. | Tipos: Confirmado en código; método de pago, Deducido (libro, SRG-15). Ver bloque E.
- [ ] C2 Armar la tripulación del móvil en Sala de control (el botón «Repetir tripulación de ayer» existe) y crear un servicio con ese móvil. Esperado: el formulario avisa lo que falta según el tipo: TAB y TAM simples piden OVEM y auxiliar; TAM suma médico; domiciliaria pide OVEM y médico; con botón «Asignar tripulación». Avisa sin impedir guardar. | Confirmado en código (changelog `servicio-asignar-tripulacion-en-formulario`, `ovem-detalle-servicio-ciudad-movil`); pantalla, NO VERIFICADO.
- [ ] C3 TAB SIMPLE en «Mis servicios», en orden: Inicio de desplazamiento, Llegada a sitio, Salida con paciente, Llegada a destino, Paciente entregado. Estados: En desplazamiento, En sitio, En traslado, En destino, Finalizado; el último pasa la etapa a FINALIZADO. | Confirmado en código (`estado-servicio.ts`). Cambio real en base: NO VERIFICADO.
- [ ] C4 TAM SIMPLE: mismos 5 pasos que TAB SIMPLE. | Confirmado en código (`modalidadTraslado`: todo tipo de traslado que no es doble ni aéreo es sencillo).
- [ ] C5 TAB DOBLE y TAM DOBLE, 7 pasos: Inicio de desplazamiento, Llegada a sitio, Salida con paciente, Llegada a punto intermedio, Salida de regreso, Llegada a origen, Paciente entregado. | Confirmado en código (`PASOS_DOBLE`).
- [ ] C5b TRASLADO AEREO (lo crea ADMIN), 7 pasos: igual hasta «Salida con paciente», luego Llegada a aeropuerto, Salida de aeropuerto, Llegada a destino, Paciente entregado. | Confirmado en código (`PASOS_AEREO`).
- [ ] C6 MEDICINA DOMICILIARIA `PRUEBA-DOM-01`: Inicio de desplazamiento, Inicio de atención, Fin de atención (pasa a FINALIZADO). TELEMEDICINA: sin pasos; solo cambio de etapa. | Confirmado en código (`PASOS_DOMICILIARIA`, telemedicina vacía).
- [ ] C7 Servicio programado hace 30 minutos sin llegada marcada: aparece el retraso en minutos; al marcar la llegada desaparece. | Cálculo: Confirmado en código (`minutosDeRetraso`). Que se vea en pantalla: NO VERIFICADO.
- [ ] C8 Dato editado a mano con el último paso marcado y la etapa sin cambiar: Regulación ve «Pendiente de cierre», no «Finalizado». | Confirmado en código (`estadoOperativo`).
- [ ] C9 Finalizar TAB/TAM SIMPLE sin fechas: se bloquea y el mensaje lista «origen, destino» (llegada y salida de cada uno). | Regla: Confirmado en código (`servicios-finalizar.ts`). Que el servidor la aplique: NO VERIFICADO.
- [ ] C10 Finalizar domiciliaria: con llegada y salida completas en el origen o en el destino se permite; sin ninguna, se bloquea. | Confirmado en código (regla).
- [ ] C11 Finalizar TAB DOBLE, TAM DOBLE o TRASLADO AEREO sin punto intermedio: se bloquea y lista «punto intermedio». | Confirmado en código (regla).
- [ ] C12 TELEMEDICINA a FINALIZADO sin fechas: se permite. | Confirmado en código (regla).
- [ ] C13 Cierre negativo (CANCELADO, FALLIDO, NO EFECTIVO, DUPLICADO) con motivo de 4 caracteres: error «mínimo 5»; con 201: «máximo 200»; con motivo válido queda en la bitácora con quién y por qué. | Reglas: Confirmado en código (`servicios-etapas.ts`). Bitácora: NO VERIFICADO.
- [ ] C14 Regulación intenta pasar un servicio FINALIZADO, CANCELADO o DUPLICADO a otra etapa: se rechaza («pídele a un administrador que lo corrija»). ADMIN sí puede. | Lógica: Confirmado en código (`puedeReabrir`, solo ADMIN). Que la acción de servidor la use: NO VERIFICADO.
- [ ] C15 Corrección de un servicio FINALIZADO: la interfaz deja editarlo a ADMIN, ANALISTA y REGULACION (no a COORDINACION ni VISTA). El libro y COBERTURA R-28 no concuerdan sobre Regulación: resultado esperado NO DEFINIDO hasta resolver R-28. | Interfaz: Confirmado en código (`ROLES_EDITAN_FINALIZADO`; la RLS lo hace cumplir según el comentario, migración 055: NO VERIFICADO). Decisión pendiente.
- [ ] C16 Cierre en bloque (ADMIN, REGULACION, ANALISTA): seleccionar servicios y finalizar o cancelar hasta 100; los que no cumplen las reglas se informan sin tocarse. | Deducido (changelog `servicios-vistas-y-cierre-en-bloque`).
- [ ] C17 Paso mal marcado por la tripulación: en «Mis servicios», «Me equivoqué: volver al paso anterior» pide un motivo (mínimo 5 letras), borra el último paso marcado y, si ese paso había iniciado el servicio, lo devuelve a programado; queda en la bitácora. No aparece en un servicio ya cerrado (por ejemplo FINALIZADO): eso lo corrige Regulación o ADMIN. | Confirmado en código (`pasoADevolver` en `estado-servicio.ts`, `devolverPasoServicio`; PR #405). Que la base lo permita a cada rol de la tripulación: NO VERIFICADO.

## D. Permisos cruzados (RLS y rutas)

- [ ] D1 OVEM escribe `/pacientes` y `/vehiculos` en la URL. Esperado: lo devuelve a `/ovem`. | Confirmado en código (`requireRole(rolesDeRuta(...))` redirige al inicio del rol; changelog `ovem-sin-pacientes-ni-vehiculos`). Ya no es una decisión pendiente.
- [ ] D2 OVEM abre por URL un servicio de otro móvil: no ve nombre, cédula ni diagnóstico, y no puede cambiar la tripulación. En un servicio propio, al tocarlo en «Mis servicios» sí ve paciente, diagnóstico y notas. | Propio: Deducido (changelog `ovem-detalle-servicio-ciudad-movil`). Ajeno por URL: NO VERIFICADO.
- [ ] D3 Regulación de Medellín abre por URL un servicio de CRA_BOGOTA: sin acceso o «no encontrado», y no aparece en la lista. | Deducido (PARIDAD SRE-02/SEC-01; migraciones 124, 127 y 137: NO VERIFICADO aquí).
- [ ] D4 Regulación de Medellín, lista de servicios: ninguna fila de Bogotá y el contador coherente. También el resumen, la Sala de control y el aviso de fin de día. | Deducido (PARIDAD SRV-02; changelog `ovem-detalle-servicio-ciudad-movil`).
- [ ] D4b Regulación, Coordinación, médico y auxiliar ven solo pacientes y valoraciones de sus servicios o los que registraron ellos. | Deducido (changelog `rbac-pacientes-valoraciones-ciudad`, migración 135).
- [ ] D5 Regulación pega en la URL cada módulo de la columna «NO debe ver» de la tabla B. Esperado: sin contenido. | Confirmado en código (menú y `requireRole`); en pantalla, Deducido (PARIDAD SEC-02).
- [ ] D6 MEDICO o AUXILIAR intentan eliminar un servicio o un paciente, por la interfaz o con una llamada directa. Esperado: rechazo. | Interfaz: Confirmado en código (el botón Eliminar de servicios es solo ADMIN, `puedeEliminar`). Llamada directa: NO VERIFICADO.
- [ ] D7 Regulación: no aparece «Eliminar» en servicios. En pacientes, clientes y vehículos: comprobar a mano. | Servicios: Confirmado en código; el resto, Deducido (PARIDAD PAC-10, SEC-04).
- [ ] D8 Llamada directa a la API con el token de un rol que no corresponde a un dato: 0 filas o error. | NO VERIFICADO (COBERTURA R-04/R-05, pendiente).
- [ ] D9 ANALISTA y VISTA. VISTA: no ve «Nuevo servicio» ni «Eliminar» ni edita. ANALISTA: la interfaz le muestra «Nuevo servicio» (igual que a ADMIN, REGULACION, MEDICO y AUXILIAR) y no «Eliminar». El libro dice que ANALISTA no registra servicios: **contradice la interfaz**; anotar qué dice la base. | Confirmado en código (`ROLES_EDICION` de `servicios/page.tsx`); lo que acepta la base: NO VERIFICADO.
- [ ] D10 MEDICO y AUXILIAR: ven el botón «Nuevo servicio» aunque el libro dice que no crean servicios. Comprobar si guardan. | Confirmado en código (botón); resultado, NO VERIFICADO.
- [ ] D11 VISTA no puede exportar. «Exportar Excel» de Servicios está en la pantalla de Servicios; comprobar quién lo ve. | NO VERIFICADO (el botón no se condiciona al rol en `servicios/page.tsx`).

## E. Recaudo y copago (BLOQUEADO hasta cerrar el issue #384)

Issue #384 «Copago: marca en el servicio (Regulación) y recaudo registrado por médico/auxiliar»: abierto al 2026-11-25. Hoy SISMANTO no tiene recaudo.

- [ ] E1 BLOQUEADO #384: Regulación registra un servicio; el método de pago queda N/A y no lo elige. | Deducido (libro, SRG-15).
- [ ] E2 BLOQUEADO #384: valor del servicio como texto libre (por ejemplo `PRUEBA-40.000`): cómo se guarda y si hay límite (20 caracteres en SISRES). | Deducido (libro, PARIDAD SRG-14).
- [ ] E3 BLOQUEADO #384: lista de métodos de pago frente a las 9 opciones del libro (N/A, efectivo, transferencias, QR, Wompi). | Deducido (libro, lista sin confirmar).
- [ ] E4 BLOQUEADO #384: copago esperado y cobrado por cliente y plan; balance en Coordinación. | Deducido (libro, PARIDAD).
- [ ] E5 BLOQUEADO #384: quién registra valor y método después de Regulación. Sin respuesta no se puede escribir el resultado esperado. | NO CONFIRMADO (pendiente de Coordinación).

## F. Turno (preoperacional y cierre de turno del OVEM)

- [ ] F1 OVEM hace el preoperacional con campos vacíos, con una falla y con una novedad. Esperado: validaciones; una falla o novedad crítica deja el móvil fuera de servicio y avisa a Regulación, Coordinación y Mantenimiento; si una falla no se alcanza a registrar, la app lo dice y manda llamar a Regulación. | Deducido (changelog `novedad-critica-no-depende-del-texto`, `preoperacional-fallos-hallazgos`; COBERTURA O-04 a O-11).
- [ ] F2 Novedad desde el botón «Reportar novedad» de Regulación (`reportar-novedad-dialog.tsx`): ese formulario llama a `IncidentForm` con `afectaOperatividad={false}` fijo. Esperado hoy: el móvil NO queda fuera de servicio aunque la novedad sea grave (DEU-02). Anotarlo como hallazgo conocido. | Confirmado en código (valor fijo); efecto en base, NO VERIFICADO. DEU-03 (no reportar novedad de un móvil ya fuera de servicio): Deducido.
- [ ] F3 Cierre de turno del OVEM («Cerrar turno» en `/ovem`): kilometraje final, ¿hubo novedades?, nivel de combustible, ¿queda limpio? y «Entrego el vehículo a». La Sala de control de Regulación muestra los cierres de hoy. | Confirmado en código (`cierre-turno-form.tsx`, `cierres-turno-hoy.tsx`, migración 115); validaciones y datos guardados, NO VERIFICADO.
- [ ] F4 Relevo entre reguladores: recibir el turno del anterior. Sin paso documentado en SISRES ni SISMANTO. Esperado: NO DEFINIDO; hueco a discutir. | NO CONFIRMADO (pendiente de Regulación).
- [ ] F5 Cambiar la tripulación de un móvil con servicios programados sin iniciar. Esperado: los servicios pasan al nuevo OVEM y la pantalla avisa cuántos pasaron y si algo no se pudo hacer. | Deducido (changelog `programacion-servicios-siguen-ovem`, `servicio-asignar-tripulacion-en-formulario`). Sustituye a la nota anterior (DEU-01, «en silencio»).
- [ ] F6 Al asignar tripulación en Sala de control aparece el botón «Repetir tripulación de ayer». | Confirmado en código (`regulacion-fleet.tsx`; la acción lee la tripulación de ayer en `regulacion.ts`). El guion anterior decía que se había eliminado: ya no es cierto.

## Resumen para el issue

Cubre: humo y login (A), 11 roles del selector con su «debe ver / no debe ver» tomado del menú real (B), flujo TAB/TAM/aéreo/domiciliaria y cierres (C), permisos cruzados (D), recaudo bloqueado (E) y turno (F).

Sin verificar: resultado real en pantalla de casi todo (el guion solo contrasta el código), cierre de sesión, RLS por API (D8), cambiar el centro de un usuario de prueba, recaudo (#384), exportar por rol (D11) y los límites reales de ANALISTA, MEDICO y AUXILIAR para crear servicios (D9, D10).

Conflictos a decidir: Regulación editando finalizados (C15, R-28), si los usuarios de prueba viven en producción, el menú de COORDINACION frente al libro (usuarios y campañas), y el prefijo de limpieza (`PRUEBA-` aquí, `TEST-` en COBERTURA).
