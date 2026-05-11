-- ============================================================
-- Migración 010: historial de cambios de estado de vehículos
-- Registra cada transición OPERATIVO ↔ FUERA_DE_SERVICIO.
-- Idempotente. Ejecutar en SQL Editor Supabase.
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_status_history (
  id            BIGSERIAL PRIMARY KEY,
  vehicle_id    UUID        NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  estado_nuevo  TEXT        NOT NULL CHECK (estado_nuevo  IN ('OPERATIVO', 'FUERA_DE_SERVICIO')),
  estado_anterior TEXT               CHECK (estado_anterior IN ('OPERATIVO', 'FUERA_DE_SERVICIO')),
  fecha_cambio  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  registrado_por UUID       REFERENCES auth.users(id) ON DELETE SET NULL,
  notas         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vehicle_status_history_vehicle_id_idx
  ON vehicle_status_history (vehicle_id, fecha_cambio DESC);

ALTER TABLE vehicle_status_history ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado
DROP POLICY IF EXISTS "vsh_select" ON vehicle_status_history;
CREATE POLICY "vsh_select" ON vehicle_status_history
  FOR SELECT TO authenticated USING (true);

-- Escritura: ADMIN, REGULACION, MANTENIMIENTO (roles que pueden cambiar estado)
DROP POLICY IF EXISTS "vsh_insert" ON vehicle_status_history;
CREATE POLICY "vsh_insert" ON vehicle_status_history
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON r.id = up.role_id
      WHERE up.user_id = auth.uid()
        AND r.codigo IN ('ADMIN', 'REGULACION', 'MANTENIMIENTO')
        AND up.activo = true
    )
  );

-- ============================================================
-- Datos históricos iniciales (registrado_por = NULL = sistema)
-- ============================================================

-- TRG542: FDS desde 2026-01-01
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2026-01-01 00:00:00+00', 'Registro inicial histórico'
FROM vehicles WHERE upper(trim(placa)) = 'TRG542'
ON CONFLICT DO NOTHING;

-- HXY015: salió a FDS el 2026-05-05 y retornó a OPERATIVO el 2026-05-11 13:00
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2026-05-05 00:00:00+00', 'Registro inicial histórico'
FROM vehicles WHERE upper(trim(placa)) = 'HXY015'
ON CONFLICT DO NOTHING;

INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'OPERATIVO', 'FUERA_DE_SERVICIO', '2026-05-11 13:00:00+00', 'Retorno a operación'
FROM vehicles WHERE upper(trim(placa)) = 'HXY015'
ON CONFLICT DO NOTHING;

-- JQS528 y JQS239: FDS desde 2025-11-11 (~6 meses)
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2025-11-11 00:00:00+00', 'Registro inicial histórico'
FROM vehicles WHERE upper(trim(placa)) IN ('JQS528', 'JQS239')
ON CONFLICT DO NOTHING;

-- OSK399: FDS desde 2026-03-27 (migración 009)
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2026-03-27 00:00:00+00', 'Registro inicial histórico'
FROM vehicles WHERE upper(trim(placa)) = 'OSK399'
ON CONFLICT DO NOTHING;

-- OSK398: FDS desde 2026-01-01 (migración 009)
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2026-01-01 00:00:00+00', 'Registro inicial histórico'
FROM vehicles WHERE upper(trim(placa)) = 'OSK398'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Corrección de estados y fds_desde
-- ============================================================

-- HXY015: ya retornó a OPERATIVO hoy
UPDATE vehicles SET
  estado_actual = 'OPERATIVO',
  fds_desde     = NULL,
  updated_at    = NOW()
WHERE upper(trim(placa)) = 'HXY015';

-- TRG542: confirmar FDS enero 2026 (009 ya lo hizo, este UPDATE es idempotente)
UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde     = DATE '2026-01-01',
  updated_at    = NOW()
WHERE upper(trim(placa)) = 'TRG542';

-- JQS528 y JQS239: corregir fds_desde a 6 meses atrás (009 puso 2025-12-11)
UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde     = DATE '2025-11-11',
  updated_at    = NOW()
WHERE upper(trim(placa)) IN ('JQS528', 'JQS239');
