-- ============================================================
-- Migración 100: enlace público de seguimiento GPS del servicio
--
-- SISRES: servicios.token_seguimiento (includes/seguimientoHelper.php) + PHPMailer/seguimiento.php?token=: el paciente
-- recibe por WhatsApp/correo un enlace, sin sesión, para ver en el mapa la ambulancia que va en camino. El token es
-- opaco (256 bits): antes SISRES usaba ?id= y cualquiera podía ver servicios ajenos cambiando el número.
--
-- Aquí además el enlace vence: vale 24 h desde que se generó y solo mientras el servicio está en PROGRAMADO o CURSO
-- (lo valida el servidor). La página pública lee con la clave de servicio y solo muestra placa y posición, ningún dato
-- del paciente. No hace falta política nueva: medical_services ya tiene su RLS y el acceso público no pasa por ella.
-- Solo ADD COLUMN IF NOT EXISTS: no es destructiva. Idempotente.
-- ============================================================

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS token_seguimiento TEXT;
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS token_seguimiento_creado TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS uq_medical_services_token_seguimiento
  ON medical_services(token_seguimiento) WHERE token_seguimiento IS NOT NULL;
