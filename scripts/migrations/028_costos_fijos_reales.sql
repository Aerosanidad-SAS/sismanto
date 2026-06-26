-- Migration 028: Costos fijos reales y vencimientos por placa
-- Fuente: planilla AEROSANIDAD S.A.S. — mayo 2026
-- Columnas actualizadas:
--   costo_soat_anual            → valor COP anual del SOAT
--   costo_tecnomecanica_anual   → 330,000 COP (valor uniforme toda la flota)
--   costo_poliza_anual          → valor COP anual de la póliza de responsabilidad civil
--   vencimiento_soat            → fecha vencimiento SOAT
--   vencimiento_tecnicomecanica → fecha vencimiento RTM
-- LTN715 y LHV349: sin costo SOAT/Póliza disponible — solo fechas y RTM

UPDATE vehicles SET
  costo_soat_anual             = 818300,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 6557844,
  vencimiento_soat             = '2027-04-16',
  vencimiento_tecnicomecanica  = '2026-06-08'
WHERE placa = 'TRG549';

UPDATE vehicles SET
  costo_soat_anual             = 968800,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 3974852,
  vencimiento_soat             = '2027-01-25',
  vencimiento_tecnicomecanica  = '2026-08-28'
WHERE placa = 'EQR890';

UPDATE vehicles SET
  costo_soat_anual             = 487500,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 4130107,
  vencimiento_soat             = '2027-02-22',
  vencimiento_tecnicomecanica  = '2027-02-24'
WHERE placa = 'JRN202';

UPDATE vehicles SET
  costo_soat_anual             = 487500,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 4130107,
  vencimiento_soat             = '2026-02-25',
  vencimiento_tecnicomecanica  = '2026-07-30'
WHERE placa = 'JQS528';

UPDATE vehicles SET
  costo_soat_anual             = 487500,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 4130107,
  vencimiento_soat             = '2026-02-27',
  vencimiento_tecnicomecanica  = '2026-02-26'
WHERE placa = 'JQS239';

UPDATE vehicles SET
  costo_soat_anual             = 487500,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 4130107,
  vencimiento_soat             = '2027-03-06',
  vencimiento_tecnicomecanica  = '2027-02-24'
WHERE placa = 'JQS366';

UPDATE vehicles SET
  costo_tecnomecanica_anual    = 330000,
  vencimiento_soat             = '2026-11-28',
  vencimiento_tecnicomecanica  = '2027-11-30'
WHERE placa = 'LTN715';

UPDATE vehicles SET
  costo_soat_anual             = 818300,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 3795246,
  vencimiento_soat             = '2026-09-13',
  vencimiento_tecnicomecanica  = '2026-09-14'
WHERE placa = 'TRG540';

UPDATE vehicles SET
  costo_tecnomecanica_anual    = 330000,
  vencimiento_soat             = '2026-09-02',
  vencimiento_tecnicomecanica  = '2027-09-06'
WHERE placa = 'LHV349';

UPDATE vehicles SET
  costo_soat_anual             = 871900,
  costo_tecnomecanica_anual    = 330000,
  vencimiento_soat             = '2026-12-05',
  vencimiento_tecnicomecanica  = '2026-12-01'
WHERE placa = 'IEQ524';

UPDATE vehicles SET
  costo_soat_anual             = 871900,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 8844024,
  vencimiento_soat             = '2026-12-24',
  vencimiento_tecnicomecanica  = '2027-01-16'
WHERE placa = 'IEW789';

UPDATE vehicles SET
  costo_soat_anual             = 968800,
  costo_tecnomecanica_anual    = 330000,
  vencimiento_soat             = '2027-04-02',
  vencimiento_tecnicomecanica  = '2027-04-08'
WHERE placa = 'KQX040';

UPDATE vehicles SET
  costo_soat_anual             = 1109800,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 4468902,
  vencimiento_soat             = '2027-04-06',
  vencimiento_tecnicomecanica  = '2026-09-29'
WHERE placa = 'FCX141';

UPDATE vehicles SET
  costo_soat_anual             = 1222900,
  costo_tecnomecanica_anual    = 330000,
  vencimiento_soat             = '2027-04-18',
  vencimiento_tecnicomecanica  = '2027-04-15'
WHERE placa = 'HXL665';

UPDATE vehicles SET
  costo_soat_anual             = 646500,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 4562021,
  vencimiento_soat             = '2026-05-02',
  vencimiento_tecnicomecanica  = '2026-06-20'
WHERE placa = 'MVV483';

UPDATE vehicles SET
  costo_soat_anual             = 968800,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 4037778,
  vencimiento_soat             = '2026-07-10',
  vencimiento_tecnicomecanica  = '2026-10-15'
WHERE placa = 'HXY015';

UPDATE vehicles SET
  costo_soat_anual             = 1374300,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 11645391,
  vencimiento_soat             = '2026-07-27',
  vencimiento_tecnicomecanica  = '2026-11-27'
WHERE placa = 'MOW931';

UPDATE vehicles SET
  costo_soat_anual             = 1647600,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 5574644,
  vencimiento_soat             = '2026-07-27',
  vencimiento_tecnicomecanica  = '2026-06-04'
WHERE placa = 'OKL227';

UPDATE vehicles SET
  costo_soat_anual             = 968800,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 3557844,
  vencimiento_soat             = '2026-09-29',
  vencimiento_tecnicomecanica  = '2026-09-09'
WHERE placa = 'TRG544';

UPDATE vehicles SET
  costo_soat_anual             = 968800,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 3557844,
  vencimiento_soat             = '2026-10-11',
  vencimiento_tecnicomecanica  = '2025-10-09'
WHERE placa = 'TRG542';

UPDATE vehicles SET
  costo_soat_anual             = 871900,
  costo_tecnomecanica_anual    = 330000,
  costo_poliza_anual           = 6561699,
  vencimiento_soat             = '2026-11-23',
  vencimiento_tecnicomecanica  = '2026-09-11'
WHERE placa = 'DRU893';

-- Verificar después de aplicar:
-- SELECT placa, costo_soat_anual, costo_tecnomecanica_anual, costo_poliza_anual
-- FROM vehicles ORDER BY placa;
