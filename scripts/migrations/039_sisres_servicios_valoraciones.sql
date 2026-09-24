-- ============================================================
-- Migración 039: Integración SISRES — servicios médicos y valoraciones
-- Fase 3 del plan. Origen: tablas `servicios` (51 columnas) y
-- `valoraciones` de SISRES.
--
-- Decisiones de modelado:
--  * patient_id FK a patients (SISRES referenciaba por cédula texto);
--    se conserva nombre_completo como snapshot histórico.
--  * vehicle_id FK a vehicles (SISRES usaba placa texto); movil_placa
--    conserva el valor legado para filas que no crucen en el ETL.
--  * Etapas: PROGRAMADO → CURSO → FINALIZADO | CANCELADO | FALLIDO |
--    NO_EFECTIVO (valores reales observados en el código de SISRES).
--  * Los tiempos (minutos) se calculan en el Server Action al guardar
--    los pares llegada/salida — mismos cálculos que insertarServicios.php.
-- ============================================================

CREATE TABLE IF NOT EXISTS medical_services (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  nombre_completo VARCHAR(200) NOT NULL,
  fecha_hora_registro TIMESTAMPTZ DEFAULT NOW(),
  tipo_servicio VARCHAR(60) NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id),
  movil_placa VARCHAR(10),
  fecha_hora_programacion TIMESTAMPTZ,
  oportunidad_atencion NUMERIC(10,2),
  turno_programacion VARCHAR(40),
  autorizacion VARCHAR(100),
  asesor VARCHAR(150),
  prestador VARCHAR(150),
  cie_codigo VARCHAR(10),
  requiere_aislamiento VARCHAR(10),
  soporte VARCHAR(100),
  departamento_origen VARCHAR(100),
  ciudad_origen VARCHAR(100),
  departamento_destino VARCHAR(100),
  ciudad_destino VARCHAR(100),
  perimetro VARCHAR(60),
  direccion_origen VARCHAR(200),
  fecha_hora_llegada_origen TIMESTAMPTZ,
  fecha_hora_salida_origen TIMESTAMPTZ,
  tiempo_total_origen NUMERIC(10,2),
  direccion_intermedia VARCHAR(200),
  fecha_hora_llegada_intermedia TIMESTAMPTZ,
  fecha_hora_salida_intermedia TIMESTAMPTZ,
  tiempo_espera_intermedia NUMERIC(10,2),
  direccion_destino VARCHAR(200),
  fecha_hora_llegada_destino TIMESTAMPTZ,
  fecha_hora_salida_destino TIMESTAMPTZ,
  tiempo_espera_destino NUMERIC(10,2),
  tiempo_total NUMERIC(10,2),
  finalidad_traslado VARCHAR(150),
  acepta_ips VARCHAR(150),
  valor_servicio NUMERIC(14,2),
  metodo_pago VARCHAR(60),
  cliente VARCHAR(200),
  proveedor VARCHAR(200),
  medico VARCHAR(150),
  auxiliar VARCHAR(150),
  ovem VARCHAR(150),
  usuario_recibe VARCHAR(150),
  usuario_despacha VARCHAR(150),
  novedad_servicio TEXT,
  observaciones TEXT,
  motivo_externo VARCHAR(200),
  motivo_interno VARCHAR(200),
  etapa VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO'
    CHECK (etapa IN ('PROGRAMADO','CURSO','FINALIZADO','CANCELADO','FALLIDO','NO_EFECTIVO')),
  estado_servicio VARCHAR(40),
  ciudad_registro VARCHAR(100),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_services_etapa ON medical_services(etapa);
CREATE INDEX IF NOT EXISTS idx_medical_services_fecha ON medical_services(fecha_hora_registro);
CREATE INDEX IF NOT EXISTS idx_medical_services_patient ON medical_services(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_services_vehicle ON medical_services(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_medical_services_tipo ON medical_services(tipo_servicio);

-- VALORACIONES médicas (aptitud de vuelo)
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_assessments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  cedula VARCHAR(20) NOT NULL,
  nombre_completo VARCHAR(200) NOT NULL,
  fecha_nacimiento DATE,
  genero VARCHAR(20),
  aerolinea VARCHAR(100),
  fecha_hora_vuelo TIMESTAMPTZ,
  acompanante VARCHAR(150),
  origen VARCHAR(100),
  destino VARCHAR(100),
  hc TEXT,
  concepto_medico TEXT,
  tiempo_estimado VARCHAR(60),
  recomendaciones TEXT,
  valoracion VARCHAR(60),
  medico VARCHAR(150),
  pasajero VARCHAR(60),
  estado VARCHAR(40),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_assessments_cedula ON medical_assessments(cedula);
CREATE INDEX IF NOT EXISTS idx_medical_assessments_fecha ON medical_assessments(created_at);

-- RLS
-- ============================================================
ALTER TABLE medical_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medical_services_select ON medical_services;
CREATE POLICY medical_services_select ON medical_services
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','REGULACION','COORDINACION','ANALISTA','MEDICO','AUXILIAR_ENFERMERIA','VISTA','GERENCIAL'));

DROP POLICY IF EXISTS medical_services_insert ON medical_services;
CREATE POLICY medical_services_insert ON medical_services
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA'));

DROP POLICY IF EXISTS medical_services_update ON medical_services;
CREATE POLICY medical_services_update ON medical_services
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA'))
  WITH CHECK (get_user_role() IN ('ADMIN','REGULACION','MEDICO','AUXILIAR_ENFERMERIA'));

DROP POLICY IF EXISTS medical_services_delete ON medical_services;
CREATE POLICY medical_services_delete ON medical_services
  FOR DELETE TO authenticated
  USING (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS medical_assessments_select ON medical_assessments;
CREATE POLICY medical_assessments_select ON medical_assessments
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','REGULACION','COORDINACION','ANALISTA','MEDICO','AUXILIAR_ENFERMERIA','VISTA'));

DROP POLICY IF EXISTS medical_assessments_write ON medical_assessments;
CREATE POLICY medical_assessments_write ON medical_assessments
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','MEDICO'))
  WITH CHECK (get_user_role() IN ('ADMIN','MEDICO'));
