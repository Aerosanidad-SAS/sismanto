# Paridad Regulación: SISRES → SISMANTO

**Para:** David · **Alcance:** todo lo que el rol Regulador (cargo 4) puede hacer en SISRES en producción, contra lo que hoy hace REGULACION en SISMANTO.

Regulación es el primer área que va a dejar SISRES, así que esta lista es la que decide cuándo está lista.

## Cómo se usa

1. **Prueba cada fila** en staging con el usuario `regulacion.mde` (Medellín) o `regulacion.bgt` (Bogotá) y marca la casilla.
2. **Si el estado dice ❌ o 🟡, la fila es tu tarea.** Trabájala con Claude Code: abre una rama `feat/david-<tema>`, un PR por tema hacia `dev`, y sigue las reglas de equipo del `CLAUDE.md` (sin `db:apply` desde ramas sin mergear, migraciones numeradas al final, PR con plantilla).
3. **Si encuentras que algo marcado ✅ no funciona**, esa también es tarea: corrígelo y dilo en el PR.
4. La columna **Prio** manda el orden: **B** bloquea el corte · **P** primeras semanas · **C** no se migra (no lo desarrolles).

Los códigos (`SRV-01`…) vienen del inventario del código de SISRES; úsalos en los PR y en los reportes para que los tres hablemos de lo mismo.

Leyenda de estado: ✅ existe en SISMANTO · 🟡 existe a medias · ❌ no existe · ⛔ decidido no migrar.

---

## 1. Entrada y menú

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | MEN-01 | Entra y aterriza en su pantalla de trabajo | ✅ aterriza en `/servicios` | Inicia sesión: la primera pantalla es la lista de servicios | B |
| ☐ | MEN-02 | Menú: Servicios · Pacientes · Proveedores · Clientes · Vehículos · Soporte Técnico · Aeroportuaria · Alertas | 🟡 tiene Servicios, Sala de control, Clientes, Proveedores, Pacientes, Vehículos, Novedades | Compara el menú lado a lado con SISRES | B |
| ☐ | MEN-08 | **Soporte Técnico:** "Nuevo Ticket" y "Mis Tickets" | ❌ no existe el módulo | Crear ticket con sede, área, categoría, prioridad, asunto, descripción y adjunto; y listar solo los propios | B |
| ☐ | MEN-11 | **Campana de Alertas** con contador de vehículos con documento por vencer | ❌ | La campana muestra el número y, al abrirla, una fila por placa con SOAT / técnico-mecánica / pase | B |
| ☐ | MEN-12 | Semáforo de la campana: verde > 30 d, amarillo 15–30 d, rojo < 15 d o vencido | ❌ | En SISMANTO los vencimientos solo están dentro de la sala de control, a 30 días y sin semáforo | B |
| ☐ | MEN-06 | **Pre-Operacional** en su menú | 🟡 existe pero solo para OVEM | Decidir con Daniel si Regulación necesita verlo; si sí, agregarlo en consulta | P |
| ☐ | MEN-06 | **GPS**: mapa de seguimiento de ambulancias con tráfico y ruta origen→intermedio→destino | ❌ | Requiere ProTrack365 + mapa. Tarea grande, va después del corte | P |
| ☐ | MEN-09 | **Aeroportuaria**: captaciones + 4 informes regulatorios | ⛔ | Daniel confirmó que casi no se usa; se hace después del corte | C |
| ☐ | MEN-15 | Agente de IA en el menú | ⛔ | SISMANTO ya tiene `/ai-chat`, mejor, pero no para REGULACION | C |

---

## 2. Servicios — listado

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | SRV-01 | Abre el listado de servicios | ✅ | | B |
| ☐ | SRV-02 | Solo ve los servicios de **su ciudad** | 🟡 en SISMANTO el recorte es por **centro operativo**, y solo en la aplicación, no en la base | Con `regulacion.mde` no deben verse servicios de Bogotá | B |
| ☐ | SRV-03 | Filtra por rango de fecha programada | ✅ | | B |
| ☐ | SRV-04 | Filtra por tipo de servicio | ✅ | | B |
| ☐ | SRV-05 | Filtra por estado/etapa | ✅ | | B |
| ☐ | SRV-06 | Filtra por cliente | ✅ | | B |
| ☐ | SRV-07 | Filtra por ciudad de origen y de destino | ✅ | | B |
| ☐ | SRV-08 | Busca por cédula (parcial) | ✅ | Registra un servicio nuevo y búscalo por la cédula del paciente | B |
| ☐ | SRV-09 | Botón para aplicar y para deshacer los filtros | ✅ "Aplicar filtros" / "Limpiar" | | B |
| ☐ | SRV-10 | Contador "Mostrando N de M" y hora de última actualización | ✅ | | B |
| ☐ | SRV-11 | **Exporta a Excel** respetando los filtros | ✅ 49 columnas, tope 50 000 | Exporta con y sin filtros y compara las columnas con el Excel de SISRES | B |
| ☐ | SRV-14 | Tabla con 52 columnas y la columna de acciones fija a la izquierda | 🟡 SISMANTO muestra 8 columnas | Pregúntale a Regulación qué columnas usa de verdad antes de agregar 40 | P |
| ☐ | SRV-15 | Etapa como badge de color | ✅ | | B |
| ☐ | SRV-16 | Badge "⏰ Nh" de servicio estancado | 🟡 existe, pero el umbral está fijo en código (4 h) | Traer el umbral real de producción y hacerlo configurable | P |
| ☐ | SRV-17 | Columna que indica si el servicio tiene boleta de salida | ❌ | En SISMANTO la boleta solo se ve entrando a editar | P |
| ☐ | SRV-18 | Menú "⚙️" de acciones por fila | 🟡 SISMANTO tiene botones sueltos (Mover a…, Editar) | | P |
| ☐ | SRV-19 | Acción **"Actualizar datos (WA)"**: manda al paciente un enlace con token para que corrija sus datos | ❌ | Enlace público con token opaco, no con el id | P |
| ☐ | SRV-20/21/22 | Acción **"Ubicación"**: enviar al paciente la ubicación del móvil por WhatsApp y por correo | ❌ | Depende del GPS | P |
| ☐ | SRV-23 | Acción rápida **"Marcar en curso"** en las filas PROGRAMADO | 🟡 SISMANTO tiene "Mover a…" con todas las etapas | Agregar el atajo de un clic, que es lo que usan a diario | B |
| ☐ | SRV-24 | Al marcar en curso, WhatsApp `servicio_en_curso` al paciente (solo Medicina Domiciliaria) | ✅ | Requiere credenciales de WhatsApp; sin ellas queda simulado | B |
| ☐ | SRV-26 | Un servicio FINALIZADO solo se puede **ver**, no editar | 🟡 en SISMANTO Regulación **sí** puede editarlo, con auditoría | Decisión de Daniel: en SISMANTO se permite a propósito. Confírmalo con Regulación | P |
| ☐ | SRV-27 | No puede eliminar servicios | ✅ igual | Confirma que no aparece el botón | B |
| ☐ | SRV-28 | Paginador conservando filtros | ✅ | Prueba con más de 100 servicios en el centro | B |
| ☐ | SRV-29 | La tabla se refresca sola | ✅ cada 60 s (SISRES cada 1,5 s) | Verifica que no te borre lo que estás escribiendo | B |
| ☐ | SRV-31 | Filas coloreadas por etapa; las de CURSO parpadean | ❌ | Confirmar con Regulación si el parpadeo les sirve o les molesta | P |

## 3. Servicios — avisos y sonidos

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | SRV-13 | Botón "Sonido ON/OFF" que se recuerda en el navegador | ✅ | | B |
| ☐ | ALR-01 | Aviso + sonido a 60, 30 y 15 minutos de la hora programada | ✅ mismos tonos | Programa un servicio a 12 minutos y espera el aviso rojo | B |
| ☐ | ALR-03 | Aviso de servicio estancado, con horas y etapa | ✅ | | B |
| ☐ | ALR-04 | Si hay muchos estancados, un solo aviso agrupado | ✅ (SISMANTO agrupa desde 4; SISRES desde 6) | | P |
| ☐ | ALR-05 | Tono al pasar a CURSO | ✅ | | B |
| ☐ | ALR-06 | Tono al pasar a FINALIZADO | ✅ | | B |

## 4. Servicios — registrar

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | SRG-01 | Abre el formulario de registro | ✅ botón "+ Registrar" | | B |
| ☐ | SRG-02 | Busca el paciente por documento y autocompleta | ✅ typeahead por cédula o nombre | | B |
| ☐ | SRG-03/04 | Si el paciente no existe, lo crea **sin salir** del formulario | 🟡 SISMANTO deja escribir el nombre, pero no crea la ficha del paciente | Esto obliga hoy a ir a Pacientes y volver: es fricción diaria | B |
| ☐ | SRG-05 | En ese modal, la edad se calcula sola y las ciudades dependen del departamento | 🟡 la cascada existe en el formulario de paciente | | P |
| ☐ | SRG-06 | El Regulador solo ve 5 tipos de servicio al registrar | ✅ | Confirma que no aparecen Telemedicina, Enfermería domiciliaria ni Traslado aéreo | B |
| ☐ | SRG-07 | Móvil, turno y fecha/hora de programación | ✅ | | B |
| ☐ | SRG-08 | No ve "Oportunidad de atención" (la calcula el sistema) | ✅ | | B |
| ☐ | SRG-09 | Autorización, CIE-10 por código o diagnóstico, dirección | ✅ | | B |
| ☐ | SRG-10 | Asesor / Prestador / Aislamiento / Soporte solo aparecen en TAB y TAM | ✅ por perfil de formulario | | B |
| ☐ | SRG-11 | Departamento y ciudad de origen y destino en cascada + perímetro | ✅ | | B |
| ☐ | SRG-12 | No ve la sección de tiempos al registrar | 🟡 SISMANTO sí los muestra | Verifica con Regulación si estorban al registrar | P |
| ☐ | SRG-14 | Finalidad, acepta IPS y valor del servicio | ✅ | El valor quedó opcional de verdad (PR #10) | B |
| ☐ | SRG-15 | No ve método de pago: se fuerza a N/A | ✅ | | B |
| ☐ | SRG-16 | Cliente; proveedor solo en TAB/TAM | ✅ | | B |
| ☐ | SRG-17 | Asigna médico, auxiliar y OVEM | ✅ y además autocompleta la tripulación del móvil | | B |
| ☐ | SRG-18/19 | "Recibe" con su nombre bloqueado y "Despacha" como lista de reguladores | ✅ | | B |
| ☐ | SRG-21 | Motivo externo y motivo interno | ✅ | | B |
| ☐ | SRG-22 | Elige la etapa inicial entre las 7 | ✅ | Registra un servicio directamente como NO EFECTIVO | B |
| ☐ | SRG-24 | Los campos obligatorios se validan en pantalla **y** en el servidor | 🟡 SISMANTO valida con Zod, pero la lista de obligatorios no es configurable (decisión: no se migra) | Acuerda con Regulación la lista fija | B |
| ☐ | SRG-25 | El registro queda en el log del sistema | ❌ no hay log general | Ver SEC-05 | B |

## 5. Servicios — editar

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | SRE-01 | Abre un servicio para editar | ✅ | | B |
| ☐ | SRE-02 | Cambiar el id en la URL a un servicio de otra ciudad da 403 | 🟡 en SISMANTO no hay pantalla por id; el recorte por centro no está en la base | Ver SEC-01 | B |
| ☐ | SRE-04..09 | Edita paciente, tipo, móvil, turno, tiempos, direcciones, tripulación, cierre, etapa y estado | ✅ | | B |
| ☐ | SRE-10 | Sube, ve y descarga la **boleta de salida** | ✅ subir y ver | Falta "descargar"; verifica el tamaño y los formatos aceptados | B |
| ☐ | SRE-11 | Avisa al abrir si al servicio le falta la boleta | ✅ | | P |
| ☐ | SRE-13 | Al pasar a FINALIZADO exige las fechas de llegada y salida según el tipo | ❌ | En SISMANTO se puede finalizar sin tiempos: esto ensucia los indicadores | B |
| ☐ | SRE-15 | Al cambiar de etapa se dispara la plantilla de WhatsApp | ✅ | | B |

## 6. Pacientes

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | PAC-01 | Abre el listado de pacientes | ✅ | | B |
| ☐ | PAC-02 | Busca por cédula | ✅ busca por documento, nombre, EPS o ciudad | | B |
| ☐ | PAC-03 | Ve las 18 columnas de la ficha | 🟡 SISMANTO muestra menos | Pregunta cuáles usan | P |
| ☐ | PAC-04 | **Exporta pacientes a Excel** | ❌ | Reutiliza la exportación de servicios | B |
| ☐ | PAC-05 | Registra un paciente | ✅ | | B |
| ☐ | PAC-06 | Ciudades en cascada y edad calculada | 🟡 | | P |
| ☐ | PAC-07 | Rechaza cédula duplicada o de menos de 5 caracteres | 🟡 SISMANTO rechaza duplicados; falta confirmar el mínimo y el índice único | Intenta crear dos pacientes con la misma cédula | B |
| ☐ | PAC-08 | Edita un paciente (la cédula no se cambia) | ✅ | | B |
| ☐ | PAC-10 | No puede eliminar pacientes | ❌ **en SISMANTO sí puede desactivarlos** | Decidir: en SISRES el Regulador no puede | B |
| ☐ | — | El catálogo de EPS es una lista, no texto libre | ❌ la tabla `eps` existe desde la migración 058, sin usar | | B |

## 7. Clientes y proveedores

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | CLI-01/03 | Ve el listado de clientes | ✅ `/clientes` | Vacío hasta correr la ETL | B |
| ☐ | CLI-02 | Busca y filtra en vivo | ✅ | | B |
| ☐ | CLI-04 | **Registra** un cliente | ❌ en SISMANTO es solo consulta | En SISRES el Regulador sí puede crear | B |
| ☐ | CLI-05 | **Edita** un cliente | ❌ | | B |
| ☐ | CLI-06 | No puede eliminar clientes | ✅ | | B |
| ☐ | PRV-01/05 | Ve el listado de proveedores con ciudad, área y estado | ✅ `/proveedores` | | B |
| ☐ | PRV-02/03/04 | Busca, filtra por ciudad y área, y limpia filtros | ✅ | | B |
| ☐ | PRV-06 | **Registra** un proveedor | ❌ solo consulta | | B |
| ☐ | PRV-07 | **Edita** un proveedor | ❌ | | B |
| ☐ | PRV-09 | Paginador arriba y abajo | ❌ corta en 300 filas en el navegador | Con 1 329 proveedores reales esto se nota | B |

## 8. Vehículos

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | VEH-01 | Ve el listado de vehículos | ✅ | | B |
| ☐ | VEH-02 | Busca por placa, tipo, IMEI o ciudad | ❌ la tabla no tiene buscador | | B |
| ☐ | VEH-03 | Columnas: placa, tipo, SOAT, técnico-mecánica, ciudad, pase, ubicación, multas, estado | 🟡 faltan ubicación, multas y observación de multa | | P |
| ☐ | VEH-04 | **Registra** un vehículo | ❌ está en Configuración, fuera de su alcance | En SISRES el Regulador sí puede | P |
| ☐ | VEH-05 | **Edita** un vehículo | ✅ ficha general y especificaciones | | B |
| ☐ | VEH-06 | No puede eliminar vehículos | ✅ | | B |
| ☐ | — | Registra kilometraje del móvil | ✅ extra de SISMANTO | | — |
| ☐ | — | Pasa un móvil a fuera de servicio y vuelve, con historial | ✅ extra de SISMANTO | | — |

## 9. Soporte técnico (tickets) — módulo completo por construir

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | TIC-01/02 | Crea un ticket: celular, sede, área, categoría, prioridad, asunto (≤150) y descripción | ❌ | Todos obligatorios | B |
| ☐ | TIC-03 | Adjunta una imagen al ticket | ❌ | Usa Supabase Storage, como la boleta de salida | B |
| ☐ | TIC-04 | **No** puede registrar a nombre de otro | ❌ | Caso negativo | B |
| ☐ | TIC-06 | Al crear, se notifica por correo a los gestores y al solicitante | ❌ | Depende del correo (SEC-06) | B |
| ☐ | TIC-07 | "Mis tickets": solo los que él registró | ❌ | Caso negativo: no debe ver los de otros | B |
| ☐ | TIC-09 | Filtra sus tickets por estado | ❌ | | B |
| ☐ | TIC-10 | Ve estado, categoría, prioridad, área, sede, asunto, técnico, creado y solución | ❌ | | B |
| ☐ | TIC-11/12/13 | Reabre un ticket **cerrado** con una nota obligatoria, y solo los propios | ❌ | | B |
| ☐ | TIC-14 | **No** ve Gestión de tickets ni Indicadores | ❌ | Caso negativo; esos son de Sistemas (lista de León) | B |

## 10. Estadísticas

| ✔ | # | Capacidad en SISRES | SISMANTO | Cómo se verifica | Prio |
|---|---|---|---|---|---|
| ☐ | EST-02 | Ve las estadísticas de servicios | 🟡 `/estadisticas` no está en el menú de REGULACION | Decidir si Regulación las necesita | P |
| ☐ | EST-04/05/06 | Resumen consolidado + por tipo + por ciudad | ✅ en `/servicios` (Resumen operativo) | Recuerda: en SISMANTO cuenta solo su centro (PR #10) | B |
| ☐ | EST-07..10 | 6 filtros, 2 KPI, tendencia por año/mes/semana y 9 gráficas | 🟡 SISMANTO tiene ~4 gráficas | Pregunta a gerencia cuáles miran de verdad | P |

## 11. Casos negativos (lo que **no** debe poder hacer)

Pruébalos escribiendo la URL a mano con la sesión de Regulación.

| ✔ | # | Qué se espera | SISMANTO | Prio |
|---|---|---|---|---|
| ☐ | SEC-01 | No ver servicios de otro centro, ni siquiera cambiando la URL | 🟡 el recorte por centro **no está en RLS**, solo en la aplicación | B |
| ☐ | SEC-02 | No abrir Mantenimientos, Equipos, KPIs, Combustible, Estadísticas, Comunicaciones ni Valoraciones | ❌ hoy abre esas rutas: no tienen guarda de página | B |
| ☐ | SEC-03 | No ver el resumen operativo de otras ciudades | ✅ corregido en el PR #10 | B |
| ☐ | SEC-04 | No eliminar servicios, pacientes, clientes, proveedores ni vehículos | 🟡 revisar: hoy puede desactivar pacientes | B |
| ☐ | SEC-05 | Que quede registro de quién creó, editó o borró qué (log del sistema) | ❌ solo hay auditoría de servicios finalizados | B |
| ☐ | SEC-06 | Correos del sistema funcionando (tickets, recuperación de contraseña) | ❌ el código de correo existe pero no se usa | B |
| ☐ | SEC-07 | Las acciones de servidor deben validar el rol, no confiar solo en la base | 🟡 `pacientes.ts`, `incidents.ts` y otras no llaman `requireRole` | B |

## 12. Deuda encontrada leyendo el código (arréglalas si tocas esa pantalla)

| ✔ | # | Qué pasa | Dónde |
|---|---|---|---|
| ☐ | DEU-01 | Al cambiar la tripulación de un móvil se reasignan en silencio los servicios PROGRAMADO, sin decir cuántos | `src/app/api/actions/regulacion.ts` (`reasignarServiciosNoIniciados`) |
| ☐ | DEU-02 | La novedad reportada desde la sala de control nunca saca el móvil de servicio: `afectaOperatividad` está fijo en `false` | `src/components/regulacion/barra-tablero.tsx` |
| ☐ | DEU-03 | No se puede reportar novedad de un móvil que ya está fuera de servicio | mismo archivo |
| ☐ | DEU-04 | No hay botón para crear una novedad desde `/novedades` | `src/app/(dashboard)/novedades/page.tsx` |
| ☐ | DEU-05 | `/novedades` y `/vehiculos` no filtran por centro | `getNovedades`, `getVehicles` |
| ☐ | DEU-06 | Texto obsoleto en `/novedades` sobre la migración 006 | `src/app/(dashboard)/novedades/page.tsx` |
| ☐ | DEU-07 | La tripulación solo se asigna para hoy: la acción acepta fecha fin pero la pantalla no la usa | `src/components/regulacion/regulacion-fleet.tsx` |
| ☐ | DEU-08 | Regulación no puede corregir un paso mal marcado por la tripulación sin editar los tiempos a mano | `marcarPasoServicio` sin UI para ese rol |

---

## Lo que SISMANTO ya hace mejor que SISRES (no lo rompas)

- **Sala de control** con servicios del día, contadores, flota y vencimientos en una pantalla.
- **Estado del servicio por pasos** y **retraso en minutos** calculados desde los tiempos.
- **Recorte por centro operativo** por usuario.
- **Tripulación por rol en turno** (OVEM + médico + auxiliar) con reasignación automática.
- **Novedades del vehículo** con cierre ligado a mantenimiento y paso automático a fuera de servicio.
- **Plan de mantenimiento y kilometraje** del móvil visibles para despacho.
- **Candado de servicio finalizado** con auditoría automática.
- **Login por cédula**.
