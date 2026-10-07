-- ============================================================
-- Migración 118: cierra la escalada de privilegios por `user_profiles` (revisión de seguridad pre-producción, 2026-10-06)
--
-- Problema (BLOQUEANTE): la política `update_user_profiles` (migración 004) permitía UPDATE de la propia fila
-- (`auth.uid() = user_id`) en USING y en WITH CHECK, sin limitar columnas. `role_id`, `activo` y
-- `operational_center_id` viven en esa misma fila, y `get_user_role()` (la base de ~200 políticas RLS) lee `role_id`.
-- Cualquier usuario con sesión (un conductor OVEM, por ejemplo) podía llamar a la API REST de Supabase con la clave
-- pública (anon) y su propio JWT:
--     PATCH /rest/v1/user_profiles?user_id=eq.<su uuid>   {"role_id": <id del rol ADMIN>}
-- y desde ese instante era ADMIN en toda la base. Reproducido en un esquema reconstruido con todas las migraciones
-- (PGlite): el UPDATE devuelve la fila y `get_user_role()` pasa de OVEM a ADMIN. También permitía cambiarse el
-- centro operativo (saltarse la limitación por centro de REGULACION/OVEM/COORDINACION) y marcar
-- `debe_cambiar_password = false`.
--
-- Segundo problema (mismo origen): ANALISTA podía actualizar e insertar CUALQUIER fila de `user_profiles`, incluida la
-- suya, con rol ADMIN. La aplicación lo impide («solo un Administrador otorga el rol ADMIN»), pero esa regla vivía
-- solo en el código de la Server Action: llamando a la API REST directamente se saltaba.
--
-- Arreglo:
--   · UPDATE: ya no hay autoedición. Todas las escrituras legítimas a `user_profiles` salen de la aplicación: con la
--     clave de servicio (primer ingreso, recuperar contraseña, carga masiva — no pasan por RLS) o con la sesión de un
--     ADMIN/ANALISTA (`updateUserAsAdmin`, `toggleUserActive`). Ninguna usa la sesión de la propia persona.
--   · ADMIN conserva todo. ANALISTA solo puede tocar filas que NO son ADMIN, y la fila resultante tampoco puede ser
--     ADMIN (WITH CHECK): ni se otorga ni se quita ese rol.
--   · INSERT: igual, ANALISTA no puede crear un perfil con rol ADMIN.
--
-- Las llamadas a get_user_role() van envueltas en (SELECT ...) (se evalúa una vez por consulta). Idempotente.
-- Rollback: recrear update_user_profiles / insert_user_profiles como en 004_rls_roles.sql (no recomendado).
-- ============================================================

DROP POLICY IF EXISTS update_user_profiles ON user_profiles;
CREATE POLICY update_user_profiles ON user_profiles
  FOR UPDATE TO authenticated
  USING (
    (SELECT get_user_role()) = 'ADMIN'
    OR ((SELECT get_user_role()) = 'ANALISTA' AND role_id <> (SELECT id FROM roles WHERE codigo = 'ADMIN'))
  )
  WITH CHECK (
    (SELECT get_user_role()) = 'ADMIN'
    OR ((SELECT get_user_role()) = 'ANALISTA' AND role_id <> (SELECT id FROM roles WHERE codigo = 'ADMIN'))
  );

DROP POLICY IF EXISTS insert_user_profiles ON user_profiles;
CREATE POLICY insert_user_profiles ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT get_user_role()) = 'ADMIN'
    OR ((SELECT get_user_role()) = 'ANALISTA' AND role_id <> (SELECT id FROM roles WHERE codigo = 'ADMIN'))
  );
