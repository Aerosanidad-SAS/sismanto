-- 094 · Motor de alertas del preoperacional: severidad por ítem y FDS automático con fecha e historial. Idempotente.
--
-- Problema: una FALLA en el preoperacional se guardaba y nadie se enteraba; solo el siniestro abría una novedad. Y la
-- función que pasa el vehículo a FUERA_DE_SERVICIO al abrir una novedad que afecta la operatividad:
--   · corría con los permisos de quien reporta: un OVEM no puede actualizar `vehicles` (RLS), así que el UPDATE no
--     cambiaba nada y el vehículo seguía OPERATIVO;
--   · no escribía `fds_desde` ni el historial de estados.
--
-- Cambios:
--   · `checklist_items.severidad_falla` (CRITICA | ALTA | MEDIA | BAJA, por defecto MEDIA): qué tan grave es que ese
--     ítem falle. CRITICA saca el vehículo de servicio. Editable por ADMIN sin tocar código.
--   · Severidades iniciales para el catálogo vigente y un ítem nuevo de fugas de líquidos.
--   · `actualizar_estado_vehiculo_por_incidente()`: SECURITY DEFINER, fija `fds_desde` y registra el cambio en
--     `vehicle_status_history`, solo cuando el vehículo realmente cambia de estado.

ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS severidad_falla VARCHAR(10) NOT NULL DEFAULT 'MEDIA';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'checklist_items_severidad_falla_check') THEN
    ALTER TABLE checklist_items ADD CONSTRAINT checklist_items_severidad_falla_check
      CHECK (severidad_falla IN ('CRITICA', 'ALTA', 'MEDIA', 'BAJA'));
  END IF;
END $$;

COMMENT ON COLUMN checklist_items.severidad_falla IS
  'Gravedad si el ítem falla en el preoperacional. CRITICA = el vehículo sale de servicio; ALTA/MEDIA/BAJA = novedad abierta.';

-- Ítem nuevo: fuga de cualquier líquido (pedido de Daniel, 2026-09-30).
INSERT INTO checklist_items (categoria, descripcion, cantidad_esperada, orden, severidad_falla)
VALUES ('CABINA', 'Fuga de líquidos en el piso (aceite, refrigerante, combustible, frenos)', 'OK', 474, 'CRITICA')
ON CONFLICT (categoria, descripcion) DO NOTHING;

-- CRÍTICA: seguridad del vehículo y documentos sin los cuales no puede circular.
UPDATE checklist_items SET severidad_falla = 'CRITICA'
 WHERE lower(descripcion) IN (
   'nivel aceite de motor',
   'nivel líquido de frenos',
   'freno de pedal',
   'freno de servicio',
   'freno de emergencia',
   'dirección/suspensión (terminales)',
   'cinturón de seguridad',
   'control de fugas hidráulicas',
   'documento soat vigente',
   'documento técnico-mecánica vigente',
   'fuga de líquidos en el piso (aceite, refrigerante, combustible, frenos)'
 );

-- ALTA: el vehículo no debería salir sin resolverlo, pero se corrige sin sacarlo de servicio de entrada.
UPDATE checklist_items SET severidad_falla = 'ALTA'
 WHERE severidad_falla = 'MEDIA'
   AND (
     descripcion ILIKE 'luces principales%'
     OR descripcion ILIKE 'direccionales%'
     OR descripcion ILIKE 'baliza principal%'
     OR descripcion ILIKE 'sirena%'
     OR descripcion ILIKE 'presión llantas%'
     OR descripcion ILIKE 'nivel refrigerante%'
     OR descripcion ILIKE 'refrigerante%'
     OR descripcion ILIKE 'nivel líquido hidráulico%'
     OR descripcion ILIKE 'estado de correas%'
     OR descripcion ILIKE 'radiador%'
     OR descripcion ILIKE 'mangueras%'
     OR descripcion ILIKE 'batería%'
     OR descripcion ILIKE 'balas centrales de oxígeno%'
     OR descripcion ILIKE 'bala de oxígeno portátil%'
     OR descripcion ILIKE 'botiquín%'
     OR descripcion ILIKE 'extintor%'
     OR descripcion ILIKE 'limpiaparabrisas%'
     OR descripcion ILIKE 'vidrio frontal%'
     OR descripcion ILIKE 'espejo%'
     OR descripcion ILIKE 'pito%'
   );

-- FDS automático con fecha e historial.
CREATE OR REPLACE FUNCTION actualizar_estado_vehiculo_por_incidente()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_anterior TEXT;
BEGIN
  IF NEW.afecta_operatividad = true AND NEW.estado = 'ABIERTO' THEN
    SELECT estado_actual::text INTO v_anterior FROM vehicles WHERE id = NEW.vehicle_id;
    IF v_anterior IS DISTINCT FROM 'FUERA_DE_SERVICIO' THEN
      UPDATE vehicles
         SET estado_actual = 'FUERA_DE_SERVICIO',
             fds_desde = public.hoy_bogota(),
             updated_at = NOW()
       WHERE id = NEW.vehicle_id;
      INSERT INTO vehicle_status_history (vehicle_id, estado_nuevo, estado_anterior, notas)
      VALUES (NEW.vehicle_id, 'FUERA_DE_SERVICIO', v_anterior, 'Novedad #' || NEW.id || ' afecta la operatividad');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Rollback:
-- ALTER TABLE checklist_items DROP COLUMN IF EXISTS severidad_falla;
-- DELETE FROM checklist_items WHERE descripcion = 'Fuga de líquidos en el piso (aceite, refrigerante, combustible, frenos)';
-- (la función anterior está en scripts/schema.sql)
