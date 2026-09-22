-- Migración 061: catálogo de dotación e insumos que la tripulación verifica al
-- recibir la ambulancia (checklist_items.lista = 'DOTACION', ver 060).
--
-- cantidad_esperada: un número ('2') muestra "¿Cuántos están OK?" y marca FALLA
-- si faltan; 'OK' muestra OK / Falla / N/A. categoria agrupa en pantalla.
-- orden: 2000+ para no mezclarse con el preoperacional (≤ 1000).
--
-- Idempotente: ON CONFLICT sobre uq_checklist_item (categoria, descripcion).

INSERT INTO checklist_items (lista, categoria, descripcion, cantidad_esperada, orden) VALUES
  -- TODO(Daniel): lista real de dotación según el formato de Aerosanidad.
  -- Ejemplo de forma (no son datos validados):
  -- ('DOTACION', 'OXIGENO',       'Bala portátil con presión > 1000 psi', 'OK', 2010),
  -- ('DOTACION', 'VIA_AEREA',     'Bolsa-válvula-máscara adulto',         '1',  2110),
  -- ('DOTACION', 'MEDICAMENTOS',  'Solución salina 0.9 % 500 ml',         '4',  2310),
  ('DOTACION', 'OXIGENO', 'PENDIENTE: cargar catálogo de dotación', 'OK', 2000)
ON CONFLICT (categoria, descripcion) DO UPDATE
  SET lista = EXCLUDED.lista,
      cantidad_esperada = EXCLUDED.cantidad_esperada,
      orden = EXCLUDED.orden,
      activo = true;
