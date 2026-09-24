-- ============================================================
-- Migración 036: Integración SISRES — campos de `movil` en vehicles
-- Fase 1 del plan. Import único de los campos que solo existían
-- en la tabla movil de SISRES (León confirmó 0 ediciones de movil
-- en 7 semanas — no hace falta sincronización continua, ver
-- RESPUESTAS_LEON.md §2). vehicles pasa a ser la fuente de verdad
-- única de vehículo desde esta migración.
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS numero_motor VARCHAR(60);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS numero_chasis VARCHAR(60);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS carroceria VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cilindraje VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS pasajeros INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS imei_gps VARCHAR(30);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ciudad_placa VARCHAR(100);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fecha_pase_aeroportuario DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS multas VARCHAR(10);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS obs_multas TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS descripcion_sisres TEXT;

COMMENT ON COLUMN vehicles.imei_gps IS 'IMEI del GPS ProTrack365 (origen SISRES movil.imeiGps)';
COMMENT ON COLUMN vehicles.fecha_pase_aeroportuario IS 'Vencimiento del pase aeroportuario (origen SISRES movil.fechaPase)';
