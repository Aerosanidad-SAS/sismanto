-- ============================================================
-- Migración 065: vencimiento de Parche (BIOMÉDICA) en equipos biomédicos
--
-- Hallazgo real (docs/PARIDAD_SISTEMA.md §2.3): SISRES tiene dos campos
-- independientes de vencimiento de parche/pad de desfibrilador — Adulto
-- y Pediátrico — sin equivalente en SISMANTO. Cada uno es la fecha
-- impresa en el empaque del parche, no una fecha de "último cambio", y
-- no tiene columna "próxima" (SISRES la tuvo y la quitó a propósito:
-- la fecha impresa ya es el único dato real).
--
-- Nombrado sin el prefijo "ultimo_" que usa SISRES
-- (ultimoVencimientoParche/ultimoVencimientoParchePediatrico) — ese
-- prefijo confunde ahí mismo (sisres/DOCUMENTACION.md §4.5 lo aclara
-- explícitamente: "no una fecha de 'último cambio'"), así que acá se
-- nombra directo por lo que es.
--
-- Solo aplica a equipos con area = 'BIOMEDICA' en la práctica (typ.
-- desfibriladores) — sin restricción a nivel de columna: el resto de
-- equipos simplemente deja estos dos campos vacíos, mismo criterio que
-- el resto de columnas opcionales de esta tabla.
-- ============================================================

ALTER TABLE biomedical_equipment ADD COLUMN IF NOT EXISTS vencimiento_parche_adulto DATE;
ALTER TABLE biomedical_equipment ADD COLUMN IF NOT EXISTS vencimiento_parche_pediatrico DATE;

COMMENT ON COLUMN biomedical_equipment.vencimiento_parche_adulto IS
  'Fecha de vencimiento impresa en el parche/pad de desfibrilador (adulto) — no una fecha de "último cambio". Equivalente a inventario.ultimoVencimientoParche en SISRES.';
COMMENT ON COLUMN biomedical_equipment.vencimiento_parche_pediatrico IS
  'Fecha de vencimiento impresa en el parche/pad de desfibrilador (pediátrico) — no una fecha de "último cambio". Equivalente a inventario.ultimoVencimientoParchePediatrico en SISRES.';
