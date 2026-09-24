-- Migración 061: la dotación e insumos la verifica la auxiliar de enfermería,
-- no el OVEM (el OVEM responde por el vehículo en el preoperacional).
-- Reemplaza la política de INSERT de supply_checks creada en 060.
--
-- Idempotente.

DROP POLICY IF EXISTS "insert_supply_checks" ON supply_checks;
CREATE POLICY "insert_supply_checks" ON supply_checks
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IN ('ADMIN', 'ANALISTA')
    OR (
      get_user_role() = 'AUXILIAR_ENFERMERIA'
      AND user_id = auth.uid()
      AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = supply_checks.vehicle_id)
    )
  );
