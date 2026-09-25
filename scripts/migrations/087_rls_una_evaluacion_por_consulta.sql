-- Migración 087: RLS evalúa el rol UNA vez por consulta, no una vez por fila.
--
-- Síntoma: con la carga de SISRES (41 mil servicios) la lista de Servicios falla con
-- "canceling statement due to statement timeout". `get_user_role()` y `es_rol_restringido()`
-- son SECURITY DEFINER y consultan user_profiles/roles; llamadas directas en una política se
-- ejecutan por cada fila (≈0,2 ms c/u): count(*) ≈ 9 s y la lista de opciones ≈ 15 s, contra un
-- statement_timeout de 8 s del rol `authenticated`.
--
-- Arreglo: envolver las llamadas en (SELECT ...). Postgres las trata como InitPlan (se evalúan
-- una sola vez por consulta). La lógica de quién ve qué NO cambia.
--
-- 1. medical_services_select: mismas reglas de la 053, con el rol/uid evaluados una vez.
-- 2. zz_rol_restringido (076): se redefine el generador y se reaplica a todas las tablas con RLS.
--
-- Idempotente. Sin DROP de datos ni cambio de tipos.

-- ─── 1. Lectura de servicios ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS medical_services_select ON medical_services;
CREATE POLICY medical_services_select ON medical_services
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','REGULACION','COORDINACION','ANALISTA','VISTA','GERENCIAL')
    OR ((SELECT get_user_role()) = 'OVEM' AND ovem_user_id = (SELECT auth.uid()))
    OR ((SELECT get_user_role()) = 'MEDICO' AND medico_user_id = (SELECT auth.uid()))
    OR ((SELECT get_user_role()) = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = (SELECT auth.uid()))
  );

-- ─── 2. Política restrictiva de roles restringidos, en todas las tablas ──────────────────────────
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
    'CREATE POLICY zz_rol_restringido ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (NOT (SELECT public.es_rol_restringido())) WITH CHECK (NOT (SELECT public.es_rol_restringido()))',
    p_tabla
  );
END;
$$;

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
