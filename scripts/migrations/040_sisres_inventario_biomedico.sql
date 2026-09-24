-- ============================================================
-- Migración 040: Integración SISRES — inventario y mantenimiento biomédico
-- Fase 4 del plan. Origen: tablas `inventario` (35 columnas) y
-- `mantenimiento` (30 columnas) de SISRES.
-- Dominio deliberadamente separado de maintenance_records (flota):
-- activos distintos, roles distintos (NAVEGACION_UNIFICADA.md §2).
-- ============================================================

CREATE TABLE IF NOT EXISTS biomedical_equipment (
  id SERIAL PRIMARY KEY,
  placa_equipo VARCHAR(30) NOT NULL UNIQUE,
  equipo VARCHAR(150) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  serie VARCHAR(100),
  registro_invima VARCHAR(100),
  riesgo VARCHAR(20),
  ultimo_mantenimiento DATE,
  proximo_mantenimiento DATE,
  ultima_calibracion DATE,
  proxima_calibracion DATE,
  frec_mantenimiento VARCHAR(40),
  frec_calibracion VARCHAR(40),
  ubicacion_interna VARCHAR(150),
  aeropuerto VARCHAR(100),
  departamento VARCHAR(100),
  ciudad VARCHAR(100),
  adquisicion VARCHAR(60),
  area VARCHAR(100),
  observaciones TEXT,
  imagen_url TEXT,
  voltaje VARCHAR(40),
  corriente VARCHAR(40),
  potencia VARCHAR(40),
  frecuencia VARCHAR(40),
  humedad VARCHAR(40),
  dimensiones VARCHAR(80),
  peso VARCHAR(40),
  temperatura VARCHAR(40),
  fecha_compra DATE,
  proveedor_nombre VARCHAR(150),
  proveedor_contacto VARCHAR(150),
  operador VARCHAR(150),
  activo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biomedical_equipment_placa ON biomedical_equipment(placa_equipo);
CREATE INDEX IF NOT EXISTS idx_biomedical_equipment_proximo ON biomedical_equipment(proximo_mantenimiento);

CREATE TABLE IF NOT EXISTS biomedical_maintenance (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER NOT NULL REFERENCES biomedical_equipment(id) ON DELETE CASCADE,
  orden_numero VARCHAR(40),
  fecha_mantenimiento DATE NOT NULL,
  tipo_mantenimiento VARCHAR(60),
  codigo_institucional VARCHAR(60),
  ubicacion VARCHAR(150),
  sanidad VARCHAR(100),
  chk_items JSONB,
  chk_total INTEGER,
  chk_marcados INTEGER,
  descripcion_falla TEXT,
  obs_apto BOOLEAN DEFAULT true,
  obs_averiado BOOLEAN DEFAULT false,
  obs_reparacion BOOLEAN DEFAULT false,
  obs_baja BOOLEAN DEFAULT false,
  obs_partes BOOLEAN DEFAULT true,
  observaciones TEXT,
  repuesto VARCHAR(200),
  referencia_serial VARCHAR(100),
  cantidad INTEGER,
  obs_reparaciones TEXT,
  realizo_nombre VARCHAR(150) NOT NULL,
  realizo_cargo VARCHAR(100),
  reviso_nombre VARCHAR(150),
  reviso_cargo VARCHAR(100),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biomedical_maintenance_equipment ON biomedical_maintenance(equipment_id);
CREATE INDEX IF NOT EXISTS idx_biomedical_maintenance_fecha ON biomedical_maintenance(fecha_mantenimiento);

-- RLS
-- ============================================================
ALTER TABLE biomedical_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomedical_maintenance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biomedical_equipment_select ON biomedical_equipment;
CREATE POLICY biomedical_equipment_select ON biomedical_equipment
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','COORDINACION','GERENCIAL','ANALISTA','VISTA','MEDICO','AUXILIAR_ENFERMERIA'));

DROP POLICY IF EXISTS biomedical_equipment_write ON biomedical_equipment;
CREATE POLICY biomedical_equipment_write ON biomedical_equipment
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO'))
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO'));

DROP POLICY IF EXISTS biomedical_maintenance_select ON biomedical_maintenance;
CREATE POLICY biomedical_maintenance_select ON biomedical_maintenance
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','COORDINACION','GERENCIAL','ANALISTA','VISTA'));

DROP POLICY IF EXISTS biomedical_maintenance_write ON biomedical_maintenance;
CREATE POLICY biomedical_maintenance_write ON biomedical_maintenance
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO'))
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO'));
