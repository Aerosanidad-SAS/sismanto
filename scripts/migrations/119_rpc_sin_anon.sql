-- ============================================================
-- Migración 119: ninguna función de `public` se puede llamar sin sesión (revisión de seguridad pre-producción, 2026-10-06)
--
-- Problema (MEDIO): en Supabase los privilegios por defecto dan EXECUTE a `anon`, `authenticated` y `service_role` de
-- forma EXPLÍCITA sobre cada función nueva de `public`, así que un `REVOKE ... FROM PUBLIC` (lo que hicieron la 019 y
-- varias migraciones posteriores) NO quita a `anon`. PostgREST expone cada función como RPC. Resultado: todas las
-- funciones SECURITY DEFINER del esquema son invocables SIN SESIÓN con solo la clave pública. La 109 cerró dos
-- (`get_user_role`, `ticket_nombre_usuario`); esta cierra la clase completa:
--   · `get_user_center(uuid)` seguía devolviendo el centro operativo de cualquier UUID a cualquiera (misma fuga que
--     la de `get_user_role`: lee `user_profiles` saltándose su RLS).
--   · `es_gestor_tickets()`, `puede_captacion()`, `es_rol_restringido()` y las funciones de tickets
--     (`tomar_ticket`, `cambiar_estado_ticket`, ...) comprueban `auth.uid()` por dentro y fallan sin sesión, pero
--     dependen de que nadie las edite mal en el futuro: sin EXECUTE para `anon` ni siquiera llegan a ejecutarse.
--
-- Arreglo:
--   1. `get_user_center(uuid)`: igual que la 109 con `get_user_role`: solo devuelve el centro de quien llama (las
--      políticas la usan sin argumento — p. ej. `operational_centers` — así que el comportamiento real no cambia).
--   2. REVOKE EXECUTE de todas las funciones actuales de `public` (las que se pueden llamar como RPC) a PUBLIC y `anon`,
--      y lo mismo para las que se creen después (ALTER DEFAULT PRIVILEGES). Ninguna política RLS se evalúa para `anon` con funciones (las pocas políticas
--      `TO public` usan subconsultas o `auth.role()`), y ninguna llamada `.rpc()` de la aplicación se hace sin sesión:
--      todas pasan por un usuario con sesión o por la clave de servicio (`service_role`, que no se toca).
--
-- `authenticated` y `service_role` conservan EXECUTE. Idempotente. Rollback: GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA
-- public TO anon (no recomendado).
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_center(p_user_id uuid DEFAULT auth.uid())
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT operational_center_id
  FROM user_profiles
  WHERE user_id = p_user_id
    AND p_user_id = auth.uid()  -- nunca el centro de otra persona: nadie en el código pasa un UUID ajeno
    AND activo = true
  LIMIT 1;
$function$;

-- Funciones propias de `public` que se pueden llamar como RPC (no triggers, no de extensiones): sin EXECUTE para PUBLIC
-- ni anon; `authenticated` y `service_role` lo conservan de forma explícita (así no dependen de PUBLIC).
DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS firma
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND p.prorettype <> 'trigger'::regtype
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f.firma);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f.firma);
  END LOOP;
END $$;

-- Las funciones que se creen después: sin EXECUTE para PUBLIC ni anon por defecto (en `public`, `authenticated` y
-- `service_role` siguen recibiéndolo por los privilegios por defecto de Supabase).
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
