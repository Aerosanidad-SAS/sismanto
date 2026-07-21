-- ============================================================
-- Migración 046: ANALISTA con las mismas capacidades que ADMIN
-- en los módulos de la integración SISRES.
--
-- Decisión de Daniel (2026-07-21): el cargo ANALISTA es el que va a
-- operar León dentro de Aeromanto, y debe tener paridad total con ADMIN
-- en clientes, pacientes, servicios médicos, valoraciones, inventario
-- biomédico y comunicaciones — los módulos que esta integración agrega.
-- No toca RLS de módulos preexistentes de Aeromanto (flota/vehículos,
-- mantenimientos, usuarios, capacitaciones) — eso queda fuera de este
-- alcance hasta que se confirme explícitamente si también aplica ahí.
-- ============================================================

-- clients / cie10 (037)
DROP POLICY IF EXISTS clients_write ON clients;
CREATE POLICY clients_write ON clients
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));

DROP POLICY IF EXISTS cie10_write ON cie10;
CREATE POLICY cie10_write ON cie10
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));

-- patients (038)
DROP POLICY IF EXISTS patients_insert ON patients;
CREATE POLICY patients_insert ON patients
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA'));

DROP POLICY IF EXISTS patients_update ON patients;
CREATE POLICY patients_update ON patients
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA'));

DROP POLICY IF EXISTS patients_delete ON patients;
CREATE POLICY patients_delete ON patients
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'));

-- medical_services / medical_assessments (039)
DROP POLICY IF EXISTS medical_services_insert ON medical_services;
CREATE POLICY medical_services_insert ON medical_services
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA'));

DROP POLICY IF EXISTS medical_services_update ON medical_services;
CREATE POLICY medical_services_update ON medical_services
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA'));

DROP POLICY IF EXISTS medical_services_delete ON medical_services;
CREATE POLICY medical_services_delete ON medical_services
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'));

DROP POLICY IF EXISTS medical_assessments_write ON medical_assessments;
CREATE POLICY medical_assessments_write ON medical_assessments
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','MEDICO','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','MEDICO','ANALISTA'));

-- biomedical_equipment / biomedical_maintenance (040)
DROP POLICY IF EXISTS biomedical_equipment_write ON biomedical_equipment;
CREATE POLICY biomedical_equipment_write ON biomedical_equipment
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));

DROP POLICY IF EXISTS biomedical_maintenance_write ON biomedical_maintenance;
CREATE POLICY biomedical_maintenance_write ON biomedical_maintenance
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));

-- wa_campaigns / wa_campaign_recipients / notification_log (041)
DROP POLICY IF EXISTS wa_campaigns_all ON wa_campaigns;
CREATE POLICY wa_campaigns_all ON wa_campaigns
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));

DROP POLICY IF EXISTS wa_recipients_all ON wa_campaign_recipients;
CREATE POLICY wa_recipients_all ON wa_campaign_recipients
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));

DROP POLICY IF EXISTS notification_log_select ON notification_log;
CREATE POLICY notification_log_select ON notification_log
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));

DROP POLICY IF EXISTS notification_log_insert ON notification_log;
CREATE POLICY notification_log_insert ON notification_log
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','REGULACION','MEDICO','AUXILIAR_ENFERMERIA','ANALISTA'));
