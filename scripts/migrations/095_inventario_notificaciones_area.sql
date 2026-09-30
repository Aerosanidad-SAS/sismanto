-- ============================================================
-- Migración 095: destinatarios de los avisos de vencimiento del inventario, por área
--
-- SISRES: Inventario → Configurar → Notificaciones (configurarNotificacionesInventario.php?area=biomedica|sistemas,
-- includes/inventarioNotificacionConfig.php): cada área (Biomédica, Sistemas) tiene su lista de correos que recibe el
-- aviso de mantenimientos, calibraciones y parches por vencer de SUS equipos.
--
-- En SISMANTO el cron /api/cron/send-biomedical-alerts avisaba solo de los equipos biomédicos, a todos los usuarios
-- ADMIN/MANTENIMIENTO/COORDINACION, y los del área SISTEMAS no avisaban a nadie. Con esta tabla:
--   · BIOMEDICA con correos → esos correos; sin correos → los roles de siempre (no cambia nada si no se configura).
--   · SISTEMAS con correos → esos correos; sin correos → no se envía (como SISRES: no hay destinatarios por defecto).
-- Los hitos (30/15/7/3/1 días y diario si está vencido) siguen siendo los del cron, no la «recurrencia» de SISRES.
--
-- Quién puede qué: solo ADMIN lee y cambia (SISRES: act_configurar_notificaciones_inventario, cargo 1). El cron lee
-- con la clave de servicio. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS inventario_notificaciones_config (
  area       VARCHAR(20) PRIMARY KEY CHECK (area IN ('BIOMEDICA', 'SISTEMAS')),
  correos    TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE inventario_notificaciones_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventario_notificaciones_admin ON inventario_notificaciones_config;
CREATE POLICY inventario_notificaciones_admin ON inventario_notificaciones_config
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('inventario_notificaciones_config');
  END IF;
END $$;
