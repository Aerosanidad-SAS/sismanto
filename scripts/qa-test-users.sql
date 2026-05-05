-- =============================================================================
-- Perfiles QA — Aeromanto (auth.users → user_profiles + roles)
-- =============================================================================
-- Los usuarios deben existir en Authentication → Users.
--
-- ADMIN (máximos permisos en la app — sidebar completo + /admin/usuarios):
--   admin@aeromanto.co
--   innovizar@aerosanidadsas.com
--
-- Resto de roles:
--   gerencial@aeromanto.co      → GERENCIAL (nombre en Auth; rol sigue siendo GERENCIAL)
--   ovem@aeromanto.co           → OVEM
--   regulacion@aeromanto.co     → REGULACION
--
-- Ejecutar una vez en SQL Editor (idempotente por ON CONFLICT user_id).
-- =============================================================================

INSERT INTO user_profiles (user_id, role_id, nombre_completo, email, activo)
SELECT u.id, r.id, v.nombre, u.email, true
FROM auth.users u
JOIN (
  VALUES
    ('admin@aeromanto.co', 'ADMIN', 'Admin'),
    ('innovizar@aerosanidadsas.com', 'ADMIN', 'Innovizar'),
    ('gerencial@aeromanto.co', 'GERENCIAL', 'Gerencia'),
    ('ovem@aeromanto.co', 'OVEM', 'OVEM'),
    ('regulacion@aeromanto.co', 'REGULACION', 'Regulación')
) AS v(email, rol_codigo, nombre) ON lower(trim(u.email)) = lower(trim(v.email))
JOIN roles r ON r.codigo = v.rol_codigo
ON CONFLICT (user_id) DO UPDATE
SET
  role_id = EXCLUDED.role_id,
  nombre_completo = EXCLUDED.nombre_completo,
  email = EXCLUDED.email,
  activo = true,
  updated_at = now();

-- OVEM: si no hay vehículos asignados, en Regulación asignar al menos uno a ovem@aeromanto.co
