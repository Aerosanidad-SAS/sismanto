import assert from "node:assert/strict";
import { test } from "node:test";

import { filtrarYOrdenar, hayFiltrosUsuarios, siguienteOrden, type TextosUsuario } from "./usuarios-tabla";

const fila = (nombre: string, email: string, rol: string, extra: Partial<TextosUsuario> = {}) => ({
  texto: { nombre, email, cedula: "", ciudad: "", centro: "", rol, estado: "Activo", ...extra },
});
const ana = fila("Ana Peña", "ana@x.co", "Médico", { cedula: "100" });
const luis = fila("Luis Gómez", "luis@x.co", "Regulación", { ciudad: "Bogotá" });
const sin = fila("", "sin@x.co", "Médico");
const filas = [luis, sin, ana];

test("la búsqueda ignora tildes y mayúsculas y mira nombre, correo, cédula y rol", () => {
  assert.deepEqual(filtrarYOrdenar(filas, "PENA", {}, null), [ana]);
  assert.deepEqual(filtrarYOrdenar(filas, "luis@", {}, null), [luis]);
  assert.deepEqual(filtrarYOrdenar(filas, "medico", {}, null), [sin, ana]);
  assert.deepEqual(filtrarYOrdenar(filas, "100", {}, null), [ana]);
  assert.deepEqual(filtrarYOrdenar(filas, "bogota", {}, null), []); // la ciudad solo se filtra por su columna
});

test("los filtros por columna se combinan con la búsqueda (Y)", () => {
  assert.deepEqual(filtrarYOrdenar(filas, "", { ciudad: "bog" }, null), [luis]);
  assert.deepEqual(filtrarYOrdenar(filas, "medico", { email: "ana" }, null), [ana]);
  assert.deepEqual(filtrarYOrdenar(filas, "luis", { rol: "medico" }, null), []);
});

test("ordena asc/desc, con vacíos siempre al final y sin mutar la entrada", () => {
  assert.deepEqual(filtrarYOrdenar(filas, "", {}, { columna: "nombre", dir: "asc" }), [ana, luis, sin]);
  assert.deepEqual(filtrarYOrdenar(filas, "", {}, { columna: "nombre", dir: "desc" }), [luis, ana, sin]);
  assert.deepEqual(filas, [luis, sin, ana]);
});

test("siguienteOrden cicla asc → desc → sin orden y reinicia al cambiar de columna", () => {
  const asc = siguienteOrden(null, "rol");
  assert.deepEqual(asc, { columna: "rol", dir: "asc" });
  assert.deepEqual(siguienteOrden(asc, "rol"), { columna: "rol", dir: "desc" });
  assert.equal(siguienteOrden({ columna: "rol", dir: "desc" }, "rol"), null);
  assert.deepEqual(siguienteOrden(asc, "nombre"), { columna: "nombre", dir: "asc" });
});

test("hayFiltrosUsuarios ignora espacios", () => {
  assert.equal(hayFiltrosUsuarios("  ", { ciudad: " " }), false);
  assert.equal(hayFiltrosUsuarios("", { ciudad: "x" }), true);
});
