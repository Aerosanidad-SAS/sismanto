-- ============================================================
-- Migración 132: el rol `anon` no puede escribir en ninguna tabla de `public` (defensa en profundidad, auditoría 14/10/2026)
--
-- Supabase entrega por defecto a `anon` y `authenticated` los privilegios INSERT/UPDATE/DELETE/TRUNCATE de toda tabla
-- nueva en `public`; lo único que impide que alguien sin sesión escriba es la RLS. Hoy todas las tablas tienen RLS y
-- ninguna política deja escribir a `anon`, pero una tabla futura con la RLS apagada por error quedaría escribible por
-- cualquiera con la llave pública (que va en el navegador).
--
-- Qué hace: quita a `anon` INSERT, UPDATE, DELETE y TRUNCATE en todas las tablas de `public` y en las futuras.
-- NO toca SELECT (la pantalla de acceso lee el logo/branding sin sesión) ni a `authenticated` ni a `service_role`.
-- La aplicación no escribe como `anon` en ninguna parte: los flujos públicos (firma remota, seguimiento, recuperar
-- clave) usan la llave de servicio en el servidor.
--
-- No destructiva, idempotente. Rollback: GRANT INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO anon;
-- ============================================================

DO $$
DECLARE
  t record;
BEGIN
  -- Tablas, tablas particionadas, vistas, vistas materializadas y tablas foráneas (las vistas también heredan el grant por defecto).
  FOR t IN
    SELECT c.relname
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  LOOP
    EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.%I FROM anon', t.relname);
  END LOOP;
END
$$;

-- Tablas que se creen de aquí en adelante (con el rol que corre las migraciones).
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM anon;
