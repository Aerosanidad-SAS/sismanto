-- Migration 033: Eliminar datos RTM anteriores a 2024
-- Solo nos interesa información desde enero 1 de 2024.
DELETE FROM rtm_historico WHERE anio < 2024;
