-- 080 · Campañas WhatsApp: imagen, PDF o video en el encabezado de la plantilla (SISRES: waSubirMedia + assets/campanas_media).
-- Idempotente.
--
-- Cómo funciona: el navegador sube el archivo al bucket privado `campanas-media`; el servidor lo baja, lo valida (firma real
-- del archivo, no solo la extensión), lo sube a Meta y guarda el `media_id` en la campaña. Los `media_id` de Meta CADUCAN a
-- los ~30 días: por eso la ruta del archivo queda guardada (`media_ruta`) y `media_subido_at` dice cuándo se subió; el
-- envío lo vuelve a subir solo si pasaron más de 25 días. Las columnas media_tipo / media_id / media_nombre ya existían (041).

ALTER TABLE wa_campaigns ADD COLUMN IF NOT EXISTS media_ruta TEXT;
ALTER TABLE wa_campaigns ADD COLUMN IF NOT EXISTS media_subido_at TIMESTAMPTZ;

INSERT INTO storage.buckets (id, name, public)
VALUES ('campanas-media', 'campanas-media', false)
ON CONFLICT (id) DO NOTHING;

-- Solo los roles de campañas (ADMIN y COORDINACION, como el resto del módulo). Cada usuario escribe únicamente en su
-- propia carpeta (`<user_id>/...`); leer sirve para cualquiera de los dos roles (el servidor lo baja al enviar).
DROP POLICY IF EXISTS campanas_media_select ON storage.objects;
CREATE POLICY campanas_media_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'campanas-media' AND get_user_role() IN ('ADMIN','COORDINACION'));

DROP POLICY IF EXISTS campanas_media_insert ON storage.objects;
CREATE POLICY campanas_media_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'campanas-media'
    AND get_user_role() IN ('ADMIN','COORDINACION')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS campanas_media_delete ON storage.objects;
CREATE POLICY campanas_media_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'campanas-media'
    AND get_user_role() IN ('ADMIN','COORDINACION')
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
