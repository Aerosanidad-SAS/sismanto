-- ============================================================
-- Migración 037: Integración SISRES — catálogos: clientes y CIE-10
-- Fase 3 del plan. Tablas de catálogo que el módulo de servicios
-- médicos referencia. Origen: tablas `clientes` y `cie10` de SISRES.
-- ============================================================

-- 1. CLIENTES (aseguradoras / pagadores)
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  tipo_documento VARCHAR(20) NOT NULL DEFAULT 'NIT',
  numero VARCHAR(30) NOT NULL UNIQUE,
  digito_verificacion VARCHAR(2),
  nombre VARCHAR(200) NOT NULL,
  sector VARCHAR(100),
  direccion VARCHAR(200),
  departamento VARCHAR(100),
  ciudad VARCHAR(100),
  telefono1 VARCHAR(30),
  telefono2 VARCHAR(30),
  telefono3 VARCHAR(30),
  correo VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_nombre ON clients(nombre);

-- 2. CATÁLOGO CIE-10 (diagnósticos)
-- ============================================================
CREATE TABLE IF NOT EXISTS cie10 (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cie10_codigo ON cie10(codigo);

-- 3. RLS
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cie10 ENABLE ROW LEVEL SECURITY;

-- Lectura: todos los roles operativos y clínicos
DROP POLICY IF EXISTS clients_select ON clients;
CREATE POLICY clients_select ON clients
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','GERENCIAL','REGULACION','COORDINACION','ANALISTA','MEDICO','AUXILIAR_ENFERMERIA','VISTA'));

-- Escritura de clientes: solo ADMIN (catálogo, vive en Configuración)
DROP POLICY IF EXISTS clients_write ON clients;
CREATE POLICY clients_write ON clients
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS cie10_select ON cie10;
CREATE POLICY cie10_select ON cie10
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS cie10_write ON cie10;
CREATE POLICY cie10_write ON cie10
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');
