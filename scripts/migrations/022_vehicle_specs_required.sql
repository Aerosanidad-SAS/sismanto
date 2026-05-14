-- ============================================================
-- Migración 022: Especificaciones técnicas obligatorias por vehículo
-- Objetivo:
-- 1) Agregar campos explícitos de bombillería y baterías
-- 2) Backfill para vehículos existentes
-- 3) Endurecer nullability para que sean obligatorios
-- ============================================================

ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS bombilleria_farolas text,
  ADD COLUMN IF NOT EXISTS bombilleria_stops text,
  ADD COLUMN IF NOT EXISTS bombilleria_direccionales text,
  ADD COLUMN IF NOT EXISTS bateria_principal text,
  ADD COLUMN IF NOT EXISTS bateria_auxiliar text;

UPDATE public.vehicles
SET
  tipo_llantas = COALESCE(NULLIF(tipo_llantas, ''), 'Pendiente definir'),
  aceite_usado = COALESCE(NULLIF(aceite_usado, ''), 'Pendiente definir'),
  ref_filtro_aceite = COALESCE(NULLIF(ref_filtro_aceite, ''), 'Pendiente definir'),
  ref_filtro_aire_motor = COALESCE(NULLIF(ref_filtro_aire_motor, ''), 'Pendiente definir'),
  tipo_refrigerante = COALESCE(NULLIF(tipo_refrigerante, ''), 'Pendiente definir'),
  bombilleria_farolas = COALESCE(NULLIF(bombilleria_farolas, ''), 'Pendiente definir'),
  bombilleria_stops = COALESCE(NULLIF(bombilleria_stops, ''), 'Pendiente definir'),
  bombilleria_direccionales = COALESCE(NULLIF(bombilleria_direccionales, ''), 'Pendiente definir'),
  bateria_principal = COALESCE(NULLIF(bateria_principal, ''), 'Pendiente definir'),
  bateria_auxiliar = COALESCE(NULLIF(bateria_auxiliar, ''), 'Pendiente definir')
WHERE
  tipo_llantas IS NULL OR tipo_llantas = '' OR
  aceite_usado IS NULL OR aceite_usado = '' OR
  ref_filtro_aceite IS NULL OR ref_filtro_aceite = '' OR
  ref_filtro_aire_motor IS NULL OR ref_filtro_aire_motor = '' OR
  tipo_refrigerante IS NULL OR tipo_refrigerante = '' OR
  bombilleria_farolas IS NULL OR bombilleria_farolas = '' OR
  bombilleria_stops IS NULL OR bombilleria_stops = '' OR
  bombilleria_direccionales IS NULL OR bombilleria_direccionales = '' OR
  bateria_principal IS NULL OR bateria_principal = '' OR
  bateria_auxiliar IS NULL OR bateria_auxiliar = '';

ALTER TABLE public.vehicles
  ALTER COLUMN tipo_llantas SET NOT NULL,
  ALTER COLUMN aceite_usado SET NOT NULL,
  ALTER COLUMN ref_filtro_aceite SET NOT NULL,
  ALTER COLUMN ref_filtro_aire_motor SET NOT NULL,
  ALTER COLUMN tipo_refrigerante SET NOT NULL,
  ALTER COLUMN bombilleria_farolas SET NOT NULL,
  ALTER COLUMN bombilleria_stops SET NOT NULL,
  ALTER COLUMN bombilleria_direccionales SET NOT NULL,
  ALTER COLUMN bateria_principal SET NOT NULL,
  ALTER COLUMN bateria_auxiliar SET NOT NULL;
