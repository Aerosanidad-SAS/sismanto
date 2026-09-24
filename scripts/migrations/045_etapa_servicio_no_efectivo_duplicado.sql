-- ============================================================
-- Migración 045: corrige el catálogo de etapas de medical_services
-- contra el valor real de SISRES (Ronda 2, pregunta 3 en
-- sisres/RESPUESTAS_LEON.md): "NO EFECTIVO" lleva espacio, no guion
-- bajo, y "DUPLICADO" es una etapa terminal viva hoy (23 filas en
-- producción SISRES) que faltaba en el catálogo original.
-- ============================================================

ALTER TABLE medical_services DROP CONSTRAINT IF EXISTS medical_services_etapa_check;

ALTER TABLE medical_services ADD CONSTRAINT medical_services_etapa_check
  CHECK (etapa IN ('PROGRAMADO','CURSO','FINALIZADO','CANCELADO','FALLIDO','NO EFECTIVO','DUPLICADO'));
