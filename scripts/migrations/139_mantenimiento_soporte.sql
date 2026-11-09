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
-- Aditiva e idempotente. No toca filas existentes. Rollback: DROP COLUMN de las dos columnas y borrar el bucket y sus políticas.
-- ============================================================

ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS soporte_path TEXT;
ALTER TABLE maintenance_records ADD COLUMN IF NOT EXISTS requiere_soporte BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN maintenance_records.soporte_path IS
  'Ruta del soporte (factura, orden de trabajo o foto) en el bucket privado mantenimiento-soportes; NULL si no se adjuntó.';
COMMENT ON COLUMN maintenance_records.requiere_soporte IS
  'true en los correctivos registrados con la regla de Airplan (#345): sin soporte_path quedan marcados «sin soporte». Lo histórico es false.';

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

-- Quien subió un archivo puede quitarlo (el servidor lo hace si el registro del mantenimiento falla después de subirlo).
DROP POLICY IF EXISTS mantenimiento_soportes_delete ON storage.objects;
CREATE POLICY mantenimiento_soportes_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'mantenimiento-soportes'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );
