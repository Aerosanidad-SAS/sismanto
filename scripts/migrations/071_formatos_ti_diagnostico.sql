-- 071 · Formatos TI del SIG — módulo 2/4: Diagnóstico de Mantenimiento de Equipos Informáticos (G-TECN-F 047).
-- SISRES: `formato_diagnostico_mantenimiento` + `formato_diagnostico_repuestos` (sql/formato_diagnostico_mantenimiento_2026-09-01.sql).
-- Reutiliza el bucket `formatos-firmas` de la migración 070. Idempotente. Roles: ADMIN y ANALISTA.

CREATE TABLE IF NOT EXISTS ti_diagnostico (
  id SERIAL PRIMARY KEY,
  -- Folio consecutivo automático (DIAG-0001), generado a partir del id.
  numero_orden TEXT GENERATED ALWAYS AS ('DIAG-' || lpad(id::text, 4, '0')) STORED,

  fecha_diagnostico DATE NOT NULL,
  equipo VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL DEFAULT '',
  modelo VARCHAR(100) NOT NULL DEFAULT '',
  usuario_equipo VARCHAR(150) NOT NULL DEFAULT '',   -- usuario asignado al equipo (no es el que registra)
  serial VARCHAR(100) NOT NULL DEFAULT '',
  ubicacion VARCHAR(150) NOT NULL DEFAULT '',
  responsable_equipo VARCHAR(150) NOT NULL DEFAULT '',
  fecha_orden DATE,
  sede VARCHAR(100) NOT NULL DEFAULT '',
  placa VARCHAR(40) NOT NULL,
  codigo_institucional VARCHAR(50) NOT NULL DEFAULT '',
  tipo_mtto VARCHAR(20) NOT NULL CHECK (tipo_mtto IN ('PREVENTIVO','CORRECTIVO')),

  -- Diagnóstico inicial: 4 ítems SI / NO / N-A. Listado de chequeo: 14 ítems BUENO / MALO / N-A.
  diagnostico JSONB NOT NULL DEFAULT '{}'::jsonb,
  descripcion_falla VARCHAR(1000) NOT NULL DEFAULT '',
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,

  equipo_apto_uso BOOLEAN NOT NULL DEFAULT FALSE,
  equipo_averiado BOOLEAN NOT NULL DEFAULT FALSE,
  requirio_reparacion BOOLEAN NOT NULL DEFAULT FALSE,
  partes_buen_estado BOOLEAN NOT NULL DEFAULT FALSE,
  observaciones VARCHAR(1000) NOT NULL DEFAULT '',

  realizo_nombre VARCHAR(150) NOT NULL,
  realizo_cargo VARCHAR(100) NOT NULL DEFAULT '',
  firma_realizo_ruta TEXT NOT NULL DEFAULT '',
  firma_realizo_hash VARCHAR(64) NOT NULL DEFAULT '',
  reviso_nombre VARCHAR(150) NOT NULL DEFAULT '',
  reviso_cargo VARCHAR(100) NOT NULL DEFAULT '',
  firma_reviso_ruta TEXT NOT NULL DEFAULT '',
  firma_reviso_hash VARCHAR(64) NOT NULL DEFAULT '',

  -- SHA-256 de cada imagen de firma por lado ({"realizo":"…","reviso":"…"}); ver migración 070.
  firmas_png JSONB NOT NULL DEFAULT '{}'::jsonb,

  sisres_id INTEGER UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ti_diagnostico_placa ON ti_diagnostico(placa);
CREATE INDEX IF NOT EXISTS idx_ti_diagnostico_created ON ti_diagnostico(created_at DESC);

-- Repuestos: filas variables. Se borran con el diagnóstico (ON DELETE CASCADE), como en SISRES.
CREATE TABLE IF NOT EXISTS ti_diagnostico_repuestos (
  id SERIAL PRIMARY KEY,
  diagnostico_id INTEGER NOT NULL REFERENCES ti_diagnostico(id) ON DELETE CASCADE,
  repuesto VARCHAR(150) NOT NULL,
  referencia_serial VARCHAR(150) NOT NULL DEFAULT '',
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0)
);
CREATE INDEX IF NOT EXISTS idx_ti_diagnostico_repuestos_diag ON ti_diagnostico_repuestos(diagnostico_id);

ALTER TABLE ti_diagnostico ENABLE ROW LEVEL SECURITY;
ALTER TABLE ti_diagnostico_repuestos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ti_diagnostico_select ON ti_diagnostico;
CREATE POLICY ti_diagnostico_select ON ti_diagnostico
  FOR SELECT TO authenticated USING (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS ti_diagnostico_write ON ti_diagnostico;
CREATE POLICY ti_diagnostico_write ON ti_diagnostico
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));

DROP POLICY IF EXISTS ti_diagnostico_repuestos_select ON ti_diagnostico_repuestos;
CREATE POLICY ti_diagnostico_repuestos_select ON ti_diagnostico_repuestos
  FOR SELECT TO authenticated USING (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS ti_diagnostico_repuestos_write ON ti_diagnostico_repuestos;
CREATE POLICY ti_diagnostico_repuestos_write ON ti_diagnostico_repuestos
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
