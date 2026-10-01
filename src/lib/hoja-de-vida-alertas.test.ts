import assert from "node:assert/strict";
import { test } from "node:test";

import { alertasDeVehiculo } from "./hoja-de-vida-alertas";

const HOY = "2026-09-30";
const completo = {
  tipo_vehiculo: "AMBULANCIA_TAB", marca: "X", linea: "Y", modelo: "2021", combustible: "DIESEL", km_actual: 1000,
  fecha_km_actual: "2026-09-01", tipo_llantas: "a", bombilleria_farolas: "a", bombilleria_stops: "a",
  bombilleria_direccionales: "a", tipo_refrigerante: "a", aceite_usado: "a", ref_filtro_aceite: "a",
  ref_filtro_aire_motor: "a", bateria_principal: "a", bateria_auxiliar: "a",
};

test("vehículo completo, operativo y con documentos al día: sin alertas", () => {
  assert.deepEqual(alertasDeVehiculo({ placa: "AAA111", estado_actual: "OPERATIVO", vencimiento_soat: "2027-03-01", ...completo }, HOY), []);
});

test("FDS sin fecha no cuenta días; con fecha y más de 7 días alerta", () => {
  const sin = alertasDeVehiculo({ placa: "A", estado_actual: "FUERA_DE_SERVICIO", ...completo }, HOY);
  assert.deepEqual(sin.map((a) => a.tipo), ["FDS_SIN_FECHA"]);
  const largo = alertasDeVehiculo({ placa: "A", estado_actual: "FUERA_DE_SERVICIO", fds_desde: "2025-10-03", ...completo }, HOY);
  assert.equal(largo[0].tipo, "FDS_LARGO");
  const corto = alertasDeVehiculo({ placa: "A", estado_actual: "FUERA_DE_SERVICIO", fds_desde: "2026-09-25", ...completo }, HOY);
  assert.deepEqual(corto, []);
});

test("SOAT vencido es alta; por vencer en 30 días es media; RTM cae a vencimiento_rtm", () => {
  const a = alertasDeVehiculo({ placa: "A", estado_actual: "OPERATIVO", vencimiento_soat: "2026-09-29", vencimiento_rtm: "2026-10-15", ...completo }, HOY);
  assert.equal(a.find((x) => x.tipo === "SOAT")?.gravedad, "alta");
  assert.equal(a.find((x) => x.tipo === "RTM")?.gravedad, "media");
});

test("hoja de vida incompleta lista los campos que faltan", () => {
  const a = alertasDeVehiculo({ placa: "A", estado_actual: "OPERATIVO" }, HOY);
  assert.equal(a.length, 1);
  assert.equal(a[0].tipo, "INCOMPLETA");
  assert.match(a[0].detalle, /km_actual/);
});
