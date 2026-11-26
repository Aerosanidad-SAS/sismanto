-- ============================================================
-- Migración 144: Captación — registro de «solo procedimiento» (ambulancias externas sin paciente)
--
-- Pedido del equipo (2026-11-25, issues #402 y #403): poder registrar solo el procedimiento o la
-- ambulancia externa, sin diligenciar toda la captación, y guardar más de un procedimiento con cantidad.
-- La captación completa (captaciones_aeroportuarias, migración 080), el reporte SISPRO y el PDF NO cambian.
--
-- Una fila = una línea «procedimiento + cantidad (1-99)». Las líneas de un mismo envío comparten `lote`.
-- Este registro no es un paciente: los informes lo cuentan aparte (PME con cantidad, emergencias de ACM y
-- «Ambulancia» de Aerocivil; ver src/lib/informes-captacion.ts).
--
-- Quién puede qué (igual que 080):
--   · Ver y registrar: los roles de puede_captacion() (ADMIN, ANALISTA, COORDINACION, REGULACION, MEDICO,
--     AUXILIAR_ENFERMERIA). TECNICO y AEROPUERTO quedan fuera.
--   · Editar y eliminar: solo ADMIN.
-- Eliminar = desactivar (activo = false), como en la captación completa.
-- Aditiva e idempotente: sin DROP de tablas ni columnas.
-- ============================================================

CREATE TABLE IF NOT EXISTS captacion_procedimientos (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lote                UUID NOT NULL,                       -- une las líneas de un mismo envío
  fecha_atencion      TIMESTAMPTZ NOT NULL DEFAULT now(),
  aeropuerto_atencion VARCHAR(150) NOT NULL,
  procedimiento       VARCHAR(120) NOT NULL,               -- del catálogo PROCEDIMIENTOS (src/lib/captacion.ts)
  cantidad            SMALLINT NOT NULL CHECK (cantidad BETWEEN 1 AND 99),
  emergencia_tipo     VARCHAR(40),                         -- de EMERGENCIAS_TIPO (opcional)
  notas               TEXT,
  activo              BOOLEAN NOT NULL DEFAULT true,
  registrado_por_id   UUID REFERENCES auth.users(id),
  nombre_registrado_por VARCHAR(150),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_captacion_proc_fecha ON captacion_procedimientos (activo, fecha_atencion DESC);
-- Una línea por procedimiento dentro de un lote. Es lo que hace segura la idempotencia: si el mismo envío llega dos veces
-- a la vez, la segunda inserción falla aquí (23505) en vez de duplicar las cifras. Sirve también para buscar por lote.
CREATE UNIQUE INDEX IF NOT EXISTS uq_captacion_proc_lote_procedimiento ON captacion_procedimientos (lote, procedimiento);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE captacion_procedimientos ENABLE ROW LEVEL SECURITY;

-- Sin sesión no se ve ni se escribe nada: la 132 ya quita la escritura de `anon` por defecto; aquí también la lectura
-- (las notas son texto libre sobre una atención). `authenticated` conserva sus privilegios y lo limita la RLS.
REVOKE ALL ON captacion_procedimientos FROM anon;

-- Las funciones van envueltas en (SELECT ...) para evaluarse una vez por consulta y no por fila (087 y 110): los
-- informes leen todas las líneas de un período.

DROP POLICY IF EXISTS captacion_procedimientos_select ON captacion_procedimientos;
CREATE POLICY captacion_procedimientos_select ON captacion_procedimientos
  FOR SELECT TO authenticated USING ((SELECT puede_captacion()));

-- Quien registra queda como autor: no se puede registrar "a nombre de otro" ni con una fecha futura.
DROP POLICY IF EXISTS captacion_procedimientos_insert ON captacion_procedimientos;
CREATE POLICY captacion_procedimientos_insert ON captacion_procedimientos
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT puede_captacion())
    AND registrado_por_id = (SELECT auth.uid())
    AND fecha_atencion <= now() + interval '5 minutes'
  );

DROP POLICY IF EXISTS captacion_procedimientos_update ON captacion_procedimientos;
CREATE POLICY captacion_procedimientos_update ON captacion_procedimientos
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role()) = 'ADMIN') WITH CHECK ((SELECT get_user_role()) = 'ADMIN');

DROP POLICY IF EXISTS captacion_procedimientos_delete ON captacion_procedimientos;
CREATE POLICY captacion_procedimientos_delete ON captacion_procedimientos
  FOR DELETE TO authenticated USING ((SELECT get_user_role()) = 'ADMIN');

-- Si la política restrictiva para TECNICO/AEROPUERTO (zz_rol_restringido) ya existe, esta tabla nueva también
-- queda blindada para esos roles. puede_captacion() ya los deja fuera: esta es una segunda barrera.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('captacion_procedimientos');
  END IF;
END $$;
