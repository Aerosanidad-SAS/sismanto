-- ============================================================
-- Migración 019: Endurecimiento seguridad + rendimiento (advisors Supabase)
-- Idempotente. Aplicar en Supabase (SQL Editor o MCP apply_migration).
--
-- Qué corrige:
--   - RPC get_user_role / get_user_center: EXECUTE solo authenticated + service_role (no anon/public)
--   - Funciones: search_path fijo (linter 0011)
--   - Vista vehicle_maintenance_alerts: security_invoker (linter 0010)
--   - RLS checklist_items, daily_check_items, maintenance_items: sin anon ni USING(true) en escritura
--   - Índice FK daily_check_items.checklist_item_id (linter 0001)
-- No activa "leaked password protection" (solo dashboard Auth de Supabase).
-- ============================================================

-- ─── 1. Funciones helper RBAC: search_path + grants ─────────────────────────
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID DEFAULT auth.uid())
RETURNS VARCHAR(50)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT r.codigo FROM user_profiles up
  JOIN roles r ON r.id = up.role_id
  WHERE up.user_id = p_user_id AND up.activo = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_center(p_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT operational_center_id
  FROM user_profiles
  WHERE user_id = p_user_id
    AND activo = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_center(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_center(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_center(uuid) TO service_role;

-- ─── 2. Triggers / plpgsql: search_path fijo ─────────────────────────────────
ALTER FUNCTION public.actualizar_estado_vehiculo_por_incidente() SET search_path = public;
ALTER FUNCTION public.validar_kilometraje_incremental() SET search_path = public;
ALTER FUNCTION public.calcular_tiempo_resolucion() SET search_path = public;
ALTER FUNCTION public.validar_km_daily_check() SET search_path = public;
ALTER FUNCTION public.actualizar_checklist_ok() SET search_path = public;

DO $$
BEGIN
  IF to_regprocedure('public.trg_set_training_attempts_updated_at()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.trg_set_training_attempts_updated_at() SET search_path = public';
  END IF;
END $$;

-- ─── 3. Vista alertas mantenimiento: invoker (RLS del usuario que consulta) ─
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'vehicle_maintenance_alerts'
      AND c.relkind = 'v'
  ) THEN
    EXECUTE 'ALTER VIEW public.vehicle_maintenance_alerts SET (security_invoker = true)';
  END IF;
END $$;

-- ─── 4. Índice FK (performance) ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_daily_check_items_checklist_item_id
  ON public.daily_check_items (checklist_item_id);

-- Re-ejecución segura (evita ERROR 42710: policy already exists)
DROP POLICY IF EXISTS "checklist_items_select_auth" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_insert_admin" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_update_admin" ON public.checklist_items;
DROP POLICY IF EXISTS "checklist_items_delete_admin" ON public.checklist_items;
DROP POLICY IF EXISTS "daily_check_items_select" ON public.daily_check_items;
DROP POLICY IF EXISTS "daily_check_items_insert" ON public.daily_check_items;
DROP POLICY IF EXISTS "daily_check_items_update" ON public.daily_check_items;
DROP POLICY IF EXISTS "maintenance_items_select" ON public.maintenance_items;
DROP POLICY IF EXISTS "maintenance_items_insert" ON public.maintenance_items;
DROP POLICY IF EXISTS "maintenance_items_update" ON public.maintenance_items;
DROP POLICY IF EXISTS "maintenance_items_delete" ON public.maintenance_items;

-- ─── 5. RLS: checklist_items ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Auth: leer checklist_items" ON public.checklist_items;
DROP POLICY IF EXISTS "Auth: escribir checklist_items" ON public.checklist_items;
DROP POLICY IF EXISTS "Anon: leer checklist_items" ON public.checklist_items;

CREATE POLICY "checklist_items_select_auth"
  ON public.checklist_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "checklist_items_insert_admin"
  ON public.checklist_items
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT get_user_role()) = 'ADMIN');

CREATE POLICY "checklist_items_update_admin"
  ON public.checklist_items
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role()) = 'ADMIN')
  WITH CHECK ((SELECT get_user_role()) = 'ADMIN');

CREATE POLICY "checklist_items_delete_admin"
  ON public.checklist_items
  FOR DELETE TO authenticated
  USING ((SELECT get_user_role()) = 'ADMIN');

-- ─── 6. RLS: daily_check_items (alineado a daily_checks + COORDINACION) ──────
DROP POLICY IF EXISTS "Auth: leer daily_check_items" ON public.daily_check_items;
DROP POLICY IF EXISTS "Auth: insertar daily_check_items" ON public.daily_check_items;
DROP POLICY IF EXISTS "Auth: actualizar daily_check_items" ON public.daily_check_items;
DROP POLICY IF EXISTS "Anon: todo daily_check_items" ON public.daily_check_items;

CREATE POLICY "daily_check_items_select"
  ON public.daily_check_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_checks dc
      WHERE dc.id = daily_check_items.daily_check_id
        AND (
          (SELECT get_user_role()) IN ('ADMIN', 'GERENCIAL', 'REGULACION', 'COORDINACION')
          OR (
            (SELECT get_user_role()) = 'OVEM'
            AND dc.user_id = (SELECT auth.uid())
          )
        )
    )
  );

CREATE POLICY "daily_check_items_insert"
  ON public.daily_check_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_checks dc
      WHERE dc.id = daily_check_id
        AND (
          ((SELECT get_user_role()) = 'OVEM' AND dc.user_id = (SELECT auth.uid()))
          OR (SELECT get_user_role()) = 'ADMIN'
        )
    )
  );

CREATE POLICY "daily_check_items_update"
  ON public.daily_check_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_checks dc
      WHERE dc.id = daily_check_items.daily_check_id
        AND (
          ((SELECT get_user_role()) = 'OVEM' AND dc.user_id = (SELECT auth.uid()))
          OR (SELECT get_user_role()) = 'ADMIN'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_checks dc
      WHERE dc.id = daily_check_items.daily_check_id
        AND (
          ((SELECT get_user_role()) = 'OVEM' AND dc.user_id = (SELECT auth.uid()))
          OR (SELECT get_user_role()) = 'ADMIN'
        )
    )
  );

-- ─── 7. RLS: maintenance_items (lectura vía RLS de maintenance_records) ─────
DROP POLICY IF EXISTS "Auth: todo maintenance_items" ON public.maintenance_items;
DROP POLICY IF EXISTS "Anon: todo maintenance_items" ON public.maintenance_items;

CREATE POLICY "maintenance_items_select"
  ON public.maintenance_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.maintenance_records mr
      WHERE mr.id_manto = maintenance_items.maintenance_record_id
    )
  );

CREATE POLICY "maintenance_items_insert"
  ON public.maintenance_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maintenance_records mr
      WHERE mr.id_manto = maintenance_items.maintenance_record_id
    )
    AND (SELECT get_user_role()) IN ('ADMIN', 'MANTENIMIENTO')
  );

CREATE POLICY "maintenance_items_update"
  ON public.maintenance_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.maintenance_records mr
      WHERE mr.id_manto = maintenance_items.maintenance_record_id
    )
    AND (SELECT get_user_role()) IN ('ADMIN', 'MANTENIMIENTO')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.maintenance_records mr
      WHERE mr.id_manto = maintenance_items.maintenance_record_id
    )
    AND (SELECT get_user_role()) IN ('ADMIN', 'MANTENIMIENTO')
  );

CREATE POLICY "maintenance_items_delete"
  ON public.maintenance_items
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.maintenance_records mr
      WHERE mr.id_manto = maintenance_items.maintenance_record_id
    )
    AND (SELECT get_user_role()) IN ('ADMIN', 'MANTENIMIENTO')
  );
