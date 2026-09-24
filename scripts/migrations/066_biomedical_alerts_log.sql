-- Migración 066: registro de avisos de vencimiento de equipos biomédicos.
--
-- Equivalente a expiry_alerts_log (migración 064) pero para
-- biomedical_equipment en vez de vehicles — se separa porque tienen FKs a
-- tablas distintas. El cron de correo (src/app/api/cron/send-biomedical-alerts)
-- necesita saber qué ya avisó para no repetir el mismo hito todos los días
-- durante 30 días. `milestone` incluye la fecha de vencimiento para que, si
-- el mantenimiento/calibración/parche se renueva, el próximo ciclo pueda
-- volver a avisar sin quedar bloqueado por el envío anterior.
--
-- Idempotente.

CREATE TABLE IF NOT EXISTS biomedical_alerts_log (
  id           SERIAL PRIMARY KEY,
  equipment_id INTEGER NOT NULL REFERENCES biomedical_equipment(id) ON DELETE CASCADE,
  item_type    VARCHAR(20) NOT NULL CHECK (item_type IN ('MANTENIMIENTO', 'CALIBRACION', 'PARCHE_ADULTO', 'PARCHE_PEDIATRICO')),
  milestone    VARCHAR(60) NOT NULL,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_biomedical_alert UNIQUE (equipment_id, item_type, milestone)
);

CREATE INDEX IF NOT EXISTS idx_biomedical_alerts_equipment ON biomedical_alerts_log(equipment_id);

ALTER TABLE biomedical_alerts_log ENABLE ROW LEVEL SECURITY;

-- El cron escribe con el cliente admin (service role, salta RLS). Esta
-- política solo cubre la consulta del historial desde la aplicación —
-- mismos roles que pueden ver biomedical_equipment_select en 040.
DROP POLICY IF EXISTS "select_biomedical_alerts_log" ON biomedical_alerts_log;
CREATE POLICY "select_biomedical_alerts_log" ON biomedical_alerts_log
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN', 'MANTENIMIENTO', 'COORDINACION', 'GERENCIAL', 'ANALISTA'));
