-- ============================================================
-- Migración 047: ANALISTA con las mismas capacidades que ADMIN
-- en flota/vehículos, mantenimientos y usuarios (core Aeromanto).
--
-- Continuación de la migración 046 (que cubrió los módulos que
-- agregó la integración SISRES). Decisión de Daniel (2026-07-21,
-- confirmada explícitamente): el cargo ANALISTA es el que va a
-- operar León dentro de Aeromanto y debe tener paridad total con
-- ADMIN, no solo en los módulos nuevos.
--
-- Generado a partir de la definición REAL vigente en staging
-- (pg_policies), no de los archivos de migración originales —
-- varias políticas de 004_rls_roles.sql fueron redefinidas después
-- por 006_mantenimiento_flota_ovem.sql, así que la fuente de verdad
-- es lo que Postgres tiene aplicado hoy, no el archivo más viejo.
--
-- Deliberadamente EXCLUIDO de este alcance: Formación/Capacitaciones
-- (tablas training_*) — Daniel confirmó paridad solo para
-- "flota/vehículos, mantenimientos y usuarios"; capacitaciones queda
-- pendiente de una confirmación aparte.
-- ============================================================

ALTER POLICY "checklist_items_delete_admin" ON checklist_items
  USING (((( SELECT get_user_role() AS get_user_role))::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "checklist_items_insert_admin" ON checklist_items
  WITH CHECK (((( SELECT get_user_role() AS get_user_role))::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "checklist_items_update_admin" ON checklist_items
  USING (((( SELECT get_user_role() AS get_user_role))::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((( SELECT get_user_role() AS get_user_role))::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "daily_check_items_insert" ON daily_check_items
  WITH CHECK ((EXISTS ( SELECT 1
   FROM daily_checks dc
  WHERE ((dc.id = daily_check_items.daily_check_id) AND ((((( SELECT get_user_role() AS get_user_role))::text = 'OVEM'::text) AND (dc.user_id = ( SELECT auth.uid() AS uid))) OR ((( SELECT get_user_role() AS get_user_role))::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))))));

ALTER POLICY "daily_check_items_select" ON daily_check_items
  USING ((EXISTS ( SELECT 1
   FROM daily_checks dc
  WHERE ((dc.id = daily_check_items.daily_check_id) AND (((( SELECT get_user_role() AS get_user_role))::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying, 'COORDINACION'::character varying])::text[])) OR (((( SELECT get_user_role() AS get_user_role))::text = 'OVEM'::text) AND (dc.user_id = ( SELECT auth.uid() AS uid))))))));

ALTER POLICY "daily_check_items_update" ON daily_check_items
  USING ((EXISTS ( SELECT 1
   FROM daily_checks dc
  WHERE ((dc.id = daily_check_items.daily_check_id) AND ((((( SELECT get_user_role() AS get_user_role))::text = 'OVEM'::text) AND (dc.user_id = ( SELECT auth.uid() AS uid))) OR ((( SELECT get_user_role() AS get_user_role))::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM daily_checks dc
  WHERE ((dc.id = daily_check_items.daily_check_id) AND ((((( SELECT get_user_role() AS get_user_role))::text = 'OVEM'::text) AND (dc.user_id = ( SELECT auth.uid() AS uid))) OR ((( SELECT get_user_role() AS get_user_role))::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))))));

ALTER POLICY "select_daily_checks" ON daily_checks
  USING ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (user_id = auth.uid()))));

ALTER POLICY "delete_fuel_logs" ON fuel_logs
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_fuel_logs" ON fuel_logs
  WITH CHECK ((((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])) OR (((get_user_role())::text = 'OVEM'::text) AND (EXISTS ( SELECT 1
   FROM vehicle_assignments va
  WHERE ((va.vehicle_id = va.vehicle_id) AND (va.user_id = auth.uid()) AND (va.activo = true) AND (va.fecha_inicio <= CURRENT_DATE) AND ((va.fecha_fin IS NULL) OR (va.fecha_fin >= CURRENT_DATE))))))));

ALTER POLICY "select_fuel_logs" ON fuel_logs
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying])::text[])));

ALTER POLICY "update_fuel_logs" ON fuel_logs
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "delete_incidents" ON incidents
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_incidents" ON incidents
  WITH CHECK ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE (v.id = incidents.vehicle_id))))));

ALTER POLICY "select_incidents" ON incidents
  USING ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE (v.id = incidents.vehicle_id))))));

ALTER POLICY "update_incidents" ON incidents
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])))
  WITH CHECK (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "invoice_jobs_select" ON invoice_jobs
  USING ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN roles r ON ((r.id = up.role_id)))
  WHERE ((up.user_id = auth.uid()) AND (up.activo = true) AND ((r.codigo)::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[]))))));

ALTER POLICY "invoice_jobs_update" ON invoice_jobs
  USING ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN roles r ON ((r.id = up.role_id)))
  WHERE ((up.user_id = auth.uid()) AND (up.activo = true) AND ((r.codigo)::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[]))))));

ALTER POLICY "insert_maintenance_categories" ON maintenance_categories
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_maintenance_categories" ON maintenance_categories
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "update_maintenance_categories" ON maintenance_categories
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "maintenance_items_delete" ON maintenance_items
  USING (((EXISTS ( SELECT 1
   FROM maintenance_records mr
  WHERE (mr.id_manto = maintenance_items.maintenance_record_id))) AND ((( SELECT get_user_role() AS get_user_role))::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[]))));

ALTER POLICY "maintenance_items_insert" ON maintenance_items
  WITH CHECK (((EXISTS ( SELECT 1
   FROM maintenance_records mr
  WHERE (mr.id_manto = maintenance_items.maintenance_record_id))) AND ((( SELECT get_user_role() AS get_user_role))::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[]))));

ALTER POLICY "maintenance_items_update" ON maintenance_items
  USING (((EXISTS ( SELECT 1
   FROM maintenance_records mr
  WHERE (mr.id_manto = maintenance_items.maintenance_record_id))) AND ((( SELECT get_user_role() AS get_user_role))::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[]))))
  WITH CHECK (((EXISTS ( SELECT 1
   FROM maintenance_records mr
  WHERE (mr.id_manto = maintenance_items.maintenance_record_id))) AND ((( SELECT get_user_role() AS get_user_role))::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[]))));

ALTER POLICY "mpi_delete" ON maintenance_plan_items
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "mpi_insert" ON maintenance_plan_items
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "mpi_update" ON maintenance_plan_items
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "delete_maintenance_records" ON maintenance_records
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_maintenance_records" ON maintenance_records
  WITH CHECK (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "select_maintenance_records" ON maintenance_records
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "update_maintenance_records" ON maintenance_records
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[])))
  WITH CHECK (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "delete_maintenance_schedule" ON maintenance_schedule
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_maintenance_schedule" ON maintenance_schedule
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_maintenance_schedule" ON maintenance_schedule
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying])::text[])));

ALTER POLICY "update_maintenance_schedule" ON maintenance_schedule
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_mileage_logs" ON mileage_logs
  WITH CHECK ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE (v.id = mileage_logs.vehicle_id))))));

ALTER POLICY "select_mileage_logs" ON mileage_logs
  USING ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE (v.id = mileage_logs.vehicle_id))))));

ALTER POLICY "update_mileage_logs" ON mileage_logs
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "delete_operational_centers" ON operational_centers
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_operational_centers" ON operational_centers
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_operational_centers" ON operational_centers
  USING ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (id = get_user_center()))));

ALTER POLICY "update_operational_centers" ON operational_centers
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_roles" ON roles
  USING ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying])::text[])) OR (id = ( SELECT user_profiles.role_id
   FROM user_profiles
  WHERE ((user_profiles.user_id = auth.uid()) AND (user_profiles.activo = true))
 LIMIT 1))));

ALTER POLICY "insert_service_types" ON service_types
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_service_types" ON service_types
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "update_service_types" ON service_types
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "delete_suppliers" ON suppliers
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_suppliers" ON suppliers
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_suppliers" ON suppliers
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "update_suppliers" ON suppliers
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_user_profiles" ON user_profiles
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_user_profiles" ON user_profiles
  USING ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying])::text[])) OR (auth.uid() = user_id)));

ALTER POLICY "update_user_profiles" ON user_profiles
  USING ((((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])) OR (auth.uid() = user_id)))
  WITH CHECK ((((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])) OR (auth.uid() = user_id)));

ALTER POLICY "delete_vehicle_assignments" ON vehicle_assignments
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying])::text[])));

ALTER POLICY "insert_vehicle_assignments" ON vehicle_assignments
  WITH CHECK ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM vehicles v
  WHERE (v.id = vehicle_assignments.vehicle_id))))));

ALTER POLICY "select_vehicle_assignments" ON vehicle_assignments
  USING ((((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying])::text[])) OR (((get_user_role())::text = 'OVEM'::text) AND (user_id = auth.uid()))));

ALTER POLICY "update_vehicle_assignments" ON vehicle_assignments
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying])::text[])))
  WITH CHECK (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying])::text[])));

ALTER POLICY "vml_delete" ON vehicle_maintenance_log
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "vml_insert" ON vehicle_maintenance_log
  WITH CHECK (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'MANTENIMIENTO'::character varying])::text[])));

ALTER POLICY "vml_update" ON vehicle_maintenance_log
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "delete_vehicle_service_revenue" ON vehicle_service_revenue
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_vehicle_service_revenue" ON vehicle_service_revenue
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_vehicle_service_revenue" ON vehicle_service_revenue
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying])::text[])));

ALTER POLICY "update_vehicle_service_revenue" ON vehicle_service_revenue
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])))
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "vsh_insert" ON vehicle_status_history
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (user_profiles up
     JOIN roles r ON ((r.id = up.role_id)))
  WHERE ((up.user_id = auth.uid()) AND ((r.codigo)::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying])::text[])) AND (up.activo = true)))));

ALTER POLICY "delete_vehicles" ON vehicles
  USING (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "insert_vehicles" ON vehicles
  WITH CHECK (((get_user_role())::text = ANY (ARRAY['ADMIN'::text,'ANALISTA'::text])));

ALTER POLICY "select_vehicles" ON vehicles
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'GERENCIAL'::character varying, 'REGULACION'::character varying, 'MANTENIMIENTO'::character varying, 'OVEM'::character varying])::text[])));

ALTER POLICY "update_vehicles" ON vehicles
  USING (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying])::text[])))
  WITH CHECK (((get_user_role())::text = ANY ((ARRAY['ADMIN'::character varying, 'ANALISTA'::character varying, 'REGULACION'::character varying])::text[])));
