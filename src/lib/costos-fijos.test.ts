import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { costoFijoDelPeriodo, rtmDelPeriodo, tarifaRtmDelAnio } from "./costos-fijos";

const TARIFAS = { 2024: 327_219, 2025: 360_000, 2026: 330_000 };
const casi = (real: number, esperado: number) => assert.ok(Math.abs(real - esperado) < 0.01, `${real} ≠ ${esperado}`);

// Corren con TZ=UTC, America/Bogota y Asia/Tokyo: el resultado tiene que ser idéntico en las tres.

describe("rtmDelPeriodo", () => {
  it("no inventa un año: 1 ene 2024 → 25 sep 2026 son 3 años, no 4 (bug: Bogotá daba 1.347.219)", () => {
    // 2024 y 2025 completos + 268 de 365 días de 2026
    casi(rtmDelPeriodo("2024-01-01", "2026-09-25", TARIFAS), 327_219 + 360_000 + (330_000 * 268) / 365);
  });
  it("un periodo de un día cobra un día, no el año entero", () => {
    casi(rtmDelPeriodo("2025-12-31", "2026-01-01", TARIFAS), 360_000 / 365 + 330_000 / 365);
  });
  it("un año completo cobra exactamente la tarifa (2024 es bisiesto)", () => {
    casi(rtmDelPeriodo("2024-01-01", "2024-12-31", TARIFAS), 327_219);
  });
  it("antes del primer dato cuesta 0 y después del último proyecta la última tarifa", () => {
    assert.equal(rtmDelPeriodo("2023-01-01", "2023-12-31", TARIFAS), 0);
    casi(rtmDelPeriodo("2027-01-01", "2027-12-31", TARIFAS), 330_000);
  });
});

describe("tarifaRtmDelAnio", () => {
  it("año intermedio sin dato usa el anterior conocido", () => {
    assert.equal(tarifaRtmDelAnio(2025, { 2024: 100, 2026: 300 }), 100);
  });
  it("sin tarifas devuelve 0", () => {
    assert.equal(tarifaRtmDelAnio(2026, {}), 0);
  });
});

describe("costoFijoDelPeriodo", () => {
  it("SOAT y póliza se prorratean por días/365", () => {
    // 90 días de 2026 (1 ene → 31 mar)
    casi(
      costoFijoDelPeriodo({ soatAnual: 1_000_000, polizaAnual: 2_000_000 }, "2026-01-01", "2026-03-31", {}),
      (3_000_000 * 90) / 365
    );
  });
  it("tolera valores vacíos", () => {
    assert.equal(costoFijoDelPeriodo({ soatAnual: null, polizaAnual: undefined }, "2026-01-01", "2026-01-31", {}), 0);
  });
  it("suma SOAT, póliza y RTM del mismo periodo", () => {
    const f = costoFijoDelPeriodo({ soatAnual: 730_000, polizaAnual: 0 }, "2026-01-01", "2026-01-10", TARIFAS);
    casi(f, (730_000 * 10) / 365 + (330_000 * 10) / 365);
  });
});
