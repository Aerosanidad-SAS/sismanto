-- ============================================================
-- Migración 108: programación diaria — conductores titulares e historial de quién operó cada vehículo cada día
--
-- Regla de negocio (Daniel, 2026-10-01): cada vehículo tiene 1 o máximo 2 conductores titulares fijos (cuidado del
-- vehículo y sentido de pertenencia), pero Regulación puede cambiarlos de un día para otro según la operación.
-- Lo que importa es el HISTORIAL: quién operó qué vehículo cada día, guardado de forma que luego se crucen
-- novedades, daños y conductores (p. ej. embragues que se acaban con frecuencia).
--
-- Dos tablas:
--   · vehicle_titulares        quién es titular de cada vehículo (máx. 2 vigentes por vehículo, 1 por posición).
--   · vehicle_operacion_diaria una fila por (día, vehículo, conductor): lo que REALMENTE ocurrió ese día. Se
--     materializa desde los titulares (origen TITULAR) y Regulación lo ajusta (origen CAMBIO_DEL_DIA). Es una
--     fotografía: cambiar un titular después NO reescribe los días ya registrados.
--
-- Los días pasados no se editan desde la aplicación: la política de escritura solo admite hoy y el futuro (hora de
-- Colombia); corregir el pasado es solo del ADMIN. Aditiva e idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_titulares (
  id          BIGSERIAL PRIMARY KEY,
  vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  posicion    SMALLINT NOT NULL CHECK (posicion IN (1, 2)),
  desde       DATE NOT NULL,
  hasta       DATE,                              -- NULL = vigente
  asignado_por UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (hasta IS NULL OR hasta >= desde)
);

-- Una persona por posición vigente, y la misma persona no ocupa las dos posiciones del mismo vehículo.
CREATE UNIQUE INDEX IF NOT EXISTS uq_vehicle_titulares_posicion
  ON vehicle_titulares (vehicle_id, posicion) WHERE hasta IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_vehicle_titulares_persona
  ON vehicle_titulares (vehicle_id, user_id) WHERE hasta IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_titulares_user ON vehicle_titulares (user_id) WHERE hasta IS NULL;

CREATE TABLE IF NOT EXISTS vehicle_operacion_diaria (
  id            BIGSERIAL PRIMARY KEY,
  fecha         DATE NOT NULL,
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origen        VARCHAR(20) NOT NULL DEFAULT 'TITULAR' CHECK (origen IN ('TITULAR', 'CAMBIO_DEL_DIA')),
  nota          TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fecha, vehicle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_operacion_diaria_vehiculo ON vehicle_operacion_diaria (vehicle_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_operacion_diaria_conductor ON vehicle_operacion_diaria (user_id, fecha DESC);

-- ─── Materialización: titulares vigentes → operación del día ─────────────────────────────────────────────────────
-- Idempotente (no pisa lo que Regulación ya ajustó): solo agrega a los vehículos OPERATIVOS que aún no tienen
-- ninguna fila ese día. Devuelve cuántas filas creó. La llama la aplicación al abrir el día y el cron de las 00:05.
CREATE OR REPLACE FUNCTION materializar_operacion_dia(p_fecha DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creadas INTEGER;
BEGIN
  IF p_fecha < (now() AT TIME ZONE 'America/Bogota')::date THEN
    RAISE EXCEPTION 'No se materializan días pasados (%): el historial no se reescribe', p_fecha;
  END IF;

  INSERT INTO vehicle_operacion_diaria (fecha, vehicle_id, user_id, origen)
  SELECT p_fecha, t.vehicle_id, t.user_id, 'TITULAR'
  FROM vehicle_titulares t
  JOIN vehicles v ON v.id = t.vehicle_id
  WHERE t.desde <= p_fecha
    AND (t.hasta IS NULL OR t.hasta >= p_fecha)
    AND v.estado_actual = 'OPERATIVO'
    AND NOT EXISTS (
      SELECT 1 FROM vehicle_operacion_diaria d WHERE d.fecha = p_fecha AND d.vehicle_id = t.vehicle_id
    )
  ON CONFLICT (fecha, vehicle_id, user_id) DO NOTHING;

  GET DIAGNOSTICS creadas = ROW_COUNT;
  RETURN creadas;
END;
$$;

REVOKE ALL ON FUNCTION materializar_operacion_dia(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION materializar_operacion_dia(DATE) TO authenticated;

-- ─── RLS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
ALTER TABLE vehicle_titulares ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_operacion_diaria ENABLE ROW LEVEL SECURITY;

-- Lectura: quienes programan o analizan; el conductor ve sus propias filas (su responsabilidad de preoperacional).
DROP POLICY IF EXISTS vehicle_titulares_select ON vehicle_titulares;
CREATE POLICY vehicle_titulares_select ON vehicle_titulares
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION', 'MANTENIMIENTO') OR user_id = auth.uid());

DROP POLICY IF EXISTS vehicle_titulares_write ON vehicle_titulares;
CREATE POLICY vehicle_titulares_write ON vehicle_titulares
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN', 'REGULACION'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'REGULACION'));

DROP POLICY IF EXISTS operacion_diaria_select ON vehicle_operacion_diaria;
CREATE POLICY operacion_diaria_select ON vehicle_operacion_diaria
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION', 'MANTENIMIENTO') OR user_id = auth.uid());

-- Escritura: Regulación solo sobre hoy y el futuro; el ADMIN puede corregir cualquier día.
DROP POLICY IF EXISTS operacion_diaria_write ON vehicle_operacion_diaria;
CREATE POLICY operacion_diaria_write ON vehicle_operacion_diaria
  FOR ALL TO authenticated
  USING (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'REGULACION' AND fecha >= (now() AT TIME ZONE 'America/Bogota')::date)
  )
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'REGULACION' AND fecha >= (now() AT TIME ZONE 'America/Bogota')::date)
  );

-- Igual que la 091/107: si existe la política restrictiva de TECNICO/AEROPUERTO (076), estas tablas también quedan cubiertas.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM aplicar_politica_rol_restringido('vehicle_titulares');
    PERFORM aplicar_politica_rol_restringido('vehicle_operacion_diaria');
  END IF;
END $$;

-- Rollback: DROP FUNCTION IF EXISTS materializar_operacion_dia(DATE); DROP TABLE IF EXISTS vehicle_operacion_diaria; DROP TABLE IF EXISTS vehicle_titulares;
