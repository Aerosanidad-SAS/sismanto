import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { costoAnualDelPeriodo, costoDevengado } from "./costos-fijos";

const casi = (real: number, esperado: number) => assert.ok(Math.abs(real - esperado) < 0.01, `${real} ≠ ${esperado}`);

// Corren con TZ=UTC, America/Bogota y Asia/Tokyo: el resultado tiene que ser idéntico en las tres.

describe("costoDevengado", () => {
  it("un año completo cobra exactamente el valor (2024 es bisiesto)", () => {
    casi(costoDevengado(327_219, "2024-01-01", "2024-12-31", "2024-01-01", "2024-12-31"), 327_219);
  });
  it("un periodo que abarca varias vigencias no inventa años (bug: Bogotá contaba 4 en vez de 3)", () => {
    const vigencias = [
      { valor: 327_219, vigenciaDesde: "2024-01-01", vigenciaHasta: "2024-12-31" },
      { valor: 360_000, vigenciaDesde: "2025-01-01", vigenciaHasta: "2025-12-31" },
      { valor: 330_000, vigenciaDesde: "2026-01-01", vigenciaHasta: "2026-12-31" },
    ];
    // 2024 y 2025 completos + 268 de 365 días de 2026
    casi(costoAnualDelPeriodo(vigencias, "2024-01-01", "2026-09-25"), 327_219 + 360_000 + (330_000 * 268) / 365);
  });
  it("un periodo de un día cobra un día, no la vigencia entera", () => {
    casi(costoDevengado(365_000, "2026-01-01", "2026-12-31", "2026-05-10", "2026-05-10"), 1_000);
  });
  it("fuera de la vigencia cuesta 0", () => {
    assert.equal(costoDevengado(360_000, "2025-01-01", "2025-12-31", "2026-01-01", "2026-03-31"), 0);
  });
  it("una vigencia que no es anual (SOAT de 1 abr a 31 mar) se reparte por sus propios días", () => {
    // 365 días de vigencia; un trimestre dentro: 1 abr–30 jun = 91 días
    casi(costoDevengado(730_000, "2026-04-01", "2027-03-31", "2026-04-01", "2026-06-30"), (730_000 * 91) / 365);
  });
  it("tolera valores vacíos y vigencias inválidas", () => {
    assert.equal(costoDevengado(null, "2026-01-01", "2026-12-31", "2026-01-01", "2026-01-31"), 0);
    assert.equal(costoDevengado(100, "2026-12-31", "2026-01-01", "2026-01-01", "2026-12-31"), 0);
  });
});
