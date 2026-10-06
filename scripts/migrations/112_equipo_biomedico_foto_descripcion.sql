-- ============================================================
-- Migración 112: foto, descripción e instrucciones de uso del equipo biomédico
--
-- Brecha de ESTADO_INTEGRACION.md: SISRES guarda `inventario.imagen`, `descripcionEquipo` e `instruccionesUso`, y
-- la foto sale en la hoja de vida y en el PDF. `biomedical_equipment.imagen_url` ya existía (migración 040) pero
-- ninguna pantalla la usaba; aquí se repurpone como ruta de Storage (no URL pública, igual que
-- `imagen_boleta_salida` de servicios o las 4 fotos de vehículo de la 111) y se agregan las 2 columnas de texto
-- que faltaban.
--
-- Bucket privado `equipos-fotos`: mismos roles que `equipos-documentos` (099) — ven, quienes ven Equipos
-- biomédicos; suben/reemplazan, quienes editan el inventario (ADMIN, MANTENIMIENTO, ANALISTA). Llamadas a
-- get_user_role() envueltas en (SELECT ...) desde el inicio (auditoría 2026-10-01, hallazgo #4).
--
-- Idempotente.
-- ============================================================

ALTER TABLE biomedical_equipment ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE biomedical_equipment ADD COLUMN IF NOT EXISTS instrucciones_uso TEXT;
COMMENT ON COLUMN biomedical_equipment.imagen_url IS 'Ruta dentro del bucket de Storage equipos-fotos (no URL pública) — foto representativa del equipo, sale en la hoja de vida y en el PDF.';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('equipos-fotos', 'equipos-fotos', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS equipos_fotos_select ON storage.objects;
CREATE POLICY equipos_fotos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'equipos-fotos'
         AND (SELECT get_user_role())::text IN ('ADMIN','MANTENIMIENTO','COORDINACION','GERENCIAL','ANALISTA','VISTA'));

DROP POLICY IF EXISTS equipos_fotos_insert ON storage.objects;
CREATE POLICY equipos_fotos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'equipos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','MANTENIMIENTO','ANALISTA'));

DROP POLICY IF EXISTS equipos_fotos_update ON storage.objects;
CREATE POLICY equipos_fotos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'equipos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','MANTENIMIENTO','ANALISTA'))
  WITH CHECK (bucket_id = 'equipos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','MANTENIMIENTO','ANALISTA'));

DROP POLICY IF EXISTS equipos_fotos_delete ON storage.objects;
CREATE POLICY equipos_fotos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'equipos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','MANTENIMIENTO'));
