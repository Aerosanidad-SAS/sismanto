-- ============================================================
-- Migración 059: centro operativo de cada servicio médico.
--
-- Decisión de Daniel (2026-09-21): Regulación, OVEM, médico y auxiliar
-- ven solo la operación de su centro (a los de Medellín no les interesa
-- Bogotá y viceversa); Admin, Analista, Gerencial y Coordinación ven
-- todos. Un centro por usuario.
--
-- El centro del usuario ya existe: user_profiles.operational_center_id
-- (migración 004, FK a operational_centers). Esta migración agrega el
-- mismo dato al servicio. Se usa la tabla operational_centers y no el
-- ENUM de vehicles.centro_operativo porque la tabla es la que administra
-- Configuración → Centros; sus códigos coinciden con los valores del ENUM.
--
-- El servicio toma el centro del vehículo asignado; sin vehículo
-- (medicina domiciliaria con médico en su propio carro), el del usuario
-- que lo registra. Lo calcula la aplicación (servicios-medicos.ts).
-- ============================================================

ALTER TABLE medical_services
  ADD COLUMN IF NOT EXISTS operational_center_id INTEGER
  REFERENCES operational_centers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_medical_services_operational_center
  ON medical_services(operational_center_id);

COMMENT ON COLUMN medical_services.operational_center_id IS
  'Centro operativo del servicio: el del vehículo asignado o, sin vehículo, el de quien lo registró';

-- Servicios existentes con vehículo: heredan el centro del vehículo.
UPDATE medical_services ms
SET operational_center_id = oc.id
FROM vehicles v
JOIN operational_centers oc ON oc.codigo = v.centro_operativo::text
WHERE ms.vehicle_id = v.id
  AND ms.operational_center_id IS NULL;

-- Rollback:
-- DROP INDEX IF EXISTS idx_medical_services_operational_center;
-- ALTER TABLE medical_services DROP COLUMN IF EXISTS operational_center_id;
