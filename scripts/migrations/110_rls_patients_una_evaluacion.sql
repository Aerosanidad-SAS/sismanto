-- ============================================================
-- Migración 110: RLS de `patients` evaluada una vez por consulta, no una vez por fila
--
-- Auditoría de seguridad del 2026-10-01 (AUDITORIA_SEGURIDAD_2026-10-01.md, PR #160, hallazgo #4): la migración
-- 087 corrigió el bloqueo real de Servicios (medical_services, 41.523 filas, PR #109) envolviendo las llamadas a
-- get_user_role()/es_rol_restringido() en (SELECT ...) — necesario para que Postgres las evalúe una vez por
-- consulta (InitPlan) en vez de una vez por fila — pero solo en el generador de `zz_rol_restringido` y en las
-- políticas propias de `medical_services`. El resto de las políticas propias del esquema, escritas a mano antes
-- de esa migración, se quedaron sin envolver: 78 tablas, según la auditoría.
--
-- Esta migración generaliza el arreglo UNA tabla a la vez, empezando por la de más riesgo: `patients` tiene
-- 20.038 filas y sigue creciendo — es la misma situación que tenía `medical_services` antes del incidente de
-- septiembre. Las demás 77 tablas quedan para migraciones siguientes (están casi todas muy por debajo de la
-- escala donde esto importa: ver AUDITORIA_SEGURIDAD_2026-10-01.md para la lista completa).
--
-- No cambia NINGUNA condición de acceso — solo envuelve exactamente la misma llamada que ya existía en cada
-- política. Las cuatro políticas propias de `patients` (select/insert/update/delete) llamaban get_user_role()
-- sin envolver; aquí se vuelven a crear con la llamada envuelta, letra por letra iguales salvo eso.
-- `zz_rol_restringido` ya estaba bien desde la 087 y no se toca.
--
-- Idempotente: DROP POLICY IF EXISTS nunca falla.
-- ============================================================

DROP POLICY IF EXISTS patients_select ON patients;
CREATE POLICY patients_select ON patients
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'REGULACION', 'COORDINACION', 'ANALISTA', 'MEDICO', 'AUXILIAR_ENFERMERIA', 'VISTA']::text[]));

DROP POLICY IF EXISTS patients_insert ON patients;
CREATE POLICY patients_insert ON patients
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'REGULACION', 'MEDICO', 'AUXILIAR_ENFERMERIA', 'ANALISTA']::text[]));

DROP POLICY IF EXISTS patients_update ON patients;
CREATE POLICY patients_update ON patients
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'REGULACION', 'MEDICO', 'AUXILIAR_ENFERMERIA', 'ANALISTA']::text[]))
  WITH CHECK ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'REGULACION', 'MEDICO', 'AUXILIAR_ENFERMERIA', 'ANALISTA']::text[]));

DROP POLICY IF EXISTS patients_delete ON patients;
CREATE POLICY patients_delete ON patients
  FOR DELETE TO authenticated
  USING ((SELECT get_user_role())::text = 'ADMIN');
