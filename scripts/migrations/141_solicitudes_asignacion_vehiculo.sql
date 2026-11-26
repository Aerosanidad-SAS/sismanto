-- ============================================================
-- Migración 141: el OVEM pide asignarse un vehículo y Regulación confirma o rechaza
--
-- Hoy Regulación le dice al conductor de palabra qué vehículo usa y luego lo programa. Si el conductor se anticipa y
-- elige un vehículo que no tiene asignado, el preoperacional no deja rastro de eso. Ahora lo pide desde el
-- preoperacional («No tienes este vehículo asignado: pedir asignación») y la solicitud aparece en la sala de control.
-- Confirmar lo mete en la programación de hoy del vehículo (cambiarOperadoresDelDia); rechazar exige una nota.
--
-- Solo OVEM por ahora (decisión de Daniel, 2026-11-25). El rol queda en la tabla para ampliarlo a auxiliar y médico.
-- Quien resuelve lo hace desde una acción de servidor con la clave de servicio: no hay política de UPDATE para nadie.
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_solicitudes_asignacion (
  id             BIGSERIAL PRIMARY KEY,
  vehicle_id     UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  rol_en_turno   VARCHAR(30) NOT NULL DEFAULT 'OVEM' CHECK (rol_en_turno IN ('OVEM')),
  fecha          DATE NOT NULL,
  estado         VARCHAR(12) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'RECHAZADA')),
  solicitado_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revisado_por   UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  revisado_at    TIMESTAMPTZ,
  nota_revision  TEXT,
  CHECK (estado = 'PENDIENTE' OR (revisado_por IS NOT NULL AND revisado_at IS NOT NULL)),
  CHECK (estado <> 'RECHAZADA' OR length(btrim(coalesce(nota_revision, ''))) >= 5)
);

-- Una solicitud pendiente por persona: pedir otro vehículo reemplaza la anterior (lo hace la acción de servidor).
CREATE UNIQUE INDEX IF NOT EXISTS uq_solicitud_asignacion_pendiente_por_usuario
  ON vehicle_solicitudes_asignacion (user_id) WHERE estado = 'PENDIENTE';
CREATE INDEX IF NOT EXISTS idx_solicitud_asignacion_estado ON vehicle_solicitudes_asignacion (estado, solicitado_at);

ALTER TABLE vehicle_solicitudes_asignacion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS solicitud_asignacion_select ON vehicle_solicitudes_asignacion;
CREATE POLICY solicitud_asignacion_select ON vehicle_solicitudes_asignacion
  FOR SELECT TO authenticated
  USING ((SELECT get_user_role()) IN ('ADMIN', 'ANALISTA', 'REGULACION') OR user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS solicitud_asignacion_insert ON vehicle_solicitudes_asignacion;
CREATE POLICY solicitud_asignacion_insert ON vehicle_solicitudes_asignacion
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT get_user_role()) = 'OVEM'
    AND user_id = (SELECT auth.uid())
    AND estado = 'PENDIENTE'
    -- Solo para hoy y sin datos de revisión: por REST directo no se puede dejar una solicitud «ya revisada» ni de otro
    -- día (quedaría invisible en las pantallas y ocuparía el único cupo pendiente de la persona).
    AND fecha = public.hoy_bogota()
    AND revisado_por IS NULL
    AND revisado_at IS NULL
    AND nota_revision IS NULL
  );

-- Igual que las demás tablas: la política restrictiva de TECNICO/AEROPUERTO (087) también cubre esta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('vehicle_solicitudes_asignacion');
  END IF;
END $$;
