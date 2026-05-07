-- ============================================================
-- Migración 007: daily_check_items.cantidad_ok
-- Permite capturar \"cuántos\" están OK cuando el ítem tiene cantidad_esperada numérica
-- (ej. luces = 2). Idempotente.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_check_items'
      AND column_name = 'cantidad_ok'
  ) THEN
    ALTER TABLE daily_check_items
      ADD COLUMN cantidad_ok INTEGER
      CHECK (cantidad_ok IS NULL OR cantidad_ok >= 0);
  END IF;
END $$;

