-- ============================================================
-- Migración 048: catálogo real de tipo de documento para patients
--
-- Hallazgo de QA (Daniel, 2026-07-21): el campo tipo_documento era
-- texto libre en la UI con un default 'CC' que no corresponde a
-- ningún valor real de SISRES. Verificado contra el <select> real de
-- sisres/registroPacientes.php: son 12 valores, varios más largos que
-- los 20 caracteres que permitía la columna (ej. "CERTIFICADO NACIDO
-- VIVO" = 23, "PERMISO ESPECIAL PERMANENCIA" = 29).
-- ============================================================

ALTER TABLE patients ALTER COLUMN tipo_documento TYPE VARCHAR(40);
ALTER TABLE patients ALTER COLUMN tipo_documento DROP DEFAULT;

UPDATE patients SET tipo_documento = 'CEDULA CIUDADANIA' WHERE tipo_documento = 'CC';
