-- ============================================================
-- Migración 080: Captación de pacientes aeroportuarios + reporte SISPRO
--
-- Origen: módulo "Formato de Captación" de SISRES (captacion_aeroportuaria) ampliado
-- con los campos del reporte SISPRO de atenciones en aeropuertos (libro "SISPRO 2026",
-- 38 columnas por atención). SISRES no tenía SISPRO: se llevaba a mano en Excel. Aquí
-- una sola captura alimenta los dos: el formulario recoge todo y la exportación mensual
-- genera las filas del reporte (ver src/lib/captacion.ts).
--
-- Quién puede qué (equivale a los cargos 1-7 de SISRES para ver/registrar y al cargo 1
-- para editar/borrar):
--   · Ver y registrar: ADMIN, ANALISTA, COORDINACION, REGULACION, MEDICO, AUXILIAR_ENFERMERIA.
--   · Editar y eliminar: solo ADMIN.
-- El paciente se COPIA en el registro (no es FK obligatoria): es el dato histórico de esa
-- atención y no cambia si después se corrige el maestro de pacientes (igual que SISRES).
--
-- Los aeropuertos, países e IPS del reporte están en la 081. Los aeropuertos globales y
-- aerolíneas (León, PR de catálogos) se pueden enlazar después: aquí se guardan como texto.
-- Idempotente.
-- ============================================================

CREATE OR REPLACE FUNCTION public.puede_captacion()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT get_user_role() IN ('ADMIN','ANALISTA','COORDINACION','REGULACION','MEDICO','AUXILIAR_ENFERMERIA');
$$;
REVOKE ALL ON FUNCTION public.puede_captacion() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.puede_captacion() TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS captaciones_aeroportuarias (
  id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sisres_id                   INTEGER UNIQUE,            -- id en captacion_aeroportuaria (ETL)

  -- ── Atención ────────────────────────────────────────────
  fecha_atencion              TIMESTAMPTZ NOT NULL DEFAULT now(),
  aeropuerto_atencion         VARCHAR(150) NOT NULL,

  -- ── Paciente (copiado) ──────────────────────────────────
  paciente_id                 INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  tipo_identificacion         VARCHAR(2)  NOT NULL
                                CHECK (tipo_identificacion IN ('CC','RC','TI','CE','PA','MS','AS','CD','NV')),
  numero_identificacion       VARCHAR(18) NOT NULL,
  primer_nombre               VARCHAR(30) NOT NULL,
  segundo_nombre              VARCHAR(30),
  primer_apellido             VARCHAR(30) NOT NULL,
  segundo_apellido            VARCHAR(30),
  fecha_nacimiento            DATE,
  sexo                        CHAR(1) CHECK (sexo IN ('F','M')),
  nacionalidad                VARCHAR(35) NOT NULL DEFAULT 'COLOMBIA',
  pais_residencia             VARCHAR(80) NOT NULL DEFAULT 'COLOMBIA',
  pais_procedencia            VARCHAR(80) NOT NULL DEFAULT 'COLOMBIA',
  aeropuerto_procedencia      VARCHAR(150),
  telefono                    VARCHAR(20),

  -- ── Códigos SISPRO ──────────────────────────────────────
  tipo_usuario                SMALLINT NOT NULL CHECK (tipo_usuario BETWEEN 1 AND 4),    -- 1 trabajador aeropuerto · 2 tripulante · 3 visitante · 4 pasajero
  momento_atencion            SMALLINT NOT NULL CHECK (momento_atencion BETWEEN 1 AND 4), -- 1 antes de abordar · 2 después de bajar · 3 acompañando viajero · 4 no aplica
  motivo_consulta             SMALLINT NOT NULL CHECK (motivo_consulta BETWEEN 1 AND 6),  -- 1 acc. aéreo · 2 acc. trabajo · 3 acc. tránsito · 4 enfermedad · 5 traslado paciente · 6 traslado cadáver
  tipo_egreso                 SMALLINT NOT NULL CHECK (tipo_egreso BETWEEN 1 AND 3),      -- 1 propios medios · 2 ambulancia terrestre · 3 ambulancia aérea

  -- ── Clasificación clínica (SISRES) ──────────────────────
  tipo_atencion               VARCHAR(60),
  resultado_autorizacion      VARCHAR(10) CHECK (resultado_autorizacion IN ('APTO','NO APTO')),
  lugar_atencion              VARCHAR(20) CHECK (lugar_atencion IN ('SERVICIO','EXTERNO')),
  lado_atencion               VARCHAR(10) CHECK (lado_atencion IN ('TIERRA','AIRE')),
  ubicacion_atencion          VARCHAR(40),
  detalle_ubicacion           TEXT,
  tiempo_activacion           TIME,                       -- hora de Colombia (UTC-5), HH:MM:SS
  tiempo_llegada              TIME,
  condicion                   VARCHAR(30),
  cie10                       VARCHAR(10),                -- código de 4 caracteres (SISPRO)
  patologia_sistema           VARCHAR(120),
  otra_patologia              VARCHAR(120),
  post_operatorio             VARCHAR(120),
  accidente_especial          VARCHAR(60),
  notificacion_obligatoria    VARCHAR(150),
  tipo_vuelo                  VARCHAR(30),
  aerolinea                   VARCHAR(150),
  procedimientos              JSONB NOT NULL DEFAULT '[]'::jsonb,
  emergencia_tipo             VARCHAR(40),
  emergencia_notas            TEXT,

  -- ── Remisión, origen/destino, medicamentos, dispositivos, médico (SISPRO) ──
  remision                    BOOLEAN NOT NULL DEFAULT false,
  ips_receptora               VARCHAR(200),
  origen                      VARCHAR(100),
  destino                     VARCHAR(100),
  recibio_medicamentos        BOOLEAN NOT NULL DEFAULT false,
  medicamento                 VARCHAR(150),
  evento_adverso_medicamento  BOOLEAN,
  uso_dispositivo             BOOLEAN NOT NULL DEFAULT false,
  dispositivo                 VARCHAR(150),
  evento_adverso_dispositivo  BOOLEAN,
  medico_atendio              VARCHAR(100),

  -- ── Control ─────────────────────────────────────────────
  activo                      BOOLEAN NOT NULL DEFAULT true,
  registrado_por_id           UUID REFERENCES auth.users(id),
  nombre_registrado_por       VARCHAR(150),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_captaciones_fecha   ON captaciones_aeroportuarias (fecha_atencion DESC);
CREATE INDEX IF NOT EXISTS idx_captaciones_numero  ON captaciones_aeroportuarias (numero_identificacion);
CREATE INDEX IF NOT EXISTS idx_captaciones_activo  ON captaciones_aeroportuarias (activo, fecha_atencion DESC);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE captaciones_aeroportuarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS captaciones_select ON captaciones_aeroportuarias;
CREATE POLICY captaciones_select ON captaciones_aeroportuarias
  FOR SELECT TO authenticated USING (puede_captacion());

-- Quien registra queda como autor: no se puede registrar "a nombre de otro" ni con una fecha futura.
DROP POLICY IF EXISTS captaciones_insert ON captaciones_aeroportuarias;
CREATE POLICY captaciones_insert ON captaciones_aeroportuarias
  FOR INSERT TO authenticated
  WITH CHECK (
    puede_captacion()
    AND registrado_por_id = auth.uid()
    AND sisres_id IS NULL
    AND fecha_atencion <= now() + interval '5 minutes'
  );

DROP POLICY IF EXISTS captaciones_update ON captaciones_aeroportuarias;
CREATE POLICY captaciones_update ON captaciones_aeroportuarias
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS captaciones_delete ON captaciones_aeroportuarias;
CREATE POLICY captaciones_delete ON captaciones_aeroportuarias
  FOR DELETE TO authenticated USING (get_user_role() = 'ADMIN');

-- Si el PR de roles TECNICO/AEROPUERTO (política restrictiva zz_rol_restringido) ya está
-- aplicado, esta tabla nueva también queda blindada para esos roles.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM public.aplicar_politica_rol_restringido('captaciones_aeroportuarias');
  END IF;
END $$;
