import assert from "node:assert/strict";
import { test } from "node:test";

import {
  camposTripulacionDestino,
  esMovible,
  etiquetaRazon,
  filasDeCambio,
  planificarCambioDelDia,
  serviciosMovibles,
  tripulacionVigente,
  validarFiltroCambios,
  validarRazon,
  vehiculosDeOrigen,
  type ServicioMovible,
} from "./cambio-vehiculo";

test("validarRazon: código de la lista y texto de al menos 5 caracteres", () => {
  assert.equal(validarRazon({ razonCodigo: "REPARACION", razonTexto: "Frenos en taller" }), null);
  assert.equal(validarRazon({ razonCodigo: "OTRA", razonTexto: "Turno" }), null);
  assert.match(validarRazon(null) ?? "", /Elige la razón/);
  assert.match(validarRazon({ razonCodigo: "", razonTexto: "Frenos en taller" }) ?? "", /Elige la razón/);
  assert.match(validarRazon({ razonCodigo: "CAPRICHO", razonTexto: "Frenos en taller" }) ?? "", /Elige la razón/);
  assert.match(validarRazon({ razonCodigo: "FALLA", razonTexto: "abcd" }) ?? "", /mínimo 5/);
  assert.match(validarRazon({ razonCodigo: "FALLA", razonTexto: "   ab   " }) ?? "", /mínimo 5/);
  assert.match(validarRazon({ razonCodigo: "FALLA", razonTexto: undefined }) ?? "", /mínimo 5/);
});

test("planificarCambioDelDia: llenar un puesto vacío no pide razón", () => {
  const p = planificarCambioDelDia([], ["a"], new Map());
  assert.equal(p.requiereRazon, false);
  assert.deepEqual(p.llegadas, [{ userId: "a", vehiculoOrigen: null }]);
  assert.deepEqual(p.retirados, []);
});

test("planificarCambioDelDia: sin cambios no pide razón, aunque cambie el orden", () => {
  assert.equal(planificarCambioDelDia(["a", "b"], ["b", "a"], new Map()).requiereRazon, false);
});

test("planificarCambioDelDia: retirar o reemplazar a un conductor ya programado pide razón", () => {
  assert.equal(planificarCambioDelDia(["a", "b"], ["a"], new Map()).requiereRazon, true);
  const p = planificarCambioDelDia(["a"], ["b"], new Map());
  assert.equal(p.requiereRazon, true);
  assert.deepEqual(p.retirados, ["a"]);
});

test("planificarCambioDelDia: traer a alguien de otro vehículo pide razón y recuerda el origen", () => {
  const p = planificarCambioDelDia(["a"], ["a", "b"], new Map([["b", "v9"]]));
  assert.equal(p.requiereRazon, true);
  assert.deepEqual(p.llegadas, [{ userId: "b", vehiculoOrigen: "v9" }]);
});

test("filasDeCambio: llegadas con su origen y retirados sin destino", () => {
  const plan = planificarCambioDelDia(["a"], ["b"], new Map([["b", "v9"]]));
  assert.deepEqual(filasDeCambio("v1", plan), [
    { user_id: "b", vehicle_origen: "v9", vehicle_destino: "v1" },
    { user_id: "a", vehicle_origen: "v1", vehicle_destino: null },
  ]);
});

test("vehiculosDeOrigen: este vehículo si retira a alguien, y el origen de cada llegada", () => {
  const plan = planificarCambioDelDia(["a"], ["b", "c"], new Map([["b", "v9"], ["c", "v9"]]));
  assert.deepEqual(vehiculosDeOrigen("v1", plan).sort(), ["v1", "v9"]);
  assert.deepEqual(vehiculosDeOrigen("v1", planificarCambioDelDia([], ["a"], new Map())), []);
});

const s = (id: number, vehicle_id: string | null, etapa: string, inicio: string | null = null): ServicioMovible => ({ id, vehicle_id, etapa, fecha_hora_inicio_desplazamiento: inicio });

test("esMovible: solo PROGRAMADO sin desplazamiento iniciado", () => {
  assert.equal(esMovible(s(1, "v1", "PROGRAMADO")), true);
  assert.equal(esMovible(s(1, "v1", "PROGRAMADO", "2026-10-02T08:00:00-05:00")), false);
  assert.equal(esMovible(s(1, "v1", "CURSO")), false);
  assert.equal(esMovible(s(1, "v1", "FINALIZADO")), false);
  assert.equal(esMovible(s(1, "v1", "CANCELADO")), false);
});

test("serviciosMovibles: solo los del origen, sin iniciar; con ids se limita a esos", () => {
  const lista = [
    s(1, "v1", "PROGRAMADO"),
    s(2, "v1", "PROGRAMADO", "2026-10-02T08:00:00-05:00"), // ya salió
    s(3, "v1", "CURSO"),
    s(4, "v2", "PROGRAMADO"), // otro vehículo
    s(5, "v1", "PROGRAMADO"),
    s(6, null, "PROGRAMADO"),
  ];
  assert.deepEqual(serviciosMovibles(lista, "v1"), [1, 5]);
  assert.deepEqual(serviciosMovibles(lista, "v1", [5, 2, 4]), [5]); // iniciado y de otro vehículo se ignoran
  assert.deepEqual(serviciosMovibles(lista, "v1", []), []);
  assert.deepEqual(serviciosMovibles(lista, "v7"), []);
});

test("tripulacionVigente: la asignación más reciente de cada rol", () => {
  const t = tripulacionVigente([
    { id: 1, user_id: "viejo", rol_en_turno: "OVEM", fecha_inicio: "2026-09-01" },
    { id: 2, user_id: "nuevo", rol_en_turno: "OVEM", fecha_inicio: "2026-10-01" },
    { id: 3, user_id: "m", rol_en_turno: "MEDICO", fecha_inicio: "2026-10-01" },
    { id: 5, user_id: "x", rol_en_turno: "AUXILIAR_ENFERMERIA", fecha_inicio: "2026-10-01" },
    { id: 6, user_id: "y", rol_en_turno: "AUXILIAR_ENFERMERIA", fecha_inicio: "2026-10-01" },
  ]);
  assert.deepEqual(t, { ovem: "nuevo", medico: "m", auxiliar: "y" });
  assert.deepEqual(tripulacionVigente([]), { ovem: null, medico: null, auxiliar: null });
});

test("camposTripulacionDestino: sin tripulación deja en null; el médico solo si es del vehículo", () => {
  const t = { ovem: "o", medico: "m", auxiliar: null };
  assert.deepEqual(camposTripulacionDestino(t, true), { ovem_user_id: "o", auxiliar_user_id: null, medico_user_id: "m" });
  assert.deepEqual(camposTripulacionDestino(t, false), { ovem_user_id: "o", auxiliar_user_id: null });
});

test("validarFiltroCambios: fechas, rango máximo e ids con forma de UUID", () => {
  const v = "11111111-1111-1111-1111-111111111111";
  assert.equal(validarFiltroCambios({ desde: "2026-10-01", hasta: "2026-10-02", vehicleId: v, userId: v }), null);
  assert.equal(validarFiltroCambios({ desde: "2026-10-01", hasta: "2026-10-01" }), null);
  assert.match(validarFiltroCambios({ desde: "2026-13-01", hasta: "2026-10-02" }) ?? "", /Fechas inválidas/);
  assert.match(validarFiltroCambios({ desde: "2026-10-02", hasta: "2026-10-01" }) ?? "", /anterior/);
  assert.match(validarFiltroCambios({ desde: "2025-01-01", hasta: "2026-10-01" }) ?? "", /rango máximo/);
  assert.equal(validarFiltroCambios({ desde: "2025-10-01", hasta: "2026-10-01" }), null); // 365 días
  // Un id con comas o paréntesis rompería el filtro .or(): se rechaza.
  assert.match(validarFiltroCambios({ desde: "2026-10-01", hasta: "2026-10-02", vehicleId: "x),vehicle_destino.neq.y" }) ?? "", /Vehículo inválido/);
  assert.match(validarFiltroCambios({ desde: "2026-10-01", hasta: "2026-10-02", userId: "" }) ?? "", /Conductor inválido/);
});

test("etiquetaRazon: español para los códigos conocidos, el código tal cual para los demás", () => {
  assert.equal(etiquetaRazon("REPARACION"), "Vehículo a reparación");
  assert.equal(etiquetaRazon("ANTIGUO"), "ANTIGUO");
});
