-- ============================================================
-- Migración 052: ciudad del usuario, para el default del formulario
-- de servicios (ciudad de origen = ciudad del usuario logueado,
-- editable). Se completa igual que cedula — Configuración → Usuarios.
-- ============================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);
