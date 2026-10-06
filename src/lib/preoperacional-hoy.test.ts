import assert from "node:assert/strict";
import { test } from "node:test";

import { candidatosDeHoy, clasificarPreoperacionalHoy, type VehiculoFlota } from "./preoperacional-hoy";

const v = (id: string, extra: Partial<VehiculoFlota> = {}): VehiculoFlota => ({
  id,
  placa: id.toUpperCase(),
  estado_actual: "OPERATIVO",
  centro_operativo: "BOG",
  ovemAsignado: null,
  tieneTripulacion: false,
  ...extra,
});

test("un centro con programación usa solo su programación; otro centro conserva la tripulación", () => {
  const flota = [v("a"), v("b"), v("c", { centro_operativo: "MDE", tieneTripulacion: true }), v("d", { centro_operativo: "MDE" })];
  const c = candidatosDeHoy(flota, new Set(["a"]));
  assert.deepEqual(c.map((x) => x.id), ["a", "c"]);
});

test("un vehículo que quedó FDS por el preoperacional de hoy sigue contando y aparece «con falla»", () => {
  const candidatos = [v("a", { estado_actual: "FUERA_DE_SERVICIO" }), v("b")];
  const r = clasificarPreoperacionalHoy(candidatos, [{ vehicle_id: "a", checklist_ok: false }, { vehicle_id: "b", checklist_ok: true }], new Map());
  assert.equal(r.esperados, 2);
  assert.equal(r.realizados, 2);
  assert.equal(r.conFalla.length, 1);
  assert.equal(r.conFalla[0].fueraDeServicio, true);
  assert.equal(r.pendientes.length, 0);
});

test("un vehículo FDS sin preoperacional de hoy no se espera", () => {
  const r = clasificarPreoperacionalHoy([v("a", { estado_actual: "FUERA_DE_SERVICIO" })], [], new Map());
  assert.equal(r.esperados, 0);
});

test("el conductor de los pendientes sale de la programación; si no hay, de la tripulación", () => {
  const candidatos = [v("a", { ovemAsignado: "Asignado Viejo" }), v("b", { ovemAsignado: "Respaldo" })];
  const r = clasificarPreoperacionalHoy(candidatos, [], new Map([["a", ["Ana Ruiz", "Luis Mora"]]]));
  assert.equal(r.pendientes[0].ovem, "Ana Ruiz / Luis Mora");
  assert.equal(r.pendientes[1].ovem, "Respaldo");
});

test("con varios preoperacionales del día, una falla de cualquiera marca el vehículo", () => {
  const r = clasificarPreoperacionalHoy([v("a")], [{ vehicle_id: "a", checklist_ok: true }, { vehicle_id: "a", checklist_ok: false }], new Map());
  assert.equal(r.conFalla.length, 1);
});
