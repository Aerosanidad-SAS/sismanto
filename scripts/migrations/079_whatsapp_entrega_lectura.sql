-- 079 · WhatsApp: entregado y leído (SISRES: wa_api/waWebhook.php actualiza `fecha_entrega` y `fecha_lectura` por wamid).
-- Meta avisa por webhook cuando un mensaje se ENTREGA, se LEE o FALLA; hasta ahora SISMANTO solo sabía "ENVIADO/FALLIDO"
-- al llamar a la API. Idempotente.
--
--   wa_campaign_recipients.entregado_at / leido_at   cuándo (según Meta) llegó y cuándo se abrió el mensaje
--   wa_campaign_recipients.estado_meta               último estado que informó Meta (sent | delivered | read | failed)
--   wa_campaigns.total_entregados / total_leidos     contadores, recalculados desde los destinatarios (no acumulados)
--   índice por wamid                                 cada evento del webhook busca su destinatario por ahí

ALTER TABLE wa_campaign_recipients ADD COLUMN IF NOT EXISTS entregado_at TIMESTAMPTZ;
ALTER TABLE wa_campaign_recipients ADD COLUMN IF NOT EXISTS leido_at TIMESTAMPTZ;
ALTER TABLE wa_campaign_recipients ADD COLUMN IF NOT EXISTS estado_meta VARCHAR(20);

ALTER TABLE wa_campaigns ADD COLUMN IF NOT EXISTS total_entregados INTEGER NOT NULL DEFAULT 0;
ALTER TABLE wa_campaigns ADD COLUMN IF NOT EXISTS total_leidos INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_wa_recipients_wamid ON wa_campaign_recipients(wamid) WHERE wamid IS NOT NULL;
