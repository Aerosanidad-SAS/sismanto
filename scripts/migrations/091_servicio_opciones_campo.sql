-- ============================================================
-- Migración 091: opciones administrables de 7 selects del formulario de servicios
--
-- SISRES: configurarCamposServicio.php (commit 2726772, 2026-09-29) — el administrador agrega/quita opciones de
-- turno, aislamiento, perímetro, finalidad del traslado, método de pago y motivos externo/interno sin desplegar.
-- SISRES lo guarda en `configuracion_sistema` (clave/valor JSON); aquí una tabla propia, una fila por campo.
--
-- Sin fila para un campo = se usan las opciones de fábrica del código (src/lib/servicios-opciones.ts), igual que
-- SISRES. Por eso no se siembra nada.
--
-- Deliberadamente NO incluye tipo de servicio, etapa ni estado: otras partes del sistema los comparan por valor
-- exacto (estancados, «sin gestionar», notificaciones, colores), y un valor libre ahí rompería esa lógica.
--
-- Quién puede qué: leer, cualquier usuario autenticado (el formulario de servicios las necesita); cambiar, solo ADMIN.
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS servicio_opciones_campo (
  campo      VARCHAR(40) PRIMARY KEY
               CHECK (campo IN ('turno_programacion', 'requiere_aislamiento', 'perimetro', 'finalidad_traslado',
                                'metodo_pago', 'motivo_externo', 'motivo_interno')),
  opciones   JSONB NOT NULL CHECK (jsonb_typeof(opciones) = 'array' AND jsonb_array_length(opciones) > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE servicio_opciones_campo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS servicio_opciones_select ON servicio_opciones_campo;
CREATE POLICY servicio_opciones_select ON servicio_opciones_campo
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS servicio_opciones_write ON servicio_opciones_campo;
CREATE POLICY servicio_opciones_write ON servicio_opciones_campo
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('servicio_opciones_campo');
  END IF;
END $$;
