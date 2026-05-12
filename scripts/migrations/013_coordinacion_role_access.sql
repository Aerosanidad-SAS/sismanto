-- ============================================================
-- Migración 013: Rol COORDINACION + lectura operativa
-- ============================================================

INSERT INTO roles (codigo, nombre, descripcion)
VALUES (
  'COORDINACION',
  'Coordinación CRA',
  'Visión operativa de flota, OVEM, novedades, plan preventivo y capacitaciones'
)
ON CONFLICT (codigo) DO NOTHING;

-- Asegura RLS habilitado en tablas de lectura para coordinación
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance_log ENABLE ROW LEVEL SECURITY;

-- Lectura COORDINACION (políticas incrementales; no alteran permisos previos)
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
