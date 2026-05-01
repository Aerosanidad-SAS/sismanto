-- =============================================================================
-- 004_reserved_rls.sql — Aeromanto
-- -----------------------------------------------------------------------------
-- Slot reservado para futuras políticas RLS refinadas por rol ("Vault").
-- IMPORTANTE: probar cualquier contenido nuevo en un proyecto Supabase de
-- staging antes de aplicarlo en producción.
--
-- Hoy este archivo NO modifica objetos ni datos; permite que npm run db:apply
-- mantenga el orden 002 → 003 → 004 sin errores.
-- =============================================================================

SELECT 1 AS migration_004_placeholder;
