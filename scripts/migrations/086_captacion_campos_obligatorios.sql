-- ============================================================
-- Migración 086: campos obligatorios configurables de la captación aeroportuaria
--
-- SISRES: sidebar → Aeroportuaria → «Configurar Captación» (configurarCamposCaptacion.php,
-- includes/captacionCamposConfig.php; SISRES lo guardaba en `configuracion_sistema`, clave/valor).
-- Aquí una tabla propia, con una fila por campo configurable.
--
-- Los campos que exige el reporte SISPRO (identificación, nombres, país, tipo de usuario, momento, motivo, egreso,
-- CIE-10, médico…) SIEMPRE son obligatorios y no aparecen aquí: son NOT NULL en la tabla de la 080. Esto solo
-- decide cuáles de los OPCIONALES se vuelven obligatorios. Por defecto ninguno (igual que SISRES).
--
-- Quién puede qué: leer, los roles de captación (el formulario necesita saber qué marcar con *); cambiar, solo ADMIN.
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS captacion_campos_obligatorios (
  campo       VARCHAR(40) PRIMARY KEY,
  obligatorio BOOLEAN NOT NULL DEFAULT false,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id)
);

INSERT INTO captacion_campos_obligatorios (campo) VALUES
  ('tipo_atencion'), ('lugar_atencion'), ('lado_atencion'), ('ubicacion_atencion'), ('detalle_ubicacion'),
  ('tiempo_activacion'), ('tiempo_llegada'), ('fecha_nacimiento'), ('telefono'), ('condicion'),
  ('patologia_sistema'), ('otra_patologia'), ('post_operatorio'), ('accidente_especial'),
  ('notificacion_obligatoria'), ('tipo_vuelo'), ('aerolinea'), ('origen'), ('destino'), ('emergencia_tipo')
ON CONFLICT (campo) DO NOTHING;

ALTER TABLE captacion_campos_obligatorios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS captacion_campos_select ON captacion_campos_obligatorios;
CREATE POLICY captacion_campos_select ON captacion_campos_obligatorios
  FOR SELECT TO authenticated USING (puede_captacion());

DROP POLICY IF EXISTS captacion_campos_write ON captacion_campos_obligatorios;
CREATE POLICY captacion_campos_write ON captacion_campos_obligatorios
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- Igual que la 080: si la política restrictiva de TECNICO/AEROPUERTO (076) existe, esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('captacion_campos_obligatorios');
  END IF;
END $$;
