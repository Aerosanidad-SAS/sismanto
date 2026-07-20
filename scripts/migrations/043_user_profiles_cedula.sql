-- ============================================================
-- Migración 043: cédula en user_profiles — identidad para el cruce SISRES
-- Aeromanto nunca capturó cédula de sus usuarios (solo email + nombre).
-- Se agrega para que el cruce de identidad con los usuarios de SISRES sea
-- por cédula (exacto) en vez de por nombre (aproximado, ver
-- RBAC_INTEGRACION.md §1.1). Nullable: los usuarios existentes de Aeromanto
-- necesitan que alguien de RR.HH./administración la complete — no hay fuente
-- de datos previa de la que importarla automáticamente.
-- ============================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS cedula VARCHAR(20);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_cedula
  ON user_profiles(cedula) WHERE cedula IS NOT NULL;
