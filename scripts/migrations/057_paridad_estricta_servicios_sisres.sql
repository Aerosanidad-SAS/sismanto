-- ============================================================
-- Migración 057: paridad estricta de medical_services con la tabla
-- real `servicios` de SISRES (verificado con DESCRIBE contra la BD
-- `aerosanidad` en vivo, 2026-08-03 — 51 columnas reales).
--
-- Decisión del usuario (León, misma fecha), tras comparar columna por
-- columna:
--
-- 1) DROP de 12 columnas que la migración 050 agregó (Daniel,
--    2026-07-22, "campos reales del formulario de Regulación") pero que
--    NO corresponden a ninguna columna de `servicios` en SISRES:
--    condicion, medio_asignacion, turno_facturacion, deducible, incapa,
--    situacion, tiempo_a_restar, poliza, funcionario_aseguradora,
--    codigo_telemedicina, correo_electronico, motivo_consulta.
--    Nota: puede que estos datos sí existan en la operación real de
--    Regulación fuera de la tabla `servicios` (papel, otra hoja) — pero
--    no son parte del esquema que se está igualando acá.
--
-- 2) ADD de `imagen_boleta_salida` — equivalente a la columna `imagen`
--    de SISRES (Boleta de Salida, subida real en editarServicio.php,
--    hasta ahora completamente ausente en Aeromanto). Se guarda la RUTA
--    dentro del bucket de Storage (no una URL pública: el bucket es
--    privado y se sirve con signed URL, a diferencia de SISRES que
--    guarda una ruta pública en disco).
--
-- Antes de correr esto en un ambiente con datos reales de prueba:
-- confirmar que ninguna de las 12 columnas a borrar tiene datos que
-- Daniel no quiera perder (dev/staging, no producción — no debería
-- haber datos clínicos reales todavía, pero no se verificó por falta
-- de acceso directo a la BD de Supabase en esta sesión).
-- ============================================================

-- ─── 1. Quitar columnas sin equivalente real en SISRES ─────────────────────

ALTER TABLE medical_services DROP COLUMN IF EXISTS condicion;
ALTER TABLE medical_services DROP COLUMN IF EXISTS medio_asignacion;
ALTER TABLE medical_services DROP COLUMN IF EXISTS turno_facturacion;
ALTER TABLE medical_services DROP COLUMN IF EXISTS deducible;
ALTER TABLE medical_services DROP COLUMN IF EXISTS incapa;
ALTER TABLE medical_services DROP COLUMN IF EXISTS situacion;
ALTER TABLE medical_services DROP COLUMN IF EXISTS tiempo_a_restar;
ALTER TABLE medical_services DROP COLUMN IF EXISTS poliza;
ALTER TABLE medical_services DROP COLUMN IF EXISTS funcionario_aseguradora;
ALTER TABLE medical_services DROP COLUMN IF EXISTS codigo_telemedicina;
ALTER TABLE medical_services DROP COLUMN IF EXISTS correo_electronico;
ALTER TABLE medical_services DROP COLUMN IF EXISTS motivo_consulta;

-- ─── 2. Agregar Boleta de Salida (columna `imagen` de SISRES) ──────────────

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS imagen_boleta_salida TEXT;
COMMENT ON COLUMN medical_services.imagen_boleta_salida IS
  'Ruta dentro del bucket de Storage servicios-boletas (no URL pública) — equivalente a la columna imagen de SISRES (Boleta de Salida)';

-- Bucket privado — a diferencia de "branding" (migración 056), la boleta
-- puede mostrar datos identificables del paciente/servicio, así que no
-- se sirve como asset público.
INSERT INTO storage.buckets (id, name, public)
VALUES ('servicios-boletas', 'servicios-boletas', false)
ON CONFLICT (id) DO NOTHING;

-- Mismo alcance de roles que ya oculta esta sección completa en SISRES
-- (editarServicio.php: "!$esMedicoAux" — Médico/Auxiliar no ven ni suben
-- la boleta, ni siquiera la de su propio servicio).
DROP POLICY IF EXISTS servicios_boletas_select ON storage.objects;
CREATE POLICY servicios_boletas_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'servicios-boletas' AND get_user_role() IN ('ADMIN','REGULACION','ANALISTA'));

DROP POLICY IF EXISTS servicios_boletas_insert ON storage.objects;
CREATE POLICY servicios_boletas_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'servicios-boletas' AND get_user_role() IN ('ADMIN','REGULACION','ANALISTA'));

DROP POLICY IF EXISTS servicios_boletas_update ON storage.objects;
CREATE POLICY servicios_boletas_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'servicios-boletas' AND get_user_role() IN ('ADMIN','REGULACION','ANALISTA'))
  WITH CHECK (bucket_id = 'servicios-boletas' AND get_user_role() IN ('ADMIN','REGULACION','ANALISTA'));

DROP POLICY IF EXISTS servicios_boletas_delete ON storage.objects;
CREATE POLICY servicios_boletas_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'servicios-boletas' AND get_user_role() IN ('ADMIN','REGULACION','ANALISTA'));
