-- Registro de uso de la API de IA para control de costos
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id         bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  feature    text        NOT NULL CHECK (feature IN ('chat', 'insights')),
  modelo     text        NOT NULL,
  tokens_in  int         NOT NULL DEFAULT 0,
  tokens_out int         NOT NULL DEFAULT 0,
  cost_usd   numeric(10,6) NOT NULL DEFAULT 0,
  usuario_id uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Solo administradores pueden consultar el log
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_select_ai_usage" ON ai_usage_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role_codigo = 'ADMIN'
    )
  );

-- El servidor inserta usando service role (sin restricción)
CREATE POLICY "server_insert_ai_usage" ON ai_usage_log
  FOR INSERT WITH CHECK (true);
