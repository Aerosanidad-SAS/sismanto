-- ============================================================
-- Migración 116: siniestro vial — datos y fotos obligatorios para reclamaciones
--
-- Requerimiento de Daniel (jefe de Mantenimiento, 2026-10-02): todo reporte de siniestro debe dejar placa del otro
-- vehículo, nombre y cédula del implicado, fotos de los hechos, datos del abogado presente (nombre, teléfono, cédula,
-- correo) y fotos de los documentos generados (IPAT, acta), para no tener problemas en las reclamaciones.
--
-- La OBLIGATORIEDAD se exige en el servidor y en el formulario para siniestros NUEVOS; en la tabla todo es nullable
-- para no romper las filas históricas. Las excepciones («sin tercero», «sin abogado», «sin documentos») solo existen
-- con una explicación escrita, que queda guardada en las columnas *_motivo.
--
-- Fotos: tabla road_accident_fotos (evidencia inmutable: nadie actualiza ni borra) + bucket privado `siniestros`
-- (ruta <accident_id>/<HECHOS|DOCUMENTOS>/<uuid>.jpg). Aditiva e idempotente.
-- ============================================================

-- ─── 1. Datos del implicado y del abogado ───────────────────────────────────────────────────────────────────────
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS tercero_cedula        VARCHAR(20);
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS sin_tercero_motivo    TEXT;
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS abogado_nombre        VARCHAR(200);
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS abogado_telefono      VARCHAR(30);
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS abogado_cedula        VARCHAR(20);
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS abogado_correo        VARCHAR(200);
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS sin_abogado_motivo    TEXT;
ALTER TABLE road_accidents ADD COLUMN IF NOT EXISTS sin_documentos_motivo TEXT;

COMMENT ON COLUMN road_accidents.sin_tercero_motivo IS 'Por qué no hay otro vehículo o persona involucrada (obligatorio si hay_terceros = false en siniestros nuevos)';
COMMENT ON COLUMN road_accidents.sin_abogado_motivo IS 'Por qué no hubo abogado presente (obligatorio si no hay abogado_* en siniestros nuevos)';
COMMENT ON COLUMN road_accidents.sin_documentos_motivo IS 'Por qué no se generaron documentos (IPAT, acta) en siniestros nuevos';

-- ─── 2. Fotos del siniestro ─────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS road_accident_fotos (
  id           BIGSERIAL PRIMARY KEY,
  -- RESTRICT a propósito: la evidencia no se va con el siniestro.
  accident_id  INTEGER NOT NULL REFERENCES road_accidents(id) ON DELETE RESTRICT,
  tipo         VARCHAR(12) NOT NULL CHECK (tipo IN ('HECHOS', 'DOCUMENTOS')),
  storage_path TEXT NOT NULL,
  subido_por   UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (storage_path)
);

CREATE INDEX IF NOT EXISTS idx_road_accident_fotos_accident ON road_accident_fotos (accident_id, tipo);

-- Evidencia inmutable, incluso para el service_role y el ADMIN: corregirla es una decisión humana y queda fuera de la
-- aplicación (quien deba purgar datos de prueba desactiva el trigger a mano).
CREATE OR REPLACE FUNCTION road_accident_fotos_inmutables()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Las fotos de un siniestro no se modifican ni se borran';
END;
$$;

DROP TRIGGER IF EXISTS trg_road_accident_fotos_inmutables ON road_accident_fotos;
CREATE TRIGGER trg_road_accident_fotos_inmutables
  BEFORE UPDATE OR DELETE ON road_accident_fotos
  FOR EACH ROW EXECUTE FUNCTION road_accident_fotos_inmutables();

ALTER TABLE road_accident_fotos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS road_accident_fotos_select ON road_accident_fotos;
CREATE POLICY road_accident_fotos_select ON road_accident_fotos
  FOR SELECT TO authenticated
  USING (
    (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION', 'MANTENIMIENTO')
    OR subido_por = auth.uid()
  );

-- El OVEM sube solo a un siniestro que él reportó y a su nombre. Sin políticas de UPDATE ni DELETE: nadie borra.
DROP POLICY IF EXISTS road_accident_fotos_insert ON road_accident_fotos;
CREATE POLICY road_accident_fotos_insert ON road_accident_fotos
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'REGULACION')
    OR (
      (SELECT get_user_role())::text = 'OVEM'
      AND subido_por = auth.uid()
      AND EXISTS (SELECT 1 FROM road_accidents r WHERE r.id = road_accident_fotos.accident_id AND r.reportado_por = auth.uid())
    )
  );

-- ─── 3. Bucket privado `siniestros` ─────────────────────────────────────────────────────────────────────────────
-- Mismo patrón que vehiculos-fotos (111), servicios-boletas (057) y tickets-adjuntos (065): privado, URLs firmadas, solo imágenes, 8 MB.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('siniestros', 'siniestros', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS siniestros_select ON storage.objects;
CREATE POLICY siniestros_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'siniestros'
    AND (
      (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION', 'MANTENIMIENTO')
      OR EXISTS (
        SELECT 1 FROM road_accidents r
        WHERE r.id::text = (storage.foldername(name))[1] AND r.reportado_por = auth.uid()
      )
    )
  );

-- Sin políticas de UPDATE ni DELETE sobre este bucket: subir no permite sobrescribir ni borrar evidencia.
DROP POLICY IF EXISTS siniestros_insert ON storage.objects;
CREATE POLICY siniestros_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'siniestros'
    AND (
      (SELECT get_user_role())::text IN ('ADMIN', 'ANALISTA', 'REGULACION')
      OR (
        (SELECT get_user_role())::text = 'OVEM'
        AND EXISTS (
          SELECT 1 FROM road_accidents r
          WHERE r.id::text = (storage.foldername(name))[1] AND r.reportado_por = auth.uid()
        )
      )
    )
  );

-- Igual que la 091/107/108: si existe la política restrictiva de TECNICO/AEROPUERTO (076), la tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM aplicar_politica_rol_restringido('road_accident_fotos');
  END IF;
END $$;

-- Rollback (solo si no hay fotos reales):
--   DROP POLICY IF EXISTS siniestros_insert ON storage.objects; DROP POLICY IF EXISTS siniestros_select ON storage.objects;
--   DELETE FROM storage.buckets WHERE id = 'siniestros';   -- falla si el bucket tiene objetos: vaciarlo desde el panel de Storage
--   DROP TABLE IF EXISTS road_accident_fotos; DROP FUNCTION IF EXISTS road_accident_fotos_inmutables();
--   ALTER TABLE road_accidents DROP COLUMN IF EXISTS tercero_cedula, DROP COLUMN IF EXISTS sin_tercero_motivo,
--     DROP COLUMN IF EXISTS abogado_nombre, DROP COLUMN IF EXISTS abogado_telefono, DROP COLUMN IF EXISTS abogado_cedula,
--     DROP COLUMN IF EXISTS abogado_correo, DROP COLUMN IF EXISTS sin_abogado_motivo, DROP COLUMN IF EXISTS sin_documentos_motivo;
