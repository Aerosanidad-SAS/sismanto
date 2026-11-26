-- ============================================================
-- Migración 145: confirmación de los servicios programados (#383)
--
-- Decisión de Daniel (2026-11-23): se acaba la reasignación silenciosa de servicios PROGRAMADO al cambiar la tripulación de un
-- móvil; en su lugar el regulador CONFIRMA que los servicios programados quedaron bien asignados al móvil y a la tripulación.
--
--   · medical_services.confirmado_at / confirmado_por: cuándo y quién (user_profiles.user_id = auth.users.id) los confirmó.
--     NULL = por confirmar. Los servicios que ya existen quedan sin confirmar: la marca «por confirmar» solo se muestra para
--     los PROGRAMADO de hoy en adelante con móvil (ver src/lib/servicios-confirmacion.ts), así que no se llena de históricos.
--   · Trigger BEFORE INSERT OR UPDATE:
--       - solo ADMIN, ANALISTA y REGULACION ponen o quitan la confirmación. La RLS de la tabla deja a OVEM, médico y auxiliar
--         escribir sus servicios (y a médico y auxiliar crearlos) sin distinguir columnas: sin esto podrían confirmarse solos o
--         firmar a nombre de otro. A ellos se les ignora lo que manden en estas dos columnas. `confirmado_por` es siempre quien
--         escribe. Sin sesión de usuario (service_role, tareas de la base) no se restringe.
--       - si cambia el móvil o alguien de la tripulación del servicio, la confirmación se borra, salvo que el mismo UPDATE esté
--         fijando la confirmación (así vale para cualquier camino: formulario, mover servicios, etc.).
--
-- Aditiva e idempotente: no borra ni reescribe filas, no toca políticas RLS (confirmar es un UPDATE de la fila, que ya cubren
-- las políticas de medical_services). Rollback: DROP TRIGGER trg_medical_services_limpiar_confirmacion; DROP FUNCTION
-- fn_medical_services_limpiar_confirmacion; ALTER TABLE medical_services DROP COLUMN confirmado_por, DROP COLUMN confirmado_at;
-- ============================================================

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS confirmado_at TIMESTAMPTZ;
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS confirmado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION fn_medical_services_limpiar_confirmacion()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario UUID := auth.uid();
  v_puede_confirmar BOOLEAN := TRUE;
BEGIN
  IF v_usuario IS NOT NULL THEN
    v_puede_confirmar := COALESCE(public.get_user_role() IN ('ADMIN','ANALISTA','REGULACION'), FALSE);
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NOT v_puede_confirmar THEN
      NEW.confirmado_at := NULL;
      NEW.confirmado_por := NULL;
    ELSIF v_usuario IS NOT NULL AND NEW.confirmado_at IS NOT NULL THEN
      NEW.confirmado_por := v_usuario;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT v_puede_confirmar THEN
    NEW.confirmado_at := OLD.confirmado_at;
    NEW.confirmado_por := OLD.confirmado_por;
  ELSIF v_usuario IS NOT NULL
        AND NEW.confirmado_at IS NOT NULL
        AND (NEW.confirmado_at IS DISTINCT FROM OLD.confirmado_at OR NEW.confirmado_por IS DISTINCT FROM OLD.confirmado_por) THEN
    NEW.confirmado_por := v_usuario;
  END IF;

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
  BEFORE INSERT OR UPDATE ON medical_services
  FOR EACH ROW
  EXECUTE FUNCTION fn_medical_services_limpiar_confirmacion();
