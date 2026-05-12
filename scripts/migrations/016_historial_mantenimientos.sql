-- Migration 016: Import historial mantenimientos (CONTROL_VEH_INTERASSIST V2 2026)
-- Negative valores set to NULL (devolution/refund records); km=0 when no fuel match.

INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-01', 0, 'CORRECTIVO', 'Bomba Inyeccion principal', NULL, NULL, NULL, 3144, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-01', 0, 'CORRECTIVO', 'Reparacion reconstruccion de motor', 'Mauricio Velez', 17000000, NULL, 3144, NULL
FROM vehicles WHERE placa = 'OSK398';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 151867, 'CORRECTIVO', 'MANO DE OBRA REVISION Y CAMBIO PARTES', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 300000, 'FV 3988', 2784, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-11-01', 0, 'CORRECTIVO', 'Bomba Inyeccion principal', NULL, NULL, NULL, 1440, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-09', 384742, 'CORRECTIVO', 'Choque', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-31', 286988, 'CORRECTIVO', 'Reparacion de motor', 'Mauricio Velez', 6612000, '222', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-30', 0, 'CORRECTIVO', 'Reparacion choque moto, Farola Izquierda, Persiana, Bomper Delantero, Latoneria y Pintura, Armado y Reparar Plasticos, Broches sujetador', 'Mauricio Velez', 4599500, '241', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-29', 34250, 'CORRECTIVO', 'Reparacion choque Jorge', 'Dario Pinturas', 1300000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-02', 51836, 'CORRECTIVO', 'Farola Izquierda, Farola Derecha	, Bomper Delantero, Capo, Persiana, Frontal, Emblema, Tapa Deposito Liquido de Frenos, Exploradoras, Plumillas Parabrisas	, Tapa Radiador Original	, Conector , alvula Turbo	, Manguera Vacio 1/8, Bateria, Grapa Sujeción Persiana, Bombillo 2 Filamentos	,Bombillo 1 Filamento, Bombillo Tablero Gotera, Bombillo H4, Soporte Goma , ntercooler, Aceite Hidraulico, Filtro de Combustible, Filtro de Aire	, Filtro de Aceite	, Tornilleria Varios, Termostato	, Correa Dirección Hidrulica, Correa Accesorios	, Buje Caucho , adiador	, Filtro Combustible, Limpiador Cuerpo Mariposa, Refrigerante, Aceite de Motor, Intercooler, Guia Bomper Delantero Derecha, Guia Bomper Delantero Izquierda ,Guia  ,omper Farola ,Portaplaca, Soporte Base Intercooler Derecho ,Soporte Base Intercooler Izquierdo, Soporte Central Bomper	 ,Aceite Caja 80W90 ,Bocel Inferior Paragolpes , ,Empaque Delantero Capo ,Reparar y Sondear Radiador Refrigerante ,Guardapolvo Plastico Derecho, Condensador ,Carga Aire Acondicionado, Limpieza Motor ,Banco Chasis ,Electricidad, Latoneria ,Mecanica ,Pintura', 'Mauricio Velez', 19865400, '234', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2021-08-21', 55700, 'PREVENTIVO', 'Aceite 20W50, filtro aceite LAR-65, Filtro de aire', 'Marllantas', 131929, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-26', 189326, 'CORRECTIVO', 'Eje de levas', 'Mauricio Velez', 550000, '247', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-14', 232210, 'CORRECTIVO', 'Empaque de Culata, Fusible Térmico, Termostato, Sondear Radiador, Anillos Retorno, Spray Copper para , empaque de Culata, Rosca Helicoil 8 mm, Mano de Obra D/M Culata y Revisar Recalentamiento', 'Mauricio Velez', 1361000, '228', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-16', 377878, 'CORRECTIVO', 'Bomba de Agua, Correa Aire Acondicionado,  Correa Alternador,', 'Mauricio Velez', 407000, '224', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-05', 231637, 'CORRECTIVO', 'Guardapolvo de Eje Lado Rueda, Bomba Hidraulica, M/O Desmontar y Montar Deposito Combustible para Cambio, Guardapolvo de Eje Lado , caja, Empaque Medidor Combustible0, Aceite Hidraulico, Correa Acanalada, Medidor, Cambio Bomba Hidraulica, Cambio Guardapolvos,  Eje Delantero y Revisión General', 'Mauricio Velez', 1368800, '216', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 550420, '47638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 232939, 'PREVENTIVO', 'Cambio de aceite y filtros', 'Marllantas', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-14', 232812, 'CORRECTIVO', 'Reparar Guaya de Cambios, Rosca Helicoi Caja Cambios, Mano de Obra D/M Caja de Cambios para Cambiar Embrague, D/M Frontal con Radiadores y Reparar Plasticos', 'Mauricio Velez', 1191500, '223', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-04', 380522, 'CORRECTIVO', 'Balancin Suspensión, Buje Balancin, Buje Carreta Amortiguador, Modulo 4X4, Tijeras Suspensión, Mano de Obra Revisar y Reparar Suspensión', 'Mauricio Velez', 1708000, '240', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-08', 146327, 'CORRECTIVO', 'Se revento una guaya de la caja de cambios, el vehiculo fue reparado y retorna a operación', 'Mauricio Velez', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 381587, 'CORRECTIVO', 'Cambio de ballestas de amortiguacio', 'Mauricio Velez', 850000, '243', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-01', 232939, 'CORRECTIVO', 'Resistencia Ventilador Acondicionado, Filtro Aire Acondicionado, Carga Aire Acondicionado, Revisión y , enderezar Condensador, M/O Desmontar y Montar Bomper y Radiadores', 'Mauricio Velez', 494000, '235', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 98066, 'CORRECTIVO', 'Rodamiento Conico 32008, Rodamiento Conico 32009, Grasa Rodamiento, Sensor Rueda ABS Delantero, Retenedor Bocin, Mano de Obra', 'JOHN MAURICIO VÉLEZ MORALES', 832000, '236', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-10', 196888, 'CORRECTIVO', 'CHAPA', 'Marllantas', 470588, '53150', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-08-18', 50105, 'PREVENTIVO', 'Cambio de aceite, filtros, rotacion, alineacion y balanceo, alineacion de luces, liquido de frenos', 'Marllantas', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 163127, 'CORRECTIVO', 'Mano de Obra Cambio Kit de Embrague', 'JOHN MAURICIO VÉLEZ MORALES', 490000, '384', 16, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 93636, 'CORRECTIVO', 'Balinera derecha', 'JOHN MAURICIO VÉLEZ MORALES', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'RODAMIENTO RUEDA DELANTERA DERECHA', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 280000, 'FV 3994', 10, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-15', 293437, 'CORRECTIVO', 'REVISION SERVICIO DE SCANER Y MANTENIMIENTO ACONECTOR DE SENSOR DE PEDAL', 'Ingenco', 142800, 'IE 5111', 10, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-19', 0, 'CORRECTIVO', 'CARGA A/C Y ACIETE REVELADOR DE FUGAS', 'Remarire', 160000, '26641', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-26', 118859, 'CORRECTIVO', 'Valvula expansion, sistema electrico trasero, relay, siche elevavidrios, carga AC, Aceite compresor', 'Sonoaires', 645000, '280', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A
GRANEL(GRAVADO)', 'Marllantas', 282352, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-09', 290726, 'CORRECTIVO', 'Rodamiento polea, correa alternador, MO', 'Mauricio Velez', 444000, '256', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-21', 287175, 'CORRECTIVO', '245 75R16 111T EVOLUTION ATT COOPER,', 'Marllantas', 1058822, '46099', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 150420, '46581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-27', 190192, 'CORRECTIVO', 'Empaque valvula EGR Mofle, Manguera desfogue desmontaje y montaje multiple de escape', 'Mauricio Velez', 149000, '255', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 60145, 'CORRECTIVO', 'Reparacion electrica balizas y luces', 'Ingenco', 124800, NULL, NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-20', 60145, 'CORRECTIVO', 'Reparacion alternador, reparacion modulo 4x4, relay, regulador', 'Ingenco', 475000, '5012', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-20', 60145, 'CORRECTIVO', 'reparacion modulo 4x4', 'Ingenco', 475000, '5012', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 164821, 'CORRECTIVO', 'Reparacion de chapa', 'Centro Chapas', 150000, '887', 5.25, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'Cambio de aceite, filtro de aceite, filtro de aire, filtro de combustible', 'Marllantas', 476469, NULL, NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-17', 290013, 'CORRECTIVO', 'Hoja ppla muelle trasero, buje metalico, pasador, buje caucho balancin, carga AC MO', 'Mauricio Velez', 760000, '253', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-07', 299299, 'CORRECTIVO', 'Organiza berliza trasera, ensamble y cambios de led', 'Jorge Iván Trujillo Cárdenas', 90000, '907', 5, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 178275, 'PREVENTIVO', 'Juego de Escobillas', 'JOHN MAURICIO VÉLEZ MORALES', 25000, '382', 5, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 127451, 'PREVENTIVO', 'Aceite Motor 15W40', 'JOHN MAURICIO VÉLEZ MORALES', 328000, '383', 5, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 60145, 'CORRECTIVO', 'Revision pito y sirena, termianl hembra, disyuntor elevador luces', 'Ingenco', 104900, '5005', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'Relays 12v dmax', 'Jorge Iván Trujillo Cárdenas', 70000, '921', 4, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-12-17', 207146, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 315000, '32208', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-04-21', 214900, 'CORRECTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 120168, '36386', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-16', 188714, 'PREVENTIVO', 'REVISION Y LIMPIEZA DE FRENOS', 'Marllantas', 433756, '40049', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-22', 11484, 'PREVENTIVO', 'Aceite Rubia TIE 7400 15W40, Filtro aceite, Filtro de Aire', 'Marllantas', 415125, '45161', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-24', 0, 'CORRECTIVO', 'Vehiuclo presentaba calentamiento, se identifica una fuga en la parte trasera de la distribucion', 'Mauricio Velez', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-19', 85195, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  D-MAX RT50', 'Marllantas', 51261, '46011', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-01', 232939, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 52941, '47311', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'CORRECTIVO', 'CONJUNTO DE CLUTCH KIA', 'Marllantas', 460504, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO LIFE 5W30 A', 'Marllantas', 453780, '48057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-14', 100100, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 40337, '48527', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 317646, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-09', 333069, 'CORRECTIVO', 'Amortiguadores traseros, soporte motor, tope suspension, ajuste aceite, MO', 'Mauricio Velez', 871000, '257', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-26', 17500, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 438651, '46263', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 122324, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 90756, '46852', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  D-MAX RT50', 'Marllantas', 51261, '47604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'PREVENTIVO', 'Cambio de aceite INEO LIFE 5W30, filtro de aceite, filtro de aire, stop', 'Marllantas', 200840, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-25', 232939, 'CORRECTIVO', 'Reparacion vidrio/elevavidrios lado copiloto cabina', NULL, 0, NULL, NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 0, 'CORRECTIVO', 'Reparacion sirena y caja de tonos', NULL, 250000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 282352, '48229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-13', 384742, 'PREVENTIVO', 'Revision transmision trasera, silico, aceite caja, retenedor transmision', 'Mauricio Velez', 534000, '252', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-19', 58000, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 453780, '53380', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 328214, 'PREVENTIVO', 'Cambio de aceite, filtro de aceite, filtro de aire', 'Marllantas', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-09-14', 202144, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 22689, '29096', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-13', 114759, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 170587, '44902', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-06', 234247, 'CORRECTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas', 89916, '46520', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 378208, 'CORRECTIVO', 'Reparacion bornes, cables, terminales, guayas', 'Electricos GENIO', 674000, '7136', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-23', 378804, 'CORRECTIVO', 'correccion de conexiones electricas sistema de aire acondicionado', 'BATERY REPUESTOS', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-22', 38120, 'PREVENTIVO', 'Aceite 5W30, filtro de aceite, filtro de aire, Filtro de combustible 1 y filtro de combustible 2', 'Marllantas', 699999, '49733', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-12', 238790, 'PREVENTIVO', 'Cambio de aceite, filtro de aceite, filtro de aire, aceite de caja y transmision BIEN', 'Marllantas', 349579, '51265', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-19', 240334, 'CORRECTIVO', 'Bombillo stop, trompo frenos, mo', 'Marllantas', 98992, '52428', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-21', 240334, 'PREVENTIVO', 'Revision y reparacion modulo de luces (tarjeta)', 'Ingenco', 80000, '5015', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 264474, 'CORRECTIVO', 'Rollo cinta', 'Jorge Iván Trujillo Cárdenas', 5000, '900', 1, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-08-01', 198165, 'PREVENTIVO', 'ALINEACION DIREC - CAMIÓN', 'Marllantas', 52101, '27680', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-10-15', 205300, 'PREVENTIVO', 'ALINEACION DIREC - CAMIÓN', 'Marllantas', 67227, '30152', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-01', 125000, 'CORRECTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 10, '52827', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 232939, 'PREVENTIVO', 'Cambio de bateria auxilair', 'Marllantas', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 10, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 11345, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'CORRECTIVO', '205 75R16 8PR FRUN-FIVE FULLRUN, LLANTA', 'Marllantas', 453781, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'CORRECTIVO', 'VALVULAS TB', 'Marllantas', 2101, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 52100, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'PREVENTIVO', 'PASTA DE FRENOS DEL  RENAULT', 'Marllantas', 210084, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 110084, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-10', 196888, 'CORRECTIVO', 'REPARACIONES VARIAS', 'Marllantas', 65126, '23057', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-09-14', 202144, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 40336, '29096', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-09-14', 202144, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 20, '29096', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-10-15', 205300, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 35000, '30152', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-12-17', 207146, 'PREVENTIVO', 'FILTRO DE ACEITE CARTUCHO ORIG  MASTER', 'Marllantas', 42017, '32208', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-12-17', 207146, 'PREVENTIVO', 'FILTRO DE AIRE ORIG  MASTER', 'Marllantas', 115126, '32208', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-12-17', 207146, 'CORRECTIVO', 'ARANDELA DE TAPON CARTER', 'Marllantas', 1008, '32208', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-12-17', 207146, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ORIG  MASTER', 'Marllantas', 90336, '32209', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-04-21', 214900, 'PREVENTIVO', 'PASTA DE FRENO DEL  RENAULT MASTER', 'Marllantas', 310084, '36386', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-04-21', 214900, 'PREVENTIVO', 'REPARACION DISCO DE FRENO', 'Marllantas', 40336, '36386', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-04-21', 214900, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '36386', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-11', 222027, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 317646, '38882', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-11', 222027, 'PREVENTIVO', 'FILTRO DE AIRE ORIG  MASTER', 'Marllantas', 116807, '38882', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-11', 222027, 'PREVENTIVO', 'FILTRO DE ACEITE CARTUCHO ORIG  MASTER', 'Marllantas', 42017, '38882', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-11', 222027, 'CORRECTIVO', 'ARANDELA DE TAPON CARTER', 'Marllantas', 1261, '38882', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-11', 222027, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ORIG  MASTER', 'Marllantas', 85294, '38882', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-03', 213189, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 70588, '39651', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-03', 213189, 'PREVENTIVO', 'PASTA DE FRENO TRAS  RENAULT NEW', 'Marllantas', 280672, '39651', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-03', 213189, 'CORRECTIVO', 'ABRAZADERA  PLASTICA', 'Marllantas', 1680, '39651', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-03', 213189, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 22689, '39651', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-16', 188714, 'PREVENTIVO', 'ALINEACION DIREC. - RUEDAS DELANT balanceo, rotacion', 'Marllantas', 85725, '40049', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-16', 188714, 'PREVENTIVO', 'Aceite hidraulico y refrigerante', 'Marllantas', 40000, '40049', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-26', 188714, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', NULL, 40000, '40049', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-19', 1200, 'CORRECTIVO', 'ROTACION AUTO-CAMIONETA', 'AEROSANIDAD S.A.S. Y/O JUAN CARLOS LOPEZ', 10, '41052', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-19', 1200, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'AEROSANIDAD S.A.S. Y/O JUAN CARLOS LOPEZ', 50, '41052', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-10-07', 188800, 'CORRECTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', NULL, 130000, '41617', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-10-07', 188800, 'CORRECTIVO', 'ADICION DE ACEITE HIDRAULICO (NO GRAVADO)', NULL, 13000, '41617', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-10-07', 188800, 'CORRECTIVO', 'TUBO DE CALEFACCION', NULL, 200000, '41617', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-10-07', 188800, 'CORRECTIVO', 'LIQUIDO DE REFRIGERANTE POTRO CORRIENTE GALON', NULL, 90756, '41617', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-10-13', 227111, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 35294, '41853', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 228639, 'PREVENTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 80000, '42404', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 228639, 'PREVENTIVO', 'MANGUERA DE CALEFACCION', 'Marllantas', 75630, '42404', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 228639, 'PREVENTIVO', 'ABRAZADERA   METALICA', 'Marllantas', 2101, '42404', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 228639, 'PREVENTIVO', 'LIQUIDO DE REFRIGERANTE POTRO', 'Marllantas', 30252, '42404', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 228639, 'PREVENTIVO', 'FILTRO DE ACEITE CARTUCHO ORIG  MASTER', 'Marllantas', 48739, '42404', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 228639, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 158823, '42404', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 228639, 'PREVENTIVO', 'LIQUIDO DE REFRIGERANTE POTRO', 'Marllantas', 9244, '42404', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-20', 231200, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 60000, '42948', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 389912, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  D-MAX RT50', 'Marllantas', 50420, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 36134, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'FILTRO DE AIRE D-MAX RT50', 'Marllantas', 48739, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 15126, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 130252, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'BANDAS DE FRENO', 'Marllantas', 100840, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-02', 74341, 'PREVENTIVO', 'REPARACION  CAMPANA DE FRENO', 'Marllantas', 40336, '44485', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-13', 114759, 'PREVENTIVO', 'FILTRO DE AIRE KIA PICANTO', 'Marllantas', 20168, '44902', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-13', 114759, 'PREVENTIVO', 'Aceite 5W30, filtro de aceite, filtro de aire', 'Marllantas', 213444, '44902', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 50420, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN 3000CC / CABSTAR 400', 'Marllantas', 88235, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 33613, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 40336, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER - URVAN', 'Marllantas', 25210, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-22', 11484, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', NULL, '45161', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-22', 11484, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  NISSAN - RENAULT', 'Marllantas', 57143, '45161', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-22', 11484, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 40336, '45161', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-01', 116787, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 30252, '45481', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-01', 116787, 'CORRECTIVO', 'BOMBILLO PARA STOP', 'Marllantas', 2521, '45481', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-02', 378208, 'PREVENTIVO', 'MO frenos, tension y limpieza', 'Marllantas', 60000, '44486', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-05', 232939, 'CORRECTIVO', 'DOMICILIO MOTO DE 0 A 10 KMS', 'IMPORTADORA NIPON S.A.', 3500, '35448', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-13', 0, 'CORRECTIVO', 'Rectificadora: Pulido cilindros, bancada, cigüeñal, rect valvulas, rect asientos, calibracion de guias, asentar y armar culata, calibrar culata pro cilindro, lavar motor, tapones', 'Recticol', 2751000, '92524', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-13', 286988, 'CORRECTIVO', 'Cambio de aceite y filtros', 'Mauricio Velez', 411000, '222', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-16', 377878, 'CORRECTIVO', 'Guardapolvo Eje Interior, Caucho Barra Estabilizadora, Rotula Superior D-Max,  Rotula Inferior Tijera', 'Mauricio Velez', 968000, '224', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-16', 377878, 'CORRECTIVO', 'Filtro de Aire, Filtro de Aceite, Filtro de Combustible, Aceite  5W40,  Refrigerante', 'Mauricio Velez', 411000, '224', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-19', 85195, 'PREVENTIVO', 'FILTRO DE AIRE D-MAX RT50', 'Marllantas', 50420, '46011', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-19', 85195, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 90756, '46011', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-19', 85195, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 36134, '46011', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-19', 85195, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '46011', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-26', 17500, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  NISSAN - RENAULT', 'Marllantas', 65546, '46263', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-26', 17500, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 40336, '46263', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-26', 17500, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA', 'Marllantas', 42017, '46263', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-26', 17500, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 63866, '46263', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-26', 17500, 'PREVENTIVO', 'LIQUIDO DE REFRIGERANTE POTRO', 'Marllantas', 27731, '46263', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-06', 234247, 'CORRECTIVO', 'RODILLO DEL  RENAULT', 'Marllantas', 320168, '46520', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-06', 234247, 'CORRECTIVO', 'REPARACIONES VARIAS', 'Marllantas', 40336, '46520', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-06', 234247, 'CORRECTIVO', 'MANO DE OBRA MECANICA SUSPENSION', 'Marllantas', 89916, 'FE2-46,520', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-06', 234247, 'CORRECTIVO', 'RODILLO DEL RENAULT', 'Marllantas', 320168, 'FE2-46,520', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-06', 234247, 'CORRECTIVO', 'CAMBIO RODILLO (PRENSA HIDRAULICA)', 'Marllantas', 40336, 'FE2-46,520', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'PREVENTIVO', 'DISCO DE FRENO D-MAX', 'Marllantas', 640336, '46581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'PREVENTIVO', 'RODILLO DEL  DE D-MAX', 'Marllantas', 460504, '46581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'PREVENTIVO', 'RETEN DE BOCIN DEL  D-MAX', 'Marllantas', 50420, '46581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'PREVENTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas', 80672, '46581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 150420, 'FE2-46,581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'CORRECTIVO', 'DISCO DE FRENO D-MAX', 'Marllantas', 640336, 'FE2-46,581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'CORRECTIVO', 'PASTA DE FRENO DEL. D-MAX', 'Marllantas', 268908, 'FE2-46,581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'CORRECTIVO', 'RODILLO DEL. DE D-MAX', 'Marllantas', 460504, 'FE2-46,581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'CORRECTIVO', 'RETEN DE BOCIN DEL. D-MAX', 'Marllantas', 50420, 'FE2-46,581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'CORRECTIVO', 'MANO DE OBRA MECANICA SUSPENSION', 'Marllantas', 80672, 'FE2-46,581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 100000, '46760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'CORRECTIVO', 'MONTAJE AUTO Y CAMIONETA', 'Marllantas', 15126, 'FE2-46,760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'CORRECTIVO', 'PASTA DE FRENO NISSAN URVAN', 'Marllantas', 225210, 'FE2-46,760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 100000, 'FE2-46,760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-14', 317091, 'CORRECTIVO', 'CARGA A/C Y ACEITE, REMOCION Y ENSAMBLE MANGUERA DE DESCARGA, BOQILLAS Y ENGRAFE.', 'REMAIRES LTDA', 380800, 'DCE 26701', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 122324, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '46852', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'CORRECTIVO', 'VALVULAS TB', 'Marllantas', 4202, 'FE2-46,850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 30, 'FE2-46,850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'CORRECTIVO', 'LT245/75R16 RF11 10-PR HANKOOK, LLANTA', 'Marllantas', 1262184, 'FE2-46,850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 122324, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 90756, 'FE2-46,852', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 122324, 'CORRECTIVO', 'PASTA DE FRENO KIA PICANTO', 'Marllantas', 150420, 'FE2-46,852', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 122324, 'CORRECTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, 'FE2-46,852', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-01', 232939, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 52941, 'FE2-47,311', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'PREVENTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 440336, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'PREVENTIVO', 'ABRAZADERA  PLASTICA', 'Marllantas', 1680, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'CORRECTIVO', 'GUAYA DE CLUTCH ORIG  KIA', 'Marllantas', 193277, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 282352, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER -', 'Marllantas', 25210, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 38655, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN', 'Marllantas', 88235, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'PLUMILLA 20" REXION MULTIACOPLE', 'Marllantas', 33613, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'PLUMILLA 22" REXION MULTIACOPLE', 'Marllantas', 34454, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 90756, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 282352, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER - URVAN', 'Marllantas', 25210, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 38655, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN 3000CC/ CABSTAR 400', 'Marllantas', 88235, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'CORRECTIVO', 'PASTA DE FRENO NISSAN URVAN', 'Marllantas', 210084, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'CORRECTIVO', 'PLUMILLA REXION MULTIACOPLE 20"', 'Marllantas', 33613, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'CORRECTIVO', 'PLUMILLA REXION MULTIACOPLE 22"', 'Marllantas', 34454, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 90756, 'FE2-47,395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 36134, '47604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'FILTRO DE AIRE D-MAX RT50', 'Marllantas', 50420, '47604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 403360, '47604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'CORRECTIVO', 'ENGRASE', 'Marllantas', 15126, '47604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 50000, '47604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. D-MAX RT50', 'Marllantas', 51261, 'FE2-47,604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 36134, 'FE2-47,604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'FILTRO DE AIRE D-MAX RT50', 'Marllantas', 50420, 'FE2-47,604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A GRANEL(GRAVADO)', 'Marllantas', 403360, 'FE2-47,604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'CORRECTIVO', 'ENGRASE', 'Marllantas', 15126, 'FE2-47,604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-10', 94355, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 50000, 'FE2-47,604', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'TORNILLO', 'Marllantas', 5882, '47638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'CONJUNTO DE CLUTCH D-MAX', 'Marllantas', 980672, '47638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'CONJUNTO DE CLUTCH D-MAX', 'Marllantas', 980672, 'FE2-47,638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 550420, 'FE2-47,638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'TORNILLO', 'Marllantas', 5882, 'FE2-47,638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'PARCHE RADIAL (RUBBERVULK)', 'Marllantas', 10084, 'FE2-47,638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONETA', 'Marllantas', 16807, 'FE2-47,638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-19', 51836, 'CORRECTIVO', 'Instalacion bateria nuevo con reparacion de choque', 'Mauricio Velez', 480000, '234', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO LIFE 5W30 A', 'Marllantas', 176470, '47896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-52', 'Marllantas', 24370, '47896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'PREVENTIVO', 'FILTRO DE AIRE KIA PICANTO', 'Marllantas', 20168, '47896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'CORRECTIVO', 'BOMBILLO PARA STOP', 'Marllantas', 2521, '47896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO LIFE 5W30 A GRANEL(GRAVADO)', 'Marllantas', 176470, 'FE2-47,896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-52', 'Marllantas', 24370, 'FE2-47,896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'PREVENTIVO', 'FILTRO DE AIRE KIA PICANTO', 'Marllantas', 20168, 'FE2-47,896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-20', 126075, 'CORRECTIVO', 'BOMBILLO PARA STOP', 'Marllantas', 2521, 'FE2-47,896', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  NISSAN - RENAULT', 'Marllantas', 73950, '48057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '48057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA', 'Marllantas', 42017, '48057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN', 'Marllantas', 88235, '48057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO LIFE 5W30 A GRANEL(GRAVADO)', 'Marllantas', 453780, 'FE2-48,057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. NISSAN - RENAULT', 'Marllantas', 73950, 'FE2-48,057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, 'FE2-48,057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA/FRONTIER /NHR', 'Marllantas', 42017, 'FE2-48,057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-26', 27676, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN 3000CC/ CABSTAR 400', 'Marllantas', 88235, 'FE2-48,057', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER -', 'Marllantas', 25210, '48229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN', 'Marllantas', 100000, '48229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 38655, '48229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '48229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 282352, 'FE2-48,229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER - URVAN', 'Marllantas', 25210, 'FE2-48,229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN', 'Marllantas', 100000, 'FE2-48,229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 38655, 'FE2-48,229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-02', 233737, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, 'FE2-48,229', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 98066, 'CORRECTIVO', 'Rodamiento Conico 32008', 'JOHN MAURICIO VÉLEZ MORALES', 43000, '236', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 98066, 'CORRECTIVO', 'Rodamiento Conico 32009', 'JOHN MAURICIO VÉLEZ MORALES', 49000, '236', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 98066, 'CORRECTIVO', 'Grasa Rodamiento', 'JOHN MAURICIO VÉLEZ MORALES', 31000, '236', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 98066, 'CORRECTIVO', 'Sensor Rueda ABS Delantero', 'JOHN MAURICIO VÉLEZ MORALES', 560000, '236', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 98066, 'CORRECTIVO', 'Retenedor Bocin', 'JOHN MAURICIO VÉLEZ MORALES', 29000, '236', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-03', 98066, 'CORRECTIVO', 'Mano de Obra', 'JOHN MAURICIO VÉLEZ MORALES', 120000, '236', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-14', 100100, 'CORRECTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas', 110084, '48527', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-14', 100100, 'CORRECTIVO', 'CAUCHO BARRA ESTAB. CENTRO', 'Marllantas', 75630, '48527', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-14', 100100, 'CORRECTIVO', 'PLUMILLA 18" FLEXIBLE SILICONADA KTC', 'Marllantas', 67226, '48527', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ORIG  MASTER', 'Marllantas', 120168, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'FILTRO DE ACEITE CARTUCHO ORIG  MASTER', 'Marllantas', 55462, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'FILTRO DE AIRE ORIG  MASTER', 'Marllantas', 142017, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'ARANDELA DE TAPON CARTER', 'Marllantas', 1261, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'BATERIA TAB 47 1000 EFB START STOP', 'Marllantas', 586555, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 10, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 317646, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ORIG. MASTER', 'Marllantas', 120168, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'FILTRO DE ACEITE CARTUCHO ORIG. MASTER', 'Marllantas', 55462, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'FILTRO DE AIRE ORIG. MASTER', 'Marllantas', 142017, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'ARANDELA DE TAPON CARTER', 'Marllantas', 1261, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'CORRECTIVO', 'ROTACION AUTO-CAMIONETA', 'Marllantas', 10, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'CORRECTIVO', 'BATERIA TAB 47 1000 EFB START STOP', 'Marllantas', 586555, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'CORRECTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 10, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 0, 'CORRECTIVO', 'Pago aseguradora por reclamacion y reparacion pro medios propios', NULL, NULL, NULL, NULL, 'DEVOLUCIÓN valor_original: -21400000'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-04', 147924, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  D-MAX RT50', 'Marllantas', 51261, '49100', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-04', 147924, 'PREVENTIVO', 'FILTRO DE AIRE D-MAX RT50', 'Marllantas', 50420, '49100', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-04', 147924, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 15126, '49100', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-04', 147924, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 36134, '49100', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-08', 107466, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO LIFE 5W30 A', 'Marllantas', 403360, '49279', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-08', 107466, 'PREVENTIVO', 'FILTRO DE AIRE D-MAX RT50', 'Marllantas', 50420, '49279', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-08', 107466, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 36134, '49279', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-08', 107466, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 15126, '49279', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-08', 107466, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. D-MAX RT50', 'Marllantas', 51261, '49279', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-11', 111430, 'CORRECTIVO', 'BOMBILLO DE HALOGENO', 'Marllantas', 11765, '50414', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-17', 37468, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 90756, '49528', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 328200, 'PREVENTIVO', 'ACEITE MOBIL DELVAC 15W40 GALONES (NO', 'Marllantas', 310000, '49601', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 328200, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '49601', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 328200, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER -', 'Marllantas', 25210, '49601', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 328200, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 30252, '49601', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 189286, 'PREVENTIVO', 'PLUMILLA 18" REXION MULTIACOPLE', 'Marllantas', 33613, '49599', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 189286, 'PREVENTIVO', 'PLUMILLA 22" REXION MULTIACOPLE', 'Marllantas', 34454, '49599', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 189286, 'PREVENTIVO', 'LAVA PARABRISAS', 'Marllantas', 8404, '49599', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-19', 328214, 'PREVENTIVO', 'Cambio de aceite de caja', 'Marllantas', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas', 150000, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 40000, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', 'RODILLO DEL  KIA PICANTO', 'Marllantas', 95798, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', 'REPARACIONES VARIAS', 'Marllantas', 35294, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', 'AMORTIGUADOR TRASERO KIA PICANTO', 'Marllantas', 410084, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', 'TOPE AMORTIGUADOR TRAS  KIA', 'Marllantas', 90756, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-22', 38120, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO LIFE 5W30 A', 'Marllantas', 453780, '49733', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-22', 38120, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  NISSAN - RENAULT', 'Marllantas', 73950, '49733', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-22', 38120, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA', 'Marllantas', 42017, '49733', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-22', 38120, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '49733', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-22', 38120, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN', 'Marllantas', 88235, '49733', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-26', 189326, 'CORRECTIVO', 'Tornillo calibre balancines', 'Mauricio Velez', 232000, '247', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-26', 189326, 'CORRECTIVO', 'Sondear radiador', 'Mauricio Velez', 120000, '247', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-26', 189326, 'CORRECTIVO', 'Refrigerante', 'Mauricio Velez', 72000, '247', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-26', 189326, 'CORRECTIVO', 'MO', 'Mauricio Velez', 350000, '247', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-26', 189326, 'CORRECTIVO', 'Carga de AC', 'Mauricio Velez', 100000, '247', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-26', 189326, 'CORRECTIVO', 'Bujes palanca de cambios', 'Mauricio Velez', 72000, '247', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-08', 287283, 'CORRECTIVO', 'Carga de gas refrigerante AC', 'Mauricio Velez', 100000, '248', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-22', 383449, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-63', 'Marllantas', 25210, '50681', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-22', 383449, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 229411, '50681', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-22', 383449, 'PREVENTIVO', 'FILTRO DE AIRE CHEVROLET LUV D-MAX', 'Marllantas', 47899, '50681', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-22', 383449, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE D-MAX(TRAMPA)', 'Marllantas', 30252, '50681', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-22', 383449, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ORIG  D-MAX', 'Marllantas', 51261, '50681', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-23', 287214, 'CORRECTIVO', 'BATERIA TAB POLAR 27 1300', 'Marllantas', 1373110, '50713', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-23', 287214, 'CORRECTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 20, '50713', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-23', 287214, 'CORRECTIVO', 'REPARACIONES VARIAS', 'Marllantas', 27731, '50713', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-23', 287214, 'CORRECTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 30252, '50713', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-01', 48000, 'PREVENTIVO', 'FILTRO DE A A CHEV  GRAND VITARA', 'Marllantas', 60504, '50952', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 453780, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  NISSAN - RENAULT', 'Marllantas', 73950, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'PLUMILLA 22" FLEXIBLE SILICONADA KTC', 'Marllantas', 34454, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'PLUMILLA 24" FLEXIBLE SILICONADA KTC', 'Marllantas', 35294, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA', 'Marllantas', 42017, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN', 'Marllantas', 88235, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'BOMBILLO PARA STOP', 'Marllantas', 2521, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'BOMBILLO PARA STOP(LAGRIMA)', 'Marllantas', 9244, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 60504, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-05', 136717, 'PREVENTIVO', 'FILTRO DE AIRE KIA PICANTO', 'Marllantas', 20168, '51095', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-05', 136717, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-52', 'Marllantas', 24370, '51095', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-05', 136717, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 176470, '51095', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-05', 136717, 'PREVENTIVO', 'FILTRO DE A A I10-I30 HYUNDAI   KIA PICANTO', 'Marllantas', 42017, '51095', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-05', 136717, 'CORRECTIVO', 'BOMBILLO PARA STOP', 'Marllantas', 2521, '51095', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-12', 238790, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 282352, '51265', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-12', 238790, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER -', 'Marllantas', 25210, '51265', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-12', 238790, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '51265', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'PREVENTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas', 280672, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'CORRECTIVO', 'REPARACIONES VARIAS', 'Marllantas', 30252, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'CORRECTIVO', 'BUJE TIJERA INFERIOR DE HYUNDAI', 'Marllantas', 171428, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'CORRECTIVO', 'BUJE DE BALANCIN', 'Marllantas', 107560, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'CORRECTIVO', 'TUERCA DE RUEDA', 'Marllantas', 8403, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'CORRECTIVO', 'REPARACIONES VARIAS', 'Marllantas', 40336, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'CORRECTIVO', 'PROTEGE TODO CON AROMA A LIMON PA-512 ABRO', 'Marllantas', 35294, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-26', 119223, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 403360, '51686', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-26', 119223, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A', 'Marllantas', 50420, '51686', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-26', 119223, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 37815, '51686', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-26', 119223, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. D-MAX RT50', 'Marllantas', 51261, '51686', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-26', 119223, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 16126, '51686', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 290238, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 15126, '51928', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 290238, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 264705, '51928', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 290238, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  NISSAN - RENAULT', 'Marllantas', 85714, '51928', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 290238, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN NAVARA', 'Marllantas', 27731, '51928', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 290238, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 77310, '51928', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 50669, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 110084, '51930', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 50669, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '51930', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 190192, 'PREVENTIVO', 'MANTENIMIENTO LIMPIEZA DE EVAPORADOR Y COMPRESOR', 'Marllantas', 575630, '51929', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 138000, 'CORRECTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 10, '51959', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 138000, 'CORRECTIVO', 'BATERIA SMF NS40S 560 P (ATLAS BX)', 'Marllantas', 247059, '51959', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 241148, 'CORRECTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 10, '51960', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 241148, 'CORRECTIVO', 'BATERIA TAB POLAR 48 1100', 'Marllantas', 544538, '51960', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 240334, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 35294, '52321', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 123700, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 190756, '52326', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 123700, 'PREVENTIVO', 'GRASA LUBRICANTE PARA RODILLOS', 'Marllantas', 26000, '52326', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 123700, 'PREVENTIVO', 'REPARACION DISCO DE FRENO', 'Marllantas', 45378, '52326', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 123700, 'PREVENTIVO', 'REPARACION DISCO DE FRENO', 'Marllantas', 240336, '52326', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-16', 123700, 'CORRECTIVO', 'RETEN DE BOCIN DEL. D-MAX', 'Marllantas', 75630, '52326', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-19', 328200, 'PREVENTIVO', 'BOMBILLO PARA STOP(LAGRIMA)', 'Marllantas', 18488, '52428', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-19', 328200, 'PREVENTIVO', 'TROMPO DE FRENO ORIG  NISSAN', 'Marllantas', 60504, '52428', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-19', 328200, 'PREVENTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 20000, '52428', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-01', 125000, 'CORRECTIVO', 'BATERIA TAB POLAR 24 1100 I', 'Marllantas', 544538, '52827', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 282352, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER -', 'Marllantas', 25210, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 38655, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN', 'Marllantas', 100000, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 80672, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-05', 242305, 'CORRECTIVO', 'Alternador de 80 amp.', 'Jorge Iván Trujillo Cárdenas', 580000, '363', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-05', 242305, 'CORRECTIVO', 'Revisión sistema de carga y cambio de alternador', 'Jorge Iván Trujillo Cárdenas', 100000, '363', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-19', 58000, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG  NISSAN - RENAULT', 'Marllantas', 85714, '53380', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-19', 58000, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA', 'Marllantas', 45378, '53380', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-19', 58000, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '53380', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-19', 58000, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN', 'Marllantas', 88235, '53380', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-01', 59800, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 180672, '53762', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-01', 59800, 'PREVENTIVO', 'DISCOS DE FRENOS DEL  NISSAN', 'Marllantas', 500840, '53762', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-05', 292469, 'PREVENTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 130252, '53860', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-05', 292469, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '53860', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-05', 292469, 'CORRECTIVO', 'BOMBA AUX  DE CLUTCH', 'Marllantas', 210084, '53860', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 282352, '54266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER -', 'Marllantas', 25210, '54266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '54266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 110000, '54266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'REPARACION  CAMPANA DE FRENO', 'Marllantas', 45378, '54266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'BANDAS DE FRENOS', 'Marllantas', 80672, '54266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 282352, 'FE2-54,266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER - URVAN', 'Marllantas', 25210, 'FE2-54,266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, 'FE2-54,266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 110000, 'FE2-54,266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'CORRECTIVO', 'REPARACION CAMPANA DE FRENO', 'Marllantas', 45378, 'FE2-54,266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-19', 243808, 'CORRECTIVO', 'BANDAS DE FRENOS', 'Marllantas', 80672, 'FE2-54,266', NULL, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'CORRECTIVO', 'TUERCA DE RUEDA', 'Marllantas', 26892, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'CORRECTIVO', 'BALANCEO RIN LUJO 17" A 24"', 'Marllantas', 75630, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'CORRECTIVO', 'ROTACION AUTO-CAMIONETA', 'Marllantas', 10, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'CORRECTIVO', 'ALINEACION DIREC. - RUEDAS DELANT', 'Marllantas', 40337, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A GRANEL(GRAVADO)', 'Marllantas', 302520, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN FRONTIER NP300/ ALASKA', 'Marllantas', 35294, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. NISSAN - RENAULT', 'Marllantas', 85714, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA/FRONTIER /NHR', 'Marllantas', 45378, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'CORRECTIVO', 'ACEITE PARA CAJA 75W90 VALVOLINE (GRAVADO)', 'Marllantas', 214287, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'CORRECTIVO', 'PLUMILLA 16" FLEXIBLE SILICONADA KTC', 'Marllantas', 32773, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-22', 115211, 'CORRECTIVO', 'PLUMILLA 24" FLEXIBLE SILICONADA KTC', 'Marllantas', 35294, 'FE2-54,425', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-23', 126420, 'CORRECTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 550420, '54470', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-23', 126420, 'CORRECTIVO', 'CONJUNTO DE CLUTCH D-MAX', 'Marllantas', 960504, '54470', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-23', 126420, 'CORRECTIVO', 'RODILLO DE VOLANTE', 'Marllantas', 50420, '54470', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-30', 64701, 'CORRECTIVO', 'VALVULA CONTROL PRESION', 'EXA Auto Parts SAS', 820000, 'EXAA66552', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-30', 64701, 'CORRECTIVO', 'SERVICIO REVISION VEHICULO', 'EXA Auto Parts SAS', 120000, 'EXAA66552', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-30', 64701, 'CORRECTIVO', 'VALVULA CONTROL PRESION', 'EXA Auto Parts', 820000, 'EXAA66552', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-30', 64701, 'CORRECTIVO', 'SERVICIO REVISION VEHICULO', 'EXA Auto Parts', 120000, 'EXAA66552', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-07', 73586, 'CORRECTIVO', 'Bombillo stop trasero', 'BATERY REPUESTOS', 12000, '465', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-07', 73586, 'CORRECTIVO', 'MO: Cambio de bombillo, Mantenimiento a stop trasero', 'BATERY REPUESTOS', 28000, '465', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 385197, 'CORRECTIVO', 'Carga de batería', 'BATERY REPUESTOS', 22000, '468', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 385197, 'CORRECTIVO', 'Arreglo convertidor de corriente', 'BATERY REPUESTOS', 80000, '468', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 385197, 'CORRECTIVO', 'MO: Revisión sistema de carga y sistema de encendido', 'BATERY REPUESTOS', 60000, '468', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 71573, 'CORRECTIVO', 'VARILLA DE BATERIA', 'Marllantas', 3361, '56006', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 71573, 'CORRECTIVO', 'BATERIA TAB POLAR 27 1300', 'Marllantas', 610084, '56006', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 71573, 'CORRECTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 10, '56006', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Regulador de voltaje', 'BATERY REPUESTOS', 220000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Rodamiento polea', 'BATERY REPUESTOS', 38000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Carga de batería', 'BATERY REPUESTOS', 22000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'MO: Reparación alternador con señal de computadora activa, Reprogramación y eliminación de códigos', 'BATERY REPUESTOS', 160000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Regulador de voltaje', 'Jorge Iván Trujillo Cárdenas', 220000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Rodamiento polea', 'Jorge Iván Trujillo Cárdenas', 38000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Carga de batería', 'Jorge Iván Trujillo Cárdenas', 22000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Reparación alternador con señal de computadora activa', 'Jorge Iván Trujillo Cárdenas', 160000, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-09', 149548, 'CORRECTIVO', 'Reprogramación y eliminación de códigos', 'Jorge Iván Trujillo Cárdenas', 0, '471', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 153215, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Caja para Reparar Kit de Embrague', 'Mauricio Velez', 410000, '284', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 153215, 'CORRECTIVO', 'Reparar Kit de Embrague', 'Mauricio Velez', 450000, '284', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-14', 149976, 'CORRECTIVO', 'LIQUIDO DE REFRIGERANTE POTRO CORRIENTE CUARTO', 'Marllantas', 9244, '256239', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-24', 246937, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 89916, '256549', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-24', 246937, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '256549', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF (7 unidades)', 'MACROLLANTAS S.A.S', 315000, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'F.AIRE RENAULT TRAFIC III 1.6', 'MACROLLANTAS S.A.S', 42017, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'F. ACEITE KOLEOS 2.0 DIESEL-TRAFIC II-T', 'MACROLLANTAS S.A.S', 33613, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'ALINEACION DE DIRECCION', 'MACROLLANTAS S.A.S', 50420, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF', 'MACROLLANTAS S.A.S', 315000, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'CORRECTIVO', 'F.AIRE RENAULT TRAFIC III 1.6', 'MACROLLANTAS S.A.S', 50000, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'CORRECTIVO', 'F. ACEITE KOLEOS 2.0 DIESEL-TRAFIC II-T', 'MACROLLANTAS S.A.S', 40000, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'CORRECTIVO', 'LLANTA 225/65 R16C 112/110T ROVELO RCM-8', 'MACROLLANTAS S.A.S', 1356000, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'MANO DE OBRA CAMBIO DE ACEITE', 'MACROLLANTAS S.A.S', 0, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'NITROGENO AUTO-CAMIONETA', 'MACROLLANTAS S.A.S', 0, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'TEST ELECTRICO', 'MACROLLANTAS S.A.S', 0, 'AVQ5357', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-03', 78336, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A GRANEL(GRAVADO) (9 unidades)', 'Marllantas', 453780, '56831', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-03', 78336, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. NISSAN - RENAULT', 'Marllantas', 65546, '56831', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-03', 78336, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '56831', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-03', 78336, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVA/FRONTIER /NHR', 'Marllantas', 45378, '56831', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-03', 78336, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN 3000CC/ CABSTAR 400', 'Marllantas', 70588, '56831', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-03', 78336, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 50420, '56831', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-15', 249000, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO) (8 unidades)', 'Marllantas', 282352, '257234', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-15', 249000, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER - URVAN', 'Marllantas', 25210, '257234', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-15', 249000, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN', 'Marllantas', 100000, '257234', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-15', 249000, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 38655, '257234', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-15', 249000, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, '257234', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-17', 129485, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 15126, '257272', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-17', 129485, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A GRANEL(GRAVADO) (8 unidades)', 'Marllantas', 403360, '257272', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-17', 129485, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. D-MAX RT50', 'Marllantas', 51261, '257272', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-17', 129485, 'PREVENTIVO', 'FILTRO DE AIRE D-MAX RT50', 'Marllantas', 40336, '257272', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-17', 129485, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ACDELCO', 'Marllantas', 37815, '257272', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-18', 153389, 'CORRECTIVO', 'Soporte Motor Derecho', 'Mauricio Velez', 165000, '290', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-18', 153389, 'CORRECTIVO', 'Mano de Obra Cambio Soporte Motor Derecho', 'Mauricio Velez', 70000, '290', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-19', 193066, 'CORRECTIVO', 'SERVICIO REVISION VEHICULO (Hyundai H1)', 'EXA Auto Parts SAS', 280000, 'EXAA67417', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-19', 80444, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 160504, '57349', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-19', 80444, 'PREVENTIVO', 'KIT CALIPER DE MORDAZA', 'Marllantas', 325210, '57349', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-19', 80444, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN (2 unidades)', 'Marllantas', 63866, '57349', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-19', 293677, 'CORRECTIVO', 'SERVICIO REVISION VEHICULO', 'EXA Auto Parts', 280000, 'EXAA67417', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 190756, '257418', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO) (9 unidades)', 'Marllantas', 317646, '257418', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'FILTRO DE ACEITE CARTUCHO ORIG. MASTER', 'Marllantas', 55462, '257418', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'FILTRO DE AIRE ORIG. MASTER', 'Marllantas', 142017, '257418', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'REPARACION DISCO DE FRENO (2 unidades)', 'Marllantas', 45378, '257418', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN (2 unidades)', 'Marllantas', 63866, '257418', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-24', 247583, 'CORRECTIVO', 'Aceite Hidraulico', 'Mauricio Velez', 33500, '291', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-24', 247583, 'CORRECTIVO', 'Empaquetadura Caja de Dirección', 'Mauricio Velez', 90000, '291', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-24', 247583, 'CORRECTIVO', 'Mano de Obra desmontar y Montar Caja de Dirección', 'Mauricio Velez', 350000, '291', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-04', 154500, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '25773', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-04', 154500, 'PREVENTIVO', 'BANDAS DE FRENO (4 unidades)', 'Marllantas', 110924, '25773', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-04', 154500, 'PREVENTIVO', 'REPARACION CAMPANA DE FRENO (2 unidades)', 'Marllantas', 45378, '25773', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-04', 154500, 'PREVENTIVO', 'PASTAS DE FRENO D-MAX', 'Marllantas', 250420, '25773', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-05', 154567, 'CORRECTIVO', 'Tijera de Suspensión', 'Mauricio Velez', 150000, '293', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-05', 154567, 'CORRECTIVO', 'Mano de Obra Desmontar Suspensión para Cambio de Tijera', 'Mauricio Velez', 90000, '293', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-07', 66667, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO) (7.50 unidades)', 'Marllantas', 264705, '257855', 0, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-07', 66667, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN NAVARA', 'Marllantas', 27731, '257855', 0, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-07', 66667, 'PREVENTIVO', 'FILTRO DE ACEITE ABRO 3549957 JEEP CHEROKEE - NISSAN NAVARA/PAFHINDER/CABSTAR', 'Marllantas', 21849, '257855', 0, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-12', 293731, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 100000, '257994', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-12', 293731, 'PREVENTIVO', 'LIQUIDO DE FRENO ALEMAN', 'Marllantas', 31933, '257994', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-13', 132397, 'CORRECTIVO', 'MANO DE OBRA MECANICA ESPECIALIZADA', 'Marllantas', 550420, '258039', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-13', 132397, 'CORRECTIVO', 'REPARACION DE CLUTCH', 'Marllantas', 480672, '258039', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF (8 unidades)', 'MACROLLANTAS S.A.S', 360000, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'F.AIRE NISSAN URVAN DIESEL HYUNDAI H100', 'MACROLLANTAS S.A.S', 37815, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'F. ACEITE NISSAN FRONTIER DIESEL 3.0', 'MACROLLANTAS S.A.S', 29412, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'BOMBILLO H4 HALOGENO 12V 60/55W', 'MACROLLANTAS S.A.S', 16807, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF (7 unidades)', 'MACROLLANTAS S.A.S', 280000, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'BATERIA MAC 271150R', 'MACROLLANTAS S.A.S', 503361, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'F.AIRE RENAULT TRAFIC III 1.6', 'MACROLLANTAS S.A.S', 37815, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'F. ACEITE KOLEOS 2.0 DIESEL-TRAFIC II-T', 'MACROLLANTAS S.A.S', 33613, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF', 'MACROLLANTAS S.A.S', 360000, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'F.AIRE NISSAN URVAN DIESEL HYUNDAI H100', 'MACROLLANTAS S.A.S', 45000, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'F. ACEITE NISSAN FRONTIER DIESEL 3.0', 'MACROLLANTAS S.A.S', 35000, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'MANO DE OBRA CAMBIO DE ACEITE', 'MACROLLANTAS S.A.S', 0, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 281319, 'PREVENTIVO', 'TEST ELECTRICO', 'MACROLLANTAS S.A.S', 0, 'AVQ5928', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'CORRECTIVO', 'BOMBILLO H4 HALOGENO 12V 60/55W', 'MACROLLANTAS S.A.S', 20000, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF', 'MACROLLANTAS S.A.S', 280000, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'CORRECTIVO', 'BATERIA MAC 271150R', 'MACROLLANTAS S.A.S', 599000, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'CORRECTIVO', 'F.AIRE RENAULT TRAFIC III 1.6', 'MACROLLANTAS S.A.S', 45000, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'CORRECTIVO', 'F. ACEITE KOLEOS 2.0 DIESEL-TRAFIC II-T', 'MACROLLANTAS S.A.S', 40000, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'MANO DE OBRA CAMBIO DE ACEITE', 'MACROLLANTAS S.A.S', 0, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-21', 129447, 'PREVENTIVO', 'TEST ELECTRICO', 'MACROLLANTAS S.A.S', 0, 'AVQ5930', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 156202, 'CORRECTIVO', 'Bomba de Agua', 'Mauricio Velez', 90000, '299', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 156202, 'CORRECTIVO', 'Mano de Obra Cambiar Bomba de Agua', 'Mauricio Velez', 110000, '299', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 156202, 'CORRECTIVO', 'Escobillas', 'Mauricio Velez', 25000, '299', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 156202, 'CORRECTIVO', 'Mantenimiento Ventilador', 'Mauricio Velez', 60000, '299', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'BOMBILLO STOP SIN SOCKET 2 FILAMENTOS', 'MACROLLANTAS S.A.S', 8403, 'AVQ5933', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'ALINEACION DE DIRECCION', 'MACROLLANTAS S.A.S', 50420, 'AVQ5933', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'CORRECTIVO', 'LLANTA 205/70 R15C 106/104R GALLANT GL-', 'MACROLLANTAS S.A.S', 698000, 'AVQ5933', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'NITROGENO AUTO-CAMIONETA', 'MACROLLANTAS S.A.S', 0, 'AVQ5933', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'SERVICIO DE ROTACION', 'MACROLLANTAS S.A.S', 0, 'AVQ5933', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'TEST ELECTRICO', 'MACROLLANTAS S.A.S', 0, 'AVQ5933', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-01', 157066, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-52', 'Marllantas', 24370, '258578', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-01', 157066, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A GRANEL(GRAVADO) (3.50 unidades)', 'Marllantas', 176470, '258578', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-01', 157066, 'PREVENTIVO', 'FILTRO DE AIRE KIA NEW PICANTO', 'Marllantas', 30252, '258578', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-01', 157066, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 80672, '258578', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-01', 157066, 'PREVENTIVO', 'ACEITE PARA CAJA 75W90 VALVOLINE (GRAVADO) (2.00 unidades)', 'Marllantas', 142858, '258578', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-02', 386343, 'CORRECTIVO', 'Mano de Obra Revisar y Reparar Suspensión Delantera', 'Mauricio Velez', 110000, '304', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-02', 154000, 'CORRECTIVO', 'BATERIA TAB POLAR NS40 700HP', 'Marllantas', 355462, '25858', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-05', 155896, 'CORRECTIVO', 'INSTALACION DE BATERIAS', 'Marllantas', 10, '258692', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', 'Modulos luces laterales (14 unidades)', 'BATERY REPUESTOS', 84000, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', 'Exploradora trasera', 'BATERY REPUESTOS', 60000, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', 'Bombillo farola', 'BATERY REPUESTOS', 22000, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', '6 mts cable', 'BATERY REPUESTOS', 24000, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', 'Bombillo exploradora', 'BATERY REPUESTOS', 18000, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', 'Balastra de salida', 'BATERY REPUESTOS', 15000, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', 'Rollo cinta', 'BATERY REPUESTOS', 4800, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 250856, 'CORRECTIVO', 'Servicio técnico (MO) Recuperacion y cambio luces laterales blancas, Cambio bombillo farola principal y exploradora, Recuperacion luces interiores y extractor, Recuperacion luces traseras superiores y cambio inversor', 'BATERY REPUESTOS', 320000, '592', 0, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 88292, 'PREVENTIVO', 'Aceite Motor (8 unidades)', 'Mauricio Velez', 308000, '305', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 88292, 'PREVENTIVO', 'Filtro de Aceite', 'Mauricio Velez', 32000, '305', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 88292, 'PREVENTIVO', 'Filtro de Aire', 'Mauricio Velez', 45000, '305', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-07', 88292, 'PREVENTIVO', 'Mano de Obra Realizar Mantenimiento', 'Mauricio Velez', 60000, '305', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 135457, 'CORRECTIVO', 'Maxifucible', 'BATERY REPUESTOS', 18000, '593', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 135457, 'CORRECTIVO', 'Switche elevavidrios', 'BATERY REPUESTOS', 25000, '593', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 135457, 'CORRECTIVO', '3 mts cable', 'BATERY REPUESTOS', 10500, '593', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 135457, 'CORRECTIVO', '6 Terminales', 'BATERY REPUESTOS', 4800, '593', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 135457, 'CORRECTIVO', 'Servicio técnico (MO) Recuperacion sistema elevavidrios en general, Cambio fusible y chequeo sistema, se descartera para funcionamiento motores', 'BATERY REPUESTOS', 120000, '593', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 157808, 'CORRECTIVO', 'Bomba Gasolina', 'Mauricio Velez', 442000, '306', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 157808, 'CORRECTIVO', 'Mano de Obra Cambio de Bomba de Gasolina', 'Mauricio Velez', 80000, '306', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-28', 335084, 'CORRECTIVO', 'Manguera Entrada Valvula EGR', 'Mauricio Velez', 28000, '315', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-28', 335084, 'CORRECTIVO', 'Manguera Retorno Valvula', 'Mauricio Velez', 31000, '315', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-28', 335084, 'CORRECTIVO', 'Silicona Gris', 'Mauricio Velez', 33000, '315', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-28', 335084, 'CORRECTIVO', 'Refrigerante (2 unidades)', 'Mauricio Velez', 75000, '315', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-28', 335084, 'CORRECTIVO', 'Bomba de Agua', 'Mauricio Velez', 610000, '315', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-28', 335084, 'CORRECTIVO', 'Sondear Radiador', 'Mauricio Velez', 110000, '315', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-28', 335084, 'CORRECTIVO', 'Mano de Obra Desmontar Multiple de Admisión, Valvula EGR, Cambio Bomba de Agua y Desmontar Radiador para Sondear', 'Mauricio Velez', 380000, '315', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-05-05', 386534, 'CORRECTIVO', 'Sensor CKP Cigüeñal', 'Mauricio Velez', 260000, '317', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-05-05', 386534, 'CORRECTIVO', 'Servicio de Scanner', 'Mauricio Velez', 80000, '317', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-05-05', 386534, 'CORRECTIVO', 'Mano de Obra Revisar Fallo en Motor y Perdida de Fuerza', 'Mauricio Velez', 290000, '317', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 141700, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 180672, 'PF-36', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 141700, 'CORRECTIVO', 'BANDAS DE FRENO', 'Marllantas', 57142, 'PF-36', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 141700, 'CORRECTIVO', 'BANDAS DE FRENO', 'Marllantas', 52100, 'PF-36', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 141700, 'CORRECTIVO', 'REPARACION CAMPANA DE FREΝΟ', 'Marllantas', 45378, 'PF-36', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 143017, 'CORRECTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas', 200000, 'FE2-60,394', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 143017, 'CORRECTIVO', 'KIT DE RODILLO DEL. D-MAX', 'Marllantas', 551260, 'FE2-60,394', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 143017, 'CORRECTIVO', 'GRASA LUBRICANTE PARA RODILLOS', 'Marllantas', 28000, 'FE2-60,394', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-06', 97336, 'CORRECTIVO', 'Arreglo abolladura y latoneria y pintura', 'Anthony Bernal - Pinturas y Repuestos', 1300000, '233', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-03-03', 63096, 'PREVENTIVO', 'SE REALIZA CAMBIO DE ACEITE DE MOTOR (20W50 SAE) Y FILTROS (AIRE Y ACEITE); ADEMAS, SE REALIZA ALINEACION Y ROTACION DE LLANTAS Y CHEQUEO DEL SISTEMA ELECTRICO.', 'Multicar Envigado', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-03', 63096, 'CORRECTIVO', 'Se suple baliza trasera nueva', 'Battery repuestos', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-17', 0, 'CORRECTIVO', 'Cambio de bujes de tijera superior izquierda', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-12', 67360, 'CORRECTIVO', 'Servicio de scaner', 'BATERY REPUESTOS', 60000, '670', 0, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-16', 67360, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 40336, 'FE2-60,699', 0, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 256096, 'CORRECTIVO', 'BOMBILLO HALOGENO 100 VATIOS', 'Marllantas', 17647, 'FE2-60,734', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'ARANDELA DE TAPON CARTER', 'Marllantas', 1345, 'FE2-60,735', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'FILTRO DE AIRE CHEVROLET LUV D-MAX', 'Marllantas', 48739, 'FE2-60,735', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-63', 'Marllantas', 26050, 'FE2-60,735', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE D-MAX(TRAMPA)', 'Marllantas', 30252, 'FE2-60,735', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 229411, 'FE2-60,735', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE ORIG. D-MAX', 'Marllantas', 60504, 'FE2-60,735', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-01', 101253, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 160504, 'FE2-61,166', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-01', 101253, 'CORRECTIVO', 'REPARACION CAMPANA DE FRENO', 'Marllantas', 45378, 'FE2-61,166', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-01', 101253, 'CORRECTIVO', 'BANDAS DE FRENO', 'Marllantas', 110924, 'FE2-61,166', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-01', 195038, 'CORRECTIVO', 'Refrigerante', 'JOHN MAURICIO VÉLEZ MORALES', 37500, '325', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-01', 195038, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Bomba de Inyección', 'JOHN MAURICIO VÉLEZ MORALES', 550000, '325', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 142778, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF', 'Macrollantas', 364000, 'AVQ6959', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 142778, 'PREVENTIVO', 'F.AIRE RENAULT TRAFIC III 1.6', 'Macrollantas', 42016, 'AVQ6959', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 142778, 'PREVENTIVO', 'F. ACEITE KOLEOS 2.0 DIESEL-TRAFIC II-T', 'Macrollantas', 37815, 'AVQ6959', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 100540, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas', 42017, 'PF-48', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 100540, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 40336, 'PF-48', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 100540, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A GRANEL(GRAVADO)', 'Marllantas', 453780, 'PF-48', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 100540, 'PREVENTIVO', 'ARANDELA TAPON CARTER ORIG. TOYOTA/NISSAN /RENAULT/MAZDA', 'Marllantas', 5462, 'PF-48', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 100540, 'PREVENTIVO', 'FILTRO DE ACEITE NISSAN FRONTIER', 'Marllantas', 52942, 'PF-48', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 100540, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN 3000CC/ CABSTAR 400', 'Marllantas', 45378, 'PF-48', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-04', 195140, 'CORRECTIVO', 'Emboinado corona', 'BATERY REPUESTOS', 120000, '690', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-04', 195140, 'CORRECTIVO', 'Retenedor original', 'BATERY REPUESTOS', 60000, '690', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-04', 195140, 'CORRECTIVO', 'Arreglo regulador en bases', 'BATERY REPUESTOS', 50000, '690', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-04', 195140, 'CORRECTIVO', 'Cargas de baterias', 'BATERY REPUESTOS', 54000, '690', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-04', 195140, 'CORRECTIVO', 'Servicio técnico (MO) Reparacion alternador por arrastre, Emboinada de corona y arreglo de regulador', 'BATERY REPUESTOS', 140000, '690', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-09', 165371, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 120168, 'FE2-61,447', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 195278, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 15126, 'FE261,493', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 195278, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas', 40336, 'FE261,493', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 195278, 'PREVENTIVO', 'FILTRO DE AIRE HYUNDAI STAREX', 'Marllantas', 63025, 'FE261,493', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 195278, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas', 211764, 'FE261,493', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 195278, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-1 CAMPEROS', 'Marllantas', 30252, 'FE261,493', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 195278, 'PREVENTIVO', 'ARREGLO ROSCA CARTER Y TAPON', 'Marllantas', 100000, 'FE261,493', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-15', 0, 'PREVENTIVO', 'LIQUIDO DE REFRIGERANTE POTRO LARGA VIDA GALON', 'Marllantas', 67227, 'FE2-61,633', 0, NULL
FROM vehicles WHERE placa = 'Flota';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-06', 14588, 'CORRECTIVO', 'Filtro secadro', 'Mundo Frio', 21008, '52754', 0, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-06', 14588, 'CORRECTIVO', 'Valvula Universal Aire acondicionado', 'Mundo Frio', 105042, '52754', 0, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-06', 14588, 'CORRECTIVO', 'Reparacion Aire Acondicionado', 'Rubiel Mauri Cifuentes', 150000, NULL, 0, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-20', 151697, 'CORRECTIVO', 'ACRILICO NEGRO DE 5 MM DE 36 X 18 CM.', 'AVISOS EL TREBOL INKPACTA S.A.S', 26000, 'FVE-1417', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-01', 110689, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO LIFE 5W30 A GRANEL(GRAVADO)', 'Marllantas S.A.', 453780, 'FE2-62,906', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-01', 110689, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE NISSAN URVAN 3000CC/ CABSTAR 400', 'Marllantas S.A.', 45378, 'FE2-62,906', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-01', 110689, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas S.A.', 42017, 'FE2-62,906', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-01', 110689, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE', 'Marllantas S.A.', 40336, 'FE2-62,906', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-01', 110689, 'PREVENTIVO', 'FILTRO DE ACEITE NISSAN', 'Marllantas S.A.', 40336, 'FE2-62,906', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-01', 110689, 'PREVENTIVO', 'ARANDELA TAPON CARTER ORIG. TOYOTA/NISSAN /RENAULT/MAZDA', 'Marllantas S.A.', 5462, 'FE2-62,906', 0, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-01', 259133, 'PREVENTIVO', 'ACEITE HIDRAULICO (NO GRAVADO)', 'Marllantas S.A.', 39000, 'FE2-62,911', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-02', 335816, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A GRANEL(GRAVADO)', 'Marllantas S.A.', 282352, 'FE2-62,947', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-02', 335816, 'PREVENTIVO', 'FILTRO DE ACEITE DE CARTUCHO FRONTIER - URVAN', 'Marllantas S.A.', 25210, 'FE2-62,947', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-02', 335816, 'PREVENTIVO', 'FILTRO DE AIRE NISSAN URVAN 16546', 'Marllantas S.A.', 42017, 'FE2-62,947', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 169939, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONΕΤΑ', 'Marllantas S.A.', 21008, 'FE2 - 63,059', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 169939, 'CORRECTIVO', 'PARCHEO ADICIONAL', 'Marllantas S.A.', 8403, 'FE2 - 63,059', 0, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 295099, 'CORRECTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas S.A.', 250420, 'FE2-63,062', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 295099, 'CORRECTIVO', 'TIJERA SUPERIOR DE NISSAN', 'Marllantas S.A.', 268907, 'FE2-63,062', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 295099, 'CORRECTIVO', 'RETEN DE EJE L.C ORIG. NISSAN', 'Marllantas S.A.', 90756, 'FE2-63,062', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 295099, 'CORRECTIVO', 'PUNTA DE EJE L. R. NISSAN', 'Marllantas S.A.', 560504, 'FE2-63,062', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 295099, 'CORRECTIVO', 'PUNTA DE EJE L. C. NISSAN', 'Marllantas S.A.', 720168, 'FE2-63,062', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 295099, 'PREVENTIVO', 'ACEITE CAJA Y/O TRANSMISION PINTAS (GRAVADO).', 'Marllantas S.A.', 42855, 'FE2-63,062', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-05', 295099, 'PREVENTIVO', 'ALINEACION DE DIRECCION CAMIONETA Y SUV''S DOBLE', 'Marllantas S.A.', 78431, 'FE2-63,062', 0, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-06', 336124, 'CORRECTIVO', 'Bombillo farola', 'BATERY REPUESTOS', 25000, '765', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-06', 336124, 'CORRECTIVO', 'Crgas de baterias', 'BATERY REPUESTOS', 40000, '765', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-06', 336124, 'CORRECTIVO', 'Se desmonta frente para cambio de bombillo principal', 'BATERY REPUESTOS', 60000, '765', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-06', 154274, 'CORRECTIVO', 'Bombillo farola', 'BATERY REPUESTOS', 25000, '766', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-08', 55953, 'PREVENTIVO', 'ALINEACION de DIRECCIÓN AUTO', 'Marllantas S.A.', 42017, 'FE2-63,159', 0, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-10', 55962, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ INEO MC3 5W30 A GRANEL(GRAVADO)', 'Marllantas S.A.', 378150, 'FE2 - 63,224', 0, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-10', 55962, 'PREVENTIVO', 'FILTRO DE AIRE ORIG. HYUNDAI/ΚΙΑ', 'Marllantas S.A.', 120168, 'FE2 - 63,224', 0, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-10', 55962, 'PREVENTIVO', 'FILTRO DE ACEITE ORIG. HYUNDAI - ΚΙΑ', 'Marllantas S.A.', 65546, 'FE2 - 63,224', 0, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-10', 55962, 'PREVENTIVO', 'FILTRO DE COMBUSTIBLE HYUNDAI', 'Marllantas S.A.', 50420, 'FE2 - 63,224', 0, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-10', 55962, 'PREVENTIVO', 'TAPON DE CARTER', 'Marllantas S.A.', 16806, 'FE2 - 63,224', 0, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-10', 55962, 'PREVENTIVO', 'FILTRO DE A.A HYUNDAI STARIA', 'Marllantas S.A.', 50420, 'FE2 - 63,224', 0, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-17', 59787, 'PREVENTIVO', 'MANO DE OBRA CAMBIO DE ACEITE', 'MACROLLANTAS S.A.S', 0, 'AVQ7658', 0, NULL
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-17', 59787, 'PREVENTIVO', 'ACEITE CHEVRON HAV.DUAL 5W30 1/4 SINTETI', 'MACROLLANTAS S.A.S', 416000, 'AVQ7658', 0, NULL
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-17', 59787, 'PREVENTIVO', 'F. ACEITE KOLEOS 2.0 DIESEL-TRAFIC II-T', 'MACROLLANTAS S.A.S', 33613, 'AVQ7658', 0, NULL
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-17', 59787, 'PREVENTIVO', 'F.AIRE RENAULT TRAFIC III 1.6', 'MACROLLANTAS S.A.S', 37815, 'AVQ7658', 0, NULL
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '1.- BAT AUTO SLI SURE TOP CCA (-18) 850_49(-+)_MA', 'coéxito S.A.S', 673109, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '2.- LIMP RENOV LLANTAS SIMONIZ ALT BR. 250ML 207177', 'coéxito S.A.S', 12185, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '3.- MO DIAGNOSTICO SCANNER_MO0301', 'coéxito S.A.S', 68067, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '4.- BAT AUTO SLI CCA (-18) 800 31(+-)_MAC 31T1250', 'coéxito S.A.S', 740840, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '5.-MO CAMBIO DE FILTRO DE CABINA MO9', 'coéxito S.A.S', 16807, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '6.-MO REVISION DE FRENOS_MO0509', 'coéxito S.A.S', 41176, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '7.- ACEITE DIESEL SAE 15W-40 API CI-4/SL-1GA 30218', 'coéxito S.A.S', 186722, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '8.- FILTRO DE COMBUSTIBLE', 'coéxito S.A.S', 110294, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '9.-5500 LIMP, INYECTORES 250ML QUALITOR 103358', 'coéxito S.A.S', 20084, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '10.- PLUMILLA AEROPLUS 26 UNIDAD COA-089P', 'coéxito S.A.S', 40756, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '11.- PLUMILLA AEROPLUS 22 UNIDAD_COA-087P', 'coéxito S.A.S', 35126, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '12.- FILTRO DE ACEITE', 'coéxito S.A.S', 34664, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '13.- ACEITE DIESEL SAE 15W-40 API CI-4/SL-1/4 30218', 'coéxito S.A.S', 24202, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '14.- FILTRO DE CABINA', 'coéxito S.A.S', 31512, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '15.- FILTRO DE AIRE', 'coéxito S.A.S', 42017, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 216762, 'PREVENTIVO', '16.- MO CAMBIO DE FILTRO DE COMBUSTIBLE ESPECIAL MO06', 'coéxito S.A.S', 38629, '413E25090', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 0, 'CORRECTIVO', 'Transporte por carretera para el vehículo de placa OSK399...', 'GRUAS ARAGON SANTA S.A.S', 500000, 'FEDV1546', 0, NULL
FROM vehicles WHERE placa = 'OSK399';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 0, 'CORRECTIVO', 'Transporte por carretera para el vehículo de placa OSK397...', 'GRUAS ARAGON SANTA S.A.S', 500000, 'FEDV1546', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '1.- BAT AUTO SLI SURE TOP CCA (-18) 850_49(-+)_MA', 'coéxito S.A.S', 673109, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '2.-FILTRO DE AIRE', 'coéxito S.A.S', 34664, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '3.- MO CAMBIO DE LIQUIDO DE FRENOS_MO4', 'coéxito S.A.S', 55462, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '4.- MO REVISION DE FRENOS_MO0509', 'coéxito S.A.S', 41176, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '5.- MO CAMBIO DE FILTRO DE COMBUSTIBLE ESPECIAL MO06', 'coéxito S.A.S', 38655, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '6.-BAT AUTO SLI CCA (-18) 800 31(+-)_MAC 31H1250', 'coéxito S.A.S', 688992, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '7.-MO DIAGNOSTICO SCANNER_MO0301', 'coéxito S.A.S', 68067, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '8.- ACEITE DIESEL SAE 15W-40 API CI-4/SL-1/4 30218', 'coéxito S.A.S', 24202, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '9.- ACEITE DIESEL SAE 15W-40 API CI-4/SL-1GA 30218', 'coéxito S.A.S', 186722, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '10.- REFRIGERANTE RADIADOR EN 1/4 CO-132-1', 'coéxito S.A.S', 5882, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '11.- FILTRO DE ACEITE', 'coéxito S.A.S', 42016, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '12.-DESENGRASANTE DE MOTOR SIMONIZ 524 ml_208891', 'coéxito S.A.S', 18403, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '13.-FILTRO DE CABINA', 'coéxito S.A.S', 31512, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '14.-PLUMILLA AEROPLUS 26 UNIDAD_COA-089P', 'coéxito S.A.S', 40756, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '15.-PLUMILLA AEROPLUS 22 UNIDAD_COA-087P', 'coéxito S.A.S', 35126, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '16.-FILTRO DE COMBUSTIBLE', 'coéxito S.A.S', 110294, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '17.-LIQUIDO FRENO DOT 4 900 CC UNIDAD_CO-097-1', 'coéxito S.A.S', 33190, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '18.-KIT DE CARRETERA ECONOMICO 4PZAS_200878', 'coéxito S.A.S', 40252, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-18', 339039, 'PREVENTIVO', '19.- MO CAMBIO DE FILTRO DE CABINA MO9', 'coéxito S.A.S', 16815, '413E25092', 0, NULL
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-22', 127155, 'CORRECTIVO', 'Soquet bombillo reforzado', 'BATERY REPUESTOS', 42000, '780', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-22', 127155, 'CORRECTIVO', 'Bombillo principal', 'BATERY REPUESTOS', 25000, '780', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-22', 127155, 'CORRECTIVO', 'Recuperacion luces / Arreglo instalacion y caja portafucible', 'BATERY REPUESTOS', 190000, '780', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-23', 300836, 'PREVENTIVO', 'ACEITE CHEVRON URSA TDX 15W40 1/4 CF', 'MACROLLANTAS S.A.S', 416000, 'AVQ7767', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-23', 300836, 'PREVENTIVO', 'MANO DE OBRA CAMBIO DE ACEITE', 'MACROLLANTAS S.A.S', 0, 'AVQ7767', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-23', 300836, 'PREVENTIVO', 'F. ACEITE NISSAN FRONTIER DIESEL 3.0', 'MACROLLANTAS S.A.S', 33613, 'AVQ7767', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-23', 300836, 'PREVENTIVO', 'F.AIRE NISSAN URVAN DIESEL HYUNDAI H100', 'MACROLLANTAS S.A.S', 42017, 'AVQ7767', 0, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Kit de Distribución', 'JOHN MAURICIO VÉLEZ MORALES', 398000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Retenedor Cigüeñal', 'JOHN MAURICIO VÉLEZ MORALES', 45500, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Retenedor Eje Balanceo Pequeño', 'JOHN MAURICIO VÉLEZ MORALES', 35000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Retenedor Eje Balanceo Grande', 'JOHN MAURICIO VÉLEZ MORALES', 38000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Piñon Buje Retenedor Cigüeñal', 'JOHN MAURICIO VÉLEZ MORALES', 143000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Buje Espaciador Reten Eje Balanceo', 'JOHN MAURICIO VÉLEZ MORALES', 70000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Buje Reten Pequeño', 'JOHN MAURICIO VÉLEZ MORALES', 60000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Correa Ventilador', 'JOHN MAURICIO VÉLEZ MORALES', 92000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Correa Acanalada Hidraulico', 'JOHN MAURICIO VÉLEZ MORALES', 51000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Refrigerante', 'JOHN MAURICIO VÉLEZ MORALES', 37500, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 197520, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Radiadores... y Cambio Kit de Distribución', 'JOHN MAURICIO VÉLEZ MORALES', 330000, '346', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-01', 260512, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Correas y Poleas para Revisar y Correguir Ruido', 'JOHN MAURICIO VÉLEZ MORALES', 120000, '348', 0, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-03', 197605, 'CORRECTIVO', 'Master o cuchilla', 'BATERY REPUESTOS', 80000, '795', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-03', 197605, 'CORRECTIVO', 'Borne principal', 'BATERY REPUESTOS', 15000, '795', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-03', 197605, 'CORRECTIVO', 'bornes carretera o desvare para cuchilla', 'BATERY REPUESTOS', 36000, '795', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-03', 197605, 'CORRECTIVO', 'mts cable bateria', 'BATERY REPUESTOS', 108000, '795', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-03', 197605, 'CORRECTIVO', 'Se instala cuchilla master... (Mano de obra)', 'BATERY REPUESTOS', 140000, '795', 0, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-07', 50000, 'PREVENTIVO', 'REV.MECANICA DE 50.000 KMS', 'TALLERES AUTORIZADOS S.A.', 196000, 'T150-12137', 0, NULL
FROM vehicles WHERE placa = 'JQS528';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-07', 50000, 'PREVENTIVO', 'ALINEACION DIRECCION', 'TALLERES AUTORIZADOS S.A.', 49000, 'T150-12137', 0, NULL
FROM vehicles WHERE placa = 'JQS528';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-07', 50000, 'PREVENTIVO', 'BALANCEO RUEDAS', 'TALLERES AUTORIZADOS S.A.', 98000, 'T150-12137', 0, NULL
FROM vehicles WHERE placa = 'JQS528';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-07', 50000, 'PREVENTIVO', 'LIQUIDO FRENOS ""DOT3""', 'TALLERES AUTORIZADOS S.A.', 19876, 'T150-12137', 0, NULL
FROM vehicles WHERE placa = 'JQS528';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-07', 50000, 'PREVENTIVO', 'LIMPIADOR DE FRENOS', 'TALLERES AUTORIZADOS S.A.', 21345, 'T150-12137', 0, NULL
FROM vehicles WHERE placa = 'JQS528';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-07', 50000, 'PREVENTIVO', 'LIJA NO. 80', 'TALLERES AUTORIZADOS S.A.', 1811, 'T150-12137', 0, NULL
FROM vehicles WHERE placa = 'JQS528';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-07', 157105, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Caja de Cambios para Cambiar Kit de Embrague', 'JOHN MAURICIO VÉLEZ MORALES', 450000, '349', 0, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-08', 151686, 'CORRECTIVO', 'MTO DE FRENOS', 'AUTOCARS ALINEACIONES', 130000, '4233', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-08', 151686, 'CORRECTIVO', 'RECTIFICACION DISCOS', 'AUTOCARS ALINEACIONES', 50000, '4233', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-08', 151686, 'CORRECTIVO', 'CAMBIO MANGUERA MANO DE OBRA', 'AUTOCARS ALINEACIONES', 200000, '4233', 0, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-09', 158072, 'CORRECTIVO', 'Desmontar y Montar Caja de Cambios para Cambiar Kit de Embrague', 'JOHN MAURICIO VÉLEZ MORALES', 450000, '355', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-09', 337248, 'CORRECTIVO', 'Silicona Gris', 'JOHN MAURICIO VÉLEZ MORALES', 33000, '354', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-09', 337248, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Caja de Cambios para Cambiar Kit de Embrague...', 'JOHN MAURICIO VÉLEZ MORALES', 480000, '354', 0, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-14', 157969, 'CORRECTIVO', 'Bombillo stop', 'BATERY REPUESTOS', 5000, '807', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-14', 157969, 'CORRECTIVO', 'Rollo cinta', 'BATERY REPUESTOS', 5500, '807', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-14', 157969, 'CORRECTIVO', 'Se instalan luces laterales exteriores y beliza', 'BATERY REPUESTOS', 90000, '807', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-14', 399178, 'CORRECTIVO', 'Tornillos', 'BATERY REPUESTOS', 2400, '808', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-14', 399178, 'CORRECTIVO', 'Modulos lampara', 'BATERY REPUESTOS', 24000, '808', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-14', 399178, 'CORRECTIVO', 'Se instala modulos paea lampra exterior / beliza / busca corriente', 'BATERY REPUESTOS', 90000, '808', 0, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Reparación radiador de cobre', 'WILD HOUSE TIRES SAS', 249580, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Reparación carburador y repuestos', 'WILD HOUSE TIRES SAS', 386555, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Aceite 20w50', 'WILD HOUSE TIRES SAS', 160000, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Filtro de Aire', 'WILD HOUSE TIRES SAS', 50420, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Filtro aceite Denso', 'WILD HOUSE TIRES SAS', 33613, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Aceite ATF Hidráulico', 'WILD HOUSE TIRES SAS', 100000, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Rectificado Rosca tapon de drenaje', 'WILD HOUSE TIRES SAS', 70588, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Mano de obra', 'WILD HOUSE TIRES SAS', 126050, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-21', 127242, 'CORRECTIVO', 'Batería 1100 caja 27', 'WILD HOUSE TIRES SAS', 411765, 'FE 201', 0, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-25', 158095, 'PREVENTIVO', 'Aceite Motor 15W40', 'JOHN MAURICIO VÉLEZ MORALES', 287000, '358', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-25', 158095, 'PREVENTIVO', 'Filtro de Aire', 'JOHN MAURICIO VÉLEZ MORALES', 41000, '358', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-25', 158095, 'PREVENTIVO', 'Filtro de Aceite', 'JOHN MAURICIO VÉLEZ MORALES', 31000, '358', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-25', 158095, 'PREVENTIVO', 'Filtro de Combustible', 'JOHN MAURICIO VÉLEZ MORALES', 33000, '358', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-25', 158095, 'PREVENTIVO', 'Mano de Obra Realizar Mantenimiento', 'JOHN MAURICIO VÉLEZ MORALES', 70000, '358', 0, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-11-05', 9336, 'CORRECTIVO', 'Cambio de sistema de alerta sonora, Instalacion  SIRENA', 'Zoro Morgan', 100000, NULL, 0, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-11-05', 9336, 'CORRECTIVO', 'Cambio de sistema de alerta sonora, Compra SIRENA nueva', NULL, 500000, NULL, 0, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 15001, 'PREVENTIVO', 'Filtro aceite', 'Lubripartes', 18000, 'FV41797', 0, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 15001, 'PREVENTIVO', 'aceite de motor', 'Lubripartes', 198000, 'FV41797', 0, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-04', 8128, 'PREVENTIVO', 'restauraicon de pinturas pernos, rines, soporte camilla', 'interno', 32500, NULL, 0, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 100540, 'PREVENTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONETA', 'Marllantas', 21008, 'PF-48', -24, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-21', 287175, 'PREVENTIVO', 'ALINEACION DIREC  - RUEDAS DELANT', 'Marllantas', 40337, '46099', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'CORRECTIVO', 'BALANCEO RIN LUJO 13´´  A  16´´', 'Marllantas', 25211, '46850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'PREVENTIVO', 'VALVULAS TB', 'Marllantas', 4202, '46850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 30, '46850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'PREVENTIVO', 'LT245 75R16 RF11 10-PR HANKOOK, LLANTA', 'Marllantas', 1262184, '46850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 142778, 'PREVENTIVO', 'PARCHE #1 AL #7', 'Macrollantas', 16806, 'AVQ6959', -144, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 142778, 'PREVENTIVO', 'PARCHE SOMBRILLA', 'Macrollantas', 8403, 'AVQ6959', -144, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-02', 142778, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Macrollantas', 16806, 'AVQ6959', -144, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-09', 165371, 'CORRECTIVO', 'PASTA DE FRENO DEL. KIA PICANTO', 'Marllantas', 185714, 'FE2-61,447', -168, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 122324, 'PREVENTIVO', 'PASTA DE FRENO(32945) LPR TRAS  HYUNDAI', 'Marllantas', 150420, '46852', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 42684, 'PREVENTIVO', 'LLANTA 175/60 R15 81H FRONWAY ECOGREEN66', 'Macrollantas', 384873, 'AVQ7055', -216, NULL
FROM vehicles WHERE placa = 'JRN202';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-11', 42684, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Macrollantas', 50420, 'AVQ7055', -216, NULL
FROM vehicles WHERE placa = 'JRN202';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-01', 116789, 'CORRECTIVO', 'Parcheo llanta, bombillo stop', 'Marllantas', 49590, '45481', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-01', 116787, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y', 'Marllantas', 16807, '45481', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-01', 116787, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 10, '45481', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'PREVENTIVO', 'ROTACION AUTO- CAMIONETA', 'Marllantas', 10, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'PREVENTIVO', 'ALINEACION DIREC  - RUEDAS DELANT', 'Marllantas', 40337, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-01', 101253, 'CORRECTIVO', 'PASTA DE FRENO DEL. NISSAN', 'Marllantas', 300000, 'FE2-61,166', -336, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-07', 88500, 'PREVENTIVO', 'PASTA DE FRENO DEL  D-MAX', 'Marllantas', 268908, '46581', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-20', 146449, 'CORRECTIVO', 'Piñon Tren Fijo, Piñon Tercera, Arandela Sincronismo Tercera, Gasolina Limpieza de Piezas, Silicona Gris, Kit de Clutch, Retenedor Inyectores, Aceite Caja 80W90 M/O D/M Caja para Reparar y Correguir Fuga de  aceie Motor', 'Mauricio Velez', 3045000, '227', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 20, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 22689, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'Cambio de pastas, ajuste liquido de frenos, plumillas', 'Marllantas', 368907, NULL, NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-04', 322365, 'PREVENTIVO', 'PASTA DE FRENO NISSAN URVAN', 'Marllantas', 210084, '47395', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-21', 287175, 'CORRECTIVO', 'VALVULAS TB', 'Marllantas', 4202, '46099', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-21', 287175, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 20, '46099', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-21', 287175, 'PREVENTIVO', 'BALANCEO RIN LUJO 13´´  A  16´´', 'Marllantas', 50421, '46099', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, '46760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'PREVENTIVO', 'MONTAJE AUTO Y CAMIONETA', 'Marllantas', 15126, '46760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'PREVENTIVO', 'ALINEACION DIREC  - RUEDAS DELANT', 'Marllantas', 40337, '46760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'PREVENTIVO', 'PASTA DE FRENO NISSAN URVAN', 'Marllantas', 225210, '46760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'PREVENTIVO', '185 60R14 04 H735 HANKOOK, LLANTA', 'Marllantas', 487394, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'PREVENTIVO', 'VALVULAS TB', 'Marllantas', 4202, '47381', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-26', 67322, 'PREVENTIVO', 'VALVULAS TB', 'Marllantas', 2101, 'FE260,992', -504, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-26', 67322, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 10, 'FE260,992', -504, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-26', 67322, 'PREVENTIVO', 'LT245/75R16 120/116R EVOLUTION ATT COOPER,', 'Marllantas', 605042, 'FE260,992', -504, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-06', 40762, 'CORRECTIVO', 'MONTAJE AUTO Y CAMIONETA', 'Marllantas', 30252, '50198', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-06', 40762, 'CORRECTIVO', 'VALVULAS TB', 'Marllantas', 4202, '50198', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-06', 40762, 'CORRECTIVO', '195R15 SUPER 2000 HIFLY, LLANTA', 'Marllantas', 613444, '50198', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'PARCHE RADIAL (RUBBERVULK)', 'Marllantas', 10084, '47638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-11', 94527, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y', 'Marllantas', 16807, '47638', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-04', 147924, 'PREVENTIVO', 'ACEITE RUBIA TIR 7400 15W40 TOTAL A', 'Marllantas', 282352, '49100', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-17', 37468, 'PREVENTIVO', 'PASTA DE FRENO DEL  NISSAN', 'Marllantas', 230252, '49528', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-01', 59800, 'PREVENTIVO', 'PASTA DE FRENO NISSAN URVAN', 'Marllantas', 180672, '53762', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', '185 60R14 82H KR203 KENDA, LLANTA', 'Marllantas', 384874, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 22689, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', 'VALVULAS TB', 'Marllantas', 4202, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-20', 132000, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 10, '49656', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-19', 85195, 'PREVENTIVO', 'PASTA DE FRENO DEL  D-MAX', 'Marllantas', 280672, '46011', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 241148, 'CORRECTIVO', '205 75R16 L-STRONG ILINK, LLANTA', 'Marllantas', 689074, '51960', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'MACROLLANTAS S.A.S', 30000, 'AVQ5933', -744, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-02', 50669, 'PREVENTIVO', 'PASTA DE FRENO DEL  NISSAN', 'Marllantas', 220168, '51930', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 30, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-05', 155896, 'CORRECTIVO', 'BATERIA TAB POLAR 47 1000 (2 unidades)', 'Marllantas', 882352, '258692', -768, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-21', 287175, 'PREVENTIVO', 'llantas cooper 245/75R16, rotaion, valvulas, balanceo, alineacion', 'Marllantas', 1153812, '46099', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 241148, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, '51960', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 241148, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 30, '51960', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-03', 241148, 'CORRECTIVO', 'VALVULAS TB', 'Marllantas', 6303, '51960', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-03', 124874, 'PREVENTIVO', 'Clutch, guaya clutch, 2 llantas 185/60R14, balanceo', 'Marllantas', 1610102, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-10', 149400, 'PREVENTIVO', 'BALANCEO RIN LUJO 13´´  A  16´´', 'Marllantas', 25211, '53135', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-10', 149400, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 50000, '53135', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-14', 100100, 'PREVENTIVO', 'PASTA DE FRENO DEL. D-MAX', 'Marllantas', 300000, '48527', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-14', 100100, 'PREVENTIVO', 'BALANCEO RIN LUJO 13´´ A 16´´', 'Marllantas', 25211, '48527', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-14', 100100, 'CORRECTIVO', 'MONTAJE AUTO Y CAMIONETA', 'Marllantas', 30252, '48527', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'VALVULAS TB', 'Marllantas', 4202, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'PASTA DE FRENO TRAS. RENAULT NEW MASTER', 'Marllantas', 305042, '257418', -1032, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-04', 130536, 'PREVENTIVO', 'LLANTA 225/65 R16C 112/110T ROVELO RCM-8', 'MACROLLANTAS S.A.S', 335294, 'AVQ6057', -1032, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'CORRECTIVO', '195R15 8PR SF-05 SUN FULL, LLANTA', 'Marllantas', 579830, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'CORRECTIVO', 'VALVULAS TB', 'Marllantas', 4202, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 22689, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'PREVENTIVO', 'ALINEACION DIREC  - RUEDAS DELANT', 'Marllantas', 40337, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-03', 48000, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 20, '51055', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-17', 58000, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONETA', 'Marllantas', 21008, '53318', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-17', 58000, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 11345, '53318', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-01', 113064, 'PREVENTIVO', 'LT245/75R16 RF11 10-PR HANKOOK, LLANTA', 'Marllantas', 1152942, '50951', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'ROTACION AUTO- CAMIONETA', 'Marllantas', 10, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'ALINEACION DIREC - CAMIÓN', 'Marllantas', 83193, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-12', 293731, 'PREVENTIVO', 'PASTA DE FRENO NISSAN NAVARA', 'Marllantas', 225210, '257994', -1128, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-04-08', 157771, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONETA', 'Marllantas', 21008, '258755', -1128, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, '48712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'LLANTA 205/70 R15C 106/104R GALLANT GL- (2 unidades)', 'MACROLLANTAS S.A.S', 586555, 'AVQ5933', -1200, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'BALANCEO ELECTRONICO (2 unidades)', 'MACROLLANTAS S.A.S', 25210, 'AVQ5933', -1200, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'BOMBILLO STOP SIN SOCKET 2 FILAMENTOS', 'MACROLLANTAS S.A.S', 10000, 'AVQ5933', -1200, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-22', 281419, 'PREVENTIVO', 'ALINEACION DE DIRECCION', 'MACROLLANTAS S.A.S', 60000, 'AVQ5933', -1200, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-04', 154500, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 260504, '25773', -1272, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-05', 82343, 'CORRECTIVO', 'BALANCEO ELECTRONICO (4 unidades, con descuento)', 'Marllantas', 45378, '57778', -1296, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-05', 82343, 'CORRECTIVO', 'ALINEACION DIREC- . RUEDAS DELANT (con descuento)', 'Marllantas', 40337, '57778', -1296, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-05', 82343, 'CORRECTIVO', 'VALVULAS TB (4 unidades)', 'Marllantas', 8404, '57778', -1296, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-05', 82343, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA (4 unidades)', 'Marllantas', 40, '57778', -1296, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-05', 82343, 'CORRECTIVO', '215/70R15 09/107S DV2 DELINTE, LLANTA (4 unidades)', 'Marllantas', 1371428, '57778', -1296, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-03-04', 154500, 'PREVENTIVO', 'KIT CALIPER DE MORDAZA', 'Marllantas', 360504, '25773', -1320, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-06', 40762, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, '50198', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-06', 40762, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 20, '50198', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-01', 113064, 'PREVENTIVO', 'BALANCEO RIN LUJO 13´´ A 16´´', 'Marllantas', 25211, '50951', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-01', 113064, 'PREVENTIVO', 'VALVULAS TB', 'Marllantas', 4202, '50951', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-01', 113064, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 30, '50951', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-08', 0, 'CORRECTIVO', 'Escanner, reparacion valvula AGR', 'Mauricio Velez', 170000, '237', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'ALINEACION DIREC  - RUEDAS DELANT', 'Marllantas', 40337, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', 'PASTA DE FRENO NISSAN URVAN', 'Marllantas', 220168, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-04', 333300, 'PREVENTIVO', '225 70R15C 107 103 R  KR100 8P TL KENDA,', 'Marllantas', 949580, '52925', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-24', 189600, 'PREVENTIVO', 'ALINEACION DIREC  - RUEDAS DELANT', 'Marllantas', 40337, '51685', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'CORRECTIVO', 'ALINEACION DE DIRECCION', 'MACROLLANTAS S.A.S', 60000, 'AVQ5357', -1680, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'CORRECTIVO', 'BALANCEO ELECTRONICO', 'MACROLLANTAS S.A.S', 60000, 'AVQ5357', -1680, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-19', 67360, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONΕΤΑ', 'Marllantas', 21008, 'FE2 - 60,821', -1824, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-26', 67322, 'PREVENTIVO', 'BALANCEO RIN LUJO 13"" A 16""', 'Marllantas', 12605, 'FE260,992', -1896, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONΕΤΑ', 'Marllantas', 218, 'FE2-60,735', -2088, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-01', 156349, 'CORRECTIVO', 'Revicion sitema de carga se ensambla alternador con respuesta positiva a adaptacion', 'BATERY REPUESTOS', 90000, '688', -2088, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-18', 389300, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 20, 'FE2-60,771', -2112, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-18', 389300, 'PREVENTIVO', 'BALANCEO RIN LUJO 13" A 16"', 'Marllantas', 25211, 'FE2-60,771', -2112, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-18', 389300, 'PREVENTIVO', 'VALVULAS TB', 'Marllantas', 4202, 'FE2-60,771', -2112, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-18', 389300, 'PREVENTIVO', '245/75R16 TERRAMAX AT ILINK, LLANTA', 'Marllantas', 957982, 'FE2-60,771', -2112, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-19', 80444, 'PREVENTIVO', 'PASTA DE FRENO NISSAN URVAN', 'Marllantas', 220168, '57349', -2136, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-20', 247571, 'PREVENTIVO', 'PASTA DE FRENO DEL RENAULT MASTER', 'Marllantas', 410084, '257418', -2160, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'BALANCEO ELECTRONICO (4 unidades)', 'MACROLLANTAS S.A.S', 50420, 'AVQ5357', -2184, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 246100, 'CORRECTIVO', '215/70R15 LMAX ILINK, LLANTA (2 unidades)', 'Marllantas', 672268, '256132', -2207, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 153215, 'CORRECTIVO', 'Soporte Rodillo Central Cardan', 'Mauricio Velez', 310000, '284', -2208, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 246100, 'CORRECTIVO', 'ROTACION AUTO-CAMIONETA', 'Marllantas', 10, '256132', -2208, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 141700, 'CORRECTIVO', 'PASTAS DE FRENO D-MAX', 'Marllantas', 245378, 'PF-36', -2208, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 141700, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONETA', 'Marllantas', 21008, 'PF-36', -2208, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 97336, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y CAMIONΕΤΑ', 'Marllantas', 21008, 'PF-37', -2208, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-05', 141700, 'CORRECTIVO', 'PARCHE RADIAL (RUBBERVULK)', 'Marllantas', 10084, 'PF-36', -2232, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 71573, 'CORRECTIVO', 'BALANCEO ELECTRONICO (2 unidades, con descuento)', 'Marllantas', 22689, '56006', -2304, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-08', 71573, 'CORRECTIVO', 'MONTAJE AUTO Y CAMIONETA (2 unidades)', 'Marllantas', 30252, '56006', -2304, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-09', 291690, 'PREVENTIVO', 'LLANTA 205/70 R15C 106/104R BLACKHAWK HL', 'Macrollantas', 636975, 'AVQ6735', -2304, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-09', 291690, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Macrollantas', 25210, 'AVQ6735', -2304, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-17', 389206, 'PREVENTIVO', 'PARCHE RADIAL (RUBBERVULK)', 'Marllantas', 10084, 'FE2-60,735', -2328, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 246100, 'CORRECTIVO', 'BALANCEO ELECTRONICO (4 unidades, con descuento)', 'Marllantas', 45378, '256132', -2352, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 246100, 'CORRECTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA (3 unidades)', 'Marllantas', 30, '256132', -2352, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-10', 246100, 'CORRECTIVO', 'VALVULAS TB (2 unidades)', 'Marllantas', 4202, '256132', -2352, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', '225/70R15 8PR SUPER 2000 HIFLY, LLANTA', NULL, 830252, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-24', 246937, 'PREVENTIVO', 'PASTA DE FRENOS (10233) NISSAN URVAN', 'Marllantas', 230252, '256549', -2374, NULL
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-01-31', 88728, 'PREVENTIVO', 'LLANTA 225/65 R16C 112/110T ROVELO RCM-8 (4 unidades)', 'MACROLLANTAS S.A.S', 1139496, 'AVQ5357', -2544, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'ALINEACION DIREC. - RUEDAS DELANT', 'Marllantas', 40337, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA', 'Marllantas', 20, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-10', 149400, 'CORRECTIVO', 'MONTAJE AUTO Y CAMIONETA', 'Marllantas', 30252, '53135', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-19', 316332, 'PREVENTIVO', 'VALVULAS TB', 'Marllantas', 4202, '45090', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-05', 232939, 'CORRECTIVO', 'KIT CLUTCH MASTER 1/14', 'IMPORTADORA NIPON S.A.', 1351723, '35448', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-11', 0, 'CORRECTIVO', 'CARGA A/C Y ACEITE, REMOCION Y REPARACION TUBERIA SOLDADURAS EN ALUMINIO DE LINEA DE LIQUIDO DEL AIRE CONDENSADOR A VALVULA DE EXPANSION', 'REMAIRES LTDA', 416500, 'DCE 26696', NULL, NULL
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'CORRECTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, 'FE2-46,760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-13', 20406, 'CORRECTIVO', 'ALINEACION DIREC. RUEDAS DELANT', 'Marllantas', 40337, 'FE2-46,760', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-16', 89500, 'CORRECTIVO', 'BALANCEO RIN LUJO 13" A 16"', 'Marllantas', 25211, 'FE2-46,850', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'CORRECTIVO', 'ALINEACION DIREC.- CAMIÓN', 'Marllantas', 83193, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 238066, 'CORRECTIVO', 'BALANCEO ELECTRONICO', 'Marllantas', 45378, 'FE2-48,712', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-09-26', 0, 'CORRECTIVO', NULL, NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'JQS528';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-10-03', 0, 'CORRECTIVO', NULL, NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'JQS239';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-18', 0, 'CORRECTIVO', 'Farola delantera izquerda', 'Mas Autos', 441749, '115', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2021-06-10', 0, 'CORRECTIVO', 'Bajada de discos delanteros 
 Y cambio de pastillas', 'TALLE JC', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2021-06-10', 0, 'PREVENTIVO', 'Rectificadas de campanas', 'REMACHADORA RIO BANDAS', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-17', 0, 'PREVENTIVO', 'SE HACE CAMBIO DE ACEITE DE MOTOR (20W50 TOTAL QUATZ), FILTROS (ACEITE Y AIRE); ADEMAS, SE HACE ALINEACION Y ROTACION DE LLANTAS. SE CAMBIAN LOS BUJES DE LA TIJERA ZUPERIOR IZQUIERDA POR DESGASTE.', 'Marllantas', 760699, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2021-10-16', 0, 'CORRECTIVO', 'Lámpara de techo blanca LED.
.Exploradora LED', 'TALLER ORION', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-03-09', 125000, 'CORRECTIVO', 'se cambia 1 rin 16 lamina 6 huecos', 'Marllantas', 1268908, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-04-12', 124662, 'PREVENTIVO', 'Cambio de aceite, filtro de aceite, aceite de caja/transmision, engrase', 'Marllantas', 282355, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-06-11', 0, 'PREVENTIVO', 'Cambio de aceite
.Mantenimiento tanque combustible
.Mantenimiento de frenos
.entre otros', 'MI ZONA DE PITS', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-06-15', 0, 'CORRECTIVO', '.Revisión aire acondicionado', '99% AIRES', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-08-25', 124923, 'CORRECTIVO', 'Cambio de 4 llantas, 255/70R16 alineacion y balanceo', 'Marllantas', 2309247, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-10-21', 0, 'CORRECTIVO', '.Manija puerta lateral', 'MI ZONA DE PITS', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-11-04', 125065, 'PREVENTIVO', 'CAMBIO DE ACEITE DEL MOTOR Y FILTRO DE ACEITE,GASOLINA Y ENGRASADA', 'Marllantas', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2022-11-04', 0, 'PREVENTIVO', 'mantenimiento general a la móvil para la revisión tecnomecanica.', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-01-04', 0, 'PREVENTIVO', 'Cambio de aceite y filtros', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-01-12', 0, 'PREVENTIVO', 'Alineacion, balanceo y rotacion', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-01-12', 0, 'PREVENTIVO', 'SE HACE CAMBIO DE ACEITE Y FILTROS (ACITE Y AIRE), SE HACE REVISION DE SUSPECION, REVISION DE FRENOS (SEPILLADA DE DISCOS). ALINEACION Y BALANCEO.', 'CLINIAUTOS QUIBDÓ', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-01-13', 0, 'PREVENTIVO', 'SE HACE CAMBIO DE ACEITE 15w40 Y FILTROS (AIRE, ACEITE Y GASOLINA), SE HACE REVISION DE FRENOS (aun con vida util, aproximadamente 70%) Y SUSPENSION', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-02-09', 0, 'PREVENTIVO', 'SE REALIZA CAMBIO DE ACEITE 20W50 Y FILTROS (ACEITE, AIRE Y COMBUSTIBLE) Y SE REALIZA ALINEACION, BALANCEO Y ROTACION DE LLANTAS', 'Dicar Serviteca', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-02-09', 0, 'CORRECTIVO', 'SE SUPLE LA BATERIA PRINCIPAL DE MOTOR, MARCA MAC 27-1250', 'LLANTAS Y FILTROS SINU', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-03-16', 0, 'CORRECTIVO', 'Cambio guardapolvos de los ejes', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-03-16', 0, 'CORRECTIVO', 'Se hace cambio de los bujes de la tijera superior y los guardapolvos del eje.', 'Carlos Quiroz', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-03-16', 0, 'CORRECTIVO', 'SE REPONEN DOS BOMBILLOS DE CABEZA PEQUEÑA Y DOS TAPAS BLANCAS LATERALES;ADEMAS, SE REEMPLAZA LA LLANTA DERECHA TRASERA QUE MOSTRBA GRAN DESGASTE.', 'CLINIAUTOS QUIBDÓ', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-05-02', 0, 'CORRECTIVO', 'SE CAMBIA LA MANIJA DE LA PUERTA DELANTERA DERECHA(PASAJERO)', 'LLANTAS Y FILTROS SINU', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-05-12', 125600, 'PREVENTIVO', 'SE REALIZA CAMBIO DE ACEITE DE MOTOR 15W40 Y FILTROS (ACEITE, AIRE MOTOR, COMBUSTIBLE), ENGRASE DE LAS PARTES Y REVISION GENERAL DE FRENOS.', 'Multicar Envigado', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-05-12', 125600, 'CORRECTIVO', 'SE REALIZA SINCRONIZACION DE MOTOR (CAMBIO DE CABLES DE ALTA, CAMBIO DE BUJIAS, LIMPIEZA CARBURADOR) CAMBIO DE ACEITE Y FILTROS', 'Multicar Envigado', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-06-05', 0, 'CORRECTIVO', 'Se hace cambio del bombin del freno trasero derecho, el cual presentaba chorreo de aceite funcionando desproporcionalmente. Solucionado', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-06-06', 0, 'PREVENTIVO', 'Revision Tecnicomecanica', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-06-17', 0, 'CORRECTIVO', 'Se reemplazan los dos bombin del sistema de embrague (auxiliar y ppal)debido a fuga de aceite; ademas, se cambia el aceite hidraulico.', 'Carlos Quiroz', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-25', 0, 'PREVENTIVO', 'Mantenimiento frenos delanteros y traseros
Alineacion y balanceo,
 engrase chasis', 'Autocenter serviteca', 186000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-25', 13078, 'PREVENTIVO', 'Se cambia aceite 10w30 supreme sp y filtro de aceite. Alinecion y balanceo de llantas; ademas, engrase de transmision(cardan). Se realizo mtto preventivo de frenos, engrase de rodamientos, partes en buen estado.', 'Autocenter serviteca', 187000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-07-25', 0, 'PREVENTIVO', 'Se cambia aceite 20w50 chevron havoline premium SL, filtro de aceite, alineacion - balanceo y engrase de las partes; ademas, se realiza mtto completo a sistema de freno, aun con buen estado los componentes.', 'LLANTAS Y FILTROS SINU', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-02', 0, 'CORRECTIVO', 'Se suple exploradora trasera', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-12-28', 0, 'CORRECTIVO', 'Vehiculo es recogido del terminal aéreo José Maria Cordoba, Rionegro y llevado a taller para reparación de camilla y silla camilla. Teniendo en cuenta las fechas de cierre e inicio de año, la disponibilidad de repuestos y recursos fue limitada', 'Rectificadora Suroeste', 500000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-12-30', 0, 'CORRECTIVO', 'Revision electrica y reparacion de luces internas y luz fria', 'Battery repuestos', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-01-09', 0, 'CORRECTIVO', 'Reparacion de latoneria y pintura', 'Dario Pintor', 952000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-22', 0, 'CORRECTIVO', 'SE HACE CAMBIO DE EMBRAGUE Y LAS DOS BOMBAS DE EMBRAGUE.', 'CLINIAUTOS QUIBDÓ', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-24', 0, 'PREVENTIVO', 'SE HACE CAMBIO DE ACEITE 15W40, LOS TRES FILTROS, REVISION TOTAL DE FRENOS Y ALINEACION Y BALANCEO.', 'Repuestos el Santi', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-26', 188714, 'CORRECTIVO', 'ALINEACION DIREC. RUEDAS DELANT', NULL, 40337, '40049', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-26', 188714, 'CORRECTIVO', 'BALANCEO ELECTRONICO', NULL, 45378, '40049', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-26', 188714, 'CORRECTIVO', 'ROTACION AUTO-CAMIONETA', NULL, 10, '40049', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-08-28', 0, 'CORRECTIVO', 'Cambio de bateria principal 1000AMP', 'SURTIREPUESTOS', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-15', 0, 'PREVENTIVO', 'SE HACE CAMBIO DE ACEITE 15W40 MOBIL DELVAC PARA 5K KM O 8 MESES; ADEMAS, FILTRO DE ACEITE, SEDIMENTADOR Y AIRE DE MOTOR / SE REVISO FRENOS Y LIQUIDOS Y ESTAN EN BUEN ESTADO.', 'MI ZONA DE PITS', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-15', 0, 'PREVENTIVO', 'Cambio de correa de accesorios', 'MI ZONA DE PITS', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-19', 1200, 'CORRECTIVO', 'ALINEACION DIREC. RUEDAS DELANT', 'AEROSANIDAD S.A.S. Y/O JUAN CARLOS LOPEZ', 40, '41052', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-19', 1200, 'CORRECTIVO', 'BALANCEO ELECTRONICO', 'AEROSANIDAD S.A.S. Y/O JUAN CARLOS LOPEZ', 45, '41052', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-19', 1200, 'PREVENTIVO', 'ALINEACION DIREC. - RUEDAS DELANT balanceo, rotacion', 'Marllantas', 135725, '41052', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-09-21', 0, 'CORRECTIVO', 'Cambio de bomba de clutch, aux, cambio bombca de clutch aux, kit embrague, liquido de frenos, MO', 'CLINIAUTOS QUIBDÓ', 1848400, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-13', 0, 'CORRECTIVO', 'Reparacion de 2 luces laterales blancas, Revisión general de luces de emergencia, Reparacion cable de start del arranque, Pendiente de mantenimiento de arranque, se evidencia deterioro en el bendix.', 'Battery repuestos', 185000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-10-13', 227111, 'CORRECTIVO', 'PARCHEO SELLOMATICO DE AUTO Y', 'Marllantas', 16807, '41853', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-10-20', 0, 'CORRECTIVO', 'se parchan (reparan) 3 llantas que presentaban fuga. (dos traseras y la de repuesto)', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 0, 'CORRECTIVO', 'SE CAMBIAN LAS TERMINALES DE LOS DOS LADOS', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 0, 'PREVENTIVO', 'cambio de aceite 15w40 y filtros (aceite, aire de motor), engrase de las partes y revision general de frenos(SE LIMPIAN Y TENSIONAN).', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-01', 0, 'CORRECTIVO', 'SE SUPLE LA SEGUNDA BATERIA DEL VEHICULO 1100AMP', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-24', 70274, 'CORRECTIVO', 'Reparacion electrica motor de arranque', 'Taxivan', 100000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-10', 0, 'CORRECTIVO', 'SE CAMBIAN LAS BUJIAS Y LOS CABLES DE ALTA', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-11-24', 0, 'CORRECTIVO', 'Se suple bateria SECUNDARIA de 1000AMP', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-12-05', 65014, 'PREVENTIVO', 'cambio de aceite 15w40 y filtros (aceite, gasolina y aire de motor), engrase de las partes y revision general de frenos.', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-12-05', 0, 'PREVENTIVO', 'sincronizacion de motor, cambio de cables de alta, bujias y limpieza al sistema de inyeccion, revision de carburador.', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2023-12-23', 0, 'CORRECTIVO', 'Cambio de bateria principal', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-25', 70274, 'PREVENTIVO', 'Cambio de aceite 20W50, filtro de aceite filtro de aite revision de fluidos y niveles', 'Taxivan', 205462, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-08-18', 70274, 'CORRECTIVO', 'Cambio de 2 llantas', 'Particular', 850000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-10', 98001, 'CORRECTIVO', 'Bombillos luces medias led', 'BATERY REPUESTOS', 24000, '668', 0, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Empaque tapa valvulas', 'Lubripartes', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Corrrea continental 17420', 'Lubripartes', 35000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Correa de ventilador', 'Lubripartes', 35000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'manguera multiuso 3/4 caucho lona', 'Lubripartes', 18700, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Correa A34', 'Lubripartes', 8000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Manguera multiusos caucho-lona 5/16', 'Lubripartes', 12000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Abrazadera metalica titan', 'Lubripartes', 7000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Manguera tramo recto 1m Agua/aire 70PSI 1 12', 'Lubripartes', 60000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-02-28', 0, 'CORRECTIVO', 'Cambio bomba de combustible,', NULL, 150000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-14', 13562, 'PREVENTIVO', 'Cambio de aceite, filtro de aceite y revision general.', 'Lubripartes', 194000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-22', 0, 'PREVENTIVO', 'Revision Tecnicomecanica', 'CERTICAR', 284500, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-03-27', 0, 'PREVENTIVO', 'Cambio de aceite y filtro de aceite', 'LLANTAS Y FILTROS SINU', 182000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-01', 13632, 'CORRECTIVO', 'Cambio de bateria principal y chequeo de alternador,', 'Bateria ICOBA', 420000, NULL, NULL, 'Alternador carga con normalidad'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-06', 0, 'CORRECTIVO', 'Revision aire acondicionado, cambio ventilador, plato de valvulas, filtro secador', 'Taller 99% Aires', 1230000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-12', 0, 'PREVENTIVO', 'Bateria MAC GOLD 27R 1250', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-04-12', 0, 'CORRECTIVO', 'Cambio de llantas 4', 'LLANTAS Y FILTROS SINU', 3250000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-10', 98001, 'CORRECTIVO', 'Bombillo stop', 'BATERY REPUESTOS', 6000, '668', 0, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-08', 0, 'CORRECTIVO', 'Manto y reparación, cambio de bujias, cables de alta, cilindros de frenos traseros', 'Jean Carlo Taller JR', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 0, 'PREVENTIVO', 'Revision de frenos pastillas y bandas', 'Serviteca Septima Avenida', 71400, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 0, 'PREVENTIVO', 'Revision de suspension y fugas, ajuste de soporte de cardan', 'Serviteca Septima Avenida', 40103, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 0, 'PREVENTIVO', 'recarga gas refrierante', 'Serviteca Septima Avenida', 70000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 0, 'PREVENTIVO', 'Mantenieminto AC,', 'Serviteca Septima Avenida', 160000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 0, 'CORRECTIVO', 'Plumilla No 16', 'Serviteca Septima Avenida', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-05-21', 0, 'CORRECTIVO', 'Plumilla No 18', 'Serviteca Septima Avenida', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'Cambio de aceite, filtro de aceite', 'Marllantas', 315716, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'CORRECTIVO', 'cambio de balancin de ballestas de amortiguacion.', 'Marllantas', 451260, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'Rotacion alineacion y balanceo de ruedas', 'Marllantas', 105883, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'ALINEACION DIREC  - RUEDAS DELANT', 'Marllantas', 40337, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'ENGRASE', 'Marllantas', 15126, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ 5000 SN 20W50  A', 'Marllantas', 255464, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'FILTRO DE ACEITE SELLADO LAR-1 CAMPEROS', 'Marllantas', 30252, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'CORRECTIVO', 'BALANCIN DE MUELLE', 'Marllantas', 260504, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'Marllantas', 140336, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-06-25', 0, 'PREVENTIVO', 'MANO DE OBRA MECANICA FRENOS', 'Marllantas', 50420, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-02', 0, 'CORRECTIVO', 'Cambio de aceite por reparacion de motor', 'Jorge Juris Mecanico', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-02', 0, 'CORRECTIVO', 'Reparacion, limpieza y sondeo de radiador', 'Jorge Juris Mecanico', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-02', 0, 'CORRECTIVO', 'Cambio de culata, cambio empaque de culata, gorros,', 'Jorge Juris Mecanico', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-07-22', 0, 'CORRECTIVO', 'Reparacion y mantenimiento motor de arranque', 'Particular', 280000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-10', 98001, 'CORRECTIVO', 'Servicio técnico (MO) Cambio swiche principal y revicion lineas', 'BATERY REPUESTOS', 90000, '668', 0, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 108827, 'CORRECTIVO', 'Bendix arranque', 'Jorge Iván Trujillo Cárdenas', 140000, '920', 20, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 108827, 'CORRECTIVO', 'porta escobillas', 'Jorge Iván Trujillo Cárdenas', 45000, '920', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-27', 8958, 'PREVENTIVO', 'Cambio de aceite y filtro de aceite', NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-30', 14100, 'PREVENTIVO', 'Aceite de motor Delvac MX 15W40', 'Lubripartes', 14000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-30', 14100, 'PREVENTIVO', 'Filtro de aceite Mazda 626-B2000', 'Lubripartes', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-30', 14100, 'PREVENTIVO', 'Filtro gasolina BT50/B2600', 'Lubripartes', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-09-30', 14100, 'PREVENTIVO', 'Filtro de aire motor premium', 'Lubripartes', 120000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'BATERIA VARTA', 'S.A.G', 690000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'AMORTIGUADORES DELANTEROS', 'S.A.G', 460000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'AMORTIGUADORES TRASEROS', 'S.A.G', 300000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'BUJES DE TIJERA SUPERIORES E INFERIORES', 'S.A.G', 390000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'SERVICIO DE PRENSA TALLER INDUSTRIAL', 'S.A.G', 300000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CAUCHOS DE BARRA ESTABILIZADORA', 'S.A.G', 40000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'RODAMIENTOS DELANTEROS', 'S.A.G', 208000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'RETENEDORES DE RODAMIENTOS', 'S.A.G', 60000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'GRASA', 'S.A.G', 24000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'DESENGRASANTE', 'S.A.G', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'COMBUSTIBLE PARA LIMPIEZA', 'S.A.G', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'ALINEACION Y BALANCEO', 'S.A.G', 95000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CAJA DE DIRECCION', 'S.A.G', 2280000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'ACEITE HIDRAHULICO', 'S.A.G', 34000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CORREAS EXTERNAS', 'S.A.G', 124000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'ACEITE DE CAJA 80W 90', 'S.A.G', 204000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'BOMBA DE CLUTCH AUXILIAR', 'S.A.G', 160000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'LIMPIADOR DE FRENOS', 'S.A.G', 35000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'EMPAQUE TAPA VALVULAS', 'S.A.G', 40000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'DYM AMORTIGUADORES DELANTEROS-MOGO', 'S.A.G', 225000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'DYM AMORTIGUADORES TRASEROS-CAMBIO-', 'S.A.G', 216000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'DYM DE TIJERAS', 'S.A.G', 450000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CAMBIO DE CAUCHOS', 'S.A.G', 90000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CAMBIO RODAMIENTOS DELANTEROS', 'S.A.G', 270000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'DYM CAJA DE DIRECCION', 'S.A.G', 360000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'ENGRASAR CRUCETAS DE CARDAN', 'S.A.G', 90000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'DYM CORREA ACCESORIOS Y/O PATINES TENSO', 'S.A.G', 180000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CAMBIO DE ACEITE DE CAJA Y DIFERENCIAL', 'S.A.G', 90000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CAMBIO BOMBA AUXILIAR CLUTCH', 'S.A.G', 135000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'REVISION FRENOS GENERALES', 'S.A.G', 225000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'CAMBIO DE EMPAQUE TAPA VALVULAS', 'S.A.G', 225000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'PLUMILLA 18', 'S.A.G', 30000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'PLUMILLA 22', 'S.A.G', 70000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'MUELLES TRASEROS -BUJES Y SEPARADORES', 'S.A.G', 390000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'ESFERAS INFERIORES', 'S.A.G', 100000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'BIELETAS DELANTERAS', 'S.A.G', 150000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'REPARACION DE AIRE ACONDICIONADO', 'S.A.G', 1330000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'ΜΑΤΕΝΙΜΙ CORRECTIVO DE LAMINA Y PINTUR', 'S.A.G', 25960000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 0, 'CORRECTIVO', 'NORMALIZACION REPARACION AIRPLAN', 'S.A.G', NULL, NULL, NULL, 'DEVOLUCIÓN valor_original: -36070000'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'SOPORTE DE CAJA TRASERO', 'S.A.G', 336000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'KIT DE CLUTCH', 'S.A.G', 630000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'RODILLO DE VOLANTE', 'S.A.G', 43000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'RETEN DE CIGÜEÑAL TRASERO', 'S.A.G', 79000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'BUJES DE TIJERA INFERIOR', 'S.A.G', 90000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'SERVICIO DE PRENSA TALLER INDUSTRIAL', 'S.A.G', 60000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'ACEITE DE CAJA 80W 90', 'S.A.G', 204000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'EMPAQUE TAPA VALVULAS', 'S.A.G', 81000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'DESENGRASANTE', 'S.A.G', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'REVISION FRENOS GENERALES', 'S.A.G', 225000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'LIMPIADOR DE FRENOS', 'S.A.G', 35000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'DYM DE TIJERAS INFERIORES', 'S.A.G', 225000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'ALINEACION Y BALANCEO', 'S.A.G', 95000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'DYM DE CAJA-CAMBIO DE KIT DE EMBRAGUE /', 'S.A.G', 540000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'CAMBIO DE SOPORTE DE CARDAN', 'S.A.G', 135000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'CAMBIO SOPORTE CAJA', 'S.A.G', 180000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'EMPACAR CAJA DE DIRECCION', 'S.A.G', 850000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'DYM CAJA DE DIRECCION', 'S.A.G', 360000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'ACEITE HIDRAHULICO', 'S.A.G', 34000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'CAMBIO DE EMPAQUE TAPA VALVULAS', 'S.A.G', 225000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'CAMBIO ACEITE CAJA -TRANSMISION TRASERA', 'S.A.G', 90000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'REPARACION DE AIRE ACONDICIONADO', 'S.A.G', 1805000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'REPARARACION DE PEDALERA DE CLUTCH', 'S.A.G', 65000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'CEPILLADA DE VOLANTE', 'S.A.G', 117000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'PINES QUE SUJETAN EL RODILLO DE CLUTCH', 'S.A.G', 66000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'EMPACAR MORDAZAS DE FRENOS DELANTERO!', 'S.A.G', 286000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'MUELLES TRASEROS', 'S.A.G', 390000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'MANTENIMIENTO DE LAMINA Y PINTURA', 'S.A.G', 25278000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-10-08', 8132, 'CORRECTIVO', 'NORMALIZACION REPARACION AIRPLAN', 'S.A.G', NULL, NULL, NULL, 'DEVOLUCIÓN valor_original: -32208000'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'MANTENI CORRECTIVO LAMINA Y PINTURA', 'S.A.G', 34536000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'REPARAR MOTOR', 'S.A.G', 4800000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'LLANTAS', 'S.A.G', 1740000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'BOMBA DE AGUA', 'S.A.G', 290000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'KIT DE CLUTCH', 'S.A.G', 1820000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'AMORTIGUADORES DELANTEROS', 'S.A.G', 560000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'BIELETAS', 'S.A.G', 170000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'CABLES DE ALTA', 'S.A.G', 230000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'SENSOR CKP', 'S.A.G', 232000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'KIT DE DISTRIBUCCION', 'S.A.G', 495000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'SENSOR DE DISTRIBUIDOR', 'S.A.G', 155000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'TAPA DE DISTRIBUCCION', 'S.A.G', 532000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'JUEGO DE BUJIAS', 'S.A.G', 247000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'EMPAQUETADURA DE MOTOR', 'S.A.G', 396000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'SERVICIO DE RECTIFICADORA', 'S.A.G', 3415000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'TANQUE DE RADIADOR Y TAPA', 'S.A.G', 392000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'SOLDADURA BASE DE ALTERNADOR', 'S.A.G', 75000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'FILTRO DE ACEITE', 'S.A.G', 30000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'ACEITE DE MOTOR 20W 50', 'S.A.G', 238000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'MANGUERAS DE AGUA', 'S.A.G', 286000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'REPARACION DE ARRANQUE', 'S.A.G', 190000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'SENSOR MAF', 'S.A.G', 897000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'TOMPO DE LUBRICACION', 'S.A.G', 156000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'REPARACION DE AIRE ACONDICIONADO', 'S.A.G', 1316000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'SILICONA', 'S.A.G', 30000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'COMBUSTIBLE PARA LIMPIEZA', 'S.A.G', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'DYM AMORTIGUADORES DELANTEROS-MOGC', 'S.A.G', 262500, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'DYM DE BARRA ESTABILIZADORA- CAMBIO BIE', 'S.A.G', 210000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'COMBUSTIBLE', 'S.A.G', 50000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'POLARIZADO PARABRISAS DELANTERO', 'S.A.G', 247000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'INVERSOR 1500 WATT', 'S.A.G', 1180000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'GUAYA DE ACELERADOR E INSTALACION', 'S.A.G', 195000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-11-26', 8958, 'CORRECTIVO', 'NORMALIZAICON REPARACION AIRPLAN', 'S.A.G', NULL, NULL, NULL, 'DEVOLUCIÓN valor_original: -55392500'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'AMORTIGUADORES TRASEROS', 'S.A.G', 500000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'MUELLES TRASEROS', 'S.A.G', 365000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'CAUCHOS DE BARRA ESTABILIZADORA', 'S.A.G', 50000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'BIELETAS DELANTERAS', 'S.A.G', 50000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'BOMBA PPAL DE CLUTCH', 'S.A.G', 125000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'BOMBA AUXILIAR DE CLUTCH', 'S.A.G', 230000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'TAPA DE RADIADOR', 'S.A.G', 110000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'EMPAQUE TAPA VALVULAS Y MEDIA LUNAS', 'S.A.G', 196000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'GUARDAPOLVOS DE EJE', 'S.A.G', 380000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'EMPAQUE DE CUERPO DE ACELERACION', 'S.A.G', 30000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'ESFERA SUPERIOR IZQUIERDA', 'S.A.G', 155000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'MANGUERA Y ABRAZADERA', 'S.A.G', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'ALINEACION Y BALANΕΟ', 'S.A.G', 95000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'REPARACION DE AIRE ACONDICIONADO', 'S.A.G', 690000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'MANTENIMIENTO CORRECTIVO LAMINA Y PINT', 'S.A.G', 22220000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'DYM AMORTIGUADORES TRASEROS-CAMBIO-', 'S.A.G', 210000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'CAMBIO DE EMPAQUE TAPA VALVULAS', 'S.A.G', 420000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'CAMBIO BOMBAS DE CLUTCH', 'S.A.G', 262500, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'LIQUIDO DE FRENOS', 'S.A.G', 60000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'CAMBIO DE BIELETAS Y CAUCHOS DE BARRA', 'S.A.G', 199500, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'DYM DE MORDAZAS-PASADORES-REVISION FRE', 'S.A.G', 315000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'LIMPIADOR DE FRENOS', 'S.A.G', 35000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'DYM DE RADIADOR-CAMBIO DE MANGUERA', 'S.A.G', 105000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'CAMBIO DE ESFERAS - SUPERIOR - INFERIOR', 'S.A.G', 168000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2024-12-03', 14100, 'CORRECTIVO', 'NORMALIZAICON REPARACION AIRPLAN', 'S.A.G', NULL, NULL, NULL, 'DEVOLUCIÓN valor_original: -26991000'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-25', 8620, 'PREVENTIVO', NULL, NULL, NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'PREVENTIVO', 'Cambio de aceite de motor', 'LLANTAS Y FILTROS SINU', 170000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'PREVENTIVO', 'Cambio de filtro de aceite', 'LLANTAS Y FILTROS SINU', 19327, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'PREVENTIVO', 'Cambio de filtro de aire', 'LLANTAS Y FILTROS SINU', 45378, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'PREVENTIVO', 'Test de estado de bateria', 'LLANTAS Y FILTROS SINU', 4201, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'PREVENTIVO', 'Inflado y calibracion de llantas con nitrogeno', 'LLANTAS Y FILTROS SINU', 6722, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'CORRECTIVO', 'Liquido de frenos aleman', 'Frenos de seguridad mancuso', 90000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'CORRECTIVO', 'Cambio de Cilindro de freno', 'Frenos de seguridad mancuso', 120000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'CORRECTIVO', 'Desengrase', 'Frenos de seguridad mancuso', 5500, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'CORRECTIVO', 'Mano de obra frenos', 'Frenos de seguridad mancuso', 25000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'CORRECTIVO', 'Relay 70 amp, reparacion direccionales y pito', 'Servielectricos EC', 30000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'CORRECTIVO', 'Conector', 'Servielectricos EC', 20000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-07-03', 9225, 'CORRECTIVO', 'MO', 'Servielectricos EC', 10000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-21', 14683, 'CORRECTIVO', 'Revisión aire acondicionado, suministro e instalación motor blower ymantenimiento general, corrección rejillas de ventilación, vacío deaceite del compresor y carga de gas.', 'Particular', 1380400, NULL, NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-03', 124156, 'PREVENTIVO', 'Llantas Hankook 215/70R15C RA18 8PR (x2)', 'COEXITO S.A.S.', 855509, '315E30821', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-03', 124156, 'PREVENTIVO', 'Válvulas neumático TR413 (x2)', 'COEXITO S.A.S.', 3362, '315E30821', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-03', 0, 'CORRECTIVO', 'Batería SLI Sure Top CCA (-18) 710 27(+-)', 'COEXITO S.A.S.', 444807, '315E30822', NULL, NULL
FROM vehicles WHERE placa = '?';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-03', 176254, 'PREVENTIVO', 'Llantas Wanli 185/60R14 SP026 4PR (x2)', 'COEXITO S.A.S.', 263285, '315E30823', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-03', 176254, 'PREVENTIVO', 'Válvulas neumático TR413 (x2)', 'COEXITO S.A.S.', 3362, '315E30823', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-03', 0, 'CORRECTIVO', 'Batería SLI Sure Top CCA (-18) 730 LN3', 'COEXITO S.A.S.', 522563, '315E30824', NULL, NULL
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-09', 176286, 'PREVENTIVO', 'MO Balanceo por rueda automóvil (x4)', 'COEXITO S.A.S.', 43696, '315E30979', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-09', 176286, 'PREVENTIVO', 'MO Alineación automóvil', 'COEXITO S.A.S.', 47901, '315E30979', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-17', 0, 'PREVENTIVO', 'Filtro de aire', 'Nissan', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'KIF071';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-17', 0, 'PREVENTIVO', 'Filtro de motor', 'Nissan', NULL, NULL, NULL, NULL
FROM vehicles WHERE placa = 'KIF071';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-19', 234000, 'CORRECTIVO', 'Batería SLI Sure Top CCA (-18) 640 27(+-)', 'COEXITO S.A.S.', 463860, '516E22108', NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-12-19', 405202, 'CORRECTIVO', 'Batería SLI Sure Top CCA (-18) 650 34(-+)', 'COEXITO S.A.S.', 453781, '515E27250', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 264474, 'CORRECTIVO', 'Conexión sistema licuadora y recuperación elevavidrios', 'Jorge Iván Trujillo Cárdenas', 140000, '900', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 299299, 'PREVENTIVO', 'MO Alineación camioneta', 'COEXITO S.A.S.', 82353, '311E16050', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 299299, 'PREVENTIVO', 'MO Balanceo por rueda camioneta (x4)', 'COEXITO S.A.S.', 67228, '311E16050', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 299299, 'CORRECTIVO', 'MO Cambio terminal de dirección', 'COEXITO S.A.S.', 55462, '311E16050', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 299299, 'PREVENTIVO', 'MO Revisión de frenos', 'COEXITO S.A.S.', 58824, '311E16050', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 299299, 'PREVENTIVO', 'MO Limpieza y calibración de aire acondicionado', 'COEXITO S.A.S.', 145326, '311E16050', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 299299, 'CORRECTIVO', 'Terminal corto', 'COEXITO S.A.S.', 116875, '311E16050', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-07', 70271, 'CORRECTIVO', 'PARCHE #1 AL #7', 'MACROLLANTAS S.A.S', 16806.72, 'AVQ8817', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-07', 70271, 'PREVENTIVO', 'BALANCEO ELECTRONICO', 'MACROLLANTAS S.A.S', 12605.04, 'AVQ8817', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-07', 70271, 'PREVENTIVO', 'NITROGENO AUTO-CAMIΟΝΕΤΑ', 'MACROLLANTAS S.A.S', 0, 'AVQ8817', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-07', 70271, 'PREVENTIVO', 'MONTAJE DE LLANTAS AUTO', 'MACROLLANTAS S.A.S', 0, 'AVQ8817', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 178275, 'PREVENTIVO', 'M/O Mantenimiento Ventilador de Radiador', 'JOHN MAURICIO VÉLEZ MORALES', 60000, '382', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 127451, 'PREVENTIVO', 'Filtro de Aire', 'JOHN MAURICIO VÉLEZ MORALES', 46000, '383', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 127451, 'PREVENTIVO', 'Filtro de Aceite', 'JOHN MAURICIO VÉLEZ MORALES', 33000, '383', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 127451, 'PREVENTIVO', 'Filtro de Combustible', 'JOHN MAURICIO VÉLEZ MORALES', 67500, '383', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 127451, 'PREVENTIVO', 'Mano de Obra Realizar Mantenimiento', 'JOHN MAURICIO VÉLEZ MORALES', 70000, '383', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 163127, 'CORRECTIVO', 'Kit de Embrague Valeo', 'JOHN MAURICIO VÉLEZ MORALES', 788000, '384', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 180000, 'CORRECTIVO', 'MO Mantenimiento frenos delanteros y traseros', 'COEXITO S.A.S.', 163866, '311E16203', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 180000, 'CORRECTIVO', 'Disco de frenos delantero (x2)', 'COEXITO S.A.S.', 399158, '311E16203', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 180000, 'CORRECTIVO', 'Pastilla de frenos delantero', 'COEXITO S.A.S.', 147059, '311E16203', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 180000, 'CORRECTIVO', 'Limpiador de frenos Xpert 524ml', 'COEXITO S.A.S.', 18403, '311E16203', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-15', 316795, 'CORRECTIVO', 'KIT REPARACION ARRANQUE', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 380000, 'FV 3986', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-15', 316795, 'CORRECTIVO', 'MANO DE OBRA REPARACION ARRANQUE', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 300000, 'FV 3986', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 67910, 'CORRECTIVO', 'Swiche', 'Jorge Iván Trujillo Cárdenas', 10000, '919', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 67910, 'CORRECTIVO', 'Terminales', 'Jorge Iván Trujillo Cárdenas', 1600, '919', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 67910, 'CORRECTIVO', 'Recuperacion luces laterales blancas con mantenimiento a circuito electronico (M.O)', 'Jorge Iván Trujillo Cárdenas', 180000, '919', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 151867, 'CORRECTIVO', 'CAJA TERMOSTATICA ORIGINAL', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 598000, 'FV 3988', NULL, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 151867, 'CORRECTIVO', 'TUBO REFRIGERACION ORIGINAL', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 850000, 'FV 3988', NULL, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 151867, 'CORRECTIVO', 'MANGUERA RETORNO REFRIGERANTE ORIGINAL', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 250000, 'FV 3988', NULL, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 151867, 'CORRECTIVO', 'DEPOSITO C/TAPA REFERIGERACION ORIGINAL', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 325000, 'FV 3988', NULL, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 151867, 'CORRECTIVO', 'SENSOR TEMPERATURA ORIGINAL', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 180000, 'FV 3988', NULL, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 151867, 'CORRECTIVO', 'GALON DE REFIGERANTE MOTRIO', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 180000, 'FV 3988', NULL, NULL
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 108827, 'CORRECTIVO', 'Rodamientos', 'Jorge Iván Trujillo Cárdenas', 56000, '920', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 108827, 'CORRECTIVO', 'M.O Desmonte, reparacion y montaje de arranque', 'Jorge Iván Trujillo Cárdenas', 140000, '920', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 108827, 'CORRECTIVO', 'Desmonte ,reparacion y montaje de arranque para funcionamiento', 'Jorge Iván Trujillo Cárdenas', 140000, '920', NULL, 'CUENTA DE COBRO 920 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'Swiche elevavidrios', 'Jorge Iván Trujillo Cárdenas', 80000, '921', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'Borne bateria', 'Jorge Iván Trujillo Cárdenas', 18000, '922', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'terminales', 'Jorge Iván Trujillo Cárdenas', 1600, '922', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'terminal para soldar', 'Jorge Iván Trujillo Cárdenas', 8000, '922', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'Mxifucibles', 'Jorge Iván Trujillo Cárdenas', 24000, '922', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'M.O Recuperación elevavidrios, bornes y sistema', 'Jorge Iván Trujillo Cárdenas', 130000, '922', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-17', 300280, 'PREVENTIVO', 'Plumilla Aeroplus 22 unidad (x2)', 'COEXITO S.A.S.', 70252, '311E16284', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-17', 300280, 'PREVENTIVO', 'Líquido limpiaparabrisas 500ml', 'COEXITO S.A.S.', 5210, '311E16284', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Llanta Laufenn 225/65R17T LD01 4PR (x2)', 'COEXITO S.A.S.', 668954, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'MO Alineación camioneta', 'COEXITO S.A.S.', 88235, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'MO Balanceo por rueda camioneta (x4)', 'COEXITO S.A.S.', 67228, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'MO Cambio filtro de cabina', 'COEXITO S.A.S.', 25922, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'MO Revisión de frenos', 'COEXITO S.A.S.', 44538, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'MO Limpieza y calibración de aire acondicionado', 'COEXITO S.A.S.', 178645, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Aceite Diesel SAE 5W-30 ACEA C3 1GA (x2)', 'COEXITO S.A.S.', 352606, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Filtro de cabina Chev Trailblazer', 'COEXITO S.A.S.', 10168, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Válvula neumático TR413 (x2)', 'COEXITO S.A.S.', 3362, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Líquido limpiaparabrisas 500ml (x2)', 'COEXITO S.A.S.', 10420, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Filtro de aceite', 'COEXITO S.A.S.', 47813, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Tuercas de seguridad', 'COEXITO S.A.S.', 46050, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Filtro de aire', 'COEXITO S.A.S.', 63750, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 59408, 'PREVENTIVO', 'Artículos CVI', 'COEXITO S.A.S.', 213180, '311E16320', NULL, NULL
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 129859, 'CORRECTIVO', 'Batería SLI Sure Top CCA (-18) 710 27(-+)', 'COEXITO S.A.S.', 514349, '311E16323', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 129859, 'PREVENTIVO', 'MO Cambio de filtro de cabina', 'COEXITO S.A.S.', 18487, '311E16323', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 129859, 'PREVENTIVO', 'MO Diagnóstico scanner', 'COEXITO S.A.S.', 50420, '311E16323', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 129859, 'PREVENTIVO', 'MO Limpieza y calibración de aire acondicionado', 'COEXITO S.A.S.', 124369, '311E16323', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-19', 129859, 'PREVENTIVO', 'Filtro de cabina KIA Sportage', 'COEXITO S.A.S.', 10168, '311E16323', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'GUAYA FRENO DE MANO HOMOLOGADA', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 290000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'JGO. PASTILLAS DELANTERAS HOMOLOGADAS', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 160000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'GUARDAPOLVO MORDAZA DELANTERO', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 76000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'PINTA LIQUIDO DE FRENOS', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 40000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'MANO DE OBRA CAMBIO RODAMIENTO RUEDA DELANTERA', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 80000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'SERVICIO DE PRENSA CAMBIO RODAMIENTOS', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 90000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'MANO DE OBRA GUAYA DE MANO', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 150000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-21', 214333, 'CORRECTIVO', 'MANO DE OBRA CAMBIO PASTILLAS Y PURGA', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 100000, 'FV 3994', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Mano de Obra Afinación de Motor y Cambio de Correas', 'JOHN MAURICIO VÉLEZ MORALES', 140000, '389', 192, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'CORRECTIVO', 'Empaque Tapa Valvulas', 'JOHN MAURICIO VÉLEZ MORALES', 50000, '388', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'CORRECTIVO', 'Kit de Embrague', 'JOHN MAURICIO VÉLEZ MORALES', 545000, '388', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'CORRECTIVO', 'Bomba Principal de Embrague', 'JOHN MAURICIO VÉLEZ MORALES', 165000, '388', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'CORRECTIVO', 'Retenedor Cigüeñal Original', 'JOHN MAURICIO VÉLEZ MORALES', 105000, '388', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'CORRECTIVO', 'Liquido de Frenos', 'JOHN MAURICIO VÉLEZ MORALES', 24000, '388', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'CORRECTIVO', 'Mano de Obra: Desmontar caja, corregir fuga retenedor y tapa válvulas, cambio embrague', 'JOHN MAURICIO VÉLEZ MORALES', 480000, '388', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Bujias', 'JOHN MAURICIO VÉLEZ MORALES', 69000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Correa Alternador', 'JOHN MAURICIO VÉLEZ MORALES', 55000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Correa Hidraulico', 'JOHN MAURICIO VÉLEZ MORALES', 65000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Correa Aire Acondicionado', 'JOHN MAURICIO VÉLEZ MORALES', 54000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'CORRECTIVO', 'Guardapolvo Eje Lado Rueda', 'JOHN MAURICIO VÉLEZ MORALES', 60000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Limpiador Cuerpo Mariposa', 'JOHN MAURICIO VÉLEZ MORALES', 34000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Limpieza de Inyectores', 'JOHN MAURICIO VÉLEZ MORALES', 160000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-26', 68082, 'CORRECTIVO', 'Batería SLI Sure Top CCA (-18) 710 27(-+)', 'COEXITO S.A.S.', 514349, '311E16427', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-26', 68082, 'CORRECTIVO', 'Batería SLI CCA (-18) 800 31(+-) 31H1250', 'COEXITO S.A.S.', 510903, '311E16427', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-26', 68082, 'PREVENTIVO', 'MO Purificación de cabina', 'COEXITO S.A.S.', 21008, '311E16427', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-26', 68082, 'PREVENTIVO', 'MO Limpieza y calibración de aire acondicionado', 'COEXITO S.A.S.', 107563, '311E16427', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 76288, 'PREVENTIVO', 'Mano de Obra Revisión, Tensión y Limpieza de Frenos', 'JOHN MAURICIO VÉLEZ MORALES', 80000, '389', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 108828, 'CORRECTIVO', '1 Liquido de Frenos $ 24.000 $ 24.000; Mano de Obra Desmontar y Montar Caja de Cambios para; Correguir Fuga de Aceite po', 'Desconocido', 545000, '2600', NULL, 'MAZDA B-2600  OBE862 C.388.pdf'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-27', 9425, 'CORRECTIVO', 'Reparación integral: Sustitución de Filtro Secador, Rediseño de Línea de Descarga y Carga de Gas R134a +1', 'Serviaires El Paisa Tobón Monteria', 1040000, NULL, NULL, NULL
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-27', 165166, 'PREVENTIVO', 'Aceite Diesel SAE15W40 API CI-4 SL Granel (x8)', 'COEXITO S.A.S.', 174784, '311E16447', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-27', 165166, 'PREVENTIVO', 'Filtro de aceite camión Hyundai M26X1.5', 'COEXITO S.A.S.', 12773, '311E16447', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-27', 165166, 'PREVENTIVO', 'Filtro aire Chev LUV DIMAX', 'COEXITO S.A.S.', 17395, '311E16447', NULL, NULL
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-28', 68208, 'CORRECTIVO', 'Bombillos media LED (x2)', 'Batery Repuestos - Jorge Trujillo', 14000, 'CTA 931', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-28', 68208, 'CORRECTIVO', 'MO Soldadura pistas, arreglo swichera accesorios y cambio bombillos luces medias', 'Batery Repuestos - Jorge Trujillo', 110000, 'CTA 931', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 15001, 'PREVENTIVO', 'FILTRO ACEITE PARTMO +1', 'LUBRIPARTES Y/O PEDRO PALACIO', 18000, 'FV41797', NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 15001, 'PREVENTIVO', 'MOBIL DELVAC MX ESP 15W40 1/4 (2 CUARTOS) +1', 'LUBRIPARTES Y/O PEDRO PALACIO', 68000, 'FV41797', NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 15001, 'PREVENTIVO', 'MOBIL DELVAC MX ESP 15W40 GALON +1', 'LUBRIPARTES Y/O PEDRO PALACIO', 130000, 'FV41797', NULL, NULL
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 45000, 'PREVENTIVO', 'Aceite Diesel SAE 5W-30 ACEA C3 1/4 (x4)', 'COEXITO S.A.S.', 153428, '311E16471', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 45000, 'PREVENTIVO', 'Aceite Diesel SAE 15W-40 API CI-4/SL 1/4 (x4)', 'COEXITO S.A.S.', 86285, '311E16471', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 45000, 'PREVENTIVO', 'Aceite Transm ATF Dexron III 1/4 (x4)', 'COEXITO S.A.S.', 87142, '311E16471', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 45000, 'PREVENTIVO', 'Aceite SAE 20W-50 API SP 1/4 (x4)', 'COEXITO S.A.S.', 93714, '311E16471', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 45000, 'PREVENTIVO', 'Aceite SAE 5W-30 API SQ 1/4 (x4)', 'COEXITO S.A.S.', 120856, '311E16471', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 45000, 'PREVENTIVO', 'Líquido freno DOT 4 900cc', 'COEXITO S.A.S.', 33190, '311E16471', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-29', 45000, 'PREVENTIVO', 'Refrigerante Premium base glicol al 33% x1 galón (x2)', 'COEXITO S.A.S.', 97310, '311E16471', NULL, NULL
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-22', 108828, 'CORRECTIVO', '1 Correa Alternador $ 55.000 $ 55.000; 1 Mano de Obra Revisión, Tensión y Limpieza de Frenos $ 80.000 $ 80.000; 1 Mano d', 'Desconocido', 69000, '2600', NULL, 'MAZDA B-2600  OBE862 C.389.pdf'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-26', 76391, 'CORRECTIVO', 'Batería SLI Sure Top CCA (-18) 710 27(+-)', 'COEXITO S.A.S.', 544601, '311E16429', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 131026, 'CORRECTIVO', 'Térmico fusible', 'Batery Repuestos - Jorge Trujillo', 48000, 'CTA 946', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 131026, 'CORRECTIVO', 'Bombillos placa (x2)', 'Batery Repuestos - Jorge Trujillo', 16000, 'CTA 946', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 131026, 'CORRECTIVO', 'Bombillos luces media (x2)', 'Batery Repuestos - Jorge Trujillo', 16000, 'CTA 946', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 131026, 'CORRECTIVO', 'Cinta LED habitáculo (3 mts)', 'Batery Repuestos - Jorge Trujillo', 60000, 'CTA 946', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 131026, 'CORRECTIVO', 'MO Cambio térmico fusible, luces medias/placa y cinta LED', 'Batery Repuestos - Jorge Trujillo', 180000, 'CTA 946', NULL, NULL
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 265289, 'CORRECTIVO', 'Conector', 'Batery Repuestos - Jorge Trujillo', 36000, 'CTA 947', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 265289, 'CORRECTIVO', 'Servicio scanner y reprogramación', 'Batery Repuestos - Jorge Trujillo', 80000, 'CTA 947', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 265289, 'CORRECTIVO', 'MO Desmonte motoventiladores, instalación radio, reprogramación computadora', 'Batery Repuestos - Jorge Trujillo', 180000, 'CTA 947', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 118895, 'CORRECTIVO', 'Automático arranque', 'Batery Repuestos - Jorge Trujillo', 220000, 'CTA 948', NULL, NULL
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 118895, 'CORRECTIVO', 'Planetario', 'Batery Repuestos - Jorge Trujillo', 85000, 'CTA 948', NULL, NULL
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 118895, 'CORRECTIVO', 'Rodamientos arranque (x2)', 'Batery Repuestos - Jorge Trujillo', 56000, 'CTA 948', NULL, NULL
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 118895, 'CORRECTIVO', 'Pernos catalizador (x2)', 'Batery Repuestos - Jorge Trujillo', 16000, 'CTA 948', NULL, NULL
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 118895, 'CORRECTIVO', 'Servicio scanner', 'Batery Repuestos - Jorge Trujillo', 60000, 'CTA 948', NULL, NULL
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 118895, 'CORRECTIVO', 'MO Desmonte/reparada motor arranque, arreglo pernos catalizador, reprogramación módulo', 'Batery Repuestos - Jorge Trujillo', 180000, 'CTA 948', NULL, NULL
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-09', 300659, 'CORRECTIVO', 'Reparar piso carrocería escaleras', 'JOHN MAURICIO VÉLEZ MORALES', 1300000, 'CTA 393', NULL, NULL
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-11', 74542, 'PREVENTIVO', 'Filtro aceite Chevrolet/Daihatsu/Nissan', 'Macrollantas S.A.S.', 33613, 'AVQ9164', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-11', 74542, 'PREVENTIVO', 'Aceite Chevron Havoli 5W30 1/4 Sintético (x4)', 'Macrollantas S.A.S.', 208000, 'AVQ9164', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-11', 74542, 'PREVENTIVO', 'Filtro aire Premium Suzuki Spresso', 'Macrollantas S.A.S.', 37815, 'AVQ9164', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-13', 320333, 'PREVENTIVO', 'Alineación de dirección', 'Macrollantas S.A.S.', 49580, 'AVQ9191', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-13', 320333, 'PREVENTIVO', 'Balanceo electrónico (x4)', 'Macrollantas S.A.S.', 50420, 'AVQ9191', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-13', 407758, 'CORRECTIVO', 'Kit de embrague', 'JOHN MAURICIO VÉLEZ MORALES', 690000, 'CTA 394', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-13', 407758, 'CORRECTIVO', 'MO Desmontar y montar caja de cambios para cambiar kit de embrague', 'JOHN MAURICIO VÉLEZ MORALES', 480000, 'CTA 394', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 216206, 'PREVENTIVO', 'Aceite Chevron Ursa TDX 15W40 1/4 CF (x8)', 'Macrollantas S.A.S.', 416000, 'AVQ9218', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 216206, 'PREVENTIVO', 'Filtro aceite Nissan Frontier Diesel 3.0', 'Macrollantas S.A.S.', 33613, 'AVQ9218', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 216206, 'PREVENTIVO', 'Filtro aire Nissan Urvan Diesel/Hyundai H100', 'Macrollantas S.A.S.', 37815, 'AVQ9218', NULL, NULL
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 320519, 'PREVENTIVO', 'Montaje de llantas auto', 'Macrollantas S.A.S.', 12605, 'AVQ9221', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 320519, 'PREVENTIVO', 'Aceite Chevron Ursa TDX 15W40 1/4 CF (x8)', 'Macrollantas S.A.S.', 416000, 'AVQ9221', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 320519, 'PREVENTIVO', 'Filtro aceite Nissan Frontier Diesel 3.0', 'Macrollantas S.A.S.', 33613, 'AVQ9221', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 320519, 'PREVENTIVO', 'Filtro aire Nissan Urvan Diesel/Hyundai H100', 'Macrollantas S.A.S.', 37815, 'AVQ9221', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 69646, 'PREVENTIVO', 'Filtro aceite Koleos 2.0 Diesel - Trafic II', 'Macrollantas S.A.S.', 33613, 'AVQ9224', NULL, NULL
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 69646, 'PREVENTIVO', 'Filtro aire Renault Trafic III 1.6', 'Macrollantas S.A.S.', 37815, 'AVQ9224', NULL, NULL
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-16', 69646, 'PREVENTIVO', 'Aceite Chevron HAV. Dual 5W30 1/4 Sintético (x8)', 'Macrollantas S.A.S.', 416000, 'AVQ9224', NULL, NULL
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'PREVENTIVO', 'Servicio cambio aceite', 'EXA Auto Parts S.A.S.', 100000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'PREVENTIVO', 'Aceite de motor 15W40 API CK4 1 galón (x2)', 'EXA Auto Parts S.A.S.', 240000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'PREVENTIVO', 'Filtro de aceite Nissan Navara', 'EXA Auto Parts S.A.S.', 38000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'PREVENTIVO', 'Filtro de aire Alaskan/Frontier', 'EXA Auto Parts S.A.S.', 45000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'PREVENTIVO', 'Filtro combustible NP300 Nissan', 'EXA Auto Parts S.A.S.', 90000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'PREVENTIVO', 'Desengrasante de motor', 'EXA Auto Parts S.A.S.', 38000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'CORRECTIVO', 'Servicio desmontar y montar intercooler', 'EXA Auto Parts S.A.S.', 300000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'CORRECTIVO', 'Servicio lavar intercooler/enfriador', 'EXA Auto Parts S.A.S.', 300000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'CORRECTIVO', 'Servicio limpieza de sensores y actuadores', 'EXA Auto Parts S.A.S.', 150000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-19', 135255, 'PREVENTIVO', 'Filtro de aire cabina', 'EXA Auto Parts S.A.S.', 32000, 'EXAA72224', NULL, NULL
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-25', 322421, 'CORRECTIVO', 'Parche #1 al #7', 'Macrollantas S.A.S.', 21008, 'AVQ9320', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-25', 322421, 'PREVENTIVO', 'Balanceo electrónico', 'Macrollantas S.A.S.', 12605, 'AVQ9320', NULL, NULL
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-26', 74654, 'CORRECTIVO', 'Parche #1 al #7', 'Macrollantas S.A.S.', 21008, 'AVQ9327', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-26', 74654, 'PREVENTIVO', 'Balanceo electrónico', 'Macrollantas S.A.S.', 12605, 'AVQ9327', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-26', 74654, 'CORRECTIVO', 'Bombillo stop 12V21W', 'Macrollantas S.A.S.', 4202, 'AVQ9327', NULL, NULL
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-02', 0, 'CORRECTIVO', 'Swichera principal lado conductor (bloqueo, vidrios, seguros)', 'Batery Repuestos - Jorge Trujillo', 220000, 'CTA 980', NULL, NULL
FROM vehicles WHERE placa = 'IEW524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-02', 0, 'CORRECTIVO', 'Fusible principal', 'Batery Repuestos - Jorge Trujillo', 6000, 'CTA 980', NULL, NULL
FROM vehicles WHERE placa = 'IEW524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-02', 0, 'CORRECTIVO', 'MO Restablecimiento sistema swichera y revisión cableados', 'Batery Repuestos - Jorge Trujillo', 140000, 'CTA 980', NULL, NULL
FROM vehicles WHERE placa = 'IEW524';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-03', 338553, 'CORRECTIVO', 'Reinicio sistema encendido', 'Batery Repuestos - Jorge Trujillo', 60000, 'CTA 981', NULL, NULL
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Soporte cardán DMAX RT-5 (x2)', 'Importadora Celeste S.A.', 375220, 'CFBA178851', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Servicio a domicilio', 'Importadora Celeste S.A.', 5500, 'CFBA178851', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Empacada aire acondicionado', 'Son Aires Car Audio - Daniel Arias', 333200, 'FEV 545', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Manguera N° 6', 'Son Aires Car Audio - Daniel Arias', 190400, 'FEV 545', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Filtro secador', 'Son Aires Car Audio - Daniel Arias', 190400, 'FEV 545', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Sistema eléctrico aire acondicionado trasero', 'Son Aires Car Audio - Daniel Arias', 95200, 'FEV 545', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Lavada sistema', 'Son Aires Car Audio - Daniel Arias', 107100, 'FEV 545', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Carga aire acondicionado', 'Son Aires Car Audio - Daniel Arias', 214200, 'FEV 545', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', 'Aceite A/C', 'Son Aires Car Audio - Daniel Arias', 35700, 'FEV 545', NULL, NULL
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-05', 409625, 'CORRECTIVO', 'DEVOLUCION: Cruceta lado eje propulsor Spicer (x3) + domicilio', 'Autolarte S.A.S. (DEVOLUCIÓN)', NULL, 'DSC235705', NULL, 'DEVOLUCIÓN valor_original: -264500'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-06', 182368, 'CORRECTIVO', 'Motoventilador completo con depósito agua (Korea)', 'Batery Repuestos - Jorge Trujillo', 320000, 'CTA 984', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-06', 182368, 'CORRECTIVO', 'Servicio scanner', 'Batery Repuestos - Jorge Trujillo', 40000, 'CTA 984', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-06', 182368, 'CORRECTIVO', 'MO Cambio motoventilador, arreglo BCM con recuperación a pulso de velocidades', 'Batery Repuestos - Jorge Trujillo', 180000, 'CTA 984', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 68461, 'CORRECTIVO', 'Líquido de frenos', 'JOHN MAURICIO VÉLEZ MORALES', 40000, 'CTA 398', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 68461, 'CORRECTIVO', 'Guaya emergencia', 'JOHN MAURICIO VÉLEZ MORALES', 120000, 'CTA 398', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 68461, 'CORRECTIVO', 'MO Desmontar y montar guaya de emergencia y sangrar frenos y bomba de embrague', 'JOHN MAURICIO VÉLEZ MORALES', 110000, 'CTA 398', NULL, NULL
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 265647, 'PREVENTIVO', 'Llanta Laufenn 225/75R16C LV01 10PR (x4)', 'COEXITO S.A.S.', 1652680, '311E17116', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 265647, 'PREVENTIVO', 'MO Balanceo por rueda camión (x4)', 'COEXITO S.A.S.', 144536, '311E17116', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 265647, 'PREVENTIVO', 'MO Descarbonización interna de motores', 'COEXITO S.A.S.', 104622, '311E17116', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 265647, 'PREVENTIVO', 'MO Purificación de cabina', 'COEXITO S.A.S.', 21008, '311E17116', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 265647, 'PREVENTIVO', 'MO Limpieza y calibración de aire acondicionado', 'COEXITO S.A.S.', 107563, '311E17116', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 265647, 'PREVENTIVO', 'Válvula neumático TR413 (x4)', 'COEXITO S.A.S.', 6724, '311E17116', NULL, NULL
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-14', 182858, 'PREVENTIVO', 'Aceite Motor 5W30 (x4)', 'JOHN MAURICIO VÉLEZ MORALES', 180000, 'CTA 401', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-14', 182858, 'PREVENTIVO', 'Filtro de aire', 'JOHN MAURICIO VÉLEZ MORALES', 31000, 'CTA 401', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-14', 182858, 'PREVENTIVO', 'Filtro de aceite', 'JOHN MAURICIO VÉLEZ MORALES', 29000, 'CTA 401', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-14', 182858, 'PREVENTIVO', 'Filtro de aire acondicionado', 'JOHN MAURICIO VÉLEZ MORALES', 32500, 'CTA 401', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-14', 182858, 'PREVENTIVO', 'MO Realizar mantenimiento', 'JOHN MAURICIO VÉLEZ MORALES', 70000, 'CTA 401', NULL, NULL
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-24', 183418, 'CORRECTIVO', '2 Aceite Caja 75W85 $ 47.000 $ 94.000; Mano de Obra Desmontar y Montar Caja de Cambios, Volante; Cambio Empaque de TapaV', 'Mauricio Vélez', 55000, '404', NULL, 'MAURICIO VELEZ  CTA COBRO .404.pdf'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-24', 410521, 'CORRECTIVO', 'Cel. 3196096801', 'Mauricio Vélez', 520000, '405', NULL, 'MAURICO VELEZ CTA COBRO  C.405.pdf'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-28', 68208, 'CORRECTIVO', 'Soldadura pistas y arreglo swichera accesorios; Cambio bombillos luces medias', 'Desconocido', 7000, '931', NULL, 'CUENTA DE COBRO 931 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 163333, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Caja de Cambios para', 'Desconocido', 788000, '789', NULL, 'CHEVROLET DMAX IEW789 C.384.pdf'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-05', 264474, 'CORRECTIVO', 'CUENTA COBRO No. 900', 'Desconocido', 5000, '900', NULL, 'CUENTA DE COBRO 900 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-07', 299299, 'CORRECTIVO', 'cambios de led', 'Desconocido', 90000, '907', NULL, 'CUENTA DE COBRO 907 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 67910, 'CORRECTIVO', 'Recuperacion luces laterales blancas con mantenimiento a circuito', 'Desconocido', 10000, '919', NULL, 'CUENTA DE COBRO 919 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-26', 76391, 'PREVENTIVO', 'Aceite SAE 20W-50 API SP G/14 (x2)', 'COEXITO S.A.S.', 43866, '311E16429', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'CUENTA COBRO No. 921', 'Desconocido', 35000, '921', NULL, 'CUENTA DE COBRO 921 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-16', 163840, 'CORRECTIVO', 'CUENTA COBRO No. 922', 'Desconocido', 18000, '922', NULL, 'CUENTA DE COBRO 922 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E16447; 13_00037 / 302180/G1 EN04 1.- ACEITE DIESEL SAE15W40 API', 'Coexito S.A.', 20495200, '311E16447', NULL, 'FACTUAR COEXITO 311E16447.pdf'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E16050; 07_00007 / MO0305 EN04 1.- MO ALINEACION CAMIONETA_MO0305', 'Coexito S.A.', 52606800, '311E16050', NULL, 'FACTURA COEXITO 311E16050.pdf'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E16203; 07_00074 / MO0514 EN04 1.- MO MANT DE FRENOS DELANTEROS Y', 'Coexito S.A.', 72848525, '311E16203', NULL, 'FACTURA COEXITO 311E16203.pdf'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E16284; Placa: MOW931 Km: 0 Notas:SERVICIO DE CAMBIO DE PLUMILLAS', 'Coexito S.A.', 7546200, '311E16284', NULL, 'FACTURA COEXITO 311E16284.pdf'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'PREVENTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E16323; 07_00028 / MO9 EN04 2.- MO CAMBIO DE FILTRO DE CABINA_MO9', 'Coexito S.A.', 71779250, '311E16323', NULL, 'FACTURA COEXITO 311E16323.pdf'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E16427; Se deja constancia que el Manual del Usuario de baterías', 'Coexito S.A.', 115382275, '311E16427', NULL, 'FACTURA COEXITO 311E16427.pdf'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-30', 108828, 'CORRECTIVO', 'REVISION DE CONSUMO DE ENERGIA Y CAMBIO DE ALTERNADOR', 'INGENCO ELECTROMECANICOS S.A.S.', 180000, '5432', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 180000, 'CORRECTIVO', '1 M/O Desmontar Ventilador de Radiador para Mantenimiento $ 60.000 $ 60.000', 'Desconocido', 25000, '483', NULL, 'KIA PICANTO EX MVV483 C.382.pdf'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-30', 108828, 'CORRECTIVO', 'ALTERNADOR +1', 'INGENCO ELECTROMECANICOS S.A.S.', 540000, '5432', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-25', 108840, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E16429; 13_00088 / 301021/G1 EN06 2.- ACEITE SAE 20W-50 API SP G/', 'Coexito S.A.', 58846650, '311E16429', NULL, 'FACTURA COEXITO 311E16429.pdf'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-13', 129294, 'CORRECTIVO', '8 Aceite Motor 15W40 $ 41.000 $ 328.000; 1 Filtro de Aire $ 46.000 $ 46.000; 1 Filtro de Aceite $ 33.000 $ 33.000', 'Desconocido', 41000, '040', NULL, 'NISSAN URVAN KQX040 C.383.pdf'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Cartagena 515E27250; Se deja constancia que el Manual del Usuario de baterías', 'Coexito S.A.', 45378100, '27250', NULL, 'coexito factura 27250.pdf'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Itagui 315E30821; 05_00643 / HK008-RA1 EN12 1.- LLANTA AUTO; 215/70R15C; RA18', 'Coexito S.A.', 85887068, '315E30821', NULL, 'coexito factura 315E30821.pdf'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Itagui 315E30823; 05_00679 / WL078 EN05 1.- LLANTA AUTO;185/60R14;SP026;4PR;W', 'Coexito S.A.', 26664690, '315E30823', NULL, 'coexito factura 315E30823.pdf'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Itagui 315E30824; Se deja constancia que el Manual del Usuario de baterías au', 'Coexito S.A.', 52256300, '315E30824', NULL, 'coexito factura 315E30824.pdf'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Itagui 315E30979; 07_00010 / MO02 EN08 1.- MO BALANCEO POR RUEDA AUTOMOVIL_MO', 'Coexito S.A.', 9159661, '315E30979', NULL, 'coexito factura 315e30979.pdf'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-13', 407788, 'CORRECTIVO', 'Mano de Obra Desmontar y Montar Caja de Cambios para', 'Mauricio Vélez', 690000, '394', NULL, 'CTA  394 DE COBRO MAURICO VELEZ .pdf'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-09', 300698, 'CORRECTIVO', 'Cel. 3196096801', 'John Vélez', 1300000, '393', NULL, 'CTA DE COBRO 393 JOHN VELEZ  MOW931.pdf'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-01-28', 68208, 'CORRECTIVO', 'Soldadura pistas y arreglo swichera accesorios; Cambio bombillos luces medias', 'Desconocido', 7000, '931', NULL, 'CUENTA DE COBRO 931 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2019-02-26', 0, 'CORRECTIVO', 'EXS121756 SERVICIO CAMBIO ACEITE 1 100,000.00 100,000.00; SLL127352 ACEITE DE MOTOR 15W40 API CK4 1 GALON 2 120,000.00 2', 'Exa Auto', 133300000, '72224', NULL, 'EXA AUTO FACTUR 72224.pdf'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 118895, 'CORRECTIVO', '1 servicio scaner $ 60.000 $ 60.000; Arreglo pernos catalizador por fracturas. reprogramacion modulo; mantenimiento a se', 'Jorge Iván Trujillo', 220000, '948', NULL, 'JORGE IVAN TRUJILLO CUENTA DE COBRO 948 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 131026, 'CORRECTIVO', 'Cambio termico fucible para recuperara voltaje; 1 Cambio luces medias y de placa $ 180.000 $ 180.000; Cambio cinta led h', 'Jorge Trujillo', 48000, '946', NULL, 'JORGE TRUJILLO CUENTA DE COBRO 946 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-02-07', 265289, 'CORRECTIVO', '1 Servicio scanner y reprogramacion $ 80.000 $ 80.000; Se desmontan motoventiladores de temperatura para mantenimiento', 'Jorge Trujillo', 36000, '947', NULL, 'JORGE TRUJILLO CUENTA DE COBRO 947 AEROSANIDAD S.A.S.pdf'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E17116; 05_00292 / LF700 EN02 1.- LLANTA AUTO; 225/75R16C; LV01;', 'Coexito S.A.', 203713348, '311E17116', NULL, 'COEXITO FACTURA 311E17116.pdf'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2012-02-25', 0, 'CORRECTIVO', 'Servicio al Cliente: Autorretenedor de Ica Medellin 311E17328; Se deja constancia que el Manual del Usuario de baterías', 'Coexito S.A.', 56059388, '311E17328', NULL, 'COEXITO FACTURA 311E17328.pdf'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-09', 68477, 'CORRECTIVO', '1 Liquido de Frenos $ 40.000 $ 40.000; Sangrar Frenos y Bomba de Embrague', 'John Vélez', 40000, '398', NULL, 'JOHN VELEZ CTA COBRO .398.pdf'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-03', 338553, 'CORRECTIVO', 'CUENTA COBRO No. 981', 'Jorge Trujillo', 60000, '981', NULL, 'JORGE TRUJILLO CUENTA DE COBRO 981 .pdf'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-17', 338553, 'CORRECTIVO', 'Se revisan cables bateria y alternador para descartar perdidas de; Se cambia tuerca tornillo corriente alternador no apr', 'Jorge Trujillo', 20000, '997', NULL, 'JORGE TRUJILLO CUENTA DE COBRO 997 .pdf'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-18', 302471, 'CORRECTIVO', '1 Servicio scanner y reprogramacion modulos $ 60.000 $ 60.000', 'Jorge Trujillo', 60000, '999', NULL, 'JORGE TRUJILLO CUENTA DE COBRO 999.pdf'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-04', 408981, 'CORRECTIVO', '3 FILTRO SECADOR 1.00 190,400.00; 7 ACEITE 1.00 35,700.00; A esta factura de venta aplican las normas relativas a la let', 'Son Aires', 116620000, '545', NULL, 'factura 545  son aires.pdf'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-14', 182902, 'CORRECTIVO', '4 Aceite Motor 5W30 $ 45.000 $ 180.000; 1 Filtro de Aire $ 31.000 $ 31.000; 1 Filtro de Aceite $ 29.000 $ 29.000', 'John Vélez', 45000, '483', NULL, 'john velez MVV483 C.401.pdf'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-25', 8582, 'PREVENTIVO', 'MO Alineación camioneta', 'Coexito Energiteca La 33', 66176, '311E17373', NULL, 'alineacion balanceo AC OJG594 25-03-26.pdf'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-25', 8582, 'PREVENTIVO', 'MO Balanceo por rueda camioneta (x4)', 'Coexito Energiteca La 33', 50421, '311E17373', NULL, 'alineacion balanceo AC OJG594 25-03-26.pdf'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-25', 8582, 'PREVENTIVO', 'MO Limpieza y calibración aire acondicionado', 'Coexito Energiteca La 33', 157983, '311E17373', NULL, 'alineacion balanceo AC OJG594 25-03-26.pdf'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-25', 8582, 'PREVENTIVO', 'Aceite Diesel SAE 15W40 API CI4/SL granel 1/4 (x6)', 'Coexito Energiteca La 33', 131088, '311E17373', NULL, 'alineacion balanceo AC OJG594 25-03-26.pdf'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-25', 8582, 'PREVENTIVO', 'Filtro de aceite camión Coexito M26x1.5 Hyundai', 'Coexito Energiteca La 33', 12773, '311E17373', NULL, 'alineacion balanceo AC OJG594 25-03-26.pdf'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-21', 151870, 'CORRECTIVO', 'MANO DE OBRA RECTIFICADORA', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 1500000, 'FV-4032', NULL, 'MC SERVICO DIESEL factura 4032.pdf'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2026-03-21', 0, 'CORRECTIVO', 'MANO DE OBRA REVISION DESMONTAR MONTAR CULATA', 'MC SERVICIOS DIESEL Y GASOLINA SAS', 1200000, 'FV-4032', NULL, 'MC SERVICO DIESEL factura 4032.pdf'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-10', 98001, 'CORRECTIVO', 'Bombillos luces medias led', 'Jorge Trujillo', 24000, '668', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-06-10', 98001, 'CORRECTIVO', 'Bombillo stop', NULL, 6000, '668', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-02-17', 83633, 'PREVENTIVO', 'CAMBIO DE PLUMILLAS', 'TAXIVAN', 37815, 'FE12808', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-05-09', 90001, 'CORRECTIVO', 'REVISION COMANDO LUCES', 'TAXIVAN', 50000, '14136', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'PREVENTIVO', 'ALINEACION DE DIRECCIÓN AUTO', 'MARLLANTAS S.A.', 42017, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'PREVENTIVO', 'BALANCEO ELECTRONICO (4 und)', 'MARLLANTAS S.A.', 45378, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'PREVENTIVO', 'ACEITE TOTAL QUARTZ 5000 SN 20W50 A GRANEL (5 und)', 'MARLLANTAS S.A.', 159665, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'PREVENTIVO', 'FILTRO DE AIRE MAZDA B2200 - B2600 / FORD', 'MARLLANTAS S.A.', 30252, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'PREVENTIVO', 'FILTRO ACEITE ABRO DOJ406 / 8173-23-802 FORD RANGER - MAZDA B2600 - MITSUBISHI V6 - SUBARU', 'MARLLANTAS S.A.', 24370, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'GUARDAPOLVO DE EJE (2 und)', 'MARLLANTAS S.A.', 351260, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'LLANTA 225/75R16 VANMEJOR C30 ZMAX (2 und)', 'MARLLANTAS S.A.', 823528, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'PREVENTIVO', 'VALVULAS TB (2 und)', 'MARLLANTAS S.A.', 4202, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'PREVENTIVO', 'MONTAJE AUTO-CAMIONETA CON LLANTA (3 und)', 'MARLLANTAS S.A.', 30, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'BANDAS DE FRENO (4 und)', 'MARLLANTAS S.A.', 110924, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'REPARACION CAMPANA DE FRENO (2 und)', 'MARLLANTAS S.A.', 48740, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'PASTA DE FRENOS MAZDA B2600 DEL', 'MARLLANTAS S.A.', 220168, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'LIQUIDO DE FRENO ALEMAN', 'MARLLANTAS S.A.', 31933, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'MANO DE OBRA MECANICA FRENOS', 'MARLLANTAS S.A.', 180672, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO maintenance_records (vehicle_id, fecha, kilometraje_actual, tipo, descripcion_trabajo, proveedor, valor, numero_factura, tiempo_fuera_servicio_horas, notas_adicionales)
SELECT id, '2025-08-14', 74000, 'CORRECTIVO', 'MANO DE OBRA MECÁNICA DE SUSPENSIÓN', 'MARLLANTAS S.A.', 110084, 'FE2-62493', NULL, NULL
FROM vehicles WHERE placa = 'OBE862';

-- Summary: 1417 inserts, 8 skipped, 380 km from fuel, 156 km=0, 6 valor negativo→NULL
