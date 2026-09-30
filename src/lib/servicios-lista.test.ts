import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filtrosAQuery, leerFiltros, limiteSinGestionar } from "./servicios-lista";

describe("limiteSinGestionar", () => {
  const ahora = Date.parse("2026-09-30T14:30:00-05:00");

  it("resta días exactos", () => {
    assert.equal(limiteSinGestionar(3, "dia", ahora), new Date("2026-09-27T14:30:00-05:00").toISOString());
  });

  it("resta meses en el calendario de Colombia conservando la hora", () => {
    assert.equal(limiteSinGestionar(1, "mes", ahora), new Date("2026-08-30T14:30:00-05:00").toISOString());
    assert.equal(limiteSinGestionar(2, "anio", ahora), new Date("2024-09-30T14:30:00-05:00").toISOString());
  });

  it("usa el día de Colombia aunque en UTC ya sea el día siguiente", () => {
    // 31 de marzo 21:00 en Bogotá = 1 de abril en UTC. Un mes atrás es febrero (último día), no marzo.
    const noche = Date.parse("2026-03-31T21:00:00-05:00");
    assert.equal(limiteSinGestionar(1, "mes", noche), new Date("2026-02-28T21:00:00-05:00").toISOString());
  });
});

describe("leerFiltros (sin gestionar)", () => {
  it("acepta una cantidad entera positiva y una unidad conocida", () => {
    const { filtros } = leerFiltros({ sinGestionar: "15", sinGestionarUnidad: "mes" });
    assert.equal(filtros.sinGestionar, "15");
    assert.equal(filtros.sinGestionarUnidad, "mes");
    assert.equal(filtrosAQuery(filtros), "?sinGestionar=15&sinGestionarUnidad=mes");
  });

  it("descarta cantidades y unidades inválidas", () => {
    for (const valor of ["0", "-2", "1.5", "abc", "99999"]) {
      assert.equal(leerFiltros({ sinGestionar: valor }).filtros.sinGestionar, undefined, valor);
    }
    assert.equal(leerFiltros({ sinGestionarUnidad: "HOUR" }).filtros.sinGestionarUnidad, undefined);
  });
});
