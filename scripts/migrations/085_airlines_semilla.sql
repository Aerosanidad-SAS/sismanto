-- 085 · Semilla del catálogo de aerolíneas (las 50 de SISRES).

-- Por qué: `airlines` (migración 069) solo la llena el ETL de SISRES (`aerolineas.csv`). En una base sin ETL —staging
-- hoy— queda VACÍA y los selectores de aerolínea (Valoraciones y Captación aeroportuaria) no ofrecen nada. Igual que
-- pasó con el CIE-10 (083).
--
-- Es compatible con el ETL: `cargarAerolineas` hace `ON CONFLICT (nombre) DO UPDATE`, así que cuando se corra
-- completará el `sisres_id` de estas mismas filas sin duplicarlas. Aquí `ON CONFLICT DO NOTHING`: no pisa nada.
-- Idempotente.

INSERT INTO airlines (nombre) VALUES
  ('A.A.A'),
  ('ACA'),
  ('ADA'),
  ('AEROCIVIL'),
  ('AEROGAL'),
  ('AEROPOSTAL'),
  ('AEROREPUBLICA'),
  ('AEROSANIDAD'),
  ('AEXPA'),
  ('AIRES'),
  ('AMERICAN AIRLINES'),
  ('AVIANCA'),
  ('BOMBEROS'),
  ('COMERCIO'),
  ('CONCESIONARIO - AEROPUERTO'),
  ('JETSMART'),
  ('COPA'),
  ('DEPRISA CARGA'),
  ('DESACOL'),
  ('EASY FLY'),
  ('EJERCOL'),
  ('EMPRESAS DE ASEO'),
  ('EMPRESAS DE VIGILANCIA'),
  ('ENERGIZAR'),
  ('EQUIPAJEROS'),
  ('IDEAM'),
  ('INMIGRACION - DIAN'),
  ('LAN'),
  ('LAS LOMAS'),
  ('LASA'),
  ('LATAM'),
  ('PANTURISMO'),
  ('PARTICULAR'),
  ('POLICIA'),
  ('CLIC'),
  ('SAI'),
  ('SATENA - FAC'),
  ('SIALAS'),
  ('SPIRIT'),
  ('TACA'),
  ('TAMPA'),
  ('TAXISTAS'),
  ('TERPEL'),
  ('TRANSPORTADORES'),
  ('MOON FLIGHTS'),
  ('VUELOS AMBULANCIA'),
  ('VUELOS PARTICULARES'),
  ('ZONA DE CARGA'),
  ('OTROS'),
  ('VISITANTES')
ON CONFLICT (nombre) DO NOTHING;
