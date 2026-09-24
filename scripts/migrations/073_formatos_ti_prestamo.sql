-- 073 · Formatos TI del SIG — módulo 4/4: Entrega y/o Préstamo de Equipos Informáticos (G-TECN-F 018).
-- SISRES: `formato_prestamo_equipo` (sql/formato_prestamo_equipo_2026-09-01.sql). Reutiliza el bucket `formatos-firmas` (070).
-- Un registro = un préstamo con ciclo de vida propio: nace con el lado de ENTREGA (2 firmas, estado PRESTADO) y se
-- completa después, editando, con el lado de DEVOLUCIÓN (2 firmas más, estado DEVUELTO). El estado no se guarda:
-- es DEVUELTO cuando hay `fecha_devolucion` (igual que prestamoFilaHtml.php). Idempotente. Roles: ADMIN y ANALISTA.

CREATE TABLE IF NOT EXISTS ti_prestamo_equipo (
  id SERIAL PRIMARY KEY,
  -- Folio consecutivo automático (PRE-0001), generado a partir del id.
  numero_orden TEXT GENERATED ALWAYS AS ('PRE-' || lpad(id::text, 4, '0')) STORED,

  -- La fecha de entrega es la de hoy en Colombia y no se edita (igual que SISRES).
  fecha_entrega DATE NOT NULL DEFAULT ((NOW() AT TIME ZONE 'America/Bogota')::date),
  equipo_descripcion VARCHAR(150) NOT NULL,
  equipo_placa VARCHAR(40) NOT NULL,
  equipo_incluye VARCHAR(255) NOT NULL DEFAULT '',

  -- Entrega: quien recibe el equipo y el funcionario que lo entrega
  usuario_recibe_nombre VARCHAR(150) NOT NULL,
  usuario_recibe_cargo VARCHAR(100) NOT NULL DEFAULT '',
  firma_usuario_recibe_ruta TEXT NOT NULL DEFAULT '',
  firma_usuario_recibe_hash VARCHAR(64) NOT NULL DEFAULT '',
  func_entrega_nombre VARCHAR(150) NOT NULL,
  func_entrega_cargo VARCHAR(100) NOT NULL DEFAULT '',
  firma_func_entrega_ruta TEXT NOT NULL DEFAULT '',
  firma_func_entrega_hash VARCHAR(64) NOT NULL DEFAULT '',

  -- Devolución (se completa después)
  fecha_devolucion DATE,
  gestion_recibe_nombre VARCHAR(150),
  gestion_recibe_cargo VARCHAR(100),
  firma_gestion_recibe_ruta TEXT,
  firma_gestion_recibe_hash VARCHAR(64),
  usuario_entrega_dev_nombre VARCHAR(150),
  usuario_entrega_dev_cargo VARCHAR(100),
  firma_usuario_entrega_dev_ruta TEXT,
  firma_usuario_entrega_dev_hash VARCHAR(64),

  observaciones VARCHAR(500) NOT NULL DEFAULT '',

  -- SHA-256 de cada imagen de firma por lado; ver migración 070.
  firmas_png JSONB NOT NULL DEFAULT '{}'::jsonb,

  sisres_id INTEGER UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- No se puede devolver antes de entregar.
  CONSTRAINT ti_prestamo_devolucion_posterior CHECK (fecha_devolucion IS NULL OR fecha_devolucion >= fecha_entrega)
);

CREATE INDEX IF NOT EXISTS idx_ti_prestamo_placa ON ti_prestamo_equipo(equipo_placa);
CREATE INDEX IF NOT EXISTS idx_ti_prestamo_created ON ti_prestamo_equipo(created_at DESC);
-- Los préstamos abiertos (sin devolver) son los que más se consultan.
CREATE INDEX IF NOT EXISTS idx_ti_prestamo_abiertos ON ti_prestamo_equipo(created_at DESC) WHERE fecha_devolucion IS NULL;

ALTER TABLE ti_prestamo_equipo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ti_prestamo_equipo_select ON ti_prestamo_equipo;
CREATE POLICY ti_prestamo_equipo_select ON ti_prestamo_equipo
  FOR SELECT TO authenticated USING (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS ti_prestamo_equipo_write ON ti_prestamo_equipo;
CREATE POLICY ti_prestamo_equipo_write ON ti_prestamo_equipo
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
