-- Migration 023: Normalizar placas en tabla vehicles
-- Elimina espacios de todos los valores de placa y borra duplicados lógicos.
-- Idempotente: usa ON CONFLICT y comprueba existencia antes de actuar.
--
-- CONTEXTO: Las placas fueron cargadas con espacios (ej. "TRG 542") en lugar
-- del formato canónico sin espacios ("TRG542"). Eso provoca que los JOINs
-- por placa fallen silenciosamente, incluyendo las migraciones 016/017.
-- El duplicado OKL227 / OKL 227 también se elimina aquí.

-- ─── 1. Eliminar duplicados ANTES de normalizar ────────────────────────────
-- Si existe una fila con placa sin espacio Y otra con espacio para la misma placa,
-- transferimos las FK hacia el id "sin espacio" (que puede ser el más reciente)
-- y eliminamos el duplicado.
DO $$
DECLARE
  v_con_espacio  UUID;
  v_sin_espacio  UUID;
  v_placa_norm   TEXT;
BEGIN
  -- Detectar pares duplicados: misma placa normalizada, distinto id
  FOR v_placa_norm, v_sin_espacio, v_con_espacio IN
    SELECT
      REGEXP_REPLACE(UPPER(a.placa), '\s+', '', 'g') AS placa_norm,
      b.id,  -- el que YA está normalizado (sin espacio)
      a.id   -- el que tiene espacio
    FROM vehicles a
    JOIN vehicles b
      ON REGEXP_REPLACE(UPPER(a.placa), '\s+', '', 'g')
       = REGEXP_REPLACE(UPPER(b.placa), '\s+', '', 'g')
     AND a.id <> b.id
     AND a.placa ~ '\s'          -- a tiene espacio
     AND b.placa !~ '\s'         -- b no tiene espacio (ya normalizado)
  LOOP
    RAISE NOTICE 'Duplicado detectado: % (con espacio) duplica a % (sin espacio). Eliminando %.',
      v_con_espacio, v_sin_espacio, v_con_espacio;

    -- Reasignar FKs que apuntan al id con espacio → al id normalizado
    UPDATE maintenance_records SET vehicle_id = v_sin_espacio WHERE vehicle_id = v_con_espacio;
    UPDATE incidents            SET vehicle_id = v_sin_espacio WHERE vehicle_id = v_con_espacio;
    UPDATE fuel_logs            SET vehicle_id = v_sin_espacio WHERE vehicle_id = v_con_espacio;
    UPDATE mileage_logs         SET vehicle_id = v_sin_espacio WHERE vehicle_id = v_con_espacio;
    UPDATE vehicle_assignments  SET vehicle_id = v_sin_espacio WHERE vehicle_id = v_con_espacio;
    UPDATE vehicle_status_history SET vehicle_id = v_sin_espacio WHERE vehicle_id = v_con_espacio;
    UPDATE vehicle_service_revenue SET vehicle_id = v_sin_espacio WHERE vehicle_id = v_con_espacio;

    -- Eliminar el duplicado con espacio
    DELETE FROM vehicles WHERE id = v_con_espacio;
  END LOOP;
END $$;

-- ─── 2. Normalizar placas restantes (quitar espacios) ──────────────────────
UPDATE vehicles
SET placa = REGEXP_REPLACE(UPPER(placa), '\s+', '', 'g')
WHERE placa ~ '\s';

-- ─── 3. Verificación ───────────────────────────────────────────────────────
DO $$
DECLARE
  cnt_espacios  INTEGER;
  cnt_dup       INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt_espacios FROM vehicles WHERE placa ~ '\s';
  SELECT COUNT(*) INTO cnt_dup
  FROM (
    SELECT UPPER(placa), COUNT(*) FROM vehicles GROUP BY UPPER(placa) HAVING COUNT(*) > 1
  ) t;

  IF cnt_espacios > 0 THEN
    RAISE WARNING 'Aún existen % placas con espacios.', cnt_espacios;
  ELSE
    RAISE NOTICE 'OK: ninguna placa con espacios.';
  END IF;

  IF cnt_dup > 0 THEN
    RAISE WARNING 'Aún existen % grupos de placas duplicadas.', cnt_dup;
  ELSE
    RAISE NOTICE 'OK: sin placas duplicadas.';
  END IF;
END $$;
