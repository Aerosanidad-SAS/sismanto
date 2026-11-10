import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectarEventos, estadoParaAvisos, sonidoMasUrgente, type EstadoParaAvisos } from "./avisos-sala";

const hora = (iso: string | null) => (iso ? "08:00" : "—");
const e = (etiqueta: string, clase: EstadoParaAvisos["clase"], placa: string | null = "DRU893", hitoAt: string | null = "2026-11-09T13:00:00Z"): EstadoParaAvisos => ({
  etiqueta,
  clase,
  placa,
  hitoAt,
});

describe("detectarEventos", () => {
  it("sin cambios no avisa", () => {
    const f = { 1: e("Asignado", "asignado") };
    assert.deepEqual(detectarEventos(f, f, hora), []);
  });

  it("un cambio de estado avisa con placa y hora, con sonido suave", () => {
    const r = detectarEventos({ 1: e("En traslado", "encurso") }, { 1: e("En punto intermedio", "encurso") }, hora);
    assert.equal(r.length, 1);
    assert.equal(r[0].titulo, "#1 pasó a «En punto intermedio»");
    assert.equal(r[0].detalle, "DRU893 · actualizado a las 08:00");
    assert.equal(r[0].sonido, "estado");
  });

  it("un servicio nuevo sin asignar avisa como advertencia; uno que aparece cerrado no avisa", () => {
    const r = detectarEventos({}, { 2: e("Programado", "sinasignar", null), 3: e("Finalizado", "finalizado") }, hora);
    assert.equal(r.length, 1);
    assert.equal(r[0].tono, "warning");
    assert.equal(r[0].sonido, "nuevo");
  });

  it("quedar sin vehículo avisa una vez; pasar a retrasado avisa con el sonido grave", () => {
    const sin = detectarEventos({ 4: e("Asignado", "asignado") }, { 4: e("Programado", "sinasignar", null) }, hora);
    assert.deepEqual(sin.map((x) => x.sonido), ["nuevo"]);
    const tarde = detectarEventos({ 5: e("Asignado", "asignado") }, { 5: e("Asignado", "retrasado") }, hora);
    assert.deepEqual(tarde.map((x) => x.sonido), ["retraso"]);
    // Ya retrasado en el refresco anterior: no repite.
    assert.deepEqual(detectarEventos({ 5: e("Asignado", "retrasado") }, { 5: e("Asignado", "retrasado") }, hora), []);
  });

  it("cambio de estado y retraso a la vez dan dos eventos", () => {
    const r = detectarEventos({ 6: e("Asignado", "asignado") }, { 6: e("En desplazamiento", "retrasado") }, hora);
    assert.deepEqual(r.map((x) => x.sonido).sort(), ["estado", "retraso"]);
  });
});

describe("sonidoMasUrgente", () => {
  it("elige retraso sobre nuevo sobre estado", () => {
    const ev = (sonido: "estado" | "nuevo" | "retraso") => ({ id: sonido, titulo: "", detalle: "", tono: "info" as const, sonido });
    assert.equal(sonidoMasUrgente([]), null);
    assert.equal(sonidoMasUrgente([ev("estado"), ev("nuevo")]), "nuevo");
    assert.equal(sonidoMasUrgente([ev("nuevo"), ev("retraso"), ev("estado")]), "retraso");
  });
});

describe("estadoParaAvisos", () => {
  it("toma etiqueta, clase, placa y el último paso marcado", () => {
    const r = estadoParaAvisos(
      { etapa: "CURSO", tipo_servicio: "TAB SENCILLO", vehicle_id: "v", placa: "KLM218", fecha_hora_inicio_desplazamiento: "2026-11-09T12:00:00Z", fecha_hora_llegada_origen: "2026-11-09T12:20:00Z" },
      new Date("2026-11-09T12:30:00Z").getTime()
    );
    assert.equal(r.etiqueta, "En sitio");
    assert.equal(r.clase, "encurso");
    assert.equal(r.placa, "KLM218");
    assert.equal(r.hitoAt, "2026-11-09T12:20:00Z");
  });
});
