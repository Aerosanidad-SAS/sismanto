-- 076 · Roles TECNICO y AEROPUERTO (SISRES: cargo 9 "Técnico" y los cargos "… Aeropuerto") + blindaje de los roles restringidos.
--
--   TECNICO    Gestiona los tickets de soporte (tomarlos, contactar, cambiar estado y prioridad). Equivale al cargo 9 de SISRES.
--   AEROPUERTO Personal del aeropuerto que SOLO registra y consulta sus propios tickets. Sustituye a los tres cargos
--              "Medico / Auxiliar de Enfermeria / Ovem Aeropuerto" de SISRES (10, 11 y 12), que tenían 4, 4 y 2 permisos de 112.
--
-- Ninguno de los dos debe ver nada más que el soporte. En SISMANTO casi todas las políticas RLS enumeran los roles
-- permitidos, pero hay tablas de referencia con `USING (true)` para cualquier usuario autenticado (roles, catálogo de
-- clientes y CIE-10, plan de mantenimiento, historial de estado de vehículos, preguntas de capacitación…): un rol nuevo
-- las leería por omisión. Por eso este archivo agrega una política RESTRICTIVA a cada tabla con RLS: en Postgres las
-- políticas restrictivas se combinan con AND, así que sea cual sea lo que digan las permisivas, un rol restringido NO
-- pasa. Solo quedan fuera las tablas que el soporte necesita (lista en `tabla_permitida_a_rol_restringido`).
--
-- Idempotente. Toda tabla NUEVA con RLS debe llamar `SELECT aplicar_politica_rol_restringido('mi_tabla');`
-- y `SELECT * FROM tablas_sin_politica_rol_restringido();` debe devolver 0 filas (ver scripts/supabase-verify-smoke.sql).

-- ─── 1. Roles ────────────────────────────────────────────────────────────────────────────────────
INSERT INTO roles (codigo, nombre, descripcion) VALUES
  ('TECNICO', 'Técnico de soporte', 'Gestiona los tickets de soporte técnico (cargo Técnico de SISRES)'),
  ('AEROPUERTO', 'Personal de aeropuerto', 'Solo registra y consulta sus propios tickets de soporte (cargos "Aeropuerto" de SISRES)')
ON CONFLICT (codigo) DO NOTHING;

-- ─── 2. Quiénes son "restringidos" ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.es_rol_restringido()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(get_user_role() IN ('TECNICO','AEROPUERTO'), false);
$$;
REVOKE ALL ON FUNCTION public.es_rol_restringido() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.es_rol_restringido() TO authenticated;
GRANT EXECUTE ON FUNCTION public.es_rol_restringido() TO service_role;

-- ─── 3. El técnico gestiona tickets (una sola definición, la de la 065) ──────────────────────────
CREATE OR REPLACE FUNCTION public.es_gestor_tickets()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(get_user_role() IN ('ADMIN','ANALISTA','COORDINACION','TECNICO'), false);
$$;

-- ─── 4. Tablas que un rol restringido SÍ puede tocar ─────────────────────────────────────────────
--   · el soporte (`ticket*` y `tickets*`);
--   · su propio perfil, los roles y los centros: los lee `getProfile()` al iniciar sesión;
--   · el logo de la empresa (pantalla de login).
-- Todo lo demás queda cerrado para ellos.
CREATE OR REPLACE FUNCTION public.tabla_permitida_a_rol_restringido(p_tabla text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_tabla LIKE 'ticket%'
      OR p_tabla IN ('user_profiles', 'roles', 'operational_centers', 'company_settings');
$$;

-- Crea (o reemplaza) la política restrictiva de UNA tabla. Sirve para las de hoy y para las que se creen después.
CREATE OR REPLACE FUNCTION public.aplicar_politica_rol_restringido(p_tabla text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.tabla_permitida_a_rol_restringido(p_tabla) THEN
    RETURN; -- el soporte y el perfil propio se rigen por sus políticas normales
  END IF;
  EXECUTE format('DROP POLICY IF EXISTS zz_rol_restringido ON public.%I', p_tabla);
  EXECUTE format(
    'CREATE POLICY zz_rol_restringido ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (NOT public.es_rol_restringido()) WITH CHECK (NOT public.es_rol_restringido())',
    p_tabla
  );
END;
$$;

-- Las tablas con RLS que todavía no tienen la política (para verificarlo en CI / en la prueba de humo).
CREATE OR REPLACE FUNCTION public.tablas_sin_politica_rol_restringido()
RETURNS TABLE (tabla text)
LANGUAGE sql
STABLE
AS $$
  SELECT c.relname::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relkind = 'r'
     AND c.relrowsecurity
     AND NOT public.tabla_permitida_a_rol_restringido(c.relname::text)
     AND NOT EXISTS (
       SELECT 1 FROM pg_policies p
        WHERE p.schemaname = 'public' AND p.tablename = c.relname AND p.policyname = 'zz_rol_restringido'
     )
   ORDER BY 1;
$$;

-- Tablas de public SIN RLS: PostgREST las expone a cualquier usuario autenticado sin más filtro. Debería devolver 0 filas
-- (salvo las que se decidan públicas a propósito). Es una comprobación, no cambia nada.
CREATE OR REPLACE FUNCTION public.tablas_publicas_sin_rls()
RETURNS TABLE (tabla text)
LANGUAGE sql
STABLE
AS $$
  SELECT c.relname::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
   ORDER BY 1;
$$;

-- ─── 5. Aplicarla a todas las tablas de hoy ──────────────────────────────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOR t IN
    SELECT c.relname::text
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
  LOOP
    PERFORM public.aplicar_politica_rol_restringido(t);
  END LOOP;
END;
$$;
