-- 128 · Corrección de lecturas de kilometraje por el ADMIN, en una sola transacción. Idempotente.
--
-- Por qué:
--   · El km de un vehículo solo avanza (trg_validar_km en mileage_logs, trg_mileage_logs_km_actual). Un número mal digitado
--     queda como tope y bloquea todas las lecturas siguientes (preoperacional, tanqueo, cierre de turno).
--   · Corregirlo desde la aplicación exige tocar mileage_logs, fuel_logs y daily_checks y recalcular vehicles.km_actual. Hacerlo en
--     llamadas separadas deja datos a medias si una falla, y además actualizar daily_checks dispara sync_mileage_from_daily_check,
--     cuyo INSERT en mileage_logs pasa por trg_validar_km (BEFORE INSERT, compara con la lectura de fecha más reciente) y se
--     rechaza si el día corregido no es el último.
--
-- Qué hace corregir_lectura_km(vehículo, fecha, km_actual, km_nuevo):
--   1. Solo ADMIN (get_user_role()), con la sesión del usuario: no se llama con la clave de servicio.
--   2. Bloquea la fila del vehículo (FOR UPDATE): dos correcciones o una corrección y un recálculo no se pisan.
--   3. Valida que km_nuevo encaje en la línea de tiempo sin contar las filas que se corrigen: no menor que la mayor lectura de DÍAS
--      ANTERIORES, no mayor que la menor de días posteriores. Dentro del mismo día no hay hora que ordene las lecturas: lo
--      ordenan trg_validar_km_daily (final >= inicial) y el recálculo del paso 5.
--   4. Cambia km_actual → km_nuevo en las filas de ESE vehículo y ESE día que repiten el valor (odómetro, tanqueos, preoperacional
--      inicial/final). El sync daily_checks → mileage_logs se salta durante la función (variable de transacción
--      app.correccion_km, ver el guard abajo): no se toma ningún bloqueo de tabla ni hace falta ser dueño de nada.
--   5. El odómetro del día queda en el mayor de las lecturas que sobreviven (no solo el valor corregido) y se recalcula
--      vehicles.km_actual / fecha_km_actual desde el odómetro (el trigger normal solo sube, por eso hace falta).
--   Devuelve cuántas filas se corrigieron. La auditoría (con el motivo) la escribe la aplicación después, fuera de la transacción:
--   si fallara, el cambio queda hecho y el error en el log del servidor. No toca ovem_cierres_turno.km_final (registro inmutable).
--   Límite conocido: el FOR UPDATE de vehicles no frena a un OVEM que inserte una lectura justo mientras corre la función.
-- NO se ha probado contra la base compartida: revisar y probar con ROLLBACK en staging antes de dar por buena (ver el bloque de prueba al final).

-- Guard: la corrección escribe el odómetro por sí misma; el sync no debe intentar un INSERT que toparía con trg_validar_km.
-- El resto de la función es idéntico al de la migración 060.
CREATE OR REPLACE FUNCTION sync_mileage_from_daily_check()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_km INTEGER := GREATEST(COALESCE(NEW.kilometraje_inicial, 0), COALESCE(NEW.kilometraje_final, 0));
BEGIN
  IF current_setting('app.correccion_km', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF v_km > 0 THEN
    INSERT INTO mileage_logs (vehicle_id, fecha, lectura_kilometraje)
    VALUES (NEW.vehicle_id, NEW.fecha, v_km)
    ON CONFLICT (vehicle_id, fecha)
    DO UPDATE SET lectura_kilometraje = GREATEST(mileage_logs.lectura_kilometraje, EXCLUDED.lectura_kilometraje);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION corregir_lectura_km(
  p_vehicle_id UUID,
  p_fecha      DATE,
  p_km_actual  INTEGER,
  p_km_nuevo   INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_filas    INTEGER := 0;
  v_n        INTEGER;
  v_inferior INTEGER;
  v_superior INTEGER;
  v_max_km   INTEGER;
  v_max_fecha DATE;
BEGIN
  IF get_user_role() IS DISTINCT FROM 'ADMIN' THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_km_nuevo IS NULL OR p_km_nuevo <= 0 OR p_km_nuevo > 2000000 THEN
    RAISE EXCEPTION 'El kilometraje nuevo debe estar entre 1 y 2.000.000';
  END IF;
  IF p_km_actual IS NULL OR p_km_actual <= 0 OR p_km_actual = p_km_nuevo THEN
    RAISE EXCEPTION 'El kilometraje nuevo debe ser distinto del actual';
  END IF;

  PERFORM 1 FROM vehicles WHERE id = p_vehicle_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehículo no encontrado';
  END IF;

  -- Lecturas que NO se corrigen: el resto de la línea de tiempo del vehículo.
  WITH otras AS (
    SELECT fecha, lectura_kilometraje AS km
      FROM mileage_logs
     WHERE vehicle_id = p_vehicle_id AND NOT (fecha = p_fecha AND lectura_kilometraje = p_km_actual)
    UNION ALL
    SELECT fecha, kilometraje
      FROM fuel_logs
     WHERE vehicle_id = p_vehicle_id AND NOT (fecha = p_fecha AND kilometraje = p_km_actual)
    UNION ALL
    SELECT fecha, kilometraje_inicial
      FROM daily_checks
     WHERE vehicle_id = p_vehicle_id AND kilometraje_inicial IS NOT NULL
       AND NOT (fecha = p_fecha AND kilometraje_inicial = p_km_actual)
    UNION ALL
    SELECT fecha, kilometraje_final
      FROM daily_checks
     WHERE vehicle_id = p_vehicle_id AND kilometraje_final IS NOT NULL
       AND NOT (fecha = p_fecha AND kilometraje_final = p_km_actual)
  )
  SELECT max(km) FILTER (WHERE fecha < p_fecha), min(km) FILTER (WHERE fecha > p_fecha)
    INTO v_inferior, v_superior
    FROM otras;

  IF v_inferior IS NOT NULL AND p_km_nuevo < v_inferior THEN
    RAISE EXCEPTION 'El kilometraje nuevo (%) no puede ser menor a la lectura de un día anterior (% km)', p_km_nuevo, v_inferior;
  END IF;
  IF v_superior IS NOT NULL AND p_km_nuevo > v_superior THEN
    RAISE EXCEPTION 'El kilometraje nuevo (%) no puede superar la lectura posterior registrada (% km)', p_km_nuevo, v_superior;
  END IF;

  -- El odómetro se escribe aquí; el sync desde daily_checks se salta mientras dure esta transacción (set_config local).
  PERFORM set_config('app.correccion_km', 'on', true);

  UPDATE mileage_logs
     SET lectura_kilometraje = p_km_nuevo
   WHERE vehicle_id = p_vehicle_id AND fecha = p_fecha AND lectura_kilometraje = p_km_actual;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_filas := v_filas + v_n;

  UPDATE fuel_logs
     SET kilometraje = p_km_nuevo
   WHERE vehicle_id = p_vehicle_id AND fecha = p_fecha AND kilometraje = p_km_actual;
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_filas := v_filas + v_n;

  -- Inicial y final en la misma sentencia: trg_validar_km_daily exige final >= inicial.
  UPDATE daily_checks
     SET kilometraje_inicial = CASE WHEN kilometraje_inicial = p_km_actual THEN p_km_nuevo ELSE kilometraje_inicial END,
         kilometraje_final   = CASE WHEN kilometraje_final   = p_km_actual THEN p_km_nuevo ELSE kilometraje_final   END
   WHERE vehicle_id = p_vehicle_id AND fecha = p_fecha
     AND (kilometraje_inicial = p_km_actual OR kilometraje_final = p_km_actual);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  v_filas := v_filas + v_n;

  IF v_filas = 0 THEN
    RAISE EXCEPTION 'No se encontró ninguna lectura de % km el % para ese vehículo (¿ya la corrigió otra persona?)', p_km_actual, p_fecha;
  END IF;

  -- El odómetro del día no puede quedar por debajo de otra lectura del mismo día que sí sobrevive (p. ej. el km final).
  UPDATE mileage_logs m
     SET lectura_kilometraje = GREATEST(
           m.lectura_kilometraje,
           COALESCE((
             SELECT max(km) FROM (
               SELECT kilometraje_inicial AS km FROM daily_checks WHERE vehicle_id = p_vehicle_id AND fecha = p_fecha
               UNION ALL
               SELECT kilometraje_final FROM daily_checks WHERE vehicle_id = p_vehicle_id AND fecha = p_fecha
               UNION ALL
               SELECT kilometraje FROM fuel_logs WHERE vehicle_id = p_vehicle_id AND fecha = p_fecha
             ) dia
           ), 0)
         )
   WHERE m.vehicle_id = p_vehicle_id AND m.fecha = p_fecha;

  -- km_actual solo sube por trigger: se recalcula desde el odómetro para que baje si hacía falta.
  SELECT lectura_kilometraje, fecha INTO v_max_km, v_max_fecha
    FROM mileage_logs
   WHERE vehicle_id = p_vehicle_id
   ORDER BY lectura_kilometraje DESC, fecha DESC
   LIMIT 1;
  IF FOUND THEN
    UPDATE vehicles SET km_actual = v_max_km, fecha_km_actual = v_max_fecha WHERE id = p_vehicle_id;
  END IF;

  RETURN v_filas;
END;
$$;

REVOKE ALL ON FUNCTION corregir_lectura_km(UUID, DATE, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION corregir_lectura_km(UUID, DATE, INTEGER, INTEGER) TO authenticated;

-- Prueba sugerida en staging (nada queda guardado):
--   BEGIN;
--   SELECT set_config('request.jwt.claims', '{"sub":"<uuid de un ADMIN>","role":"authenticated"}', true);
--   SET LOCAL ROLE authenticated;
--   SELECT corregir_lectura_km('<vehicle_id>', '<fecha>', <km_equivocado>, <km_correcto>);
--   SELECT km_actual, fecha_km_actual FROM vehicles WHERE id = '<vehicle_id>';
--   ROLLBACK;

-- Rollback: DROP FUNCTION IF EXISTS corregir_lectura_km(UUID, DATE, INTEGER, INTEGER);
--           y volver a la definición de sync_mileage_from_daily_check() de la migración 060 (sin el guard).
