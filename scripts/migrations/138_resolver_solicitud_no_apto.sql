-- ============================================================
-- Migración 138: avalar o rechazar una solicitud de NO APTO en una sola operación de la base
--
-- Problema: `resolverSolicitudNoApto` (solicitudes-no-apto.ts) hacía tres escrituras sueltas con la sesión de quien
-- resuelve: la solicitud, el estado del vehículo y el historial. La RLS deja resolver la solicitud a ADMIN,
-- COORDINACION y MANTENIMIENTO (113/117), pero:
--   · `update_vehicles` (126) solo admite ADMIN, ANALISTA y REGULACION, y
--   · `vsh_insert` (010/047) solo admite ADMIN, REGULACION, MANTENIMIENTO y ANALISTA.
-- Cuando avalaba Coordinación (o Mantenimiento, en el caso del vehículo), la solicitud quedaba AVALADA, pero el
-- UPDATE del vehículo afectaba 0 filas SIN error (la RLS filtra, no rechaza): el vehículo seguía OPERATIVO y, al dejar
-- de estar la solicitud PENDIENTE, también desaparecía el bloqueo de `tieneNoAptoPendiente`.
--
-- Solución: una función SECURITY DEFINER que valida el rol y el centro dentro de la base y hace las tres escrituras en
-- la misma transacción (o todas o ninguna). Las reglas son las mismas de `puedeResolver` y `validarDecision`
-- (src/lib/solicitud-no-apto.ts): ADMIN y MANTENIMIENTO resuelven todas; COORDINACION solo las de su centro; rechazar
-- exige una nota de al menos 5 caracteres.
--
-- Para que la función sea el ÚNICO camino se elimina la política `no_apto_update` (117): con ella, cualquier
-- COORDINACION (de cualquier centro) o MANTENIMIENTO podía actualizar la tabla directo por la API (PATCH) con
-- estado = 'AVALADA' y reproducir el mismo estado inconsistente (solicitud avalada, vehículo operativo, bloqueo
-- levantado) saltándose además la regla de centro. Sin política de UPDATE nadie puede hacerlo por RLS; la función
-- escribe como dueña de la tabla. Nada más en el repo actualiza esta tabla (src/ solo la lee o inserta).
--
-- Devuelve jsonb: {"ok": true, "vehicle_id": ...} o {"error": "..."} para los casos esperados de negocio.
-- Idempotente (CREATE OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================

CREATE OR REPLACE FUNCTION public.resolver_solicitud_no_apto(p_id bigint, p_decision text, p_nota text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid      uuid    := auth.uid();
  v_rol      text    := (SELECT get_user_role());
  v_centro   integer := (SELECT get_user_center());
  v_nota     text    := nullif(btrim(coalesce(p_nota, '')), '');
  v_aval     boolean;
  v_sol      vehicle_no_apto_solicitudes%ROWTYPE;
  v_veh      vehicles%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR v_rol IS NULL OR v_rol NOT IN ('ADMIN', 'COORDINACION', 'MANTENIMIENTO') THEN
    RETURN jsonb_build_object('error', 'No tienes permiso para resolver solicitudes de NO APTO.');
  END IF;

  IF p_decision IS NULL OR p_decision NOT IN ('AVALAR', 'RECHAZAR') THEN
    RETURN jsonb_build_object('error', 'Decisión inválida.');
  END IF;
  v_aval := (p_decision = 'AVALAR');

  IF NOT v_aval AND coalesce(length(v_nota), 0) < 5 THEN
    RETURN jsonb_build_object('error', 'Explica por qué rechazas la solicitud (mínimo 5 caracteres).');
  END IF;

  -- Bloquea la solicitud para que dos revisores no la resuelvan a la vez.
  SELECT * INTO v_sol FROM vehicle_no_apto_solicitudes WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No encontramos la solicitud.');
  END IF;
  IF v_sol.estado <> 'PENDIENTE' THEN
    RETURN jsonb_build_object('error', 'Esta solicitud ya fue resuelta.');
  END IF;

  SELECT * INTO v_veh FROM vehicles WHERE id = v_sol.vehicle_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'No encontramos el vehículo de la solicitud.');
  END IF;

  -- Coordinación solo resuelve las de su centro (igual que `puedeResolver`: sin centro, o vehículo sin centro, no pasa).
  IF v_rol = 'COORDINACION' AND (v_centro IS NULL OR v_veh.centro_operativo_id IS DISTINCT FROM v_centro) THEN
    RETURN jsonb_build_object('error', 'Solo puedes resolver las solicitudes de tu centro.');
  END IF;

  UPDATE vehicle_no_apto_solicitudes
     SET estado        = CASE WHEN v_aval THEN 'AVALADA' ELSE 'RECHAZADA' END,
         revisado_por  = v_uid,
         revisado_at   = now(),
         nota_revision = v_nota
   WHERE id = p_id;

  -- Avalar deja el vehículo FUERA_DE_SERVICIO, con fecha e historial (igual que el cambio manual de Regulación).
  IF v_aval AND v_veh.estado_actual IS DISTINCT FROM 'FUERA_DE_SERVICIO' THEN
    UPDATE vehicles
       SET estado_actual = 'FUERA_DE_SERVICIO',
           fds_desde     = public.hoy_bogota(),
           updated_at    = now()
     WHERE id = v_veh.id;

    INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, registrado_por, fecha_cambio, notas)
    VALUES (
      v_veh.id,
      'FUERA_DE_SERVICIO',
      CASE WHEN v_veh.estado_actual IN ('OPERATIVO', 'FUERA_DE_SERVICIO') THEN v_veh.estado_actual ELSE NULL END,
      v_uid,
      now(),
      'NO APTO avalado' || CASE WHEN v_nota IS NOT NULL THEN ': ' || v_nota ELSE '' END
    );
  END IF;

  RETURN jsonb_build_object('ok', true, 'vehicle_id', v_veh.id);
END;
$$;

-- Solo usuarios con sesión; la validación de rol y centro ya está dentro de la función.
REVOKE ALL ON FUNCTION public.resolver_solicitud_no_apto(bigint, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolver_solicitud_no_apto(bigint, text, text) TO authenticated, service_role;

-- La función es el único camino para resolver (ver la cabecera).
DROP POLICY IF EXISTS no_apto_update ON vehicle_no_apto_solicitudes;
