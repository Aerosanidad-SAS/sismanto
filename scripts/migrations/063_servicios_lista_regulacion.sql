-- Migración 063: lista de servicios con la lógica de SISRES para Regulación.
--
-- 1. cedula_paciente solo la llenaba la ETL (058); los servicios creados en
--    SISMANTO quedaban sin cédula y el filtro "Buscar cédula" no los hallaba.
--    Un trigger la toma del paciente enlazado.
-- 2. Índice para el filtro por rango de fecha programada (el de SISRES).
--
-- Idempotente.

CREATE OR REPLACE FUNCTION sync_cedula_paciente_servicio()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.patient_id IS NOT NULL THEN
    SELECT p.cedula INTO NEW.cedula_paciente FROM patients p WHERE p.id = NEW.patient_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_cedula_paciente ON medical_services;
CREATE TRIGGER trg_sync_cedula_paciente
BEFORE INSERT OR UPDATE OF patient_id ON medical_services
FOR EACH ROW
EXECUTE FUNCTION sync_cedula_paciente_servicio();

UPDATE medical_services ms
SET cedula_paciente = p.cedula
FROM patients p
WHERE ms.patient_id = p.id
  AND ms.cedula_paciente IS DISTINCT FROM p.cedula;

CREATE INDEX IF NOT EXISTS idx_medical_services_programacion
  ON medical_services(fecha_hora_programacion DESC);
