-- ============================================================
-- Migración 120: el OVEM solo escribe en las fotos de SU preoperacional de hoy (bucket `vehiculos-fotos`)
--
-- Revisión de seguridad pre-producción (2026-10-06). Problema (MEDIO): las políticas de escritura del bucket
-- `vehiculos-fotos` (111) dejaban a CUALQUIER OVEM insertar, reemplazar y BORRAR cualquier objeto del bucket, sin mirar
-- la ruta. La pertenencia real la exigía solo la RLS de `daily_checks` sobre la columna, no sobre el archivo. Con la
-- clave pública y su sesión, un conductor podía llamar a la API de Storage directamente y:
--   · borrar las fotos del preoperacional de otro conductor (o las fotos registradas de un vehículo): la evidencia de
--     los daños queda rota (el registro en base sigue apuntando a un archivo que ya no existe), o
--   · sobrescribir la foto de otro con otra imagen (`upsert`/UPDATE), alterando la evidencia de un preoperacional.
--
-- Rutas (src/lib/vehiculo-fotos.ts): `vehiculo-<uuid>/<lado>-<azar>.<ext>` y `preoperacional-<id>/<lado>-<azar>.<ext>`.
--
-- Arreglo: ADMIN/ANALISTA/REGULACION conservan todo el bucket (editan el vehículo). El OVEM solo puede insertar,
-- actualizar y borrar dentro de `preoperacional-<id>/` cuando ese preoperacional es suyo Y es el de hoy (misma regla
-- que `update_daily_checks`). Leer no cambia. Idempotente.
-- ============================================================

-- Condición del OVEM: la carpeta del objeto es `preoperacional-<id>` de un preoperacional de HOY que es suyo.
DROP POLICY IF EXISTS vehiculos_fotos_insert ON storage.objects;
CREATE POLICY vehiculos_fotos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehiculos-fotos'
    AND (
      (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION')
      OR (
        (SELECT get_user_role())::text = 'OVEM'
        AND EXISTS (
          SELECT 1 FROM daily_checks dc
          WHERE 'preoperacional-' || dc.id::text = (storage.foldername(name))[1]
            AND dc.user_id = (SELECT auth.uid())
            AND dc.fecha = (SELECT hoy_bogota())
        )
      )
    )
  );

DROP POLICY IF EXISTS vehiculos_fotos_update ON storage.objects;
CREATE POLICY vehiculos_fotos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'vehiculos-fotos'
    AND (
      (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION')
      OR (
        (SELECT get_user_role())::text = 'OVEM'
        AND EXISTS (
          SELECT 1 FROM daily_checks dc
          WHERE 'preoperacional-' || dc.id::text = (storage.foldername(name))[1]
            AND dc.user_id = (SELECT auth.uid())
            AND dc.fecha = (SELECT hoy_bogota())
        )
      )
    )
  )
  WITH CHECK (
    bucket_id = 'vehiculos-fotos'
    AND (
      (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION')
      OR (
        (SELECT get_user_role())::text = 'OVEM'
        AND EXISTS (
          SELECT 1 FROM daily_checks dc
          WHERE 'preoperacional-' || dc.id::text = (storage.foldername(name))[1]
            AND dc.user_id = (SELECT auth.uid())
            AND dc.fecha = (SELECT hoy_bogota())
        )
      )
    )
  );

DROP POLICY IF EXISTS vehiculos_fotos_delete ON storage.objects;
CREATE POLICY vehiculos_fotos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehiculos-fotos'
    AND (
      (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION')
      OR (
        (SELECT get_user_role())::text = 'OVEM'
        AND EXISTS (
          SELECT 1 FROM daily_checks dc
          WHERE 'preoperacional-' || dc.id::text = (storage.foldername(name))[1]
            AND dc.user_id = (SELECT auth.uid())
            AND dc.fecha = (SELECT hoy_bogota())
        )
      )
    )
  );
