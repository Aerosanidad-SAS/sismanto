-- 089 · Costos anuales por vehículo con vigencia (SOAT, póliza, RTM) y función única de costos. Idempotente.
--
-- Problema: SOAT y póliza eran UNA cifra por vehículo (`vehicles.costo_soat_anual`, `costo_poliza_anual`), sin fecha de
-- pago ni historial: renovar era sobrescribir y el costo de hoy se aplicaba a cualquier periodo pasado. La RTM era una
-- tarifa por año igual para toda la flota (`rtm_historico`). Y el cálculo de costos vivía duplicado en TypeScript
-- (dashboard y KPIs), con la zona horaria del servidor de por medio.
--
-- Diseño:
--   · `vehicle_annual_costs`: una fila por vehículo, tipo (SOAT | POLIZA | RTM) y VIGENCIA, con valor, fecha de pago,
--     aseguradora y número de documento. Las vigencias de un mismo vehículo y tipo no pueden solaparse (así un costo no se
--     cuenta dos veces). `estimado` marca lo rellenado desde los datos viejos hasta que alguien cargue el real.
--   · Criterio de costo (devengo): el valor se reparte en partes iguales por día de su vigencia; el costo de un periodo es
--     la parte que cae dentro de él (`costo_devengado`). Renovar = insertar otra fila; el pasado no cambia.
--   · `costos_por_vehiculo(...)`: la ÚNICA implementación del costo por vehículo (mantenimiento + combustible + costos
--     anuales). Usa aritmética de DATE, así que da lo mismo en local y en Vercel, y agrega en la base (sin el límite de
--     1000 filas de la API). SECURITY INVOKER: aplica el RLS de quien la llama.
--   · Lo que ya existía queda intacto: `vehicles.costo_*_anual` y `rtm_historico` no se tocan ni se borran.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS vehicle_annual_costs (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('SOAT', 'POLIZA', 'RTM')),
  vigencia_desde DATE NOT NULL,
  vigencia_hasta DATE NOT NULL,
  valor NUMERIC(14, 2) NOT NULL CHECK (valor >= 0),
  fecha_pago DATE,
  proveedor VARCHAR(150),
  numero_documento VARCHAR(80),
  estimado BOOLEAN NOT NULL DEFAULT FALSE,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT vac_vigencia_valida CHECK (vigencia_hasta >= vigencia_desde),
  CONSTRAINT vac_sin_solape EXCLUDE USING gist (
    vehicle_id WITH =,
    tipo WITH =,
    daterange(vigencia_desde, vigencia_hasta, '[]') WITH &&
  )
);

CREATE INDEX IF NOT EXISTS idx_vac_vehiculo ON vehicle_annual_costs (vehicle_id, tipo, vigencia_desde);

ALTER TABLE vehicle_annual_costs ENABLE ROW LEVEL SECURITY;

-- Lectura: los mismos roles que ya ven los mantenimientos (+ COORDINACION, que lee la flota desde la 084).
DROP POLICY IF EXISTS vac_select ON vehicle_annual_costs;
CREATE POLICY vac_select ON vehicle_annual_costs
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'MANTENIMIENTO', 'COORDINACION'));

DROP POLICY IF EXISTS vac_insert ON vehicle_annual_costs;
CREATE POLICY vac_insert ON vehicle_annual_costs
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO'));

DROP POLICY IF EXISTS vac_update ON vehicle_annual_costs;
CREATE POLICY vac_update ON vehicle_annual_costs
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO'))
  WITH CHECK (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO'));

-- Borrar: solo ADMIN (misma decisión que 054 para los mantenimientos).
DROP POLICY IF EXISTS vac_delete ON vehicle_annual_costs;
CREATE POLICY vac_delete ON vehicle_annual_costs
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('vehicle_annual_costs');
  END IF;
END;
$$;

-- ─── Relleno inicial desde lo que ya se conocía (marcado `estimado`) ─────────────────────────────────────────────
-- Se reproduce lo que el sistema calculaba hasta hoy, pero explícito y editable: por cada año calendario desde 2024
-- (inicio del historial real) hasta el año en curso, una fila de vigencia 1 ene–31 dic.
--   · SOAT y póliza: el valor anual actual del vehículo (no se conocen los de años anteriores).
--   · RTM: la tarifa de ese año en `rtm_historico` (el mismo valor para todos los vehículos).
-- Solo se inserta donde no haya ya una vigencia que se solape, así que volver a correrla no duplica nada ni pisa lo real.
INSERT INTO vehicle_annual_costs (vehicle_id, tipo, vigencia_desde, vigencia_hasta, valor, estimado, notas)
SELECT v.id, t.tipo, make_date(y.anio, 1, 1), make_date(y.anio, 12, 31), t.valor, TRUE,
       'Relleno 089: valor anual vigente del vehículo repetido por año; reemplazar por el real'
  FROM vehicles v
 CROSS JOIN LATERAL (VALUES ('SOAT', v.costo_soat_anual), ('POLIZA', v.costo_poliza_anual)) AS t(tipo, valor)
 CROSS JOIN generate_series(2024, EXTRACT(YEAR FROM (NOW() AT TIME ZONE 'America/Bogota'))::int) AS y(anio)
 WHERE t.valor IS NOT NULL AND t.valor > 0
   AND NOT EXISTS (
     SELECT 1 FROM vehicle_annual_costs c
      WHERE c.vehicle_id = v.id AND c.tipo = t.tipo
        AND daterange(c.vigencia_desde, c.vigencia_hasta, '[]') && daterange(make_date(y.anio, 1, 1), make_date(y.anio, 12, 31), '[]')
   );

INSERT INTO vehicle_annual_costs (vehicle_id, tipo, vigencia_desde, vigencia_hasta, valor, estimado, notas)
SELECT v.id, 'RTM', make_date(r.anio, 1, 1), make_date(r.anio, 12, 31), r.valor, TRUE,
       'Relleno 089: tarifa de rtm_historico para el año; reemplazar por el pago real'
  FROM vehicles v
 CROSS JOIN rtm_historico r
 WHERE r.anio >= 2024 AND r.valor > 0
   AND NOT EXISTS (
     SELECT 1 FROM vehicle_annual_costs c
      WHERE c.vehicle_id = v.id AND c.tipo = 'RTM'
        AND daterange(c.vigencia_desde, c.vigencia_hasta, '[]') && daterange(make_date(r.anio, 1, 1), make_date(r.anio, 12, 31), '[]')
   );

-- ─── Funciones ───────────────────────────────────────────────────────────────────────────────────────────────────
-- Parte de `p_valor` que cae en el periodo [p_desde, p_hasta], repartiendo el valor por día de su vigencia. Pura (sin
-- tablas): se puede comprobar con SELECT y literales, y tiene su gemela en src/lib/costos-fijos.ts.
CREATE OR REPLACE FUNCTION public.costo_devengado(
  p_valor NUMERIC, p_vigencia_desde DATE, p_vigencia_hasta DATE, p_desde DATE, p_hasta DATE
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN p_valor IS NULL OR p_vigencia_hasta < p_vigencia_desde THEN 0
    ELSE p_valor
         * GREATEST(0, LEAST(p_hasta, p_vigencia_hasta) - GREATEST(p_desde, p_vigencia_desde) + 1)::NUMERIC
         / (p_vigencia_hasta - p_vigencia_desde + 1)::NUMERIC
  END;
$$;

-- Costo por vehículo en [p_desde, p_hasta] (ambos incluidos): mantenimiento + combustible + costos anuales.
--   p_tipo             AMBOS | PREVENTIVO | CORRECTIVO (solo filtra el mantenimiento; combustible y anuales siempre cuentan).
--   p_placas           coincidencia exacta; p_placa_fragmento, parcial. Ambos opcionales.
--   p_texto            coincidencia parcial en trabajo, categoría o ítem del mantenimiento.
--   p_excluir_placas   placas ya normalizadas (A–Z y 0–9) que no cuentan (vehículos de referencia).
CREATE OR REPLACE FUNCTION public.costos_por_vehiculo(
  p_desde DATE,
  p_hasta DATE,
  p_tipo TEXT DEFAULT 'AMBOS',
  p_centro_id INTEGER DEFAULT NULL,
  p_placas TEXT[] DEFAULT NULL,
  p_placa_fragmento TEXT DEFAULT NULL,
  p_texto TEXT DEFAULT NULL,
  p_excluir_placas TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (
  vehicle_id UUID,
  placa TEXT,
  marca TEXT,
  centro_operativo TEXT,
  costo_preventivo NUMERIC,
  costo_correctivo NUMERIC,
  costo_combustible NUMERIC,
  costo_fijo NUMERIC,
  costo_mantenimiento NUMERIC,
  costo_total NUMERIC,
  cantidad_mantenimientos INTEGER,
  cantidad_preventivo INTEGER,
  cantidad_correctivo INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
#variable_conflict use_column
DECLARE
  v_q TEXT;
BEGIN
  IF p_desde IS NULL OR p_hasta IS NULL THEN
    RAISE EXCEPTION 'p_desde y p_hasta son obligatorios';
  END IF;
  IF p_hasta < p_desde THEN
    RAISE EXCEPTION 'p_hasta (%) es anterior a p_desde (%)', p_hasta, p_desde;
  END IF;
  IF p_tipo NOT IN ('AMBOS', 'PREVENTIVO', 'CORRECTIVO') THEN
    RAISE EXCEPTION 'p_tipo debe ser AMBOS, PREVENTIVO o CORRECTIVO (llegó %)', p_tipo;
  END IF;

  v_q := NULLIF(btrim(COALESCE(p_texto, '')), '');
  IF v_q IS NOT NULL THEN
    v_q := '%' || replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%';
  END IF;

  RETURN QUERY
  WITH v AS (
    SELECT ve.id, ve.placa::TEXT AS placa, ve.marca::TEXT AS marca, ve.centro_operativo::TEXT AS centro_operativo
      FROM vehicles ve
     WHERE regexp_replace(upper(btrim(ve.placa)), '[^A-Z0-9]', '', 'g') <> ALL (COALESCE(p_excluir_placas, ARRAY[]::TEXT[]))
       AND (p_centro_id IS NULL OR ve.centro_operativo_id = p_centro_id)
       AND (p_placas IS NULL OR cardinality(p_placas) = 0
            OR regexp_replace(upper(btrim(ve.placa)), '[^A-Z0-9]', '', 'g') = ANY (p_placas))
       AND (NULLIF(btrim(COALESCE(p_placa_fragmento, '')), '') IS NULL
            OR upper(ve.placa) LIKE '%' || upper(btrim(p_placa_fragmento)) || '%')
  ),
  m AS (
    SELECT mr.vehicle_id,
           SUM(mr.valor) FILTER (WHERE mr.tipo::TEXT = 'PREVENTIVO') AS preventivo,
           SUM(mr.valor) FILTER (WHERE mr.tipo::TEXT <> 'PREVENTIVO') AS correctivo,
           COUNT(*) FILTER (WHERE mr.tipo::TEXT = 'PREVENTIVO') AS n_prev,
           COUNT(*) FILTER (WHERE mr.tipo::TEXT <> 'PREVENTIVO') AS n_corr
      FROM maintenance_records mr
     WHERE mr.fecha BETWEEN p_desde AND p_hasta
       AND (p_tipo = 'AMBOS' OR mr.tipo::TEXT = p_tipo)
       AND (v_q IS NULL
            OR mr.descripcion_trabajo ILIKE v_q
            OR EXISTS (SELECT 1 FROM maintenance_categories mc WHERE mc.id = mr.categoria_id AND mc.nombre ILIKE v_q)
            OR EXISTS (SELECT 1 FROM maintenance_items mi WHERE mi.maintenance_record_id = mr.id_manto AND mi.descripcion ILIKE v_q))
     GROUP BY mr.vehicle_id
  ),
  f AS (
    SELECT fl.vehicle_id, SUM(fl.costo) AS combustible
      FROM fuel_logs fl
     WHERE fl.fecha BETWEEN p_desde AND p_hasta
     GROUP BY fl.vehicle_id
  ),
  a AS (
    SELECT c.vehicle_id,
           SUM(public.costo_devengado(c.valor, c.vigencia_desde, c.vigencia_hasta, p_desde, p_hasta)) AS fijo
      FROM vehicle_annual_costs c
     WHERE c.vigencia_desde <= p_hasta AND c.vigencia_hasta >= p_desde
     GROUP BY c.vehicle_id
  )
  SELECT v.id,
         v.placa,
         v.marca,
         v.centro_operativo,
         COALESCE(m.preventivo, 0),
         COALESCE(m.correctivo, 0),
         COALESCE(f.combustible, 0),
         COALESCE(a.fijo, 0),
         COALESCE(m.preventivo, 0) + COALESCE(m.correctivo, 0),
         COALESCE(m.preventivo, 0) + COALESCE(m.correctivo, 0) + COALESCE(f.combustible, 0) + COALESCE(a.fijo, 0),
         (COALESCE(m.n_prev, 0) + COALESCE(m.n_corr, 0))::INTEGER,
         COALESCE(m.n_prev, 0)::INTEGER,
         COALESCE(m.n_corr, 0)::INTEGER
    FROM v
    LEFT JOIN m ON m.vehicle_id = v.id
    LEFT JOIN f ON f.vehicle_id = v.id
    LEFT JOIN a ON a.vehicle_id = v.id
   ORDER BY 10 DESC, v.placa;
END;
$$;

REVOKE ALL ON FUNCTION public.costo_devengado(NUMERIC, DATE, DATE, DATE, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.costo_devengado(NUMERIC, DATE, DATE, DATE, DATE) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.costos_por_vehiculo(DATE, DATE, TEXT, INTEGER, TEXT[], TEXT, TEXT, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.costos_por_vehiculo(DATE, DATE, TEXT, INTEGER, TEXT[], TEXT, TEXT, TEXT[]) TO authenticated, service_role;

-- ─── Registro de un costo real ───────────────────────────────────────────────────────────────────────────────────
-- Registra un SOAT, póliza o RTM real y, en el mismo paso, recorta los valores ESTIMADOS (relleno de esta migración) que
-- se solapan con su vigencia, conservando la tarifa diaria de cada trozo que sobrevive: así el total del periodo no se
-- infla ni se duplica. Un valor REAL que se solape se rechaza con un mensaje claro (nunca se pisa lo que alguien cargó).
-- SECURITY DEFINER porque recortar estimados implica borrar filas y el borrado directo es solo de ADMIN; el permiso
-- de quien llama se comprueba dentro (mismos roles que pueden insertar).
CREATE OR REPLACE FUNCTION public.registrar_costo_anual(
  p_vehicle_id UUID,
  p_tipo TEXT,
  p_desde DATE,
  p_hasta DATE,
  p_valor NUMERIC,
  p_fecha_pago DATE DEFAULT NULL,
  p_proveedor TEXT DEFAULT NULL,
  p_numero_documento TEXT DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_id BIGINT;
  v_real RECORD;
  r RECORD;
  v_tasa NUMERIC;
BEGIN
  IF get_user_role() IS NULL OR get_user_role() NOT IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO') THEN
    RAISE EXCEPTION 'No tienes permiso para registrar costos anuales' USING ERRCODE = '42501';
  END IF;
  IF p_tipo NOT IN ('SOAT', 'POLIZA', 'RTM') THEN
    RAISE EXCEPTION 'El tipo debe ser SOAT, POLIZA o RTM (llegó %)', p_tipo;
  END IF;
  IF p_desde IS NULL OR p_hasta IS NULL OR p_hasta < p_desde THEN
    RAISE EXCEPTION 'La vigencia es inválida: el fin no puede ser anterior al inicio';
  END IF;
  IF p_valor IS NULL OR p_valor < 0 THEN
    RAISE EXCEPTION 'El valor debe ser mayor o igual a cero';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vehicles WHERE id = p_vehicle_id) THEN
    RAISE EXCEPTION 'El vehículo no existe';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_vehicle_id::text || ':' || p_tipo));

  SELECT c.vigencia_desde, c.vigencia_hasta INTO v_real
    FROM vehicle_annual_costs c
   WHERE c.vehicle_id = p_vehicle_id AND c.tipo = p_tipo AND NOT c.estimado
     AND daterange(c.vigencia_desde, c.vigencia_hasta, '[]') && daterange(p_desde, p_hasta, '[]')
   LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'Ya hay un % registrado del % al % que se solapa con esas fechas',
      p_tipo, to_char(v_real.vigencia_desde, 'DD/MM/YYYY'), to_char(v_real.vigencia_hasta, 'DD/MM/YYYY');
  END IF;

  FOR r IN
    SELECT * FROM vehicle_annual_costs c
     WHERE c.vehicle_id = p_vehicle_id AND c.tipo = p_tipo AND c.estimado
       AND daterange(c.vigencia_desde, c.vigencia_hasta, '[]') && daterange(p_desde, p_hasta, '[]')
     ORDER BY c.vigencia_desde
  LOOP
    v_tasa := r.valor / (r.vigencia_hasta - r.vigencia_desde + 1);
    DELETE FROM vehicle_annual_costs WHERE id = r.id;
    IF r.vigencia_desde < p_desde THEN
      INSERT INTO vehicle_annual_costs (vehicle_id, tipo, vigencia_desde, vigencia_hasta, valor, estimado, notas, created_by)
      VALUES (r.vehicle_id, r.tipo, r.vigencia_desde, p_desde - 1,
              round(v_tasa * (p_desde - r.vigencia_desde), 2), TRUE, r.notas, r.created_by);
    END IF;
    IF r.vigencia_hasta > p_hasta THEN
      INSERT INTO vehicle_annual_costs (vehicle_id, tipo, vigencia_desde, vigencia_hasta, valor, estimado, notas, created_by)
      VALUES (r.vehicle_id, r.tipo, p_hasta + 1, r.vigencia_hasta,
              round(v_tasa * (r.vigencia_hasta - p_hasta), 2), TRUE, r.notas, r.created_by);
    END IF;
  END LOOP;

  INSERT INTO vehicle_annual_costs
    (vehicle_id, tipo, vigencia_desde, vigencia_hasta, valor, fecha_pago, proveedor, numero_documento, notas, estimado, created_by)
  VALUES
    (p_vehicle_id, p_tipo, p_desde, p_hasta, p_valor, p_fecha_pago,
     NULLIF(btrim(COALESCE(p_proveedor, '')), ''), NULLIF(btrim(COALESCE(p_numero_documento, '')), ''),
     NULLIF(btrim(COALESCE(p_notas, '')), ''), FALSE, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_costo_anual(UUID, TEXT, DATE, DATE, NUMERIC, DATE, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_costo_anual(UUID, TEXT, DATE, DATE, NUMERIC, DATE, TEXT, TEXT, TEXT) TO authenticated;
