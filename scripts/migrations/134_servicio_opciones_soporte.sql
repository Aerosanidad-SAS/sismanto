-- ============================================================
-- Migración 134: «Soporte» pasa a ser un campo con opciones administrables del formulario de servicios
--
-- Revisión inicial 2026-10-15: «Soporte debe ser una lista». En el histórico de SISRES son 763 valores distintos en
-- 37 mil servicios, pero 12 cubren el 96 %: «NO REQUIERE» (80 %), «N/A», oxígeno a 1/2/3 litros o a necesidad,
-- movilidad reducida, vigilancia médica… El formulario muestra la lista y deja escribir otro valor.
--
-- Solo amplía el CHECK de `servicio_opciones_campo.campo` (migración 091) para que el administrador pueda guardar una
-- lista propia de `soporte`. Sin fila para el campo se usan las opciones de fábrica del código
-- (src/lib/servicios-opciones.ts), así que no se siembra nada y no se toca ningún servicio.
--
-- Idempotente: quita la restricción si existe y la vuelve a crear con el campo nuevo.
-- ============================================================

ALTER TABLE servicio_opciones_campo DROP CONSTRAINT IF EXISTS servicio_opciones_campo_campo_check;

ALTER TABLE servicio_opciones_campo
  ADD CONSTRAINT servicio_opciones_campo_campo_check
  CHECK (campo IN ('turno_programacion', 'requiere_aislamiento', 'perimetro', 'finalidad_traslado',
                   'metodo_pago', 'motivo_externo', 'motivo_interno', 'soporte'));
