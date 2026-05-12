-- ============================================================
-- Migración 014: Módulo de capacitaciones y evaluaciones
-- ============================================================

CREATE TABLE IF NOT EXISTS training_courses (
  id                 SERIAL PRIMARY KEY,
  titulo             VARCHAR(200) NOT NULL,
  contenido          TEXT NOT NULL,
  mes_ciclo          INTEGER CHECK (mes_ciclo BETWEEN 1 AND 12),
  tiempo_limite_min  INTEGER NOT NULL DEFAULT 45 CHECK (tiempo_limite_min > 0),
  activo             BOOLEAN NOT NULL DEFAULT TRUE,
  created_by         UUID REFERENCES user_profiles(user_id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_course_mc_questions (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  pregunta    TEXT NOT NULL,
  orden       INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_course_mc_options (
  id           SERIAL PRIMARY KEY,
  question_id  INTEGER NOT NULL REFERENCES training_course_mc_questions(id) ON DELETE CASCADE,
  texto        TEXT NOT NULL,
  es_correcta  BOOLEAN NOT NULL DEFAULT FALSE,
  orden        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS training_course_open_questions (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  pregunta    TEXT NOT NULL,
  orden       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS training_assignments (
  id           SERIAL PRIMARY KEY,
  course_id    INTEGER NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin    DATE,
  estado       VARCHAR(40) NOT NULL DEFAULT 'ASIGNADA'
               CHECK (estado IN ('ASIGNADA', 'EN_PROGRESO', 'ENVIADA', 'CALIFICADA', 'VENCIDA')),
  asignado_por UUID REFERENCES user_profiles(user_id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, user_id, fecha_inicio)
);

CREATE TABLE IF NOT EXISTS training_attempts (
  id              SERIAL PRIMARY KEY,
  assignment_id   INTEGER NOT NULL UNIQUE REFERENCES training_assignments(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  mc_answers      JSONB NOT NULL DEFAULT '{}'::jsonb,
  open_answers    JSONB NOT NULL DEFAULT '{}'::jsonb,
  justificacion   TEXT,
  auto_score_mc   NUMERIC(5,2),
  final_score     NUMERIC(5,2),
  feedback_admin  TEXT,
  status          VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE_ENVIO'
                  CHECK (status IN ('PENDIENTE_ENVIO', 'PENDIENTE_CALIFICACION_ADMIN', 'CALIFICADA')),
  reviewed_by     UUID REFERENCES user_profiles(user_id),
  reviewed_at     TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_assignments_user ON training_assignments(user_id, estado);
CREATE INDEX IF NOT EXISTS idx_training_assignments_course ON training_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_training_attempts_status ON training_attempts(status);
CREATE INDEX IF NOT EXISTS idx_training_mc_questions_course ON training_course_mc_questions(course_id, orden);
CREATE INDEX IF NOT EXISTS idx_training_open_questions_course ON training_course_open_questions(course_id, orden);
CREATE INDEX IF NOT EXISTS idx_training_mc_options_question ON training_course_mc_options(question_id, orden);

-- Trigger updated_at attempts
CREATE OR REPLACE FUNCTION trg_set_training_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS training_attempts_set_updated_at ON training_attempts;
CREATE TRIGGER training_attempts_set_updated_at
BEFORE UPDATE ON training_attempts
FOR EACH ROW EXECUTE FUNCTION trg_set_training_attempts_updated_at();

-- RLS
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_course_mc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_course_mc_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_course_open_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attempts ENABLE ROW LEVEL SECURITY;

-- Cursos y banco de preguntas: lectura amplia, edición ADMIN
DROP POLICY IF EXISTS training_courses_select ON training_courses;
CREATE POLICY training_courses_select ON training_courses
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS training_courses_admin_write ON training_courses;
CREATE POLICY training_courses_admin_write ON training_courses
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS training_mc_questions_select ON training_course_mc_questions;
CREATE POLICY training_mc_questions_select ON training_course_mc_questions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS training_mc_questions_admin_write ON training_course_mc_questions;
CREATE POLICY training_mc_questions_admin_write ON training_course_mc_questions
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS training_mc_options_select ON training_course_mc_options;
CREATE POLICY training_mc_options_select ON training_course_mc_options
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS training_mc_options_admin_write ON training_course_mc_options;
CREATE POLICY training_mc_options_admin_write ON training_course_mc_options
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS training_open_questions_select ON training_course_open_questions;
CREATE POLICY training_open_questions_select ON training_course_open_questions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS training_open_questions_admin_write ON training_course_open_questions;
CREATE POLICY training_open_questions_admin_write ON training_course_open_questions
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- Asignaciones: admin gestiona; OVEM ve las suyas; coordinación y admin ven todas
DROP POLICY IF EXISTS training_assignments_select ON training_assignments;
CREATE POLICY training_assignments_select ON training_assignments
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'COORDINACION')
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS training_assignments_admin_write ON training_assignments;
CREATE POLICY training_assignments_admin_write ON training_assignments
  FOR ALL TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');

-- Intentos: OVEM sobre su asignación; Admin corrige; Coordinación solo lectura
DROP POLICY IF EXISTS training_attempts_select ON training_attempts;
CREATE POLICY training_attempts_select ON training_attempts
  FOR SELECT TO authenticated
  USING (
    get_user_role() IN ('ADMIN', 'COORDINACION')
    OR EXISTS (
      SELECT 1
      FROM training_assignments ta
      WHERE ta.id = training_attempts.assignment_id
        AND ta.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS training_attempts_ovem_insert ON training_attempts;
CREATE POLICY training_attempts_ovem_insert ON training_attempts
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'OVEM'
    AND EXISTS (
      SELECT 1
      FROM training_assignments ta
      WHERE ta.id = assignment_id
        AND ta.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS training_attempts_ovem_update ON training_attempts;
CREATE POLICY training_attempts_ovem_update ON training_attempts
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'OVEM'
    AND status IN ('PENDIENTE_ENVIO', 'PENDIENTE_CALIFICACION_ADMIN')
    AND EXISTS (
      SELECT 1
      FROM training_assignments ta
      WHERE ta.id = training_attempts.assignment_id
        AND ta.user_id = auth.uid()
    )
  )
  WITH CHECK (
    get_user_role() = 'OVEM'
    AND EXISTS (
      SELECT 1
      FROM training_assignments ta
      WHERE ta.id = assignment_id
        AND ta.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS training_attempts_admin_update ON training_attempts;
CREATE POLICY training_attempts_admin_update ON training_attempts
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'ADMIN')
  WITH CHECK (get_user_role() = 'ADMIN');
