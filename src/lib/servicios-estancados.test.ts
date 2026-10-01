import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { horasEstancado } from "./servicios-lista";

describe("horasEstancado con umbral configurable", () => {
  const ahora = Date.parse("2026-09-30T15:00:00-05:00");
  const s = (etapa: string, horasAtras: number) => ({
    etapa,
    fecha_hora_programacion: new Date(ahora - horasAtras * 3_600_000).toISOString(),
  });

  it("sin configuración usa los 4 h de siempre", () => {
    assert.equal(horasEstancado(s("PROGRAMADO", 5), ahora), 5);
    assert.equal(horasEstancado(s("PROGRAMADO", 3), ahora), null);
  });

  it("respeta un umbral distinto por etapa", () => {
    const umbrales = { PROGRAMADO: 24, CURSO: 3 };
    assert.equal(horasEstancado(s("PROGRAMADO", 5), ahora, umbrales), null);
    assert.equal(horasEstancado(s("CURSO", 5), ahora, umbrales), 5);
  });

  it("desactivado (null) no marca nada, y las etapas finales nunca", () => {
    assert.equal(horasEstancado(s("PROGRAMADO", 500), ahora, null), null);
    assert.equal(horasEstancado(s("FINALIZADO", 500), ahora), null);
  });
});
