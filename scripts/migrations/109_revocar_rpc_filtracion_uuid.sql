-- ============================================================
-- Migración 109: cierra dos formas de pedir nombre/rol de otro usuario por UUID, sin sesión
--
-- Auditoría de seguridad del 2026-10-01 (AUDITORIA_SEGURIDAD_2026-10-01.md, PR #160, hallazgo #1):
-- `get_user_role(uuid)` y `ticket_nombre_usuario(uuid)` son SECURITY DEFINER, propiedad de `postgres`
-- (bypassrls), y PostgREST las expone como RPC con EXECUTE a `anon` y `authenticated`. Ninguna comprobaba quién
-- la llamaba: cualquiera que supiera o adivinara un UUID de usuario podía pedir su nombre y su rol sin iniciar
-- sesión. Verificado en vivo contra staging el 2026-10-01 y reproducido otra vez al ensayar esta migración.
--
-- ⚠️ `get_user_role(uuid)` NO es una función aparte: es la MISMA que usan 211 políticas de RLS en todo el
-- esquema, con `p_user_id uuid DEFAULT auth.uid()` (se llama sin argumento en absolutamente todos esos casos —
-- comprobado por búsqueda, cero políticas ni funciones pasan un UUID explícito). Por eso NO se le toca el
-- GRANT — eso habría dejado SIN RLS A TODO EL SISTEMA para cualquier usuario autenticado en cuanto se aplicara
-- (se detectó justo así, ensayando en staging antes de abrir el PR: cada consulta de cualquier rol empezaba a
-- fallar con "permission denied for function get_user_role"). En vez de eso, se cambia el CUERPO: ya no permite
-- consultar el rol de alguien más, solo el propio. Como nadie en el código pasa un UUID ajeno, el comportamiento
-- para cada llamada real (sin argumento, o con el propio auth.uid()) queda idéntico — solo se cierra el caso que
-- nadie usaba legítimamente.
--
-- `ticket_nombre_usuario(uuid)` sí es una función aparte, sin valor por defecto, y nada la necesita abierta: la
-- única llamada que existe es interna, dentro de `tomar_ticket()`, que corre como el dueño de la función
-- (`postgres`) y no se ve afectada por quitarle el EXECUTE a `anon`/`authenticated`. A esta sí se le revoca.
--
-- Idempotente: CREATE OR REPLACE y REVOKE sobre un permiso que ya no existe no fallan.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid DEFAULT auth.uid())
 RETURNS character varying
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT r.codigo FROM user_profiles up
  JOIN roles r ON r.id = up.role_id
  WHERE up.user_id = p_user_id
    AND p_user_id = auth.uid()  -- nunca el rol de otra persona: nadie en el código pasa un UUID ajeno
    AND up.activo = true
  LIMIT 1;
$function$;

REVOKE EXECUTE ON FUNCTION public.ticket_nombre_usuario(uuid) FROM anon, authenticated;
