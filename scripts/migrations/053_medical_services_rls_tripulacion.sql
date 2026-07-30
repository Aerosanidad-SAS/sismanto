-- ============================================================
-- Migración 053: cada rol operativo ve solo lo suyo en medical_services
--
-- Hasta ahora OVEM no tenía NINGUNA política de SELECT sobre
-- medical_services (no podía ver ni un servicio, aunque se lo
-- asignaran), y MÉDICO/AUXILIAR_ENFERMERIA veían y editaban
-- CUALQUIER servicio, sin filtrar por asignación. Con las columnas
-- reales de tripulación de la migración 050 (ovem_user_id/
-- medico_user_id/auxiliar_user_id), esto ya se puede filtrar de
-- verdad.
--
-- ADMIN/REGULACION/ANALISTA/COORDINACION/GERENCIAL/VISTA siguen
-- viendo todo (dispatch, reportes) — no cambian.
-- ============================================================

DROP POLICY IF EXISTS medical_services_select ON medical_services;
CREATE POLICY medical_services_select ON medical_services
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN','REGULACION','COORDINACION','ANALISTA','VISTA','GERENCIAL')
    OR (get_user_role() = 'OVEM' AND ovem_user_id = auth.uid())
    OR (get_user_role() = 'MEDICO' AND medico_user_id = auth.uid())
    OR (get_user_role() = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = auth.uid())
  );

DROP POLICY IF EXISTS medical_services_update ON medical_services;
CREATE POLICY medical_services_update ON medical_services
  FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('ADMIN','REGULACION','ANALISTA')
    OR (get_user_role() = 'OVEM' AND ovem_user_id = auth.uid())
    OR (get_user_role() = 'MEDICO' AND medico_user_id = auth.uid())
    OR (get_user_role() = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = auth.uid())
  )
  WITH CHECK (
    get_user_role() IN ('ADMIN','REGULACION','ANALISTA')
    OR (get_user_role() = 'OVEM' AND ovem_user_id = auth.uid())
    OR (get_user_role() = 'MEDICO' AND medico_user_id = auth.uid())
    OR (get_user_role() = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = auth.uid())
  );

-- INSERT/DELETE no cambian en esta migración (siguen siendo
-- ADMIN/REGULACION/MEDICO/AUXILIAR_ENFERMERIA/ANALISTA para insert,
-- ADMIN/ANALISTA para delete) — la creación de servicios sigue siendo
-- responsabilidad de Regulación en la práctica, pero no se le quita
-- el permiso técnico a Médico/Auxiliar en esta pasada.
