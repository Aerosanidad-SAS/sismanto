import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coincideVehiculo } from "./vehiculos-busqueda";

const v = { placa: "OMH169", tipo_vehiculo: "Ambulancia TAB", marca: "Renault", modelo: "2022", linea: "Master", centro_operativo: "MEDELLÍN", estado_actual: "OPERATIVO" };

describe("coincideVehiculo", () => {
  it("sin texto coincide con todo", () => {
    assert.equal(coincideVehiculo(v, ""), true);
    assert.equal(coincideVehiculo(v, "   "), true);
  });

  it("busca por placa sin importar mayúsculas ni un trozo", () => {
    assert.equal(coincideVehiculo(v, "omh169"), true);
    assert.equal(coincideVehiculo(v, "OMH"), true);
    assert.equal(coincideVehiculo(v, "zzz"), false);
  });

  it("busca por ciudad ignorando tildes", () => {
    assert.equal(coincideVehiculo(v, "medellin"), true);
    assert.equal(coincideVehiculo(v, "MEDELLÍN"), true);
    assert.equal(coincideVehiculo(v, "bogota"), false);
  });

  it("busca por tipo, marca, modelo, línea y estado", () => {
    for (const t of ["tab", "renault", "2022", "master", "operativo"]) assert.equal(coincideVehiculo(v, t), true, t);
  });

  it("varias palabras: todas deben aparecer, en cualquier campo", () => {
    assert.equal(coincideVehiculo(v, "omh169 medellin"), true);
    assert.equal(coincideVehiculo(v, "omh169 bogota"), false);
  });

  it("tolera campos vacíos", () => {
    assert.equal(coincideVehiculo({ placa: "AAA111" }, "aaa"), true);
    assert.equal(coincideVehiculo({ placa: "AAA111", marca: null }, "renault"), false);
  });
});
