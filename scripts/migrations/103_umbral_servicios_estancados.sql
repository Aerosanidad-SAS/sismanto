-- ============================================================
-- Migración 103: umbral configurable de servicios estancados
--
-- SISRES: Configuración General → «Alertas de Servicios Estancados» (includes/alertaEstancadoConfig.php, 2026-07-31):
-- activar o no el aviso y las horas, desde la hora programada, a partir de las cuales un servicio en PROGRAMADO o
-- en CURSO se marca ⏰ y avisa. En SISMANTO estaba fijo en 4 h en el código (UMBRAL_ESTANCADO_HORAS).
--
-- Tres columnas en company_settings (fila única de configuración general, migración 056: todos leen, solo ADMIN
-- escribe). Los valores por defecto son los que ya había en el código, así que nada cambia hasta que se configure.
-- Solo ADD COLUMN IF NOT EXISTS: no es destructiva. Idempotente.
-- ============================================================

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS estancado_activo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS estancado_horas_programado SMALLINT NOT NULL DEFAULT 4;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS estancado_horas_curso SMALLINT NOT NULL DEFAULT 4;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'company_settings_estancado_horas') THEN
    ALTER TABLE company_settings ADD CONSTRAINT company_settings_estancado_horas
      CHECK (estancado_horas_programado BETWEEN 1 AND 720 AND estancado_horas_curso BETWEEN 1 AND 720);
  END IF;
END $$;
