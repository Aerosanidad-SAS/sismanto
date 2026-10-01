-- 093 · Carga semanal de combustible del proveedor: registro de cargas y marcas en fuel_logs. Idempotente, aditiva.
--
--   · `fuel_import_batches`: una fila por carga (quién, cuándo, archivo, totales). Permite ver si la semana ya se cargó
--     y dejar rastro de cada importación. No guarda el archivo ni datos personales.
--   · `fuel_logs.fecha_hora`: instante de la venta cuando el archivo trae hora (`fecha` sigue siendo el día).
--   · `fuel_logs.km_sospechoso`: lectura que retrocede o salta de forma absurda; se carga pero NO mueve el km del vehículo.
--   · `fuel_logs.estacion` y `fuel_logs.tipo_combustible`: lo que antes se mezclaba en `notas` ("Diesel · EDS LA 33").

ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMPTZ;
ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS km_sospechoso BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS estacion TEXT;
ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS tipo_combustible TEXT;

CREATE TABLE IF NOT EXISTS fuel_import_batches (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  archivo TEXT,
  filas_totales INTEGER NOT NULL DEFAULT 0,
  filas_nuevas INTEGER NOT NULL DEFAULT 0,
  filas_duplicadas INTEGER NOT NULL DEFAULT 0,
  filas_con_error INTEGER NOT NULL DEFAULT 0,
  fecha_desde DATE,
  fecha_hasta DATE
);

ALTER TABLE fuel_import_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fib_select ON fuel_import_batches;
CREATE POLICY fib_select ON fuel_import_batches
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO', 'GERENCIAL'));

DROP POLICY IF EXISTS fib_insert ON fuel_import_batches;
CREATE POLICY fib_insert ON fuel_import_batches
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN', 'ANALISTA'));

-- Rollback:
-- DROP TABLE IF EXISTS fuel_import_batches;
-- ALTER TABLE fuel_logs DROP COLUMN IF EXISTS fecha_hora, DROP COLUMN IF EXISTS km_sospechoso, DROP COLUMN IF EXISTS estacion, DROP COLUMN IF EXISTS tipo_combustible;
