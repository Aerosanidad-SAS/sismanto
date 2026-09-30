-- ============================================================
-- Migración 094: documentos del equipo biomédico (Registro INVIMA, manuales, guías, fichas, certificados)
--
-- SISRES: tabla inventario_documento (sql/inventario_documentos_2026-09-30.sql, commit 1c93eb9), archivos en
-- img/documentosInventario/. Se adjuntan al EQUIPO, no a cada mantenimiento: se suben una vez y se ven en la hoja de
-- vida y al registrar un mantenimiento. Máximo 15 MB; PDF, JPG o PNG.
--
-- Aquí: bucket privado `equipos-documentos` (ruta equipo-<id>/<uuid>.<ext>) + tabla con los datos. El navegador sube
-- el archivo directo a Storage con la sesión del usuario (Vercel corta el cuerpo de una petición en 4,5 MB), y la
-- acción de servidor verifica el contenido real (firma de PDF/JPG/PNG) antes de registrar la fila.
--
-- Quién puede qué (tabla y bucket, mismo alcance): ver, los roles que ven Equipos biomédicos; subir, quienes editan el
-- inventario o registran mantenimientos (ADMIN, MANTENIMIENTO, ANALISTA); eliminar, ADMIN y MANTENIMIENTO (en la 054
-- el ANALISTA no elimina en biomédico). Idempotente.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('equipos-documentos', 'equipos-documentos', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS biomedical_equipment_documents (
  id              SERIAL PRIMARY KEY,
  equipment_id    INTEGER NOT NULL REFERENCES biomedical_equipment(id) ON DELETE CASCADE,
  tipo            VARCHAR(40) NOT NULL
                    CHECK (tipo IN ('REGISTRO_INVIMA', 'MANUAL', 'GUIA', 'FICHA_TECNICA', 'CERTIFICADO', 'OTRO')),
  nombre          VARCHAR(200) NOT NULL CHECK (length(trim(nombre)) > 0),
  ruta            TEXT NOT NULL UNIQUE,
  nombre_original VARCHAR(255),
  tamano_bytes    INTEGER,
  subido_por      UUID REFERENCES auth.users(id),
  subido_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_biomedical_documents_equipment ON biomedical_equipment_documents(equipment_id);

ALTER TABLE biomedical_equipment_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biomedical_documents_select ON biomedical_equipment_documents;
CREATE POLICY biomedical_documents_select ON biomedical_equipment_documents
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','COORDINACION','GERENCIAL','ANALISTA','VISTA'));

DROP POLICY IF EXISTS biomedical_documents_insert ON biomedical_equipment_documents;
CREATE POLICY biomedical_documents_insert ON biomedical_equipment_documents
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));

DROP POLICY IF EXISTS biomedical_documents_delete ON biomedical_equipment_documents;
CREATE POLICY biomedical_documents_delete ON biomedical_equipment_documents
  FOR DELETE TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO'));

-- Storage: mismo alcance que la tabla. Sin UPDATE: un documento no se reemplaza, se elimina y se sube otro.
DROP POLICY IF EXISTS equipos_documentos_select ON storage.objects;
CREATE POLICY equipos_documentos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'equipos-documentos'
         AND get_user_role() IN ('ADMIN','MANTENIMIENTO','COORDINACION','GERENCIAL','ANALISTA','VISTA'));

DROP POLICY IF EXISTS equipos_documentos_insert ON storage.objects;
CREATE POLICY equipos_documentos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'equipos-documentos' AND get_user_role() IN ('ADMIN','MANTENIMIENTO','ANALISTA'));

-- Un archivo subido que no pasa la verificación de contenido lo borra el servidor con la clave de servicio, así que
-- el ANALISTA no necesita (ni tiene) permiso de borrar en el bucket.
DROP POLICY IF EXISTS equipos_documentos_delete ON storage.objects;
CREATE POLICY equipos_documentos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'equipos-documentos' AND get_user_role() IN ('ADMIN','MANTENIMIENTO'));

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('biomedical_equipment_documents');
  END IF;
END $$;
