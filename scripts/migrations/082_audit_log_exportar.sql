-- 082 · Bitácora: acción EXPORTAR (quién sacó datos a Excel/archivo y cuántas filas). Idempotente.
--
-- Las exportaciones sacan datos personales (teléfonos, pacientes, servicios) fuera del sistema y hasta ahora no dejaban rastro:
-- no cabían en INSERTAR/MODIFICAR/… sin disfrazarse. Se amplía la lista de acciones permitidas de `audit_log`.
-- Cambiar el CHECK es DDL: no toca las filas (el trigger de inmutabilidad solo bloquea UPDATE/DELETE/TRUNCATE).

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_action_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_action_check
  CHECK (action IN ('INSERTAR','MODIFICAR','ELIMINAR','LOGIN','LOGOUT','NOTIFICAR','ERROR','EXPORTAR'));
