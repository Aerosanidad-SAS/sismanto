-- ============================================================
-- Migración 123: Regulación registra y edita clientes y prestadores (paridad con SISRES)
-- PARIDAD_REGULACION.md: CLI-04/CLI-05 (clientes) y PRV-06/PRV-07 (proveedores).
--
-- En SISRES el Regulador registra y edita clientes y proveedores (permisos act_registrar_* / act_editar_*) y NO los
-- elimina. En SISMANTO `clients` y `medical_providers` solo dejaban insertar y editar a ADMIN y ANALISTA, así que el
-- Regulador no podía dar de alta un cliente o un prestador nuevo al registrar un servicio.
--
-- Cambio: REGULACION se suma a las políticas de INSERT y UPDATE de ambas tablas. El borrado sigue siendo solo de ADMIN
-- (`clients_delete` y `medical_providers_delete`, sin tocar). No es destructiva: solo amplía quién puede escribir.
-- Idempotente. Rollback: recrear las cuatro políticas con ('ADMIN','ANALISTA').
-- ============================================================

DROP POLICY IF EXISTS clients_insert ON clients;
CREATE POLICY clients_insert ON clients
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'ANALISTA', 'REGULACION']::text[]));

DROP POLICY IF EXISTS clients_update ON clients;
CREATE POLICY clients_update ON clients
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'ANALISTA', 'REGULACION']::text[]))
  WITH CHECK ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'ANALISTA', 'REGULACION']::text[]));

DROP POLICY IF EXISTS medical_providers_insert ON medical_providers;
CREATE POLICY medical_providers_insert ON medical_providers
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'ANALISTA', 'REGULACION']::text[]));

DROP POLICY IF EXISTS medical_providers_update ON medical_providers;
CREATE POLICY medical_providers_update ON medical_providers
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'ANALISTA', 'REGULACION']::text[]))
  WITH CHECK ((SELECT get_user_role())::text = ANY (ARRAY['ADMIN', 'ANALISTA', 'REGULACION']::text[]));
