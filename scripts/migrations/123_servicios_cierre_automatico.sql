-- ============================================================
-- Migración 123: marca de «cierre automático» en servicios y función de corte
--
-- Decisión de Daniel (2026-10-07): los servicios que se cierran en bloque para limpiar el historial son un lastre del
-- traspaso desde SISRES: existen, pero no se usan. Deben quedar MARCADOS y no entrar en las estadísticas.
--
--   · medical_services.cierre_automatico_at / cierre_automatico_motivo: cuándo y por qué se cerró en bloque. Una fila
--     con cierre_automatico_at NOT NULL tiene horas de cierre ASIGNADAS (apertura + 1 h), no reales: no sirve para
--     estadísticas ni para tiempos de facturación.
--   · Backfill: los 2.150 servicios que se cerraron el 2026-10-07 (marcados en `observaciones`).
--   · medical_services_cierre_respaldo: respaldo permanente (fila completa en JSONB) de lo que cierre cada corte.
--   · cerrar_servicios_abiertos(p_dias, p_motivo): la herramienta del corte del día del despliegue. Respalda, cierra con
--     apertura + 1 hora (sin pisar horas reales), marca y devuelve cuántos. Solo la puede ejecutar service_role o el
--     administrador de la base (SQL Editor); no está expuesta a la API pública.
--
-- Aditiva e idempotente. El corte lo ejecuta Daniel a mano el día del despliegue.
-- ============================================================

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS cierre_automatico_at TIMESTAMPTZ;
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS cierre_automatico_motivo TEXT;

COMMENT ON COLUMN medical_services.cierre_automatico_at IS
  'No NULL = servicio cerrado en bloque para limpiar el historial. Sus horas de cierre son asignadas, no reales: excluir de estadísticas y facturación.';

CREATE INDEX IF NOT EXISTS idx_medical_services_cierre_automatico
  ON medical_services (id) WHERE cierre_automatico_at IS NOT NULL;

-- Backfill del cierre masivo del 2026-10-07 (marcado en observaciones por el script de limpieza).
UPDATE medical_services
SET cierre_automatico_at = COALESCE(cierre_automatico_at, '2026-10-07 12:00:00-05'::timestamptz),
    cierre_automatico_motivo = COALESCE(cierre_automatico_motivo, 'Limpieza del historial previa al despliegue: servicios abiertos de más de 7 días del traspaso desde SISRES')
WHERE observaciones LIKE '%[Cierre automático de limpieza 2026-10-07%'
  AND cierre_automatico_at IS NULL;

-- Respaldo permanente de cada corte (solo accesible con la clave de servicio o por SQL).
CREATE TABLE IF NOT EXISTS medical_services_cierre_respaldo (
  id            BIGSERIAL PRIMARY KEY,
  corte_id      UUID NOT NULL,
  servicio_id   INTEGER NOT NULL,
  fila          JSONB NOT NULL,
  respaldado_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cierre_respaldo_corte ON medical_services_cierre_respaldo (corte_id);
ALTER TABLE medical_services_cierre_respaldo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON medical_services_cierre_respaldo FROM anon, authenticated;

-- ─── El corte ────────────────────────────────────────────────────────────────────────────────────────────────────
-- p_dias = 0 cierra todo lo abierto que ya pasó su hora (el corte del día del despliegue); p_dias = 7 reproduce la
-- limpieza del 2026-10-07. Lo programado a futuro nunca se cierra.
CREATE OR REPLACE FUNCTION cerrar_servicios_abiertos(p_dias INTEGER, p_motivo TEXT)
RETURNS TABLE (corte_id UUID, cerrados INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_corte UUID := gen_random_uuid();
  v_n INTEGER;
BEGIN
  IF p_dias IS NULL OR p_dias < 0 THEN
    RAISE EXCEPTION 'p_dias debe ser 0 o más';
  END IF;
  IF p_motivo IS NULL OR length(btrim(p_motivo)) < 10 THEN
    RAISE EXCEPTION 'Escribe el motivo del corte (mínimo 10 caracteres)';
  END IF;

  CREATE TEMP TABLE _a_cerrar ON COMMIT DROP AS
    SELECT id FROM medical_services
    WHERE etapa IN ('PROGRAMADO', 'CURSO')
      AND COALESCE(fecha_hora_programacion, fecha_hora_registro, created_at) < now() - make_interval(days => p_dias);

  INSERT INTO medical_services_cierre_respaldo (corte_id, servicio_id, fila)
    SELECT v_corte, m.id, to_jsonb(m) FROM medical_services m JOIN _a_cerrar a ON a.id = m.id;

  UPDATE medical_services m SET
    fecha_hora_inicio_desplazamiento = COALESCE(m.fecha_hora_inicio_desplazamiento, COALESCE(m.fecha_hora_programacion, m.fecha_hora_registro, m.created_at)),
    fecha_hora_salida_destino = COALESCE(
      m.fecha_hora_salida_destino,
      COALESCE(m.fecha_hora_inicio_desplazamiento, m.fecha_hora_programacion, m.fecha_hora_registro, m.created_at) + interval '1 hour'),
    etapa = 'FINALIZADO',
    cierre_automatico_at = now(),
    cierre_automatico_motivo = btrim(p_motivo),
    observaciones = trim(both E'\n' FROM COALESCE(m.observaciones, '') || E'\n[Cierre automático ' || to_char(now() AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD') || ': ' || btrim(p_motivo) || '; hora de cierre asignada = apertura + 1 h. Corte ' || v_corte || ']'),
    updated_at = now()
  FROM _a_cerrar a WHERE a.id = m.id;
  GET DIAGNOSTICS v_n = ROW_COUNT;

  RETURN QUERY SELECT v_corte, v_n;
END;
$$;

REVOKE ALL ON FUNCTION cerrar_servicios_abiertos(INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION cerrar_servicios_abiertos(INTEGER, TEXT) TO service_role;

-- Igual que las anteriores: si existe la política restrictiva de TECNICO/AEROPUERTO (076), la tabla nueva también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('medical_services_cierre_respaldo');
  END IF;
END $$;

-- Rollback: DROP FUNCTION IF EXISTS cerrar_servicios_abiertos(INTEGER, TEXT); DROP TABLE IF EXISTS medical_services_cierre_respaldo;
--           ALTER TABLE medical_services DROP COLUMN IF EXISTS cierre_automatico_at, DROP COLUMN IF EXISTS cierre_automatico_motivo;
