-- 130 · Catálogo del preoperacional: luces laterales rojas y luces internas (Daniel, 2026-10-13). Idempotente, solo datos.
--
--   · «Luces Laterales Rojas Intermitentes»: son 4 (2 por lado), no 2.
--   · «Luces Internas»: son 3 (luz de cabina, luces de habitáculo y luz fría), no 5. La lista se muestra al lado del ítem
--     (src/lib/checklist-detalle.ts).
--
-- Los preoperacionales ya enviados no cambian (guardan su propia cantidad_ok por fila).

UPDATE checklist_items
   SET cantidad_esperada = '4'
 WHERE categoria = 'LUCES' AND lower(descripcion) = lower('Luces Laterales Rojas Intermitentes')
   AND cantidad_esperada IS DISTINCT FROM '4';

UPDATE checklist_items
   SET cantidad_esperada = '3'
 WHERE categoria = 'LUCES' AND lower(descripcion) = lower('Luces Internas')
   AND cantidad_esperada IS DISTINCT FROM '3';

-- Rollback:
--   UPDATE checklist_items SET cantidad_esperada = '2' WHERE categoria = 'LUCES' AND lower(descripcion) = lower('Luces Laterales Rojas Intermitentes');
--   UPDATE checklist_items SET cantidad_esperada = '5' WHERE categoria = 'LUCES' AND lower(descripcion) = lower('Luces Internas');
