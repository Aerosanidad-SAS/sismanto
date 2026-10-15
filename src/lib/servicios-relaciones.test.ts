import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { idsUnicos, trozos, unirPacienteYMovil } from "./servicios-relaciones";

describe("idsUnicos", () => {
  it("quita repetidos y nulos, conservando el orden", () => {
    assert.deepEqual(idsUnicos([3, null, 3, 1, undefined, 2, 1]), [3, 1, 2]);
    assert.deepEqual(idsUnicos<string>([null, undefined]), []);
  });
});

describe("trozos", () => {
  it("parte la lista en bloques del tamaño pedido", () => {
    assert.deepEqual(trozos([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
    assert.deepEqual(trozos([], 200), []);
  });
});

describe("unirPacienteYMovil", () => {
  const filas = [
    { id: 1, patient_id: 10, vehicle_id: "v-1" },
    { id: 2, patient_id: 11, vehicle_id: null },
    { id: 3, patient_id: null, vehicle_id: "v-9" },
  ];
  const pacientes = [{ id: 10, cedula: "123", nombre1: "Ana", apellido1: "Gómez" }];
  const moviles = [{ id: "v-1", placa: "ABC123" }];

  it("pone el objeto del paciente y la placa, y null donde no hay o no se ve", () => {
    const r = unirPacienteYMovil(filas, pacientes, moviles);
    assert.deepEqual(r[0].patients, pacientes[0]);
    assert.deepEqual(r[0].vehicles, { placa: "ABC123" });
    assert.equal(r[1].patients, null); // paciente que el rol no puede ver
    assert.equal(r[1].vehicles, null);
    assert.equal(r[2].patients, null);
    assert.equal(r[2].vehicles, null); // móvil que no vino en la respuesta
  });

  it("conserva el orden y los campos de cada fila", () => {
    const r = unirPacienteYMovil(filas, pacientes, moviles);
    assert.deepEqual(r.map((f) => f.id), [1, 2, 3]);
  });

  it("sin paciente (conPaciente: false) no agrega la clave patients", () => {
    const r = unirPacienteYMovil(filas, null, moviles, false);
    assert.equal("patients" in r[0], false);
    assert.deepEqual(r[0].vehicles, { placa: "ABC123" });
  });

  it("tolera respuestas vacías o nulas de la base", () => {
    const r = unirPacienteYMovil(filas, null, undefined);
    assert.equal(r.length, 3);
    assert.equal(r[0].patients, null);
    assert.equal(r[0].vehicles, null);
  });
});
