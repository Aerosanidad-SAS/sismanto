-- 077 · Bitácora de auditoría (SISRES: tabla `log_sistema`, includes/registrarLog.php, mostrarLog.php).
-- Registra quién hizo qué y cuándo (INSERTAR / MODIFICAR / ELIMINAR / LOGIN / LOGOUT / NOTIFICAR / ERROR). Idempotente.
--
-- Diseño (ver docs/PARIDAD_PERMISOS_COMUNICACIONES_BITACORA.md §4):
--   · SOLO la escribe el servidor con la clave de servicio: no hay política de INSERT para usuarios, así que nadie puede
--     falsificar una entrada desde la API pública. Solo el ADMIN puede LEER.
--   · Es un registro INMUTABLE: un trigger rechaza UPDATE, DELETE y TRUNCATE, incluso con la clave de servicio.
--     Para una purga por retención, un DBA debe hacer explícitamente `ALTER TABLE audit_log DISABLE TRIGGER USER`
--     y volver a activarlo: queda como un acto deliberado, no como un descuido de la aplicación.
--   · `user_id` no lleva FK: el rastro sobrevive aunque se elimine o desactive al usuario. Se guarda también su nombre/correo
--     y su rol AL MOMENTO del hecho (un cambio de rol posterior no reescribe la historia).
--   · `detail` es corto (500) a propósito: identifica el registro y qué cambió, NO copia datos clínicos ni personales.

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID,
  user_label VARCHAR(150) NOT NULL DEFAULT '',
  role VARCHAR(50) NOT NULL DEFAULT '',
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERTAR','MODIFICAR','ELIMINAR','LOGIN','LOGOUT','NOTIFICAR','ERROR')),
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL DEFAULT '',
  detail VARCHAR(500) NOT NULL DEFAULT '',
  ip VARCHAR(45) NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_audit_log_at ON audit_log(at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_label, at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_log_select ON audit_log;
CREATE POLICY audit_log_select ON audit_log
  FOR SELECT TO authenticated
  USING (get_user_role() = 'ADMIN');
-- Sin políticas de INSERT/UPDATE/DELETE para authenticated: solo el servidor (service_role) escribe.

CREATE OR REPLACE FUNCTION public.audit_log_inmutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log es un registro inmutable (% no permitido)', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS audit_log_no_modificar ON audit_log;
CREATE TRIGGER audit_log_no_modificar
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_inmutable();

DROP TRIGGER IF EXISTS audit_log_no_truncar ON audit_log;
CREATE TRIGGER audit_log_no_truncar
  BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION public.audit_log_inmutable();

-- Si ya está la migración 076 (roles restringidos), la tabla queda cubierta por su política restrictiva también.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('audit_log');
  END IF;
END;
$$;
