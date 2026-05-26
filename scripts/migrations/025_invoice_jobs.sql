-- 025_invoice_jobs.sql
-- Automated invoice processing: job queue, webhook subscriptions
-- Next migration: 026_*.sql

-- ── onedrive_subscriptions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.onedrive_subscriptions (
  id            TEXT        PRIMARY KEY,  -- Graph subscription ID
  resource      TEXT        NOT NULL,
  notification_url TEXT     NOT NULL,
  expiration_datetime TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── invoice_jobs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoice_jobs (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  status             TEXT        NOT NULL DEFAULT 'pending'
    CONSTRAINT invoice_jobs_status_check
      CHECK (status IN ('pending','processing','completed','needs_review','error')),
  source_file_name   TEXT,
  source_file_path   TEXT,
  onedrive_item_id   TEXT,
  extracted_data     JSONB,
  vehicle_plate      TEXT,
  vehicle_id         UUID        REFERENCES public.vehicles(id) ON DELETE SET NULL,
  error_message      TEXT,
  processed_at       TIMESTAMPTZ,
  reviewed_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS invoice_jobs_status_idx      ON public.invoice_jobs(status);
CREATE INDEX IF NOT EXISTS invoice_jobs_created_at_idx  ON public.invoice_jobs(created_at DESC);

-- ── Add invoice_job_id to maintenance_records ─────────────────────────────────
ALTER TABLE public.maintenance_records
  ADD COLUMN IF NOT EXISTS invoice_job_id UUID REFERENCES public.invoice_jobs(id) ON DELETE SET NULL;

-- ── Add onedrive_folder_id to vehicles (target folder per vehicle) ─────────────
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS onedrive_folder_id TEXT;

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.invoice_jobs ENABLE ROW LEVEL SECURITY;

-- Admin and Mantenimiento can select
CREATE POLICY "invoice_jobs_select"
  ON public.invoice_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
      WHERE up.user_id = auth.uid()
        AND up.activo = TRUE
        AND r.codigo IN ('ADMIN', 'MANTENIMIENTO')
    )
  );

-- Admin and Mantenimiento can update (for review UI approval/dismiss)
CREATE POLICY "invoice_jobs_update"
  ON public.invoice_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
      WHERE up.user_id = auth.uid()
        AND up.activo = TRUE
        AND r.codigo IN ('ADMIN', 'MANTENIMIENTO')
    )
  );

-- INSERT only via service role (webhook + cron use service role key, which bypasses RLS)
-- onedrive_subscriptions: only service role accesses this
ALTER TABLE public.onedrive_subscriptions ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE policies — only service_role key can access
