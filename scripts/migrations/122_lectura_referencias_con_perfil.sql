-- ============================================================
-- Migración 122: leer tablas de referencia exige un perfil activo (revisión de seguridad pre-producción, 2026-10-06)
--
-- Problema (MEDIO): 12 tablas tenían una política de lectura `USING (true)` para `authenticated` (la 13.ª,
-- `rtm_historico`, equivalente con `auth.role()`): `medical_providers` (directorio de prestadores con teléfono y
-- correo, 1.332 filas), `maintenance_plan_items`, `vehicle_status_history`, `vehicle_maintenance_log`,
-- `checklist_items`, `training_questions`, `training_question_options`, `campos_obligatorios`,
-- `servicio_opciones_campo`, `rol_modulo_oculto`, `rtm_historico`, `eps`, `cie10`. «Authenticated» no significa
-- «empleado»: mientras el registro público de Supabase Auth siga abierto (hallazgo 2 de la auditoría del 2026-10-01,
-- sin confirmación de cierre), cualquiera con un correo se crea una cuenta sin rol ni perfil y lee todo eso con solo
-- la clave pública.
--
-- Arreglo: las 13 políticas pasan a `(SELECT get_user_role()) IS NOT NULL`: hace falta un perfil ACTIVO con rol
-- (`get_user_role()` devuelve NULL sin perfil o con `activo = false`). Para cualquier usuario real nada cambia: todos
-- los roles de la app tienen perfil. Los roles restringidos (TECNICO, AEROPUERTO) siguen cubiertos por la política
-- restrictiva `zz_rol_restringido` de cada tabla. Se envuelve en `(SELECT ...)` para que Postgres lo evalúe una vez
-- por consulta y no una por fila (`cie10` tiene 12.634 filas).
--
-- NO se toca `company_settings`: la pantalla de login y la de «pendiente» muestran el logo sin perfil.
-- Esto no sustituye cerrar el registro público en el panel de Supabase Auth (decisión de Daniel); lo vuelve inocuo.
-- Idempotente. Rollback: recrear cada política con USING (true) (no recomendado).
-- ============================================================

DROP POLICY IF EXISTS campos_obligatorios_select ON campos_obligatorios;
CREATE POLICY campos_obligatorios_select ON campos_obligatorios
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS checklist_items_select_auth ON checklist_items;
CREATE POLICY checklist_items_select_auth ON checklist_items
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS cie10_select ON cie10;
CREATE POLICY cie10_select ON cie10
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS eps_select ON eps;
CREATE POLICY eps_select ON eps
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS mpi_select ON maintenance_plan_items;
CREATE POLICY mpi_select ON maintenance_plan_items
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS medical_providers_select ON medical_providers;
CREATE POLICY medical_providers_select ON medical_providers
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS rol_modulo_oculto_select ON rol_modulo_oculto;
CREATE POLICY rol_modulo_oculto_select ON rol_modulo_oculto
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS servicio_opciones_select ON servicio_opciones_campo;
CREATE POLICY servicio_opciones_select ON servicio_opciones_campo
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS tqo_select ON training_question_options;
CREATE POLICY tqo_select ON training_question_options
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS tq_select ON training_questions;
CREATE POLICY tq_select ON training_questions
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS vml_select ON vehicle_maintenance_log;
CREATE POLICY vml_select ON vehicle_maintenance_log
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS vsh_select ON vehicle_status_history;
CREATE POLICY vsh_select ON vehicle_status_history
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS rtm_historico_read ON rtm_historico;
CREATE POLICY rtm_historico_read ON rtm_historico
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IS NOT NULL);
