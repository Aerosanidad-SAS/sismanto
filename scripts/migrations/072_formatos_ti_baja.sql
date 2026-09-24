-- 072 · Formatos TI del SIG — módulo 3/4: Baja de Dispositivos Informáticos y Biomédicos (G-TECN-F 020).
-- SISRES: `formato_baja_equipo` (sql/formato_baja_equipo_2026-09-01.sql). Reutiliza el bucket `formatos-firmas` (070).
-- Idempotente. Roles: ADMIN y ANALISTA.

CREATE TABLE IF NOT EXISTS ti_baja_equipo (
  id SERIAL PRIMARY KEY,
  -- Folio consecutivo automático (BAJ-0001), generado a partir del id.
  numero_orden TEXT GENERATED ALWAYS AS ('BAJ-' || lpad(id::text, 4, '0')) STORED,
  tipo_equipo VARCHAR(20) NOT NULL CHECK (tipo_equipo IN ('INFORMATICO','BIOMEDICO')),

  -- Solo Informático
  fecha_ingreso_reporte DATE,
  numero_inventario VARCHAR(50),
  -- Solo Biomédico
  sede VARCHAR(100),
  ubicacion_sanidad VARCHAR(150),

  mayor_dos_anios BOOLEAN NOT NULL DEFAULT FALSE,
  nombre_equipo VARCHAR(150) NOT NULL,
  marca VARCHAR(100) NOT NULL DEFAULT '',
  modelo VARCHAR(100) NOT NULL DEFAULT '',
  serie VARCHAR(100) NOT NULL DEFAULT '',

  causa_baja VARCHAR(30) NOT NULL CHECK (causa_baja IN ('DANIO','CAMBIO_TECNOLOGIA','ROBO','REPOSICION','OTROS')),
  causa_baja_detalle VARCHAR(255) NOT NULL DEFAULT '',
  concepto_tecnico_radicado VARCHAR(150) NOT NULL DEFAULT '',
  proveedor_garantia VARCHAR(150) NOT NULL DEFAULT '',
  denuncio VARCHAR(150) NOT NULL DEFAULT '',
  costo_historico VARCHAR(50) NOT NULL DEFAULT '',
  fecha_compra DATE,

  telecom_tipo VARCHAR(20) NOT NULL DEFAULT 'NINGUNO'
    CHECK (telecom_tipo IN ('NINGUNO','TABLETS','RADIO','CELULAR','TELEFONO_IP','CAMARA')),
  telecom_marca VARCHAR(100) NOT NULL DEFAULT '',
  telecom_modelo VARCHAR(100) NOT NULL DEFAULT '',
  telecom_imei VARCHAR(50) NOT NULL DEFAULT '',
  telecom_operador VARCHAR(60) NOT NULL DEFAULT '',

  -- Cables y cargadores: {"cargador":true,"cable_usb":false,...,"otro_detalle":"texto"}
  accesorios JSONB NOT NULL DEFAULT '{}'::jsonb,
  observaciones VARCHAR(1000) NOT NULL DEFAULT '',

  responsable_nombre VARCHAR(150) NOT NULL,
  firma_responsable_ruta TEXT NOT NULL DEFAULT '',
  firma_responsable_hash VARCHAR(64) NOT NULL DEFAULT '',

  -- SHA-256 de la imagen de firma ({"responsable":"…"}); ver migración 070.
  firmas_png JSONB NOT NULL DEFAULT '{}'::jsonb,

  sisres_id INTEGER UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- La causa "Otros" obliga a explicarla (regla propia de insertarBaja.php, fuera del motor de obligatorios).
  CONSTRAINT ti_baja_otros_con_detalle CHECK (causa_baja <> 'OTROS' OR btrim(causa_baja_detalle) <> '')
);

CREATE INDEX IF NOT EXISTS idx_ti_baja_serie ON ti_baja_equipo(serie);
CREATE INDEX IF NOT EXISTS idx_ti_baja_created ON ti_baja_equipo(created_at DESC);

ALTER TABLE ti_baja_equipo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ti_baja_equipo_select ON ti_baja_equipo;
CREATE POLICY ti_baja_equipo_select ON ti_baja_equipo
  FOR SELECT TO authenticated USING (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS ti_baja_equipo_write ON ti_baja_equipo;
CREATE POLICY ti_baja_equipo_write ON ti_baja_equipo
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
