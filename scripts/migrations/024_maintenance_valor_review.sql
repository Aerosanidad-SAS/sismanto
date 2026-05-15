-- 024_maintenance_valor_review.sql
-- Agrega flag para marcar registros de mantenimiento con valor sospechoso
-- y crea un índice de apoyo para consultas de revisión.

ALTER TABLE maintenance_records
  ADD COLUMN IF NOT EXISTS valor_necesita_revision BOOLEAN DEFAULT FALSE;

-- Marcar registros con valor > 10,000,000 COP como sospechosos
-- (texto legal de facturas colombianas suele ser 100M+, pero usamos 10M como umbral seguro)
UPDATE maintenance_records
SET valor_necesita_revision = TRUE
WHERE valor > 10000000;

CREATE INDEX IF NOT EXISTS idx_manto_revision
  ON maintenance_records (valor_necesita_revision)
  WHERE valor_necesita_revision = TRUE;
