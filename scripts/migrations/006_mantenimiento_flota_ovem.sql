-- ============================================================
-- Migración 006: Rol Mantenimiento, prioridad novedades,
-- costos anuales vehículo, tipos de servicio / ingresos,
-- RLS OVEM flota completa y políticas Mantenimiento.
-- Idempotente. Ejecutar después de 005_maintenance_items_checklist.sql.
-- ============================================================

-- 1. Rol MANTENIMIENTO
INSERT INTO roles (codigo, nombre, descripcion)
VALUES (
  'MANTENIMIENTO',
  'Mantenimiento',
  'Operación de mantenimiento: flota, novedades y registros de trabajo'
)
ON CONFLICT (codigo) DO NOTHING;

-- 2. Prioridad administrativa en novedades (solo app Admin la edita)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'incidents' AND column_name = 'prioridad'
  ) THEN
    ALTER TABLE incidents ADD COLUMN prioridad severity_level NULL;
    COMMENT ON COLUMN incidents.prioridad IS 'Prioridad operativa BAJA/MEDIA/ALTA; la asigna solo Administración.';
  END IF;
END $$;

-- 3. Costos anuales fijos en vehículo (SOAT, RTM/TM, póliza)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'costo_soat_anual'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN costo_soat_anual DECIMAL(14, 2)
      CHECK (costo_soat_anual IS NULL OR costo_soat_anual >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'costo_tecnomecanica_anual'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN costo_tecnomecanica_anual DECIMAL(14, 2)
      CHECK (costo_tecnomecanica_anual IS NULL OR costo_tecnomecanica_anual >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'costo_poliza_anual'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN costo_poliza_anual DECIMAL(14, 2)
      CHECK (costo_poliza_anual IS NULL OR costo_poliza_anual >= 0);
  END IF;
END $$;

-- 4. Catálogo de tipos de servicio (facturación / indicador B/C)
CREATE TABLE IF NOT EXISTS service_types (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO service_types (codigo, nombre, orden) VALUES
  ('TAB', 'Traslado básico', 1),
  ('TAM', 'Traslado medicalizado', 2),
  ('MD',  'Medicina domiciliaria', 3)
ON CONFLICT (codigo) DO NOTHING;

CREATE TABLE IF NOT EXISTS vehicle_service_revenue (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type_id INTEGER NOT NULL REFERENCES service_types(id) ON DELETE RESTRICT,
  periodo DATE NOT NULL,
  monto DECIMAL(14, 2) NOT NULL CHECK (monto >= 0),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (vehicle_id, service_type_id, periodo)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_service_revenue_vehicle ON vehicle_service_revenue(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_service_revenue_periodo ON vehicle_service_revenue(periodo);

ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_service_revenue ENABLE ROW LEVEL SECURITY;

-- 5. Políticas service_types y vehicle_service_revenue
DROP POLICY IF EXISTS "select_service_types" ON service_types;
CREATE POLICY "select_service_types" ON service_types
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL', 'MANTENIMIENTO'));

DROP POLICY IF EXISTS "insert_service_types" ON service_types;
CREATE POLICY "insert_service_types" ON service_types
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS "update_service_types" ON service_types;
CREATE POLICY "update_service_types" ON service_types
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS "select_vehicle_service_revenue" ON vehicle_service_revenue;
CREATE POLICY "select_vehicle_service_revenue" ON vehicle_service_revenue
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL'));

DROP POLICY IF EXISTS "insert_vehicle_service_revenue" ON vehicle_service_revenue;
CREATE POLICY "insert_vehicle_service_revenue" ON vehicle_service_revenue
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS "update_vehicle_service_revenue" ON vehicle_service_revenue;
CREATE POLICY "update_vehicle_service_revenue" ON vehicle_service_revenue
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS "delete_vehicle_service_revenue" ON vehicle_service_revenue;
CREATE POLICY "delete_vehicle_service_revenue" ON vehicle_service_revenue
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

-- 6. Reemplazar políticas clave: vehículos (OVEM ve toda la flota)
DROP POLICY IF EXISTS "select_vehicles" ON vehicles;
CREATE POLICY "select_vehicles" ON vehicles
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION', 'MANTENIMIENTO', 'OVEM')
  );

-- 7. Mantenimiento: mismo acceso operativo que Admin en registros (sin DELETE)
DROP POLICY IF EXISTS "select_maintenance_records" ON maintenance_records;
CREATE POLICY "select_maintenance_records" ON maintenance_records
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION', 'MANTENIMIENTO'));

DROP POLICY IF EXISTS "insert_maintenance_records" ON maintenance_records;
CREATE POLICY "insert_maintenance_records" ON maintenance_records
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN', 'MANTENIMIENTO'));

DROP POLICY IF EXISTS "update_maintenance_records" ON maintenance_records;
CREATE POLICY "update_maintenance_records" ON maintenance_records
  FOR UPDATE TO authenticated
  USING  (get_user_role() IN ('ADMIN', 'MANTENIMIENTO'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'MANTENIMIENTO'));

-- 8. Incidentes: Mantenimiento ve y crea/actualiza como Regulación
DROP POLICY IF EXISTS "select_incidents" ON incidents;
CREATE POLICY "select_incidents" ON incidents
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION', 'MANTENIMIENTO')
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = incidents.vehicle_id
      )
    )
  );

DROP POLICY IF EXISTS "insert_incidents" ON incidents;
CREATE POLICY "insert_incidents" ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'REGULACION', 'MANTENIMIENTO')
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_id
      )
    )
  );

DROP POLICY IF EXISTS "update_incidents" ON incidents;
CREATE POLICY "update_incidents" ON incidents
  FOR UPDATE TO authenticated
  USING  (get_user_role() IN ('ADMIN', 'REGULACION', 'MANTENIMIENTO'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'REGULACION', 'MANTENIMIENTO'));

-- 9. Kilometraje: OVEM y Mantenimiento en cualquier vehículo existente
DROP POLICY IF EXISTS "insert_mileage_logs" ON mileage_logs;
CREATE POLICY "insert_mileage_logs" ON mileage_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'MANTENIMIENTO')
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_id)
    )
  );

DROP POLICY IF EXISTS "select_mileage_logs" ON mileage_logs;
CREATE POLICY "select_mileage_logs" ON mileage_logs
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION', 'MANTENIMIENTO')
    OR (
      get_user_role() = 'OVEM'
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = mileage_logs.vehicle_id)
    )
  );

-- 10. OVEM puede auto-asignarse a cualquier vehículo válido (no solo su centro)
DROP POLICY IF EXISTS "insert_vehicle_assignments" ON vehicle_assignments;
CREATE POLICY "insert_vehicle_assignments" ON vehicle_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'REGULACION')
    OR (
      get_user_role() = 'OVEM'
      AND user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_id)
    )
  );

-- 11. daily_checks: OVEM en cualquier vehículo registrado
DROP POLICY IF EXISTS "insert_daily_checks" ON daily_checks;
CREATE POLICY "insert_daily_checks" ON daily_checks
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'OVEM'
    AND user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_id)
  );

-- 12. Categorías de mantenimiento: Mantenimiento las lee para el formulario
DROP POLICY IF EXISTS "select_maintenance_categories" ON maintenance_categories;
CREATE POLICY "select_maintenance_categories" ON maintenance_categories
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL', 'REGULACION', 'MANTENIMIENTO'));

-- 13. Proveedores: Mantenimiento puede leer para completar campo proveedor del formulario
DROP POLICY IF EXISTS "select_suppliers" ON suppliers;
CREATE POLICY "select_suppliers" ON suppliers
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'GERENCIAL', 'MANTENIMIENTO'));
