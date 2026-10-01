-- 095 · Usuarios: código de acceso de 6 dígitos y cambio obligatorio de la clave inicial. Idempotente, aditiva.
--
--   · `user_profiles.codigo_acceso`: 6 números, único. Permite entrar escribiendo solo ese código (además de la cédula
--     o el correo). Lo genera la carga masiva; un admin puede asignarlo o cambiarlo.
--   · `user_profiles.debe_cambiar_password`: la carga masiva lo deja en TRUE; el sistema lleva a la persona a elegir su
--     propia clave en el primer ingreso y entonces lo pone en FALSE.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS codigo_acceso VARCHAR(6);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS debe_cambiar_password BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_codigo_acceso_check') THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_codigo_acceso_check
      CHECK (codigo_acceso IS NULL OR codigo_acceso ~ '^[0-9]{6}$');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_profiles_codigo_acceso
  ON user_profiles (codigo_acceso)
  WHERE codigo_acceso IS NOT NULL;

COMMENT ON COLUMN user_profiles.codigo_acceso IS 'Código numérico de 6 dígitos para iniciar sesión (alternativa a cédula y correo).';
COMMENT ON COLUMN user_profiles.debe_cambiar_password IS 'TRUE hasta que la persona cambie la clave inicial en su primer ingreso.';

-- Rollback:
-- DROP INDEX IF EXISTS uq_user_profiles_codigo_acceso;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS codigo_acceso, DROP COLUMN IF EXISTS debe_cambiar_password;
