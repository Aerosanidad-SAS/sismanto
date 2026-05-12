-- Migration 017: Import historial combustible (from detailed_consumption)
-- Anomalies flagged in notas. Run ONCE.

INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-01', 72922, 7.549, 113031, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-02', 62300, 5.876, 87611, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-02', 63484, 5.889, 86804, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-04', 8705, 12.578, 122007, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-04', 62536, 3.127, 46624, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-04', 63753, 4.278, 64512, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-04', 73149, 5.11, 76037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-05', 62681, 2.684, 40018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-06', 62850, 4.982, 77585, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-06', 63925, 3.481, 54210, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-06', 73342, 3.691, 55033, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-07', 56719, 6.104, 90522, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-08', 8998, 10.175, 94526, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-08', 64229, 5.07, 78955, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-09', 114363, 6.545, 97979, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-09', 63197, 5.129, 78679, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-09', 64420, 4.49, 69923, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-10', 9353, 11.24, 104420, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-10', 231637, 15.662, 151921, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-10', 56989, 4.499, 70063, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-10', 73595, 6.174, 93104, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-11', 9603, 1.04, 10081, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-11', 63407, 4.756, 72719, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-11', 64663, 3.877, 58465, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-12', 57145, 3.055, 46069, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-12', 73864, 6.423, 100025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-13', 9784, 14.222, 137953, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-13', 65011, 4.502, 70110, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-14', 63792, 7.795, 121392, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-15', 10136, 11.216, 107335, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-15', 57438, 6.075, 91611, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-16', 74000, 2.162, 33669, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-17', 115240, 3.418, 52911, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-17', 77750, 11.188, 108524, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-17', 201858, 8.175, 72839, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-17', 64093, 5.338, 81618, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-17', 57654, 5.087, 76712, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-18', 115470, 5.311, 82798, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-18', 10486, 11.28, 104791, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-18', 65308, 4.58, 69066, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-18', 57845, 4.098, 61798, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-19', 64282, 3.359, 52310, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-20', 115630, 3.714, 57493, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-20', 11029, 11.584, 108391, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-20', 78561, 6.672, 59948, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-20', 74187, 3.65, 55042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-22', 79844, 8.79, 85258, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-22', 79406, 12.535, 112314, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-22', 58047, 3.355, 50023, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-23', 116000, 6.099, 97523, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-23', 64624, 7, 109011, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-23', 74545, 7.836, 122030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-24', 65661, 6.429, 100119, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-24', 58315, 5.647, 85157, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-25', 65885, 3.752, 58430, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-26', 64854, 5.077, 76561, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-27', 317091, 9.393, 87825, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-27', 116492, 7.137, 106627, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-27', 58544, 4.344, 67649, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-28', 66086, 3.851, 59972, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-29', 116748, 6.071, 92765, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-29', 65024, 3.782, 56390, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-29', 58802, 5.289, 82366, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-29', 74750, 4.362, 65037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-30', 74853, 3.054, 45535, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-31', 65200, 4.803, 71805, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-31', 66386, 5.397, 81387, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-01-31', 59111, 5.307, 80030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-01', 66812, 3.215, 50067, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-01', 66645, 4.614, 71854, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-02', 65523, 6.143, 92636, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-03', 59365, 5.625, 87598, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-04', 67008, 3.157, 49164, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-04', 75105, 4.942, 76962, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-05', 59610, 1.674, 25500, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-06', 822734, 17.937, 165989, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-07', 67588, 5.584, 86960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-07', 75260, 3.345, 50944, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-08', 117905, 5.156, 79557, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-09', 83491, 15.333, 145510, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-09', 66180, 6.313, 95074, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-10', 67821, 5.629, 87660, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-10', 60244, 3.94, 60006, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-11', 66370, 3.143, 48946, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-11', 75523, 6.374, 97076, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-12', 66535, 4.309, 67104, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-13', 75665, 0.974, 15174, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-14', 15069, 12.157, 114641, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-14', 206170, 7.695, 73033, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-14', 71211, 12.367, 117375, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-14', 66700, 4.297, 64928, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-15', 75889, 7.881, 120028, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 206526, 10.267, 97444, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 71525, 9.047, 85865, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 66932, 3.847, 58590, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 68565, 4.164, 62002, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-16', 60885, 4.553, 69342, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-17', 206809, 6.986, 66304, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-17', 68732, 3.664, 55803, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-17', 76174, 5.712, 85052, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-19', 207029, 6.158, 58446, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-19', 67090, 3.841, 59816, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-19', 61129, 5.218, 81260, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-19', 76349, 3.853, 60003, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-20', 71794, 9.719, 92243, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-20', 67291, 3.986, 60707, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-20', 68895, 4.495, 70001, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-21', 71962, 6.677, 63371, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-21', 67465, 3.449, 51356, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-21', 69056, 3.712, 57807, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-21', 66530, 5.784, 90074, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-22', 207257, 6.588, 62527, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-22', 232939, 2.166, 20119, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-22', 61398, 6.541, 101863, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 17223, 14.72, 133510, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 207596, 11.118, 105521, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 72694, 12.005, 113939, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 67781, 8.322, 130347, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 69347, 4.182, 65503, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 61788, 4.168, 65283, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-24', 61669, 3.696, 55033, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-25', 76835, 8.974, 134969, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-26', 17483, 7.847, 76430, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-26', 207799, 5.878, 55788, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 17816, 11.557, 108983, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 67959, 4.587, 70227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 69574, 4.94, 77375, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 62047, 4.677, 71698, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-27', 77192, 5.893, 90340, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-28', 208141, 9.209, 87403, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-28', 77359, 3.833, 60036, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-29', 73061, 14.257, 135313, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-29', 69777, 5.901, 90816, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-29', 62335, 6.492, 99522, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-02-29', 77578, 6.73, 105412, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-01', 68223, 6.591, 98799, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-02', 73334, 9.15, 86843, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-02', 68345, 2.93, 45893, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-03', 208330, 6.534, 62014, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-03', 62616, 5.675, 88888, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-04', 88146, 9.23, 87039, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-04', 68585, 5.255, 80559, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-04', 70052, 3.985, 62417, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-04', 62820, 3.386, 51907, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-05', 73634, 9.989, 94806, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-05', 77777, 6.091, 95403, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-06', 121178, 4.685, 71353, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-06', 208510, 5.983, 56785, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-06', 63109, 6.4, 100243, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-07', 73857, 9.246, 87754, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-07', 68852, 5.923, 88786, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-07', 78010, 3.674, 57546, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-08', 208720, 6.693, 63523, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-09', 70342, 6.571, 102922, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-09', 63276, 4.207, 65894, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-09', 78268, 7.545, 118177, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-10', 89171, 15.307, 150009, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-10', 208927, 7.252, 68829, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-10', 69025, 4.634, 70251, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-11', 20292, 11.892, 112142, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-11', 74520, 16.983, 161186, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-11', 74120, 2.255, 21406, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-11', 70551, 4.546, 71204, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-11', 78486, 3.845, 60224, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-12', 209572, 9.613, 91237, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-12', 69242, 3.921, 58776, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-12', 63576, 5.586, 87494, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-12', 78599, 3.197, 50075, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-13', 70788, 4.706, 73710, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-14', 78895, 4.841, 72567, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 209820, 8.282, 78604, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 74844, 11.205, 106347, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 69431, 3.514, 52534, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 63861, 5.673, 88856, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-15', 79009, 5.571, 87259, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-16', 209981, 8.671, 82296, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-17', 70996, 5.187, 81244, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-17', 64170, 5.379, 84245, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-18', 122613, 2.748, 43336, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-18', 210292, 8.407, 79791, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-18', 75306, 14.397, 136642, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-18', 69571, 3.664, 57389, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-18', 79229, 5.747, 90015, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-19', 69724, 3.623, 55033, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-19', 64333, 4.109, 64359, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-20', 210545, 7.226, 68582, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-20', 75664, 11.292, 107172, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-20', 71196, 3.37, 52784, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-20', 64421, 3.154, 49401, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-21', 70014, 4.538, 71079, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-21', 71515, 2.472, 37547, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-21', 64595, 5.734, 86870, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-22', 22286, 9.961, 93932, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-22', 71671, 7.392, 115079, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-22', 64691, 4.789, 75010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-22', 79500, 5.555, 87008, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-23', 211309, 12, 113892, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-23', 210888, 9.367, 88902, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-23', 76208, 13.883, 131764, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-23', 79587, 4.445, 70235, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-24', 23238, 13.51, 125886, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-24', 211748, 12, 113892, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-24', 71891, 3.371, 53265, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-25', 70249, 4.432, 66391, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-25', 65107, 7.133, 108350, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-25', 79779, 3.671, 58005, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-26', 76671, 11.299, 107239, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-27', 212023, 8.608, 81699, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-27', 72059, 3.167, 50042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-28', 72283, 3.51, 53668, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-28', 65405, 5.834, 92183, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-28', 800044, 6.215, 98203, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-29', 72513, 2.736, 40903, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-29', 80254, 3.943, 62303, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-03-31', 70643, 5.767, 87024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 212271, 6.17, 58559, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 76852, 7.583, 71970, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 70784, 5.808, 91772, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 72862, 6.602, 100284, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 65691, 5.993, 94695, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-01', 80485, 3.733, 57078, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-02', 93183, 6.644, 64978, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-02', 212490, 5.994, 56889, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-02', 73120, 3.613, 57089, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-02', 80665, 6.288, 99357, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-03', 93636, 14.835, 146867, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-03', 80888, 4.992, 78879, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-04', 124440, 4.312, 67936, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-04', 24031, 12.268, 119981, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-04', 77256, 12.129, 115116, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-04', 73307, 4.617, 70132, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-04', 65953, 7.835, 119797, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-05', 124571, 3.547, 53746, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-06', 212878, 11.756, 111576, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-07', 71231, 6.334, 100084, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-07', 73504, 5.063, 80000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-07', 81077, 3.611, 57057, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-08', 189183, 11.145, 105097, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-08', 66271, 5.819, 88158, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-08', 81159, 4.252, 67186, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 71544, 4.64, 70018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 73787, 3.908, 61750, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 66521, 4.543, 69462, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-09', 81227, 2.65, 41873, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-10', 213192, 10.546, 100092, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-10', 77628, 13.043, 123791, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-10', 73973, 1.598, 23948, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 378208, 7.595, 74507, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 213381, 5.675, 53861, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 77976, 10.749, 102019, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 71725, 3.65, 54677, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 74149, 5.225, 82560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-11', 81431, 4.823, 76208, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-12', 125205, 3.994, 60509, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-12', 378522, 8.385, 82257, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-12', 71808, 2.545, 38048, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-12', 66760, 4.817, 72207, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 378804, 8.121, 78449, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 78375, 10.861, 98726, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 71984, 4.58, 72488, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 71915, 2.679, 42331, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-13', 74326, 3.86, 60992, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-14', 213660, 8.241, 78990, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-14', 74502, 3.163, 50061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-15', 78880, 13.619, 130538, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-15', 74716, 4.423, 67451, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-15', 66968, 4.897, 77505, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-15', 81696, 3.923, 59041, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-16', 213901, 6.305, 60433, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 214164, 7.755, 74332, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 72291, 1.14, 18049, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 74954, 4.836, 76539, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 67241, 5.843, 91092, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-17', 81895, 4.291, 66038, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-18', 75169, 3.912, 61915, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-19', 214694, 12, 115020, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-19', 79274, 12.231, 117234, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-19', 72418, 6.236, 98697, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-19', 75383, 4.426, 70050, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-20', 215011, 11.82, 113295, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-20', 75549, 3.165, 50092, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-20', 67435, 4.404, 69702, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-21', 26184, 10.132, 100104, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-21', 215168, 4.305, 41263, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 26781, 6.829, 64316, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 26522, 8.714, 80212, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 79710, 13.905, 133279, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 72887, 4.465, 68716, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 72717, 5.279, 80505, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-22', 82106, 6.109, 96687, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 126401, 4.959, 78352, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 215414, 8.541, 81865, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 73017, 2.54, 39091, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 75824, 5.693, 90103, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 67720, 5.141, 80097, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-23', 82280, 3.923, 60061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 215602, 5.612, 53791, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 80501, 12.471, 119535, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 80100, 10.326, 98975, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 73117, 3.569, 56487, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 75974, 3.248, 49987, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-25', 68024, 5.733, 86282, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-26', 97146, 12.739, 119976, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-26', 80903, 12.344, 118317, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-26', 68226, 3.981, 63007, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-27', 126679, 4.839, 74327, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-27', 68353, 3.499, 53850, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-27', 82632, 4.342, 68721, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-27', 82537, 5.374, 85054, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-28', 81227, 11.349, 108780, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-28', 73552, 3.324, 51156, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-28', 73367, 4.773, 73456, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-28', 76163, 3.2, 50646, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-29', 216443, 12, 115020, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-29', 216021, 11.288, 108195, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 126914, 6.437, 98164, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 29118, 14.431, 132188, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 81512, 7.718, 73977, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 68563, 4.834, 76508, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 82903, 4.646, 73532, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-04-30', 82840, 2.632, 39612, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-01', 81844, 11.937, 114416, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-01', 73755, 4.549, 70009, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-02', 216598, 5.353, 51309, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-02', 76419, 4.615, 73042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-02', 68832, 4.408, 67839, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-03', 29978, 13.485, 128512, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-03', 216798, 4.764, 45663, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-03', 82271, 14.747, 141350, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-03', 73893, 2.132, 32811, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-03', 83021, 2.582, 40865, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-04', 69036, 3.48, 55078, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-05', 98066, 11.812, 111245, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-05', 217424, 12, 115020, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-05', 216927, 3.941, 37774, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-05', 82636, 11.199, 107342, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-05', 83213, 4.761, 75352, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 217635, 6.301, 60395, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 74033, 3.943, 60407, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 76719, 5.688, 90024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 69190, 2.807, 43205, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-06', 83292, 2.41, 38143, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-07', 107775, 13.827, 131771, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-07', 82913, 8.786, 84214, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-07', 74210, 4.277, 65823, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-08', 217844, 5.934, 56877, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-08', 76962, 4.424, 70019, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-08', 83476, 4.43, 70114, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-09', 69442, 5.918, 91078, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 99353, 12.99, 125159, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 218022, 5.41, 51855, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 83756, 13.054, 125123, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 83356, 12.927, 123905, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 74416, 4.374, 68191, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 77170, 4.433, 67293, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-10', 83647, 4.844, 76666, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-11', 31138, 10.999, 104820, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-11', 30723, 13.112, 125679, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-11', 99870, 13.254, 126311, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-11', 218518, 12, 115020, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-11', 84237, 16.305, 156283, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-12', 84638, 2.36, 22623, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-12', 74628, 5.333, 80262, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-12', 69698, 3.958, 60914, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 32092, 13.303, 127509, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 379754, 4.465, 43020, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 379555, 6.602, 64561, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 85002, 18, 172530, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 74833, 4.374, 69227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 77498, 5.988, 94772, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 70047, 5.85, 90032, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-14', 83846, 3.928, 59666, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-15', 128364, 5.146, 81307, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-15', 380008, 7.027, 66967, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-15', 218792, 10.183, 97604, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-15', 85254, 12.262, 117531, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-15', 83964, 4.338, 68658, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-16', 32952, 13.516, 130024, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-16', 219010, 6.567, 62945, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-16', 84142, 4.016, 63561, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 33380, 11.67, 111215, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 85635, 11.779, 112902, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 75078, 5.452, 82761, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 77806, 5.266, 83345, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-17', 70196, 4.107, 65001, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-18', 33825, 6.489, 62198, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-18', 219270, 7.581, 72664, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-19', 128800, 7.608, 116859, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-19', 34250, 10.923, 102873, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-19', 101410, 13.468, 126842, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-19', 219681, 11.4, 109269, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-19', 86232, 18, 172530, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-19', 78141, 6.595, 100178, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-20', 86336, 5.25, 50321, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-20', 75235, 3.534, 55060, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-20', 70439, 4.182, 66189, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-20', 84360, 6.524, 103255, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 108183, 13.187, 128837, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 220176, 7.019, 67277, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 219914, 6.309, 56655, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 78355, 3.054, 45963, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 70618, 3.254, 51501, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-21', 84447, 2.542, 40232, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-22', 75386, 3.891, 61583, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-22', 70781, 3.943, 62406, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-22', 84503, 2.311, 36576, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-23', 129344, 6.1, 94611, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-23', 102500, 9.004, 85808, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-23', 220640, 11.663, 111790, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-23', 86852, 17.641, 169089, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-23', 78519, 2.595, 41071, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-24', 87051, 6.757, 64766, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-24', 75554, 3.047, 46893, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-24', 84698, 4.699, 74371, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-25', 103535, 13.093, 124776, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-25', 221174, 12, 115020, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-25', 220751, 4.096, 39260, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-25', 87448, 16.339, 156609, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-25', 78621, 3.795, 60063, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-26', 221494, 9.781, 93751, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-26', 75721, 5.094, 77378, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-26', 71103, 5.708, 90338, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-27', 829896, 5.994, 91049, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-27', 221904, 10.919, 104659, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-27', 87696, 7.408, 71006, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-27', 79029, 7.429, 117579, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-28', 104218, 12.631, 118959, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-28', 75881, 4.061, 62499, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-28', 71311, 5.691, 90071, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-28', 84993, 4.765, 74143, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 104733, 13.66, 128650, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 222571, 6.116, 58622, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 222382, 12, 115020, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 88341, 14.705, 140947, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 87943, 8.334, 79881, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 76095, 3.943, 62406, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-29', 79209, 3.912, 60206, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-30', 76289, 3.763, 56407, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-30', 71594, 5.268, 81075, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-30', 85174, 4.548, 71981, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-31', 223012, 11.396, 109231, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-05-31', 79419, 3.185, 49017, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 380522, 6.462, 62261, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 380288, 8.258, 74215, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 105391, 12.082, 116338, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 223481, 12, 115548, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 71830, 2.707, 42963, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-01', 71704, 3.522, 53006, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-02', 105788, 11.08, 104839, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-02', 76547, 5.912, 93829, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-03', 223775, 7.681, 73960, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-03', 76657, 3.092, 49073, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-03', 79700, 5.236, 80006, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-03', 85356, 6.303, 100035, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-04', 106178, 10.146, 91598, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-04', 108539, 12.789, 129041, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-04', 223972, 7.308, 70369, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-04', 79862, 3.155, 50073, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-04', 85544, 6.422, 101924, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-05', 106783, 6.4, 58947, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-05', 88761, 15.36, 147901, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-05', 76821, 5.078, 80593, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-05', 72062, 3.981, 60073, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 1308066, 3.372, 51558, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 380868, 10.674, 104178, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 224542, 7.228, 69598, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 224268, 7.668, 73835, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 72334, 5.461, 83444, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-07', 85865, 8.13, 129031, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-08', 89639, 10.247, 98668, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-08', 89205, 13.771, 132601, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-08', 77071, 5.043, 80037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-08', 86050, 2.773, 44010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-09', 130988, 5.453, 83376, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-09', 224671, 3.775, 36349, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-09', 72532, 3.955, 60156, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-10', 77226, 4.019, 63786, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-10', 80203, 5.59, 85024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-10', 86165, 4.874, 77355, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-11', 224862, 5.932, 57119, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-12', 86325, 4.315, 68483, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 531402, 5.064, 81227, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 36259, 10.869, 98256, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 224994, 4.287, 41280, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 90198, 11.789, 113516, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 89900, 5.285, 50889, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 80463, 5.27, 80157, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-13', 72902, 5.872, 93195, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 36927, 5.363, 51378, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 36760, 13.478, 121841, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 225304, 8.096, 77956, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 90596, 13.168, 126795, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 77518, 2.745, 42872, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-14', 86634, 7.911, 125555, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 37393, 12.839, 121483, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 108938, 13.152, 132046, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 225658, 8.66, 83387, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 91031, 10.671, 102751, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 77587, 4.668, 71000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-15', 86802, 2.687, 41030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-16', 225924, 6.951, 66931, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-16', 80634, 2.999, 46155, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-16', 73121, 4.356, 66255, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-17', 73313, 4.845, 73741, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-17', 86948, 4.746, 75324, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-18', 91395, 11.031, 106217, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-18', 77857, 5.988, 95036, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-18', 80820, 3.701, 56958, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-18', 87127, 3.485, 53634, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-19', 131812, 3.913, 59556, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-19', 226331, 6.824, 65708, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-19', 226087, 6.033, 58092, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-19', 73598, 6.589, 100087, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-19', 87231, 3.229, 51247, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-20', 38048, 13.47, 127453, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-20', 189326, 7.359, 70131, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-20', 91872, 14.239, 137107, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-20', 78140, 5.934, 91324, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-20', 87325, 2.521, 40011, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-21', 381587, 10.595, 101606, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-21', 321190, 10.287, 94229, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-21', 108892, 12.363, 117819, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-21', 226636, 7.54, 72603, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-21', 81063, 5.255, 83402, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 132193, 5.942, 90378, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 109487, 16.946, 160343, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 109436, 13.044, 131614, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 226910, 6.928, 66710, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 78302, 3.179, 48925, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-22', 73913, 5.041, 80006, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-23', 38784, 14.005, 132515, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-23', 92323, 14.259, 137300, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-23', 87463, 2.928, 45062, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-24', 92875, 14.674, 141299, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-24', 78681, 7.797, 124050, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-24', 81223, 5.671, 90004, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-24', 87615, 3.023, 46010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-25', 93030, 6.367, 61308, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-25', 78827, 2.817, 43354, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-26', 39042, 10.991, 110899, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-26', 227171, 7.046, 67846, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-26', 93514, 12.859, 123819, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-26', 74090, 4.725, 72718, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-27', 132721, 4.283, 65145, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-27', 87787, 5.926, 94052, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-28', 132831, 4.135, 62893, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-28', 227359, 5.194, 50013, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-28', 93789, 9.096, 87585, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-28', 81467, 3.406, 54057, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-29', 74475, 6.827, 105068, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-30', 133081, 7.043, 112970, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-30', 79116, 6.004, 95289, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-06-30', 88029, 6.449, 102352, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-01', 133224, 4.416, 67167, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-01', 227557, 5.05, 48626, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-02', 227654, 4.126, 39729, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-02', 93961, 5.027, 48405, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-02', 81755, 4.556, 70117, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-02', 74717, 3.302, 52406, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-03', 79364, 5.057, 77827, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-03', 74814, 4.773, 75752, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-04', 133508, 4.733, 76296, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-04', 40138, 11.876, 112371, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-04', 94518, 11.531, 111032, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-04', 94126, 4.849, 46691, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-05', 40604, 12.733, 120709, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-05', 227942, 3.13, 30079, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-05', 227873, 4.901, 47192, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-05', 79508, 3.883, 59759, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-05', 74978, 3.865, 61341, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-06', 228380, 11.513, 110859, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-06', 79631, 3.433, 54485, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-07', 228564, 6.077, 58515, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-07', 79873, 6.459, 98758, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-07', 82027, 5.22, 82847, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 329212, 9.615, 91631, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 41350, 13.167, 124586, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 229152, 12, 115548, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 228737, 4.23, 40731, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 82273, 5.169, 82037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-08', 88368, 5.686, 90243, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-09', 13, 5.377, 81784, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-09', 381927, 12.627, 123997, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-09', 80134, 4.137, 65658, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-09', 82410, 2.625, 40065, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-10', 229650, 12, 115548, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-10', 80331, 4.296, 68182, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 134409, 5.888, 89556, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 41847, 11.535, 112582, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 230052, 9.965, 95953, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 95107, 15.786, 152003, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 80394, 1.973, 30108, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 82565, 2.847, 43303, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-11', 75295, 4.472, 70975, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-12', 42607, 15.287, 147199, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-12', 382289, 11.384, 108490, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-12', 75413, 4.541, 72070, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-13', 43046, 12.499, 119240, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-13', 382796, 13.951, 132953, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-13', 95673, 11.791, 113536, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-13', 95275, 5.451, 52488, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-14', 134181, 6.144, 93942, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-14', 230296, 6.413, 61751, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-14', 80668, 5.835, 88225, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-14', 82780, 3.91, 62056, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-15', 43780, 12.579, 119022, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-15', 80847, 3.947, 60034, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-16', 44151, 8.43, 82783, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-16', 230744, 10.246, 98659, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-16', 96147, 16.066, 154700, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-16', 82952, 4.551, 69448, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-16', 75622, 4.601, 73022, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-17', 135081, 4.143, 65667, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-17', 96359, 5.634, 54250, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-17', 83091, 3.86, 60019, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-17', 75708, 3.53, 56025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 45049, 12.946, 122495, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 231133, 9.223, 88808, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 96794, 15.034, 144762, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 81130, 4.776, 72930, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 83365, 2.52, 38102, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 83265, 3.52, 55866, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-18', 75786, 2.776, 44058, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-19', 330846, 10.026, 95548, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-20', 97100, 9.082, 87451, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-20', 83518, 2.863, 45608, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-21', 231404, 8.154, 78515, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-21', 81293, 4.266, 64715, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-22', 135855, 4.453, 69912, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-22', 76163, 3.973, 63055, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-22', 76096, 5.403, 85751, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-23', 231734, 8.034, 77359, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-23', 97451, 11.45, 110252, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-23', 76346, 2.392, 36095, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 136130, 3.723, 59010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 231925, 6.108, 58814, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 97751, 9.16, 88202, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 237155, 11.42, 103317, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 81590, 5.858, 88397, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-24', 88444, 4.96, 75243, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KOS929';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 46243, 11.717, 113479, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 287283, 7.429, 70798, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 232802, 12, 115548, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 232365, 12, 115548, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 98016, 6.419, 61809, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 83783, 4.914, 73857, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-25', 76493, 3.957, 60028, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-26', 136357, 5.782, 92743, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-26', 81744, 2.804, 42537, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-27', 233186, 10.281, 98996, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-27', 83961, 5.576, 88497, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-27', 76698, 5.357, 85021, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-28', 46423, 7.681, 73430, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-28', 233334, 4.24, 40827, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-28', 98253, 7.042, 67807, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-28', 81940, 6.331, 100479, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-29', 84266, 4.089, 64897, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-30', 46853, 12.723, 115016, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-30', 112763, 10.34, 98540, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-30', 234037, 12, 115548, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-30', 233608, 6.748, 64976, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-30', 77010, 5.185, 79227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-31', 287955, 10.084, 91230, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-31', 110319, 13.261, 133803, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-31', 98561, 9.124, 87855, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-07-31', 82204, 5.043, 76099, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-01', 288521, 11.502, 109039, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-01', 234417, 9.263, 89193, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-01', 99064, 13.171, 126824, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-01', 77234, 5.674, 90052, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 136426, 2.846, 43288, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 47991, 11.962, 113998, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 47580, 11.011, 102843, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 289156, 7.959, 75849, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 288933, 7.117, 64387, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 234900, 12, 115548, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 99640, 14.83, 142798, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 82464, 5.323, 84481, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 84490, 6.334, 97227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-02', 77400, 5.661, 89846, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-03', 82621, 3.894, 59461, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-04', 384022, 11.216, 101841, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-04', 235629, 12, 116748, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-04', 235200, 10.002, 97309, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-04', 77606, 5.865, 93553, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-05', 136688, 6.892, 107377, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-05', 384742, 14.143, 135207, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-05', 236059, 12, 109440, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-05', 84789, 5.026, 80170, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 48650, 13.323, 127368, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 236894, 12, 116748, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 236407, 10.587, 103001, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 100109, 12.251, 119190, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 82820, 4.076, 61670, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-06', 84977, 3.005, 47933, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-07', 236961, 4.249, 41339, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-07', 85185, 4.06, 64761, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-07', 77823, 2.895, 46178, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-08', 114264, 12.301, 118459, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-08', 83106, 4.525, 72178, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-09', 136905, 5.898, 91301, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-09', 289377, 7.818, 78571, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-09', 237256, 6.771, 65875, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-09', 85344, 3.954, 60061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-09', 78005, 4.598, 70211, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 114745, 14.504, 140689, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 290013, 12.851, 125169, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 289694, 12.095, 115749, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 237445, 1.309, 12735, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 237411, 4.084, 39733, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 100584, 12.311, 119774, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-10', 78068, 4.214, 67218, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-11', 115188, 11.473, 110485, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-11', 110709, 13.035, 132827, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-11', 238753, 12, 117420, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-11', 83315, 7.189, 110567, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-11', 85613, 3.989, 60593, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-12', 237881, 11.93, 116067, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-12', 100738, 5.695, 55407, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-12', 78307, 5.341, 85194, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-13', 83584, 3.459, 52542, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-13', 85806, 3.932, 60042, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-14', 137127, 6.546, 103100, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-14', 238366, 11.708, 113907, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-14', 83794, 5.196, 79343, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-14', 86014, 3.463, 53573, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-15', 331776, 6.374, 65780, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-15', 116748, 11.569, 111409, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-15', 116333, 13.695, 129075, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-15', 101219, 12.003, 116777, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-15', 86117, 3.103, 49496, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-16', 137430, 6.292, 95324, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-16', 117247, 13.673, 130714, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-16', 239046, 12, 116748, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-16', 238621, 7.009, 68191, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-17', 101632, 11.457, 111465, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-18', 111090, 12.756, 129984, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-18', 86377, 6.276, 100108, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-19', 239218, 4.64, 45143, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-19', 84163, 9.507, 145172, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-19', 78718, 5.104, 77938, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-20', 86629, 4.495, 68009, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-21', 239376, 5.764, 56078, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-21', 102044, 12.004, 116787, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-21', 86874, 5.016, 80010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-22', 102533, 12.334, 119997, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-22', 87108, 3.601, 57440, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-23', 50184, 12.049, 117225, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-23', 118383, 11.879, 114395, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-23', 239714, 8.015, 77978, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-23', 87242, 3.654, 55139, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-24', 50602, 9.46, 94884, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-24', 240356, 12, 116400, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-24', 102918, 9.247, 89964, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-24', 239707, 12, 114720, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 118859, 15.477, 141568, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 240795, 12, 116748, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 240366, 5.162, 50221, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 84489, 4.625, 70624, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 87524, 5.243, 80061, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-25', 79053, 6.223, 95025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-26', 148874, 17.105, 166090, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-26', 103284, 10.119, 98448, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-27', 119641, 11.737, 107276, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-27', 241410, 12, 116748, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-27', 240984, 5.596, 54443, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-27', 79263, 4.703, 75018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-28', 51165, 12.271, 118170, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-28', 120297, 12.29, 117492, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-28', 241836, 12, 116748, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-28', 190192, 8.274, 69502, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-28', 189891, 7.625, 67786, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-28', 87806, 5.16, 82307, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-29', 103810, 12.254, 113227, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-29', 79608, 8.139, 122818, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-30', 111512, 14.146, 144148, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-30', 242198, 10.423, 101405, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-31', 242416, 5.643, 65662, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-31', 104370, 17.203, 200174, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-08-31', 80009, 5.017, 80026, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-01', 290726, 7.522, 87970, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-01', 290503, 7.34, 81232, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-01', 242846, 12, 139632, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-01', 88097, 6.357, 101401, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-02', 243069, 6.895, 80230, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-02', 88215, 3.136, 50022, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-02', 80166, 3.855, 58249, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-03', 243557, 12, 139632, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-03', 88445, 3.273, 50011, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-04', 138034, 3.857, 58665, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-04', 88607, 3.763, 60024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-05', 243962, 12, 139632, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-05', 104865, 13.055, 145563, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-05', 80444, 5.521, 88281, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-06', 244336, 7.729, 90120, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-06', 105174, 8.811, 102119, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-06', 88892, 4.387, 70148, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-07', 122410, 11.556, 115109, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-07', 121929, 10.63, 122670, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-07', 111942, 13.94, 139958, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-07', 244400, 4.573, 44770, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-08', 138462, 3.621, 55075, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-08', 244820, 12, 121920, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-08', 105429, 6.99, 71018, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-08', 240334, 9.874, 99135, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-09', 122952, 15.092, 143374, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-09', 245143, 9.08, 92253, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-09', 89152, 3.576, 57180, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-10', 138690, 4.5, 73305, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-10', 245450, 8.261, 83932, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-10', 105635, 6.814, 69230, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-10', 89340, 3.573, 54595, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-10', 80687, 4.219, 67462, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-11', 245775, 8.382, 85161, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
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
SELECT id, '2024-09-13', 246073, 10.624, 102947, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-13', 80972, 5.625, 89944, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV219';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-15', 246546, 10.644, 107802, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-16', 246834, 11, 111760, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-16', 106180, 15.231, 153681, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-16', 90233, 7.094, 113433, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-17', 139536, 6.084, 98865, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-17', 53066, 13.609, 135559, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-17', 90402, 2.966, 45558, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KZO779';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-18', 247028, 6.385, 64872, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-18', 106537, 9.271, 94193, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-19', 247418, 9.533, 96855, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-20', 191930, 8.997, 90330, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-21', 53371, 9.744, 97927, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-21', 112372, 14.63, 154932, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-21', 247637, 7.478, 75976, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-22', 53520, 5.284, 55165, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-23', 247846, 5.928, 60228, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-23', 106899, 11.521, 117053, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-24', 333069, 7.048, 73997, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-24', 54286, 13.836, 138775, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-24', 248183, 9.509, 96611, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-25', 248389, 6.122, 62200, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-25', 107398, 14.179, 144059, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-26', 107749, 11.398, 115804, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-27', 54522, 9.051, 90872, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-27', 112549, 5.925, 62746, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-28', 248846, 12.231, 124267, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-29', 108322, 15.028, 152684, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-30', 249071, 6.248, 63480, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-09-30', 84590, 3.605, 57644, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-02', 333480, 6.906, 72099, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-02', 125207, 7.571, 76013, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-02', 113161, 15.308, 157519, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-02', 249294, 6.854, 69637, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-02', 108850, 16.257, 165171, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-02', 84809, 5.486, 87721, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-03', 249596, 8.383, 85171, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-04', 333968, 6.815, 70331, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-04', 249826, 6.183, 62819, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-06', 250126, 7.96, 80874, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-06', 85017, 4.377, 69988, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-07', 250289, 4.898, 49764, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-08', 140485, 4.939, 76801, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-08', 250547, 6.613, 67188, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-08', 85205, 3.947, 63113, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-09', 60145, 11.773, 118201, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-10', 70274, 9.255, 150671, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-10', 250887, 9.214, 93614, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-10', 242305, 6.505, 65460, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-11', 251083, 5.838, 59314, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-12', 251430, 8.899, 90414, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-13', 141077, 5.758, 87464, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-13', 57079, 13.782, 138371, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-14', 85494, 6.255, 100017, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-15', 141343, 7.408, 117343, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-15', 251712, 7.471, 75905, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-15', 109005, 5.525, 56134, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-16', 252006, 7.205, 73203, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-16', 85725, 5.092, 81421, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-17', 57682, 7.973, 80049, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-17', 252303, 7.674, 77968, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-18', 109444, 12.203, 123982, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-19', 141644, 6.037, 95626, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-19', 57970, 5.451, 57230, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-19', 126496, 6.503, 100016, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-19', 109590, 6.214, 63134, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-19', 85895, 3.936, 59473, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-20', 70429, 6.143, 100008, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-20', 252567, 7.639, 77612, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-21', 86266, 7.401, 118342, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-22', 252783, 6.683, 67899, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-22', 109864, 11.373, 115550, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-23', 58738, 8.471, 88437, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-23', 253111, 8.291, 84237, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-24', 142314, 3.812, 57599, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-24', 58868, 3.785, 38001, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-24', 253290, 5.085, 51664, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-24', 86413, 3.935, 60127, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-25', 142480, 4.371, 66046, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-25', 110259, 12.165, 123596, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-26', 253635, 11.1, 112421, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-27', 70473, 6.143, 100008, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-27', 254063, 11.276, 114203, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-28', 142760, 5.834, 90135, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-28', 86735, 3.127, 50000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'KYV199';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-29', 60465, 15.621, 157928, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-30', 8958, 6.431, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-30', 110516, 7.515, 76352, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-31', 143010, 3.146, 47536, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-31', 60640, 6.797, 70961, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-10-31', 254397, 11.377, 115590, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-01', 143190, 4.499, 71399, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-01', 110891, 12.769, 129733, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-02', 14100, 8.378, 130027, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-02', 114536, 14.076, 149065, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-03', 143360, 5.06, 78885, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-03', 61484, 10.012, 103224, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-03', 254577, 5.225, 53086, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-03', 61426, 9.787, 98261, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-04', 111205, 9.391, 95413, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-05', 61922, 5.163, 51837, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-06', 143690, 4.171, 66069, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-06', 62150, 8.263, 86753, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-06', 254894, 9.733, 98887, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-07', 255180, 8.051, 81798, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-08', 143860, 5.834, 92586, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-08', 62437, 9.682, 97110, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-08', 125966, 11.894, 130656, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-08', 8132, 9.104, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-08', 255530, 8.48, 86157, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-08', 111528, 11.672, 118588, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-09', 126551, 7.19, 110576, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-09', 111881, 9.869, 100170, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-12', 144180, 4.728, 72717, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-12', 255910, 11.458, 116413, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-12', 112428, 17.227, 175026, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-13', 63490, 8.082, 81143, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-13', 126310, 12.452, 125018, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-14', 70646, 6.143, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-14', 256657, 6.743, 68509, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-14', 256390, 12.504, 127041, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-15', 144320, 4.094, 62147, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-15', 63707, 8.068, 84230, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-15', 256786, 4.923, 50018, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-16', 144444, 3.882, 60520, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-16', 257182, 4.097, 41626, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-16', 257015, 5.379, 54651, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-17', 144620, 3.94, 61860, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-17', 64131, 7.266, 73096, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-17', 115067, 15.836, 159310, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-17', 112924, 12.667, 128697, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-18', 64350, 7.981, 80129, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-19', 64420, 3.112, 31244, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-19', 292761, 5.21, 52308, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-20', 144890, 3.587, 54451, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-20', 84598, 6.705, 67452, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-20', 152095, 9.603, 96606, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-20', 257288, 4.448, 45192, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-21', 64780, 6.231, 62684, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-21', 152382, 10.796, 108608, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-22', 145045, 4.814, 73077, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-22', 65061, 8.263, 84176, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-22', 257487, 6.638, 64057, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-22', 192165, 8.095, 81436, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-23', 145230, 4.005, 64921, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-23', 258030, 5.959, 60543, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-23', 257786, 7.853, 74211, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-23', 62661, 11.873, 119442, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-24', 65268, 6.573, 66124, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-24', 152549, 7.323, 76452, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-25', 334325, 10.195, 100013, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-25', 65460, 6.199, 64718, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-25', 292810, 2.101, 21724, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-25', 78808, 11.672, 190020, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-25', 258396, 9.547, 96998, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-25', 62784, 6.102, 61386, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-26', 145640, 6.892, 110010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-26', 65586, 5.112, 51427, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-26', 258658, 7.785, 79096, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-26', 126589, 6.502, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-26', 241789, 10.588, 106515, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-27', 66068, 8.503, 88771, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-27', 126862, 10.346, 105219, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-27', 126429, 6.92, 69615, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-27', 258981, 7.643, 77653, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-27', 244318, 7.984, 83353, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-27', 244079, 11.223, 117168, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-28', 241985, 7.932, 79796, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-28', 62918, 5.695, 59456, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-28', 113502, 16.645, 169113, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-29', 145801, 4.799, 76496, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-29', 66341, 10.48, 105324, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-29', 259380, 10.375, 105078, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-29', 242055, 3.131, 31498, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-29', 244475, 6.838, 71389, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-30', 66619, 9.957, 105445, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-11-30', 113716, 5.963, 60584, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-01', 67017, 6.264, 68280, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-01', 66811, 5.989, 60669, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-01', 259662, 7.976, 84625, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-01', 242067, 1.341, 14027, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-02', 145970, 5.548, 89212, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-02', 67408, 11.383, 123961, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-02', 153040, 4.572, 47823, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-02', 152911, 13.535, 146719, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-02', 63123, 7.924, 82101, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-03', 146147, 5.805, 93344, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-03', 259915, 6.873, 72923, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-04', 97970, 10.967, 119431, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-04', 67510, 4.252, 46092, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-04', 260242, 9.875, 104280, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-04', 192513, 13.083, 135553, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-04', 242216, 6.247, 65344, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-04', 63422, 10.116, 105813, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-05', 68548, 6.899, 70163, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-05', 260526, 6.833, 72156, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-05', 114071, 10.428, 110120, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-06', 146327, 6.949, 109516, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-06', 244809, 13.841, 144777, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-07', 68470, 10.092, 105562, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-07', 115498, 13.27, 145837, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-07', 260856, 9.242, 97596, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-08', 261113, 7.229, 76338, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-08', 242406, 7.891, 82540, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-09', 68670, 8.126, 88086, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-09', 192654, 9.657, 105260, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-10', 146504, 6.035, 95112, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-10', 82799, 10.881, 177143, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-10', 261840, 8.663, 91481, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-10', 261487, 10.446, 110310, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-10', 126613, 5.082, 100065, 'Gasolina Extra'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-10', 114601, 16.181, 170871, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-11', 146641, 4.33, 68241, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-11', 69097, 11.018, 115248, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-11', 69029, 4.585, 47870, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-11', 242690, 10.123, 105887, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-12', 146744, 3.356, 54132, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-12', 242765, 3.552, 37154, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-12', 114933, 9.024, 95293, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-13', 69570, 7.642, 81922, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-13', 92240, 6.226, 67801, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-13', 262046, 5.925, 62568, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-13', 63645, 10.589, 114785, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-13', 245113, 12.537, 135901, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-14', 69861, 9.368, 101549, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-14', 293173, 14.154, 153429, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-14', 262250, 5.718, 60382, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-14', 243151, 11.916, 119041, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-14', 115441, 10.831, 114375, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-14', 115041, 4.192, 44268, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-14', 245304, 6.747, 70574, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-15', 146970, 6.31, 99572, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-15', 262439, 5.761, 60836, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-16', 147126, 4.3, 67510, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-16', 70129, 9.208, 99815, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-16', 262652, 4.885, 51586, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-16', 243470, 9.763, 102121, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-17', 70522, 12.523, 135749, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-17', 262869, 6.02, 63571, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-17', 63987, 13.464, 140833, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-17', 245474, 6.83, 71442, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-18', 147370, 5.587, 88051, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-18', 70630, 3.625, 37918, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-18', 263091, 6.969, 73593, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-19', 70859, 8.308, 90059, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-19', 263334, 7.061, 74564, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-19', 243700, 7.832, 84899, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-19', 245630, 6.255, 67804, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-20', 82900, 6.143, 100008, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-20', 64268, 11.443, 119694, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-20', 116119, 16.329, 172434, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-21', 147609, 8.697, 141326, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-21', 71482, 5.63, 59594, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-21', 71281, 4.89, 51101, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-21', 71095, 8.207, 83137, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-21', 263720, 10.156, 107247, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-21', 126635, 6.481, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-22', 243918, 5.066, 52986, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-23', 147825, 6.572, 106795, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-23', 71684, 7.745, 80858, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-23', 264521, 13.573, 142883, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-23', 116394, 8.998, 95019, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-24', 115915, 13.281, 145958, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-24', 264803, 7.248, 76539, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-24', 244195, 13.935, 145760, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-25', 148013, 4.365, 68269, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-25', 71845, 5.727, 59904, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-25', 8238, 8.772, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-26', 265261, 11.508, 121524, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-26', 64416, 8.038, 87132, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-27', 72108, 8.519, 90174, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-27', 244474, 9.644, 100876, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-27', 64553, 6.308, 68379, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-28', 148271, 7.89, 128213, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-28', 265647, 9.304, 98250, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-28', 64701, 6.412, 69506, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-29', 72334, 6.745, 70418, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-30', 148485, 6.125, 93468, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-30', 385197, 13.214, 135444, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-30', 82910, 11.287, 183752, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-30', 116403, 12.054, 123192, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-30', 265896, 6.583, 69516, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-30', 245861, 9.972, 104307, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-31', 148642, 2.696, 43810, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-31', 266123, 5.623, 59379, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-31', 126656, 6.485, 100064, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2024-12-31', 244745, 9.73, 105862, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-01', 148742, 3.708, 56955, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-01', 72684, 12.36, 134477, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-01', 117109, 17.39, 183638, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-02', 266736, 11.047, 118534, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-02', 266335, 5.269, 56536, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-02', 244952, 7.039, 75036, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-02', 64990, 9.61, 102443, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-03', 148970, 6.749, 110549, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-03', 117420, 7.419, 79606, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-04', 149104, 3.606, 56326, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-04', 12375, 10.477, 115876, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-05', 73343, 10.146, 112215, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-05', 116771, 8.857, 92290, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-06', 149276, 3.046, 49254, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-06', 117859, 11.535, 123771, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-07', 73586, 8.902, 94895, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-07', 267045, 7.805, 83748, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-07', 245033, 3.413, 37748, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-07', 246125, 9.654, 106773, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-08', 73868, 8.787, 97184, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-08', 82921, 10.012, 164197, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-08', 267107, 1.583, 16986, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-08', 118212, 10.131, 108706, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-09', 74167, 8.709, 91810, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-09', 293437, 12.01, 128027, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-09', 267553, 11.82, 126829, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-09', 192842, 11.191, 123772, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-09', 245263, 7.859, 86999, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-10', 149548, 7.389, 113643, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-10', 268050, 11.068, 118760, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-10', 126688, 6.432, 100018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-11', 149690, 5.426, 86746, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-12', 149821, 3.49, 57166, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-12', 74477, 10.487, 111791, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-12', 65306, 14.668, 162228, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-13', 74781, 9.173, 101453, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-13', 117332, 13.577, 151655, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-13', 268285, 6.928, 74337, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-13', 245389, 4.305, 46343, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-13', 118816, 14.207, 152441, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-14', 149976, 4.816, 75178, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-14', 268647, 8.708, 93437, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-14', 119386, 12.365, 132676, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-15', 74973, 5.076, 54009, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-15', 74973, 1.853, 19716, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-15', 268922, 6.724, 72149, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-15', 65555, 11.389, 122649, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-16', 150168, 5.38, 88124, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-16', 75212, 8.025, 88757, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-16', 269397, 10.379, 111367, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-17', 245798, 12.495, 133197, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-18', 150397, 6.528, 104364, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-18', 75470, 9.3, 102858, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-18', 269657, 6.641, 71258, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-18', 119810, 13.606, 145992, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-18', 246506, 4.345, 48056, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-18', 246368, 9.641, 99592, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-19', 75662, 7.824, 83404, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-19', 269885, 4.982, 53457, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-19', 120151, 9.375, 100594, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-20', 150682, 7.066, 113268, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-20', 270194, 7.748, 83136, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-21', 75928, 10.023, 110854, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-21', 270669, 9.938, 106635, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-21', 65737, 9.001, 95951, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-21', 246678, 5.709, 63142, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-22', 150851, 6.077, 99541, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-22', 76089, 6.143, 67942, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-22', 270923, 5.858, 62856, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-22', 246114, 11.804, 130552, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-23', 127075, 8.823, 88583, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-23', 271331, 9.092, 97557, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-24', 151122, 7.771, 121305, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-24', 76433, 2.843, 30306, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-24', 76340, 8.914, 98589, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-24', 271653, 6.63, 71137, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-24', 126715, 6.431, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-25', 82922, 14.274, 234094, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-25', 271771, 5.517, 59197, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-25', 120580, 11.421, 122547, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-25', 247114, 4.156, 44303, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-25', 246966, 11.03, 121992, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-26', 272075, 8.074, 86634, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-26', 246431, 11.631, 128639, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-27', 151339, 5.657, 90682, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-27', 76883, 6.556, 69835, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-27', 76675, 9.092, 96921, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-27', 14180, 15.124, 237296, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-27', 120879, 8.039, 86258, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-28', 334514, 9.628, 100035, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-28', 151469, 4.23, 64930, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-28', 77154, 8.933, 98799, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-28', 272692, 7.842, 84145, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-28', 247377, 8.911, 98556, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-29', 117711, 13.201, 147455, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-29', 246737, 11.075, 118060, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-29', 121195, 6.824, 73222, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-30', 151711, 8.91, 145946, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-30', 77591, 5.445, 58615, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-30', 77430, 8.497, 90578, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-30', 153370, 14.67, 162250, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-30', 272714, 8.294, 88995, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-30', 121651, 11.681, 125337, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-31', 67814, 7.58, 83911, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-31', 273447, 10.377, 111345, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-31', 273071, 7.966, 85635, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-31', 246896, 5.904, 65298, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-31', 247936, 4.601, 49530, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-01-31', 247786, 12.586, 136684, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-01', 121875, 5.579, 59863, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-02', 78209, 4.721, 52214, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-03', 152039, 6.609, 108520, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-03', 122381, 14.692, 158233, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-04', 78350, 11.282, 120830, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-04', 127639, 4.535, 48819, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-04', 127450, 8.445, 91966, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-04', 273772, 9.287, 100021, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-04', 126739, 6.39, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-04', 247203, 10.297, 110281, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-05', 152195, 4.565, 71534, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-05', 78458, 4.2, 46452, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-05', 248187, 9.19, 101641, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-06', 152340, 2.945, 45736, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-06', 78786, 9.564, 102956, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-06', 8339, 8.458, 98536, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-06', 274097, 8.635, 92999, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-06', 122660, 10.205, 109908, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-06', 248364, 5.634, 60340, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-07', 79062, 8.605, 95171, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-07', 274362, 6.177, 66526, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-07', 247422, 7.982, 88281, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-08', 152505, 6.141, 98686, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-08', 248492, 3.584, 38582, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-09', 127974, 12.098, 133804, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-09', 115089, 12.07, 135305, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-09', 122971, 9.078, 97770, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-10', 79360, 10.93, 120886, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-11', 152747, 6.024, 96306, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-11', 128430, 14.427, 160140, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-11', 123385, 10.917, 117576, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-11', 248680, 7.195, 77058, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-12', 152855, 5.209, 85584, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-12', 79654, 12.237, 135341, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-12', 128917, 14.479, 155070, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-12', 274671, 9.874, 106343, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-13', 385462, 12.829, 141885, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-13', 275035, 9.617, 103575, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-13', 123789, 10.577, 113914, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-14', 153150, 7.649, 125673, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-14', 79911, 10.011, 110722, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-14', 129106, 7.417, 79437, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-14', 248898, 8.218, 91220, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-15', 275340, 7.87, 84760, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-15', 126775, 12.837, 200000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-15', 124132, 11.738, 126418, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-16', 80098, 6.516, 72067, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-16', 124418, 6.628, 71384, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-17', 129489, 12.036, 133118, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-17', 153747, 14.361, 158833, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-17', 83633, 11.492, 188469, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-18', 153397, 7.05, 109839, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-18', 275557, 7.13, 76790, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-18', 124654, 7.442, 80150, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-19', 129813, 10.589, 117114, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-19', 276266, 6.517, 70188, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-19', 275912, 8.842, 95228, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-19', 125010, 6.608, 71167, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-19', 249313, 12.102, 133848, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-20', 153576, 5.309, 87227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-20', 80453, 11.292, 124890, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-20', 130084, 8.683, 96380, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-20', 193066, 13.404, 142485, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-21', 154025, 4.432, 49018, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-21', 249690, 11.837, 126774, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-22', 153711, 5.848, 94855, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-22', 80876, 13.422, 148447, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-22', 130307, 7.7, 82467, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-22', 193153, 5.727, 63341, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-23', 81156, 9.02, 96604, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-23', 125294, 10.739, 115659, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-24', 153938, 4.959, 80435, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-24', 385674, 9.806, 105022, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-24', 154162, 10.349, 114460, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-24', 276479, 6.502, 70027, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-25', 81523, 11.689, 129280, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-25', 130642, 10.917, 116812, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-25', 276648, 4.998, 53828, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-25', 65924, 9.045, 96872, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-25', 249874, 7.044, 77907, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-26', 154084, 5.801, 91656, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-26', 130839, 6.945, 74381, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-26', 276972, 6.297, 67817, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-26', 193208, 3.738, 40034, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-26', 125841, 14.236, 153322, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-27', 81841, 9.68, 107061, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-27', 154416, 10.31, 110420, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-27', 277082, 5.946, 61601, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-27', 247631, 8.678, 95979, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-28', 154245, 6.449, 105957, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-28', 131043, 7.283, 80840, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-28', 118409, 11.785, 132110, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-28', 277409, 8.238, 88723, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-28', 193291, 6.179, 66177, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-28', 66174, 10.788, 119315, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-02-28', 7442, 12.771, 137927, 'Diesel'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-01', 82017, 6.697, 74069, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-01', 126336, 13.86, 149272, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-02', 131311, 9.806, 108749, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-02', 84459, 15.158, 248591, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-02', 278316, 6.569, 67135, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-02', 278046, 10.389, 107526, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-02', 277594, 5.035, 54227, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-03', 154493, 5.244, 84322, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-03', 82199, 7.773, 86203, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-03', 193373, 5.429, 58036, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-04', 131674, 12.198, 130885, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-04', 293677, 12.055, 129591, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-04', 154737, 12.074, 133901, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-04', 278633, 9.934, 106989, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-04', 193452, 2.931, 31684, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-04', 126636, 8.25, 88852, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-05', 154637, 5.344, 85397, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-05', 193600, 6.948, 76220, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-05', 16475, 12, 133080, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-05', 126844, 5.306, 57146, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-06', 82521, 11.155, 119470, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-06', 279003, 7.991, 86063, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-06', 193684, 5.877, 65176, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-07', 154811, 4.178, 64592, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-07', 82777, 7.643, 84761, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-07', 132061, 12.799, 141941, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-07', 66689, 9.276, 102871, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-07', 127197, 11.278, 121464, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-08', 155009, 5.263, 82471, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-08', 82930, 4.872, 52179, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-08', 155009, 12.095, 138367, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-08', 279202, 6.672, 71857, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-09', 132281, 8.12, 90051, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-09', 279389, 4.654, 50124, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-10', 155300, 5.905, 95779, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-10', 83103, 5.562, 59569, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-10', 193757, 4.771, 51360, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-11', 155445, 4.795, 78926, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-11', 83330, 7.515, 80486, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-11', 155211, 9.233, 96854, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-11', 279662, 6.873, 74022, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-11', 126825, 9.628, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-11', 193821, 5.617, 62293, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-12', 83687, 10.533, 116811, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-12', 247807, 8.616, 95551, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-12', 128004, 5.08, 54712, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-12', 127781, 14.421, 155314, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-13', 155615, 4.814, 77409, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-13', 14291, 10.513, 165580, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-13', 155513, 8.747, 100066, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-13', 280089, 10.641, 114604, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-14', 84110, 6.606, 73325, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-14', 83890, 7.745, 81323, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-14', 280239, 4.372, 47086, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-14', 193888, 4.04, 44804, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-15', 84340, 7.686, 85007, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-15', 132542, 10.26, 109885, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-15', 118796, 12.884, 144430, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-15', 248047, 9.446, 104756, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-16', 155829, 8.281, 136305, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-16', 280564, 7.787, 83866, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-17', 85040, 11.357, 125608, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-17', 84584, 8.927, 99000, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-17', 132738, 7.223, 77358, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-17', 193970, 3.185, 35322, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-17', 248315, 9.216, 98169, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-18', 156021, 5.163, 81885, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-18', 280813, 7.545, 81260, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-18', 128495, 17.04, 183521, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-19', 85460, 10.696, 118619, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-19', 248457, 5.6, 59976, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-19', 250105, 8.725, 93445, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-20', 385951, 13.162, 140965, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-20', 281101, 8.096, 87194, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-20', 248658, 6.246, 66895, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-20', 128973, 12.493, 134550, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-21', 85768, 9.779, 108449, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-21', 133033, 12.084, 134012, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-21', 129449, 13.487, 145255, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-22', 156261, 5.622, 91554, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-22', 85909, 4.826, 51686, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-22', 281420, 8.54, 91976, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-23', 248954, 12.644, 142245, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-23', 129771, 8.891, 96378, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-24', 156513, 7.056, 116071, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-24', 86278, 4.527, 50657, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-24', 86127, 6.163, 68964, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-24', 133341, 12.172, 136205, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-25', 281676, 6.791, 73614, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-26', 156690, 4.423, 70370, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-26', 86539, 7.559, 81562, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-26', 386173, 10.575, 114104, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-26', 133901, 16.684, 180020, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-26', 84654, 12.834, 213044, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-26', 249358, 11.585, 125002, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-26', 250291, 7.381, 82593, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-27', 86713, 5.574, 60143, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-27', 281899, 5.863, 63555, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-27', 126854, 9.579, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-27', 250560, 7.945, 86203, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-28', 282025, 4.02, 43577, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-29', 156844, 5.365, 83318, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-29', 386343, 8.344, 90032, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-29', 119200, 12.621, 142491, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-29', 282366, 9.8, 106232, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-30', 157057, 5.165, 85532, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-30', 86988, 9.509, 102602, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-30', 134235, 11.22, 121064, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-30', 249599, 10.584, 118435, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-31', 282651, 6.85, 74254, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-03-31', 249718, 4.331, 46731, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-01', 282887, 5.997, 65007, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-01', 130078, 9.069, 98308, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-02', 87203, 8.384, 93817, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-02', 134587, 13.179, 142201, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-02', 155896, 14.795, 159638, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-03', 157450, 6.172, 97147, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-03', 87404, 5.732, 62192, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-03', 283112, 4.666, 50579, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-04', 87730, 10.13, 109303, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-04', 134768, 7.285, 79042, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-04', 283318, 5.284, 57279, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-04', 250103, 17.136, 190038, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-04', 130460, 10.483, 107660, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-05', 157600, 5.889, 93694, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-05', 88111, 11.485, 123923, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-05', 135095, 9.719, 108756, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-06', 119754, 13.546, 142368, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-06', 130808, 9.498, 102958, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-07', 157771, 5.806, 96147, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-07', 386488, 8.353, 90129, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-07', 135457, 10.833, 116888, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-07', 283523, 5.551, 60173, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-07', 131195, 11.101, 121001, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-08', 88398, 10.187, 109918, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-08', 250288, 7.053, 78923, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-09', 157928, 5.159, 84711, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-09', 283802, 6.796, 73669, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-09', 131605, 10.928, 118460, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-10', 88663, 9.112, 102045, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-10', 135748, 10.214, 110209, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-10', 250531, 8.934, 96398, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-10', 131790, 5.816, 63045, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-10', 250856, 11.681, 126038, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-11', 158172, 5.763, 91862, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-11', 120303, 15.13, 170818, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-11', 284096, 7.163, 77647, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-11', 194180, 16.688, 180064, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-12', 158285, 3.854, 63283, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-12', 88970, 10.277, 115000, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-12', 90000, 12.288, 202506, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-12', 284227, 4.084, 44271, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-13', 89230, 7.922, 85478, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-13', 284487, 5.961, 64617, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-13', 250749, 8.472, 94802, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-14', 136084, 11.552, 123953, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-14', 194284, 7.746, 83579, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-14', 132210, 10.566, 114535, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-14', 251060, 8.382, 96561, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-15', 158630, 8.656, 134514, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-15', 89416, 6.416, 71795, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-15', 8483, 8.529, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-15', 284699, 4.323, 46861, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-15', 126885, 9.579, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-15', 132431, 5.808, 62959, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-16', 89566, 6.682, 74772, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-16', 251113, 13.874, 149700, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-16', 132934, 12.968, 140573, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-17', 334939, 5.988, 65868, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-17', 334672, 10.376, 108637, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-17', 158786, 6.361, 98532, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-17', 89696, 4.452, 49818, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-17', 136469, 12.326, 132998, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-17', 284938, 5.927, 64249, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-18', 14395, 8.218, 130091, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-19', 159029, 6.31, 101970, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-20', 136803, 1.326, 14831, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-21', 159495, 7.098, 112929, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-21', 90015, 10.687, 119588, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-21', 136850, 10.154, 109562, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-21', 285158, 5.467, 59262, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-21', 194418, 4.611, 50029, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-22', 90278, 7.994, 89453, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-22', 194552, 8.107, 90717, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-22', 251348, 8.089, 90516, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-23', 137167, 9.105, 101885, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-23', 285410, 7.587, 82243, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-24', 159836, 7.931, 130227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-24', 90550, 9.746, 109058, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-24', 286104, 9.514, 103132, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-24', 285740, 8.58, 93007, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-24', 133434, 14.502, 157202, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-24', 251312, 9.027, 101012, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-25', 286461, 9.158, 99273, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-25', 251612, 8.649, 93323, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-25', 251554, 8.143, 87863, 'Diesel'
FROM vehicles WHERE placa = 'TRG542';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-26', 160075, 8.23, 136289, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-26', 120694, 14.107, 159268, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-26', 286770, 7.62, 82601, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-27', 91080, 5.333, 57543, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-27', 133836, 10.831, 117408, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-28', 91806, 15.185, 166883, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-28', 91139, 2.632, 29452, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-28', 293900, 10.919, 118471, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-28', 194866, 14.983, 161667, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-29', 335200, 9.37, 104850, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-29', 137526, 12.518, 140076, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-29', 293954, 3.232, 36166, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-29', 287323, 6.331, 68628, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-29', 287049, 6.47, 70135, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-29', 134140, 9.875, 107045, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-30', 160295, 5.881, 97389, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-30', 90001, 14.321, 236010, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-04-30', 194961, 3.75, 41963, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-01', 92020, 8.964, 100307, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-01', 137835, 9.083, 98006, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-01', 287475, 4.833, 52390, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-02', 138118, 7.331, 79101, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-02', 251901, 9.921, 111016, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-02', 134391, 6.964, 75490, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-03', 160489, 6.273, 103881, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-03', 92269, 7.816, 83311, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-03', 287965, 10.793, 116996, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-03', 252114, 7.823, 84410, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-04', 92444, 5.674, 61222, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-04', 138254, 4.494, 50288, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-05', 160779, 7.852, 130029, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-05', 92838, 11.212, 116717, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-05', 134997, 14.105, 152898, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-06', 335400, 9.271, 100034, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-06', 93148, 9.771, 109337, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-06', 288112, 5.07, 54959, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-07', 121158, 13.684, 144079, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-07', 126927, 9.579, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-07', 135360, 8.462, 91728, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-08', 335600, 7.287, 78627, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-08', 93728, 9.383, 101243, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-08', 93372, 6.793, 73296, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-08', 294118, 7.739, 86599, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-08', 135730, 7.946, 86135, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-09', 161031, 6.481, 100002, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-09', 386577, 6.805, 76148, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-09', 138475, 8.422, 90873, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-10', 93940, 8.379, 93342, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-10', 138768, 9.44, 101858, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-10', 288512, 10.825, 117343, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-11', 121693, 12.349, 137074, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-11', 252400, 11.614, 125315, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-12', 161200, 6.966, 112571, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-12', 139045, 9.438, 101836, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-12', 136214, 11.019, 119446, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-13', 139341, 9.913, 106961, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-13', 122318, 14.089, 159065, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-13', 288980, 11.948, 129516, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-13', 40089, 6.485, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN265';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-14', 161499, 8.41, 139270, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-14', 94289, 12.787, 143855, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-14', 386755, 7.026, 78620, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-14', 136778, 13.388, 145929, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-15', 289301, 8.661, 93885, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-15', 252742, 12.997, 149725, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-16', 94621, 10.064, 112616, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-16', 139685, 10.983, 119166, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-16', 289790, 11.288, 122362, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-17', 161744, 5.743, 89361, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-17', 139996, 8.455, 91229, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-17', 137119, 10.945, 118644, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-18', 140257, 8.777, 98215, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-18', 253148, 15.248, 165441, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-19', 43015, 4, 63196, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-19', 161922, 4.444, 73593, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-19', 98000, 14.551, 239800, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-19', 137306, 5.41, 58644, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-19', 40548, 6.485, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN265';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-20', 94907, 11.465, 128293, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-20', 140586, 10.094, 109520, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-20', 137849, 13.479, 142069, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-21', 43193, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-21', 162117, 6.524, 105428, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-21', 95047, 4.195, 45264, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-21', 290199, 12.718, 137863, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-21', 253623, 4.366, 47196, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-21', 253501, 11.62, 125380, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-21', 138212, 8.07, 87479, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-22', 95374, 12.042, 129933, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-22', 386873, 8.652, 95951, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-22', 140933, 10.288, 111008, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-22', 290404, 5.775, 63352, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-23', 43437, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-23', 162325, 6.445, 100091, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-23', 253968, 10.365, 115466, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-23', 66846, 9.579, 107189, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-24', 95587, 8.436, 91024, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-24', 141222, 10.174, 115017, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-24', 138665, 12.151, 131717, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-25', 162566, 7.322, 119349, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-26', 141474, 7.25, 78228, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-26', 9091, 9.703, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-26', 290688, 8.994, 97495, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-26', 126960, 9.66, 150020, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-26', 139010, 8.149, 88335, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-27', 43693, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-27', 95862, 10.81, 120964, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-27', 386998, 6.514, 70286, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-27', 254138, 7.394, 80188, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-27', 67010, 8.033, 89488, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-27', 40764, 6.488, 100045, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN265';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-28', 96169, 10.021, 108227, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-28', 141754, 9.074, 97908, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-28', 290860, 4.756, 51555, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-29', 43922, 4, 61560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-29', 14483, 9.442, 149467, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-29', 291053, 4.598, 49842, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-29', 254334, 8.003, 86352, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-29', 139347, 8.536, 92530, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-30', 122676, 13.185, 148859, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-30', 254602, 8.654, 96916, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-31', 96540, 11.567, 133252, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-31', 142037, 9.706, 108610, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-05-31', 139627, 7.779, 84324, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-01', 44169, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-01', 139752, 4.257, 46146, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-02', 96829, 9.708, 105235, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-02', 142410, 11.057, 124170, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-02', 254981, 12.402, 134438, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-02', 41041, 6.464, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN265';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-03', 44477, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-03', 142717, 9.288, 100032, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-03', 291344, 8.555, 88373, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-04', 96942, 4.899, 55016, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-04', 387300, 12.28, 137904, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-04', 291563, 5.615, 60867, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-04', 255066, 4.389, 49288, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-04', 139988, 6.824, 73972, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-05', 44731, 4, 62040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-05', 97336, 13.519, 151818, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-05', 387610, 10.016, 110076, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-05', 143019, 9.91, 111985, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-05', 122910, 8.613, 90006, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-06', 388026, 13.345, 141857, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-06', 255357, 10.626, 119330, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-06', 67169, 8.171, 91760, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-07', 97593, 9.15, 99094, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-07', 140531, 14.895, 161462, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-08', 44978, 4, 62080, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-08', 143558, 7.592, 85258, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-08', 143319, 10.213, 114692, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-09', 45166, 4, 62160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-09', 143782, 6.816, 73409, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-09', 255644, 13.39, 145014, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-09', 41377, 6.465, 100014, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN265';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-10', 162854, 8.715, 144669, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-10', 97940, 12.921, 139160, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-10', 388215, 8.542, 95927, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-10', 291848, 8.623, 93473, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-10', 255654, 1.55, 17407, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-10', 140994, 12.976, 140660, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-11', 45406, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-11', 388340, 4.957, 53684, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-11', 144116, 10.306, 115736, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-11', 9127, 9.672, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-12', 98211, 8.644, 97072, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-12', 98001, 14.879, 245801, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-12', 141347, 10.965, 118861, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-13', 45519, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-13', 98401, 6.588, 72402, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-13', 388851, 9.522, 98934, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-13', 144498, 11.94, 134920, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-14', 45733, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-14', 163175, 8.658, 140086, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-14', 8620, 8.504, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-15', 98648, 9.349, 101250, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-15', 389145, 8.725, 97982, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-15', 123488, 13.991, 147885, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-15', 41782, 6.464, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LSN265';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-16', 45948, 4, 61760, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-16', 144789, 9.781, 105928, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-16', 141672, 9.488, 102850, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-17', 144947, 5.573, 62585, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-17', 292063, 6.702, 72650, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-17', 126996, 9.628, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-17', 256096, 15.666, 175929, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-17', 67360, 12.247, 132635, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-18', 163651, 7.283, 113469, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-18', 98934, 8.924, 100217, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-18', 389351, 9.018, 93877, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-18', 145186, 6.832, 77200, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-18', 292427, 9.401, 101907, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-18', 141907, 7.852, 85116, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-19', 46179, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-19', 389513, 6.202, 67168, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-20', 99177, 9.08, 97792, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-20', 389693, 6.058, 65608, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-20', 124028, 14.196, 153743, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-20', 292689, 7.775, 84281, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-21', 99834, 10.536, 117266, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-21', 99460, 9.055, 94480, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-22', 46430, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-22', 164048, 9.185, 152471, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-22', 389788, 4.064, 45639, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-22', 145573, 12.979, 145754, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-22', 292850, 5.01, 54308, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-22', 142076, 5.316, 56403, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-23', 46563, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-24', 100018, 6.609, 71575, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-24', 390078, 10.048, 112839, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-25', 46824, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-25', 100462, 11.986, 125733, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-26', 164371, 9.175, 144782, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-26', 100563, 4.114, 44555, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-26', 145776, 10.014, 112457, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-26', 256371, 14.131, 153039, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-26', 7663, 11.761, 127019, 'Diesel'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-27', 47074, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-27', 390254, 9.049, 102255, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-27', 9155, 6.448, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-27', 293162, 8.672, 94004, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-27', 142432, 9.283, 98493, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-28', 100867, 9.238, 103743, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-28', 390441, 7.081, 77006, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-28', 146005, 7.698, 86449, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-28', 142625, 5.605, 59469, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-29', 101191, 9.108, 98640, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-30', 164690, 8.529, 135185, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-30', 146351, 10.496, 117870, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-30', 98003, 13.862, 229000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-30', 293404, 7.504, 79617, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-06-30', 195140, 7.106, 76958, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-01', 390546, 5.488, 59545, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-01', 156349, 14.886, 161261, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-02', 124341, 11.635, 131825, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-02', 293798, 4.007, 43436, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-02', 293664, 8.472, 88448, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-02', 142807, 5.737, 62189, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-03', 164887, 7.06, 109218, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-03', 101506, 11.062, 124226, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-04', 101712, 5.955, 63361, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-04', 391368, 8.755, 95780, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-04', 391041, 12.37, 130009, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-04', 146610, 10.377, 116534, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-04', 293977, 6.98, 75663, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-05', 47721, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-05', 101920, 6.368, 68965, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-05', 143068, 7.397, 80183, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-06', 165117, 7.108, 113444, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-06', 102114, 6.172, 69312, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-06', 391725, 11.851, 133087, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-07', 48000, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-07', 391925, 5.976, 67110, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-07', 146888, 9.115, 97895, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-07', 9225, 6.448, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 48180, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 165333, 7.963, 132186, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 102412, 9.468, 100740, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 392058, 5.512, 61900, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 147215, 9.883, 111680, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 127030, 9.622, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 195180, 5.043, 54616, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-08', 143300, 6.257, 67826, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-09', 48341, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-09', 102669, 9.006, 97535, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-09', 392247, 7.477, 83967, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-09', 156659, 12.968, 145631, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-09', 294231, 7.252, 78612, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-09', 143679, 9.605, 104118, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-10', 195284, 5.932, 66616, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-11', 48660, 4, 65032, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-11', 165545, 6.713, 111369, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-11', 392549, 10.552, 114278, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-11', 147539, 11.511, 129269, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-11', 143936, 8.155, 88400, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-12', 102928, 9.612, 104098, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-13', 48916, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-13', 165702, 5.403, 83855, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-13', 103084, 6.352, 71333, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-13', 392727, 7.34, 82940, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-14', 165883, 3.989, 65017, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-14', 147666, 6.774, 73362, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-15', 103391, 9.815, 102174, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-15', 9268, 6.456, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-15', 144198, 7.091, 76866, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-16', 393350, 8.907, 100026, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-16', 393073, 13.007, 138394, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-16', 148100, 10.623, 115047, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-16', 156939, 11.904, 133682, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-17', 49163, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-17', 166071, 5.746, 93678, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-17', 103734, 11.313, 122520, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-17', 14588, 10.188, 161276, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-17', 294395, 5.091, 55186, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-17', 144553, 12.129, 131478, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-18', 166245, 4.532, 72648, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-18', 103957, 7.401, 83113, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-18', 393534, 6.668, 72214, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-19', 104386, 11.763, 128687, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-19', 294644, 7.181, 77842, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-20', 49384, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-20', 166352, 4.201, 68014, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-20', 104859, 14.017, 154047, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-20', 148420, 9.985, 112132, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-21', 49539, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-21', 148631, 7.594, 82243, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-21', 294884, 6.777, 73463, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-21', 195494, 7.661, 83428, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-22', 49752, 4, 62080, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-22', 393823, 10.853, 121879, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-22', 157350, 14.07, 158006, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-22', 295152, 6.775, 73441, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-22', 195531, 3.351, 36492, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 166646, 6.802, 105227, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 105094, 8.802, 95326, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 393925, 5.155, 55829, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 124742, 14.169, 160535, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 295338, 1.945, 21083, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 127056, 9.646, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 256716, 14.492, 156948, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-23', 144832, 9.314, 100964, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-24', 105308, 7.394, 83035, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-24', 100000, 11.308, 186808, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-24', 257030, 10.161, 114921, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 49991, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 166762, 4.277, 70057, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 105618, 11.359, 127562, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 149140, 16.424, 177872, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 149111, 1.541, 16777, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 8716, 8.507, 100042, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 295694, 12.308, 133419, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 195615, 3.53, 39642, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-25', 145123, 7.878, 85398, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-26', 50208, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-26', 105784, 5.635, 60914, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-26', 394037, 4.703, 52815, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-26', 295927, 6.256, 67815, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-27', 50355, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-27', 106196, 5.252, 56879, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-27', 106001, 5.384, 57878, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-27', 149424, 9.181, 97686, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-27', 195747, 5.369, 58146, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-28', 394151, 4.676, 52511, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-28', 195843, 5.366, 60260, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-28', 145340, 5.999, 65029, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-29', 50589, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-29', 106484, 8.736, 94611, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-29', 257453, 3.291, 36958, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-29', 257392, 9.605, 104022, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-30', 166957, 8.057, 133746, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-30', 394277, 5.622, 61224, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-30', 296180, 7.472, 80996, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-30', 145532, 7.047, 76389, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-31', 50835, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-31', 204123, 7.541, 81744, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-31', 106765, 7.952, 86120, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-31', 149819, 13.383, 150291, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-07-31', 296374, 5.548, 60140, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-01', 51028, 4, 65040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-02', 167180, 7.971, 132319, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-02', 107328, 7.206, 78473, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-02', 107083, 12.266, 132841, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-03', 51250, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-03', 394383, 5.642, 61441, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-03', 150231, 13.324, 149629, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-03', 145844, 8.574, 93285, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-04', 51533, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-04', 167355, 5.42, 89972, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-04', 107705, 9.49, 102112, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-04', 195944, 8.982, 97814, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-05', 108074, 11.591, 125067, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-05', 150425, 8.448, 91492, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-05', 146112, 8.853, 96321, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-06', 394593, 8.054, 85292, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-06', 73854, 13.473, 222574, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-06', 296561, 6.359, 69186, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-06', 146430, 9.014, 98072, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-07', 51740, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-07', 167568, 5.954, 98836, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-07', 108205, 5.588, 62580, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-07', 125648, 13.466, 145837, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-08', 394784, 7.866, 88886, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-08', 150756, 10.838, 117376, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-08', 196144, 10.438, 113075, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-08', 146813, 8.965, 97539, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-09', 108617, 13.133, 142270, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-09', 296714, 4.922, 53551, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-09', 257664, 10.104, 113468, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-10', 51888, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-10', 167829, 7.382, 117005, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-11', 52128, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-11', 108874, 8.545, 95960, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-11', 394905, 6.097, 64567, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-11', 196327, 9.749, 103924, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-12', 296873, 4.454, 48460, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-12', 147193, 11.568, 125860, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-13', 52242, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-13', 168015, 6.333, 101898, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-13', 109161, 9.187, 99128, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-13', 151049, 11.925, 129148, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-13', 127093, 9.646, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-14', 297055, 5.924, 64453, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-14', 147551, 9.965, 108419, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-15', 204395, 11.641, 121532, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-15', 168227, 8.854, 146976, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-15', 395147, 9.479, 102658, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-15', 151385, 10.732, 120520, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-15', 297248, 5.256, 57185, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-15', 196477, 8.784, 95658, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-15', 257855, 11.092, 119239, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-16', 204651, 7.817, 85049, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-17', 52486, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-17', 395397, 8.176, 89364, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-17', 108753, 12.677, 209424, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-17', 147766, 6.188, 67325, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-18', 52588, 3.028, 49326, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-18', 168466, 5.837, 90182, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-18', 258145, 9.921, 112405, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-19', 168606, 4.72, 72924, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-19', 395533, 5.717, 62544, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-19', 294376, 14.386, 162993, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-19', 297642, 10.439, 114620, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-20', 109495, 11.617, 127090, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-20', 151697, 11.396, 129117, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-21', 52901, 3.247, 50423, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-21', 204924, 10.108, 106235, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-21', 168722, 4.753, 73576, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-21', 395889, 12.893, 146078, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-22', 53080, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-22', 109798, 10.229, 115895, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-22', 294504, 6.734, 73603, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-22', 148072, 10.196, 111952, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-23', 109964, 5.334, 60434, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-23', 151996, 9.887, 108164, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-23', 294624, 4.857, 55613, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-24', 53293, 4, 61960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-24', 168943, 7.722, 128185, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-24', 152227, 8.273, 90507, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-24', 297804, 5.455, 59896, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-25', 53551, 4, 62120, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-25', 205264, 11.344, 124557, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-25', 57891, 20.22, 222016, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-25', 9286, 6.456, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-25', 157632, 13.515, 147719, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-25', 148475, 10.554, 115883, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-26', 294720, 3.735, 40674, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-27', 169174, 7.648, 126957, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-27', 110249, 10.149, 114988, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-27', 294870, 0.615, 6716, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-27', 297987, 5.221, 57327, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-28', 205688, 12, 131760, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-28', 152615, 11.669, 127542, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-28', 294942, 9.235, 99461, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-28', 196683, 12.922, 141237, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-29', 53840, 4, 63040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-29', 110584, 11.391, 123821, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-29', 258608, 20, 215860, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-29', 148927, 13.275, 145760, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-30', 335876, 13.198, 149533, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-30', 54090, 4, 62120, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-30', 169433, 8.172, 124868, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-30', 152940, 11.787, 133547, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-30', 126534, 13.862, 152066, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-30', 127122, 9.642, 150030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-30', 258839, 9.486, 103777, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-31', 54218, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-08-31', 206001, 12, 131760, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-01', 54472, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-01', 206230, 7.67, 80382, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-01', 153199, 8.974, 94406, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-01', 108754, 14.953, 247024, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-01', 259133, 9.524, 104193, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-02', 169641, 7.457, 123786, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-02', 14683, 3.122, 49048, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-03', 54912, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-03', 58575, 18.217, 200023, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-03', 196896, 13.24, 142330, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-04', 206674, 12, 131760, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-04', 110918, 12.944, 141607, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-04', 153834, 18.484, 202215, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-04', 149140, 6.435, 70656, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-05', 336124, 10.096, 108835, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-05', 55007, 2.994, 46249, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-05', 169939, 8, 128720, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-05', 58747, 6.857, 75290, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-05', 298427, 9.99, 109690, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-06', 154274, 12.17, 133018, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-06', 127259, 9.596, 99319, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-07', 170181, 6.287, 101158, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-07', 58997, 9.872, 108395, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-07', 111185, 10.239, 116008, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-07', 149375, 6.449, 70810, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-09', 336387, 10.049, 113855, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-09', 55348, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-09', 111429, 8.543, 93033, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-09', 14697, 10.537, 165536, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-09', 298670, 7.461, 81922, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-09', 197113, 12.752, 138232, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-10', 55603, 4, 65032, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-10', 170367, 6.982, 108081, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-10', 111630, 6.907, 78256, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-10', 154674, 14.055, 159243, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-10', 127805, 8.791, 99606, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-10', 299201, 15.042, 165161, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-11', 336497, 4.587, 51971, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-11', 55805, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-11', 197205, 6.83, 71783, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-11', 149761, 10.716, 117662, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-12', 336639, 6.053, 68580, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-12', 56086, 4, 61960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-12', 59407, 14.72, 154707, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-12', 154861, 7.076, 80171, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-12', 8832, 8.432, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-12', 299404, 5.434, 59665, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-12', 7969, 11.826, 128903, 'Diesel'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-13', 170474, 5.291, 87831, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-13', 111914, 11.924, 135099, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-13', 197471, 9.88, 107988, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-14', 112289, 11.334, 123427, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-14', 149931, 5.92, 65002, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-15', 56384, 4, 61800, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-15', 299593, 6.96, 76421, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-16', 206948, 9.263, 101708, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-16', 112592, 10.267, 112321, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-16', 155224, 13.968, 150016, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-16', 300109, 11.747, 123461, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-16', 259484, 16.656, 181384, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 56572, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 112890, 10.486, 118806, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 155615, 12.236, 138634, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 157969, 14.02, 158847, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 108755, 11.622, 191995, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 128041, 14.135, 154354, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 127155, 9.64, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 259796, 3.047, 34515, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-17', 150184, 7.744, 85029, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-18', 113110, 6.884, 74141, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-18', 56016, 13, 141570, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-19', 56782, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-19', 170717, 7.515, 124749, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-19', 59822, 14.028, 147995, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-19', 300365, 7.482, 82152, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-20', 57052, 4, 65032, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-20', 156271, 6.745, 76421, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-20', 156014, 13.424, 146187, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-20', 259931, 14.541, 158351, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-21', 170859, 4.494, 74241, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-21', 300691, 10.334, 113467, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-22', 113472, 11.01, 124743, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-22', 300883, 4.06, 44579, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-23', 336941, 5.694, 60015, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-23', 57226, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-23', 207353, 12, 131760, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-23', 113952, 8.483, 95264, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-23', 113615, 4.612, 52254, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-23', 396709, 9.678, 101609, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-23', 150584, 11.688, 128334, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-24', 114363, 14.192, 160355, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-24', 156716, 14.066, 159368, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-24', 301043, 7.116, 78134, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-24', 260179, 11.125, 121708, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-25', 171081, 7.177, 115478, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-25', 128992, 15.445, 168814, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-26', 57495, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-26', 114714, 12.269, 139008, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-27', 60190, 12.825, 135817, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-27', 127791, 10.994, 177993, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-27', 260416, 9.215, 104406, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-27', 150942, 12.703, 139479, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-28', 115015, 9.48, 107408, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-28', 397035, 11.14, 126216, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-29', 57730, 4, 61560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-29', 171275, 4.72, 76417, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-29', 301359, 10.3, 113094, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-30', 207729, 12, 131760, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-30', 115288, 9.134, 103488, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-30', 157043, 11.986, 130528, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-30', 9307, 6.456, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-30', 108756, 16.146, 266732, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-30', 197605, 10.522, 114058, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-09-30', 151330, 11.192, 122888, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-01', 57944, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-01', 115505, 7.999, 90629, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-01', 397252, 10.653, 120698, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-02', 171454, 7.563, 125546, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-02', 115817, 9.607, 105101, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-02', 56800, 13, 136448, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-02', 301769, 12.519, 137459, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-03', 58232, 4, 61680, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-03', 60518, 10.265, 110041, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-03', 116275, 12.097, 131736, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-03', 397677, 5.355, 60672, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-03', 397516, 9.835, 106021, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-03', 302017, 6.213, 68219, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-03', 151686, 10.623, 116641, 'Diesel'
FROM vehicles WHERE placa = 'EQR890';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-04', 116447, 6.186, 70087, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-04', 260681, 12.789, 144899, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-05', 58486, 4, 61680, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-05', 302130, 3.941, 43272, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-05', 261079, 15.908, 180238, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-06', 171715, 6.228, 96409, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-06', 116710, 10.065, 114036, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-06', 398023, 13.323, 145087, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-06', 302640, 12.242, 134417, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-07', 58714, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-07', 207984, 9.96, 109361, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-07', 303330, 6.248, 68603, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-07', 303083, 12.174, 132210, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-08', 58867, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-08', 208189, 5.618, 61686, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-08', 60839, 11.237, 123382, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-08', 117034, 12.868, 145794, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-08', 398189, 4.264, 48311, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-08', 129274, 8.61, 94107, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-09', 337322, 14.607, 165497, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-09', 171966, 7.483, 118905, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-09', 157562, 8.201, 92097, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-09', 157215, 7.59, 85995, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-10', 117400, 12.149, 137648, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-10', 398532, 13.88, 157260, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-10', 129824, 14.365, 162756, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-10', 303668, 9.358, 94703, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-11', 59138, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-11', 117890, 12.832, 142435, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-11', 304066, 10.492, 115202, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-12', 337653, 11.242, 122987, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-12', 59417, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-12', 118575, 15.478, 180473, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-12', 118089, 6.853, 77644, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-12', 398866, 10.477, 118704, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-13', 59585, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-13', 172200, 6.777, 112498, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-14', 59820, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-14', 61251, 13.962, 153303, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-14', 118900, 9.243, 101026, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-14', 304311, 7.752, 85117, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-15', 60006, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-15', 399178, 5.132, 56144, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-15', 399075, 8.905, 96975, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-15', 261303, 11.209, 126998, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-16', 208558, 10.806, 118650, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-16', 304618, 9.377, 102959, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-17', 60230, 3.486, 56791, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-17', 172474, 8.188, 135921, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-17', 399445, 8.737, 95583, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-17', 108757, 10.734, 177326, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-18', 60394, 4, 65160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-18', 119194, 11.673, 132255, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-18', 399595, 5.897, 66223, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-19', 60638, 4, 62240, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-19', 304786, 5.17, 56767, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-20', 80863, 4, 65160, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-20', 61578, 12.592, 138260, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-20', 261639, 0.467, 5105, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-21', 119411, 8.002, 87542, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-21', 56983, 13, 138801, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-21', 197964, 9.15, 100000, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-21', 261680, 15.243, 172703, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-22', 338004, 13.345, 143859, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-22', 305149, 8.661, 95096, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-22', 198075, 13.029, 147619, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-24', 209047, 12, 131520, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-24', 173157, 8.503, 131032, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-24', 119930, 5.669, 64797, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-25', 61232, 4, 65560, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-25', 120471, 13.942, 152247, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-25', 8934, 8.362, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-26', 305687, 7.528, 83410, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-27', 61671, 4, 65560, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-27', 61469, 4, 62200, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-27', 62149, 15.648, 173380, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-27', 400322, 9.099, 99998, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-27', 9328, 6.403, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-27', 127242, 9.563, 150043, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-28', 61779, 4, 62640, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-28', 62384, 7.834, 86801, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-28', 120792, 10.68, 117907, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-28', 108758, 9.26, 153901, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-28', 130289, 15.265, 174479, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-28', 306127, 11.674, 124211, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-28', 262281, 8.681, 99224, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-29', 173362, 6.523, 101628, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-29', 400575, 9.481, 104196, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-29', 158398, 12.536, 142033, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-29', 14810, 11.812, 187102, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-30', 209339, 3.107, 34425, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-30', 121109, 9.996, 115454, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-30', 262521, 9.05, 99912, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-31', 61908, 3.669, 60018, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-10-31', 62689, 11.408, 126401, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-01', 262804, 11.808, 134788, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-02', 401172, 6.047, 69117, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-02', 158835, 8.749, 100000, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-02', 306939, 11.665, 129248, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-03', 62260, 4, 63520, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-03', 158988, 8.57, 94613, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-04', 62490, 4, 65432, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-04', 198185, 6.659, 73515, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-05', 338140, 5.986, 68420, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-05', 62600, 3.41, 55781, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-05', 173868, 6.792, 109962, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-05', 159310, 9.274, 102385, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-05', 307185, 7.515, 83266, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-05', 198258, 5.188, 59299, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-06', 62868, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-06', 209752, 12, 132960, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-06', 263104, 10.901, 120347, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-07', 338305, 6.95, 79439, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-07', 62939, 2.538, 41517, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-07', 209921, 8.239, 91288, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-07', 174045, 9.235, 154225, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-07', 62997, 12.44, 132362, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-07', 159559, 9.649, 105850, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-07', 307567, 9.997, 110767, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-08', 307943, 10.012, 110933, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-09', 63341, 4, 62720, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-09', 174300, 4.958, 80270, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-09', 122178, 8.781, 100367, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-09', 108759, 4.866, 80878, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-09', 130765, 9.058, 100000, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-10', 63553, 4, 62640, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-10', 122362, 9.666, 105166, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-10', 295193, 9.1, 100000, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-10', 198471, 10.621, 121398, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-11', 63777, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-11', 174569, 7.52, 122501, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-11', 159843, 10.894, 127460, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-11', 308268, 9.504, 105304, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-12', 63840, 3.223, 50504, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-12', 122680, 9.1, 100009, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-12', 295321, 9.256, 100705, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-12', 308515, 6.043, 66956, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-12', 67617, 16.485, 183313, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-13', 174828, 8.296, 138543, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-13', 63344, 16.354, 171553, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-13', 122939, 12.374, 136733, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-13', 863364, 9.978, 116743, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-14', 295444, 8.889, 101601, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-14', 130918, 11.485, 131274, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-15', 176040, 5.617, 92568, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-15', 308983, 13.265, 146976, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-16', 64129, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-16', 160227, 12.961, 142441, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-17', 64276, 2.766, 45246, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-18', 175378, 7.267, 121286, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-18', 131468, 13.164, 141908, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-18', 309209, 6.758, 74879, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-18', 233700, 12.207, 139526, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-19', 210348, 12, 132960, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-19', 63613, 8.384, 91889, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-19', 123336, 13.624, 155722, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-19', 198642, 8.693, 94580, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-20', 160639, 13.332, 145052, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-20', 295813, 16.438, 187886, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-20', 309465, 7.351, 81449, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-21', 64721, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-21', 175595, 8.086, 132610, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-21', 123537, 7.468, 82073, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-21', 295960, 6.424, 70985, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-21', 309703, 8.067, 89382, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-21', 127301, 9.56, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-22', 64843, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-22', 132013, 13.722, 145865, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-23', 63876, 11.217, 118003, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-23', 401454, 12.252, 140040, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-24', 175858, 6.586, 110118, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-24', 161239, 10.861, 124141, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-24', 161061, 9.1, 100000, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-24', 309927, 6.882, 76253, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-25', 310247, 8.899, 98601, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-26', 65366, 4, 65560, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-26', 65217, 4, 62720, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-26', 64264, 11.883, 125009, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-26', 123785, 9.572, 105675, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-26', 401975, 9.001, 99011, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-26', 401666, 9.914, 113317, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-27', 210727, 12, 126960, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-27', 176061, 6.079, 101459, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-27', 402317, 11.101, 126884, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-27', 310527, 8.953, 99199, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-28', 65634, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-28', 124098, 13.351, 148463, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-29', 310921, 5.01, 55508, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-11-29', 310715, 5.015, 51253, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-01', 66146, 4, 62200, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-01', 176527, 8.596, 134184, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-01', 311502, 7.847, 86945, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-02', 124445, 11.769, 125222, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-02', 402846, 13.536, 148761, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-02', 108811, 14.016, 232946, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-02', 311702, 4.878, 54048, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 66307, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 176760, 2.152, 33592, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 64735, 19.205, 212791, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 125470, 11.895, 131202, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 125049, 7.719, 81590, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 124670, 7.437, 82030, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 57224, 13, 137540, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-03', 311925, 5.871, 65051, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-04', 211072, 11.733, 124487, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-04', 161674, 14.622, 167129, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-04', 57882, 13, 140140, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-05', 66556, 4, 62200, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-05', 176911, 7.476, 116700, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-05', 312116, 6.475, 71743, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-06', 403158, 11.5, 131445, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-06', 296806, 11.834, 130529, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-06', 312391, 7.532, 83455, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-07', 66737, 4, 64240, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-07', 125765, 13.543, 148838, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-08', 66954, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-08', 177110, 7.621, 117668, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-08', 312658, 6.89, 76341, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-09', 67200, 4, 62760, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-09', 162094, 15.051, 166163, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-10', 177399, 8.13, 129999, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-10', 126046, 10.475, 114282, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-10', 403427, 9.243, 105509, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-11', 67398, 4, 62200, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-11', 211361, 10.088, 111775, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-11', 177581, 3.437, 54030, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-11', 62274, 21.842, 242009, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-11', 126312, 9.325, 106585, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-11', 312897, 6.781, 75133, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-12', 108825, 10.357, 172133, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-12', 133005, 15.432, 166357, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-12', 313241, 8.857, 98136, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-13', 313404, 5.801, 64275, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-14', 67709, 4, 62040, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-14', 126524, 7.313, 80589, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-14', 404458, 8.654, 92122, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-14', 404080, 7.112, 79221, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-14', 403745, 12.73, 140412, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-14', 313588, 5.047, 55921, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-15', 177846, 8.302, 130507, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-15', 296919, 7.441, 81777, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-16', 211632, 10.07, 111576, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-16', 65514, 10.926, 116580, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-16', 126803, 11.356, 124802, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-16', 9357, 6.403, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-16', 313754, 5.044, 55888, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-17', 67845, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-17', 14917, 11.996, 190377, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-17', 297127, 8.577, 98035, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-17', 313953, 6.055, 67089, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-18', 67973, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-18', 178107, 6.987, 111721, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-18', 65908, 15.016, 166377, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-18', 314179, 6.287, 69660, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-19', 211921, 10.483, 111225, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-19', 127147, 13.185, 150705, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-19', 198839, 13.733, 153123, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-20', 405202, 11.259, 128690, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-20', 404666, 6.017, 62817, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-20', 297426, 12.859, 143121, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-20', 314459, 8.825, 97781, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-21', 9068, 8.292, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-21', 314646, 5.861, 65526, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-21', 198981, 9.051, 103453, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-22', 66136, 9.931, 111029, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-22', 162504, 14.055, 155870, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-22', 297783, 14.814, 165028, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-23', 212336, 12, 133764, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-24', 108826, 14.405, 239411, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-24', 314994, 9.337, 104388, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-24', 199239, 13.995, 155065, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-25', 68306, 4, 62596, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-25', 127417, 12.926, 147744, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-25', 133546, 13.79, 149194, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-26', 68554, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-26', 178411, 6.797, 108888, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-26', 298136, 14.53, 161864, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-26', 264080, 16.833, 192401, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-27', 68695, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-27', 162973, 16.567, 189361, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-27', 315234, 7.688, 85952, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-28', 315422, 5.806, 64911, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-29', 69002, 4, 62760, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-29', 315580, 4.192, 46867, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-30', 298430, 12.203, 140212, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-30', 199499, 13.646, 151334, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2025-12-31', 315850, 7.261, 81178, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-01', 69223, 4, 65560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-01', 316102, 7.546, 84364, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-02', 69538, 4, 63360, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-02', 212670, 11.144, 125704, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-02', 127793, 13.253, 147903, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-02', 405573, 12.093, 135925, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-03', 69710, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-03', 199762, 14.14, 157237, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-04', 128225, 12.642, 142096, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-04', 405898, 12.544, 140995, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-05', 70179, 4, 63360, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-05', 69993, 4, 63996, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-05', 66554, 14.577, 157286, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-05', 406174, 6.036, 67845, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-05', 316316, 6.203, 69970, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-06', 9406, 6.342, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-07', 212918, 7.524, 84615, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-07', 179762, 8.036, 126647, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-07', 128651, 13.361, 150044, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-07', 158252, 15.583, 174997, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-07', 316536, 6.706, 75644, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-07', 127381, 9.452, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-08', 128938, 9.659, 108471, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-08', 299299, 16.229, 182252, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-08', 298774, 13.932, 156596, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-09', 70404, 4, 63680, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-09', 213204, 8.339, 94064, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-09', 67127, 18.448, 204588, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-09', 67044, 1.367, 15418, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-09', 264474, 15.348, 171284, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-10', 70579, 4, 63360, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-10', 213391, 5.7, 64296, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-11', 70705, 4, 64160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-11', 213657, 7.262, 81915, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-11', 179763, 8.789, 138515, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-11', 129294, 12.011, 135004, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-11', 59078, 13, 150540, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-11', 134083, 12.285, 132555, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-12', 108827, 14.577, 245185, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-13', 71045, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-13', 213908, 6.626, 74741, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-13', 163333, 12.685, 141311, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-13', 299562, 11.76, 132182, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-14', 71300, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-14', 180000, 8.661, 135025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-14', 299819, 10.053, 112895, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-15', 214118, 6.142, 69282, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-15', 129685, 8.326, 93497, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-16', 406489, 11.631, 140270, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-16', 163840, 14.104, 158388, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-16', 316795, 7.624, 85999, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-17', 71601, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-17', 8128, 12.467, 139605, 'Diesel'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-18', 71771, 4, 64640, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-18', 9147, 7.401, 90033, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-18', 317008, 6.003, 67714, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-19', 72068, 4, 63360, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-19', 214413, 8.334, 91007, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-19', 180010, 7.782, 122644, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-19', 67547, 18.285, 206255, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-19', 129864, 11.342, 127371, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-19', 300280, 18.234, 204768, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-19', 317294, 7.548, 85141, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-20', 72199, 4, 63360, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-20', 164191, 12.92, 145092, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-20', 300284, 0.841, 9444, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-21', 67910, 16.364, 183768, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-22', 72366, 4, 63160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-22', 317451, 4.959, 55938, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-23', 180228, 8.632, 142169, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-23', 164678, 15.245, 171354, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-23', 300526, 8.892, 99946, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-24', 130148, 12.797, 143710, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-24', 164921, 8.628, 96116, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-24', 108828, 13.404, 225455, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-24', 317758, 8.299, 93613, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-25', 72704, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-25', 134668, 14.912, 163883, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-26', 180428, 5.663, 91627, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-26', 67927, 15.697, 177062, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-26', 317907, 5.274, 59491, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-26', 264911, 15.795, 177220, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-27', 72879, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-27', 406776, 10.477, 113256, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-27', 165166, 7.81, 87706, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-27', 15001, 11.601, 185268, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-28', 214762, 12, 129480, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-28', 318097, 5.399, 60901, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-28', 68208, 12.744, 149105, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-29', 73095, 4, 63160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-29', 68324, 15.635, 168702, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-29', 165614, 14.176, 166143, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-30', 180711, 8.666, 136576, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-30', 165954, 5.627, 65555, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-30', 318313, 5.91, 66665, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-31', 73341, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-01-31', 127428, 9.482, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-01', 73543, 4, 65960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-01', 180952, 5.992, 94434, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-01', 130449, 11.831, 132980, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-01', 407118, 10.666, 125006, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-01', 166166, 12.197, 136972, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-01', 318506, 5.953, 67150, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-01', 265289, 17.787, 199926, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-02', 73733, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-02', 215053, 11.471, 129393, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-02', 200074, 15.2, 169632, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-03', 407353, 8.565, 96185, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-03', 318880, 9.924, 111943, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-04', 73956, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-04', 215264, 5.083, 57345, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-04', 130633, 8.063, 90628, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-04', 407506, 5.723, 64327, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-05', 215542, 8.349, 94177, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-05', 215507, 1.448, 16335, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-05', 68786, 19.092, 183665, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-06', 166835, 11.731, 131739, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-06', 108830, 16.437, 268252, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-06', 319058, 5.601, 53882, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-07', 215709, 5.39, 58158, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-07', 181216, 7.507, 120037, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-07', 131026, 13.901, 157776, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-07', 9425, 6.378, 100000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-08', 74120, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-08', 167204, 12.19, 136894, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-08', 319311, 6.139, 59057, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-09', 74418, 4, 62200, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-09', 300698, 8.222, 92580, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-09', 319487, 4.937, 55689, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-10', 74542, 4, 60760, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-10', 59579, 13, 146510, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-10', 319789, 8.641, 97470, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-11', 181555, 8.371, 131174, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-11', 131405, 12.928, 140398, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-11', 167614, 11.71, 131738, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-12', 216057, 11.352, 123056, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-12', 69352, 18.365, 207157, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-12', 131537, 6.346, 71393, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-12', 167845, 7.685, 90068, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-12', 59961, 13, 151970, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-12', 319947, 4.407, 49711, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-13', 74828, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-13', 131779, 8.716, 98055, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-13', 320333, 9.738, 109845, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-14', 168277, 3.899, 43854, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-14', 135255, 15.872, 175544, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-15', 75079, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-15', 168476, 16.353, 183971, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-15', 60519, 13, 146510, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-15', 320519, 5.91, 66665, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-16', 75263, 4, 60760, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-16', 69646, 12.661, 136612, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-16', 132070, 10.124, 113895, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-16', 407788, 12.63, 142088, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-17', 300888, 10.592, 122655, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-17', 320752, 7.872, 83364, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-18', 75554, 4, 61360, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-18', 216206, 6.882, 77629, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-18', 132432, 11.518, 129578, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-18', 407928, 6.527, 73429, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-18', 168789, 10.539, 118458, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-18', 320996, 5.867, 66180, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-19', 75164, 4, 62640, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-19', 408115, 5.61, 63113, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-19', 169045, 8.686, 97891, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-19', 300984, 4.494, 52580, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-19', 321690, 10.217, 108811, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-19', 321328, 7.406, 83940, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-20', 181811, 8.456, 130138, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-20', 69988, 12.587, 141981, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-20', 132787, 12.604, 142047, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-20', 408252, 4.733, 53246, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-20', 127480, 9.753, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-21', 75968, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-22', 216976, 12, 137688, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-22', 216361, 0.204, 2301, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-22', 216361, 6.343, 71549, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-22', 408393, 5.447, 61279, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-22', 322028, 8.999, 101509, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-23', 76143, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-23', 217414, 4.291, 49733, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-23', 217211, 7.622, 85976, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-23', 301344, 13.901, 162920, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 76349, 4, 62360, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 218109, 11.7, 131976, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 217691, 5.785, 67973, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 70466, 15.935, 171939, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 133156, 13.91, 156488, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 408713, 9.738, 109553, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 108840, 14.995, 244718, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-24', 322237, 6.209, 70038, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-25', 60918, 13, 152100, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-25', 322450, 5.866, 66168, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-26', 76678, 4, 63960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-26', 218264, 5.647, 63698, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-26', 133380, 9.76, 109800, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-26', 9466, 6.481, 100002, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-26', 301645, 12.362, 139567, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-26', 61070, 11.916, 134055, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-26', 322635, 5.496, 61995, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-27', 76894, 4, 61560, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-28', 77047, 4, 60760, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-28', 218717, 6.229, 69391, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-28', 218552, 8.001, 90251, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-28', 182095, 7.468, 114858, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-02-28', 70818, 14.069, 158698, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-01', 77235, 4, 61480, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-01', 219111, 8.082, 91488, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-01', 408981, 9.585, 107831, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-01', 301990, 13.704, 160337, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-01', 322877, 6.622, 74696, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-02', 219368, 6.53, 74181, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-02', 182224, 5.243, 80008, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-02', 61512, 12.028, 135315, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-02', 200285, 14.02, 157725, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-03', 77519, 4, 61960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-03', 219640, 7.603, 85762, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-03', 71148, 14.592, 155843, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-03', 133863, 8.734, 98258, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-04', 77700, 4, 61960, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-04', 133982, 4.418, 49703, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-05', 219928, 9.656, 102257, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-05', 71473, 8.492, 95787, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-05', 302281, 13.723, 154247, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-05', 158574, 14.275, 160594, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-06', 134191, 8.229, 92576, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-06', 62010, 13, 146250, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-07', 78056, 5.916, 91639, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-07', 220717, 11.375, 121144, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-07', 182368, 3.908, 58034, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-07', 118895, 9.092, 140744, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-07', 15089, 11.653, 174783, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-08', 221130, 10.092, 113838, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-08', 409625, 10.058, 113153, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-08', 200577, 14.732, 165735, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-09', 78378, 6.562, 101645, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-09', 134535, 12.674, 142456, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-09', 108841, 12.025, 190236, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-09', 339624, 3, 33750, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-09', 339622, 3, 33750, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-09', 339620, 3, 33750, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OSK397';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-10', 78695, 6.324, 97959, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-10', 221348, 7.67, 86518, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-10', 409920, 10.366, 116825, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-10', 323205, 10.356, 116816, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-11', 182611, 8.45, 128694, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-11', 134790, 9.498, 108420, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-11', 410266, 10.571, 127698, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-12', 79049, 6.198, 96007, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-12', 221515, 6.332, 71425, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-12', 71889, 16.438, 185415, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-13', 135026, 7.592, 85410, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-13', 62343, 13, 146250, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-13', 9499, 6.639, 72465, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-13', 9267, 9.433, 113951, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-14', 79383, 5.966, 91160, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-14', 221722, 6.449, 72745, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-14', 182902, 8.496, 126166, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-14', 119283, 12.869, 199212, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-15', 79646, 5.289, 80181, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-15', 222074, 9.318, 105852, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-16', 135459, 14.854, 167108, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-16', 302366, 3.353, 37721, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 338553, 12.566, 141368, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 80068, 6.872, 104180, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 222176, 5.099, 57925, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 183178, 7.075, 105064, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 72254, 16.752, 179581, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 62724, 13, 146250, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 159026, 7.225, 83304, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-17', 158759, 7.07, 78689, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-18', 338759, 9.069, 102026, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-18', 222345, 5.674, 64003, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-18', 135684, 8.047, 90529, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-18', 9505, 9.901, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-19', 80368, 6.239, 96642, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-19', 222552, 6.696, 75531, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-19', 135953, 8.902, 104331, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-19', 15172, 6.659, 99878, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-19', 302471, 4.074, 45792, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-19', 159354, 2.763, 28989, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-20', 222945, 10.055, 113420, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-20', 9534, 10.377, 157212, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-20', 302617, 6.525, 73406, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-20', 159483, 9.298, 100976, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-20', 10186, 12.036, 145395, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-20', 9782, 8.391, 90539, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-20', 127601, 10.081, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-21', 339067, 10.662, 119948, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-21', 80684, 6.263, 97014, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-21', 183418, 6.331, 94015, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-21', 410521, 8.95, 100598, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-21', 63073, 13, 146250, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-21', 8297, 8.466, 96004, 'Diesel'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-22', 223116, 5.609, 63270, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-22', 302937, 10.975, 123469, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-23', 72640, 16.923, 178368, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-23', 136507, 6.869, 77551, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-24', 81031, 5.061, 78395, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-24', 200877, 13.097, 147341, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-25', 339381, 10.176, 114684, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-25', 81328, 6.221, 92631, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-25', 223325, 7.606, 85796, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-25', 136682, 6.782, 76298, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-26', 223488, 5.364, 58789, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-26', 136876, 5.762, 64419, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-27', 81639, 5.031, 77930, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-27', 223636, 5.872, 66236, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-27', 183665, 8.104, 120344, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-27', 73062, 15.847, 178754, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-27', 303239, 13.415, 151187, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-27', 63329, 11.659, 131164, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 223888, 6.877, 77573, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 137237, 11.47, 129267, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 19861, 13.676, 209215, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 303295, 3.088, 34740, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 160036, 6.979, 77676, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 159813, 11.81, 133925, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 8866, 6.532, 74073, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-28', 8650, 11.681, 130010, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'OJG594';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-29', 81917, 6.305, 97664, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-29', 183855, 6.41, 95189, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-30', 223989, 3.738, 42165, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-30', 137364, 4.385, 49287, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-31', 82178, 4.3, 66607, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-31', 224252, 8.145, 91876, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-31', 410677, 8.111, 91249, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-31', 303354, 2.793, 31421, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-31', 108842, 15.391, 243486, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-03-31', 266777, 2.016, 22720, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-01', 136162, 15.732, 191301, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-02', 224418, 5.636, 64138, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-02', 737703, 12.512, 140885, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-03', 82490, 5.649, 89763, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-03', 137830, 3.811, 42912, 'Diesel [ANOMALÍA]'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-04', 224602, 5.653, 64331, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-04', 138042, 6.134, 69069, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-05', 138207, 5.571, 62674, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-05', 410875, 7.223, 79597, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-06', 82783, 4.066, 62413, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-06', 323552, 11.073, 126011, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-07', 83059, 5.642, 89651, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-07', 224822, 5.974, 67984, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-07', 184128, 8.269, 126102, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-07', 120138, 13.176, 207232, 'Gasolina Corriente [ANOMALÍA]'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-09', 83413, 6.444, 98464, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-09', 225035, 7.336, 83484, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-09', 184356, 6.549, 99872, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-09', 138460, 10.542, 124923, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-09', 411259, 8.051, 90574, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-09', 63763, 13, 146380, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-10', 184449, 4.093, 66266, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-10', 138614, 5.597, 63022, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-11', 83765, 5.753, 87388, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-11', 225418, 10.709, 121868, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-11', 138737, 4.704, 55742, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-11', 411791, 8.77, 98750, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-11', 201097, 11.711, 131749, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-11', 68477, 13.642, 153473, 'Diesel'
FROM vehicles WHERE placa = 'HXL665';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-13', 84113, 6.489, 103110, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-13', 225779, 9.75, 110955, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-13', 184714, 7.968, 121512, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-13', 139092, 9.911, 111598, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-13', 303703, 13.635, 153394, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-13', 127703, 9.817, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-14', 84440, 5.731, 87054, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-14', 411918, 5.321, 59914, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-14', 266809, 1.604, 18061, 'Diesel'
FROM vehicles WHERE placa = 'HXY015';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-15', 226097, 10.487, 119342, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-15', 139236, 6.352, 71460, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-15', 120390, 12.645, 201055, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-15', 303978, 10.831, 121957, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-16', 84684, 5.394, 85711, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-16', 184922, 6.775, 104742, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-16', 64165, 13, 146250, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-16', 201293, 5.448, 61287, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-17', 84860, 4.652, 73920, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-17', 226376, 8.358, 95114, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-17', 412052, 6.124, 67486, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-18', 226519, 3.92, 44610, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-19', 139642, 14.785, 166479, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-20', 85269, 6.429, 102157, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-20', 185164, 6.303, 102046, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-20', 304206, 10.108, 113715, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-20', 64500, 13, 146250, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-20', 108847, 14.267, 231411, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-21', 85493, 4.193, 66627, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-21', 226830, 10.435, 118750, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-21', 323921, 12.187, 133570, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-22', 339631, 11.78, 132996, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-22', 85788, 5.915, 89849, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-22', 227021, 6.31, 71808, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-22', 73544, 17.172, 195417, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-22', 139917, 10.21, 114863, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-22', 304368, 7.089, 79751, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-23', 227262, 6.395, 72775, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-23', 185398, 9.225, 140681, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-23', 412330, 10.5, 118125, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-24', 86039, 5.004, 75510, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-24', 227459, 6.639, 75552, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-24', 412627, 8.933, 100496, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-24', 304461, 4.053, 48028, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-25', 227676, 6.528, 74289, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-25', 412784, 4.377, 51605, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-26', 413222, 12.507, 140829, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-27', 227881, 6.647, 75643, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-27', 185554, 4.593, 70043, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-27', 74021, 16.269, 175380, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-27', 140326, 13.769, 162337, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-28', 74282, 8.034, 86446, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-28', 413415, 6.559, 73854, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-28', 304729, 8.743, 98446, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-28', 127769, 9.927, 150000, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OMH169';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-28', 201418, 16.572, 186435, 'Diesel'
FROM vehicles WHERE placa = 'FCX141';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-29', 339934, 10.817, 121799, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-29', 86282, 5.748, 86737, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-29', 228052, 5.4, 61452, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-29', 185777, 9.027, 137662, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-29', 120906, 11.12, 170025, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-29', 65111, 13, 146250, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-29', 324249, 10.832, 123268, 'Diesel'
FROM vehicles WHERE placa = 'TRG540';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-30', 228306, 7.698, 87603, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-30', 169411, 3.692, 41540, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-04-30', 304858, 5.853, 66666, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-01', 86622, 7.331, 110625, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-01', 185947, 6.982, 106476, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-01', 305001, 6.269, 70589, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-02', 340107, 6.874, 77333, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-02', 86881, 5.166, 82088, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-02', 228550, 7.316, 83256, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-02', 186128, 5.141, 78400, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-02', 413747, 10.351, 116449, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-02', 136657, 15.286, 172273, 'Diesel'
FROM vehicles WHERE placa = 'DRU893';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-02', 10275, 8.211, 100000, 'Diesel'
FROM vehicles WHERE placa = 'OJG629';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-03', 228852, 9.005, 102477, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-04', 87298, 7.237, 109206, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-04', 413986, 8.653, 97346, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-04', 160329, 10.767, 121129, 'Diesel'
FROM vehicles WHERE placa = 'IEQ524';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-04', 108848, 15.293, 248052, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OBE862';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-05', 340269, 7.339, 88802, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-05', 87642, 6.916, 107129, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-05', 229060, 5.641, 65323, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-05', 74743, 15.556, 180138, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-05', 121047, 8.688, 140051, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-05', 305216, 9.575, 109730, 'Diesel'
FROM vehicles WHERE placa = 'MOW931';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-05', 65445, 13, 148980, 'Diesel'
FROM vehicles WHERE placa = 'LTP476';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-06', 229265, 6.604, 71257, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-06', 186373, 7.714, 121033, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-06', 414163, 7.352, 84180, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-06', 169605, 16.468, 188559, 'Diesel'
FROM vehicles WHERE placa = 'IEW789';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-06', 15303, 3.396, 53661, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MOU057';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-06', 9617, 10.296, 164015, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'OIL657';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-07', 340383, 6.22, 75262, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-07', 87978, 5.792, 94352, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-07', 229506, 6.56, 75965, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-08', 340506, 5.111, 61843, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-08', 88313, 6.061, 98734, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-08', 229949, 12.035, 131904, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-08', 121255, 9.402, 151635, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'IVK968';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-09', 88602, 6.047, 98506, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-09', 75074, 11.97, 138613, 'Diesel'
FROM vehicles WHERE placa = 'LHV349';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-09', 140558, 10.123, 115908, 'Diesel'
FROM vehicles WHERE placa = 'KQX040';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-09', 414439, 10.622, 121728, 'Diesel'
FROM vehicles WHERE placa = 'OKL227';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-10', 230145, 7.063, 81790, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-10', 186603, 7.595, 126761, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'MVV483';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-11', 88874, 4.965, 80880, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-11', 38395, 9.094, 148141, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LQW155';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-12', 340758, 8.97, 107631, 'Diesel'
FROM vehicles WHERE placa = 'TRG544';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-12', 89063, 3.474, 53812, 'Gasolina Corriente'
FROM vehicles WHERE placa = 'LTN715';
INSERT INTO fuel_logs (vehicle_id, fecha, kilometraje, galones, costo, notas)
SELECT id, '2026-05-12', 230331, 5.36, 62069, 'Diesel'
FROM vehicles WHERE placa = 'TRG549';

-- Summary: 2858 inserted, 52 skipped (km=0)
-- Anomalies detected: 221

-- Anomaly details:
-- TRG544 2025-04-17 km=334672 cant=10.376 flags=[km_decrece]
-- LTN715 2025-10-20 km=80863 cant=4 flags=[salto_km_grande]
-- LTN715 2025-10-25 km=61232 cant=4 flags=[km_decrece]
-- LTN715 2025-10-27 km=61469 cant=4 flags=[km_decrece]
-- LTN715 2025-11-26 km=65217 cant=4 flags=[km_decrece]
-- LTN715 2026-01-05 km=69993 cant=4 flags=[km_decrece]
-- LTN715 2026-02-19 km=75164 cant=4 flags=[km_decrece]
-- TRG549 2026-02-05 km=215507 cant=1.448 flags=[km_decrece]
-- TRG549 2026-02-22 km=216361 cant=0.204 flags=[km_decrece]
-- TRG549 2026-02-23 km=217211 cant=7.622 flags=[km_decrece]
-- TRG549 2026-02-24 km=217691 cant=5.785 flags=[km_decrece]
-- TRG549 2026-02-28 km=218552 cant=8.001 flags=[km_decrece]
-- MVV483 2024-05-27 km=829896 cant=5.994 flags=[salto_km_grande]
-- MVV483 2024-06-07 km=1308066 cant=3.372 flags=[salto_km_grande]
-- MVV483 2024-06-09 km=130988 cant=5.453 flags=[km_decrece]
-- MVV483 2024-06-13 km=531402 cant=5.064 flags=[salto_km_grande]
-- MVV483 2024-06-19 km=131812 cant=3.913 flags=[km_decrece]
-- MVV483 2024-07-09 km=13 cant=5.377 flags=[km_decrece]
-- MVV483 2024-07-11 km=134409 cant=5.888 flags=[salto_km_grande]
-- MVV483 2024-07-14 km=134181 cant=6.144 flags=[km_decrece]
-- MVV483 2025-11-18 km=175378 cant=7.267 flags=[km_decrece]
-- LHV349 2025-12-11 km=62274 cant=21.842 flags=[km_decrece]
-- LHV349 2026-01-09 km=67044 cant=1.367 flags=[km_decrece]
-- KQX040 2024-04-22 km=26522 cant=8.714 flags=[km_decrece]
-- KQX040 2024-05-11 km=30723 cant=13.112 flags=[km_decrece]
-- KQX040 2024-06-14 km=36760 cant=13.478 flags=[km_decrece]
-- KQX040 2024-08-02 km=47580 cant=11.011 flags=[km_decrece]
-- KQX040 2024-11-20 km=84598 cant=6.705 flags=[salto_km_grande]
-- KQX040 2024-11-21 km=64780 cant=6.231 flags=[km_decrece]
-- KQX040 2024-12-01 km=66811 cant=5.989 flags=[km_decrece]
-- KQX040 2024-12-04 km=97970 cant=10.967 flags=[salto_km_grande]
-- KQX040 2024-12-04 km=67510 cant=4.252 flags=[km_decrece]
-- KQX040 2024-12-07 km=68470 cant=10.092 flags=[km_decrece]
-- KQX040 2024-12-11 km=69029 cant=4.585 flags=[km_decrece]
-- KQX040 2024-12-13 km=92240 cant=6.226 flags=[salto_km_grande]
-- KQX040 2024-12-14 km=69861 cant=9.368 flags=[km_decrece]
-- KQX040 2024-12-21 km=71281 cant=4.89 flags=[km_decrece]
-- KQX040 2024-12-21 km=71095 cant=8.207 flags=[km_decrece]
-- KQX040 2025-01-04 km=12375 cant=10.477 flags=[km_decrece]
-- KQX040 2025-01-05 km=73343 cant=10.146 flags=[salto_km_grande]
-- KQX040 2025-01-24 km=76340 cant=8.914 flags=[km_decrece]
-- KQX040 2025-01-27 km=76675 cant=9.092 flags=[km_decrece]
-- KQX040 2025-01-30 km=77430 cant=8.497 flags=[km_decrece]
-- KQX040 2025-01-31 km=67814 cant=7.58 flags=[km_decrece]
-- KQX040 2025-03-14 km=83890 cant=7.745 flags=[km_decrece]
-- KQX040 2025-03-17 km=84584 cant=8.927 flags=[km_decrece]
-- KQX040 2025-03-24 km=86127 cant=6.163 flags=[km_decrece]
-- KQX040 2025-04-26 km=null cant=11.389 flags=[km_cero_o_nulo]
-- KQX040 2025-04-28 km=91139 cant=2.632 flags=[km_decrece]
-- KQX040 2025-05-08 km=93372 cant=6.793 flags=[km_decrece]
-- KQX040 2025-06-21 km=99460 cant=9.055 flags=[km_decrece]
-- KQX040 2025-07-27 km=106001 cant=5.384 flags=[km_decrece]
-- KQX040 2025-08-02 km=107083 cant=12.266 flags=[km_decrece]
-- KQX040 2025-09-23 km=113615 cant=4.612 flags=[km_decrece]
-- KQX040 2025-10-12 km=118089 cant=6.853 flags=[km_decrece]
-- KQX040 2025-12-03 km=125049 cant=7.719 flags=[km_decrece]
-- KQX040 2025-12-03 km=124670 cant=7.437 flags=[km_decrece]
-- KQX040 2026-04-02 km=737703 cant=12.512 flags=[salto_km_grande]
-- KQX040 2026-04-03 km=137830 cant=3.811 flags=[km_decrece]
-- FIS792 2025-05-18 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-05-28 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-06-07 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-06-13 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-06-27 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-07-01 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-07-07 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-07-17 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-07-21 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-07-28 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-08-06 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-08-15 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-08-21 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-08-23 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-08-26 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-09-01 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-09-08 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-09-15 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-09-26 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-10-02 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-10-08 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-10-15 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-10-21 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-10-27 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-11-09 km=null cant=2.091 flags=[km_cero_o_nulo]
-- FIS792 2025-11-24 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2025-12-02 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-02-01 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-02-06 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-02-10 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-02-16 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-02-22 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-02-24 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-03-02 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-03-04 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-03-08 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-03-14 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-03-16 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-03-24 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-03-30 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-04-02 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-04-06 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-04-10 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-04-15 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-04-23 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-04-27 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-05-04 km=null cant=7 flags=[km_cero_o_nulo]
-- FIS792 2026-05-09 km=null cant=7 flags=[km_cero_o_nulo]
-- OKL227 2024-05-14 km=379555 cant=6.602 flags=[km_decrece]
-- OKL227 2024-06-01 km=380288 cant=8.258 flags=[km_decrece]
-- OKL227 2024-06-21 km=321190 cant=10.287 flags=[km_decrece]
-- OKL227 2024-07-09 km=381927 cant=12.627 flags=[salto_km_grande]
-- OKL227 2025-07-04 km=391041 cant=12.37 flags=[km_decrece]
-- OKL227 2025-07-16 km=393073 cant=13.007 flags=[km_decrece]
-- OKL227 2025-10-03 km=397516 cant=9.835 flags=[km_decrece]
-- OKL227 2025-10-15 km=399075 cant=8.905 flags=[km_decrece]
-- OKL227 2025-11-26 km=401666 cant=9.914 flags=[km_decrece]
-- OKL227 2025-12-14 km=404080 cant=7.112 flags=[km_decrece]
-- OKL227 2025-12-14 km=403745 cant=12.73 flags=[km_decrece]
-- OKL227 2025-12-20 km=404666 cant=6.017 flags=[km_decrece]
-- IVK968 2026-03-21 km=null cant=13.02 flags=[km_cero_o_nulo]
-- IVK968 2026-03-28 km=19861 cant=13.676 flags=[km_decrece]
-- IVK968 2026-04-07 km=120138 cant=13.176 flags=[salto_km_grande]
-- IVK968 2026-04-25 km=null cant=13.218 flags=[km_cero_o_nulo]
-- IEW789 2024-01-22 km=79406 cant=12.535 flags=[km_decrece]
-- IEW789 2024-02-06 km=822734 cant=17.937 flags=[salto_km_grande]
-- IEW789 2024-02-09 km=83491 cant=15.333 flags=[km_decrece]
-- IEW789 2024-03-04 km=null cant=9.29 flags=[km_cero_o_nulo]
-- IEW789 2024-08-15 km=116333 cant=13.695 flags=[km_decrece]
-- IEW789 2024-09-07 km=121929 cant=10.63 flags=[km_decrece]
-- IEW789 2024-11-27 km=126429 cant=6.92 flags=[km_decrece]
-- IEW789 2025-02-04 km=127450 cant=8.445 flags=[km_decrece]
-- IEW789 2025-06-08 km=143319 cant=10.213 flags=[km_decrece]
-- IEW789 2025-07-25 km=149111 cant=1.541 flags=[km_decrece]
-- IEW789 2025-09-20 km=156014 cant=13.424 flags=[km_decrece]
-- IEW789 2025-10-09 km=157215 cant=7.59 flags=[km_decrece]
-- IEW789 2025-11-24 km=161061 cant=9.1 flags=[km_decrece]
-- MOW931 2024-08-02 km=288933 cant=7.117 flags=[km_decrece]
-- MOW931 2024-08-10 km=289694 cant=12.095 flags=[km_decrece]
-- MOW931 2024-09-01 km=290503 cant=7.34 flags=[km_decrece]
-- MOW931 2026-01-08 km=298774 cant=13.932 flags=[km_decrece]
-- IEQ524 2024-12-02 km=152911 cant=13.535 flags=[km_decrece]
-- IEQ524 2026-03-17 km=158759 cant=7.07 flags=[km_decrece]
-- IEQ524 2026-03-28 km=159813 cant=11.81 flags=[km_decrece]
-- OBE862 2025-08-06 km=73854 cant=13.473 flags=[km_decrece]
-- OBE862 2025-08-17 km=108753 cant=12.677 flags=[salto_km_grande]
-- DRU893 2025-02-09 km=115089 cant=12.07 flags=[km_decrece]
-- OJG629 2026-03-13 km=9267 cant=9.433 flags=[km_decrece]
-- OJG629 2026-03-20 km=9782 cant=8.391 flags=[km_decrece]
-- TRG540 2024-03-23 km=210888 cant=9.367 flags=[km_decrece]
-- TRG540 2024-04-29 km=216021 cant=11.288 flags=[km_decrece]
-- TRG540 2024-05-05 km=216927 cant=3.941 flags=[km_decrece]
-- TRG540 2024-05-21 km=219914 cant=6.309 flags=[km_decrece]
-- TRG540 2024-05-25 km=220751 cant=4.096 flags=[km_decrece]
-- TRG540 2024-05-29 km=222382 cant=12 flags=[km_decrece]
-- TRG540 2024-06-07 km=224268 cant=7.668 flags=[km_decrece]
-- TRG540 2024-06-19 km=226087 cant=6.033 flags=[km_decrece]
-- TRG540 2024-07-05 km=227873 cant=4.901 flags=[km_decrece]
-- TRG540 2024-07-08 km=228737 cant=4.23 flags=[km_decrece]
-- TRG540 2024-07-25 km=232365 cant=12 flags=[km_decrece]
-- TRG540 2024-07-30 km=233608 cant=6.748 flags=[km_decrece]
-- TRG540 2024-08-04 km=235200 cant=10.002 flags=[km_decrece]
-- TRG540 2024-08-06 km=236407 cant=10.587 flags=[km_decrece]
-- TRG540 2024-08-10 km=237411 cant=4.084 flags=[km_decrece]
-- TRG540 2024-08-16 km=238621 cant=7.009 flags=[km_decrece]
-- TRG540 2024-08-25 km=240366 cant=5.162 flags=[km_decrece]
-- TRG540 2024-08-27 km=240984 cant=5.596 flags=[km_decrece]
-- TRG540 2024-11-14 km=256390 cant=12.504 flags=[km_decrece]
-- TRG540 2024-11-16 km=257015 cant=5.379 flags=[km_decrece]
-- TRG540 2024-11-23 km=257786 cant=7.853 flags=[km_decrece]
-- TRG540 2024-12-10 km=261487 cant=10.446 flags=[km_decrece]
-- TRG540 2025-01-02 km=266335 cant=5.269 flags=[km_decrece]
-- TRG540 2025-01-31 km=273071 cant=7.966 flags=[km_decrece]
-- TRG540 2025-02-19 km=275912 cant=8.842 flags=[km_decrece]
-- TRG540 2025-03-02 km=278046 cant=10.389 flags=[km_decrece]
-- TRG540 2025-03-02 km=277594 cant=5.035 flags=[km_decrece]
-- TRG540 2025-04-24 km=285740 cant=8.58 flags=[km_decrece]
-- TRG540 2025-04-29 km=287049 cant=6.47 flags=[km_decrece]
-- TRG540 2025-07-02 km=293664 cant=8.472 flags=[km_decrece]
-- TRG540 2025-10-07 km=303083 cant=12.174 flags=[km_decrece]
-- TRG540 2025-11-29 km=310715 cant=5.015 flags=[km_decrece]
-- TRG540 2026-02-19 km=321328 cant=7.406 flags=[km_decrece]
-- OMH169 2025-10-27 km=127242 cant=9.563 flags=[km_decrece]
-- FCX141 2024-08-28 km=189891 cant=7.625 flags=[km_decrece]
-- HXY015 2025-05-21 km=253501 cant=11.62 flags=[km_decrece]
-- HXY015 2025-07-29 km=257392 cant=9.605 flags=[km_decrece]
-- HXY015 2025-11-13 km=863364 cant=9.978 flags=[salto_km_grande]
-- HXY015 2025-11-18 km=233700 cant=12.207 flags=[km_decrece]
-- HXY015 2025-12-26 km=264080 cant=16.833 flags=[salto_km_grande]
-- HXL665 2025-03-05 km=16475 cant=12 flags=[km_decrece]
-- HXL665 2025-03-07 km=66689 cant=9.276 flags=[salto_km_grande]
-- OJG594 2026-03-28 km=8650 cant=11.681 flags=[km_decrece]
-- OSK397 2026-03-09 km=339622 cant=3 flags=[km_decrece]
-- OSK397 2026-03-09 km=339620 cant=3 flags=[km_decrece]
-- EQR890 2024-03-11 km=74120 cant=2.255 flags=[km_decrece]
-- EQR890 2024-04-25 km=80100 cant=10.326 flags=[km_decrece]
-- EQR890 2024-05-10 km=83356 cant=12.927 flags=[km_decrece]
-- EQR890 2024-05-29 km=87943 cant=8.334 flags=[km_decrece]
-- EQR890 2024-06-08 km=89205 cant=13.771 flags=[km_decrece]
-- EQR890 2024-06-13 km=89900 cant=5.285 flags=[km_decrece]
-- EQR890 2024-07-04 km=94126 cant=4.849 flags=[km_decrece]
-- EQR890 2024-07-13 km=95275 cant=5.451 flags=[km_decrece]
-- EQR890 2024-12-14 km=115041 cant=4.192 flags=[km_decrece]
-- EQR890 2025-03-12 km=127781 cant=14.421 flags=[km_decrece]
-- TRG542 2024-11-27 km=244079 cant=11.223 flags=[km_decrece]
-- TRG542 2025-01-18 km=246368 cant=9.641 flags=[km_decrece]
-- TRG542 2025-01-25 km=246966 cant=11.03 flags=[km_decrece]
-- TRG542 2025-01-31 km=247786 cant=12.586 flags=[km_decrece]
-- KYV199 2024-04-13 km=71915 cant=2.679 flags=[km_decrece]
-- KYV199 2024-04-22 km=72717 cant=5.279 flags=[km_decrece]
-- KYV199 2024-04-28 km=73367 cant=4.773 flags=[km_decrece]
-- KZO779 2024-02-01 km=66645 cant=4.614 flags=[km_decrece]
-- KZO779 2024-07-18 km=83265 cant=3.52 flags=[km_decrece]
-- KZO779 2024-09-12 km=89673 cant=3.001 flags=[km_decrece]
-- KYV219 2024-02-24 km=61669 cant=3.696 flags=[km_decrece]
-- KYV219 2024-06-01 km=71704 cant=3.522 flags=[km_decrece]
-- KYV219 2024-07-22 km=76096 cant=5.403 flags=[km_decrece]
-- KOS929 2024-02-21 km=66530 cant=5.784 flags=[km_decrece]
-- KOS929 2024-03-28 km=800044 cant=6.215 flags=[salto_km_grande]
-- KOS929 2024-03-29 km=80254 cant=3.943 flags=[km_decrece]
-- KOS929 2024-04-27 km=82537 cant=5.374 flags=[km_decrece]
-- KOS929 2024-04-30 km=82840 cant=2.632 flags=[km_decrece]
