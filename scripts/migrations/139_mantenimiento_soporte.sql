-- ============================================================
-- Migración 139: soporte de los mantenimientos correctivos (#345, regla Airplan)
--
-- El costo de un correctivo solo se recupera con su soporte (factura, orden de trabajo o foto). Decisión: se puede guardar
-- sin soporte, pero queda MARCADO («sin soporte») y se puede filtrar en /mantenimientos; bloquear el guardado frenaría al
-- técnico en campo.
--
--   · maintenance_records.soporte_path: ruta del archivo en el bucket privado `mantenimiento-soportes` (no es una URL pública;
--     se ve con una URL firmada).
--   · maintenance_records.requiere_soporte: true en los correctivos registrados desde hoy. Lo histórico queda en false: no se
--     marca como «sin soporte» lo que nunca tuvo dónde adjuntarlo.
--   · Bucket privado de 8 MB: PDF, JPG, PNG y WEBP (el tipo real lo valida el servidor por contenido). La ruta es
--     <uid de quien sube>/<id>.<ext>: cada quien solo escribe en su carpeta. Lo ven y lo suben ADMIN, ANALISTA y MANTENIMIENTO,
--     los mismos roles que registran mantenimientos.
--
-- Aditiva e idempotente. No toca filas existentes. Rollback: DROP TRIGGER y DROP FUNCTION del guardián, DROP COLUMN de las dos
-- columnas y borrar el bucket y sus políticas.
-- ============================================================

ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS soporte_path TEXT;
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS requiere_soporte BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN maintenance_records.soporte_path IS
  'Ruta del soporte (factura, orden de trabajo o foto) en el bucket privado mantenimiento-soportes; NULL si no se adjuntó.';
COMMENT ON COLUMN maintenance_records.requiere_soporte IS
  'true en los correctivos registrados con la regla de Airplan (#345): sin soporte_path quedan marcados «sin soporte». Lo histórico es false.';

-- Un archivo pertenece a un solo mantenimiento: evita apuntar al soporte de otro registro.
CREATE UNIQUE INDEX IF NOT EXISTS uq_maintenance_records_soporte_path
  ON maintenance_records (soporte_path) WHERE soporte_path IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maintenance_records_sin_soporte
  ON maintenance_records (fecha DESC) WHERE requiere_soporte AND soporte_path IS NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mantenimiento-soportes', 'mantenimiento-soportes', false, 8388608,
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS mantenimiento_soportes_insert ON storage.objects;
CREATE POLICY mantenimiento_soportes_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'mantenimiento-soportes'
    AND (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS mantenimiento_soportes_select ON storage.objects;
CREATE POLICY mantenimiento_soportes_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'mantenimiento-soportes'
    AND (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO')
  );

-- Quien subió un archivo puede quitarlo SOLO mientras ningún mantenimiento lo use (el servidor lo hace si el registro falla
-- después de subirlo). Un soporte ya adjunto no se puede borrar por la API: es evidencia de un costo.
DROP POLICY IF EXISTS mantenimiento_soportes_delete ON storage.objects;
CREATE POLICY mantenimiento_soportes_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'mantenimiento-soportes'
    AND (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND NOT EXISTS (SELECT 1 FROM public.maintenance_records r WHERE r.soporte_path = storage.objects.name)
  );

-- Las dos columnas las escribe el servidor al crear el registro; por la API no se editan. Sin esto, cualquier rol con UPDATE sobre
-- la fila podría quitar la marca «sin soporte» o apuntar `soporte_path` a otro archivo. Se permite sin sesión (service_role, SQL
-- Editor). Al cambiar el tipo, la marca se recalcula sola: un registro que pasa a CORRECTIVO sin soporte queda marcado.
CREATE OR REPLACE FUNCTION public.maintenance_records_soporte_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND (NEW.soporte_path IS DISTINCT FROM OLD.soporte_path OR NEW.requiere_soporte IS DISTINCT FROM OLD.requiere_soporte) THEN
    RAISE EXCEPTION 'El soporte de un mantenimiento no se edita directamente';
  END IF;
  IF NEW.tipo IS DISTINCT FROM OLD.tipo THEN
    NEW.requiere_soporte := (NEW.tipo::text = 'CORRECTIVO');
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.maintenance_records_soporte_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_maintenance_records_soporte_guard ON maintenance_records;
CREATE TRIGGER trg_maintenance_records_soporte_guard
  BEFORE UPDATE ON maintenance_records
  FOR EACH ROW EXECUTE FUNCTION public.maintenance_records_soporte_guard();
