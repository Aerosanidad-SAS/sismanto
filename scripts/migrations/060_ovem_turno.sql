-- Migración 060: portal OVEM por turno
--
-- 1. El kilometraje del preoperacional (daily_checks) alimenta mileage_logs,
--    que es lo que lee vehicle_maintenance_alerts. Hasta ahora no se tocaban.
-- 2. Combustible: fuel_logs guarda quién registra; la política de INSERT para
--    OVEM comparaba va.vehicle_id consigo mismo (siempre verdadero).
-- 3. Dotación e insumos: catálogo en checklist_items (lista = 'DOTACION') y
--    resultados en supply_checks / supply_check_items, separados del
--    preoperacional para no alterar daily_checks.checklist_ok.
-- 4. Siniestros viales (road_accidents), distintos de las novedades.
--
-- Idempotente.

-- ─────────────────────────────────────────────
-- 1. daily_checks → mileage_logs
--    SECURITY DEFINER: el OVEM no tiene UPDATE sobre mileage_logs y el
--    upsert del mismo día lo necesita. trg_validar_km (BEFORE INSERT) sigue
--    rechazando lecturas menores a la última, y ese error aborta el guardado
--    del preoperacional, que es lo que queremos.
--    Sin backfill: el histórico de daily_checks en producción puede tener
--    lecturas no monótonas; se revisa aparte antes de cargarlo.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_mileage_from_daily_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_km INTEGER := GREATEST(COALESCE(NEW.kilometraje_inicial, 0), COALESCE(NEW.kilometraje_final, 0));
BEGIN
  IF v_km > 0 THEN
    INSERT INTO mileage_logs (vehicle_id, fecha, lectura_kilometraje)
    VALUES (NEW.vehicle_id, NEW.fecha, v_km)
    ON CONFLICT (vehicle_id, fecha)
    DO UPDATE SET lectura_kilometraje = GREATEST(mileage_logs.lectura_kilometraje, EXCLUDED.lectura_kilometraje);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_mileage_daily ON daily_checks;
CREATE TRIGGER trg_sync_mileage_daily
AFTER INSERT OR UPDATE OF kilometraje_inicial, kilometraje_final ON daily_checks
FOR EACH ROW
EXECUTE FUNCTION sync_mileage_from_daily_check();

-- ─────────────────────────────────────────────
-- 2. fuel_logs
-- ─────────────────────────────────────────────
ALTER TABLE fuel_logs
  ADD COLUMN IF NOT EXISTS registrado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "insert_fuel_logs" ON fuel_logs;
CREATE POLICY "insert_fuel_logs" ON fuel_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'ANALISTA')
    OR (
      get_user_role() = 'OVEM'
      AND registrado_por = auth.uid()
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = fuel_logs.vehicle_id)
    )
  );

-- El OVEM ve solo lo que él registró (confirmación de sus tanqueos).
DROP POLICY IF EXISTS "select_fuel_logs_own" ON fuel_logs;
CREATE POLICY "select_fuel_logs_own" ON fuel_logs
  FOR SELECT TO authenticated
  USING (get_user_role() = 'OVEM' AND registrado_por = auth.uid());

-- ─────────────────────────────────────────────
-- 3. Dotación e insumos
-- ─────────────────────────────────────────────
ALTER TABLE checklist_items
  ADD COLUMN IF NOT EXISTS lista VARCHAR(20) NOT NULL DEFAULT 'PREOPERACIONAL';

DO $$ BEGIN
  ALTER TABLE checklist_items
    ADD CONSTRAINT checklist_items_lista_check CHECK (lista IN ('PREOPERACIONAL', 'DOTACION'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS supply_checks (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha         DATE NOT NULL,
  completo      BOOLEAN NOT NULL DEFAULT false,
  observaciones TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_supply_check UNIQUE (user_id, vehicle_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_supply_checks_vehicle_fecha ON supply_checks(vehicle_id, fecha DESC);

CREATE TABLE IF NOT EXISTS supply_check_items (
  id                SERIAL PRIMARY KEY,
  supply_check_id   INTEGER NOT NULL REFERENCES supply_checks(id) ON DELETE CASCADE,
  checklist_item_id INTEGER NOT NULL REFERENCES checklist_items(id),
  estado            VARCHAR(20) NOT NULL CHECK (estado IN ('OK', 'FALLA', 'NO_APLICA')),
  cantidad_ok       INTEGER CHECK (cantidad_ok >= 0),
  observacion       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_supply_check_item UNIQUE (supply_check_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_supply_check_items_check ON supply_check_items(supply_check_id);

ALTER TABLE supply_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_check_items ENABLE ROW LEVEL SECURITY;

-- Tripulación (OVEM, auxiliar, médico) registra la suya; el OVEM solo edita la de hoy.
DROP POLICY IF EXISTS "select_supply_checks" ON supply_checks;
CREATE POLICY "select_supply_checks" ON supply_checks
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION')
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "insert_supply_checks" ON supply_checks;
CREATE POLICY "insert_supply_checks" ON supply_checks
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'ANALISTA')
    OR (
      get_user_role() IN ('OVEM', 'AUXILIAR_ENFERMERIA', 'MEDICO')
      AND user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = supply_checks.vehicle_id)
    )
  );

DROP POLICY IF EXISTS "update_supply_checks" ON supply_checks;
CREATE POLICY "update_supply_checks" ON supply_checks
  FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'ANALISTA')
    OR (user_id = auth.uid() AND fecha = CURRENT_DATE)
  )
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'ANALISTA')
    OR (user_id = auth.uid() AND fecha = CURRENT_DATE)
  );

DROP POLICY IF EXISTS "select_supply_check_items" ON supply_check_items;
CREATE POLICY "select_supply_check_items" ON supply_check_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM supply_checks sc WHERE sc.id = supply_check_items.supply_check_id));

DROP POLICY IF EXISTS "write_supply_check_items" ON supply_check_items;
CREATE POLICY "write_supply_check_items" ON supply_check_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM supply_checks sc
      WHERE sc.id = supply_check_items.supply_check_id
        AND (get_user_role() IN ('ADMIN', 'ANALISTA') OR (sc.user_id = auth.uid() AND sc.fecha = CURRENT_DATE))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM supply_checks sc
      WHERE sc.id = supply_check_items.supply_check_id
        AND (get_user_role() IN ('ADMIN', 'ANALISTA') OR (sc.user_id = auth.uid() AND sc.fecha = CURRENT_DATE))
    )
  );

-- ─────────────────────────────────────────────
-- 4. Siniestros viales
--    Cada siniestro crea además una novedad (incident_id) para que Regulación
--    y Mantenimiento lo vean en su flujo actual; si el vehículo queda no
--    operativo, esa novedad lo pasa a FUERA_DE_SERVICIO por el trigger existente.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS road_accidents (
  id                   SERIAL PRIMARY KEY,
  vehicle_id           UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  reportado_por        UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  fecha_hora           TIMESTAMPTZ NOT NULL,
  lugar                TEXT NOT NULL,
  descripcion          TEXT NOT NULL,
  paciente_a_bordo     BOOLEAN NOT NULL DEFAULT false,
  hay_lesionados       BOOLEAN NOT NULL DEFAULT false,
  lesionados_detalle   TEXT,
  hay_terceros         BOOLEAN NOT NULL DEFAULT false,
  tercero_placa        VARCHAR(10),
  tercero_nombre       VARCHAR(200),
  tercero_telefono     VARCHAR(30),
  tercero_aseguradora  VARCHAR(120),
  intervino_autoridad  BOOLEAN NOT NULL DEFAULT false,
  numero_ipat          VARCHAR(40),
  vehiculo_operativo   BOOLEAN NOT NULL DEFAULT true,
  incident_id          INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
  estado               incident_status NOT NULL DEFAULT 'ABIERTO',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_road_accidents_vehicle ON road_accidents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_road_accidents_fecha ON road_accidents(fecha_hora DESC);

ALTER TABLE road_accidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_road_accidents" ON road_accidents;
CREATE POLICY "select_road_accidents" ON road_accidents
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'MANTENIMIENTO', 'COORDINACION')
    OR reportado_por = auth.uid()
  );

DROP POLICY IF EXISTS "insert_road_accidents" ON road_accidents;
CREATE POLICY "insert_road_accidents" ON road_accidents
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'ANALISTA', 'REGULACION')
    OR (
      get_user_role() = 'OVEM'
      AND reportado_por = auth.uid()
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = road_accidents.vehicle_id)
    )
  );

-- La novedad se crea antes que el siniestro, así el OVEM no necesita UPDATE.
DROP POLICY IF EXISTS "update_road_accidents" ON road_accidents;
CREATE POLICY "update_road_accidents" ON road_accidents
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'REGULACION'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'ANALISTA', 'REGULACION'));

DROP POLICY IF EXISTS "delete_road_accidents" ON road_accidents;
CREATE POLICY "delete_road_accidents" ON road_accidents
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');
