-- ============================================================
-- Migración 004: RLS granular por rol + ajustes de schema
-- Autor: Vault (Aeromanto squad)
-- Fecha: 2026-05-01
--
-- QUÉ HACE:
--   1. Agrega operational_center_id a user_profiles
--   2. Agrega is_assignment a daily_checks
--   3. Crea función helper get_user_center()
--   4. Elimina TODAS las políticas genéricas anteriores
--   5. Crea políticas granulares por rol según ROLES_AND_FLOWS.md §3
--
-- PREREQUISITOS:
--   - schema.sql aplicado
--   - 002_iteracion2.sql aplicado
--   - 003_rbac.sql aplicado (requiere get_user_role() y tablas de roles)
--
-- NOTAS:
--   - No modifica el enum vehicle_status (OPERATIVO/FUERA_DE_SERVICIO).
--     Si se necesita DISPONIBLE/MANTENIMIENTO, hacerlo en migración 005.
--   - Las políticas no restringen columnas; las restricciones de columna
--     (ej: Regulación solo puede actualizar estado_actual) se validan
--     en la capa de Server Actions.
-- ============================================================

-- ============================================================
-- SECCIÓN 1: Cambios de schema
-- ============================================================

-- 1a. operational_center_id en user_profiles
--     (FK a operational_centers; nullable para Admin/Gerencial/Regulación globales)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'operational_center_id'
  ) THEN
    ALTER TABLE user_profiles
      ADD COLUMN operational_center_id INTEGER REFERENCES operational_centers(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_user_profiles_center
      ON user_profiles(operational_center_id)
      WHERE operational_center_id IS NOT NULL;
  END IF;
END $$;

-- 1b. is_assignment en daily_checks
--     TRUE  = el OVEM se asigna a este vehículo para el día
--     FALSE = solo inspección de estado (no genera vehicle_assignment)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_checks' AND column_name = 'is_assignment'
  ) THEN
    ALTER TABLE daily_checks
      ADD COLUMN is_assignment BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- ============================================================
-- SECCIÓN 2: Función helper get_user_center()
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_center(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
  SELECT operational_center_id
  FROM user_profiles
  WHERE user_id = p_user_id
    AND activo = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- SECCIÓN 3: Eliminar políticas genéricas existentes
-- ============================================================

-- ---- Políticas de schema.sql ----
DROP POLICY IF EXISTS "Permitir todo en vehicles"                ON vehicles;
DROP POLICY IF EXISTS "Permitir todo en maintenance_records"    ON maintenance_records;
DROP POLICY IF EXISTS "Permitir todo en incidents"              ON incidents;
DROP POLICY IF EXISTS "Permitir todo en mileage_logs"           ON mileage_logs;
DROP POLICY IF EXISTS "Permitir lectura en maintenance_categories" ON maintenance_categories;
DROP POLICY IF EXISTS "Permitir todo en maintenance_schedule"   ON maintenance_schedule;

DROP POLICY IF EXISTS "Anon: leer vehicles"                     ON vehicles;
DROP POLICY IF EXISTS "Anon: escribir vehicles"                 ON vehicles;
DROP POLICY IF EXISTS "Anon: leer maintenance_records"          ON maintenance_records;
DROP POLICY IF EXISTS "Anon: escribir maintenance_records"      ON maintenance_records;
DROP POLICY IF EXISTS "Anon: leer incidents"                    ON incidents;
DROP POLICY IF EXISTS "Anon: escribir incidents"                ON incidents;
DROP POLICY IF EXISTS "Anon: leer mileage_logs"                 ON mileage_logs;
DROP POLICY IF EXISTS "Anon: escribir mileage_logs"             ON mileage_logs;
DROP POLICY IF EXISTS "Anon: leer maintenance_categories"       ON maintenance_categories;
DROP POLICY IF EXISTS "Anon: leer maintenance_schedule"         ON maintenance_schedule;
DROP POLICY IF EXISTS "Anon: escribir maintenance_schedule"     ON maintenance_schedule;

-- ---- Políticas de 002_iteracion2.sql ----
DROP POLICY IF EXISTS "Anon: leer operational_centers"          ON operational_centers;
DROP POLICY IF EXISTS "Anon: escribir operational_centers"      ON operational_centers;
DROP POLICY IF EXISTS "Auth: todo operational_centers"          ON operational_centers;
DROP POLICY IF EXISTS "Anon: leer suppliers"                    ON suppliers;
DROP POLICY IF EXISTS "Anon: escribir suppliers"                ON suppliers;
DROP POLICY IF EXISTS "Auth: todo suppliers"                    ON suppliers;
DROP POLICY IF EXISTS "Anon: leer fuel_logs"                    ON fuel_logs;
DROP POLICY IF EXISTS "Anon: escribir fuel_logs"                ON fuel_logs;
DROP POLICY IF EXISTS "Auth: todo fuel_logs"                    ON fuel_logs;

-- ---- Políticas de 003_rbac.sql ----
DROP POLICY IF EXISTS "Auth: leer roles"                        ON roles;
DROP POLICY IF EXISTS "Auth: leer propio perfil"                ON user_profiles;
DROP POLICY IF EXISTS "Auth: actualizar propio perfil"          ON user_profiles;
DROP POLICY IF EXISTS "Auth: admin user_profiles"               ON user_profiles;
DROP POLICY IF EXISTS "Auth: leer vehicle_assignments"          ON vehicle_assignments;
DROP POLICY IF EXISTS "Auth: escribir vehicle_assignments"      ON vehicle_assignments;
DROP POLICY IF EXISTS "Auth: leer daily_checks"                 ON daily_checks;
DROP POLICY IF EXISTS "Auth: insertar daily_checks"             ON daily_checks;
DROP POLICY IF EXISTS "Auth: actualizar daily_checks"           ON daily_checks;

-- ---- Políticas de 004 (idempotencia: limpiar antes de recrear) ----
DROP POLICY IF EXISTS "select_vehicles"                         ON vehicles;
DROP POLICY IF EXISTS "insert_vehicles"                         ON vehicles;
DROP POLICY IF EXISTS "update_vehicles"                         ON vehicles;
DROP POLICY IF EXISTS "delete_vehicles"                         ON vehicles;

DROP POLICY IF EXISTS "select_maintenance_records"              ON maintenance_records;
DROP POLICY IF EXISTS "insert_maintenance_records"              ON maintenance_records;
DROP POLICY IF EXISTS "update_maintenance_records"              ON maintenance_records;
DROP POLICY IF EXISTS "delete_maintenance_records"              ON maintenance_records;

DROP POLICY IF EXISTS "select_incidents"                        ON incidents;
DROP POLICY IF EXISTS "insert_incidents"                        ON incidents;
DROP POLICY IF EXISTS "update_incidents"                        ON incidents;
DROP POLICY IF EXISTS "delete_incidents"                        ON incidents;

DROP POLICY IF EXISTS "select_fuel_logs"                        ON fuel_logs;
DROP POLICY IF EXISTS "insert_fuel_logs"                        ON fuel_logs;
DROP POLICY IF EXISTS "update_fuel_logs"                        ON fuel_logs;
DROP POLICY IF EXISTS "delete_fuel_logs"                        ON fuel_logs;

DROP POLICY IF EXISTS "select_mileage_logs"                     ON mileage_logs;
DROP POLICY IF EXISTS "insert_mileage_logs"                     ON mileage_logs;
DROP POLICY IF EXISTS "update_mileage_logs"                     ON mileage_logs;

DROP POLICY IF EXISTS "select_operational_centers"              ON operational_centers;
DROP POLICY IF EXISTS "insert_operational_centers"              ON operational_centers;
DROP POLICY IF EXISTS "update_operational_centers"              ON operational_centers;
DROP POLICY IF EXISTS "delete_operational_centers"              ON operational_centers;

DROP POLICY IF EXISTS "select_suppliers"                        ON suppliers;
DROP POLICY IF EXISTS "insert_suppliers"                        ON suppliers;
DROP POLICY IF EXISTS "update_suppliers"                        ON suppliers;
DROP POLICY IF EXISTS "delete_suppliers"                        ON suppliers;

DROP POLICY IF EXISTS "select_maintenance_categories"           ON maintenance_categories;
DROP POLICY IF EXISTS "insert_maintenance_categories"           ON maintenance_categories;
DROP POLICY IF EXISTS "update_maintenance_categories"           ON maintenance_categories;

DROP POLICY IF EXISTS "select_maintenance_schedule"             ON maintenance_schedule;
DROP POLICY IF EXISTS "insert_maintenance_schedule"             ON maintenance_schedule;
DROP POLICY IF EXISTS "update_maintenance_schedule"             ON maintenance_schedule;
DROP POLICY IF EXISTS "delete_maintenance_schedule"             ON maintenance_schedule;

DROP POLICY IF EXISTS "select_user_profiles"                    ON user_profiles;
DROP POLICY IF EXISTS "insert_user_profiles"                    ON user_profiles;
DROP POLICY IF EXISTS "update_user_profiles"                    ON user_profiles;

DROP POLICY IF EXISTS "select_roles"                            ON roles;

DROP POLICY IF EXISTS "select_vehicle_assignments"              ON vehicle_assignments;
DROP POLICY IF EXISTS "insert_vehicle_assignments"              ON vehicle_assignments;
DROP POLICY IF EXISTS "update_vehicle_assignments"              ON vehicle_assignments;
DROP POLICY IF EXISTS "delete_vehicle_assignments"              ON vehicle_assignments;

DROP POLICY IF EXISTS "select_daily_checks"                     ON daily_checks;
DROP POLICY IF EXISTS "insert_daily_checks"                     ON daily_checks;
DROP POLICY IF EXISTS "update_daily_checks"                     ON daily_checks;

-- ============================================================
-- SECCIÓN 4: Políticas granulares por tabla
-- Roles: ADMIN | GERENCIAL | REGULACION | OVEM
-- Fuente: ROLES_AND_FLOWS.md §3
-- ============================================================

-- ─────────────────────────────────────────────
-- vehicles
--   Admin:      ALL
--   Gerencial:  SELECT all
--   Regulación: SELECT all, UPDATE (campo estado validado en app)
--   OVEM:       SELECT su centro operativo
-- ─────────────────────────────────────────────
CREATE POLICY "select_vehicles" ON vehicles
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION')
    OR (
      get_user_role() = 'OVEM'
      AND centro_operativo_id IS NOT NULL
      AND centro_operativo_id = get_user_center()
    )
  );

CREATE POLICY "insert_vehicles" ON vehicles
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "update_vehicles" ON vehicles
  FOR UPDATE TO authenticated
  USING  (get_user_role() IN ('ADMIN', 'REGULACION'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'REGULACION'));

CREATE POLICY "delete_vehicles" ON vehicles
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- maintenance_records
--   Admin:      ALL
--   Gerencial:  SELECT all
--   Regulación: SELECT all
--   OVEM:       sin acceso
-- ─────────────────────────────────────────────
CREATE POLICY "select_maintenance_records" ON maintenance_records
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION'));

CREATE POLICY "insert_maintenance_records" ON maintenance_records
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "update_maintenance_records" ON maintenance_records
  FOR UPDATE TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "delete_maintenance_records" ON maintenance_records
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- incidents (novedades)
--   Admin:      ALL
--   Gerencial:  SELECT all
--   Regulación: SELECT all, INSERT, UPDATE
--   OVEM:       SELECT e INSERT en vehículos de su centro
-- ─────────────────────────────────────────────
CREATE POLICY "select_incidents" ON incidents
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION')
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = incidents.vehicle_id
          AND v.centro_operativo_id = get_user_center()
      )
    )
  );

CREATE POLICY "insert_incidents" ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'REGULACION')
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_id
          AND v.centro_operativo_id = get_user_center()
      )
    )
  );

CREATE POLICY "update_incidents" ON incidents
  FOR UPDATE TO authenticated
  USING  (get_user_role() IN ('ADMIN', 'REGULACION'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'REGULACION'));

CREATE POLICY "delete_incidents" ON incidents
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- fuel_logs
--   Admin:      ALL
--   Gerencial:  SELECT all
--   Regulación: sin acceso
--   OVEM:       INSERT solo en vehículos asignados hoy
--               (SELECT no disponible según matriz; el historial lo ve en la app del proveedor)
-- ─────────────────────────────────────────────
CREATE POLICY "select_fuel_logs" ON fuel_logs
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL'));

CREATE POLICY "insert_fuel_logs" ON fuel_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (
        SELECT 1 FROM vehicle_assignments va
        WHERE va.vehicle_id = vehicle_id
          AND va.user_id    = auth.uid()
          AND va.activo     = true
          AND va.fecha_inicio <= CURRENT_DATE
          AND (va.fecha_fin IS NULL OR va.fecha_fin >= CURRENT_DATE)
      )
    )
  );

CREATE POLICY "update_fuel_logs" ON fuel_logs
  FOR UPDATE TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "delete_fuel_logs" ON fuel_logs
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- mileage_logs
--   Admin:      SELECT, INSERT, UPDATE (corrección de km); sin DELETE
--   Gerencial:  SELECT all
--   Regulación: SELECT all
--   OVEM:       SELECT e INSERT en vehículos asignados (activo)
--               UPDATE: Admin solo (corrección de km según regla de negocio)
-- ─────────────────────────────────────────────
CREATE POLICY "select_mileage_logs" ON mileage_logs
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION')
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (
        SELECT 1 FROM vehicle_assignments va
        WHERE va.vehicle_id = mileage_logs.vehicle_id
          AND va.user_id    = auth.uid()
          AND va.activo     = true
      )
    )
  );

CREATE POLICY "insert_mileage_logs" ON mileage_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (
        SELECT 1 FROM vehicle_assignments va
        WHERE va.vehicle_id = vehicle_id
          AND va.user_id    = auth.uid()
          AND va.activo     = true
          AND va.fecha_inicio <= CURRENT_DATE
          AND (va.fecha_fin IS NULL OR va.fecha_fin >= CURRENT_DATE)
      )
    )
  );

-- Solo Admin puede corregir km (bajar lectura)
CREATE POLICY "update_mileage_logs" ON mileage_logs
  FOR UPDATE TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- operational_centers
--   Admin:      ALL
--   Gerencial:  SELECT all
--   Regulación: SELECT all
--   OVEM:       SELECT solo su propio centro
-- ─────────────────────────────────────────────
CREATE POLICY "select_operational_centers" ON operational_centers
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION')
    OR (
      get_user_role() = 'OVEM'
      AND id = get_user_center()
    )
  );

CREATE POLICY "insert_operational_centers" ON operational_centers
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "update_operational_centers" ON operational_centers
  FOR UPDATE TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "delete_operational_centers" ON operational_centers
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- suppliers
--   Admin:      ALL
--   Gerencial:  SELECT all
--   Regulación: sin acceso
--   OVEM:       sin acceso
-- ─────────────────────────────────────────────
CREATE POLICY "select_suppliers" ON suppliers
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL'));

CREATE POLICY "insert_suppliers" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "update_suppliers" ON suppliers
  FOR UPDATE TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "delete_suppliers" ON suppliers
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- maintenance_categories
--   Admin:      SELECT, INSERT, UPDATE (sin DELETE)
--   Gerencial:  SELECT all
--   Regulación: SELECT all
--   OVEM:       sin acceso
-- ─────────────────────────────────────────────
CREATE POLICY "select_maintenance_categories" ON maintenance_categories
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION'));

CREATE POLICY "insert_maintenance_categories" ON maintenance_categories
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "update_maintenance_categories" ON maintenance_categories
  FOR UPDATE TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- maintenance_schedule (plantillas F-17)
--   Admin:      ALL
--   Otros:      SELECT (datos de referencia)
--   OVEM:       sin acceso (el schedule lo gestiona Admin/Gerencial)
-- ─────────────────────────────────────────────
CREATE POLICY "select_maintenance_schedule" ON maintenance_schedule
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION'));

CREATE POLICY "insert_maintenance_schedule" ON maintenance_schedule
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "update_maintenance_schedule" ON maintenance_schedule
  FOR UPDATE TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "delete_maintenance_schedule" ON maintenance_schedule
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────
-- user_profiles
--   Admin:      SELECT all, INSERT, UPDATE (sin DELETE)
--   Gerencial:  SELECT propio
--   Regulación: SELECT all (necesario para ver OVEMs al asignar)
--   OVEM:       SELECT propio, UPDATE propio
-- ─────────────────────────────────────────────
CREATE POLICY "select_user_profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'REGULACION')
    OR auth.uid() = user_id
  );

CREATE POLICY "insert_user_profiles" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "update_user_profiles" ON user_profiles
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'ADMIN'
    OR (auth.uid() = user_id)
  )
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (auth.uid() = user_id)
  );

-- ─────────────────────────────────────────────
-- roles (catálogo de roles — solo lectura para todos)
--   Admin/Gerencial/Regulación: SELECT all
--   OVEM: SELECT solo su propio rol
-- ─────────────────────────────────────────────
CREATE POLICY "select_roles" ON roles
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION')
    OR id = (
      SELECT role_id FROM user_profiles
      WHERE user_id = auth.uid()
        AND activo = true
      LIMIT 1
    )
  );

-- ─────────────────────────────────────────────
-- vehicle_assignments
--   Admin:      ALL
--   Gerencial:  SELECT all
--   Regulación: SELECT all, INSERT, UPDATE, DELETE
--   OVEM:       SELECT propias, INSERT (auto-asignación en su centro)
-- ─────────────────────────────────────────────
CREATE POLICY "select_vehicle_assignments" ON vehicle_assignments
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION')
    OR (get_user_role() = 'OVEM' AND user_id = auth.uid())
  );

CREATE POLICY "insert_vehicle_assignments" ON vehicle_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'REGULACION')
    OR (
      -- OVEM solo puede asignarse a sí mismo, en vehículos de su centro
      get_user_role() = 'OVEM'
      AND user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_id
          AND v.centro_operativo_id = get_user_center()
      )
    )
  );

CREATE POLICY "update_vehicle_assignments" ON vehicle_assignments
  FOR UPDATE TO authenticated
  USING  (get_user_role() IN ('ADMIN', 'REGULACION'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'REGULACION'));

CREATE POLICY "delete_vehicle_assignments" ON vehicle_assignments
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'REGULACION'));

-- ─────────────────────────────────────────────
-- daily_checks
--   Admin:      SELECT all (solo lectura, el checklist lo hace el OVEM)
--   Gerencial:  SELECT all
--   Regulación: SELECT all
--   OVEM:       SELECT propios, INSERT (cualquier vehículo de su centro),
--               UPDATE propios del día
--
-- is_assignment = true  → la app debe crear vehicle_assignment después del INSERT
-- is_assignment = false → solo verificación de estado, sin generar asignación
-- ─────────────────────────────────────────────
CREATE POLICY "select_daily_checks" ON daily_checks
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION')
    OR (get_user_role() = 'OVEM' AND user_id = auth.uid())
  );

CREATE POLICY "insert_daily_checks" ON daily_checks
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'OVEM'
    AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_id
        AND v.centro_operativo_id = get_user_center()
    )
  );

CREATE POLICY "update_daily_checks" ON daily_checks
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'OVEM'
    AND user_id = auth.uid()
    AND fecha = CURRENT_DATE
  )
  WITH CHECK (
    get_user_role() = 'OVEM'
    AND user_id = auth.uid()
    AND fecha = CURRENT_DATE
  );

-- ============================================================
-- VERIFICACIÓN POST-MIGRACIÓN (ejecutar manualmente para confirmar)
-- ============================================================
-- SELECT schemaname, tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;

-- ============================================================
-- ROLLBACK
-- Para revertir esta migración ejecutar el bloque siguiente:
-- ============================================================
/*
-- 1. Eliminar políticas creadas en esta migración
DROP POLICY IF EXISTS "select_vehicles"                  ON vehicles;
DROP POLICY IF EXISTS "insert_vehicles"                  ON vehicles;
DROP POLICY IF EXISTS "update_vehicles"                  ON vehicles;
DROP POLICY IF EXISTS "delete_vehicles"                  ON vehicles;

DROP POLICY IF EXISTS "select_maintenance_records"       ON maintenance_records;
DROP POLICY IF EXISTS "insert_maintenance_records"       ON maintenance_records;
DROP POLICY IF EXISTS "update_maintenance_records"       ON maintenance_records;
DROP POLICY IF EXISTS "delete_maintenance_records"       ON maintenance_records;

DROP POLICY IF EXISTS "select_incidents"                 ON incidents;
DROP POLICY IF EXISTS "insert_incidents"                 ON incidents;
DROP POLICY IF EXISTS "update_incidents"                 ON incidents;
DROP POLICY IF EXISTS "delete_incidents"                 ON incidents;

DROP POLICY IF EXISTS "select_fuel_logs"                 ON fuel_logs;
DROP POLICY IF EXISTS "insert_fuel_logs"                 ON fuel_logs;
DROP POLICY IF EXISTS "update_fuel_logs"                 ON fuel_logs;
DROP POLICY IF EXISTS "delete_fuel_logs"                 ON fuel_logs;

DROP POLICY IF EXISTS "select_mileage_logs"              ON mileage_logs;
DROP POLICY IF EXISTS "insert_mileage_logs"              ON mileage_logs;
DROP POLICY IF EXISTS "update_mileage_logs"              ON mileage_logs;

DROP POLICY IF EXISTS "select_operational_centers"       ON operational_centers;
DROP POLICY IF EXISTS "insert_operational_centers"       ON operational_centers;
DROP POLICY IF EXISTS "update_operational_centers"       ON operational_centers;
DROP POLICY IF EXISTS "delete_operational_centers"       ON operational_centers;

DROP POLICY IF EXISTS "select_suppliers"                 ON suppliers;
DROP POLICY IF EXISTS "insert_suppliers"                 ON suppliers;
DROP POLICY IF EXISTS "update_suppliers"                 ON suppliers;
DROP POLICY IF EXISTS "delete_suppliers"                 ON suppliers;

DROP POLICY IF EXISTS "select_maintenance_categories"    ON maintenance_categories;
DROP POLICY IF EXISTS "insert_maintenance_categories"    ON maintenance_categories;
DROP POLICY IF EXISTS "update_maintenance_categories"    ON maintenance_categories;

DROP POLICY IF EXISTS "select_maintenance_schedule"      ON maintenance_schedule;
DROP POLICY IF EXISTS "insert_maintenance_schedule"      ON maintenance_schedule;
DROP POLICY IF EXISTS "update_maintenance_schedule"      ON maintenance_schedule;
DROP POLICY IF EXISTS "delete_maintenance_schedule"      ON maintenance_schedule;

DROP POLICY IF EXISTS "select_user_profiles"             ON user_profiles;
DROP POLICY IF EXISTS "insert_user_profiles"             ON user_profiles;
DROP POLICY IF EXISTS "update_user_profiles"             ON user_profiles;

DROP POLICY IF EXISTS "select_roles"                     ON roles;

DROP POLICY IF EXISTS "select_vehicle_assignments"       ON vehicle_assignments;
DROP POLICY IF EXISTS "insert_vehicle_assignments"       ON vehicle_assignments;
DROP POLICY IF EXISTS "update_vehicle_assignments"       ON vehicle_assignments;
DROP POLICY IF EXISTS "delete_vehicle_assignments"       ON vehicle_assignments;

DROP POLICY IF EXISTS "select_daily_checks"              ON daily_checks;
DROP POLICY IF EXISTS "insert_daily_checks"              ON daily_checks;
DROP POLICY IF EXISTS "update_daily_checks"              ON daily_checks;

-- 2. Eliminar función helper
DROP FUNCTION IF EXISTS get_user_center(UUID);

-- 3. Eliminar columnas agregadas
ALTER TABLE user_profiles DROP COLUMN IF EXISTS operational_center_id;
ALTER TABLE daily_checks  DROP COLUMN IF EXISTS is_assignment;
*/
