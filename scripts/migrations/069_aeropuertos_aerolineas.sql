-- 069 · Catálogos de aeropuertos y aerolíneas (V4 del plan docs/PARIDAD_VALORACIONES.md; SISRES: tablas
-- `aeropuertos` (dataset OurAirports, ~85.818 filas) y `aerolineas` (~50 filas)).
-- Sirven a Valoraciones (aerolínea, origen, destino) y a la futura Captación aeroportuaria.
-- Idempotente. La carga real la hace scripts/etl-sisres.ts (aeropuertos.csv / aerolineas.csv).

CREATE TABLE IF NOT EXISTS airlines (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  sisres_id INTEGER UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS airports (
  id SERIAL PRIMARY KEY,
  sisres_id INTEGER UNIQUE,
  ident VARCHAR(10),
  tipo VARCHAR(30),
  nombre VARCHAR(200) NOT NULL,
  municipio VARCHAR(150),
  pais VARCHAR(5),
  region VARCHAR(10),
  iata_code VARCHAR(10),
  icao_code VARCHAR(10),
  servicio_regular BOOLEAN NOT NULL DEFAULT FALSE,
  latitud DOUBLE PRECISION,
  longitud DOUBLE PRECISION,
  elevacion_ft INTEGER
);

-- Búsqueda por país (filtro del listado) y por códigos (typeahead de vuelos).
CREATE INDEX IF NOT EXISTS idx_airports_pais ON airports(pais);
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_nombre ON airports(nombre);

ALTER TABLE airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario con rol (los combos de Valoraciones los ven ADMIN, MEDICO, ANALISTA y VISTA).
DROP POLICY IF EXISTS airlines_select ON airlines;
CREATE POLICY airlines_select ON airlines
  FOR SELECT TO authenticated
  USING (get_user_role() IS NOT NULL);

DROP POLICY IF EXISTS airports_select ON airports;
CREATE POLICY airports_select ON airports
  FOR SELECT TO authenticated
  USING (get_user_role() IS NOT NULL);

-- Escritura: aerolíneas las administra ADMIN/ANALISTA (en SISRES act_registrar/editar/eliminar_aerolinea).
-- Aeropuertos es un dataset de referencia de solo lectura (SISRES tampoco lo edita desde la app).
DROP POLICY IF EXISTS airlines_write ON airlines;
CREATE POLICY airlines_write ON airlines
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
