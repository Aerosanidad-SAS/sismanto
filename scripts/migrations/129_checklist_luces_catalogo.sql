-- 129 · Catálogo del preoperacional: ajustes de luces pedidos por Daniel (2026-10-13). Idempotente, solo datos.
--
--   · «Luces Laterales Blancas»: son 4 (2 por lado), no 2.
--   · «Luces estacionarias»: se responden solo OK / Falla, sin cantidad.
--
-- `cantidad_esperada` 'OK' = ítem de estado (sin conteo); un número = ítem de conteo (ver src/lib/inventario-preop.ts).
-- Pendientes en otra migración cuando Daniel los confirme: cantidad de las luces laterales rojas y cuáles son las 5 luces internas.
-- Los preoperacionales ya enviados no cambian (guardan su propia cantidad_ok por fila).

UPDATE checklist_items
   SET cantidad_esperada = '4'
 WHERE categoria = 'LUCES' AND lower(descripcion) = lower('Luces Laterales Blancas')
   AND cantidad_esperada IS DISTINCT FROM '4';

UPDATE checklist_items
   SET cantidad_esperada = 'OK'
 WHERE categoria = 'LUCES' AND lower(descripcion) = lower('Luces estacionarias')
   AND cantidad_esperada IS DISTINCT FROM 'OK';

-- Rollback:
--   UPDATE checklist_items SET cantidad_esperada = '2' WHERE categoria = 'LUCES' AND lower(descripcion) IN (lower('Luces Laterales Blancas'), lower('Luces estacionarias'));
