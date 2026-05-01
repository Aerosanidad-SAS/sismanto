-- ============================================================
-- Migración 002: Iteración 2 - Aeromantenimiento
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLA operational_centers (reemplaza el ENUM como lookup dinámico)
-- ============================================================
CREATE TABLE IF NOT EXISTS operational_centers (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar los 4 centros existentes del ENUM
INSERT INTO operational_centers (codigo, nombre) VALUES
  ('CRA_MEDELLIN', 'CRA Medellín'),
  ('CRA_BOGOTA', 'CRA Bogotá'),
  ('AIRPLAN', 'Airplan'),
  ('CTG', 'CTG')
ON CONFLICT (codigo) DO NOTHING;

-- 2. AMPLIAR TABLA vehicles con nuevos campos de perfil
-- ============================================================
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS marca VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tipo_combustible VARCHAR(50),
  ADD COLUMN IF NOT EXISTS tipo_bombillos VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tipo_refrigerante VARCHAR(100),
  ADD COLUMN IF NOT EXISTS aceite_usado VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ref_filtro_aire_motor VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ref_filtro_aceite VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ref_filtro_combustible VARCHAR(100),
  ADD COLUMN IF NOT EXISTS notas TEXT,
  ADD COLUMN IF NOT EXISTS vencimiento_tecnicomecanica DATE,
  ADD COLUMN IF NOT EXISTS centro_operativo_id INTEGER REFERENCES operational_centers(id);

-- Poblar centro_operativo_id desde el ENUM existente para datos ya cargados
UPDATE vehicles v
SET centro_operativo_id = oc.id
FROM operational_centers oc
WHERE v.centro_operativo::text = oc.codigo
  AND v.centro_operativo_id IS NULL;

-- 3. TABLA suppliers (proveedores)
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  nit VARCHAR(50),
  contacto VARCHAR(200),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda de proveedores
CREATE INDEX IF NOT EXISTS idx_suppliers_nombre ON suppliers(nombre);

-- Añadir supplier_id a maintenance_records
ALTER TABLE maintenance_records
  ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES suppliers(id);

-- 4. TABLA fuel_logs (registro de combustible para cálculo km/gal)
-- ============================================================
CREATE TABLE IF NOT EXISTS fuel_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  kilometraje INTEGER NOT NULL CHECK (kilometraje >= 0),
  galones DECIMAL(10,3) NOT NULL CHECK (galones > 0),
  costo DECIMAL(12,2),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_fecha ON fuel_logs(fecha DESC);

-- 5. COLUMNA tiempo_resolucion_horas en incidents
-- ============================================================
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS tiempo_resolucion_horas DECIMAL(10,2);

-- Poblar para incidentes ya cerrados
UPDATE incidents
SET tiempo_resolucion_horas = EXTRACT(EPOCH FROM (fecha_cierre - fecha_reporte)) / 3600
WHERE estado = 'CERRADO'
  AND fecha_cierre IS NOT NULL
  AND tiempo_resolucion_horas IS NULL;

-- Trigger para calcular tiempo_resolucion_horas automáticamente al cerrar
CREATE OR REPLACE FUNCTION calcular_tiempo_resolucion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'CERRADO' AND NEW.fecha_cierre IS NOT NULL AND OLD.estado != 'CERRADO' THEN
    NEW.tiempo_resolucion_horas := EXTRACT(EPOCH FROM (NEW.fecha_cierre - NEW.fecha_reporte)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_resolucion ON incidents;
CREATE TRIGGER trg_calcular_resolucion
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION calcular_tiempo_resolucion();

-- 6. RLS para nuevas tablas
-- ============================================================
ALTER TABLE operational_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

-- operational_centers (eliminar políticas si ya existen para poder re-ejecutar el script)
DROP POLICY IF EXISTS "Anon: leer operational_centers" ON operational_centers;
DROP POLICY IF EXISTS "Anon: escribir operational_centers" ON operational_centers;
DROP POLICY IF EXISTS "Auth: todo operational_centers" ON operational_centers;
CREATE POLICY "Anon: leer operational_centers" ON operational_centers
  FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir operational_centers" ON operational_centers
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth: todo operational_centers" ON operational_centers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- suppliers
DROP POLICY IF EXISTS "Anon: leer suppliers" ON suppliers;
DROP POLICY IF EXISTS "Anon: escribir suppliers" ON suppliers;
DROP POLICY IF EXISTS "Auth: todo suppliers" ON suppliers;
CREATE POLICY "Anon: leer suppliers" ON suppliers
  FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir suppliers" ON suppliers
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth: todo suppliers" ON suppliers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- fuel_logs
DROP POLICY IF EXISTS "Anon: leer fuel_logs" ON fuel_logs;
DROP POLICY IF EXISTS "Anon: escribir fuel_logs" ON fuel_logs;
DROP POLICY IF EXISTS "Auth: todo fuel_logs" ON fuel_logs;
CREATE POLICY "Anon: leer fuel_logs" ON fuel_logs
  FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir fuel_logs" ON fuel_logs
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth: todo fuel_logs" ON fuel_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
