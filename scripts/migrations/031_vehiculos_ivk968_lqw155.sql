-- Migration 031: Agregar IVK968 (Chevrolet Traverse LTZ 2015) y LQW155 (Suzuki Dzire 2023)
-- IVK968: vehículo del director — flota Bogotá
-- LQW155: vehículo nuevo — flota Bogotá
-- Campos técnicos (llantas, aceite, filtros, etc.) = 'Pendiente definir' hasta que se completen en el sistema.

INSERT INTO vehicles (
  placa, marca, modelo, linea,
  combustible, tipo_combustible,
  estado_actual, centro_operativo,
  costo_tecnomecanica_anual,
  tipo_llantas, aceite_usado,
  ref_filtro_aceite, ref_filtro_aire_motor, tipo_refrigerante,
  bombilleria_farolas, bombilleria_stops, bombilleria_direccionales,
  bateria_principal, bateria_auxiliar
)
VALUES
  (
    'IVK968', 'Chevrolet', 'Traverse LTZ 2015', 'Traverse LTZ',
    'Gasolina Corriente', 'Gasolina Corriente',
    'OPERATIVO', 'CRA_BOGOTA',
    330000,
    'Pendiente definir', 'Pendiente definir',
    'Pendiente definir', 'Pendiente definir', 'Pendiente definir',
    'Pendiente definir', 'Pendiente definir', 'Pendiente definir',
    'Pendiente definir', 'Pendiente definir'
  ),
  (
    'LQW155', 'Suzuki', 'Dzire 2023', 'Dzire',
    'Gasolina Corriente', 'Gasolina Corriente',
    'OPERATIVO', 'CRA_BOGOTA',
    330000,
    'Pendiente definir', 'Pendiente definir',
    'Pendiente definir', 'Pendiente definir', 'Pendiente definir',
    'Pendiente definir', 'Pendiente definir', 'Pendiente definir',
    'Pendiente definir', 'Pendiente definir'
  )
ON CONFLICT (placa) DO NOTHING;
