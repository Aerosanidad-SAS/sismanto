-- Migration 027: Datos semilla de debug para verificar cálculo TCO
-- PROPÓSITO: Dejar exactamente 1 registro controlado por vehículo en cada
--            concepto de costo, con valores que permiten verificar visualmente
--            que TODOS los componentes del TCO se suman correctamente.
--
-- EJECUTAR MANUALMENTE en Supabase SQL Editor (no se agrega a apply-database.ts).
-- Supersede la migración 026 (incluye su TRUNCATE).
--
-- Valores semilla:
--   mantenimiento = 1      por vehículo
--   combustible   = 2      por vehículo
--   SOAT anual    = 0.1    por vehículo
--   RTM anual     = 0.2    por vehículo
--   Póliza anual  = 0.3    por vehículo
--
-- TCO esperado para un año completo (365 días):
--   1 + 2 + (0.1 + 0.2 + 0.3) × (365/365) = 3.6 por vehículo
--
-- TCO esperado para período que NO incluya 2026-01-15:
--   0 + 0 + 0.6 × factorPeriodo  (solo costos fijos prorrateados)
--
-- Si se ve 3.6 en año completo → todo correcto.
-- Si los fijos no prorratean   → siempre se verá 3.6 sin importar el período.
-- Si faltan fijos               → se verá 3.0 en año completo.

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

-- ── 4. Costos fijos anuales uniformes en todos los vehículos ─────────────────
UPDATE vehicles
SET
  costo_soat_anual            = 0.1,
  costo_tecnomecanica_anual   = 0.2,
  costo_poliza_anual          = 0.3;
