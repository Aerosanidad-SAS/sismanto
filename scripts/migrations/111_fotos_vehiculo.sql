-- ============================================================
-- Migración 111: 4 fotos del vehículo (frente, lateral derecho, trasera, lateral izquierdo)
--
-- Port de SISRES (9cac9aa, 2026-10-05): en registrar/editar vehículo y en cada preoperacional, 4 fotos opcionales
-- del vehículo por los cuatro costados. En SISRES se guardan como archivo estático en disco, sin control de
-- sesión por vista individual (hueco de seguridad conocido y reportado allá, sin corregir). Aquí se guarda la
-- RUTA dentro de un bucket PRIVADO de Storage (no una URL pública) — mismo patrón que `servicios-boletas` (057) y
-- `equipos-documentos` (099): se sirve con signed URL, y la acción de servidor valida el contenido real del
-- archivo (JPG/PNG/WEBP por bytes, src/lib/imagen-contenido.ts) antes de guardar la ruta.
--
-- Dos juegos de 4 columnas, con el mismo nombre en ambas tablas:
--   `vehicles`: la foto vigente del vehículo (se reemplaza al editar; las otras 3 quedan intactas).
--   `daily_checks`: la foto de ESE preoperacional puntual (un registro histórico por día, no se pisa).
--
-- Quién puede qué (bucket `vehiculos-fotos`): ver, los mismos roles que ya ven Vehículos o Preoperacional (incluye
-- COORDINACION, que los ve en ambos); subir/reemplazar/borrar, quienes editan el vehículo (ADMIN, ANALISTA,
-- REGULACION) y el OVEM (su propio preoperacional — la pertenencia real la exige la RLS de `daily_checks`, no
-- esta política: `update_daily_checks` ya limita a OVEM a su propia fila del día). Las llamadas a get_user_role()
-- van envueltas en (SELECT ...) desde el inicio — auditoría 2026-10-01, hallazgo #4: evaluarla sin envolver cuesta
-- una vez por fila en vez de una vez por consulta.
--
-- Idempotente.
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS foto_frente VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS foto_lateral_derecho VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS foto_trasera VARCHAR(200);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS foto_lateral_izquierdo VARCHAR(200);

ALTER TABLE daily_checks ADD COLUMN IF NOT EXISTS foto_frente VARCHAR(200);
ALTER TABLE daily_checks ADD COLUMN IF NOT EXISTS foto_lateral_derecho VARCHAR(200);
ALTER TABLE daily_checks ADD COLUMN IF NOT EXISTS foto_trasera VARCHAR(200);
ALTER TABLE daily_checks ADD COLUMN IF NOT EXISTS foto_lateral_izquierdo VARCHAR(200);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vehiculos-fotos', 'vehiculos-fotos', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS vehiculos_fotos_select ON storage.objects;
CREATE POLICY vehiculos_fotos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vehiculos-fotos'
         AND (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','GERENCIAL','REGULACION','MANTENIMIENTO','OVEM','COORDINACION'));

DROP POLICY IF EXISTS vehiculos_fotos_insert ON storage.objects;
CREATE POLICY vehiculos_fotos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehiculos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION','OVEM'));

DROP POLICY IF EXISTS vehiculos_fotos_update ON storage.objects;
CREATE POLICY vehiculos_fotos_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'vehiculos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION','OVEM'))
  WITH CHECK (bucket_id = 'vehiculos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION','OVEM'));

DROP POLICY IF EXISTS vehiculos_fotos_delete ON storage.objects;
CREATE POLICY vehiculos_fotos_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vehiculos-fotos' AND (SELECT get_user_role())::text IN ('ADMIN','ANALISTA','REGULACION','OVEM'));

-- TECNICO/AEROPUERTO (rol restringido, migración 076) ya quedan fuera: no aparecen en ninguna lista de arriba.
-- Ningún otro bucket de este esquema tiene además una política `_restringido` propia en storage.objects — ese
-- generador cubre tablas, no Storage — así que no se agrega una aquí tampoco, por consistencia.
