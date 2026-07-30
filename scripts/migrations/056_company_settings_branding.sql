-- ============================================================
-- Migración 056: configuración de marca (logo) + bucket de Storage.
--
-- Daniel (2026-07-30): el logo del sidebar se ve diminuto y pide que
-- sea configurable — que un Admin pueda subir su propia imagen en vez
-- de depender del archivo estático /brand/alianza.png.
--
-- No existe tabla de configuración general de la empresa (verificado
-- antes de esta migración) ni uso de Supabase Storage en ningún punto
-- del proyecto — todo lo que sube archivos hoy usa OneDrive/Graph API,
-- pensado para documentos, no para un asset público servido en cada
-- carga de página. Storage es la ruta correcta para esto.
-- ============================================================

-- ─── 1. Tabla de configuración (fila única) ────────────────────────────────

CREATE TABLE IF NOT EXISTS company_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  CONSTRAINT company_settings_single_row CHECK (id = 1)
);

INSERT INTO company_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer (el logo se muestra en el
-- sidebar a todos los roles); solo ADMIN puede escribir.
DROP POLICY IF EXISTS company_settings_select ON company_settings;
CREATE POLICY company_settings_select ON company_settings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS company_settings_update ON company_settings;
CREATE POLICY company_settings_update ON company_settings
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- ─── 2. Bucket de Storage público para assets de marca ─────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS branding_public_read ON storage.objects;
CREATE POLICY branding_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'branding');

DROP POLICY IF EXISTS branding_admin_insert ON storage.objects;
CREATE POLICY branding_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS branding_admin_update ON storage.objects;
CREATE POLICY branding_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND get_user_role() = 'ADMIN')
  WITH CHECK (bucket_id = 'branding' AND get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS branding_admin_delete ON storage.objects;
CREATE POLICY branding_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND get_user_role() = 'ADMIN');
