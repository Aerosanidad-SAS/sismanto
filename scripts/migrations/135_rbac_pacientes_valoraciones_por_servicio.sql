-- ============================================================
-- Migración 135: pacientes y valoraciones solo para quien puede ver sus servicios (RBAC por ciudad y por vínculo)
--
-- Hasta hoy `patients_select` y `medical_assessments_select` dejaban leer TODOS los pacientes y valoraciones a
-- REGULACION, COORDINACION, MEDICO, AUXILIAR_ENFERMERIA y ANALISTA/VISTA, sin importar la ciudad ni el servicio. Con eso
-- Regulación de Medellín veía pacientes atendidos en Bogotá, y un médico veía las valoraciones de cualquiera.
--
-- Además, `medical_assessments_write` era una política FOR ALL: en Postgres una política permisiva también autoriza
-- SELECT, así que filtraba las valoraciones aunque la de SELECT estuviera bien. Por eso se parte en INSERT, UPDATE y DELETE.
--
-- Regla nueva (decisión de David, 2026-10-20):
--   · ADMIN, ANALISTA y VISTA siguen viendo todo.
--   · REGULACION, COORDINACION, MEDICO y AUXILIAR_ENFERMERIA ven un paciente, o una valoración, solo si:
--       - lo registraron ellos (`created_by = auth.uid()`), o
--       - el paciente tiene al menos un servicio que ese usuario puede ver.
--     Esa segunda condición se evalúa con la política de `medical_services` del propio usuario, así que hereda la
--     regla de ciudad (124/127) y la de vínculo del médico/auxiliar (`medico_user_id`, `auxiliar_user_id`) sin duplicarla.
--   · UPDATE y DELETE pasan por la misma visibilidad: no se puede editar lo que no se puede ver.
--
-- Efectos a tener en cuenta:
--   · Una valoración sin `patient_id` (registros antiguos de SISRES) solo la ven ADMIN, ANALISTA y VISTA.
--   · Un paciente recién creado sin servicios solo lo ve quien lo creó (por eso el alta guarda `created_by`).
--   · GERENCIAL sigue sin acceso a pacientes y valoraciones, como antes.
--
-- No destructiva, idempotente. Rollback: recrear las políticas de la 110 (patients), de la 039 y la 046
-- (medical_assessments: select y write FOR ALL).
-- ============================================================

-- ─── 1. patients ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS patients_select ON patients;
CREATE POLICY patients_select ON patients
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'VISTA')
    OR (
      (SELECT get_user_role())::text IN ('REGULACION', 'COORDINACION', 'MEDICO', 'AUXILIAR_ENFERMERIA')
      AND (
        created_by = (SELECT auth.uid())
        OR EXISTS (SELECT 1 FROM medical_services ms WHERE ms.patient_id = patients.id)
      )
    )
  );

DROP POLICY IF EXISTS patients_update ON patients;
CREATE POLICY patients_update ON patients
  FOR UPDATE TO authenticated
  USING (
    (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA')
    OR (
      (SELECT get_user_role())::text IN ('REGULACION', 'MEDICO', 'AUXILIAR_ENFERMERIA')
      AND (
        created_by = (SELECT auth.uid())
        OR EXISTS (SELECT 1 FROM medical_services ms WHERE ms.patient_id = patients.id)
      )
    )
  )
  WITH CHECK (
    (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA')
    OR (
      (SELECT get_user_role())::text IN ('REGULACION', 'MEDICO', 'AUXILIAR_ENFERMERIA')
      AND (
        created_by = (SELECT auth.uid())
        OR EXISTS (SELECT 1 FROM medical_services ms WHERE ms.patient_id = patients.id)
      )
    )
  );

-- ─── 2. medical_assessments ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS medical_assessments_select ON medical_assessments;
CREATE POLICY medical_assessments_select ON medical_assessments
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN', 'ANALISTA', 'VISTA')
    OR (
      (SELECT get_user_role()) IN ('REGULACION', 'COORDINACION', 'MEDICO', 'AUXILIAR_ENFERMERIA')
      AND (
        created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM medical_services ms
          WHERE ms.patient_id = medical_assessments.patient_id
        )
      )
    )
  );

-- Se reemplaza la FOR ALL de la 039 (`medical_assessments_write`), que además filtraba la lectura.
DROP POLICY IF EXISTS medical_assessments_write ON medical_assessments;

DROP POLICY IF EXISTS medical_assessments_insert ON medical_assessments;
CREATE POLICY medical_assessments_insert ON medical_assessments
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT get_user_role()) IN ('ADMIN', 'MEDICO', 'ANALISTA'));

DROP POLICY IF EXISTS medical_assessments_update ON medical_assessments;
CREATE POLICY medical_assessments_update ON medical_assessments
  FOR UPDATE TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN', 'ANALISTA')
    OR (
      (SELECT get_user_role()) = 'MEDICO'
      AND (
        created_by = (SELECT auth.uid())
        OR EXISTS (SELECT 1 FROM medical_services ms WHERE ms.patient_id = medical_assessments.patient_id)
      )
    )
  )
  WITH CHECK (
    (SELECT get_user_role()) IN ('ADMIN', 'ANALISTA')
    OR (
      (SELECT get_user_role()) = 'MEDICO'
      AND (
        created_by = (SELECT auth.uid())
        OR EXISTS (SELECT 1 FROM medical_services ms WHERE ms.patient_id = medical_assessments.patient_id)
      )
    )
  );

DROP POLICY IF EXISTS medical_assessments_delete ON medical_assessments;
CREATE POLICY medical_assessments_delete ON medical_assessments
  FOR DELETE TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN', 'ANALISTA')
    OR (
      (SELECT get_user_role()) = 'MEDICO'
      AND (
        created_by = (SELECT auth.uid())
        OR EXISTS (SELECT 1 FROM medical_services ms WHERE ms.patient_id = medical_assessments.patient_id)
      )
    )
  );
