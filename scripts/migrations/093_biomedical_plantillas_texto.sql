-- ============================================================
-- Migración 093: plantillas de texto del mantenimiento biomédico
--
-- SISRES: Inventario → Configurar → Plantillas de texto (configurarPlantillasMantenimiento.php, tabla
-- mantenimiento_plantilla_texto, sql/mantenimiento_plantillas_texto_2026-09-30.sql). En el registro de mantenimiento,
-- los campos «Descripción de la falla / actividad», «Observaciones» y «Observaciones de reparación» tienen un
-- selector «Usar plantilla» que pega un texto predefinido.
--
-- `campo` usa los nombres de columna de biomedical_maintenance (SISRES: observaciones_texto → observaciones,
-- obsreparaciones → obs_reparaciones). Semilla: los 3 textos de ejemplo de SISRES; ON CONFLICT DO NOTHING para no
-- pisar lo editado después.
--
-- Quién puede qué: leer, los roles que registran o ven mantenimientos biomédicos; crear/editar/eliminar, ADMIN y
-- MANTENIMIENTO (en SISRES, los mismos permisos de las listas de chequeo). Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS biomedical_plantillas_texto (
  id         SERIAL PRIMARY KEY,
  campo      VARCHAR(40) NOT NULL CHECK (campo IN ('descripcion_falla', 'observaciones', 'obs_reparaciones')),
  nombre     VARCHAR(120) NOT NULL CHECK (length(trim(nombre)) > 0),
  texto      TEXT NOT NULL CHECK (length(trim(texto)) > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE (campo, nombre)
);

INSERT INTO biomedical_plantillas_texto (campo, nombre, texto) VALUES
  ('descripcion_falla', 'Preventivo - equipo en óptimas condiciones',
   'Se verificó que el equipo cumple con todos los parámetros técnicos requeridos y se encuentra en condiciones óptimas para desempeñar su función.'),
  ('observaciones', 'Prueba final funcional', 'Se realiza prueba final y es funcional.'),
  ('obs_reparaciones', 'Inspección y reparaciones necesarias', 'Se inspecciona el equipo y se realizan las reparaciones necesarias.')
ON CONFLICT (campo, nombre) DO NOTHING;

ALTER TABLE biomedical_plantillas_texto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS biomedical_plantillas_select ON biomedical_plantillas_texto;
CREATE POLICY biomedical_plantillas_select ON biomedical_plantillas_texto
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO','COORDINACION','GERENCIAL','ANALISTA','VISTA'));

DROP POLICY IF EXISTS biomedical_plantillas_write ON biomedical_plantillas_texto;
CREATE POLICY biomedical_plantillas_write ON biomedical_plantillas_texto
  FOR ALL TO authenticated
  USING (get_user_role() IN ('ADMIN','MANTENIMIENTO'))
  WITH CHECK (get_user_role() IN ('ADMIN','MANTENIMIENTO'));

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('biomedical_plantillas_texto');
  END IF;
END $$;
