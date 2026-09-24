-- ============================================================
-- Migración 035: Integración SISRES — roles nuevos
-- Fase 1 del plan (PLAN_INTEGRACION_SISRES.md §5-6).
-- Crea los 4 cargos de SISRES sin equivalente en Aeromanto.
-- Los cargos con nombre coincidente (Regulador→REGULACION,
-- Coordinador→COORDINACION, OVEM→OVEM) reusan los roles
-- existentes según la hipótesis de RESPUESTAS_LEON.md §1
-- (pendiente del cruce de cédulas de RBAC_INTEGRACION.md §1.1;
-- si resulta falsa, se corrige con una migración posterior que
-- cree códigos separados — ninguna política de esta migración
-- lo impide).
-- ============================================================

INSERT INTO roles (codigo, nombre, descripcion) VALUES
  ('ANALISTA', 'Analista de Servicios', 'Consulta y análisis de servicios médicos, estadísticas y reportes'),
  ('MEDICO', 'Médico', 'Registro clínico: pacientes, servicios y valoraciones médicas'),
  ('AUXILIAR_ENFERMERIA', 'Auxiliar de Enfermería', 'Apoyo clínico: pacientes y servicios médicos'),
  ('VISTA', 'Vista / Solo lectura', 'Acceso de solo lectura a módulos operativos')
ON CONFLICT (codigo) DO NOTHING;
