-- ============================================================
-- Migración 101: campos obligatorios configurables por módulo (motor genérico)
--
-- SISRES: «Configurar campos» en 12 módulos (configurarCampos*.php + includes/camposObligatoriosGenerico.php, clave
-- "{modulo}_obligatorio_{campo}" en configuracion_sistema). El administrador marca qué campos OPCIONALES de un
-- formulario deben llenarse siempre, sin desplegar.
--
-- En SISMANTO ya existía solo para captación (086, tabla propia `captacion_campos_obligatorios`, que se deja igual).
-- Esta tabla sirve para los demás módulos: una fila por (módulo, campo). Qué campos admite cada módulo lo define el
-- código (src/lib/campos-obligatorios.ts); una fila de un campo que el código ya no conoce se ignora. Sin filas = ningún
-- campo opcional es obligatorio (igual que SISRES). No se siembra nada.
--
-- Quién puede qué: leer, cualquier usuario autenticado (cada formulario necesita saber qué marcar con *); cambiar,
-- solo ADMIN (en SISRES, act_configurar_campos_*). Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS campos_obligatorios (
  modulo      VARCHAR(40) NOT NULL CHECK (modulo ~ '^[a-z_]+$'),
  campo       VARCHAR(60) NOT NULL CHECK (campo ~ '^[a-z0-9_]+$'),
  obligatorio BOOLEAN NOT NULL DEFAULT false,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES auth.users(id),
  PRIMARY KEY (modulo, campo)
);

ALTER TABLE campos_obligatorios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS campos_obligatorios_select ON campos_obligatorios;
CREATE POLICY campos_obligatorios_select ON campos_obligatorios
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS campos_obligatorios_write ON campos_obligatorios;
CREATE POLICY campos_obligatorios_write ON campos_obligatorios
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- Igual que la 086: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('campos_obligatorios');
  END IF;
END $$;
