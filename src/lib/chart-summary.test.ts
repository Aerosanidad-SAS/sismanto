import assert from "node:assert/strict";
import { test } from "node:test";

import { describeSeries, seriesStats, splitPercent } from "./chart-summary";

const pct = (v: number) => `${v.toFixed(1)} %`;
const rows = [
  { placa: "AAA111", disp: 98 },
  { placa: "BBB222", disp: 80 },
  { placa: "CCC333", disp: 92 },
];

test("seriesStats calcula promedio, menor y mayor", () => {
  const s = seriesStats(rows, "placa", "disp");
  assert.equal(s?.count, 3);
  assert.equal(s?.average, 90);
  assert.deepEqual(s?.min, { label: "BBB222", value: 80 });
  assert.deepEqual(s?.max, { label: "AAA111", value: 98 });
});

test("seriesStats ignora nulos y valores no numéricos", () => {
  const s = seriesStats([{ m: "a", v: null }, { m: "b", v: 4 }, { m: "c", v: Number.NaN }, { m: "d", v: "x" }], "m", "v");
  assert.equal(s?.count, 1);
  assert.equal(s?.average, 4);
});

test("seriesStats devuelve null sin datos", () => {
  assert.equal(seriesStats([], "a", "b"), null);
});

test("describeSeries redacta el resumen con el menor y el mayor", () => {
  const text = describeSeries({
    title: "Disponibilidad por vehículo",
    rows,
    labelKey: "placa",
    valueKey: "disp",
    format: pct,
    noun: ["vehículo", "vehículos"],
    labelPrefix: "placa",
  });
  assert.equal(text, "Disponibilidad por vehículo: 3 vehículos, promedio 90.0 %, menor 80.0 % (placa BBB222), mayor 98.0 % (placa AAA111).");
});

test("describeSeries con un solo punto y sin datos", () => {
  const base = { title: "T", labelKey: "placa", valueKey: "disp", format: pct, noun: ["vehículo", "vehículos"] as [string, string] };
  assert.equal(describeSeries({ ...base, rows: [rows[0]] }), "T: 1 vehículo, 98.0 % (AAA111).");
  assert.equal(describeSeries({ ...base, rows: [] }), "T: sin datos.");
});

test("splitPercent suma 100 y maneja total cero", () => {
  assert.deepEqual(splitPercent(62, 38), { a: 62, b: 38 });
  assert.deepEqual(splitPercent(1, 2), { a: 33, b: 67 });
  assert.equal(splitPercent(0, 0), null);
  assert.equal(splitPercent(-1, 3), null);
});
