-- ============================================================
-- Migración 067: Soporte técnico (tickets) — configuración e indicadores
--
-- Continúa la 065/066. Porta la configuración del módulo de SISRES
-- (ticketCatalogosConfig.php, guardarSlaTickets.php, guardarHorarioLaboralTicket.php,
-- guardarDisponibilidadTicket.php, guardarCorreosGestoresTicket.php,
-- guardarMensajeTicket.php) y deja los datos para los indicadores
-- (reportesTickets.php).
--
-- Quién puede qué:
--   · Configurar (catálogos, SLA, horario, disponibilidad, correos, mensaje): ADMIN.
--   · Leer SLA / horario / mensaje: cualquier usuario con sesión (el mensaje
--     se muestra a quien registra un ticket; SLA y horario no son sensibles).
--   · Leer disponibilidad mensual: gestores (alimenta los indicadores).
--   · Correos de gestores: solo ADMIN (son datos de personas; el servidor los
--     lee con la clave de servicio, tras validar el rol, para enviar avisos).
--
-- No se siembra ningún correo real. Idempotente.
-- ============================================================

-- ─── 1. Parámetros (una sola fila) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_config (
  id                 SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- Horas para el primer contacto, por prioridad (SLA de respuesta).
  sla_baja_horas     INTEGER NOT NULL DEFAULT 72 CHECK (sla_baja_horas    BETWEEN 1 AND 720),
  sla_media_horas    INTEGER NOT NULL DEFAULT 24 CHECK (sla_media_horas   BETWEEN 1 AND 720),
  sla_alta_horas     INTEGER NOT NULL DEFAULT 8  CHECK (sla_alta_horas    BETWEEN 1 AND 720),
  sla_urgente_horas  INTEGER NOT NULL DEFAULT 4  CHECK (sla_urgente_horas BETWEEN 1 AND 720),
  -- Horario laboral para medir tiempos: días ISO (1 = lunes … 7 = domingo).
  horario_dias       SMALLINT[] NOT NULL DEFAULT '{1,2,3,4,5}'
                       CHECK (cardinality(horario_dias) BETWEEN 1 AND 7 AND horario_dias <@ ARRAY[1,2,3,4,5,6,7]::smallint[]),
  horario_inicio     TIME NOT NULL DEFAULT '08:00',
  horario_fin        TIME NOT NULL DEFAULT '17:00',
  mensaje_adicional  VARCHAR(500),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by         UUID REFERENCES auth.users(id),
  CHECK (horario_fin > horario_inicio)
);
INSERT INTO ticket_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── 2. Disponibilidad mensual de la plataforma (%) ──────────────────────────
CREATE TABLE IF NOT EXISTS tickets_disponibilidad_mensual (
  anio           SMALLINT NOT NULL CHECK (anio BETWEEN 2020 AND 2100),
  mes            SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  porcentaje     NUMERIC(5,2) NOT NULL CHECK (porcentaje BETWEEN 0 AND 100),
  notas          VARCHAR(500),
  registrado_por UUID REFERENCES auth.users(id),
  registrado_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (anio, mes)
);

-- ─── 3. Correos de los gestores (avisos de tickets nuevos) ───────────────────
CREATE TABLE IF NOT EXISTS ticket_correos_gestores (
  id     SERIAL PRIMARY KEY,
  correo VARCHAR(254) NOT NULL CHECK (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ticket_correos_gestores_correo ON ticket_correos_gestores (lower(correo));

-- ─── 4. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE ticket_config                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_disponibilidad_mensual ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_correos_gestores        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ticket_config_select ON ticket_config;
CREATE POLICY ticket_config_select ON ticket_config
  FOR SELECT TO authenticated USING (get_user_role() IS NOT NULL);
DROP POLICY IF EXISTS ticket_config_write ON ticket_config;
CREATE POLICY ticket_config_write ON ticket_config
  FOR UPDATE TO authenticated USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS tickets_disp_select ON tickets_disponibilidad_mensual;
CREATE POLICY tickets_disp_select ON tickets_disponibilidad_mensual
  FOR SELECT TO authenticated USING (es_gestor_tickets());
DROP POLICY IF EXISTS tickets_disp_write ON tickets_disponibilidad_mensual;
CREATE POLICY tickets_disp_write ON tickets_disponibilidad_mensual
  FOR ALL TO authenticated USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS ticket_correos_all ON ticket_correos_gestores;
CREATE POLICY ticket_correos_all ON ticket_correos_gestores
  FOR ALL TO authenticated USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- ─── 5. Guardar un catálogo completo, de forma atómica ───────────────────────
-- Recibe la lista final de nombres activos: los nuevos se crean, los que ya
-- existen se reactivan y los que faltan se DESACTIVAN (no se borran: los
-- tickets guardan el nombre como texto y el historial debe seguir legible).
-- La lista no puede quedar vacía: sin catálogo nadie podría registrar tickets.
CREATE OR REPLACE FUNCTION public.guardar_catalogo_ticket(p_tipo TEXT, p_nombres TEXT[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tabla   TEXT;
  v_nombres TEXT[];
BEGIN
  IF get_user_role() IS DISTINCT FROM 'ADMIN' THEN RAISE EXCEPTION 'Solo un Administrador puede configurar los catálogos'; END IF;

  v_tabla := CASE p_tipo WHEN 'sedes' THEN 'ticket_sedes' WHEN 'areas' THEN 'ticket_areas' WHEN 'categorias' THEN 'ticket_categorias' END;
  IF v_tabla IS NULL THEN RAISE EXCEPTION 'Catálogo desconocido'; END IF;

  -- Se limpian espacios, se descartan vacíos y se quitan repetidos (sin distinguir mayúsculas).
  SELECT COALESCE(array_agg(n ORDER BY n), '{}')
    INTO v_nombres
    FROM (
      SELECT DISTINCT ON (upper(n)) n
        FROM (SELECT btrim(x) AS n FROM unnest(COALESCE(p_nombres, '{}')) AS x) t
       WHERE n <> ''
       ORDER BY upper(n), n
    ) d;

  IF cardinality(v_nombres) = 0 THEN RAISE EXCEPTION 'El catálogo no puede quedar vacío'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(v_nombres) AS n WHERE char_length(n) > 100) THEN
    RAISE EXCEPTION 'Cada nombre puede tener máximo 100 caracteres';
  END IF;

  EXECUTE format(
    'INSERT INTO %I (nombre, activo) SELECT n, true FROM unnest($1) AS n
       ON CONFLICT (nombre) DO UPDATE SET activo = true', v_tabla) USING v_nombres;
  EXECUTE format('UPDATE %I SET activo = false WHERE activo AND nombre <> ALL ($1)', v_tabla) USING v_nombres;
END;
$$;

REVOKE ALL ON FUNCTION public.guardar_catalogo_ticket(text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.guardar_catalogo_ticket(text, text[]) TO authenticated, service_role;
