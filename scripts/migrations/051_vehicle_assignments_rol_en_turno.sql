-- ============================================================
-- Migración 051: tripulación con más de una persona por vehículo
--
-- Hoy vehicle_assignments asume un solo ocupante activo (siempre el
-- OVEM) — assignVehicleToOvem desactiva CUALQUIER asignación activa
-- del vehículo antes de insertar la nueva. Para armar la tripulación
-- completa (OVEM + médico + auxiliar en el mismo vehículo, cada uno
-- activo a la vez) hace falta distinguir el rol dentro del turno.
--
-- El UNIQUE (user_id, vehicle_id, fecha_inicio) ya existente no
-- bloquea esto — el problema era solo la lógica de la aplicación,
-- que se corrige en regulacion.ts, no acá.
-- ============================================================

ALTER TABLE vehicle_assignments ADD COLUMN IF NOT EXISTS rol_en_turno VARCHAR(20) NOT NULL DEFAULT 'OVEM'
  CHECK (rol_en_turno IN ('OVEM', 'MEDICO', 'AUXILIAR_ENFERMERIA'));

-- Antes solo podía haber una fila activa por vehículo (el OVEM). Ahora
-- puede haber una activa por (vehículo, rol) — ej. un OVEM y un médico
-- activos al mismo tiempo en el mismo carro.
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_assignments_activo_por_rol
  ON vehicle_assignments(vehicle_id, rol_en_turno)
  WHERE activo = true;
