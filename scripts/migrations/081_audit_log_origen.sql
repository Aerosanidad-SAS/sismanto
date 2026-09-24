-- 081 · Bitácora: origen de cada entrada, para importar el historial de SISRES (`log_sistema`) sin duplicarlo. Idempotente.
--
-- `origen` = de dónde viene la fila ('SISMANTO' las que escribe la aplicación; 'SISRES' las importadas). `origen_id` = el id
-- que tenía en el sistema de origen. El índice único (origen, origen_id) hace que volver a correr la importación no duplique nada.
-- Agregar columnas NO dispara el trigger de inmutabilidad (solo bloquea UPDATE/DELETE/TRUNCATE de filas): las entradas
-- existentes quedan intactas, con origen 'SISMANTO'.

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS origen VARCHAR(20) NOT NULL DEFAULT 'SISMANTO';
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS origen_id BIGINT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_audit_log_origen
  ON audit_log(origen, origen_id) WHERE origen_id IS NOT NULL;
