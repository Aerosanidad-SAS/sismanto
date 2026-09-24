-- 070 · Formatos TI del SIG — módulo 1/4: Acta de Entrega de Equipos (G-TECN-F 028 Celular + F 031 General).
-- SISRES: tabla `formato_acta_entrega` (sql/formato_acta_entrega_2026-09-01.sql) + firma digital con hash de integridad.
-- Idempotente. Los roles de escritura/lectura son los de TI: ADMIN y ANALISTA (en SISRES el permiso
-- mod_formato_acta_entrega arranca en cero y el Administrador lo activa por rol; acá no hay matriz de permisos).

-- ─── Bucket privado para las firmas manuscritas (PNG) ─────────────────────────────────────────────
-- Compartido por los 4 formatos: la ruta lleva el formato y el id (`acta-entrega/12/entrega-<aleatorio>.png`).
-- No es público: una firma es un dato personal, se sirve con URL firmada de corta vida.
INSERT INTO storage.buckets (id, name, public)
VALUES ('formatos-firmas', 'formatos-firmas', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS formatos_firmas_select ON storage.objects;
CREATE POLICY formatos_firmas_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'formatos-firmas' AND get_user_role() IN ('ADMIN','ANALISTA'));

DROP POLICY IF EXISTS formatos_firmas_insert ON storage.objects;
CREATE POLICY formatos_firmas_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'formatos-firmas' AND get_user_role() IN ('ADMIN','ANALISTA'));

DROP POLICY IF EXISTS formatos_firmas_update ON storage.objects;
CREATE POLICY formatos_firmas_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'formatos-firmas' AND get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (bucket_id = 'formatos-firmas' AND get_user_role() IN ('ADMIN','ANALISTA'));

DROP POLICY IF EXISTS formatos_firmas_delete ON storage.objects;
CREATE POLICY formatos_firmas_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'formatos-firmas' AND get_user_role() IN ('ADMIN','ANALISTA'));

-- ─── Acta de Entrega ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ti_acta_entrega (
  id SERIAL PRIMARY KEY,
  -- Folio consecutivo automático (ACT-0001): sale del id, sin tabla de contadores ni condición de carrera.
  numero_orden TEXT GENERATED ALWAYS AS ('ACT-' || lpad(id::text, 4, '0')) STORED,
  tipo_equipo VARCHAR(20) NOT NULL CHECK (tipo_equipo IN ('CELULAR','GENERAL')),

  -- Funcionario responsable
  func_nombre VARCHAR(150) NOT NULL,
  func_cedula VARCHAR(30) NOT NULL,
  func_cargo VARCHAR(100) NOT NULL DEFAULT '',
  func_sede VARCHAR(100) NOT NULL DEFAULT '',
  func_correo VARCHAR(150) NOT NULL DEFAULT '',

  -- Equipo (los 5 últimos solo aplican a CELULAR)
  equipo_referencia VARCHAR(100) NOT NULL DEFAULT '',
  equipo_marca VARCHAR(100) NOT NULL DEFAULT '',
  equipo_modelo VARCHAR(100) NOT NULL DEFAULT '',
  equipo_placa VARCHAR(40) NOT NULL,
  equipo_imei VARCHAR(40) NOT NULL DEFAULT '',
  equipo_sim VARCHAR(40) NOT NULL DEFAULT '',
  equipo_activo VARCHAR(40) NOT NULL DEFAULT '',
  equipo_tarjeta_sd VARCHAR(40) NOT NULL DEFAULT '',
  equipo_operador VARCHAR(60) NOT NULL DEFAULT '',

  -- Pruebas de funcionalidad: {"prueba_on_off":"BUENO","sonido":"MALO",...} (catálogo distinto según el tipo)
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Entrega. La fecha es la de hoy en Colombia y no se edita (igual que SISRES).
  fecha_entrega DATE NOT NULL DEFAULT ((NOW() AT TIME ZONE 'America/Bogota')::date),
  lugar_entrega VARCHAR(150) NOT NULL DEFAULT '',
  entrega_nombre VARCHAR(150) NOT NULL,
  firma_entrega_ruta TEXT NOT NULL DEFAULT '',
  firma_entrega_hash VARCHAR(64) NOT NULL DEFAULT '',
  recibe_nombre VARCHAR(150) NOT NULL,
  firma_recibe_ruta TEXT NOT NULL DEFAULT '',
  firma_recibe_hash VARCHAR(64) NOT NULL DEFAULT '',

  -- Devolución (solo CELULAR; se completa después, editando el acta)
  fecha_devolucion DATE,
  lugar_devolucion VARCHAR(150),
  devolucion_entrega_nombre VARCHAR(150),
  firma_devolucion_entrega_ruta TEXT,
  firma_devolucion_entrega_hash VARCHAR(64),
  devolucion_recibe_nombre VARCHAR(150),
  firma_devolucion_recibe_ruta TEXT,
  firma_devolucion_recibe_hash VARCHAR(64),

  observaciones VARCHAR(500) NOT NULL DEFAULT '',

  -- SHA-256 de cada imagen de firma, por lado: {"entrega":"ab12…","recibe":"…"}. Con esto el listado detecta una
  -- firma "Modificada" sin descargar los PNG; el PDF sí recalcula el hash desde los bytes reales del PNG.
  firmas_png JSONB NOT NULL DEFAULT '{}'::jsonb,

  sisres_id INTEGER UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ti_acta_entrega_placa ON ti_acta_entrega(equipo_placa);
CREATE INDEX IF NOT EXISTS idx_ti_acta_entrega_cedula ON ti_acta_entrega(func_cedula);
CREATE INDEX IF NOT EXISTS idx_ti_acta_entrega_created ON ti_acta_entrega(created_at DESC);

ALTER TABLE ti_acta_entrega ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ti_acta_entrega_select ON ti_acta_entrega;
CREATE POLICY ti_acta_entrega_select ON ti_acta_entrega
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'));

DROP POLICY IF EXISTS ti_acta_entrega_write ON ti_acta_entrega;
CREATE POLICY ti_acta_entrega_write ON ti_acta_entrega
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
