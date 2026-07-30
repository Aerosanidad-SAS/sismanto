-- ============================================================
-- Migración 054: revertir el permiso de BORRAR (DELETE) que las
-- migraciones 046/047 le dieron por error al rol ANALISTA.
--
-- Hallazgo de León (auditoría línea por línea, VALIDACION_ACOMODACION.md,
-- 2026-07-29, rama audit/integration-analysis del repo aerosanidad/sisres):
-- en 6 años de operación real de SISRES, el cargo Analista (cargo=3) NUNCA
-- tuvo permiso de borrado — todas las filas `act_eliminar_*` de
-- sql/permisos.sql están en 0 para ese cargo. Solo Admin y Coordinador
-- pueden borrar. Las migraciones 046/047 interpretaron la decisión de
-- Daniel del 2026-07-21 ("paridad total con ADMIN") de forma más amplia
-- de lo que el propio hallazgo de Ronda 2 decía ("a ANALISTA solo le
-- falta el borrado frente a Admin" — es decir, nunca debía dárselo).
--
-- Esta migración NO toca INSERT/UPDATE/SELECT de ANALISTA (esa parte de
-- la paridad sigue siendo la decisión válida de Daniel) — solo quita
-- ANALISTA de las políticas de DELETE, restaurando el mismo alcance que
-- tenía antes de 046/047.
-- ============================================================

-- ─── 046: políticas FOR ALL que mezclaban DELETE con el resto ──────────────
-- Se dividen en "escritura" (SELECT/INSERT/UPDATE, con ANALISTA) y
-- "borrado" (sin ANALISTA), igual patrón que ya usan patients_delete /
-- medical_services_delete en la misma migración.

DROP POLICY IF EXISTS clients_write ON clients;
CREATE POLICY clients_write ON clients
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'));
CREATE POLICY clients_insert ON clients
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
CREATE POLICY clients_update ON clients
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
CREATE POLICY clients_delete ON clients
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS cie10_write ON cie10;
CREATE POLICY cie10_write ON cie10
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'));
CREATE POLICY cie10_insert ON cie10
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
CREATE POLICY cie10_update ON cie10
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
CREATE POLICY cie10_delete ON cie10
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS biomedical_equipment_write ON biomedical_equipment;
CREATE POLICY biomedical_equipment_write ON biomedical_equipment
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));
CREATE POLICY biomedical_equipment_insert ON biomedical_equipment
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));
CREATE POLICY biomedical_equipment_update ON biomedical_equipment
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));
CREATE POLICY biomedical_equipment_delete ON biomedical_equipment
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO'));

DROP POLICY IF EXISTS biomedical_maintenance_write ON biomedical_maintenance;
CREATE POLICY biomedical_maintenance_write ON biomedical_maintenance
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));
CREATE POLICY biomedical_maintenance_insert ON biomedical_maintenance
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));
CREATE POLICY biomedical_maintenance_update ON biomedical_maintenance
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));
CREATE POLICY biomedical_maintenance_delete ON biomedical_maintenance
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO'));

DROP POLICY IF EXISTS wa_campaigns_all ON wa_campaigns;
CREATE POLICY wa_campaigns_select ON wa_campaigns
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));
CREATE POLICY wa_campaigns_insert ON wa_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));
CREATE POLICY wa_campaigns_update ON wa_campaigns
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));
CREATE POLICY wa_campaigns_delete ON wa_campaigns
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION'));

DROP POLICY IF EXISTS wa_recipients_all ON wa_campaign_recipients;
CREATE POLICY wa_recipients_select ON wa_campaign_recipients
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));
CREATE POLICY wa_recipients_insert ON wa_campaign_recipients
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));
CREATE POLICY wa_recipients_update ON wa_campaign_recipients
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','ANALISTA'));
CREATE POLICY wa_recipients_delete ON wa_campaign_recipients
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION'));

-- ─── 046: políticas de DELETE ya separadas — solo quitar ANALISTA ─────────

DROP POLICY IF EXISTS patients_delete ON patients;
CREATE POLICY patients_delete ON patients
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS medical_services_delete ON medical_services;
CREATE POLICY medical_services_delete ON medical_services
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─── 047: políticas de DELETE core de Aeromanto — quitar ANALISTA ─────────
-- (ALTER POLICY conserva la identidad de la política; solo se reemplaza
-- la expresión USING, quitando 'ANALISTA' del arreglo de roles.)

ALTER POLICY "checklist_items_delete_admin" ON checklist_items
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_fuel_logs" ON fuel_logs
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_incidents" ON incidents
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "maintenance_items_delete" ON maintenance_items
  USING ((EXISTS ( SELECT 1
   FROM maintenance_records mr
  WHERE (mr.id_manto = maintenance_items.maintenance_record_id))) AND (get_user_role() IN ('ADMIN','MANTENIMIENTO')));

ALTER POLICY "mpi_delete" ON maintenance_plan_items
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_maintenance_records" ON maintenance_records
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_maintenance_schedule" ON maintenance_schedule
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_operational_centers" ON operational_centers
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_suppliers" ON suppliers
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_vehicle_assignments" ON vehicle_assignments
  USING (get_user_role() IN ('ADMIN','REGULACION'));

ALTER POLICY "vml_delete" ON vehicle_maintenance_log
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_vehicle_service_revenue" ON vehicle_service_revenue
  USING (get_user_role() = 'ADMIN');

ALTER POLICY "delete_vehicles" ON vehicles
  USING (get_user_role() = 'ADMIN');
