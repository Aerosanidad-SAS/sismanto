import assert from "node:assert/strict";
import { test } from "node:test";

import { costoPorKm, cumplimientoPreoperacional, kmRecorridosPorVehiculo, resumenCombustible, resumenHojasDeVida } from "./kpis-mantenimiento";

test("preoperacional: cuenta fallas y cobertura diaria sobre la flota operativa", () => {
  const r = cumplimientoPreoperacional(
    [
      { vehicle_id: "a", fecha: "2026-09-29", checklist_ok: true },
      { vehicle_id: "b", fecha: "2026-09-29", checklist_ok: false },
      { vehicle_id: "a", fecha: "2026-09-30", checklist_ok: true },
    ],
    4,
  );
  assert.equal(r.realizados, 3);
  assert.equal(r.conFalla, 1);
  assert.equal(r.vehiculosConPreoperacional, 2);
  assert.equal(r.diasConRegistro, 2);
  assert.equal(r.coberturaDiariaPromedio, (1.5 / 4) * 100);
});

test("preoperacional: sin registros o sin flota no inventa porcentajes", () => {
  const r = cumplimientoPreoperacional([], 0);
  assert.equal(r.porcentajeConFalla, null);
  assert.equal(r.coberturaDiariaPromedio, null);
});

test("combustible: costo por galón solo con las cargas que traen costo", () => {
  const r = resumenCombustible([
    { galones: 10, costo: 100000 },
    { galones: 10, costo: null },
    { galones: 5, costo: 50000, km_sospechoso: true },
  ]);
  assert.equal(r.galones, 25);
  assert.equal(r.costoPorGalon, 10000);
  assert.equal(r.sospechosas, 1);
  assert.equal(resumenCombustible([{ galones: 3, costo: null }]).costoPorGalon, null);
});

test("hojas de vida: al día = sin alertas; los vencimientos salen ordenados por gravedad", () => {
  const completo = { placa: "AAA111", estado_actual: "OPERATIVO", vencimiento_soat: "2027-03-01", vencimiento_tecnicomecanica: "2027-03-01" };
  const r = resumenHojasDeVida(
    [
      { ...completo, placa: "BBB222", vencimiento_soat: "2026-10-10" },
      { ...completo, placa: "CCC333", vencimiento_soat: "2026-09-01" },
    ],
    "2026-09-30",
  );
  assert.equal(r.flota, 2);
  assert.equal(r.porTipo.SOAT, 2);
  assert.deepEqual(r.vencimientos.map((v) => v.placa), ["CCC333", "BBB222"]);
});

test("km recorridos: lectura más alta menos la más baja, y exige dos lecturas", () => {
  const km = kmRecorridosPorVehiculo([
    { vehicle_id: "a", fecha: "2026-09-01", lectura_kilometraje: 1000 },
    { vehicle_id: "a", fecha: "2026-09-30", lectura_kilometraje: 1600 },
    { vehicle_id: "b", fecha: "2026-09-30", lectura_kilometraje: 500 },
  ]);
  assert.equal(km.get("a"), 600);
  assert.equal(km.has("b"), false);
});

test("costo por km: ordena de mayor a menor y omite sin km o sin costo", () => {
  const filas = costoPorKm(
    [
      { vehicleId: "a", placa: "AAA111", costoTotal: 600000 },
      { vehicleId: "b", placa: "BBB222", costoTotal: 300000 },
      { vehicleId: "c", placa: "CCC333", costoTotal: 0 },
    ],
    new Map([["a", 600], ["b", 100], ["c", 50]]),
    new Map([["a", 1600]]),
  );
  assert.deepEqual(filas.map((f) => [f.placa, f.costoPorKm]), [["BBB222", 3000], ["AAA111", 1000]]);
  assert.equal(filas[1].kmActual, 1600);
});
