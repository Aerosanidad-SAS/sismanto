-- Migration 030: Agregar numero_venta a fuel_logs para idempotencia en cargas
-- Permite re-importar el Excel del proveedor sin duplicar registros.
-- El índice parcial acepta NULL (registros históricos sin numero_venta).

ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS numero_venta TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS fuel_logs_numero_venta_key
  ON fuel_logs (numero_venta)
  WHERE numero_venta IS NOT NULL;
