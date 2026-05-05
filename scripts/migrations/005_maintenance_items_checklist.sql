-- ============================================================
-- Migración 005: Ítems de mantenimiento + Checklist configurable
-- Idempotente: se puede volver a ejecutar de forma segura.
-- ============================================================

-- ============================================================
-- 1. TABLA maintenance_items
--    Una factura puede tener 1..N ítems, cada uno es una fila.
--    El valor total en maintenance_records.valor = SUM(items).
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_items (
  id              SERIAL PRIMARY KEY,
  maintenance_record_id INTEGER NOT NULL
                  REFERENCES maintenance_records(id_manto) ON DELETE CASCADE,
  descripcion     TEXT NOT NULL,
  cantidad        DECIMAL(10,3) NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  valor_unitario  DECIMAL(12,2) NOT NULL CHECK (valor_unitario >= 0),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_items_record
  ON maintenance_items(maintenance_record_id);

-- ============================================================
-- 2. TABLA checklist_items
--    Ítems del preoperacional, gestionados desde Configuración.
--    Categorías: GENERAL, LUCES, CABINA, EQUIPO_BASICO, EQUIPO_CARRETERA
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id                SERIAL PRIMARY KEY,
  categoria         VARCHAR(50) NOT NULL,
  descripcion       VARCHAR(300) NOT NULL,
  cantidad_esperada VARCHAR(20),   -- '1', '2', '1 Par', 'OK', etc.
  orden             INTEGER NOT NULL DEFAULT 0,
  activo            BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_checklist_item UNIQUE (categoria, descripcion)
);

CREATE INDEX IF NOT EXISTS idx_checklist_activo_orden
  ON checklist_items(activo, orden);

-- ============================================================
-- 3. TABLA daily_check_items
--    Resultado por ítem para cada daily_check.
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_check_items (
  id                SERIAL PRIMARY KEY,
  daily_check_id    INTEGER NOT NULL REFERENCES daily_checks(id) ON DELETE CASCADE,
  checklist_item_id INTEGER NOT NULL REFERENCES checklist_items(id),
  estado            VARCHAR(20) NOT NULL CHECK (estado IN ('OK', 'FALLA', 'NO_APLICA')),
  observacion       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_daily_check_item UNIQUE (daily_check_id, checklist_item_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_check_items_check
  ON daily_check_items(daily_check_id);

-- ============================================================
-- 4. Trigger: sincronizar daily_checks.checklist_ok
--    true si ningún ítem activo tiene estado = 'FALLA'
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_checklist_ok()
RETURNS TRIGGER AS $$
DECLARE
  v_check_id INTEGER;
BEGIN
  v_check_id := COALESCE(NEW.daily_check_id, OLD.daily_check_id);

  UPDATE daily_checks
  SET checklist_ok = NOT EXISTS (
    SELECT 1
    FROM daily_check_items dci
    JOIN checklist_items ci ON ci.id = dci.checklist_item_id
    WHERE dci.daily_check_id = v_check_id
      AND dci.estado = 'FALLA'
      AND ci.activo = true
  )
  WHERE id = v_check_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_checklist_ok ON daily_check_items;
CREATE TRIGGER trg_actualizar_checklist_ok
AFTER INSERT OR UPDATE OR DELETE ON daily_check_items
FOR EACH ROW EXECUTE FUNCTION actualizar_checklist_ok();

-- ============================================================
-- 5. Seed: 80 ítems del preoperacional de ambulancia
-- ============================================================
INSERT INTO checklist_items (categoria, descripcion, cantidad_esperada, orden) VALUES

-- GENERAL (ítems de documentación antes de las secciones técnicas)
('GENERAL', 'Sticker Visible',                                          'OK',    10),
('GENERAL', 'Documentos (SOAT - Tecnicomecánica)',                      'OK',    20),

-- LUCES
('LUCES', 'Luces principales altas y bajas',                            '2',    110),
('LUCES', 'Direccionales delanteras de parqueo (Giro)',                 '2',    120),
('LUCES', 'Direccionales traseras de parqueo (Giro)',                   '2',    130),
('LUCES', 'Luces Laterales Blancas',                                    '2',    140),
('LUCES', 'Luces Laterales Rojas Intermitentes',                        '2',    150),
('LUCES', 'Exploradora Trasera',                                        '1',    160),
('LUCES', 'Exploradoras Delanteras',                                    '2',    170),
('LUCES', 'Baliza principal',                                           '1',    180),
('LUCES', 'Baliza Trasera',                                             '1',    190),
('LUCES', 'Luces Destrover',                                            '2',    200),
('LUCES', 'Luces Internas',                                             '5',    210),
('LUCES', 'Luces estacionarias',                                        '2',    220),

-- CABINA
('CABINA', 'Espejo central',                                            '1',    310),
('CABINA', 'Espejos laterales',                                         '2',    320),
('CABINA', 'Altavoz',                                                   '1',    330),
('CABINA', 'Caja de Control de Tonos',                                  '1',    340),
('CABINA', 'Radio Portátil',                                            '1',    350),
('CABINA', 'Radio Base',                                                '1',    360),
('CABINA', 'Persiana Solar',                                            '1',    370),
('CABINA', 'Pito',                                                      '1',    380),
('CABINA', 'Freno de servicio',                                         '1',    390),
('CABINA', 'Freno de emergencia',                                       '1',    400),
('CABINA', 'Dirección/suspensión (Terminales)',                         'OK',   410),
('CABINA', 'Cinturón de seguridad',                                     'OK',   420),
('CABINA', 'Puertas cabina en buen estado',                             '1',    430),
('CABINA', 'Vidrio frontal (en buen estado)',                           '1',    440),
('CABINA', 'Limpiaparabrisas (Plumillas)',                              '1',    450),
('CABINA', 'Botiquín',                                                  '1',    460),
('CABINA', 'Asiento en buena condición',                                'OK',   470),
('CABINA', 'Indicadores (hidráulico - voltímetro)',                     'OK',   480),
('CABINA', 'Motor (refrigerante - odómetro - aire)',                    'OK',   490),
('CABINA', 'Batería',                                                   '1',    500),
('CABINA', 'Control de fugas hidráulicas',                              'OK',   510),
('CABINA', 'Sirena',                                                    'OK',   520),
('CABINA', 'Estado de correas',                                         'OK',   530),
('CABINA', 'Caja de cambios en buen estado',                            '1',    540),
('CABINA', 'Radiador',                                                  '1',    550),
('CABINA', 'Mangueras',                                                 'OK',   560),
('CABINA', 'Puertas carrocería en buen estado',                         '5',    570),
('CABINA', 'Puerta Lateral (estado y cierre)',                          'OK',   580),
('CABINA', 'Puerta Trasera (estado y cierre)',                          'OK',   590),
('CABINA', 'Estribo de Acceso con Piso Antideslizante',                 '1',    600),

-- EQUIPO_BASICO
('EQUIPO_BASICO', 'Caja De Fusibles',                                   '1',    710),
('EQUIPO_BASICO', 'Balas Centrales de Oxígeno',                         '1',    720),
('EQUIPO_BASICO', 'Bala de Oxígeno Portátil',                           '1',    730),
('EQUIPO_BASICO', 'Silla Cabecera de Paciente con Cinturón de 3 Puntos','1',    740),
('EQUIPO_BASICO', 'Gabetas para Insumos (Quirúr. Circul. Respir. Pediát.)','4', 750),
('EQUIPO_BASICO', 'Tablero y Caja del Sistema Eléctrico',               '1',    760),
('EQUIPO_BASICO', 'Tomas de 110 Voltios',                               'OK',   770),
('EQUIPO_BASICO', 'Caja de Control de Luces Externas',                  '1',    780),
('EQUIPO_BASICO', 'Aire Acondicionado',                                 '1',    790),
('EQUIPO_BASICO', 'Extractor',                                          '1',    800),
('EQUIPO_BASICO', 'Cable Para Cometida Eléctrica',                      '1',    810),
('EQUIPO_BASICO', 'Lámpara con Extensión',                              '1',    820),
('EQUIPO_BASICO', 'Linterna de Mano',                                   '1',    830),

-- EQUIPO_CARRETERA
('EQUIPO_CARRETERA', 'Cuerda Estática',                                 '1',    910),
('EQUIPO_CARRETERA', 'Cuerda Con Gancho',                               '1',    920),
('EQUIPO_CARRETERA', 'Cables de Inicio',                                '1 Par',930),
('EQUIPO_CARRETERA', 'Tijera Corta Todo',                               '1',    940),
('EQUIPO_CARRETERA', 'Cortafrío',                                       '1',    950),
('EQUIPO_CARRETERA', 'Extintor Multipropósito',                         '2',    960),
('EQUIPO_CARRETERA', 'Impermeables',                                    '2',    970),
('EQUIPO_CARRETERA', 'Gato Hidráulico',                                 '1',    980),
('EQUIPO_CARRETERA', 'Llanta de repuesto',                              '1',    990),
('EQUIPO_CARRETERA', 'Llantas sin fisuras profundas y sin abultamientos','4',  1000),
('EQUIPO_CARRETERA', 'Palanca de Gato',                                 '1',   1010),
('EQUIPO_CARRETERA', 'Tacos',                                           '2',   1020),
('EQUIPO_CARRETERA', 'Chaleco Reflectivo',                              '2',   1030),
('EQUIPO_CARRETERA', 'Señales Reflectivas',                             '2',   1040),
('EQUIPO_CARRETERA', 'Destornillador Estrella',                         '1',   1050),
('EQUIPO_CARRETERA', 'Destornillador de pala',                          '1',   1060),
('EQUIPO_CARRETERA', 'Alicates',                                        '1',   1070),
('EQUIPO_CARRETERA', 'Llave de Expansión',                              '1',   1080),
('EQUIPO_CARRETERA', 'Llaves Fijas',                                    '6',   1090),
('EQUIPO_CARRETERA', 'Martillo',                                        '1',   1100),
('EQUIPO_CARRETERA', 'Patecabra',                                       '1',   1110),
('EQUIPO_CARRETERA', 'Guantes de Trabajo',                              '1 Par',1120),
('EQUIPO_CARRETERA', 'Bisturí',                                         '1',   1130)

ON CONFLICT (categoria, descripcion) DO NOTHING;

-- ============================================================
-- 6. RLS para las 3 tablas nuevas
-- ============================================================
ALTER TABLE maintenance_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_check_items  ENABLE ROW LEVEL SECURITY;

-- maintenance_items: acceso total para autenticados y anon (consistente con resto del schema)
DROP POLICY IF EXISTS "Auth: todo maintenance_items" ON maintenance_items;
DROP POLICY IF EXISTS "Anon: todo maintenance_items" ON maintenance_items;
CREATE POLICY "Auth: todo maintenance_items"
  ON maintenance_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon: todo maintenance_items"
  ON maintenance_items FOR ALL TO anon USING (true) WITH CHECK (true);

-- checklist_items: lectura para todos, escritura solo autenticados
DROP POLICY IF EXISTS "Auth: leer checklist_items"    ON checklist_items;
DROP POLICY IF EXISTS "Auth: escribir checklist_items" ON checklist_items;
DROP POLICY IF EXISTS "Anon: leer checklist_items"    ON checklist_items;
CREATE POLICY "Auth: leer checklist_items"
  ON checklist_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth: escribir checklist_items"
  ON checklist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anon: leer checklist_items"
  ON checklist_items FOR SELECT TO anon USING (true);

-- daily_check_items: cada conductor ve/escribe sus propios registros
DROP POLICY IF EXISTS "Auth: leer daily_check_items"    ON daily_check_items;
DROP POLICY IF EXISTS "Auth: insertar daily_check_items" ON daily_check_items;
DROP POLICY IF EXISTS "Auth: actualizar daily_check_items" ON daily_check_items;
DROP POLICY IF EXISTS "Anon: todo daily_check_items"    ON daily_check_items;
CREATE POLICY "Auth: leer daily_check_items"
  ON daily_check_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth: insertar daily_check_items"
  ON daily_check_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth: actualizar daily_check_items"
  ON daily_check_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anon: todo daily_check_items"
  ON daily_check_items FOR ALL TO anon USING (true) WITH CHECK (true);
