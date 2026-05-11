-- ============================================================
-- Migración 011: campos adicionales en suppliers
-- telefono, ciudad, servicio, direccion (requeridos en UI).
-- Idempotente. Ejecutar en SQL Editor Supabase.
-- ============================================================

ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS telefono  TEXT,
  ADD COLUMN IF NOT EXISTS ciudad    TEXT,
  ADD COLUMN IF NOT EXISTS servicio  TEXT,
  ADD COLUMN IF NOT EXISTS direccion TEXT;

COMMENT ON COLUMN suppliers.telefono  IS 'Teléfono principal del proveedor.';
COMMENT ON COLUMN suppliers.ciudad    IS 'Ciudad donde opera el proveedor.';
COMMENT ON COLUMN suppliers.servicio  IS 'Tipo de servicio que presta (ej. Mecánica, Llantas, Carrocería).';
COMMENT ON COLUMN suppliers.direccion IS 'Dirección o ubicación física del proveedor.';
