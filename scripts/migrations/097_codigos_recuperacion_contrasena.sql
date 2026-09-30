-- ============================================================
-- Migración 097: códigos para recuperar la contraseña
--
-- SISRES: recuperarPassword.php (2026-08-06, tabla password_reset_codes): con la cédula se envía al correo del
-- perfil un código de 6 dígitos, válido 15 minutos, de un solo uso y con máximo 5 intentos. En SISMANTO no había
-- ninguna forma de recuperar la clave: solo un ADMIN podía cambiarla.
--
-- Solo se guarda el HASH del código (nunca el código). La tabla no tiene políticas: con RLS activa, ningún usuario
-- (ni anónimo ni autenticado) puede leerla ni escribirla; solo el servidor con la clave de servicio.
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_hash TEXT NOT NULL,
  expira_en   TIMESTAMPTZ NOT NULL,
  intentos    SMALLINT NOT NULL DEFAULT 0,
  usado       BOOLEAN NOT NULL DEFAULT false,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_user ON password_reset_codes(user_id, creado_en DESC);

ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;
-- Sin políticas a propósito (ver arriba).

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('password_reset_codes');
  END IF;
END $$;
