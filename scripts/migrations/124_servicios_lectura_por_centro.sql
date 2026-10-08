-- ============================================================
-- Migración 124: Regulación y Coordinación solo leen los servicios de su centro (paridad con SISRES, SEC-01)
-- PARIDAD_REGULACION.md: SEC-01 «No ver servicios de otro centro, ni siquiera cambiando la URL».
--
-- Hasta hoy el recorte por centro estaba SOLO en la aplicación (`centroVisible` + `aplicarFiltrosServicios`): la política
-- de lectura de `medical_services` dejaba a REGULACION y COORDINACION leer los servicios de cualquier centro, así que
-- cualquiera de ellos, llamando a la API con su sesión, veía los del otro centro.
--
-- Cambio: la misma regla de la aplicación, ahora en la base. REGULACION y COORDINACION leen un servicio si:
--   · no tienen centro asignado (igual que la app: sin centro, ven todo), o
--   · el servicio no tiene centro (el histórico cargado de SISRES; la app también lo muestra a todos), o
--   · el servicio es de su mismo centro (`operational_center_id = get_user_center()`).
-- Los demás roles y las ramas de OVEM / MEDICO / AUXILIAR_ENFERMERIA quedan idénticas a la 087. Como UPDATE y DELETE con
-- WHERE también pasan por la política de lectura, esto cierra además el cambio y el borrado cruzados.
--
-- OJO, alcance real: al momento de escribir esto, 41.514 de 41.523 servicios NO tienen centro (el histórico), y esos
-- siguen visibles para todos los centros. Para recortar también el histórico hay que asignarle centro (p. ej. según su
-- `ciudad_registro`): es una decisión de negocio aparte, no se hace aquí.
--
-- No destructiva, idempotente. Rollback: recrear la política de la 087.
-- ============================================================

DROP POLICY IF EXISTS medical_services_select ON medical_services;
CREATE POLICY medical_services_select ON medical_services
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','VISTA','GERENCIAL')
    OR (
      (SELECT get_user_role()) IN ('REGULACION','COORDINACION')
      AND (
        (SELECT get_user_center()) IS NULL
        OR operational_center_id IS NULL
        OR operational_center_id = (SELECT get_user_center())
      )
    )
    OR ((SELECT get_user_role()) = 'OVEM' AND ovem_user_id = (SELECT auth.uid()))
    OR ((SELECT get_user_role()) = 'MEDICO' AND medico_user_id = (SELECT auth.uid()))
    OR ((SELECT get_user_role()) = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = (SELECT auth.uid()))
  );
