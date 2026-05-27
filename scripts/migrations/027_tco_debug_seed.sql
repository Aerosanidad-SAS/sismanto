-- Migration 027: Datos semilla de debug para verificar cálculo TCO
-- EJECUTAR MANUALMENTE en Supabase SQL Editor.
--
-- Valores semilla (uno por vehículo):
--   mantenimiento      = 1     fecha 2026-01-15
--   combustible        = 2     fecha 2026-01-15
--   SOAT anual         = 0,1
--   Tecnomecánica anual= 0,2
--   Póliza anual       = 0,3
--
-- TCO esperado — rango ENE 1 a DIC 31 2026 (365 días):
--   mant(1) + comb(2) + (0,1+0,2+0,3) × (365/365) = 3,6 por vehículo
--
-- TCO esperado — rango FEB 1 a DIC 31 2026 (sin el 15-ene, 334 días):
--   0 + 0 + 0,6 × (334/365) ≈ 0,549 por vehículo  (solo fijos prorrateados)
--
-- TCO esperado — solo ENERO 2026 (31 días):
--   1 + 2 + 0,6 × (31/365) ≈ 3,051 por vehículo
--
-- Verificar después de correr:
--   SELECT count(*) FROM maintenance_records;
--   SELECT count(*) FROM fuel_logs;
--   SELECT placa, costo_soat_anual FROM vehicles LIMIT 5;  -- debe ser 0.1

-- ── 1. Limpiar tablas ────────────────────────────────────────────────────────
TRUNCATE maintenance_records RESTART IDENTITY CASCADE;
TRUNCATE fuel_logs           RESTART IDENTITY CASCADE;

-- ── 2. Un mantenimiento PREVENTIVO por vehículo (valor = 1) ──────────────────
INSERT INTO maintenance_records
  (vehicle_id, fecha, kilometraje_actual, tipo, valor, descripcion_trabajo)
SELECT
  id,
  '2026-01-15',
  1,
  'PREVENTIVO',
  1,
  'DEBUG_TCO_SEED'
FROM vehicles;

-- ── 3. Un registro de combustible por vehículo (costo = 2) ───────────────────
INSERT INTO fuel_logs
  (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT
  id,
  '2026-01-15',
  1,
  1,
  2,
  'DEBUG_TCO_SEED'
FROM vehicles;

-- ── 4. Costos fijos anuales por vehículo ─────────────────────────────────────
UPDATE vehicles
SET
  costo_soat_anual            = 0.1,
  costo_tecnomecanica_anual   = 0.2,
  costo_poliza_anual          = 0.3;
