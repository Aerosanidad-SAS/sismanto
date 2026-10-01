-- 096 · Preoperacional por tipo de vehículo: dos listas (ambulancia y automóvil). Idempotente, aditiva.
--
-- Decisión de Daniel (2026-09-30): hay dos checklists. AMBULANCIA (TAB y TAM, el formato G-TECN-F 002) y la de los
-- vehículos tipo automóvil o van (DOMI, VAN y ADMIN). Hasta ahora todos los vehículos respondían los mismos ítems.
--
--   · `checklist_items.tipos_vehiculo TEXT[]`: NULL = el ítem aplica a todos los tipos; con valores, solo a esos.
--   · Se marcan como exclusivos de ambulancia los ítems médicos, de sirena y comunicación, de carrocería de
--     ambulancia y el kit de rescate. El resto (frenos, luces estándar, fluidos, llantas, documentos, equipo de
--     carretera legal) aplica a todos.
--   · Un vehículo sin `tipo_vehiculo` (hoja de vida aún sin cargar) responde la lista completa de ambulancia.
-- La lista de DOMI/VAN/ADMIN es una propuesta derivada de G-TECN-F 002: Daniel debe validarla.

ALTER TABLE checklist_items ADD COLUMN IF NOT EXISTS tipos_vehiculo TEXT[];

COMMENT ON COLUMN checklist_items.tipos_vehiculo IS
  'NULL = aplica a todos los tipos de vehículo; si no, solo a los listados (AMBULANCIA_TAB, AMBULANCIA_TAM, VAN, ADMIN, DOMI).';

UPDATE checklist_items
   SET tipos_vehiculo = ARRAY['AMBULANCIA_TAB', 'AMBULANCIA_TAM']
 WHERE lista = 'PREOPERACIONAL'
   AND tipos_vehiculo IS NULL
   AND (
     categoria = 'EQUIPO_BASICO'
     OR lower(descripcion) IN (
       -- luces propias de ambulancia
       'luces laterales blancas', 'luces laterales rojas intermitentes', 'baliza principal', 'baliza trasera',
       'luces destrover', 'luces internas',
       -- cabina: sirena, comunicación y carrocería de ambulancia
       'altavoz', 'caja de control de tonos', 'radio portátil', 'radio base', 'persiana solar', 'sirena',
       'puertas carrocería en buen estado', 'puerta lateral (estado y cierre)', 'puerta trasera (estado y cierre)',
       'estribo de acceso con piso antideslizante',
       -- kit de rescate
       'cuerda estática', 'cuerda con gancho', 'tijera corta todo', 'cortafrío', 'bisturí', 'patecabra',
       'impermeables', 'guantes de trabajo'
     )
   );

-- Rollback:
-- ALTER TABLE checklist_items DROP COLUMN IF EXISTS tipos_vehiculo;
