-- ============================================================
-- Migración 121: evaluaciones de capacitación a prueba de trampa (revisión de seguridad pre-producción, 2026-10-06)
--
-- Problemas (MEDIO, integridad de los registros de capacitación de los conductores):
--   1. `ts_insert`, `ts_update` (training_sessions) y `tres_insert` (training_responses) dejaban al propio conductor
--      escribir directamente por la API REST: ponerse `puntaje_final`, `estado = 'CALIFICADA'`, `puntaje_mc`, o
--      escribir respuestas con `es_correcta = true`. La aplicación NO usa esas políticas: todas las escrituras de
--      capacitaciones salen del servidor con la clave de servicio (`iniciarSesion`, `guardarRespuesta`,
--      `finalizarSesion`, `calificarSesion`), que calcula `es_correcta` y el puntaje por su cuenta.
--   2. `training_question_options.es_correcta` (la clave de respuestas) era legible por cualquier usuario autenticado, y
--      `getTrainingWithQuestions` la enviaba al navegador de quien rinde la evaluación.
--
-- Arreglo:
--   · Se eliminan `ts_insert` y `tres_insert`; `ts_update` queda solo para ADMIN y COORDINACION (como estaba para
--     ellos). El conductor ya no escribe nada de capacitaciones por su cuenta; sigue LEYENDO lo suyo.
--   · Privilegio por columna: `authenticated` ya no puede leer `es_correcta`; sigue leyendo `id, question_id, orden,
--     texto`. La clave de respuestas la leen ADMIN y COORDINACION por el servidor con la clave de servicio
--     (`getTrainingWithQuestions`), nunca desde el navegador del conductor.
--
-- ⚠️ Orden de despliegue: el código de `getTrainingWithQuestions` viaja en el mismo PR. Si la migración se aplica antes
-- de desplegar el código, la pantalla de evaluación falla un momento (el código viejo pide `*`).
-- Idempotente. Rollback: GRANT SELECT ON training_question_options TO authenticated y recrear ts_insert/ts_update/
-- tres_insert como en 013_coordinacion_capacitaciones.sql (no recomendado).
-- ============================================================

DROP POLICY IF EXISTS ts_insert ON training_sessions;

DROP POLICY IF EXISTS ts_update ON training_sessions;
CREATE POLICY ts_update ON training_sessions
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role()) IN ('ADMIN', 'COORDINACION'))
  WITH CHECK ((SELECT get_user_role()) IN ('ADMIN', 'COORDINACION'));

DROP POLICY IF EXISTS tres_insert ON training_responses;

REVOKE SELECT ON training_question_options FROM anon, authenticated;
GRANT SELECT (id, question_id, orden, texto) ON training_question_options TO authenticated;
