-- ============================================================
-- Migración 145: confirmación de los servicios programados (#383)
--
-- Decisión de Daniel (2026-11-23): se acaba la reasignación silenciosa de servicios PROGRAMADO al cambiar la tripulación de un
-- móvil; en su lugar el regulador CONFIRMA que los servicios programados quedaron bien asignados al móvil y a la tripulación.
--
--   · medical_services.confirmado_at / confirmado_por: cuándo y quién (user_profiles.user_id = auth.users.id) los confirmó.
--     NULL = por confirmar. Los servicios que ya existen quedan sin confirmar: la marca «por confirmar» solo se muestra para
--     los PROGRAMADO de hoy en adelante con móvil (ver src/lib/servicios-confirmacion.ts), así que no se llena de históricos.
--   · Trigger BEFORE UPDATE: si cambia el móvil o alguien de la tripulación del servicio, la confirmación se borra, salvo que
--     el mismo UPDATE esté fijando la confirmación (así vale para cualquier camino: formulario, mover servicios, etc.).
--
-- Aditiva e idempotente: no borra ni reescribe filas, no toca políticas RLS (confirmar es un UPDATE de la fila, que ya cubren
-- las políticas de medical_services). Rollback: DROP TRIGGER trg_medical_services_limpiar_confirmacion; DROP FUNCTION
-- fn_medical_services_limpiar_confirmacion; ALTER TABLE medical_services DROP COLUMN confirmado_por, DROP COLUMN confirmado_at;
-- ============================================================

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS confirmado_at TIMESTAMPTZ;
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS confirmado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION fn_medical_services_limpiar_confirmacion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.confirmado_at IS NOT NULL
     AND NEW.confirmado_at IS NOT DISTINCT FROM OLD.confirmado_at
     AND (
       NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id
       OR NEW.ovem_user_id IS DISTINCT FROM OLD.ovem_user_id
       OR NEW.medico_user_id IS DISTINCT FROM OLD.medico_user_id
       OR NEW.auxiliar_user_id IS DISTINCT FROM OLD.auxiliar_user_id
     ) THEN
    NEW.confirmado_at := NULL;
    NEW.confirmado_por := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE OR REPLACE TRIGGER trg_medical_services_limpiar_confirmacion
  BEFORE UPDATE ON medical_services
  FOR EACH ROW
  EXECUTE FUNCTION fn_medical_services_limpiar_confirmacion();
