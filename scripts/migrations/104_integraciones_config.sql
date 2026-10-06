-- ============================================================
-- Migración 104: credenciales y parámetros de integraciones externas, editables desde la aplicación
--
-- Para el rastreo GPS (ProTrack365), el aviso «su vehículo va en camino» por WhatsApp y la cotización de rutas
-- (Google Maps). En SISRES estaban en bd/secrets.php y en el código (cuenta 'AEROSANIDAD'); aquí el ADMIN las escribe en
-- Administración → Integraciones, sin desplegar. Si un valor falta, el servidor usa la variable de entorno equivalente.
--
-- Guarda secretos (llave de ProTrack): la tabla tiene RLS SIN políticas, así que ningún usuario la lee ni la escribe
-- directamente; solo el servidor con la clave de servicio, después de comprobar que quien pide es ADMIN. La pantalla
-- nunca devuelve un secreto completo, solo sus últimos 4 caracteres. Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS integraciones_config (
  clave      VARCHAR(60) PRIMARY KEY CHECK (clave ~ '^[a-z0-9_]+$'),
  valor      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE integraciones_config ENABLE ROW LEVEL SECURITY;
-- Sin políticas a propósito (ver arriba).

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('integraciones_config');
  END IF;
END $$;
