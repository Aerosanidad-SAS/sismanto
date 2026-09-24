-- ============================================================
-- Migración 042: Centro operativo ADO (Barrancabermeja)
-- Hallazgo al cargar la flota real de 36 vehículos (hoja SPECS del
-- Excel de control): 6 de las 10 ciudades de operación no tenían
-- centro operativo equivalente. Confirmado con Daniel:
--   Quibdó, Montería, Corozal, Carepa, Medellín, Rionegro → AIRPLAN (ya existe)
--   Barrancabermeja → ADO (nuevo, esta migración)
--   Cartagena → CTG (ya existe, inferido del código IATA del aeropuerto)
-- ============================================================

INSERT INTO operational_centers (codigo, nombre) VALUES
  ('ADO', 'ADO')
ON CONFLICT (codigo) DO NOTHING;
