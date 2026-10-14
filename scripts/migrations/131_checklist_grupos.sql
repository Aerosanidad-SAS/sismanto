-- 131 · Grupos del preoperacional administrables desde Configuración. Idempotente, aditiva.
--
-- Por qué: hasta hoy los ítems del preoperacional se agrupaban por el texto fijo `checklist_items.categoria` (GENERAL, LUCES,
-- CABINA, EQUIPO_BASICO, EQUIPO_CARRETERA). Daniel quiere crear y reordenar grupos («Cabina conducción», «Habitáculo paciente»…),
-- mover ítems entre ellos y decidir a qué vehículos aplica cada ítem, sin tocar código (ver Configuración → Preoperacional).
--
-- Qué hace:
--   · `checklist_groups`: nombre, orden, activo. Lectura para cualquier usuario autenticado (el OVEM la necesita para pintar la
--     lista); escritura solo ADMIN.
--   · `checklist_items.group_id` (nullable, ON DELETE SET NULL): grupo del ítem. Un ítem sin grupo cae en su `categoria` de siempre.
--   · `checklist_items.es_inventario` (nullable): TRUE/FALSE fuerza si un ítem contado es inventario de equipo (faltante ≠ falla);
--     NULL = se deduce de la categoría como hasta ahora (EQUIPO_BASICO y EQUIPO_CARRETERA).
--   · Siembra un grupo por cada categoría existente y asigna `group_id` a los ítems que aún no tengan.
--   La aplicación a ambulancia / medicina domiciliaria sigue usando `checklist_items.tipos_vehiculo` (migración 096; NULL = todos).
-- No cambia ninguna respuesta ya guardada.

CREATE TABLE IF NOT EXISTS checklist_groups (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(80) NOT NULL,
  orden      INTEGER NOT NULL DEFAULT 0,
  activo     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_checklist_group_nombre UNIQUE (nombre)
);

ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES checklist_groups(id) ON DELETE SET NULL;
ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS es_inventario BOOLEAN;
CREATE INDEX IF NOT EXISTS idx_checklist_items_group ON checklist_items(group_id);

-- Un grupo por categoría existente (nombre legible, en el orden en que se recorría la lista).
INSERT INTO checklist_groups (nombre, orden) VALUES
  ('General', 10),
  ('Luces', 20),
  ('Cabina', 30),
  ('Equipo básico', 40),
  ('Equipo de carretera', 50)
ON CONFLICT (nombre) DO NOTHING;

UPDATE checklist_items ci
   SET group_id = g.id
  FROM checklist_groups g
 WHERE ci.group_id IS NULL
   AND ci.lista = 'PREOPERACIONAL'
   AND g.nombre = CASE ci.categoria
                    WHEN 'GENERAL' THEN 'General'
                    WHEN 'LUCES' THEN 'Luces'
                    WHEN 'CABINA' THEN 'Cabina'
                    WHEN 'EQUIPO_BASICO' THEN 'Equipo básico'
                    WHEN 'EQUIPO_CARRETERA' THEN 'Equipo de carretera'
                  END;

-- ─── RLS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
ALTER TABLE checklist_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS checklist_groups_select ON checklist_groups;
CREATE POLICY checklist_groups_select ON checklist_groups
  FOR SELECT TO authenticated USING ((SELECT get_user_role()) IS NOT NULL);

DROP POLICY IF EXISTS checklist_groups_insert_admin ON checklist_groups;
CREATE POLICY checklist_groups_insert_admin ON checklist_groups
  FOR INSERT TO authenticated WITH CHECK ((SELECT get_user_role()) = 'ADMIN');

DROP POLICY IF EXISTS checklist_groups_update_admin ON checklist_groups;
CREATE POLICY checklist_groups_update_admin ON checklist_groups
  FOR UPDATE TO authenticated
  USING ((SELECT get_user_role()) = 'ADMIN') WITH CHECK ((SELECT get_user_role()) = 'ADMIN');

DROP POLICY IF EXISTS checklist_groups_delete_admin ON checklist_groups;
CREATE POLICY checklist_groups_delete_admin ON checklist_groups
  FOR DELETE TO authenticated USING ((SELECT get_user_role()) = 'ADMIN');

-- Igual que las demás tablas: si existe la política restrictiva de TECNICO/AEROPUERTO (076), esta tabla también queda cubierta.
DO $$
BEGIN
  IF to_regprocedure('public.aplicar_politica_rol_restringido(text)') IS NOT NULL THEN
    PERFORM aplicar_politica_rol_restringido('checklist_groups');
  END IF;
END $$;

-- Rollback: ALTER TABLE checklist_items DROP COLUMN IF EXISTS es_inventario, DROP COLUMN IF EXISTS group_id; DROP TABLE IF EXISTS checklist_groups;
