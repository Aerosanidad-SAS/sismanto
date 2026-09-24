-- 068 · Borrado suave de valoraciones (V3 del plan docs/PARIDAD_VALORACIONES.md)
-- En SISRES "eliminar" una valoración la desactiva (delete.php, accion 'soft'), no la borra.
-- `activo` reemplaza la bandera `estado` (tinyint 1 = activa) de SISRES. El campo `estado` de SISMANTO
-- sigue siendo el select ACTIVO/INACTIVO del formulario (estadoServicio en SISRES): son dos cosas distintas.
-- Idempotente. No requiere política nueva: desactivar es un UPDATE y ya lo cubre medical_assessments_write
-- (ADMIN, MEDICO, ANALISTA); la restricción de quién puede eliminar se aplica en la acción del servidor.

ALTER TABLE medical_assessments ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_medical_assessments_activo ON medical_assessments(activo) WHERE activo = TRUE;
