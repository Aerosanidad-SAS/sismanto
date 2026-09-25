-- ============================================================
-- Migración 084: lectura operativa de COORDINACION sobre la flota
--
-- Problema: COORDINACION veía 0 vehículos. Sus políticas SELECT (`coord_select_*`) solo existían en
-- `013_coordinacion_role_access.sql`, un archivo que está EXCLUIDO de scripts/apply-database.ts a propósito
-- (duplicado parcial de 013_coordinacion_capacitaciones.sql, que sí se aplica: crea el rol pero no estas
-- políticas). Resultado: en una base creada desde cero por db:apply nunca se crearon, y el rol solo lee lo
-- que otras políticas le dan por casualidad (pacientes, valoraciones, etc.), no la flota.
--
-- Solución: esta migración recrea SOLO esas políticas de lectura, con las mismas condiciones de la 013
-- (`get_user_role() = 'COORDINACION'`). No inserta el rol (ya lo crea la 013_coordinacion_capacitaciones), no
-- toca las políticas de otros roles y es de solo lectura (FOR SELECT): COORDINACION no puede escribir nada.
--
-- Para revisar (RLS = dominio de Daniel): `coord_select_user_profiles` deja a COORDINACION leer TODOS los
-- perfiles (nombre, correo, cédula, rol). La 013 original ya lo hacía; se mantiene porque la pantalla de flota
-- muestra al conductor asignado. Si se prefiere acotarlo, es esta política y solo esta.
--
-- Idempotente (DROP POLICY IF EXISTS + CREATE POLICY).
-- ============================================================

DROP POLICY IF EXISTS coord_select_vehicles ON vehicles;
CREATE POLICY coord_select_vehicles ON vehicles
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_incidents ON incidents;
CREATE POLICY coord_select_incidents ON incidents
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_maintenance_records ON maintenance_records;
CREATE POLICY coord_select_maintenance_records ON maintenance_records
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_mileage_logs ON mileage_logs;
CREATE POLICY coord_select_mileage_logs ON mileage_logs
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_fuel_logs ON fuel_logs;
CREATE POLICY coord_select_fuel_logs ON fuel_logs
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_vehicle_assignments ON vehicle_assignments;
CREATE POLICY coord_select_vehicle_assignments ON vehicle_assignments
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_daily_checks ON daily_checks;
CREATE POLICY coord_select_daily_checks ON daily_checks
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_user_profiles ON user_profiles;
CREATE POLICY coord_select_user_profiles ON user_profiles
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_mpi ON maintenance_plan_items;
CREATE POLICY coord_select_mpi ON maintenance_plan_items
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');

DROP POLICY IF EXISTS coord_select_vml ON vehicle_maintenance_log;
CREATE POLICY coord_select_vml ON vehicle_maintenance_log
  FOR SELECT TO authenticated
  USING (get_user_role() = 'COORDINACION');
