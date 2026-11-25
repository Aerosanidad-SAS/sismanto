-- 142 · Orden del preoperacional según el flujo real del conductor: frío → motor calentando → herramientas → niveles en caliente.
-- Idempotente. Solo reasigna grupo y orden (no borra ni renombra nada) y agrega 3 ítems de re-verificación.
--
-- Por qué (Daniel, 2026-11-24): hoy la lista mezcla luces, cabina, fluidos y herramientas sin relación con lo que el conductor hace
-- caminando alrededor del vehículo. El orden propuesto aprovecha que el motor necesita 2–3 minutos para calentar:
--   1 · Niveles y fugas con el motor FRÍO (aceite, refrigerante, hidráulico, frenos, correas, mangueras, batería).
--   2 · Se enciende el motor y MIENTRAS CALIENTA: luces, cabina, frenos, sistemas, llantas y habitáculo del paciente.
--   3 · Herramientas y equipo (inventario).
--   4 · Niveles de nuevo con el motor CALIENTE (aceite, refrigerante, hidráulico): copias de los ítems de la etapa 1.
-- Es una propuesta para validar con un técnico de mantenimiento: todo se puede ajustar luego desde Configuración → Preoperacional.
-- Lo que no está en la lista de abajo conserva su grupo por categoría: LUCES/CABINA/GENERAL → etapa 2, EQUIPO_* → etapa 3.

INSERT INTO checklist_groups (nombre, orden) VALUES
  ('1 · Niveles y fugas (motor frío)', 1),
  ('2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 2),
  ('3 · Herramientas y equipo', 3),
  ('4 · Niveles de nuevo (motor caliente)', 4)
ON CONFLICT (nombre) DO NOTHING;

-- Re-verificación en caliente: mismas propiedades (severidad, tipos de vehículo, cantidad) que el ítem en frío.
INSERT INTO checklist_items (categoria, descripcion, cantidad_esperada, orden, activo, lista, tipos_vehiculo, severidad_falla)
SELECT ci.categoria, ci.descripcion || ' (motor caliente)', ci.cantidad_esperada, 0, true, ci.lista, ci.tipos_vehiculo, ci.severidad_falla
  FROM checklist_items ci
 WHERE ci.lista = 'PREOPERACIONAL'
   AND ci.descripcion IN ('Nivel aceite de motor', 'Nivel refrigerante radiador', 'Nivel líquido hidráulico')
ON CONFLICT (categoria, descripcion) DO NOTHING;

WITH mapa(descripcion, grupo, pos) AS (
  VALUES
    ('Fuga de líquidos en el piso (aceite, refrigerante, combustible, frenos)', '1 · Niveles y fugas (motor frío)', 1),
    ('Nivel aceite de motor', '1 · Niveles y fugas (motor frío)', 2),
    ('Nivel refrigerante radiador', '1 · Niveles y fugas (motor frío)', 3),
    ('Refrigerante (estado/nivel)', '1 · Niveles y fugas (motor frío)', 4),
    ('Nivel líquido hidráulico', '1 · Niveles y fugas (motor frío)', 5),
    ('Nivel líquido de frenos', '1 · Niveles y fugas (motor frío)', 6),
    ('Control de fugas hidráulicas', '1 · Niveles y fugas (motor frío)', 7),
    ('Estado de correas', '1 · Niveles y fugas (motor frío)', 8),
    ('Mangueras', '1 · Niveles y fugas (motor frío)', 9),
    ('Radiador', '1 · Niveles y fugas (motor frío)', 10),
    ('Batería', '1 · Niveles y fugas (motor frío)', 11),

    ('Voltímetro / indicadores eléctricos', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 1),
    ('Odómetro / KM visible', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 2),
    ('Luces principales altas y bajas', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 3),
    ('Direccionales delanteras de parqueo (Giro)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 4),
    ('Direccionales traseras de parqueo (Giro)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 5),
    ('Luces Laterales Blancas', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 6),
    ('Luces Laterales Rojas Intermitentes', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 7),
    ('Exploradora Trasera', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 8),
    ('Exploradoras Delanteras', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 9),
    ('Baliza principal', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 10),
    ('Baliza Trasera', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 11),
    ('Luces Internas', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 12),
    ('Luces estacionarias', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 13),
    ('Sirena', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 14),
    ('Pito', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 15),
    ('Altavoz', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 16),
    ('Caja de Control de Tonos', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 17),
    ('Aire acondicionado / HVAC cabina', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 18),
    ('Freno de pedal', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 19),
    ('Freno de emergencia', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 20),
    ('Dirección/suspensión (Terminales)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 21),
    ('Caja de cambios en buen estado', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 22),
    ('Limpiaparabrisas (Plumillas)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 23),
    ('Vidrio frontal (en buen estado)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 24),
    ('Espejo central', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 25),
    ('Espejos laterales', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 26),
    ('Persiana Solar', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 27),
    ('Cinturón de seguridad', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 28),
    ('Asiento en buena condición', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 29),
    ('Puertas cabina en buen estado', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 30),
    ('Botiquín', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 31),
    ('Presión llantas (no desinfladas)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 32),
    ('Grabado en llantas', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 33),
    ('Llantas sin fisuras profundas y sin abultamientos', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 34),
    ('Puertas carrocería en buen estado', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 35),
    ('Puerta Lateral (estado y cierre)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 36),
    ('Puerta Trasera (estado y cierre)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 37),
    ('Estribo de Acceso con Piso Antideslizante', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 38),
    ('Caja De Fusibles', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 39),
    ('Tablero y Caja del Sistema Eléctrico', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 40),
    ('Caja de Control de Luces Externas', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 41),
    ('Tomas de 110 Voltios', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 42),
    ('Aire Acondicionado', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 43),
    ('Extractor', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 44),
    ('Balas Centrales de Oxígeno', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 45),
    ('Bala de Oxígeno Portátil', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 46),
    ('Silla Cabecera de Paciente con Cinturón de 3 Puntos', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 47),
    ('Gabetas para Insumos (Quirúr. Circul. Respir. Pediát.)', '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)', 48),

    ('Nivel aceite de motor (motor caliente)', '4 · Niveles de nuevo (motor caliente)', 1),
    ('Nivel refrigerante radiador (motor caliente)', '4 · Niveles de nuevo (motor caliente)', 2),
    ('Nivel líquido hidráulico (motor caliente)', '4 · Niveles de nuevo (motor caliente)', 3)
)
UPDATE checklist_items ci
   SET group_id = g.id,
       orden = g.orden * 1000 + m.pos
  FROM mapa m
  JOIN checklist_groups g ON g.nombre = m.grupo
 WHERE ci.lista = 'PREOPERACIONAL'
   AND ci.descripcion = m.descripcion;

-- Lo no listado conserva su lugar relativo dentro de la etapa que le corresponde por categoría (después de lo listado).
UPDATE checklist_items ci
   SET group_id = g.id,
       orden = g.orden * 1000 + 500 + ci.orden
  FROM checklist_groups g
 WHERE ci.lista = 'PREOPERACIONAL'
   AND (ci.group_id IS NULL OR ci.group_id NOT IN (SELECT id FROM checklist_groups WHERE nombre IN (
         '1 · Niveles y fugas (motor frío)',
         '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)',
         '3 · Herramientas y equipo',
         '4 · Niveles de nuevo (motor caliente)')))
   AND g.nombre = CASE
                    WHEN ci.categoria IN ('EQUIPO_BASICO', 'EQUIPO_CARRETERA') THEN '3 · Herramientas y equipo'
                    ELSE '2 · Enciende el motor: luces, sistemas y llantas (calienta 2–3 min)'
                  END;
