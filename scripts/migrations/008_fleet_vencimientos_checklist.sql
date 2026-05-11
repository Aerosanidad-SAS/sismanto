-- ============================================================
-- Migración 008: Vencimientos SOAT/RTM desde tabla operative,
-- FDS marcados, perfiles vehículos eléctricos, checklist OVEM.
-- Ejecutar en SQL Editor Supabase después de revisar placas.
-- ============================================================

UPDATE vehicles v SET
  vencimiento_soat = d.soat::date,
  vencimiento_tecnicomecanica = NULLIF(trim(d.tm), '')::date
FROM (VALUES
  ('TRG549', '2027-04-16', '2026-06-08'),
  ('EQR890', '2027-01-25', '2026-08-28'),
  ('JRN202', '2027-02-22', '2027-02-24'),
  ('JQS528', '2026-02-25', '2026-07-30'),
  ('JQS239', '2026-02-27', '2026-02-26'),
  ('JQS366', '2027-03-06', '2027-02-24'),
  ('LTN715', '2026-11-28', '2027-11-30'),
  ('TRG540', '2026-09-13', '2026-09-14'),
  ('LHV349', '2026-09-02', '2027-09-06'),
  ('IEQ524', '2026-12-05', '2026-12-01'),
  ('IEW789', '2026-12-24', '2027-01-16'),
  ('KQX040', '2027-04-02', '2027-04-08'),
  ('FCX141', '2027-04-06', '2026-09-29'),
  ('HXL665', '2027-04-18', '2027-04-15'),
  ('MVV483', '2026-05-02', '2026-06-20'),
  ('HXY015', '2026-07-10', '2026-10-15'),
  ('MOW931', '2026-07-27', '2026-11-27'),
  ('OKL227', '2026-07-27', '2026-06-04'),
  ('TRG544', '2026-09-29', '2026-09-09'),
  ('TRG542', '2026-10-11', '2025-10-09'),
  ('DRU893', '2026-11-23', '2026-09-11'),
  ('JZO514', '2026-05-27', '2026-06-01'),
  ('LSN367', '2026-05-26', '2028-01-12'),
  ('OSK397', '2026-11-23', '2026-09-18'),
  ('OSK398', '2027-01-06', '2027-01-06'),
  ('OSK399', '2026-11-23', '2026-09-18'),
  ('LTP476', '2027-02-23', '2028-02-28'),
  ('IVK968', '2026-09-05', '2026-12-01'),
  ('LQW155', '2026-11-21', ''),
  ('OJG594', '2026-07-24', '2026-06-05'),
  ('MOU057', '2026-07-23', '2027-03-19'),
  ('OMH169', '2026-07-23', '2026-10-29'),
  ('OIL657', '2026-07-23', '2026-07-04'),
  ('OJG629', '2026-07-24', '2026-06-12'),
  ('OBE862', '2026-07-24', '2026-08-14')
) AS d(placa, soat, tm)
WHERE upper(trim(v.placa)) = d.placa;

UPDATE vehicles v SET vencimiento_rtm = v.vencimiento_tecnicomecanica
FROM (VALUES
  ('TRG549'), ('EQR890'), ('JRN202'), ('JQS528'), ('JQS239'), ('JQS366'), ('LTN715'), ('TRG540'),
  ('LHV349'), ('IEQ524'), ('IEW789'), ('KQX040'), ('FCX141'), ('HXL665'), ('MVV483'), ('HXY015'),
  ('MOW931'), ('OKL227'), ('TRG544'), ('TRG542'), ('DRU893'), ('JZO514'), ('LSN367'), ('OSK397'),
  ('OSK398'), ('OSK399'), ('LTP476'), ('IVK968'), ('LQW155'), ('OJG594'), ('MOU057'), ('OMH169'),
  ('OIL657'), ('OJG629'), ('OBE862')
) AS d(placa)
WHERE upper(trim(v.placa)) = d.placa
  AND v.vencimiento_tecnicomecanica IS NOT NULL;

UPDATE vehicles SET estado_actual = 'FUERA_DE_SERVICIO', updated_at = NOW()
WHERE upper(trim(placa)) IN ('OSK398', 'OSK399', 'JQS239', 'JQS528', 'TRG542');

UPDATE vehicles SET
  marca = 'Changan',
  linea = 'E-Star',
  modelo = '2021',
  tipo_combustible = 'ELECTRICO',
  combustible = 'Eléctrico',
  updated_at = NOW()
WHERE upper(trim(placa)) IN ('JQS366', 'JRN202', 'JQS239', 'JQS528');

UPDATE checklist_items SET activo = false WHERE descripcion IN (
  'Sticker Visible',
  'Documentos (SOAT - Tecnicomecánica)',
  'Luces Destrover',
  'Radio Portátil',
  'Indicadores (hidráulico - voltímetro)',
  'Motor (refrigerante - odómetro - aire)',
  'Destornillador Estrella',
  'Destornillador de pala'
);

UPDATE checklist_items SET descripcion = 'Freno de pedal' WHERE descripcion = 'Freno de servicio';

INSERT INTO checklist_items (categoria, descripcion, cantidad_esperada, orden) VALUES
  ('GENERAL', 'Documento SOAT vigente', 'OK', 18),
  ('GENERAL', 'Documento técnico-mecánica vigente', 'OK', 22),
  ('CABINA', 'Nivel aceite de motor', 'OK', 475),
  ('CABINA', 'Nivel refrigerante radiador', 'OK', 476),
  ('CABINA', 'Refrigerante (estado/nivel)', 'OK', 477),
  ('CABINA', 'Nivel líquido hidráulico', 'OK', 478),
  ('CABINA', 'Nivel líquido de frenos', 'OK', 479),
  ('CABINA', 'Voltímetro / indicadores eléctricos', 'OK', 481),
  ('CABINA', 'Odómetro / KM visible', 'OK', 482),
  ('CABINA', 'Aire acondicionado / HVAC cabina', 'OK', 483),
  ('CABINA', 'Presión llantas (no desinfladas)', 'OK', 484),
  ('CABINA', 'Grabado en llantas', 'OK', 485),
  ('EQUIPO_CARRETERA', 'Destornillador estrella grande', '1', 1048),
  ('EQUIPO_CARRETERA', 'Destornillador estrella pequeño', '1', 1049),
  ('EQUIPO_CARRETERA', 'Destornillador grande', '1', 1055),
  ('EQUIPO_CARRETERA', 'Destornillador pequeño', '1', 1056)
ON CONFLICT (categoria, descripcion) DO NOTHING;
