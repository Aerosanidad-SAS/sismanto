-- Migración 064: registro de avisos de vencimiento enviados (F-15 del PRD).
--
-- El cron de correo (src/app/api/cron/send-expiry-alerts) necesita saber qué
-- ya avisó para no repetir el mismo hito todos los días durante 30 días.
-- `milestone` incluye la fecha de vencimiento (o la fecha del ciclo de
-- mantenimiento) para que, si el documento se renueva o el mantenimiento se
-- realiza, un vencimiento futuro pueda volver a avisar sin quedar bloqueado
-- por el envío anterior.
--
-- Idempotente.

CREATE TABLE IF NOT EXISTS expiry_alerts_log (
  id         SERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  item_type  VARCHAR(20) NOT NULL CHECK (item_type IN ('SOAT', 'TECNICOMECANICA', 'PASE_AEROPORTUARIO', 'MANTENIMIENTO')),
  -- 'DOC' para los 3 documentos del vehículo; el id del ítem del plan para mantenimiento.
  item_key   VARCHAR(50) NOT NULL DEFAULT 'DOC',
  milestone  VARCHAR(60) NOT NULL,
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_expiry_alert UNIQUE (vehicle_id, item_type, item_key, milestone)
);

CREATE INDEX IF NOT EXISTS idx_expiry_alerts_vehicle ON expiry_alerts_log(vehicle_id);

ALTER TABLE expiry_alerts_log ENABLE ROW LEVEL SECURITY;

-- El cron escribe con el cliente admin (service role, salta RLS). Esta
-- política solo cubre la consulta del historial desde la aplicación.
DROP POLICY IF EXISTS "select_expiry_alerts_log" ON expiry_alerts_log;
CREATE POLICY "select_expiry_alerts_log" ON expiry_alerts_log
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'ANALISTA', 'MANTENIMIENTO', 'COORDINACION'));
