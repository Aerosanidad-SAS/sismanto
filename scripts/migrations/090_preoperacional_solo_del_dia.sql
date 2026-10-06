-- Migración 090: el OVEM solo registra y corrige el preoperacional de HOY.
--
-- Hueco: insert_daily_checks (006) no miraba la fecha, así que un OVEM podía crear un preoperacional de otro día; y
-- daily_check_items_insert/_update (019/047) dejaban al OVEM reescribir los ítems de cualquier preoperacional suyo,
-- incluso de días pasados (ej. cambiar una FALLA a OK después de un incidente). La actualización del encabezado ya
-- exigía el día (update_daily_checks, 088); ahora también la creación y los ítems.
--
-- ADMIN/ANALISTA conservan lo que tenían en la 047 (sin restricción de día). Se usa hoy_bogota() (088), no
-- CURRENT_DATE (UTC), y las funciones van en (SELECT ...) para evaluarse una vez por consulta (087).
--
-- Idempotente. Sin DROP de datos ni cambio de tipos.

DROP POLICY IF EXISTS "insert_daily_checks" ON daily_checks;
CREATE POLICY "insert_daily_checks" ON daily_checks
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT get_user_role()) = 'OVEM'
    AND user_id = (SELECT auth.uid())
    AND fecha = (SELECT public.hoy_bogota())
    AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = daily_checks.vehicle_id)
  );

DROP POLICY IF EXISTS "daily_check_items_insert" ON daily_check_items;
CREATE POLICY "daily_check_items_insert" ON daily_check_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_checks dc
      WHERE dc.id = daily_check_items.daily_check_id
        AND (
          (
            (SELECT get_user_role()) = 'OVEM'
            AND dc.user_id = (SELECT auth.uid())
            AND dc.fecha = (SELECT public.hoy_bogota())
          )
          OR (SELECT get_user_role()) IN ('ADMIN', 'ANALISTA')
        )
    )
  );

DROP POLICY IF EXISTS "daily_check_items_update" ON daily_check_items;
CREATE POLICY "daily_check_items_update" ON daily_check_items
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_checks dc
      WHERE dc.id = daily_check_items.daily_check_id
        AND (
          (
            (SELECT get_user_role()) = 'OVEM'
            AND dc.user_id = (SELECT auth.uid())
            AND dc.fecha = (SELECT public.hoy_bogota())
          )
          OR (SELECT get_user_role()) IN ('ADMIN', 'ANALISTA')
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_checks dc
      WHERE dc.id = daily_check_items.daily_check_id
        AND (
          (
            (SELECT get_user_role()) = 'OVEM'
            AND dc.user_id = (SELECT auth.uid())
            AND dc.fecha = (SELECT public.hoy_bogota())
          )
          OR (SELECT get_user_role()) IN ('ADMIN', 'ANALISTA')
        )
    )
  );
