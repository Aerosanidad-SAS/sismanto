import assert from "node:assert/strict";
import { test } from "node:test";

import { conductoresEnVariosVehiculos, resumenPorVehiculo, validarConductores, vehiculosPorConductor, type FilaOperacion } from "./programacion-diaria";

const op = (vehicle_id: string, user_id: string, origen: FilaOperacion["origen"] = "TITULAR"): FilaOperacion => ({ fecha: "2026-10-02", vehicle_id, user_id, origen });

test("validarConductores: uno o dos distintos", () => {
  assert.equal(validarConductores(["a"]), null);
  assert.equal(validarConductores(["a", "b"]), null);
  assert.match(validarConductores([]) ?? "", /al menos un conductor/);
  assert.match(validarConductores(["a", "b", "c"]) ?? "", /máximo 2/);
  assert.match(validarConductores(["a", "a"]) ?? "", /repetirse/);
});

test("resumenPorVehiculo: marca el cambio del día cuando difiere de los titulares", () => {
  const titulares = [
    { vehicle_id: "v1", user_id: "a", posicion: 1 },
    { vehicle_id: "v1", user_id: "b", posicion: 2 },
    { vehicle_id: "v2", user_id: "c", posicion: 1 },
  ];
  const r = resumenPorVehiculo(["v1", "v2", "v3"], titulares, [op("v1", "b"), op("v1", "a"), op("v2", "z", "CAMBIO_DEL_DIA")]);
  assert.equal(r[0].difiereDeTitulares, false); // mismos titulares aunque en otro orden
  assert.deepEqual(r[0].titulares, ["a", "b"]);
  assert.equal(r[1].difiereDeTitulares, true);
  assert.equal(r[2].difiereDeTitulares, false); // sin registro: no hay cambio que marcar
});

test("vista por conductor y aviso de conductor en varios vehículos", () => {
  const filas = [op("v1", "a"), op("v2", "a"), op("v3", "b")];
  assert.deepEqual(vehiculosPorConductor(filas).get("a"), ["v1", "v2"]);
  assert.deepEqual(conductoresEnVariosVehiculos(filas), ["a"]);
});
