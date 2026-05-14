-- ============================================================
-- Migración 021: limpiar registros de combustible
-- Objetivo: vaciar fuel_logs para recarga manual del archivo histórico.
-- ADVERTENCIA: irreversible en el entorno donde se ejecute.
-- ============================================================

TRUNCATE TABLE public.fuel_logs RESTART IDENTITY;
