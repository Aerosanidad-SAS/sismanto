-- 078 · Campañas WhatsApp: pausar, reanudar y cancelar (SISRES: includes/wa/estadoCampana.php) + envío sin duplicados.
-- Idempotente.
--
--   wa_campaigns.estado            += 'PAUSADA'
--   wa_campaign_recipients.estado  += 'ENVIANDO'  (destinatario reclamado por un lote que lo está enviando)
--
-- Por qué 'ENVIANDO': el envío avanza mientras el navegador llama al lote una y otra vez. Con dos pestañas abiertas (o al
-- reanudar mientras un lote viejo sigue corriendo) dos lotes leían los MISMOS pendientes y les mandaban el mensaje dos veces
-- a pacientes reales. Ahora cada destinatario se reclama con un UPDATE condicional (PENDIENTE → ENVIANDO) antes de enviarlo:
-- solo un lote lo consigue. Si el servidor cae en medio de un lote, el destinatario queda ENVIANDO y `sent_at` guarda
-- cuándo se reclamó: el código lo devuelve a PENDIENTE pasados unos minutos.

-- Los CHECK de columna tienen nombre automático; se buscan por su definición para no depender de él.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.conname, c.conrelid::regclass AS tabla
      FROM pg_constraint c
     WHERE c.contype = 'c'
       AND c.conrelid IN ('public.wa_campaigns'::regclass, 'public.wa_campaign_recipients'::regclass)
       AND pg_get_constraintdef(c.oid) LIKE '%estado%'
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tabla, r.conname);
  END LOOP;
END;
$$;

ALTER TABLE wa_campaigns
  ADD CONSTRAINT wa_campaigns_estado_check
  CHECK (estado IN ('BORRADOR','EN_PROCESO','PAUSADA','COMPLETADA','CANCELADA'));

ALTER TABLE wa_campaign_recipients
  ADD CONSTRAINT wa_campaign_recipients_estado_check
  CHECK (estado IN ('PENDIENTE','ENVIANDO','ENVIADO','FALLIDO'));
