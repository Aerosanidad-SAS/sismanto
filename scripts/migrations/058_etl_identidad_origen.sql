-- ============================================================
-- Migración 058: identidad de origen SISRES para la carga de datos
-- + snapshot de texto en servicios + catálogos EPS y prestadores.
--
-- Contexto: plan de corte final (carga de la BD de SISRES y despliegue en
-- aerosanidadeinterassist.com). Hasta ahora el ETL no guardaba el id de
-- MySQL de cada fila, lo que impedía:
--   - rastrear una fila de Postgres hasta su registro original en SISRES;
--   - enlazar archivos subidos en SISRES (boleta de salida = servicios.id);
--   - re-ejecutar la carga sin duplicar (servicios y mantenimientos no
--     tienen clave natural — la guarda actual exige tabla vacía).
-- `sisres_id` es UNIQUE simple: varios NULL conviven (filas creadas en V2),
-- y habilita ON CONFLICT (sisres_id) en el ETL.
-- ============================================================

-- ─── 1. Id de origen ──────────────────────────────────────────────────────
ALTER TABLE medical_services       ADD COLUMN IF NOT EXISTS sisres_id INTEGER UNIQUE;
ALTER TABLE patients               ADD COLUMN IF NOT EXISTS sisres_id INTEGER UNIQUE;
ALTER TABLE medical_assessments    ADD COLUMN IF NOT EXISTS sisres_id INTEGER UNIQUE;
ALTER TABLE biomedical_equipment   ADD COLUMN IF NOT EXISTS sisres_id INTEGER UNIQUE;
ALTER TABLE biomedical_maintenance ADD COLUMN IF NOT EXISTS sisres_id INTEGER UNIQUE;
ALTER TABLE clients                ADD COLUMN IF NOT EXISTS sisres_id INTEGER UNIQUE;

-- ─── 2. Snapshot de texto en servicios ─────────────────────────────────────
-- En SISRES la mayoría de servicios no tiene fila en `paciente` (12 filas vs
-- ~35 mil servicios): la cédula vive solo como texto dentro de `servicios`.
-- Sin esta columna, un servicio sin paciente enlazado pierde su documento.
-- Igual con `cie`: SISRES guarda el texto del diagnóstico, no solo el código.
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS cedula_paciente VARCHAR(20);
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS cie_descripcion TEXT;

CREATE INDEX IF NOT EXISTS idx_medical_services_cedula_paciente
  ON medical_services(cedula_paciente);

COMMENT ON COLUMN medical_services.sisres_id IS 'servicios.id de SISRES (NULL si el servicio se creó en V2)';
COMMENT ON COLUMN medical_services.cedula_paciente IS 'Cédula tal cual venía en servicios.cedula de SISRES — no depende de que exista el paciente en patients';

-- ─── 2b. Largos al menos iguales a los de SISRES (DB_MAP.md) ───────────────
-- Con los largos de 038-040 una fila histórica que no cabe se rechaza entera.
-- Solo se ensancha: ningún valor existente se trunca.
ALTER TABLE medical_services ALTER COLUMN requiere_aislamiento TYPE VARCHAR(30);
ALTER TABLE medical_services ALTER COLUMN prestador TYPE VARCHAR(200);
ALTER TABLE patients ALTER COLUMN rh TYPE VARCHAR(20);
ALTER TABLE patients ALTER COLUMN estatura TYPE VARCHAR(20);
ALTER TABLE biomedical_equipment ALTER COLUMN placa_equipo TYPE VARCHAR(40);
ALTER TABLE biomedical_equipment ALTER COLUMN riesgo TYPE VARCHAR(40);
ALTER TABLE biomedical_maintenance ALTER COLUMN orden_numero TYPE VARCHAR(50);
ALTER TABLE biomedical_maintenance ALTER COLUMN codigo_institucional TYPE VARCHAR(80);
ALTER TABLE biomedical_maintenance ALTER COLUMN referencia_serial TYPE VARCHAR(150);

-- ─── 3. Catálogo EPS (sisres.eps, 30 filas) ────────────────────────────────
CREATE TABLE IF NOT EXISTS eps (
  id SERIAL PRIMARY KEY,
  sisres_id INTEGER UNIQUE,
  entidad VARCHAR(150) NOT NULL UNIQUE,
  codigo VARCHAR(50),
  codigo_movilidad VARCHAR(50),
  nit VARCHAR(50),
  regimen VARCHAR(50),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Prestadores / proveedores médicos (sisres.proveedores, 1.329 filas) ─
-- En SISRES "Prestador" y "Proveedor" del formulario de servicios salen de
-- la misma tabla. Se nombra medical_providers para no confundirla con
-- `suppliers` (proveedores de repuestos/talleres de flota).
CREATE TABLE IF NOT EXISTS medical_providers (
  id SERIAL PRIMARY KEY,
  sisres_id INTEGER UNIQUE,
  tipo_documento VARCHAR(20),
  numero VARCHAR(20),
  digito_verificacion VARCHAR(2),
  nombre VARCHAR(200) NOT NULL,
  sector VARCHAR(40),
  direccion VARCHAR(150),
  departamento VARCHAR(100),
  ciudad VARCHAR(100),
  telefono1 VARCHAR(20),
  telefono2 VARCHAR(20),
  telefono3 VARCHAR(20),
  correo VARCHAR(150),
  area VARCHAR(40),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_providers_nombre ON medical_providers(nombre);

-- ─── 5. RLS — catálogos sin dato clínico: lectura para cualquier usuario
-- autenticado; escritura ADMIN/ANALISTA; borrado solo ADMIN (patrón 054). ──
ALTER TABLE eps ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eps_select ON eps;
CREATE POLICY eps_select ON eps
  FOR SELECT TO authenticated
  USING (true);
DROP POLICY IF EXISTS eps_insert ON eps;
CREATE POLICY eps_insert ON eps
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS eps_update ON eps;
CREATE POLICY eps_update ON eps
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS eps_delete ON eps;
CREATE POLICY eps_delete ON eps
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS medical_providers_select ON medical_providers;
CREATE POLICY medical_providers_select ON medical_providers
  FOR SELECT TO authenticated
  USING (true);
DROP POLICY IF EXISTS medical_providers_insert ON medical_providers;
CREATE POLICY medical_providers_insert ON medical_providers
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS medical_providers_update ON medical_providers;
CREATE POLICY medical_providers_update ON medical_providers
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'))
  WITH CHECK (get_user_role() IN ('ADMIN','ANALISTA'));
DROP POLICY IF EXISTS medical_providers_delete ON medical_providers;
CREATE POLICY medical_providers_delete ON medical_providers
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');
