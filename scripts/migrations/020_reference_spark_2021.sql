-- ============================================================
-- Migración 020: Estandarizar referencia histórica combustión
-- Objetivo: marcar las 4 placas históricas como Chevrolet Spark 2021.
-- Uso: comparación histórica de combustible vs flota eléctrica.
-- Idempotente.
-- ============================================================

UPDATE public.vehicles
SET
  marca = 'Chevrolet',
  modelo = 'Spark 2021',
  linea = COALESCE(NULLIF(linea, ''), 'Spark')
WHERE upper(replace(trim(placa), ' ', '')) IN ('KOS929', 'KYV199', 'KYV219', 'KZO779');
