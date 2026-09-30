-- ============================================================
-- Migración 101: cotizaciones de ruta
--
-- SISRES: segumientoAmbulanciasMaps.php — calculadora con Google Maps: origen, punto intermedio y destino, rutas
-- alternativas con tráfico, y costo = km × valor por km. No guardaba nada. Aquí la calculadora es una COTIZACIÓN:
-- se guarda con número consecutivo (COT-000001), se imprime en PDF con el mapa del trazo y se envía por correo.
--
-- `polilinea` es el trazo codificado de Google (overview_polyline) para dibujar el mapa estático del PDF.
-- Quién puede qué: crear y ver, los roles que despachan servicios (ADMIN, REGULACION, ANALISTA); eliminar, ADMIN.
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS cotizaciones_ruta (
  id                  SERIAL PRIMARY KEY,
  numero              TEXT GENERATED ALWAYS AS ('COT-' || lpad(id::text, 6, '0')) STORED,
  cliente_nombre      VARCHAR(200),
  cliente_correo      VARCHAR(200),
  origen              VARCHAR(300) NOT NULL,
  intermedio          VARCHAR(300),
  destino             VARCHAR(300) NOT NULL,
  distancia_m         INTEGER NOT NULL CHECK (distancia_m > 0),
  duracion_s          INTEGER NOT NULL CHECK (duracion_s >= 0),
  duracion_trafico_s  INTEGER CHECK (duracion_trafico_s >= 0),
  valor_km            NUMERIC(12,2) NOT NULL CHECK (valor_km > 0),
  valor_adicional     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (valor_adicional >= 0),
  total               NUMERIC(14,2) NOT NULL CHECK (total >= 0),
  polilinea           TEXT NOT NULL,
  tramos              JSONB NOT NULL DEFAULT '[]'::jsonb,
  notas               TEXT,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_ruta_fecha ON cotizaciones_ruta(created_at DESC);

ALTER TABLE cotizaciones_ruta ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cotizaciones_ruta_select ON cotizaciones_ruta;
CREATE POLICY cotizaciones_ruta_select ON cotizaciones_ruta
  FOR SELECT TO authenticated USING (get_user_role() IN ('ADMIN','REGULACION','ANALISTA'));

DROP POLICY IF EXISTS cotizaciones_ruta_insert ON cotizaciones_ruta;
CREATE POLICY cotizaciones_ruta_insert ON cotizaciones_ruta
  FOR INSERT TO authenticated WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','ANALISTA'));

DROP POLICY IF EXISTS cotizaciones_ruta_delete ON cotizaciones_ruta;
CREATE POLICY cotizaciones_ruta_delete ON cotizaciones_ruta
  FOR DELETE TO authenticated USING (get_user_role() = 'ADMIN');

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('cotizaciones_ruta');
  END IF;
END $$;
