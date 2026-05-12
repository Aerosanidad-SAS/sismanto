-- Migration 012: Preventive Maintenance Plan
-- Tables: maintenance_plan_items, vehicle_maintenance_log
-- View:   vehicle_maintenance_alerts

-- ─── 1. CATEGORÍAS FALTANTES ────────────────────────────────────────────────
INSERT INTO maintenance_categories (nombre) VALUES
  ('Motor'),('Lubricación'),('Admisión'),('Inyección'),('Escape'),
  ('Refrigeración'),('Eléctrico'),('Frenos'),('Suspensión'),('Transmisión'),
  ('Chasis'),('Mecánico'),('Llantas'),('Combustible'),('Fluidos'),
  ('Cabina'),('Carrocería'),('General'),('Limpieza'),('Emergencia')
ON CONFLICT (nombre) DO NOTHING;

-- ─── 2. TABLA maintenance_plan_items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_plan_items (
  id                  SERIAL       PRIMARY KEY,
  descripcion         TEXT         NOT NULL,
  categoria           TEXT         NOT NULL REFERENCES maintenance_categories(nombre),
  intervalo_km        INTEGER      NOT NULL DEFAULT 0,   -- 0 = no aplica
  intervalo_dias      INTEGER      NOT NULL DEFAULT 0,   -- 0 = no aplica
  aplica_a            TEXT         NOT NULL DEFAULT 'TODOS', -- 'TODOS' | nombre centro | placa
  alerta_naranja_km   INTEGER      NOT NULL DEFAULT 500,
  alerta_roja_km      INTEGER      NOT NULL DEFAULT 200,
  alerta_naranja_dias INTEGER      NOT NULL DEFAULT 30,
  alerta_roja_dias    INTEGER      NOT NULL DEFAULT 7,
  activo              BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 3. TABLA vehicle_maintenance_log ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_maintenance_log (
  id                    SERIAL       PRIMARY KEY,
  vehicle_id            UUID         NOT NULL REFERENCES vehicles(id),
  plan_item_id          INTEGER      NOT NULL REFERENCES maintenance_plan_items(id),
  fecha_realizado       DATE         NOT NULL,
  km_realizado          INTEGER,
  maintenance_record_id INTEGER      REFERENCES maintenance_records(id_manto),
  registrado_por        UUID         REFERENCES user_profiles(user_id),
  notas                 TEXT,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vml_vehicle_item
  ON vehicle_maintenance_log (vehicle_id, plan_item_id, fecha_realizado DESC);

-- ─── 4. VIEW vehicle_maintenance_alerts ─────────────────────────────────────
CREATE OR REPLACE VIEW vehicle_maintenance_alerts AS
WITH latest_log AS (
  SELECT DISTINCT ON (vehicle_id, plan_item_id)
    vehicle_id,
    plan_item_id,
    fecha_realizado,
    km_realizado
  FROM vehicle_maintenance_log
  ORDER BY vehicle_id, plan_item_id, fecha_realizado DESC, created_at DESC
)
SELECT
  v.id                                                    AS vehicle_id,
  v.placa,
  v.centro_operativo,
  mpi.id                                                  AS plan_item_id,
  mpi.descripcion,
  mpi.categoria,
  mpi.intervalo_km,
  mpi.intervalo_dias,
  mpi.aplica_a,
  ll.fecha_realizado                                      AS ultimo_mantenimiento,
  ll.km_realizado                                         AS km_ultimo,
  CASE WHEN mpi.intervalo_km > 0
    THEN (ll.km_realizado + mpi.intervalo_km) - v.kilometraje_actual
    ELSE NULL
  END                                                     AS km_restantes,
  CASE WHEN mpi.intervalo_dias > 0
    THEN ( (ll.fecha_realizado + (mpi.intervalo_dias || ' days')::INTERVAL)::DATE
           - CURRENT_DATE )::INTEGER
    ELSE NULL
  END                                                     AS dias_restantes,
  CASE
    WHEN mpi.intervalo_km > 0 THEN
      CASE
        WHEN (ll.km_realizado + mpi.intervalo_km) - v.kilometraje_actual
             < mpi.alerta_roja_km    THEN 'ROJA'
        WHEN (ll.km_realizado + mpi.intervalo_km) - v.kilometraje_actual
             < mpi.alerta_naranja_km THEN 'NARANJA'
        ELSE 'OK'
      END
    WHEN mpi.intervalo_dias > 0 THEN
      CASE
        WHEN ( (ll.fecha_realizado + (mpi.intervalo_dias || ' days')::INTERVAL)::DATE
               - CURRENT_DATE )::INTEGER < mpi.alerta_roja_dias    THEN 'ROJA'
        WHEN ( (ll.fecha_realizado + (mpi.intervalo_dias || ' days')::INTERVAL)::DATE
               - CURRENT_DATE )::INTEGER < mpi.alerta_naranja_dias THEN 'NARANJA'
        ELSE 'OK'
      END
    ELSE 'OK'
  END                                                     AS nivel_alerta
FROM vehicles v
JOIN maintenance_plan_items mpi
  ON  mpi.activo = TRUE
  AND (mpi.aplica_a = 'TODOS'
       OR mpi.aplica_a = v.centro_operativo
       OR mpi.aplica_a = v.placa)
JOIN latest_log ll
  ON  ll.vehicle_id   = v.id
  AND ll.plan_item_id = mpi.id;

-- ─── 5. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE maintenance_plan_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance_log ENABLE ROW LEVEL SECURITY;

-- Plan items: todos los autenticados leen; solo ADMIN escribe
CREATE POLICY "mpi_select" ON maintenance_plan_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "mpi_insert" ON maintenance_plan_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "mpi_update" ON maintenance_plan_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "mpi_delete" ON maintenance_plan_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
  );

-- Log: todos leen; ADMIN y MANTENIMIENTO insertan
CREATE POLICY "vml_select" ON vehicle_maintenance_log
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "vml_insert" ON vehicle_maintenance_log
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role IN ('ADMIN','MANTENIMIENTO')
    )
  );

CREATE POLICY "vml_update" ON vehicle_maintenance_log
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "vml_delete" ON vehicle_maintenance_log
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'ADMIN')
  );

-- ─── 6. DATOS — PLAN GENERAL (TODOS LOS VEHÍCULOS) ──────────────────────────
-- Filas 6-36 del archivo 'plan de manto.xlsx' (excluye filas 1-5, inspección diaria)

INSERT INTO maintenance_plan_items
  (descripcion, categoria, intervalo_km, intervalo_dias, aplica_a,
   alerta_naranja_km, alerta_roja_km, alerta_naranja_dias, alerta_roja_dias)
VALUES
-- Semanal (0 km, 7 días)
('Revisar presión de llantas y estado (incluida repuesto)',
 'Llantas',      0,  7, 'TODOS', 0, 0, 3, 1),
('Inspección de agua en separador de combustible',
 'Combustible',  0,  7, 'TODOS', 0, 0, 3, 1),
-- Quincenal (0 km, 14 días)
('Aseo externo profundo y desmanchada',
 'Limpieza',     0, 14, 'TODOS', 0, 0, 5, 2),
-- 5 000 km
('Cambio Kit Filtros (Aire, Combustible, Aceite)',
 'Motor',     5000,  0, 'TODOS', 500, 200, 0, 0),
('Drenaje de filtro separador y ajuste de AdBlue',
 'Motor',     5000,  0, 'TODOS', 500, 200, 0, 0),
('Limpieza de bornes de batería y revisión de carga',
 'Eléctrico', 5000,  0, 'TODOS', 500, 200, 0, 0),
('Análisis de muestra de aceite (Opcional/Control)',
 'Motor',     5000,  0, 'TODOS', 500, 200, 0, 0),
-- 10 000 km
('Cambio de Aceite de Motor (Sintético)',
 'Lubricación', 10000, 0, 'TODOS', 500, 200, 0, 0),
('Alineación, balanceo y rotación de llantas',
 'Llantas',     10000, 0, 'TODOS', 500, 200, 0, 0),
('Engrase de crucetas, cardán y terminales',
 'Chasis',      10000, 0, 'TODOS', 500, 200, 0, 0),
('Inspección de sistema de escape y sujeciones',
 'Escape',      10000, 0, 'TODOS', 500, 200, 0, 0),
('Verificar holgura de pedal de embrague y frenos',
 'Mecánico',    10000, 0, 'TODOS', 500, 200, 0, 0),
('Limpieza y mantenimiento de acrílicos (Sirenas)',
 'Emergencia',  10000, 0, 'TODOS', 500, 200, 0, 0),
-- 20 000 km
('Limpieza de Válvula EGR y Sensores MAF/MAP',
 'Admisión',    20000, 0, 'TODOS', 500, 200, 0, 0),
('Cambio de pastillas de frenos y ajuste de bandas',
 'Frenos',      20000, 0, 'TODOS', 500, 200, 0, 0),
('Inspección de Turbo (mangueras y estanqueidad)',
 'Admisión',    20000, 0, 'TODOS', 500, 200, 0, 0),
('Limpieza y sondeo de Radiador e Intercooler',
 'Refrigeración', 20000, 0, 'TODOS', 500, 200, 0, 0),
('Mantenimiento HVAC (Aire cabina pacientes)',
 'Cabina',      20000, 0, 'TODOS', 500, 200, 0, 0),
-- 40 000 km
('Sustitución Líquido de Frenos y Refrigerante',
 'Fluidos',     40000, 0, 'TODOS', 500, 200, 0, 0),
('Cambio Aceite de Caja, Diferencial y Transfer',
 'Transmisión', 40000, 0, 'TODOS', 500, 200, 0, 0),
('Revisión de soportes de motor y caja',
 'Motor',       40000, 0, 'TODOS', 500, 200, 0, 0),
('Regeneración forzada DPF y Bujías Incandescentes',
 'Escape',      40000, 0, 'TODOS', 500, 200, 0, 0),
-- 60 000 km
('Kit Distribución + Bomba de Agua + Termostato',
 'Motor',       60000, 0, 'TODOS', 500, 200, 0, 0),
('Laboratorio de Inyectores y Common Rail',
 'Inyección',   60000, 0, 'TODOS', 500, 200, 0, 0),
('Mantenimiento de Alternador y Motor de Arranque',
 'Eléctrico',   60000, 0, 'TODOS', 500, 200, 0, 0),
('Cambio de Batería (Preventivo)',
 'Eléctrico',   60000, 0, 'TODOS', 500, 200, 0, 0),
('Rectificación de discos y campanas',
 'Frenos',      60000, 0, 'TODOS', 500, 200, 0, 0),
('Mantenimiento Tanque de Combustible (Lavado)',
 'Combustible', 60000, 0, 'TODOS', 500, 200, 0, 0),
-- 80 000 km
('Cambio de Amortiguadores y bujes de ballesta',
 'Suspensión',  80000, 0, 'TODOS', 500, 200, 0, 0),
-- 100 000 km
('Cambio Kit de Embrague (Clutch completo)',
 'Transmisión', 100000, 0, 'TODOS', 500, 200, 0, 0),
-- 150 000 km
('Revisión de compresión y estado interno de motor',
 'Motor',      150000, 0, 'TODOS', 500, 200, 0, 0);

-- ─── 7. DATOS — PLAN AIRPLAN (por tiempo) ───────────────────────────────────
-- Fuente: hoja 'ORDEN DE TRABAJO' del Cronograma AIRPLAN 2026
-- aplica_a = 'AIRPLAN' (coincide con vehicles.centro_operativo para las 6 ambulancias AIRPLAN)

INSERT INTO maintenance_plan_items
  (descripcion, categoria, intervalo_km, intervalo_dias, aplica_a,
   alerta_naranja_km, alerta_roja_km, alerta_naranja_dias, alerta_roja_dias)
VALUES
-- SEMESTRALES (180 días)
('Cambio de aceite y filtro de aceite',
 'Motor',       0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Cambio filtro de aire',
 'Motor',       0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Revisión códigos de falla ECU',
 'Motor',       0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Revisión funcionamiento aire acondicionado',
 'Motor',       0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Verificación mangueras y tuberías combustible',
 'Motor',       0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Verificación nivel electrolito batería',
 'Eléctrico',   0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Calibración de llantas',
 'Llantas',     0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Verificación discos y pastillas de freno',
 'Frenos',      0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Verificación bandas y tambores de freno',
 'Frenos',      0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Verificación mangueras y tuberías de freno',
 'Frenos',      0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Verificación y ajuste juego pedal de freno',
 'Frenos',      0, 180, 'AIRPLAN', 0, 0, 30, 7),
('Verificar estado carrocería',
 'Carrocería',  0, 180, 'AIRPLAN', 0, 0, 30, 7),
-- ANUALES (365 días)
('Cambiar o limpiar filtro de aire motor',
 'Motor',       0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Cambiar refrigerante de motor',
 'Motor',       0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Reemplazo filtro de combustible',
 'Motor',       0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Reemplazar líneas y mangueras combustible',
 'Motor',       0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Revisar sistema de admisión de aire',
 'Motor',       0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Verificación sistema control emisiones',
 'Motor',       0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Revisión técnico-mecánica',
 'General',     0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Alarmas sonoras',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Barra de luces de emergencia',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Luces de emergencia',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Luces indicadoras y testigos de advertencia',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Luces principales',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Medidores: temperatura, combustible, tacómetro',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Verificación cable encendido',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Revisión sistema lavaparabrisas',
 'Eléctrico',   0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Cambiar fluido tanque reserva de frenos',
 'Frenos',      0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Revisión de pastas',
 'Frenos',      0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Revisar y/o cambiar crucetas de cardan',
 'Transmisión', 0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Verificación-ajuste juego pedal embrague',
 'Transmisión', 0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Alineación y balanceo',
 'Suspensión',  0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Balanceo de cuatro ruedas',
 'Suspensión',  0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Lubricación terminales, crucetas y suspensión',
 'Suspensión',  0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Revisar y/o cambiar amortiguadores',
 'Suspensión',  0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Revisión y lubricación rodamientos',
 'Suspensión',  0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Verificación sistema de suspensión',
 'Suspensión',  0, 365, 'AIRPLAN', 0, 0, 30, 7),
('Verificación rótulas de suspensión',
 'Suspensión',  0, 365, 'AIRPLAN', 0, 0, 30, 7),
-- BIANUALES (730 días)
('Calibración de válvulas',
 'Motor',       0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Cambio de correa de distribución',
 'Motor',       0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Cambio filtro de combustible (mayor)',
 'Motor',       0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Limpieza de inyectores',
 'Motor',       0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Verificación marcha mínima y gases',
 'Motor',       0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Verificación y ajuste avance de encendido',
 'Eléctrico',   0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Revisar y/o reparar alternador',
 'Eléctrico',   0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Revisión y/o reparación motor de arranque',
 'Eléctrico',   0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Cambio de llantas',
 'Llantas',     0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Cambiar aceite caja de transferencia',
 'Transmisión', 0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Cambiar aceite diferencial trasero/delantero',
 'Transmisión', 0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Cambiar aceite transmisión manual',
 'Transmisión', 0, 730, 'AIRPLAN', 0, 0, 30, 7),
('Cambiar sellos de ejes de salida',
 'Transmisión', 0, 730, 'AIRPLAN', 0, 0, 30, 7);
