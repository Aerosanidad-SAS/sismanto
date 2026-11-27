import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clasificarServicio, coincideFiltro, contarServicios, ordenarServicios, rotulosDeCola } from "./servicios-sala";

const AHORA = new Date("2026-11-09T13:00:00Z").getTime(); // 08:00 en Bogotá
const hace = (min: number) => new Date(AHORA - min * 60000).toISOString();
const en = (min: number) => new Date(AHORA + min * 60000).toISOString();
const base = { tipo_servicio: "TAB SENCILLO", etapa: "PROGRAMADO" };

describe("clasificarServicio", () => {
  it("sin vehículo ni tripulación es sin asignar, aunque pase su hora", () => {
    const c = clasificarServicio({ ...base, fecha_hora_programacion: hace(20) }, AHORA);
    assert.equal(c.estado, "sinasignar");
    assert.equal(c.retraso, 20);
  });

  it("asignado a tiempo es asignado; pasada la hora sin llegar es retrasado", () => {
    assert.equal(clasificarServicio({ ...base, vehicle_id: "v", fecha_hora_programacion: en(30) }, AHORA).estado, "asignado");
    const tarde = clasificarServicio({ ...base, vehicle_id: "v", fecha_hora_programacion: hace(12) }, AHORA);
    assert.equal(tarde.estado, "retrasado");
    assert.equal(tarde.retraso, 12);
  });

  it("en camino a recoger y atrasado es retrasado; ya en sitio es en curso", () => {
    const enCamino = { ...base, etapa: "CURSO", vehicle_id: "v", fecha_hora_inicio_desplazamiento: hace(30), fecha_hora_programacion: hace(5) };
    assert.equal(clasificarServicio(enCamino, AHORA).estado, "retrasado");
    assert.equal(clasificarServicio({ ...enCamino, fecha_hora_llegada_origen: hace(1) }, AHORA).estado, "encurso");
  });

  it("finalizado y cancelado cierran el estado", () => {
    assert.equal(clasificarServicio({ ...base, etapa: "FINALIZADO" }, AHORA).estado, "finalizado");
    const c = clasificarServicio({ ...base, etapa: "CANCELADO", fecha_hora_programacion: hace(60) }, AHORA);
    assert.equal(c.estado, "cancelado");
    assert.equal(c.etiqueta, "Cancelado");
    assert.equal(c.retraso, null);
  });
});

describe("contarServicios y coincideFiltro", () => {
  const estados = ["sinasignar", "asignado", "asignado", "encurso", "retrasado", "finalizado", "cancelado"] as const;
  it("abiertos suma sin asignar, asignado, en curso y retrasado", () => {
    const c = contarServicios(estados);
    assert.equal(c.abiertos, 5);
    assert.equal(c.asignado, 2);
    assert.equal(c.todos, 7);
  });
  it("los filtros coinciden con los conteos", () => {
    for (const f of ["abiertos", "sinasignar", "asignado", "encurso", "retrasado", "finalizado", "cancelado", "todos"] as const) {
      assert.equal(estados.filter((e) => coincideFiltro(e, f)).length, contarServicios(estados)[f]);
    }
  });
});

describe("ordenarServicios", () => {
  it("fija sin asignar y retrasados arriba y ordena el resto por hora", () => {
    const filas = [
      { n: "a", estado: "asignado" as const, programadoPara: en(60) },
      { n: "b", estado: "finalizado" as const, programadoPara: hace(120) },
      { n: "c", estado: "sinasignar" as const, programadoPara: en(180) },
      { n: "d", estado: "retrasado" as const, programadoPara: hace(10) },
      { n: "e", estado: "asignado" as const, programadoPara: null },
    ];
    assert.deepEqual(ordenarServicios(filas).map((f) => f.n), ["d", "c", "b", "a", "e"]);
  });
});

describe("rotulosDeCola", () => {
  it("rotula solo los vehículos con dos o más asignados, por hora", () => {
    const r = rotulosDeCola([
      { id: 1, placa: "AAA111", estado: "asignado", programadoPara: en(120) },
      { id: 2, placa: "AAA111", estado: "asignado", programadoPara: en(30) },
      { id: 3, placa: "BBB222", estado: "asignado", programadoPara: en(30) },
      { id: 4, placa: "AAA111", estado: "encurso", programadoPara: hace(30) },
    ]);
    assert.equal(r.get(2), "Cola del vehículo · 1.º de 2");
    assert.equal(r.get(1), "Cola del vehículo · 2.º de 2");
    assert.equal(r.has(3), false);
    assert.equal(r.has(4), false);
  });
});
