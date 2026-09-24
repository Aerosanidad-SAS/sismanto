-- 074 · Firma remota por correo del Acta de Entrega (SISRES: `firma_tokens`, firmarActaCorreo.php).
-- Al registrar un acta se puede elegir que quien RECIBE firme desde un enlace enviado a su correo, sin sesión ni cuenta:
-- "magic link" de un solo uso. Idempotente.
--
-- Diferencia deliberada con SISRES: el token NO se guarda en claro. Se guarda su SHA-256 (`token_hash`); el token
-- solo existe en el correo. Quien lea la tabla no puede armar un enlace de firma válido.
-- Todas las escrituras y la lectura pública las hace el servidor con la clave de servicio (que se salta el RLS);
-- ADMIN/ANALISTA solo pueden LEER (para mostrar "Pendiente de firma por correo" en el listado).

CREATE TABLE IF NOT EXISTS ti_firma_tokens (
  id SERIAL PRIMARY KEY,
  tabla VARCHAR(50) NOT NULL,                 -- formato al que pertenece (hoy solo 'ti_acta_entrega')
  registro_id INTEGER NOT NULL,
  campo_firma VARCHAR(30) NOT NULL,           -- qué firma del registro cubre ('recibe')
  token_hash CHAR(64) NOT NULL UNIQUE,        -- SHA-256 hex del token de 64 hex
  nombre_firmante VARCHAR(150) NOT NULL,
  correo_destino VARCHAR(150) NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  expira_en TIMESTAMPTZ NOT NULL,
  ip_firmante VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  firmado_en TIMESTAMPTZ
);

-- Buscar el token vigente de un registro (listado y reenvío).
CREATE INDEX IF NOT EXISTS idx_ti_firma_tokens_registro ON ti_firma_tokens(tabla, registro_id, campo_firma, usado);

ALTER TABLE ti_firma_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ti_firma_tokens_select ON ti_firma_tokens;
CREATE POLICY ti_firma_tokens_select ON ti_firma_tokens
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA'));
-- Sin políticas de INSERT/UPDATE/DELETE: un usuario autenticado no puede crear, reactivar ni borrar tokens.
