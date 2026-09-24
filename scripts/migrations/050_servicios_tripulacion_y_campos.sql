-- ============================================================
-- Migración 050: tripulación real (FK a usuarios) + campos que
-- faltaban del formulario de servicios, por tipo de servicio.
--
-- Contexto (Daniel, 2026-07-22): el sistema debe reemplazar a SISRES
-- para Regulación/Médico/Auxiliar/OVEM. Hoy `ovem`/`medico`/`auxiliar`
-- en medical_services son texto libre — no hay forma de que un OVEM
-- vea "sus" servicios porque no hay ninguna columna que lo vincule a
-- su user_id real. Esta migración agrega esa relación sin borrar las
-- columnas de texto viejas (quedan como snapshot histórico, mismo
-- patrón que movil_placa junto a vehicle_id).
--
-- Un servicio puede tener médico asignado SIN vehículo ni OVEM
-- (médico-prestador externo con su propio carro, típico de Medicina
-- Domiciliaria) — por eso las tres columnas son nullable de forma
-- independiente, no se asume que siempre van juntas.
-- ============================================================

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS ovem_user_id UUID REFERENCES auth.users(id);
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS medico_user_id UUID REFERENCES auth.users(id);
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS auxiliar_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_medical_services_ovem_user ON medical_services(ovem_user_id);
CREATE INDEX IF NOT EXISTS idx_medical_services_medico_user ON medical_services(medico_user_id);
CREATE INDEX IF NOT EXISTS idx_medical_services_auxiliar_user ON medical_services(auxiliar_user_id);

-- Primer paso de la secuencia de estados que marca el OVEM (o el
-- médico, en Medicina Domiciliaria) — falta hoy, antes de "llegada a
-- origen" no había ningún timestamp.
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS fecha_hora_inicio_desplazamiento TIMESTAMPTZ;

-- Campos reales del formulario de Regulación (lista pasada por
-- Daniel, verificada contra los que ya existían) que no tenían
-- columna equivalente todavía.
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS condicion VARCHAR(100);           -- MD
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS medio_asignacion VARCHAR(100);    -- MD
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS turno_facturacion VARCHAR(40);    -- MD
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS deducible VARCHAR(60);            -- MD
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS incapa VARCHAR(100);              -- MD

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS situacion VARCHAR(60);            -- TAM/TAB
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS tiempo_a_restar NUMERIC(10,2);    -- TAM/TAB

ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS poliza VARCHAR(100);              -- MD + Telemedicina
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS funcionario_aseguradora VARCHAR(150); -- Telemedicina
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS codigo_telemedicina VARCHAR(60);  -- Telemedicina
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(255);  -- Telemedicina
ALTER TABLE medical_services ADD COLUMN IF NOT EXISTS motivo_consulta TEXT;             -- Telemedicina

COMMENT ON COLUMN medical_services.ovem_user_id IS 'FK real del conductor asignado — reemplaza gradualmente a la columna de texto ovem';
COMMENT ON COLUMN medical_services.medico_user_id IS 'FK real del médico asignado — puede existir sin vehicle_id/ovem_user_id (prestador externo)';
COMMENT ON COLUMN medical_services.auxiliar_user_id IS 'FK real del auxiliar de enfermería asignado';
