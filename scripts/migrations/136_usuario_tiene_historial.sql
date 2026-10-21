-- ============================================================
-- Migración 136: `usuario_tiene_historial(uuid)` — dónde tiene registros una persona antes de eliminarla
--
-- Eliminar un usuario (Administración → Usuarios) es seguro solo si NO dejó rastro. Varias tablas de historia (preoperacionales
-- `daily_checks`, `supply_checks`, asignaciones de vehículo, tripulación de servicios…) referencian `auth.users` con
-- ON DELETE CASCADE: un borrado de la cuenta las borraría en silencio; otras (ON DELETE SET NULL) perderían la autoría.
-- Esta función recorre en `pg_constraint` TODAS las llaves foráneas hacia `auth.users(id)` y `public.user_profiles(user_id)`
-- (una tabla nueva con llave queda cubierta sola) más unas pocas columnas de autoría que NO tienen llave (listadas abajo, a mano: una nueva sin llave hay que añadirla ahí) y devuelve las tablas donde la persona tiene filas.
-- Se ignoran solo las tablas de la cuenta misma, que se van con ella: perfil, datos personales y códigos de recuperación (`password_reset_codes`).
--
-- Solo la clave de servicio puede llamarla (la acción de servidor ya exigió ADMIN). No destructiva, idempotente.
-- Rollback: DROP FUNCTION IF EXISTS public.usuario_tiene_historial(uuid);
-- ============================================================

CREATE OR REPLACE FUNCTION public.usuario_tiene_historial(p_user uuid)
RETURNS TABLE (tabla text, filas bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  fk record;
  n bigint;
  -- Autoría sin llave foránea (089, 092, 093): borrar la cuenta las dejaría apuntando a un uuid inexistente.
  sin_llave constant text[][] := ARRAY[
    ['public.vehicle_annual_costs', 'created_by'],
    ['public.vehicle_model_specs', 'updated_by'],
    ['public.fuel_import_batches', 'created_by']
  ];
  i int;
BEGIN
  FOR fk IN
    SELECT c.conrelid::regclass::text AS tabla, a.attname AS columna
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
    WHERE c.contype = 'f'
      AND array_length(c.conkey, 1) = 1
      AND c.confrelid IN ('auth.users'::regclass, 'public.user_profiles'::regclass)
      AND c.conrelid NOT IN (
        'public.user_profiles'::regclass,
        'public.user_profile_extra'::regclass,
        'public.password_reset_codes'::regclass
      )
      AND c.connamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE %I = $1', fk.tabla, fk.columna) INTO n USING p_user;
    IF n > 0 THEN
      tabla := fk.tabla;
      filas := n;
      RETURN NEXT;
    END IF;
  END LOOP;
  FOR i IN 1 .. array_length(sin_llave, 1) LOOP
    EXECUTE format('SELECT count(*) FROM %s WHERE %I = $1', sin_llave[i][1], sin_llave[i][2]) INTO n USING p_user;
    IF n > 0 THEN
      tabla := sin_llave[i][1];
      filas := n;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.usuario_tiene_historial(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.usuario_tiene_historial(uuid) TO service_role;
