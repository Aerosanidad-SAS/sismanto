-- ============================================================
-- Migración 110: cambios de vehículo del conductor (OVEM) durante el día, con razón obligatoria
--
-- Regla de negocio (Daniel, 2026-10-02): si por alguna razón durante el día se cambia al OVEM de vehículo (el
-- vehículo sale a reparación o a mantenimiento, un siniestro, un ajuste de la operación...), debe quedar registrada la
-- razón para poder luego conectarla con una novedad, o para que repose en el historial el porqué se cambió.
--
-- Una fila por conductor afectado:
--   · llega a un vehículo (vehicle_destino) viniendo de otro (vehicle_origen) o sin vehículo (origen NULL), o
--   · sale de un vehículo sin pasar a otro (vehicle_destino NULL: queda sin vehículo ese día).
-- Se parece a vehicle_operacion_diaria (108) pero esa tabla es la fotografía de «quién operó qué»; esta guarda el
-- PORQUÉ de cada movimiento.
--
-- La razón es obligatoria: código de la lista cerrada + texto de al menos 5 caracteres (con OTRA, el texto es la razón).
-- incident_id enlaza opcionalmente con la novedad que lo motivó; si la novedad se borra, el cambio se conserva.
-- Aditiva e idempotente. Los días pasados no se escriben (hora de Colombia), salvo el ADMIN.
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_operador_cambios (
  id             BIGSERIAL PRIMARY KEY,
  fecha          DATE NOT NULL,
  -- RESTRICT a propósito: borrar un vehículo o un usuario no debe llevarse el historial del cambio.
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  vehicle_origen  UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
  vehicle_destino UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
  razon_codigo   VARCHAR(20) NOT NULL
                 CHECK (razon_codigo IN ('REPARACION', 'MANTENIMIENTO', 'SINIESTRO', 'FALLA', 'AJUSTE_OPERATIVO', 'OTRA')),
  razon_texto    TEXT NOT NULL CHECK (char_length(btrim(razon_texto)) >= 5),
  incident_id    INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
  registrado_por UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Un cambio mueve de algún lado a algún lado, y no de un vehículo a sí mismo.
  CHECK (vehicle_origen IS NOT NULL OR vehicle_destino IS NOT NULL),
  CHECK (vehicle_origen IS DISTINCT FROM vehicle_destino)
);

CREATE INDEX IF NOT EXISTS idx_operador_cambios_fecha ON vehicle_operador_cambios (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_operador_cambios_usuario ON vehicle_operador_cambios (user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_operador_cambios_origen ON vehicle_operador_cambios (vehicle_origen, fecha DESC) WHERE vehicle_origen IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_operador_cambios_destino ON vehicle_operador_cambios (vehicle_destino, fecha DESC) WHERE vehicle_destino IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_operador_cambios_incidente ON vehicle_operador_cambios (incident_id) WHERE incident_id IS NOT NULL;

-- ─── RLS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
ALTER TABLE vehicle_operador_cambios ENABLE ROW LEVEL SECURITY;

-- Lectura: quienes programan o analizan (como 108); el conductor ve sus propios cambios.
DROP POLICY IF EXISTS operador_cambios_select ON vehicle_operador_cambios;
CREATE POLICY operador_cambios_select ON vehicle_operador_cambios
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION', 'MANTENIMIENTO') OR user_id = auth.uid());

-- Escritura: Regulación solo sobre hoy y el futuro (hora de Colombia); el ADMIN puede corregir cualquier día.
DROP POLICY IF EXISTS operador_cambios_write ON vehicle_operador_cambios;
CREATE POLICY operador_cambios_write ON vehicle_operador_cambios
  FOR ALL TO authenticated
  USING (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'REGULACION' AND fecha >= (now() AT TIME ZONE 'America/Bogota')::date)
  )
  WITH CHECK (
    get_user_role() = 'ADMIN'
    OR (get_user_role() = 'REGULACION' AND fecha >= (now() AT TIME ZONE 'America/Bogota')::date)
  );

-- Igual que la 091/107/108: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM aplicar_politica_rol_restringido('vehicle_operador_cambios');
  END IF;
END $$;

-- Rollback: DROP TABLE IF EXISTS vehicle_operador_cambios;
