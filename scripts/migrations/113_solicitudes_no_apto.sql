-- ============================================================
-- Migración 113: solicitudes de «NO APTO» con aval
--
-- Regla de negocio (Daniel, 2026-10-02): el OVEM no decide a criterio sacar un vehículo de servicio. Cuando reporta un
-- siniestro vial (con lesionados, o con el vehículo que declara no operativo) o un problema grave, deja el reporte y
-- ENVÍA UNA SOLICITUD de NO APTO que debe avalar alguien superior: Coordinación del CRA o el administrador. Mientras
-- está PENDIENTE el vehículo queda en bloqueo provisional (Regulación no le asigna servicios y el OVEM no opera); solo
-- con el aval pasa a FUERA_DE_SERVICIO; si se rechaza vuelve a su estado sin cambios.
--
-- Una sola solicitud PENDIENTE por vehículo (índice único parcial): un segundo reporte del mismo vehículo se ata a la
-- que ya espera aval, no abre otra. El historial queda completo (quién pidió, quién revisó, cuándo y con qué nota).
-- Aditiva e idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_no_apto_solicitudes (
  id             BIGSERIAL PRIMARY KEY,
  vehicle_id     UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  incident_id    INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
  origen         VARCHAR(20) NOT NULL CHECK (origen IN ('SINIESTRO', 'REPORTE_OVEM')),
  motivo         TEXT NOT NULL CHECK (length(btrim(motivo)) >= 5),
  solicitado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  solicitado_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado         VARCHAR(10) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'AVALADA', 'RECHAZADA')),
  revisado_por   UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  revisado_at    TIMESTAMPTZ,
  nota_revision  TEXT,
  -- Una solicitud resuelta siempre dice quién y cuándo; un rechazo siempre dice por qué.
  CHECK (estado = 'PENDIENTE' OR (revisado_por IS NOT NULL AND revisado_at IS NOT NULL)),
  CHECK (estado <> 'RECHAZADA' OR length(btrim(coalesce(nota_revision, ''))) >= 5)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_no_apto_pendiente_por_vehiculo
  ON vehicle_no_apto_solicitudes (vehicle_id) WHERE estado = 'PENDIENTE';
CREATE INDEX IF NOT EXISTS idx_no_apto_vehiculo ON vehicle_no_apto_solicitudes (vehicle_id, solicitado_at DESC);

ALTER TABLE vehicle_no_apto_solicitudes ENABLE ROW LEVEL SECURITY;

-- Lectura: quienes gestionan o revisan; quien la pidió ve la suya.
DROP POLICY IF EXISTS no_apto_select ON vehicle_no_apto_solicitudes;
CREATE POLICY no_apto_select ON vehicle_no_apto_solicitudes
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IN ('ADMIN', 'ANALISTA', 'GERENCIAL', 'REGULACION', 'COORDINACION', 'MANTENIMIENTO') OR solicitado_por = (SELECT auth.uid()));

-- Crear: el OVEM (a su nombre) y quienes programan; siempre como PENDIENTE y a nombre propio.
DROP POLICY IF EXISTS no_apto_insert ON vehicle_no_apto_solicitudes;
CREATE POLICY no_apto_insert ON vehicle_no_apto_solicitudes
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT get_user_role()) IN ('ADMIN', 'REGULACION', 'OVEM')
    AND solicitado_por = (SELECT auth.uid())
    AND estado = 'PENDIENTE'
  );

-- Resolver (avalar o rechazar): solo Coordinación y el administrador. El OVEM nunca se avala a sí mismo.
DROP POLICY IF EXISTS no_apto_update ON vehicle_no_apto_solicitudes;
CREATE POLICY no_apto_update ON vehicle_no_apto_solicitudes
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role()) IN ('ADMIN', 'COORDINACION') AND estado = 'PENDIENTE')
  WITH CHECK ((SELECT get_user_role()) IN ('ADMIN', 'COORDINACION') AND revisado_por = (SELECT auth.uid()));

-- Igual que la 091/107/108: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('vehicle_no_apto_solicitudes');
  END IF;
END $$;

-- Rollback: DROP TABLE IF EXISTS vehicle_no_apto_solicitudes;
