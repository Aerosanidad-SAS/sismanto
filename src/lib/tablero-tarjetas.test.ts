import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Aptitud, FilaTablero } from "./aptitud-vehiculo";
import { contarFlota, filtrarFlota, iniciales, tonoTarjeta } from "./tablero-tarjetas";

const fila = (placa: string, aptitud: Aptitud, estado: "LIBRE" | "EN_SERVICIO"): FilaTablero =>
  ({
    vehicleId: placa,
    placa,
    conductores: [],
    aptitud,
    novedades: { cantidad: 0, severidadMaxima: null },
    motivoSolicitud: null,
    ocupacion: { estado, servicioActual: null, serviciosEnCurso: 0, proximo: null, resto: [] },
  }) as unknown as FilaTablero;

const filas = [
  fila("A", "NO_APTO", "LIBRE"),
  fila("B", "APTO", "EN_SERVICIO"),
  fila("C", "APTO", "LIBRE"),
  fila("D", "APTO_CON_NOVEDADES", "LIBRE"),
  fila("E", "SIN_PREOPERACIONAL", "EN_SERVICIO"),
];

describe("filtrarFlota y contarFlota", () => {
  it("todos devuelve todo; en servicio, libres (solo aptos) y alertas filtran", () => {
    assert.deepEqual(filtrarFlota(filas, "todos").map((f) => f.placa), ["A", "B", "C", "D", "E"]);
    assert.deepEqual(filtrarFlota(filas, "servicio").map((f) => f.placa), ["B", "E"]);
    assert.deepEqual(filtrarFlota(filas, "libres").map((f) => f.placa), ["C", "D"]);
    assert.deepEqual(filtrarFlota(filas, "alertas").map((f) => f.placa), ["A", "D", "E"]);
  });

  it("los conteos coinciden con los filtros", () => {
    assert.deepEqual(contarFlota(filas), { todos: 5, servicio: 2, libres: 2, alertas: 3 });
  });
});

describe("tonoTarjeta", () => {
  it("la atención manda sobre libre o en servicio", () => {
    assert.equal(tonoTarjeta(filas[0]), "alerta");
    assert.equal(tonoTarjeta(filas[4]), "aviso");
    assert.equal(tonoTarjeta(filas[3]), "aviso");
    assert.equal(tonoTarjeta(filas[1]), "servicio");
    assert.equal(tonoTarjeta(filas[2]), "libre");
  });
});

describe("iniciales", () => {
  it("quita el tratamiento y toma dos letras", () => {
    assert.equal(iniciales("Dra. Natalia Cano"), "NC");
    assert.equal(iniciales("Wilson Zapata Rojas"), "WZ");
    assert.equal(iniciales("Madonna"), "M");
    assert.equal(iniciales(""), "");
  });
});
