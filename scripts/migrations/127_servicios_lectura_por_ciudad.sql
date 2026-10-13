-- ============================================================
-- Migración 127: Regulación y Coordinación solo leen los servicios de su centro o de su ciudad (SEC-02, hallazgo H2 del QA)
--
-- La 124 recortó la lectura por centro, pero dejó visibles para todos los servicios SIN centro, y 41.514 de ~41.550 no lo
-- tienen (el histórico de SISRES). La aplicación ya lo resolvía (#266, `src/lib/servicios-centro.ts`): de los servicios sin
-- centro, solo los de la ciudad de registro del usuario. Pero quien llamaba a la API con su sesión seguía leyendo los de la
-- otra ciudad. Esta migración pone la MISMA regla en la base.
--
-- Regla (idéntica a `condicionServiciosDeCentro`). REGULACION y COORDINACION leen un servicio si:
--   · no tienen centro asignado (sin centro, ven todo, como hasta hoy), o
--   · el servicio es de su mismo centro (`operational_center_id = get_user_center()`), o
--   · el servicio no tiene centro Y:
--       - su centro no es de Bogotá ni de Medellín (AIRPLAN, CTG, ADO…): se conserva la regla anterior, ven los sin centro; o
--       - `ciudad_registro` empieza por el prefijo de la ciudad de su centro («bogot…» / «medell…», sin distinguir
--         mayúsculas). Un servicio sin ciudad de registro NO se ve (solo ADMIN, ANALISTA, VISTA y GERENCIAL).
-- Los demás roles y las ramas de OVEM / MEDICO / AUXILIAR_ENFERMERIA quedan idénticas a la 124.
-- UPDATE y DELETE con WHERE también pasan por esta política de lectura, así que cierra además el cambio cruzado.
--
-- Contar antes de aplicar (los que dejarán de verse para Regulación):
--   SELECT count(*) FROM medical_services WHERE operational_center_id IS NULL AND (ciudad_registro IS NULL OR btrim(ciudad_registro) = '');
--
-- No destructiva, idempotente. Rollback: recrear la política de la 124 y `DROP FUNCTION public.prefijo_ciudad_de_mi_centro()`.
-- ============================================================

-- Prefijo de la ciudad del centro del usuario actual. SECURITY DEFINER porque COORDINACION no puede leer
-- `operational_centers`; no recibe parámetros y solo devuelve una constante propia del llamante.
CREATE OR REPLACE FUNCTION public.prefijo_ciudad_de_mi_centro()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE oc.codigo
           WHEN 'CRA_BOGOTA'   THEN 'bogot'
           WHEN 'CRA_MEDELLIN' THEN 'medell'
         END
  FROM operational_centers oc
  WHERE oc.id = get_user_center();
$$;
REVOKE ALL ON FUNCTION public.prefijo_ciudad_de_mi_centro() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.prefijo_ciudad_de_mi_centro() TO authenticated, service_role;

DROP POLICY IF EXISTS medical_services_select ON medical_services;
CREATE POLICY medical_services_select ON medical_services
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','VISTA','GERENCIAL')
    OR (
      (SELECT get_user_role()) IN ('REGULACION','COORDINACION')
      AND (
        (SELECT get_user_center()) IS NULL
        OR operational_center_id = (SELECT get_user_center())
        OR (
          operational_center_id IS NULL
          AND (
            (SELECT prefijo_ciudad_de_mi_centro()) IS NULL
            OR ciudad_registro ILIKE (SELECT prefijo_ciudad_de_mi_centro()) || '%'
          )
        )
      )
    )
    OR ((SELECT get_user_role()) = 'OVEM' AND ovem_user_id = (SELECT auth.uid()))
    OR ((SELECT get_user_role()) = 'MEDICO' AND medico_user_id = (SELECT auth.uid()))
    OR ((SELECT get_user_role()) = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = (SELECT auth.uid()))
  );
