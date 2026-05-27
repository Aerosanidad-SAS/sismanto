-- Migration 026: Limpieza completa de maintenance_records
-- Datos históricos de migración 016 son no confiables (km=0, valores NULL, tiempos erróneos).
-- Se carga base completa desde cero vía funcionalidad de carga masiva.
TRUNCATE maintenance_records RESTART IDENTITY CASCADE;
