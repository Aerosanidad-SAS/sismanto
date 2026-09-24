-- ============================================================
-- Migración 038: Integración SISRES — pacientes
-- Fase 3 del plan. Origen: tabla `paciente` de SISRES (20 columnas).
-- `edad` NO se almacena: se calcula desde fecha_nacimiento en la
-- capa de presentación (en SISRES quedaba desactualizada).
-- ============================================================

CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  tipo_documento VARCHAR(20) NOT NULL DEFAULT 'CC',
  nombre1 VARCHAR(60) NOT NULL,
  nombre2 VARCHAR(60),
  apellido1 VARCHAR(60) NOT NULL,
  apellido2 VARCHAR(60),
  fecha_nacimiento DATE,
  direccion VARCHAR(200),
  barrio VARCHAR(100),
  localidad VARCHAR(100),
  departamento VARCHAR(100),
  ciudad VARCHAR(100),
  rh VARCHAR(5),
  sexo VARCHAR(20),
  estatura VARCHAR(10),
  eps VARCHAR(150),
  celular VARCHAR(30),
  correo VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_cedula ON patients(cedula);
CREATE INDEX IF NOT EXISTS idx_patients_apellido1 ON patients(apellido1);

-- RLS — datos clínicos: acceso solo a roles con función asistencial
-- u operativa directa. GERENCIAL/OVEM no acceden a pacientes.
-- ============================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS patients_select ON patients;
CREATE POLICY patients_select ON patients
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','REGULACION','COORDINACION','ANALISTA','MEDICO','AUXILIAR_ENFERMERIA','VISTA'));

DROP POLICY IF EXISTS patients_insert ON patients;
CREATE POLICY patients_insert ON patients
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA'));

DROP POLICY IF EXISTS patients_update ON patients;
CREATE POLICY patients_update ON patients
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA'))
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA'));

DROP POLICY IF EXISTS patients_delete ON patients;
CREATE POLICY patients_delete ON patients
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');
