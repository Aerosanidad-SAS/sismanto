-- Migration 013: Rol COORDINACION + Módulo Capacitaciones y Evaluaciones

-- ─── 1. ROL COORDINACION ─────────────────────────────────────────────────────
INSERT INTO roles (codigo, nombre, descripcion)
VALUES (
  'COORDINACION',
  'Coordinación CRA',
  'Coordinadoras CRA Medellín/Bogotá: estado flota, conductores, mantenimientos, métricas y capacitaciones'
) ON CONFLICT (codigo) DO NOTHING;

-- ─── 2. TABLAS capacitaciones (drop+create para idempotencia) ────────────────
-- Drop en orden inverso de dependencias
DROP TABLE IF EXISTS training_responses         CASCADE;
DROP TABLE IF EXISTS training_sessions          CASCADE;
DROP TABLE IF EXISTS training_assignments       CASCADE;
DROP TABLE IF EXISTS training_question_options  CASCADE;
DROP TABLE IF EXISTS training_questions         CASCADE;
DROP TABLE IF EXISTS trainings                  CASCADE;

CREATE TABLE IF NOT EXISTS trainings (
  id                          SERIAL       PRIMARY KEY,
  titulo                      TEXT         NOT NULL,
  descripcion                 TEXT,
  contenido_texto             TEXT,
  video_url                   TEXT,
  duracion_estimada_minutos   INTEGER,
  mes_ciclo                   INTEGER      CHECK (mes_ciclo BETWEEN 1 AND 12),
  tiempo_limite_minutos       INTEGER      NOT NULL DEFAULT 60,
  activo                      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by                  UUID         REFERENCES user_profiles(user_id),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 3. TABLA training_questions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_questions (
  id           SERIAL   PRIMARY KEY,
  training_id  INTEGER  NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  orden        INTEGER  NOT NULL,
  tipo         TEXT     NOT NULL CHECK (tipo IN ('SELECCION_MULTIPLE','RESPUESTA_ABIERTA','JUSTIFICACION')),
  pregunta     TEXT     NOT NULL,
  puntaje      INTEGER  NOT NULL DEFAULT 1,
  activo       BOOLEAN  NOT NULL DEFAULT TRUE
);

-- ─── 4. TABLA training_question_options ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_question_options (
  id          SERIAL   PRIMARY KEY,
  question_id INTEGER  NOT NULL REFERENCES training_questions(id) ON DELETE CASCADE,
  orden       INTEGER  NOT NULL,
  texto       TEXT     NOT NULL,
  es_correcta BOOLEAN  NOT NULL DEFAULT FALSE
);

-- ─── 5. TABLA training_assignments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_assignments (
  id               SERIAL   PRIMARY KEY,
  training_id      INTEGER  NOT NULL REFERENCES trainings(id),
  user_id          UUID     NOT NULL REFERENCES user_profiles(user_id),
  fecha_asignacion DATE     NOT NULL DEFAULT CURRENT_DATE,
  fecha_limite     DATE,
  completado       BOOLEAN  NOT NULL DEFAULT FALSE,
  asignado_por     UUID     REFERENCES user_profiles(user_id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (training_id, user_id)
);

-- ─── 6. TABLA training_sessions (intento de evaluación) ──────────────────────
CREATE TABLE IF NOT EXISTS training_sessions (
  id                  SERIAL    PRIMARY KEY,
  assignment_id       INTEGER   NOT NULL REFERENCES training_assignments(id),
  fecha_inicio        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_fin           TIMESTAMPTZ,
  estado              TEXT      NOT NULL DEFAULT 'EN_CURSO'
                      CHECK (estado IN ('EN_CURSO','COMPLETADA','CALIFICADA')),
  puntaje_mc          NUMERIC(5,2),
  puntaje_final       NUMERIC(5,2),
  calificado_por      UUID      REFERENCES user_profiles(user_id),
  fecha_calificacion  TIMESTAMPTZ,
  observaciones       TEXT
);

-- ─── 7. TABLA training_responses ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_responses (
  id               SERIAL   PRIMARY KEY,
  session_id       INTEGER  NOT NULL REFERENCES training_sessions(id),
  question_id      INTEGER  NOT NULL REFERENCES training_questions(id),
  opcion_id        INTEGER  REFERENCES training_question_options(id),
  respuesta_texto  TEXT,
  es_correcta      BOOLEAN,
  UNIQUE (session_id, question_id)
);

-- ─── 8. ÍNDICES ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ta_user     ON training_assignments (user_id);
CREATE INDEX IF NOT EXISTS idx_ta_training ON training_assignments (training_id);
CREATE INDEX IF NOT EXISTS idx_ts_assign   ON training_sessions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_tr_session  ON training_responses (session_id);

-- ─── 9. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE trainings                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_questions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_question_options  ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_responses         ENABLE ROW LEVEL SECURITY;

-- Drop policies idempotently before recreating
DROP POLICY IF EXISTS "tr_select"   ON trainings;
DROP POLICY IF EXISTS "tr_write"    ON trainings;
DROP POLICY IF EXISTS "tq_select"   ON training_questions;
DROP POLICY IF EXISTS "tq_write"    ON training_questions;
DROP POLICY IF EXISTS "tqo_select"  ON training_question_options;
DROP POLICY IF EXISTS "tqo_write"   ON training_question_options;
DROP POLICY IF EXISTS "ta_select"   ON training_assignments;
DROP POLICY IF EXISTS "ta_write"    ON training_assignments;
DROP POLICY IF EXISTS "ts_select"   ON training_sessions;
DROP POLICY IF EXISTS "ts_insert"   ON training_sessions;
DROP POLICY IF EXISTS "ts_update"   ON training_sessions;
DROP POLICY IF EXISTS "tres_select" ON training_responses;
DROP POLICY IF EXISTS "tres_insert" ON training_responses;
DROP POLICY IF EXISTS "tres_update" ON training_responses;

-- trainings: ADMIN/COORDINACION ven todo; resto solo activos
CREATE POLICY "tr_select" ON trainings FOR SELECT TO authenticated
  USING (activo = TRUE OR get_user_role() IN ('ADMIN','COORDINACION'));
CREATE POLICY "tr_write" ON trainings FOR ALL TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- questions & options: acceso de lectura a todos los autenticados; escritura solo ADMIN
CREATE POLICY "tq_select" ON training_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "tq_write"  ON training_questions FOR ALL TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

CREATE POLICY "tqo_select" ON training_question_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "tqo_write"  ON training_question_options FOR ALL TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- assignments: ADMIN gestiona; usuario ve las suyas; COORDINACION ve todas
CREATE POLICY "ta_select" ON training_assignments FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR get_user_role() IN ('ADMIN','COORDINACION')
  );
CREATE POLICY "ta_write" ON training_assignments FOR ALL TO authenticated
  USING  (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- sessions: usuario ve/crea las suyas; ADMIN/COORDINACION ven todas
CREATE POLICY "ts_select" ON training_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM training_assignments ta
            WHERE ta.id = assignment_id AND ta.user_id = auth.uid())
    OR get_user_role() IN ('ADMIN','COORDINACION')
  );
CREATE POLICY "ts_insert" ON training_sessions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM training_assignments ta
            WHERE ta.id = assignment_id AND ta.user_id = auth.uid())
  );
CREATE POLICY "ts_update" ON training_sessions FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM training_assignments ta
            WHERE ta.id = assignment_id AND ta.user_id = auth.uid())
    OR get_user_role() IN ('ADMIN','COORDINACION')
  );

-- responses: usuario ve/crea las suyas; ADMIN/COORDINACION ven todas
CREATE POLICY "tres_select" ON training_responses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM training_sessions ts
      JOIN training_assignments ta ON ta.id = ts.assignment_id
      WHERE ts.id = session_id AND ta.user_id = auth.uid()
    )
    OR get_user_role() IN ('ADMIN','COORDINACION')
  );
CREATE POLICY "tres_insert" ON training_responses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_sessions ts
      JOIN training_assignments ta ON ta.id = ts.assignment_id
      WHERE ts.id = session_id AND ta.user_id = auth.uid()
    )
  );
CREATE POLICY "tres_update" ON training_responses FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN');
