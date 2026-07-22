-- ============================================================
-- Migración 049: cierre manual de novedades/incidentes
--
-- Hasta ahora una novedad solo se cerraba automáticamente al
-- registrar un mantenimiento que la liga (crearMantenimiento). No
-- había forma de cerrar una que no requiere mantenimiento (ej. una
-- falla menor resuelta sin orden de trabajo). Pedido de Daniel,
-- 2026-07-22: agrega los campos para dejar constancia de por qué se
-- cerró cuando no hay mantenimiento de por medio.
-- ============================================================

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS nota_cierre TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS cerrado_por UUID REFERENCES auth.users(id);
