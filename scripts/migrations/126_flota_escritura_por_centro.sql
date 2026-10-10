-- ============================================================
-- Migración 126: Regulación y Coordinación solo leen y operan la flota de su centro (SEC-01, hallazgos C1/C2 del QA)
--
-- Hasta hoy el recorte por centro de `vehicles`, `vehicle_assignments` e `incidents` estaba SOLO en la aplicación
-- (`centroVisible` + `errorSiVehiculoDeOtroCentro`). En la base, REGULACION podía leer, actualizar y asignar tripulación
-- en vehículos de cualquier centro, y cambiar el centro de un vehículo, llamando a la API con su sesión.
-- Misma regla que la 124 (servicios), ahora para la flota. Un rol limitado a su centro accede a una fila si:
--   · no tiene centro asignado (igual que la app: sin centro, ve todo), o
--   · el vehículo no tiene centro (`centro_operativo_id` NULL), o
--   · el vehículo es de su mismo centro (`centro_operativo_id = get_user_center()`).
--
-- Qué cambia (el resto de roles y ramas queda IDÉNTICO a la 047/084):
--   vehicles             select_vehicles (REGULACION), update_vehicles (REGULACION; el WITH CHECK impide además
--                        pasar un vehículo a otro centro), coord_select_vehicles
--   vehicle_assignments  select / insert / update / delete (REGULACION), coord_select_vehicle_assignments
--   incidents            select / insert / update (REGULACION), coord_select_incidents
--
-- OJO (para quien revise):
--   1. Lectura incluida. Si alguna pantalla de Regulación hace JOIN a vehículos de otro centro (p. ej. un servicio
--      histórico sin centro que apunta a una placa de otro centro), esa placa dejará de resolverse. Probar en staging.
--   2. `asignarTripulacion` libera la asignación anterior de una persona al moverla (#257). Si esa asignación era de un
--      vehículo de OTRO centro, el UPDATE de liberación ya no pasa la RLS (0 filas, sin error). Caso raro; la app
--      debería avisar. Los vehículos sin centro y los usuarios sin centro no se ven afectados.
--   3. Antes de aplicar, correr el bloque «PRE-VUELO» del final: si hay vehículos con `centro_operativo_id` NULL o
--      desalineado con el enum `centro_operativo`, el recorte los dejará pasar (NULL) o los separará mal.
--
-- No destructiva, idempotente. Rollback: bloque al final (recrea las políticas tal como las dejaron la 047 y la 084).
-- ============================================================

-- ─── 0. Predicado único de la regla ─────────────────────────────────────────────────────────────
-- STABLE e INVOKER: lee `get_user_center()` (que ya es SECURITY DEFINER) y no toca tablas.
CREATE OR REPLACE FUNCTION public.centro_de_flota_visible(p_centro_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT (SELECT get_user_center()) IS NULL
      OR p_centro_id IS NULL
      OR p_centro_id = (SELECT get_user_center());
$$;
REVOKE ALL ON FUNCTION public.centro_de_flota_visible(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.centro_de_flota_visible(integer) TO authenticated, service_role;

-- ─── 1. vehicles ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS select_vehicles ON vehicles;
CREATE POLICY select_vehicles ON vehicles
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','GERENCIAL','MANTENIMIENTO','OVEM')
    OR ((SELECT get_user_role()) = 'REGULACION' AND centro_de_flota_visible(centro_operativo_id))
  );

DROP POLICY IF EXISTS update_vehicles ON vehicles;
CREATE POLICY update_vehicles ON vehicles
  FOR UPDATE TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA')
    OR ((SELECT get_user_role()) = 'REGULACION' AND centro_de_flota_visible(centro_operativo_id))
  )
  WITH CHECK (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA')
    OR ((SELECT get_user_role()) = 'REGULACION' AND centro_de_flota_visible(centro_operativo_id))
  );

DROP POLICY IF EXISTS coord_select_vehicles ON vehicles;
CREATE POLICY coord_select_vehicles ON vehicles
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) = 'COORDINACION' AND centro_de_flota_visible(centro_operativo_id));

-- ─── 2. vehicle_assignments (el centro lo da el vehículo) ───────────────────────────────────────
DROP POLICY IF EXISTS select_vehicle_assignments ON vehicle_assignments;
CREATE POLICY select_vehicle_assignments ON vehicle_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','GERENCIAL')
    OR ((SELECT get_user_role()) = 'OVEM' AND user_id = (SELECT auth.uid()))
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_assignments.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  );

DROP POLICY IF EXISTS insert_vehicle_assignments ON vehicle_assignments;
CREATE POLICY insert_vehicle_assignments ON vehicle_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA')
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_assignments.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
    OR (
      (SELECT get_user_role()) = 'OVEM'
      AND user_id = (SELECT auth.uid())
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_assignments.vehicle_id)
    )
  );

DROP POLICY IF EXISTS update_vehicle_assignments ON vehicle_assignments;
CREATE POLICY update_vehicle_assignments ON vehicle_assignments
  FOR UPDATE TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA')
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_assignments.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  )
  WITH CHECK (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA')
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_assignments.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  );

DROP POLICY IF EXISTS delete_vehicle_assignments ON vehicle_assignments;
CREATE POLICY delete_vehicle_assignments ON vehicle_assignments
  FOR DELETE TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA')
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = vehicle_assignments.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  );

DROP POLICY IF EXISTS coord_select_vehicle_assignments ON vehicle_assignments;
CREATE POLICY coord_select_vehicle_assignments ON vehicle_assignments
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) = 'COORDINACION'
    AND EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = vehicle_assignments.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
    )
  );

-- ─── 3. incidents (novedades; el centro lo da el vehículo) ──────────────────────────────────────
DROP POLICY IF EXISTS select_incidents ON incidents;
CREATE POLICY select_incidents ON incidents
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','GERENCIAL','MANTENIMIENTO')
    OR ((SELECT get_user_role()) = 'OVEM' AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = incidents.vehicle_id))
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = incidents.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  );

DROP POLICY IF EXISTS insert_incidents ON incidents;
CREATE POLICY insert_incidents ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','MANTENIMIENTO')
    OR ((SELECT get_user_role()) = 'OVEM' AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = incidents.vehicle_id))
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = incidents.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  );

DROP POLICY IF EXISTS update_incidents ON incidents;
CREATE POLICY update_incidents ON incidents
  FOR UPDATE TO authenticated
  USING (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','MANTENIMIENTO')
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = incidents.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  )
  WITH CHECK (
    (SELECT get_user_role()) IN ('ADMIN','ANALISTA','MANTENIMIENTO')
    OR (
      (SELECT get_user_role()) = 'REGULACION'
      AND EXISTS (
        SELECT 1 FROM vehicles v
        WHERE v.id = incidents.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
      )
    )
  );

DROP POLICY IF EXISTS coord_select_incidents ON incidents;
CREATE POLICY coord_select_incidents ON incidents
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role()) = 'COORDINACION'
    AND EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = incidents.vehicle_id AND centro_de_flota_visible(v.centro_operativo_id)
    )
  );

-- ============================================================
-- PRE-VUELO (solo lectura; correr ANTES de aplicar y comparar con el esperado)
--   -- Vehículos sin centro (el recorte los deja pasar a todos):
--   SELECT count(*) FROM vehicles WHERE centro_operativo_id IS NULL;
--   -- Vehículos cuyo id de centro no coincide con el enum que usa la app (`centro_operativo`):
--   SELECT v.placa, v.centro_operativo, oc.codigo
--     FROM vehicles v LEFT JOIN operational_centers oc ON oc.id = v.centro_operativo_id
--    WHERE v.centro_operativo IS DISTINCT FROM oc.codigo::text;
--   -- Políticas vigentes (deben coincidir con 047/084 antes de aplicar; si hay otras, ajustar este archivo):
--   SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies
--    WHERE tablename IN ('vehicles','vehicle_assignments','incidents') ORDER BY 1, 2;
--
-- PRUEBA (staging, dentro de BEGIN … ROLLBACK; sustituir <uuid_regulacion_con_centro> por un usuario real):
--   BEGIN;
--   SET LOCAL ROLE authenticated;
--   SELECT set_config('request.jwt.claims', '{"sub":"<uuid_regulacion_con_centro>","role":"authenticated"}', true);
--   SELECT count(*) FROM vehicles;                               -- solo su centro (+ vehículos sin centro)
--   UPDATE vehicles SET estado = estado WHERE centro_operativo_id <> get_user_center();   -- 0 filas
--   UPDATE vehicles SET centro_operativo_id = centro_operativo_id + 1
--    WHERE centro_operativo_id = get_user_center();             -- ERROR: viola la política (re-centrado bloqueado)
--   ROLLBACK;
--
-- ROLLBACK de esta migración (recrea lo que dejaron la 047 y la 084):
--   DROP FUNCTION IF EXISTS public.centro_de_flota_visible(integer);   -- solo después de recrear las políticas
--   select_vehicles: get_user_role() IN ('ADMIN','ANALISTA','GERENCIAL','REGULACION','MANTENIMIENTO','OVEM')
--   update_vehicles: USING y WITH CHECK get_user_role() IN ('ADMIN','ANALISTA','REGULACION')
--   coord_select_vehicles / coord_select_incidents / coord_select_vehicle_assignments: get_user_role() = 'COORDINACION'
--   select_vehicle_assignments: ADMIN/ANALISTA/GERENCIAL/REGULACION, u OVEM con user_id = auth.uid()
--   insert_vehicle_assignments: ADMIN/ANALISTA/REGULACION, u OVEM (user_id = auth.uid() y el vehículo existe)
--   update/delete_vehicle_assignments: get_user_role() IN ('ADMIN','ANALISTA','REGULACION')
--   select_incidents: ADMIN/ANALISTA/GERENCIAL/REGULACION/MANTENIMIENTO, u OVEM con el vehículo existente
--   insert_incidents: ADMIN/ANALISTA/REGULACION/MANTENIMIENTO, u OVEM con el vehículo existente
--   update_incidents: USING y WITH CHECK ADMIN/ANALISTA/REGULACION/MANTENIMIENTO
-- ============================================================
