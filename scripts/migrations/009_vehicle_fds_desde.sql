-- ============================================================
-- Migración 009: columna fds_desde y fechas de FDS operativo
-- para unidades indicadas (referencia negocio mayo 2026).
-- Idempotente. Ejecutar en SQL Editor Supabase.
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fds_desde date;

COMMENT ON COLUMN vehicles.fds_desde IS 'Inicio operativo fuera de servicio (despacho).';

-- TRG542 y OSK398: fuera de servicio desde enero 2026
UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde = DATE '2026-01-01',
  updated_at = NOW()
WHERE upper(trim(placa)) IN ('TRG542', 'OSK398');

-- OSK399: ~45 días antes del 2026-05-11 → 2026-03-27
UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde = DATE '2026-03-27',
  updated_at = NOW()
WHERE upper(trim(placa)) = 'OSK399';

-- JQS528 y JQS239: ~cinco meses antes del 2026-05-11 → 2025-12-11
UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde = DATE '2025-12-11',
  updated_at = NOW()
WHERE upper(trim(placa)) IN ('JQS528', 'JQS239');
