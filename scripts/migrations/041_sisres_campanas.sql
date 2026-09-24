-- ============================================================
-- Migración 041: Integración SISRES — campañas WhatsApp
-- Fase 2 del plan. Origen: tablas `campana` y `campana_destinatario`
-- de SISRES (sql/campanas.sql). El envío real lo hace el servicio
-- src/lib/notifications/whatsapp.ts (WhatsApp Cloud API de Meta).
-- ============================================================

CREATE TABLE IF NOT EXISTS wa_campaigns (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  plantilla VARCHAR(120) NOT NULL,
  idioma VARCHAR(10) NOT NULL DEFAULT 'es_CO',
  estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
    CHECK (estado IN ('BORRADOR','EN_PROCESO','COMPLETADA','CANCELADA')),
  media_tipo VARCHAR(20),
  media_id VARCHAR(200),
  media_nombre VARCHAR(200),
  total_destinatarios INTEGER DEFAULT 0,
  total_enviados INTEGER DEFAULT 0,
  total_fallidos INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wa_campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES wa_campaigns(id) ON DELETE CASCADE,
  telefono VARCHAR(20) NOT NULL,
  nombre VARCHAR(200),
  parametros JSONB,
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (estado IN ('PENDIENTE','ENVIADO','FALLIDO')),
  wamid VARCHAR(120),
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_recipients_campaign ON wa_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_wa_recipients_estado ON wa_campaign_recipients(estado);

-- Log general de notificaciones salientes (WhatsApp / correo),
-- independiente de campañas: los módulos de servicios lo usan
-- para dejar rastro de cada notificación automática.
CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('WHATSAPP','EMAIL')),
  destinatario VARCHAR(255) NOT NULL,
  asunto VARCHAR(255),
  plantilla VARCHAR(120),
  referencia VARCHAR(120),
  ok BOOLEAN NOT NULL,
  error TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_fecha ON notification_log(created_at);

-- RLS
-- ============================================================
ALTER TABLE wa_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS wa_campaigns_all ON wa_campaigns;
CREATE POLICY wa_campaigns_all ON wa_campaigns
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION'))
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION'));

DROP POLICY IF EXISTS wa_recipients_all ON wa_campaign_recipients;
CREATE POLICY wa_recipients_all ON wa_campaign_recipients
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION'))
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION'));

DROP POLICY IF EXISTS notification_log_select ON notification_log;
CREATE POLICY notification_log_select ON notification_log
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','COORDINACION'));

DROP POLICY IF EXISTS notification_log_insert ON notification_log;
CREATE POLICY notification_log_insert ON notification_log
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('ADMIN','COORDINACION','REGULACION','MEDICO','AUXILIAR_ENFERMERIA'));
