-- ============================================================
-- Migración 115: cierre de turno del OVEM
--
-- Requerimiento (Daniel, 2026-10-02): el OVEM debe marcar la terminación de su turno — si hubo novedad, km final, y lo
-- que sea valioso para el siguiente conductor — y entregar el vehículo. Antes no había cierre ni entrega.
--
-- Una fila por (día, OVEM, vehículo) con lo que realmente pasó al cerrar: km final, novedades, nivel de combustible,
-- limpieza y a quién se entregó. Es un registro INMUTABLE: nadie lo edita; corregirlo es solo del ADMIN.
--
-- Hora y día los pone el servidor, en hora de Colombia: `fecha` y `cerrado_at` tienen DEFAULT y la política de
-- inserción exige que coincidan con el reloj de la base (el navegador no decide ni el día ni la hora).
--
-- El km final también debe quedar en `mileage_logs` (que alimenta `vehicles.km_actual` por trigger). El OVEM puede
-- insertar pero no actualizar `mileage_logs` (solo ADMIN), y ese día ya puede existir una lectura (importación de
-- tanqueos, otro registro), así que la escritura va por la función `registrar_km_cierre_turno`, que solo avanza.
--
-- Aditiva e idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS ovem_cierres_turno (
  id               BIGSERIAL PRIMARY KEY,
  fecha            DATE NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Bogota')::date),
  -- RESTRICT a propósito: borrar un usuario o un vehículo no debe llevarse el historial de cierres.
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  vehicle_id       UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  km_final         INTEGER NOT NULL CHECK (km_final >= 0),
  hubo_novedades   BOOLEAN NOT NULL,
  novedades_nota   TEXT,
  estado_entrega   VARCHAR(20) NOT NULL CHECK (estado_entrega IN ('SIN_NOVEDAD', 'CON_NOVEDADES')),
  nivel_combustible VARCHAR(20) NOT NULL CHECK (nivel_combustible IN ('LLENO', 'TRES_CUARTOS', 'MEDIO', 'CUARTO', 'RESERVA')),
  limpieza_ok      BOOLEAN NOT NULL,
  -- Siguiente conductor del vehículo, si lo hay. Si esa persona se borra, el cierre se conserva.
  entregado_a      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cerrado_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fecha, user_id, vehicle_id),
  -- Con novedades hay que decir cuáles; el estado de la entrega no puede contradecir la respuesta.
  CHECK (NOT hubo_novedades OR length(btrim(coalesce(novedades_nota, ''))) > 0),
  CHECK ((estado_entrega = 'CON_NOVEDADES') = hubo_novedades)
);

CREATE INDEX IF NOT EXISTS idx_cierres_turno_fecha ON ovem_cierres_turno (fecha DESC, vehicle_id);
CREATE INDEX IF NOT EXISTS idx_cierres_turno_vehiculo ON ovem_cierres_turno (vehicle_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_cierres_turno_usuario ON ovem_cierres_turno (user_id, fecha DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
ALTER TABLE ovem_cierres_turno ENABLE ROW LEVEL SECURITY;

-- Lectura: quienes siguen la operación; el OVEM ve lo suyo.
DROP POLICY IF EXISTS cierres_turno_select ON ovem_cierres_turno;
CREATE POLICY cierres_turno_select ON ovem_cierres_turno
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION', 'MANTENIMIENTO')
    OR user_id = auth.uid()
  );

-- Creación: el OVEM, a su nombre, del día de hoy en Colombia y con la hora de la base (no la que mande el cliente).
DROP POLICY IF EXISTS cierres_turno_insert_ovem ON ovem_cierres_turno;
CREATE POLICY cierres_turno_insert_ovem ON ovem_cierres_turno
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'OVEM'
    AND user_id = auth.uid()
    AND fecha = (now() AT TIME ZONE 'America/Bogota')::date
    AND cerrado_at = now()
  );

-- Corrección: solo el ADMIN (cierre inmutable para todos los demás: no hay política de UPDATE ni DELETE para ellos).
DROP POLICY IF EXISTS cierres_turno_admin ON ovem_cierres_turno;
CREATE POLICY cierres_turno_admin ON ovem_cierres_turno
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- ─── Km final → mileage_logs ─────────────────────────────────────────────────────────────────────────────────────
-- Solo para el OVEM que ya hizo su preoperacional de hoy en ese vehículo (o el ADMIN). Solo avanza: si ya hay una
-- lectura de hoy mayor, se conserva. El trigger de mileage_logs actualiza vehicles.km_actual.
CREATE OR REPLACE FUNCTION registrar_km_cierre_turno(p_vehicle_id UUID, p_km INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hoy DATE := (now() AT TIME ZONE 'America/Bogota')::date;
BEGIN
  IF p_km IS NULL OR p_km < 0 THEN
    RAISE EXCEPTION 'Kilometraje inválido';
  END IF;

  IF get_user_role() = 'OVEM' THEN
    IF NOT EXISTS (
      SELECT 1 FROM daily_checks dc
      WHERE dc.user_id = auth.uid() AND dc.vehicle_id = p_vehicle_id AND dc.fecha = hoy
    ) THEN
      RAISE EXCEPTION 'Sin preoperacional de hoy en este vehículo';
    END IF;
  ELSIF get_user_role() IS DISTINCT FROM 'ADMIN' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  INSERT INTO mileage_logs (vehicle_id, fecha, lectura_kilometraje)
  VALUES (p_vehicle_id, hoy, p_km)
  ON CONFLICT (vehicle_id, fecha)
  DO UPDATE SET lectura_kilometraje = GREATEST(mileage_logs.lectura_kilometraje, EXCLUDED.lectura_kilometraje);
END;
$$;

REVOKE ALL ON FUNCTION registrar_km_cierre_turno(UUID, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION registrar_km_cierre_turno(UUID, INTEGER) TO authenticated, service_role;

-- Igual que la 091/107/108: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM aplicar_politica_rol_restringido('ovem_cierres_turno');
  END IF;
END $$;

-- Rollback: DROP FUNCTION IF EXISTS registrar_km_cierre_turno(UUID, INTEGER); DROP TABLE IF EXISTS ovem_cierres_turno;
