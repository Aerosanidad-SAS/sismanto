# Preguntas para León — Ronda 2 (validación de módulos ya construidos)

**Contexto:** ya se construyó en código el módulo completo de servicios médicos, pacientes,
equipos biomédicos y comunicaciones dentro de `integration/sisres` (repo `aeromanto`). Varias
decisiones se tomaron a partir de leer el código PHP de SISRES, pero sin acceso a la base de
datos real ni al conocimiento operativo que solo tiene León. Esta ronda es más corta que la
primera — son 6 preguntas puntuales, cada una apuntando al archivo/línea exacta que hay que
verificar o corregir.

**Instrucciones para el Claude Code de León:** leé cada pregunta, verificá contra el código y la
base de datos real de `sisres`, y escribí las respuestas en `sisres/RESPUESTAS_LEON.md`, en una
sección nueva al final llamada `## Ronda 2`, en la rama `audit/integration-analysis` (no toques
main). Mismo criterio que la ronda 1: si algo no es verificable desde código/BD, respondé desde tu
conocimiento y marcalo como "no verificado en código".

---

## Prompt para pasarle a León

```
Ya se construyó en Aeromanto (rama integration/sisres) el módulo completo de servicios médicos,
pacientes, equipos biomédicos y comunicaciones, portado desde SISRES. Antes de que yo revise el
código a fondo, necesito que resuelvas 6 dudas puntuales que solo vos podés verificar contra el
sistema real de SISRES:

1. ROL ANALISTA — En aeromanto/scripts/migrations/035_sisres_roles.sql lo definí como
   "Consulta y análisis de servicios médicos, estadísticas y reportes" y lo implementé como
   rol de SOLO LECTURA (ve pacientes, servicios, valoraciones, equipos y estadísticas, pero no
   puede crear/editar/borrar nada). ¿Es correcto ese alcance? ¿Un Analista necesita poder
   exportar reportes (CSV/Excel), filtrar por rango de fechas/cliente/sede, o alguna otra
   capacidad que hoy no cubrí?

2. TIPOS DE SERVICIO — En aeromanto/src/components/servicios/servicios-tabla.tsx, constante
   TIPOS_SERVICIO, inventé una lista provisional (TRASLADO ASISTENCIAL BASICO, TRASLADO
   ASISTENCIAL MEDICALIZADO, ATENCION PREHOSPITALARIA, AREA PROTEGIDA, EVENTO, VALORACION, OTRO)
   basándome en nombres que aparecen sueltos en el código. Necesito la lista REAL y EXACTA de
   valores que usa hoy la producción. Si podés correr
   `SELECT DISTINCT tipoServicio, COUNT(*) FROM servicios GROUP BY tipoServicio ORDER BY 2 DESC`
   y pegar el resultado, mejor.

3. ETAPAS Y TRANSICIONES DE SERVICIO — En
   aeromanto/src/app/api/actions/servicios-medicos.ts, constante TRANSICIONES, asumí el flujo
   PROGRAMADO → CURSO → (FINALIZADO | CANCELADO | FALLIDO | NO_EFECTIVO), basado en lo que vi en
   cambiarEtapaRapido.php y en los valores de etapaServicio que encontré en el código. ¿Es
   correcto? ¿Hay alguna otra etapa, o alguna transición especial (ej. poder devolver de CURSO a
   PROGRAMADO) que no contemplé?

4. COMPORTAMIENTO CONDICIONAL DEL FORMULARIO DE SERVICIOS — No tuve forma de auditar a fondo la
   lógica condicional real de SISRES (qué campos son obligatorios u ocultos según tipoServicio o
   según el rol que carga el servicio). Armé un formulario único con todos los campos visibles
   siempre (aeromanto/src/components/servicios/servicios-tabla.tsx). ¿Hay reglas condicionales
   importantes que se pierden con este formulario "plano"? Si las hay, describilas o señalá en
   qué archivo de SISRES están (ej. registroServicios.php, editarServicio.php).

5. PLANTILLAS DE WHATSAPP REALES — Porté el cliente de WhatsApp Cloud API a
   aeromanto/src/lib/notifications/whatsapp.ts, pero no tengo los nombres reales de las
   plantillas aprobadas en el WhatsApp Business Manager de Meta que usa SISRES hoy. ¿Cuáles son
   (nombre exacto + idioma) para poder probarlas?

6. HOJA DE VIDA EN PDF — El módulo de Equipos Biomédicos (aeromanto/src/components/equipos/
   equipos-tabla.tsx) hoy muestra la hoja de vida en pantalla (ficha + historial), pero no
   genera PDF todavía — es la única pieza pendiente de portar del módulo original
   (hojaVidaEquipo.php usa TCPDF). ¿Qué columnas/formato exacto necesita ese PDF? ¿Hay una
   plantilla con membrete/logo institucional que deba replicar?

7. CÉDULAS DE TODOS LOS USUARIOS DE SISRES — Cambio de alcance: ya no es solo para confirmar
   la hipótesis de los 3 cargos que se sospechaba se solapaban con Aeromanto (Regulador,
   Coordinador, OVEM). Todos los usuarios de SISRES van a terminar siendo usuarios del sistema
   único final, así que necesito la cédula + nombre completo + email + cargo de TODOS los
   usuarios activos de SISRES (los 8 cargos: Administrador, Regulador/Despachador, Coordinador,
   OVEM, Analista, Médico, Auxiliar de Enfermería, Vista) — no solo los 3 de la Ronda 1. Con
   `SELECT` a la tabla de usuarios de SISRES alcanza. Aeromanto ya tiene una columna `cedula`
   en `user_profiles` (migración 043) para poder cruzar por documento exacto en vez de por
   nombre aproximado.

Escribí las respuestas en sisres/RESPUESTAS_LEON.md, sección nueva "## Ronda 2" al final del
archivo, misma rama audit/integration-analysis.
```
