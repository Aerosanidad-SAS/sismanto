-- Migration 018: Add 4 Kia Picanto 2021 (Bogotá) + reload fuel data + LSN265→LSN367 fix
-- Run ONCE. Vehicles were missing when migration 017 ran, so their fuel records were silently skipped.

-- Step 1: Insert 4 Kia Picanto 2021 vehicles (former Bogotá fleet, now FUERA_DE_SERVICIO)
INSERT INTO vehicles (placa, marca, linea, modelo, combustible, tipo_combustible, centro_operativo, estado_actual)
VALUES
  ('KYV199', 'Kia', 'Picanto', '2021', 'Gasolina', 'Gasolina Corriente', 'CRA_BOGOTA', 'FUERA_DE_SERVICIO'),
  ('KZO779', 'Kia', 'Picanto', '2021', 'Gasolina', 'Gasolina Corriente', 'CRA_BOGOTA', 'FUERA_DE_SERVICIO'),
  ('KYV219', 'Kia', 'Picanto', '2021', 'Gasolina', 'Gasolina Corriente', 'CRA_BOGOTA', 'FUERA_DE_SERVICIO'),
  ('KOS929', 'Kia', 'Picanto', '2021', 'Gasolina', 'Gasolina Corriente', 'CRA_BOGOTA', 'FUERA_DE_SERVICIO')
ON CONFLICT (placa) DO NOTHING;

-- Step 2: Set centro_operativo_id for the new vehicles
UPDATE vehicles v
SET centro_operativo_id = oc.id
FROM operational_centers oc
WHERE v.centro_operativo::text = oc.codigo
  AND v.placa IN ('KYV199','KZO779','KYV219','KOS929')
  AND v.centro_operativo_id IS NULL;

-- Step 3: Fuel logs for KYV199 (113 records, Jan–Jul 2024)
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-02', 62300, 5.876, 87611, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-04', 62536, 3.127, 46624, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-05', 62681, 2.684, 40018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-06', 62850, 4.982, 77585, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-09', 63197, 5.129, 78679, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-11', 63407, 4.756, 72719, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-14', 63792, 7.795, 121392, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-17', 64093, 5.338, 81618, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-19', 64282, 3.359, 52310, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-23', 64624, 7, 109011, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-26', 64854, 5.077, 76561, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-29', 65024, 3.782, 56390, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-31', 65200, 4.803, 71805, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-02', 65523, 6.143, 92636, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-09', 66180, 6.313, 95074, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-11', 66370, 3.143, 48946, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-12', 66535, 4.309, 67104, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-14', 66700, 4.297, 64928, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 66932, 3.847, 58590, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-19', 67090, 3.841, 59816, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-20', 67291, 3.986, 60707, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-21', 67465, 3.449, 51356, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 67781, 8.322, 130347, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 67959, 4.587, 70227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-01', 68223, 6.591, 98799, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-02', 68345, 2.93, 45893, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-04', 68585, 5.255, 80559, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-07', 68852, 5.923, 88786, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-10', 69025, 4.634, 70251, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-12', 69242, 3.921, 58776, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 69431, 3.514, 52534, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-18', 69571, 3.664, 57389, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-19', 69724, 3.623, 55033, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-21', 70014, 4.538, 71079, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-25', 70249, 4.432, 66391, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-31', 70643, 5.767, 87024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 70784, 5.808, 91772, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-07', 71231, 6.334, 100084, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 71544, 4.64, 70018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 71725, 3.65, 54677, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-12', 71808, 2.545, 38048, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 71984, 4.58, 72488, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 71915, 2.679, 42331, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 72291, 1.14, 18049, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-19', 72418, 6.236, 98697, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 72887, 4.465, 68716, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 72717, 5.279, 80505, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 73017, 2.54, 39091, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 73117, 3.569, 56487, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-28', 73552, 3.324, 51156, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-28', 73367, 4.773, 73456, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-01', 73755, 4.549, 70009, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-03', 73893, 2.132, 32811, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 74033, 3.943, 60407, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-07', 74210, 4.277, 65823, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 74416, 4.374, 68191, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-12', 74628, 5.333, 80262, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 74833, 4.374, 69227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 75078, 5.452, 82761, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-20', 75235, 3.534, 55060, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-22', 75386, 3.891, 61583, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-24', 75554, 3.047, 46893, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-26', 75721, 5.094, 77378, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-28', 75881, 4.061, 62499, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 76095, 3.943, 62406, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-30', 76289, 3.763, 56407, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-02', 76547, 5.912, 93829, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-03', 76657, 3.092, 49073, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-05', 76821, 5.078, 80593, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-08', 77071, 5.043, 80037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-10', 77226, 4.019, 63786, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 77518, 2.745, 42872, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 77587, 4.668, 71000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-18', 77857, 5.988, 95036, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-20', 78140, 5.934, 91324, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 78302, 3.179, 48925, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-24', 78681, 7.797, 124050, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-25', 78827, 2.817, 43354, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-30', 79116, 6.004, 95289, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-03', 79364, 5.057, 77827, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-05', 79508, 3.883, 59759, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-06', 79631, 3.433, 54485, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-07', 79873, 6.459, 98758, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-09', 80134, 4.137, 65658, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-10', 80331, 4.296, 68182, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 80394, 1.973, 30108, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-14', 80668, 5.835, 88225, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-15', 80847, 3.947, 60034, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 81130, 4.776, 72930, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-21', 81293, 4.266, 64715, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 81590, 5.858, 88397, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-26', 81744, 2.804, 42537, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-28', 81940, 6.331, 100479, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-31', 82204, 5.043, 76099, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 82464, 5.323, 84481, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-03', 82621, 3.894, 59461, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 82820, 4.076, 61670, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-08', 83106, 4.525, 72178, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-11', 83315, 7.189, 110567, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-13', 83584, 3.459, 52542, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-14', 83794, 5.196, 79343, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-19', 84163, 9.507, 145172, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 84489, 4.625, 70624, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-30', 84590, 3.605, 57644, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-02', 84809, 5.486, 87721, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-06', 85017, 4.377, 69988, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-08', 85205, 3.947, 63113, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-14', 85494, 6.255, 100017, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-16', 85725, 5.092, 81421, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-19', 85895, 3.936, 59473, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-21', 86266, 7.401, 118342, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-24', 86413, 3.935, 60127, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-28', 86735, 3.127, 50000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';

-- Step 4: Fuel logs for KZO779 (117 records, Feb–May 2024)
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-02', 63484, 5.889, 86804, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-04', 63753, 4.278, 64512, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-06', 63925, 3.481, 54210, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-08', 64229, 5.07, 78955, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-09', 64420, 4.49, 69923, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-11', 64663, 3.877, 58465, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-13', 65011, 4.502, 70110, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-18', 65308, 4.58, 69066, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-24', 65661, 6.429, 100119, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-25', 65885, 3.752, 58430, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-28', 66086, 3.851, 59972, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-31', 66386, 5.397, 81387, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-01', 66812, 3.215, 50067, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-01', 66645, 4.614, 71854, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-04', 67008, 3.157, 49164, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-07', 67588, 5.584, 86960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-10', 67821, 5.629, 87660, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 68565, 4.164, 62002, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-17', 68732, 3.664, 55803, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-20', 68895, 4.495, 70001, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-21', 69056, 3.712, 57807, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 69347, 4.182, 65503, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 69574, 4.94, 77375, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-29', 69777, 5.901, 90816, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-04', 70052, 3.985, 62417, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-09', 70342, 6.571, 102922, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-11', 70551, 4.546, 71204, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-13', 70788, 4.706, 73710, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-17', 70996, 5.187, 81244, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-20', 71196, 3.37, 52784, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-21', 71515, 2.472, 37547, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-22', 71671, 7.392, 115079, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-24', 71891, 3.371, 53265, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-27', 72059, 3.167, 50042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-28', 72283, 3.51, 53668, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-29', 72513, 2.736, 40903, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 72862, 6.602, 100284, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-02', 73120, 3.613, 57089, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-04', 73307, 4.617, 70132, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-07', 73504, 5.063, 80000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 73787, 3.908, 61750, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-10', 73973, 1.598, 23948, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 74149, 5.225, 82560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 74326, 3.86, 60992, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-14', 74502, 3.163, 50061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-15', 74716, 4.423, 67451, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 74954, 4.836, 76539, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-18', 75169, 3.912, 61915, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-19', 75383, 4.426, 70050, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-20', 75549, 3.165, 50092, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 75824, 5.693, 90103, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 75974, 3.248, 49987, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-28', 76163, 3.2, 50646, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-02', 76419, 4.615, 73042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 76719, 5.688, 90024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-08', 76962, 4.424, 70019, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 77170, 4.433, 67293, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 77498, 5.988, 94772, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 77806, 5.266, 83345, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-19', 78141, 6.595, 100178, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 78355, 3.054, 45963, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-23', 78519, 2.595, 41071, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-25', 78621, 3.795, 60063, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-27', 79029, 7.429, 117579, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 79209, 3.912, 60206, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-31', 79419, 3.185, 49017, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-03', 79700, 5.236, 80006, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-04', 79862, 3.155, 50073, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-10', 80203, 5.59, 85024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 80463, 5.27, 80157, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-16', 80634, 2.999, 46155, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-18', 80820, 3.701, 56958, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-21', 81063, 5.255, 83402, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-24', 81223, 5.671, 90004, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-28', 81467, 3.406, 54057, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-02', 81755, 4.556, 70117, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-07', 82027, 5.22, 82847, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 82273, 5.169, 82037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-09', 82410, 2.625, 40065, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 82565, 2.847, 43303, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-14', 82780, 3.91, 62056, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-16', 82952, 4.551, 69448, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-17', 83091, 3.86, 60019, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 83365, 2.52, 38102, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 83265, 3.52, 55866, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-20', 83518, 2.863, 45608, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 83783, 4.914, 73857, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-27', 83961, 5.576, 88497, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-29', 84266, 4.089, 64897, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 84490, 6.334, 97227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-05', 84789, 5.026, 80170, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 84977, 3.005, 47933, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-07', 85185, 4.06, 64761, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-09', 85344, 3.954, 60061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-11', 85613, 3.989, 60593, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-13', 85806, 3.932, 60042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-14', 86014, 3.463, 53573, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-15', 86117, 3.103, 49496, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-18', 86377, 6.276, 100108, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-20', 86629, 4.495, 68009, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-21', 86874, 5.016, 80010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-22', 87108, 3.601, 57440, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-23', 87242, 3.654, 55139, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 87524, 5.243, 80061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-28', 87806, 5.16, 82307, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-01', 88097, 6.357, 101401, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-02', 88215, 3.136, 50022, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-03', 88445, 3.273, 50011, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-04', 88607, 3.763, 60024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-06', 88892, 4.387, 70148, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-09', 89152, 3.576, 57180, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-10', 89340, 3.573, 54595, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-11', 89535, 3.974, 60047, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-12', 89824, 4.591, 73410, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-12', 89673, 3.001, 46095, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-16', 90233, 7.094, 113433, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-17', 90402, 2.966, 45558, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';

-- Step 5: Fuel logs for KYV219 (102 records, Apr–Aug 2024)
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-07', 56719, 6.104, 90522, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-10', 56989, 4.499, 70063, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-12', 57145, 3.055, 46069, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-15', 57438, 6.075, 91611, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-17', 57654, 5.087, 76712, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-18', 57845, 4.098, 61798, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-22', 58047, 3.355, 50023, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-24', 58315, 5.647, 85157, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-27', 58544, 4.344, 67649, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-29', 58802, 5.289, 82366, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-31', 59111, 5.307, 80030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-03', 59365, 5.625, 87598, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-05', 59610, 1.674, 25500, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-10', 60244, 3.94, 60006, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 60885, 4.553, 69342, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-19', 61129, 5.218, 81260, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-22', 61398, 6.541, 101863, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 61788, 4.168, 65283, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 61669, 3.696, 55033, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 62047, 4.677, 71698, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-29', 62335, 6.492, 99522, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-03', 62616, 5.675, 88888, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-04', 62820, 3.386, 51907, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-06', 63109, 6.4, 100243, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-09', 63276, 4.207, 65894, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-12', 63576, 5.586, 87494, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 63861, 5.673, 88856, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-17', 64170, 5.379, 84245, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-19', 64333, 4.109, 64359, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-20', 64421, 3.154, 49401, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-21', 64595, 5.734, 86870, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-22', 64691, 4.789, 75010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-25', 65107, 7.133, 108350, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-28', 65405, 5.834, 92183, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 65691, 5.993, 94695, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-04', 65953, 7.835, 119797, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-08', 66271, 5.819, 88158, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 66521, 4.543, 69462, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-12', 66760, 4.817, 72207, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-15', 66968, 4.897, 77505, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 67241, 5.843, 91092, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-20', 67435, 4.404, 69702, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 67720, 5.141, 80097, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 68024, 5.733, 86282, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-26', 68226, 3.981, 63007, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-27', 68353, 3.499, 53850, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 68563, 4.834, 76508, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-02', 68832, 4.408, 67839, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-04', 69036, 3.48, 55078, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 69190, 2.807, 43205, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-09', 69442, 5.918, 91078, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-12', 69698, 3.958, 60914, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 70047, 5.85, 90032, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 70196, 4.107, 65001, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-20', 70439, 4.182, 66189, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 70618, 3.254, 51501, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-22', 70781, 3.943, 62406, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-26', 71103, 5.708, 90338, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-28', 71311, 5.691, 90071, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-30', 71594, 5.268, 81075, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 71830, 2.707, 42963, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 71704, 3.522, 53006, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-05', 72062, 3.981, 60073, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 72334, 5.461, 83444, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-09', 72532, 3.955, 60156, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 72902, 5.872, 93195, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-16', 73121, 4.356, 66255, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-17', 73313, 4.845, 73741, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-19', 73598, 6.589, 100087, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 73913, 5.041, 80006, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-26', 74090, 4.725, 72718, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-29', 74475, 6.827, 105068, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-02', 74717, 3.302, 52406, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-03', 74814, 4.773, 75752, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-05', 74978, 3.865, 61341, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 75295, 4.472, 70975, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-12', 75413, 4.541, 72070, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-16', 75622, 4.601, 73022, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-17', 75708, 3.53, 56025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 75786, 2.776, 44058, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-22', 76163, 3.973, 63055, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-22', 76096, 5.403, 85751, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-23', 76346, 2.392, 36095, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 76493, 3.957, 60028, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-27', 76698, 5.357, 85021, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-30', 77010, 5.185, 79227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-01', 77234, 5.674, 90052, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 77400, 5.661, 89846, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-04', 77606, 5.865, 93553, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-07', 77823, 2.895, 46178, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-09', 78005, 4.598, 70211, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 78068, 4.214, 67218, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-12', 78307, 5.341, 85194, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-19', 78718, 5.104, 77938, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 79053, 6.223, 95025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-27', 79263, 4.703, 75018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-29', 79608, 8.139, 122818, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-31', 80009, 5.017, 80026, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-02', 80166, 3.855, 58249, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-05', 80444, 5.521, 88281, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-10', 80687, 4.219, 67462, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-13', 80972, 5.625, 89944, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';

-- Step 6: Fuel logs for KOS929 (82 records, Jan–Jun 2024)
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-01', 72922, 7.549, 113031, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-04', 73149, 5.11, 76037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-06', 73342, 3.691, 55033, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-10', 73595, 6.174, 93104, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-12', 73864, 6.423, 100025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-16', 74000, 2.162, 33669, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-20', 74187, 3.65, 55042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-23', 74545, 7.836, 122030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-29', 74750, 4.362, 65037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-30', 74853, 3.054, 45535, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-04', 75105, 4.942, 76962, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-07', 75260, 3.345, 50944, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-11', 75523, 6.374, 97076, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-13', 75665, 0.974, 15174, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-15', 75889, 7.881, 120028, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-17', 76174, 5.712, 85052, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-19', 76349, 3.853, 60003, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-21', 66530, 5.784, 90074, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-25', 76835, 8.974, 134969, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 77192, 5.893, 90340, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-28', 77359, 3.833, 60036, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-29', 77578, 6.73, 105412, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-05', 77777, 6.091, 95403, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-07', 78010, 3.674, 57546, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-09', 78268, 7.545, 118177, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-11', 78486, 3.845, 60224, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-12', 78599, 3.197, 50075, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-14', 78895, 4.841, 72567, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 79009, 5.571, 87259, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-18', 79229, 5.747, 90015, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-22', 79500, 5.555, 87008, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-23', 79587, 4.445, 70235, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-25', 79779, 3.671, 58005, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-28', 800044, 6.215, 98203, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-29', 80254, 3.943, 62303, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 80485, 3.733, 57078, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-02', 80665, 6.288, 99357, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-03', 80888, 4.992, 78879, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-07', 81077, 3.611, 57057, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-08', 81159, 4.252, 67186, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 81227, 2.65, 41873, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 81431, 4.823, 76208, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-15', 81696, 3.923, 59041, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 81895, 4.291, 66038, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 82106, 6.109, 96687, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 82280, 3.923, 60061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-27', 82632, 4.342, 68721, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-27', 82537, 5.374, 85054, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 82903, 4.646, 73532, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 82840, 2.632, 39612, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-03', 83021, 2.582, 40865, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-05', 83213, 4.761, 75352, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 83292, 2.41, 38143, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-08', 83476, 4.43, 70114, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 83647, 4.844, 76666, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 83846, 3.928, 59666, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-15', 83964, 4.338, 68658, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-16', 84142, 4.016, 63561, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-20', 84360, 6.524, 103255, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 84447, 2.542, 40232, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-22', 84503, 2.311, 36576, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-24', 84698, 4.699, 74371, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-28', 84993, 4.765, 74143, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-30', 85174, 4.548, 71981, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-03', 85356, 6.303, 100035, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-04', 85544, 6.422, 101924, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 85865, 8.13, 129031, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-08', 86050, 2.773, 44010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-10', 86165, 4.874, 77355, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-12', 86325, 4.315, 68483, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 86634, 7.911, 125555, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 86802, 2.687, 41030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-17', 86948, 4.746, 75324, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-18', 87127, 3.485, 53634, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-19', 87231, 3.229, 51247, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-20', 87325, 2.521, 40011, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-23', 87463, 2.928, 45062, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-24', 87615, 3.023, 46010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-27', 87787, 5.926, 94052, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-30', 88029, 6.449, 102352, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 88368, 5.686, 90243, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 88444, 4.96, 75243, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';

-- Step 7: LSN265 → LSN367 fix (6 records with wrong placa in source Excel)
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-13', 40089, 6.485, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN367';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-19', 40548, 6.485, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN367';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-27', 40764, 6.488, 100045, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN367';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-02', 41041, 6.464, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN367';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-09', 41377, 6.465, 100014, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN367';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-15', 41782, 6.464, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN367';
