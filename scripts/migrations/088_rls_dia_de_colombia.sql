-- Migración 088: las políticas que exigen "hoy" usan el día de Colombia, no el de UTC.
--
-- Síntoma: entre las 19:00 y las 23:59 hora Colombia (00:00–04:59 UTC) un OVEM que ya guardó su preoperacional o su
-- dotación del día no puede volver a editarlos: el guardado falla. La aplicación calcula "hoy" con el día de Colombia
-- (src/lib/fechas.ts → hoyBogota) y guarda `fecha` con ese valor, pero las políticas UPDATE comparan `fecha = CURRENT_DATE`,
-- y `CURRENT_DATE` se evalúa en la zona de la sesión de la base (UTC en Supabase): en esa franja ya es el día siguiente,
-- la fila no cumple `USING` y el upsert que cae en la rama UPDATE se rechaza.
--
-- Arreglo: `hoy_bogota()` devuelve la fecha actual en America/Bogota y reemplaza a `CURRENT_DATE` en las tres políticas.
-- La lógica de quién puede editar qué NO cambia (mismo rol, mismo dueño, mismo día): solo cambia qué día es "hoy".
--   · daily_checks.update_daily_checks (004)
--   · supply_checks.update_supply_checks (060)
--   · supply_check_items.write_supply_check_items (060)
-- Idempotente. Sin DROP de datos ni cambio de tipos.

CREATE OR REPLACE FUNCTION public.hoy_bogota()
RETURNS DATE
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT (now() AT TIME ZONE 'America/Bogota')::date;
$$;

REVOKE ALL ON FUNCTION public.hoy_bogota() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hoy_bogota() TO authenticated, service_role;

DROP POLICY IF EXISTS "update_daily_checks" ON daily_checks;
CREATE POLICY "update_daily_checks" ON daily_checks
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'OVEM'
    AND user_id = auth.uid()
    AND fecha = public.hoy_bogota()
  )
  WITH CHECK (
    get_user_role() = 'OVEM'
    AND user_id = auth.uid()
    AND fecha = public.hoy_bogota()
  );

DROP POLICY IF EXISTS "update_supply_checks" ON supply_checks;
CREATE POLICY "update_supply_checks" ON supply_checks
  FOR UPDATE TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'ANALISTA')
    OR (user_id = auth.uid() AND fecha = public.hoy_bogota())
  )
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'ANALISTA')
    OR (user_id = auth.uid() AND fecha = public.hoy_bogota())
  );

DROP POLICY IF EXISTS "write_supply_check_items" ON supply_check_items;
CREATE POLICY "write_supply_check_items" ON supply_check_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM supply_checks sc
      WHERE sc.id = supply_check_items.supply_check_id
        AND (get_user_role() IN ('ADMIN', 'ANALISTA') OR (sc.user_id = auth.uid() AND sc.fecha = public.hoy_bogota()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM supply_checks sc
      WHERE sc.id = supply_check_items.supply_check_id
        AND (get_user_role() IN ('ADMIN', 'ANALISTA') OR (sc.user_id = auth.uid() AND sc.fecha = public.hoy_bogota()))
    )
  );
