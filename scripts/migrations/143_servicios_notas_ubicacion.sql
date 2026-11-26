-- ============================================================
-- Migración 143: notas de ubicación del servicio (#343)
--
-- Campo propio para lo que la tripulación necesita al llegar: apartamento, portería, referencias. Hasta hoy se escribía en
-- `observaciones` (que es del desenlace clínico y la editan también Médico y Auxiliar). Texto corto (255, como las direcciones).
--
-- Aditiva e idempotente: una columna nullable, sin valor por defecto, sin tocar filas existentes ni políticas RLS (las de
-- `medical_services` ya cubren la fila completa). Rollback: ALTER TABLE medical_services DROP COLUMN notas_ubicacion;
-- ============================================================

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS notas_ubicacion VARCHAR(255);
COMMENT ON COLUMN medical_services.notas_ubicacion IS 'Apartamento, portería y referencias para llegar; se muestra a la tripulación como «Notas de ubicación».';
