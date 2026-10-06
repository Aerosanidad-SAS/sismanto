-- ============================================================
-- Migración 117: Mantenimiento también puede avalar o rechazar una solicitud de NO APTO
--
-- La migración 113 (solicitudes de NO APTO) dejó resolver solo a ADMIN y COORDINACION, pero el propio texto que
-- ve el OVEM y el que ve Regulación («Coordinación o Mantenimiento resuelven la solicitud» /
-- «Coordinación o Mantenimiento deben avalarlo», src/lib/solicitud-no-apto.ts y
-- src/components/dashboard/incident-form.tsx) siempre dijo Mantenimiento también — se quedó sin escribir en la
-- RLS ni en la acción de servidor. Mantenimiento ya ve la lista de pendientes (migración 113, sin cambios), solo
-- no podía resolverlas: el botón de Avalar/Rechazar nunca se le mostraba, y si hubiera llegado a intentarlo, la
-- RLS lo habría rechazado igual.
--
-- A diferencia de Coordinación (que solo resuelve las de su propio centro — ROLES_POR_CENTRO en auth-utils.ts),
-- Mantenimiento no está en esa lista en ningún otro lugar del sistema: ve y actúa sobre toda la flota sin
-- distinción de centro, así que tampoco se le restringe aquí.
--
-- (SELECT get_user_role()) ya venía envuelto desde la 113 — se mantiene igual.
-- Idempotente.
-- ============================================================

DROP POLICY IF EXISTS no_apto_update ON vehicle_no_apto_solicitudes;
CREATE POLICY no_apto_update ON vehicle_no_apto_solicitudes
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role()) IN ('ADMIN', 'COORDINACION', 'MANTENIMIENTO') AND estado = 'PENDIENTE')
  WITH CHECK ((SELECT get_user_role()) IN ('ADMIN', 'COORDINACION', 'MANTENIMIENTO') AND revisado_por = (SELECT auth.uid()));
