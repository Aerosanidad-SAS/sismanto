-- ============================================================
-- Migración 034: corregir historial FDS con fechas reales
--
-- Fechas confirmadas por el usuario (2026-06-26):
--   TRG542        → FDS desde 2025-10-09 (260 días atrás)
--   JQS239        → FDS desde 2025-11-26 (7 meses atrás)
--   JQS528        → FDS desde 2025-11-26 (7 meses atrás)
--   OSK398        → FDS desde 2025-11-26 (7 meses atrás)
--   OSK399        → FDS 2026-04-25 → OPERATIVO 2026-06-25 (2 meses FDS)
-- ============================================================

-- ── TRG542 ───────────────────────────────────────────────────
-- Eliminar entrada incorrecta (010 la puso en 2026-01-01)
DELETE FROM vehicle_status_history
WHERE vehicle_id = (SELECT id FROM vehicles WHERE upper(trim(placa)) = 'TRG542')
  AND estado_nuevo = 'FUERA_DE_SERVICIO'
  AND fecha_cambio::date = '2026-01-01';

-- Insertar con la fecha real
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2025-10-09 00:00:00+00',
       'FDS confirmado: 260 días antes del 2026-06-26'
FROM vehicles WHERE upper(trim(placa)) = 'TRG542';

UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde     = '2025-10-09',
  updated_at    = NOW()
WHERE upper(trim(placa)) = 'TRG542';

-- ── JQS239 y JQS528 ──────────────────────────────────────────
-- Eliminar entrada incorrecta (010 las puso en 2025-11-11)
DELETE FROM vehicle_status_history
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE upper(trim(placa)) IN ('JQS239', 'JQS528'))
  AND estado_nuevo = 'FUERA_DE_SERVICIO'
  AND fecha_cambio::date = '2025-11-11';

INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2025-11-26 00:00:00+00',
       'FDS confirmado: 7 meses antes del 2026-06-26'
FROM vehicles WHERE upper(trim(placa)) IN ('JQS239', 'JQS528');

UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde     = '2025-11-26',
  updated_at    = NOW()
WHERE upper(trim(placa)) IN ('JQS239', 'JQS528');

-- ── OSK398 ───────────────────────────────────────────────────
-- Eliminar entrada incorrecta (010 la puso en 2026-01-01)
DELETE FROM vehicle_status_history
WHERE vehicle_id = (SELECT id FROM vehicles WHERE upper(trim(placa)) = 'OSK398')
  AND estado_nuevo = 'FUERA_DE_SERVICIO'
  AND fecha_cambio::date = '2026-01-01';

INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2025-11-26 00:00:00+00',
       'FDS confirmado: 7 meses antes del 2026-06-26'
FROM vehicles WHERE upper(trim(placa)) = 'OSK398';

UPDATE vehicles SET
  estado_actual = 'FUERA_DE_SERVICIO',
  fds_desde     = '2025-11-26',
  updated_at    = NOW()
WHERE upper(trim(placa)) = 'OSK398';

-- ── OSK399 ───────────────────────────────────────────────────
-- Eliminar entrada incorrecta (010 la puso FDS desde 2026-03-27)
DELETE FROM vehicle_status_history
WHERE vehicle_id = (SELECT id FROM vehicles WHERE upper(trim(placa)) = 'OSK399')
  AND estado_nuevo = 'FUERA_DE_SERVICIO'
  AND fecha_cambio::date = '2026-03-27';

-- FDS desde 2026-04-25 (2 meses antes de su retorno el 2026-06-25)
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'FUERA_DE_SERVICIO', 'OPERATIVO', '2026-04-25 00:00:00+00',
       'FDS confirmado: 2 meses antes del retorno el 2026-06-25'
FROM vehicles WHERE upper(trim(placa)) = 'OSK399';

-- Retorno a OPERATIVO el 2026-06-25
INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, fecha_cambio, notas)
SELECT id, 'OPERATIVO', 'FUERA_DE_SERVICIO', '2026-06-25 00:00:00+00',
       'Retorno a OPERATIVO confirmado por usuario'
FROM vehicles WHERE upper(trim(placa)) = 'OSK399';

UPDATE vehicles SET
  estado_actual = 'OPERATIVO',
  fds_desde     = NULL,
  updated_at    = NOW()
WHERE upper(trim(placa)) = 'OSK399';
