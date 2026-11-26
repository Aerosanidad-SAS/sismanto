-- ============================================================
-- Migración 140: «Destornillador grande/pequeño» pasan a decir «de pala»
--
-- En el preoperacional había cuatro destornilladores: estrella grande, estrella pequeño y otros dos sin tipo
-- («Destornillador grande», «Destornillador pequeño»), que son de pala. Se nombran como los de estrella para que el
-- OVEM no dude. Es el mismo ítem (mismo id): el historial de respuestas se conserva.
-- Idempotente: solo renombra si el nombre viejo existe y el nuevo no.
-- ============================================================

UPDATE checklist_items ci
SET descripcion = 'Destornillador de pala grande'
WHERE ci.categoria = 'EQUIPO_CARRETERA'
  AND ci.descripcion = 'Destornillador grande'
  AND NOT EXISTS (SELECT 1 FROM checklist_items x WHERE x.categoria = ci.categoria AND x.descripcion = 'Destornillador de pala grande');

UPDATE checklist_items ci
SET descripcion = 'Destornillador de pala pequeño'
WHERE ci.categoria = 'EQUIPO_CARRETERA'
  AND ci.descripcion = 'Destornillador pequeño'
  AND NOT EXISTS (SELECT 1 FROM checklist_items x WHERE x.categoria = ci.categoria AND x.descripcion = 'Destornillador de pala pequeño');
