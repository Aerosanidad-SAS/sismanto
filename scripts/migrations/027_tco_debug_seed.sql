-- Migration 027: Datos semilla de debug para verificar cálculo TCO
-- PROPÓSITO: Dejar exactamente 1 registro controlado por vehículo en cada
--            concepto de costo, con valores enteros en COP visibles sin
--            decimales (formatCurrency usa maximumFractionDigits: 0).
--
-- EJECUTAR MANUALMENTE en Supabase SQL Editor (no en apply-database.ts).
-- Supersede la migración 026.
--
-- Valores semilla (COP):
--   mantenimiento = 1.000    por vehículo  (fecha 2026-01-15)
--   combustible   = 2.000    por vehículo  (fecha 2026-01-15)
--   SOAT anual    = 1.000    por vehículo
--   RTM anual     = 2.000    por vehículo
--   Póliza anual  = 3.000    por vehículo
--
-- TCO esperado para año completo (365 días, incluyendo 2026-01-15):
--   1000 + 2000 + (1000+2000+3000) × 1.0 = 9.000 por vehículo
--
-- TCO esperado para período que NO incluya 2026-01-15 (ej: feb–dic 2026):
--   0 + 0 + 6000 × factorPeriodo   (solo fijos prorrateados)
--   ej. 11 meses ≈ 335 días → 6000 × (335/365) ≈ 5.507
--
-- Verificación rápida después de correr:
--   SELECT count(*) FROM maintenance_records;  -- debe ser N vehículos
--   SELECT count(*) FROM fuel_logs;            -- debe ser N vehículos
--   SELECT placa, costo_soat_anual, costo_tecnomecanica_anual, costo_poliza_anual
--   FROM vehicles LIMIT 5;                     -- debe mostrar 1000, 2000, 3000

-- ── 1. Limpiar tablas ────────────────────────────────────────────────────────
TRUNCATE maintenance_records RESTART IDENTITY CASCADE;
TRUNCATE fuel_logs           RESTART IDENTITY CASCADE;

-- ── 2. Un mantenimiento PREVENTIVO por vehículo (valor = 1000 COP) ───────────
INSERT INTO maintenance_records
  (vehicle_id, fecha, kilometraje_actual, tipo, valor, descripcion_trabajo)
SELECT
  id,
  '2026-01-15',
  1,
  'PREVENTIVO',
  1000,
  'DEBUG_TCO_SEED'
FROM vehicles;

-- ── 3. Un registro de combustible por vehículo (costo = 2000 COP) ────────────
INSERT INTO fuel_logs
  (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT
  id,
  '2026-01-15',
  1,
  1,
  2000,
  'DEBUG_TCO_SEED'
FROM vehicles;

-- ── 4. Costos fijos anuales por vehículo ─────────────────────────────────────
UPDATE vehicles
SET
  costo_soat_anual            = 1000,
  costo_tecnomecanica_anual   = 2000,
  costo_poliza_anual          = 3000;
