-- 092 · Hoja de vida de vehículos: campos nuevos, km único, tipos de costo y especificaciones por modelo. Idempotente.
--
-- Por qué:
--   · La carga inicial de la hoja de vida (36 vehículos) trae datos que `vehicles` no guardaba: tipo de vehículo, color,
--     propietario, fecha de matrícula y el último kilometraje.
--   · El km del vehículo debe ser UNO: la lectura más alta registrada. Las alertas del plan de mantenimiento ya leen
--     `mileage_logs`; `vehicles.km_actual` es su copia denormalizada y la mantiene un trigger, de modo que todo lo que ya
--     escribe en `mileage_logs` (OVEM, mantenimientos, facturas, carga de combustible) la actualiza sin cambiar su código.
--   · SOAT/póliza/RTM ya tienen vigencia (089); faltan impuesto vehicular, cuota de leasing y GPS mensual.
--   · La carga inicial no trae todas las especificaciones técnicas (bombillería, filtros, baterías…): la 022 las hizo
--     NOT NULL, lo que impide cargar una hoja de vida incompleta. Se relaja; "incompleta" pasa a ser un estado que el
--     sistema reporta, no un error de carga.
--   · Especificaciones por MODELO (marca, línea, cilindraje, combustible), editables, con fuente y estado
--     verificado/candidato, para replicarlas a las placas del modelo.
-- Sin DROP de datos. El ajuste del CHECK y del ancho de `vehicle_annual_costs.tipo` es un cambio de tipo: el PR lleva
-- [DB-DESTRUCTIVE] por norma, aunque no toca filas.

-- ─── 1. Columnas nuevas en vehicles ─────────────────────────────────────────
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tipo_vehiculo VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color VARCHAR(40);
-- Editable y borrable: puede ser una persona natural (dato personal). La interfaz lo limita a ADMIN/ANALISTA/MANTENIMIENTO.
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS propietario VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fecha_matricula DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS km_actual INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fecha_km_actual DATE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_tipo_vehiculo_check') THEN
    ALTER TABLE vehicles ADD CONSTRAINT vehicles_tipo_vehiculo_check
      CHECK (tipo_vehiculo IS NULL OR tipo_vehiculo IN ('AMBULANCIA_TAB', 'AMBULANCIA_TAM', 'VAN', 'ADMIN', 'DOMI'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_km_actual_check') THEN
    ALTER TABLE vehicles ADD CONSTRAINT vehicles_km_actual_check CHECK (km_actual IS NULL OR km_actual >= 0);
  END IF;
END $$;

COMMENT ON COLUMN vehicles.tipo_vehiculo IS 'AMBULANCIA_TAB | AMBULANCIA_TAM | VAN | ADMIN | DOMI. Define el formato de preoperacional.';
COMMENT ON COLUMN vehicles.km_actual IS 'Lectura de odómetro más alta registrada. La mantiene el trigger de mileage_logs; no se escribe a mano.';

-- ─── 2. Especificaciones técnicas: permitir hoja de vida incompleta ─────────
ALTER TABLE vehicles
  ALTER COLUMN tipo_llantas DROP NOT NULL,
  ALTER COLUMN aceite_usado DROP NOT NULL,
  ALTER COLUMN ref_filtro_aceite DROP NOT NULL,
  ALTER COLUMN ref_filtro_aire_motor DROP NOT NULL,
  ALTER COLUMN tipo_refrigerante DROP NOT NULL,
  ALTER COLUMN bombilleria_farolas DROP NOT NULL,
  ALTER COLUMN bombilleria_stops DROP NOT NULL,
  ALTER COLUMN bombilleria_direccionales DROP NOT NULL,
  ALTER COLUMN bateria_principal DROP NOT NULL,
  ALTER COLUMN bateria_auxiliar DROP NOT NULL;

-- ─── 3. Km único: mileage_logs → vehicles.km_actual ─────────────────────────
-- Solo avanza: una lectura menor a la vigente (error de digitación, odómetro cambiado) queda en el historial pero no
-- mueve el km del vehículo. Las alertas siguen leyendo mileage_logs.
CREATE OR REPLACE FUNCTION actualizar_km_actual_vehiculo() RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE vehicles
     SET km_actual = NEW.lectura_kilometraje,
         fecha_km_actual = NEW.fecha
   WHERE id = NEW.vehicle_id
     AND (km_actual IS NULL OR NEW.lectura_kilometraje > km_actual);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mileage_logs_km_actual ON mileage_logs;
CREATE TRIGGER trg_mileage_logs_km_actual
  AFTER INSERT OR UPDATE OF lectura_kilometraje, fecha ON mileage_logs
  FOR EACH ROW EXECUTE FUNCTION actualizar_km_actual_vehiculo();

-- Relleno inicial con lo ya registrado (la lectura más alta de cada vehículo y su fecha).
UPDATE vehicles v
   SET km_actual = m.lectura_kilometraje,
       fecha_km_actual = m.fecha
  FROM (
    SELECT DISTINCT ON (vehicle_id) vehicle_id, lectura_kilometraje, fecha
      FROM mileage_logs
     ORDER BY vehicle_id, lectura_kilometraje DESC, fecha DESC
  ) m
 WHERE v.id = m.vehicle_id
   AND v.km_actual IS NULL;

-- ─── 4. Tipos de costo anual nuevos ─────────────────────────────────────────
ALTER TABLE vehicle_annual_costs ALTER COLUMN tipo TYPE VARCHAR(30);
ALTER TABLE vehicle_annual_costs DROP CONSTRAINT IF EXISTS vehicle_annual_costs_tipo_check;
ALTER TABLE vehicle_annual_costs ADD CONSTRAINT vehicle_annual_costs_tipo_check
  CHECK (tipo IN ('SOAT', 'POLIZA', 'RTM', 'IMPUESTO_VEHICULAR', 'LEASING_CUOTA', 'GPS_MENSUAL'));

-- ─── 5. Especificaciones por modelo ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_model_specs (
  id BIGSERIAL PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  linea VARCHAR(100) NOT NULL,
  cilindraje VARCHAR(20),
  combustible VARCHAR(20),
  tipo_llantas TEXT,
  tipo_bombillos TEXT,
  bombilleria_farolas TEXT,
  bombilleria_stops TEXT,
  bombilleria_direccionales TEXT,
  tipo_refrigerante TEXT,
  aceite_usado TEXT,
  ref_filtro_aire_motor TEXT,
  ref_filtro_aceite TEXT,
  ref_filtro_combustible TEXT,
  bateria_principal TEXT,
  bateria_auxiliar TEXT,
  estado VARCHAR(10) NOT NULL DEFAULT 'CANDIDATO' CHECK (estado IN ('CANDIDATO', 'VERIFICADO')),
  fuente TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID
);

-- Un modelo = marca + línea + cilindraje + combustible (los dos últimos pueden ser desconocidos).
CREATE UNIQUE INDEX IF NOT EXISTS uq_vehicle_model_specs_modelo
  ON vehicle_model_specs (upper(marca), upper(linea), COALESCE(cilindraje, ''), COALESCE(combustible, ''));

ALTER TABLE vehicle_model_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vms_select ON vehicle_model_specs;
CREATE POLICY vms_select ON vehicle_model_specs
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO', 'REGULACION', 'COORDINACION'));

DROP POLICY IF EXISTS vms_insert ON vehicle_model_specs;
CREATE POLICY vms_insert ON vehicle_model_specs
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO'));

DROP POLICY IF EXISTS vms_update ON vehicle_model_specs;
CREATE POLICY vms_update ON vehicle_model_specs
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO'));

DROP POLICY IF EXISTS vms_delete ON vehicle_model_specs;
CREATE POLICY vms_delete ON vehicle_model_specs
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA'));

-- Rollback:
-- DROP TABLE IF EXISTS vehicle_model_specs;
-- ALTER TABLE vehicle_annual_costs DROP CONSTRAINT IF EXISTS vehicle_annual_costs_tipo_check;
-- ALTER TABLE vehicle_annual_costs ADD CONSTRAINT vehicle_annual_costs_tipo_check CHECK (tipo IN ('SOAT','POLIZA','RTM'));  -- falla si ya hay tipos nuevos
-- DROP TRIGGER IF EXISTS trg_mileage_logs_km_actual ON mileage_logs; DROP FUNCTION IF EXISTS actualizar_km_actual_vehiculo();
-- ALTER TABLE vehicles DROP COLUMN IF EXISTS tipo_vehiculo, DROP COLUMN IF EXISTS color, DROP COLUMN IF EXISTS propietario,
--   DROP COLUMN IF EXISTS fecha_matricula, DROP COLUMN IF EXISTS km_actual, DROP COLUMN IF EXISTS fecha_km_actual;
