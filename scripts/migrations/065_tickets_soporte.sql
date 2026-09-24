-- ============================================================
-- Migración 065: Soporte técnico (tickets) — lado del solicitante
--
-- Origen: módulo "Tickets de Tecnología" de SISRES (tickets_tecnologia,
-- tickets_tecnologia_historial, ticket_areas / ticket_categorias /
-- ticket_sedes). Ver PARIDAD_REGULACION.md, sección 9 (TIC-01…TIC-14).
--
-- Esta migración crea TODO el esquema del módulo para que las pantallas de
-- gestión (técnicos), catálogos e indicadores lleguen después sin volver a
-- tocar estas tablas. Lo que la aplicación usa hoy es lo del solicitante:
-- crear un ticket, ver "Mis tickets" y reabrir uno cerrado.
--
-- Decisiones de seguridad (RLS):
--   · Ver: el solicitante ve SUS tickets; los gestores (ADMIN, ANALISTA,
--     COORDINACION — los cargos que en SISRES tienen act_gestionar_ticket)
--     ven todos. Nadie más.
--   · Crear: cualquier usuario con perfil activo, siempre como ABIERTO y sin
--     técnico/solución. Solo un gestor puede registrar a nombre de otro
--     (queda trazado en registrado_por_id).
--   · Sin política de UPDATE/DELETE para usuarios: reabrir se hace SOLO por
--     reabrir_ticket() (SECURITY DEFINER), que valida que el ticket sea del
--     solicitante y esté CERRADO. Así un solicitante no puede tocar otras
--     columnas (asunto, prioridad, técnico…) llamando la API directo.
--   · El historial lo escriben el trigger de creación y las funciones; los
--     usuarios no tienen INSERT.
--
-- Idempotente. Los catálogos traen una semilla inicial editable (Configuración
-- de tickets llega en un PR aparte); el catálogo real de producción de SISRES
-- lo entrega León con el export.
-- ============================================================

-- ─── 1. Catálogos ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_areas (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS ticket_categorias (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS ticket_sedes (
  id     SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT true
);

-- Semilla: categorías tal cual las sembró SISRES; áreas = las 6 áreas que
-- SISRES ya usa en su catálogo de proveedores; sedes = los centros operativos.
INSERT INTO ticket_categorias (nombre) VALUES ('HARDWARE'), ('SOFTWARE'), ('RED'), ('OTRO')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO ticket_areas (nombre) VALUES
  ('BIOMEDICA'), ('SISTEMAS'), ('TALENTO HUMANO'), ('CRA MEDELLIN'), ('CRA BOGOTA'), ('MANTENIMIENTO')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO ticket_sedes (nombre)
SELECT nombre FROM operational_centers WHERE activo IS DISTINCT FROM false
ON CONFLICT (nombre) DO NOTHING;

-- ─── 2. Ticket ───────────────────────────────────────────────────────────────
-- categoria / area / sede se guardan como TEXTO (igual que SISRES): renombrar
-- o desactivar un valor del catálogo no altera el historial de tickets viejos.
CREATE TABLE IF NOT EXISTS tickets (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sisres_id             INTEGER UNIQUE,  -- id en SISRES (tickets_tecnologia.id); lo llena la ETL
  categoria             VARCHAR(100) NOT NULL,
  prioridad             VARCHAR(10)  NOT NULL CHECK (prioridad IN ('BAJA','MEDIA','ALTA','URGENTE')),
  asunto                VARCHAR(150) NOT NULL,
  descripcion           TEXT NOT NULL,
  adjunto_path          TEXT,            -- ruta en el bucket privado tickets-adjuntos (no URL pública)
  estado                VARCHAR(12)  NOT NULL DEFAULT 'ABIERTO'
                          CHECK (estado IN ('ABIERTO','EN_PROCESO','RESUELTO','CERRADO')),
  solicitante_id        UUID NOT NULL REFERENCES auth.users(id),
  nombre_solicitante    VARCHAR(150) NOT NULL,
  celular_contacto      VARCHAR(20)  NOT NULL,
  registrado_por_id     UUID REFERENCES auth.users(id),   -- solo si un gestor lo registró a nombre de otro
  nombre_registrado_por VARCHAR(150),
  sede                  VARCHAR(100) NOT NULL,
  area                  VARCHAR(100) NOT NULL,
  tecnico_id            UUID REFERENCES auth.users(id),
  nombre_tecnico        VARCHAR(150),
  solucion              TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_primer_contacto TIMESTAMPTZ,
  fecha_resuelto        TIMESTAMPTZ,
  fecha_cierre          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_estado      ON tickets(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_solicitante ON tickets(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tecnico     ON tickets(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at  ON tickets(created_at DESC);

-- ─── 3. Historial ────────────────────────────────────────────────────────────
-- Fuente de los tiempos de respuesta/resolución de los indicadores.
CREATE TABLE IF NOT EXISTS ticket_historial (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id       BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  tipo_evento     VARCHAR(30) NOT NULL
                    CHECK (tipo_evento IN ('CREACION','ASIGNACION','CONTACTO','CAMBIO_ESTADO','CAMBIO_PRIORIDAD','CIERRE_CONFIRMADO','REAPERTURA')),
  estado_anterior VARCHAR(20),
  estado_nuevo    VARCHAR(20),
  nota            TEXT,
  usuario_id      UUID REFERENCES auth.users(id),
  nombre_usuario  VARCHAR(150) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ticket_historial_ticket ON ticket_historial(ticket_id);

-- ─── 4. Helper de rol ────────────────────────────────────────────────────────
-- "Gestor de tickets" = los cargos de SISRES con act_gestionar_ticket:
-- Administrador, Analista y Coordinador (Técnico no existe como rol en SISMANTO).
-- Una sola definición para que cambiar quién gestiona sea tocar un lugar.
CREATE OR REPLACE FUNCTION public.es_gestor_tickets()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(get_user_role() IN ('ADMIN','ANALISTA','COORDINACION'), false);
$$;

REVOKE ALL ON FUNCTION public.es_gestor_tickets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.es_gestor_tickets() TO authenticated;
GRANT EXECUTE ON FUNCTION public.es_gestor_tickets() TO service_role;

-- ─── 5. RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE tickets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_areas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_sedes     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tickets_select ON tickets;
CREATE POLICY tickets_select ON tickets
  FOR SELECT TO authenticated
  USING (solicitante_id = auth.uid() OR es_gestor_tickets());

DROP POLICY IF EXISTS tickets_insert ON tickets;
CREATE POLICY tickets_insert ON tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() IS NOT NULL                      -- perfil activo
    AND estado = 'ABIERTO'
    AND tecnico_id IS NULL AND nombre_tecnico IS NULL
    AND solucion IS NULL
    AND fecha_primer_contacto IS NULL AND fecha_resuelto IS NULL AND fecha_cierre IS NULL
    AND sisres_id IS NULL
    AND (
      (solicitante_id = auth.uid() AND registrado_por_id IS NULL)
      OR (es_gestor_tickets() AND registrado_por_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS ticket_historial_select ON ticket_historial;
CREATE POLICY ticket_historial_select ON ticket_historial
  FOR SELECT TO authenticated
  USING (
    es_gestor_tickets()
    OR EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_historial.ticket_id AND t.solicitante_id = auth.uid())
  );

-- Catálogos: todos leen los activos (los necesita el formulario); solo ADMIN escribe.
DROP POLICY IF EXISTS ticket_areas_select ON ticket_areas;
CREATE POLICY ticket_areas_select ON ticket_areas
  FOR SELECT TO authenticated USING (activo OR get_user_role() = 'ADMIN');
DROP POLICY IF EXISTS ticket_areas_write ON ticket_areas;
CREATE POLICY ticket_areas_write ON ticket_areas
  FOR ALL TO authenticated USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS ticket_categorias_select ON ticket_categorias;
CREATE POLICY ticket_categorias_select ON ticket_categorias
  FOR SELECT TO authenticated USING (activo OR get_user_role() = 'ADMIN');
DROP POLICY IF EXISTS ticket_categorias_write ON ticket_categorias;
CREATE POLICY ticket_categorias_write ON ticket_categorias
  FOR ALL TO authenticated USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS ticket_sedes_select ON ticket_sedes;
CREATE POLICY ticket_sedes_select ON ticket_sedes
  FOR SELECT TO authenticated USING (activo OR get_user_role() = 'ADMIN');
DROP POLICY IF EXISTS ticket_sedes_write ON ticket_sedes;
CREATE POLICY ticket_sedes_write ON ticket_sedes
  FOR ALL TO authenticated USING (get_user_role() = 'ADMIN') WITH CHECK (get_user_role() = 'ADMIN');

-- ─── 6. Historial de creación (trigger) ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_ticket_historial_creacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO ticket_historial (ticket_id, tipo_evento, estado_nuevo, nota, usuario_id, nombre_usuario)
  VALUES (
    NEW.id, 'CREACION', 'ABIERTO',
    CASE WHEN NEW.registrado_por_id IS NOT NULL
         THEN 'Registrado por ' || COALESCE(NEW.nombre_registrado_por, '—') || ' a nombre de ' || NEW.nombre_solicitante
    END,
    COALESCE(NEW.registrado_por_id, NEW.solicitante_id),
    COALESCE(NEW.nombre_registrado_por, NEW.nombre_solicitante)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ticket_historial_creacion ON tickets;
CREATE TRIGGER trg_ticket_historial_creacion
  AFTER INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION public.fn_ticket_historial_creacion();

-- ─── 7. Reabrir un ticket cerrado (solo el solicitante) ─────────────────────
-- Igual que procesarReaperturaTicket.php: solo el solicitante, solo si está
-- CERRADO, nota obligatoria; vuelve a EN_PROCESO con el mismo técnico.
CREATE OR REPLACE FUNCTION public.reabrir_ticket(p_ticket_id BIGINT, p_nota TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre TEXT;
BEGIN
  IF auth.uid() IS NULL OR get_user_role() IS NULL THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  IF p_nota IS NULL OR btrim(p_nota) = '' THEN
    RAISE EXCEPTION 'Tienes que explicar por qué reabres el ticket';
  END IF;

  UPDATE tickets
     SET estado = 'EN_PROCESO', fecha_resuelto = NULL, fecha_cierre = NULL
   WHERE id = p_ticket_id AND solicitante_id = auth.uid() AND estado = 'CERRADO';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este ticket ya no está cerrado o no es tuyo — no se pudo reabrir';
  END IF;

  SELECT nombre_completo INTO v_nombre FROM user_profiles WHERE user_id = auth.uid();

  INSERT INTO ticket_historial (ticket_id, tipo_evento, estado_anterior, estado_nuevo, nota, usuario_id, nombre_usuario)
  VALUES (p_ticket_id, 'REAPERTURA', 'CERRADO', 'EN_PROCESO', btrim(p_nota), auth.uid(), COALESCE(v_nombre, '—'));
END;
$$;

REVOKE ALL ON FUNCTION public.reabrir_ticket(BIGINT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reabrir_ticket(BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reabrir_ticket(BIGINT, TEXT) TO service_role;

-- ─── 8. Adjuntos (bucket privado) ───────────────────────────────────────────
-- Como la boleta de salida (057): privado, URLs firmadas. La ruta es
-- <uid del que sube>/<nombre aleatorio>: cada quien solo escribe en su carpeta.
-- SISRES solo acepta JPEG/PNG reales; el bucket lo refuerza con el tipo MIME.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tickets-adjuntos', 'tickets-adjuntos', false, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS tickets_adjuntos_insert ON storage.objects;
CREATE POLICY tickets_adjuntos_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tickets-adjuntos'
    AND get_user_role() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS tickets_adjuntos_select ON storage.objects;
CREATE POLICY tickets_adjuntos_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'tickets-adjuntos'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR es_gestor_tickets())
  );
