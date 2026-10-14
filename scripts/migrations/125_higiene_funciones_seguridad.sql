-- 125_higiene_funciones_seguridad.sql
-- Higiene de funciones que marcan los avisos de seguridad de Supabase (get_advisors, security):
--   0011 function_search_path_mutable  → 9 funciones sin search_path fijo.
--   0028/0029 *_security_definer_function_executable → 5 funciones de trigger SECURITY DEFINER que cualquiera
--     (incluido `anon`) podía invocar por /rest/v1/rpc. No hace falta: un trigger no comprueba EXECUTE al dispararse.
-- Idempotente. No cambia ninguna lógica ni ninguna tabla.

-- ─── 1. Funciones de trigger SECURITY DEFINER: nadie las llama por RPC ───────────────────────────
REVOKE EXECUTE ON FUNCTION public.actualizar_estado_vehiculo_por_incidente() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.actualizar_km_actual_vehiculo()            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_medical_services_audit_finalizado()     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fn_ticket_historial_creacion()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_mileage_from_daily_check()            FROM PUBLIC, anon, authenticated;

-- ─── 2. search_path fijo (evita que un esquema escribible por el usuario sombree objetos) ───────
ALTER FUNCTION public.aplicar_politica_rol_restringido(text)                SET search_path = public, pg_temp;
ALTER FUNCTION public.audit_log_inmutable()                                 SET search_path = public, pg_temp;
ALTER FUNCTION public.costo_devengado(numeric, date, date, date, date)      SET search_path = public, pg_temp;
ALTER FUNCTION public.costos_por_vehiculo(date, date, text, integer, text[], text, text, text[]) SET search_path = public, pg_temp;
ALTER FUNCTION public.hoy_bogota()                                          SET search_path = public, pg_temp;
ALTER FUNCTION public.road_accident_fotos_inmutables()                      SET search_path = public, pg_temp;
ALTER FUNCTION public.tabla_permitida_a_rol_restringido(text)               SET search_path = public, pg_temp;
ALTER FUNCTION public.tablas_publicas_sin_rls()                             SET search_path = public, pg_temp;
ALTER FUNCTION public.tablas_sin_politica_rol_restringido()                 SET search_path = public, pg_temp;
