-- 075 · Valoraciones V5: correo del pasajero y registro del envío del certificado por correo
-- (SISRES: columna `correo` de `valoraciones` y tcpdf/EnviarValoracionCorreo.php). Idempotente.
--
-- `correo` es un dato personal del pasajero y el certificado es un documento clínico: por eso se guarda además
-- CUÁNDO y A QUÉ dirección se envió (`certificado_enviado_*`), algo que SISRES no registraba. Así se puede
-- responder "¿a quién se le mandó este certificado y cuándo?".

ALTER TABLE medical_assessments ADD COLUMN IF NOT EXISTS correo VARCHAR(150);
ALTER TABLE medical_assessments ADD COLUMN IF NOT EXISTS certificado_enviado_at TIMESTAMPTZ;
ALTER TABLE medical_assessments ADD COLUMN IF NOT EXISTS certificado_enviado_a VARCHAR(150);

COMMENT ON COLUMN medical_assessments.correo IS 'Correo del pasajero (dato personal). Destino del certificado si se envía por correo.';
COMMENT ON COLUMN medical_assessments.certificado_enviado_at IS 'Último envío del certificado por correo.';
COMMENT ON COLUMN medical_assessments.certificado_enviado_a IS 'Dirección a la que se envió por última vez (puede diferir de `correo` si se corrigió después).';
