-- Migration 032: Tabla RTM histórico por año
-- El RTM (Revisión Técnico-Mecánica) es un costo regulado en Colombia que varía
-- cada año por resolución del Ministerio de Transporte.

CREATE TABLE IF NOT EXISTS rtm_historico (
  anio INTEGER PRIMARY KEY,
  valor NUMERIC(12, 2) NOT NULL
);

-- RLS
ALTER TABLE rtm_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rtm_historico_read" ON rtm_historico;
CREATE POLICY "rtm_historico_read" ON rtm_historico
  FOR SELECT USING (auth.role() IN ('authenticated', 'service_role'));
REVOKE ALL ON rtm_historico FROM anon;

-- Valores reales por año (fuente: resoluciones Ministerio de Transporte Colombia)
INSERT INTO rtm_historico (anio, valor) VALUES
  (2021, 227000),
  (2022, 228900),
  (2023, 257810),
  (2024, 327219),
  (2025, 360000),
  (2026, 330000)
ON CONFLICT (anio) DO UPDATE SET valor = EXCLUDED.valor;

-- El tracker schema_migrations lo gestiona apply-database.ts automáticamente.