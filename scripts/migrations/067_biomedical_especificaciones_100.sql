-- Migración 067: especificaciones técnicas de equipos biomédicos a VARCHAR(100).
--
-- En SISRES estas columnas son varchar(100) desde 2026-08-28 (antes varchar(10)
-- y se truncaban en silencio; ver sisres/DOCUMENTACION.md §4.5). En la
-- migración 040 quedaron en VARCHAR(40): con los datos reales de SISRES
-- (ensayo del ETL del 2026-09-23) 611 de 1155 equipos fallaban con "value too
-- long for type character varying(40)" — voltaje llega a 76 caracteres.
--
-- Solo amplía (no acorta ni convierte datos): no puede perder información.
-- Idempotente.

ALTER TABLE biomedical_equipment ALTER COLUMN voltaje     TYPE VARCHAR(100);
ALTER TABLE biomedical_equipment ALTER COLUMN corriente   TYPE VARCHAR(100);
ALTER TABLE biomedical_equipment ALTER COLUMN potencia    TYPE VARCHAR(100);
ALTER TABLE biomedical_equipment ALTER COLUMN frecuencia  TYPE VARCHAR(100);
ALTER TABLE biomedical_equipment ALTER COLUMN humedad     TYPE VARCHAR(100);
ALTER TABLE biomedical_equipment ALTER COLUMN dimensiones TYPE VARCHAR(100);
ALTER TABLE biomedical_equipment ALTER COLUMN peso        TYPE VARCHAR(100);
ALTER TABLE biomedical_equipment ALTER COLUMN temperatura TYPE VARCHAR(100);
