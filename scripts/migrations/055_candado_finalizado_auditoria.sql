-- ============================================================
-- Migración 055: candado de edición en servicios FINALIZADO +
-- log de auditoría obligatorio.
--
-- Decisión de Daniel (2026-07-29), en respuesta al hallazgo de León
-- (VALIDACION_ACOMODACION.md, Dominio 3 #1 — "no existe el candado de
-- solo-lectura en servicios FINALIZADO que sí tiene SISRES"):
-- un servicio ya finalizado solo lo puede volver a tocar ADMIN,
-- ANALISTA o REGULACION, y cada vez que eso pase debe quedar un
-- registro de auditoría SIEMPRE — por eso el log se implementa como
-- trigger de base de datos (no como código de aplicación): así queda
-- garantizado sin depender de que cada camino de código se acuerde de
-- llamarlo.
-- ============================================================

-- ─── 1. Tabla de auditoría (append-only, nadie puede editarla/borrarla) ───

CREATE TABLE IF NOT EXISTS medical_services_audit_log (
  id BIGSERIAL PRIMARY KEY,
  medical_service_id INTEGER NOT NULL REFERENCES medical_services(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_role VARCHAR(30),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valores_anteriores JSONB NOT NULL,
  valores_nuevos JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_medical_services_audit_log_service
  ON medical_services_audit_log(medical_service_id);

ALTER TABLE medical_services_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medical_services_audit_log_select ON medical_services_audit_log;
CREATE POLICY medical_services_audit_log_select ON medical_services_audit_log
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','ANALISTA','REGULACION'));

-- Deliberadamente sin política de INSERT/UPDATE/DELETE para `authenticated`
-- — la única forma de escribir acá es el trigger de abajo, que corre con
-- privilegios de la función (SECURITY DEFINER), no con los del usuario.

-- ─── 2. Trigger: cualquier UPDATE sobre una fila que YA estaba en
-- FINALIZADO deja registro automático ──────────────────────────────────

CREATE OR REPLACE FUNCTION fn_medical_services_audit_finalizado()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.etapa = 'FINALIZADO' THEN
    INSERT INTO medical_services_audit_log (
      medical_service_id, changed_by, changed_by_role, valores_anteriores, valores_nuevos
    )
    VALUES (OLD.id, auth.uid(), get_user_role(), to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_medical_services_audit_finalizado ON medical_services;
CREATE TRIGGER trg_medical_services_audit_finalizado
  AFTER UPDATE ON medical_services
  FOR EACH ROW
  EXECUTE FUNCTION fn_medical_services_audit_finalizado();

-- ─── 3. Candado: solo ADMIN/ANALISTA/REGULACION pueden tocar una fila que
-- YA está en FINALIZADO. Para cualquier otra etapa, las reglas de la
-- migración 053 siguen igual (incluida la transición legítima de OVEM/
-- MEDICO/AUXILIAR de CURSO→FINALIZADO en su propio servicio, ver nota
-- abajo sobre por qué WITH CHECK no repite esta condición). ───────────

DROP POLICY IF EXISTS medical_services_update ON medical_services;
CREATE POLICY medical_services_update ON medical_services
  FOR UPDATE TO authenticated
  USING (
    CASE
      WHEN etapa = 'FINALIZADO' THEN get_user_role() IN ('ADMIN','ANALISTA','REGULACION')
      ELSE (
        get_user_role() IN ('ADMIN','REGULACION','ANALISTA')
        OR (get_user_role() = 'OVEM' AND ovem_user_id = auth.uid())
        OR (get_user_role() = 'MEDICO' AND medico_user_id = auth.uid())
        OR (get_user_role() = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = auth.uid())
      )
    END
  )
  -- WITH CHECK NO repite el candado de FINALIZADO a propósito: USING ya
  -- evalúa la etapa ANTES del update (candado real), así que repetir la
  -- condición acá (que se evaluaría contra la etapa DESPUÉS del update)
  -- bloquearía por error el botón legítimo de "Finalización del
  -- servicio" que usa OVEM/MEDICO/AUXILIAR desde Mis Servicios (Fase E)
  -- para cerrar su propio servicio — ese es precisamente el momento en
  -- que la fila pasa a valer FINALIZADO, no una edición posterior.
  WITH CHECK (
    get_user_role() IN ('ADMIN','REGULACION','ANALISTA')
    OR (get_user_role() = 'OVEM' AND ovem_user_id = auth.uid())
    OR (get_user_role() = 'MEDICO' AND medico_user_id = auth.uid())
    OR (get_user_role() = 'AUXILIAR_ENFERMERIA' AND auxiliar_user_id = auth.uid())
  );
