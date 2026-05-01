-- Esquema de Base de Datos para Sistema de Gestión de Flotas
-- Ejecutar este script en el SQL Editor de Supabase

-- ENUMS necesarios
CREATE TYPE vehicle_status AS ENUM ('OPERATIVO', 'FUERA_DE_SERVICIO');
CREATE TYPE maintenance_type AS ENUM ('PREVENTIVO', 'CORRECTIVO');
CREATE TYPE severity_level AS ENUM ('BAJA', 'MEDIA', 'ALTA');
CREATE TYPE incident_status AS ENUM ('ABIERTO', 'EN_PROCESO', 'CERRADO');
CREATE TYPE operational_center AS ENUM ('CRA_MEDELLIN', 'CRA_BOGOTA', 'AIRPLAN', 'CTG');

-- Tabla 1: VEHÍCULOS (Master)
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(50),
  linea VARCHAR(100),
  tipo_llantas VARCHAR(50),
  combustible VARCHAR(30),
  vencimiento_rtm DATE,
  vencimiento_soat DATE,
  estado_actual vehicle_status DEFAULT 'OPERATIVO',
  centro_operativo operational_center NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices críticos
CREATE INDEX idx_vehicles_placa ON vehicles(placa);
CREATE INDEX idx_vehicles_estado ON vehicles(estado_actual);
CREATE INDEX idx_vehicles_centro ON vehicles(centro_operativo);
CREATE INDEX idx_vehicles_rtm ON vehicles(vencimiento_rtm) WHERE vencimiento_rtm IS NOT NULL;
CREATE INDEX idx_vehicles_soat ON vehicles(vencimiento_soat) WHERE vencimiento_soat IS NOT NULL;

-- Tabla 2: CATEGORÍAS DE MANTENIMIENTO (Normalizada)
CREATE TABLE maintenance_categories (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) UNIQUE NOT NULL,
  grupo_padre VARCHAR(100), -- Para jerarquía: "FRENOS" > "Cambio de pastillas"
  tipo_default maintenance_type,
  activo BOOLEAN DEFAULT true
);

-- Tabla 3: HISTORIAL DE MANTENIMIENTOS
CREATE TABLE maintenance_records (
  id_manto SERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  kilometraje_actual INTEGER NOT NULL CHECK (kilometraje_actual >= 0),
  tipo maintenance_type NOT NULL,
  categoria_id INTEGER REFERENCES maintenance_categories(id),
  descripcion_trabajo TEXT,
  proveedor VARCHAR(200),
  valor DECIMAL(12,2) CHECK (valor >= 0),
  numero_factura VARCHAR(100),
  tiempo_fuera_servicio_horas DECIMAL(6,2) DEFAULT 0,
  notas_adicionales TEXT,
  incident_id INTEGER, -- FK a incidents (se agrega después)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID -- FK a auth.users si usas Supabase Auth
);

CREATE INDEX idx_maint_vehicle ON maintenance_records(vehicle_id);
CREATE INDEX idx_maint_fecha ON maintenance_records(fecha DESC);
CREATE INDEX idx_maint_tipo ON maintenance_records(tipo);
CREATE INDEX idx_maint_categoria ON maintenance_records(categoria_id);

-- Tabla 4: REPORTES DE NOVEDADES/INCIDENTES
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha_reporte TIMESTAMPTZ DEFAULT NOW(),
  descripcion TEXT NOT NULL,
  severidad severity_level NOT NULL,
  reportado_por VARCHAR(200) NOT NULL,
  afecta_operatividad BOOLEAN DEFAULT false,
  estado incident_status DEFAULT 'ABIERTO',
  fecha_cierre TIMESTAMPTZ,
  mantenimiento_cierre_id INTEGER REFERENCES maintenance_records(id_manto),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incidents_vehicle ON incidents(vehicle_id);
CREATE INDEX idx_incidents_estado ON incidents(estado);
CREATE INDEX idx_incidents_fecha ON incidents(fecha_reporte DESC);

-- Agregar FK bidireccional a maintenance_records
ALTER TABLE maintenance_records 
ADD CONSTRAINT fk_incident 
FOREIGN KEY (incident_id) REFERENCES incidents(id);

-- Tabla 5: REGISTRO DE KILOMETRAJES
CREATE TABLE mileage_logs (
  id SERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  lectura_kilometraje INTEGER NOT NULL CHECK (lectura_kilometraje >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vehicle_id, fecha) -- Solo un registro por día
);

CREATE INDEX idx_mileage_vehicle ON mileage_logs(vehicle_id);
CREATE INDEX idx_mileage_fecha ON mileage_logs(fecha DESC);

-- Tabla 6: PROGRAMA DE MANTENIMIENTO (Template)
CREATE TABLE maintenance_schedule (
  id SERIAL PRIMARY KEY,
  nombre_tarea VARCHAR(200) NOT NULL,
  categoria_id INTEGER REFERENCES maintenance_categories(id),
  frecuencia_km INTEGER CHECK (frecuencia_km > 0),
  frecuencia_meses INTEGER CHECK (frecuencia_meses > 0),
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  CHECK (frecuencia_km IS NOT NULL OR frecuencia_meses IS NOT NULL)
);

-- TRIGGERS IMPORTANTES

-- 1. Actualizar estado del vehículo cuando se crea incidente crítico
CREATE OR REPLACE FUNCTION actualizar_estado_vehiculo_por_incidente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.afecta_operatividad = true AND NEW.estado = 'ABIERTO' THEN
    UPDATE vehicles 
    SET estado_actual = 'FUERA_DE_SERVICIO', 
        updated_at = NOW()
    WHERE id = NEW.vehicle_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incidente_afecta_operatividad
AFTER INSERT OR UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_vehiculo_por_incidente();

-- 2. Validar que el kilometraje siempre incremente
CREATE OR REPLACE FUNCTION validar_kilometraje_incremental()
RETURNS TRIGGER AS $$
DECLARE
  ultimo_km INTEGER;
BEGIN
  SELECT lectura_kilometraje INTO ultimo_km
  FROM mileage_logs
  WHERE vehicle_id = NEW.vehicle_id
  ORDER BY fecha DESC
  LIMIT 1;
  
  IF ultimo_km IS NOT NULL AND NEW.lectura_kilometraje < ultimo_km THEN
    RAISE EXCEPTION 'El kilometraje no puede ser menor al último registrado (%)' , ultimo_km;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_km
BEFORE INSERT ON mileage_logs
FOR EACH ROW
EXECUTE FUNCTION validar_kilometraje_incremental();

-- ROW LEVEL SECURITY (RLS)
-- Habilitar RLS en todas las tablas
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedule ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo (ajustar según autenticación)
-- Por ahora, permitir todo para desarrollo. En producción, configurar según roles.

CREATE POLICY "Permitir todo en vehicles"
ON vehicles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todo en maintenance_records"
ON maintenance_records FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todo en incidents"
ON incidents FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todo en mileage_logs"
ON mileage_logs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir lectura en maintenance_categories"
ON maintenance_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir todo en maintenance_schedule"
ON maintenance_schedule FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- Políticas para acceso anónimo (desarrollo sin autenticación)
-- IMPORTANTE: En producción, eliminar estas políticas y usar solo 'authenticated'

CREATE POLICY "Anon: leer vehicles" ON vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir vehicles" ON vehicles FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon: leer maintenance_records" ON maintenance_records FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir maintenance_records" ON maintenance_records FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon: leer incidents" ON incidents FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir incidents" ON incidents FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon: leer mileage_logs" ON mileage_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir mileage_logs" ON mileage_logs FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Anon: leer maintenance_categories" ON maintenance_categories FOR SELECT TO anon USING (true);

CREATE POLICY "Anon: leer maintenance_schedule" ON maintenance_schedule FOR SELECT TO anon USING (true);
CREATE POLICY "Anon: escribir maintenance_schedule" ON maintenance_schedule FOR ALL TO anon USING (true) WITH CHECK (true);