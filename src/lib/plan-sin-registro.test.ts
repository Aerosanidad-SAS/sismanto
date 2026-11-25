import { test } from "node:test";
import assert from "node:assert/strict";
import { itemsSinPrimerRegistro } from "./plan-sin-registro";

const items = [
  { id: 1, aplica_a: "TODOS" },
  { id: 2, aplica_a: "AIRPLAN" },
  { id: 3, aplica_a: "CRA_MEDELLIN" },
  { id: 4, aplica_a: "ABC123" },
  { id: 5, aplica_a: "TODOS" },
];

test("solo quedan los que aplican al vehículo y no tienen alerta", () => {
  const r = itemsSinPrimerRegistro(items, { placa: "ABC123", centro_operativo: "CRA_MEDELLIN" }, [5]);
  assert.deepEqual(r.map((i) => i.id), [1, 3, 4]);
});

test("sin centro, solo TODOS y la placa", () => {
  const r = itemsSinPrimerRegistro(items, { placa: "XYZ999", centro_operativo: null }, []);
  assert.deepEqual(r.map((i) => i.id), [1, 5]);
});
