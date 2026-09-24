-- ============================================================
-- Migración 044: extender el ENUM operational_center con ADO
-- Hallazgo al cargar la flota real: vehicles.centro_operativo es un ENUM de
-- Postgres separado de la tabla operational_centers (dos fuentes de verdad
-- para "centro operativo" que no estaban sincronizadas). La migración 042
-- agregó la fila 'ADO' a operational_centers pero no al ENUM — cualquier
-- INSERT/UPDATE de vehicles con centro_operativo='ADO' fallaba con
-- "invalid input value for enum operational_center". Este archivo debe
-- quedar solo con esta única sentencia (ALTER TYPE ... ADD VALUE no puede
-- usarse en la misma transacción en que se use el valor nuevo).
-- ============================================================

ALTER TYPE operational_center ADD VALUE IF NOT EXISTS 'ADO';
