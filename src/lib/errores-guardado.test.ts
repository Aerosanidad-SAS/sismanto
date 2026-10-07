import assert from "node:assert/strict";
import { test } from "node:test";

import { mensajeErrorGuardado } from "./errores-guardado";

test("no filtra el texto técnico de Postgres", () => {
  const m = mensajeErrorGuardado({ code: "23503", message: 'insert or update on table "daily_checks" violates foreign key constraint "daily_checks_vehicle_id_fkey"' });
  assert.doesNotMatch(m, /daily_checks|constraint|violates/i);
});

test("distingue permiso, rango y respaldo", () => {
  assert.match(mensajeErrorGuardado({ code: "42501" }), /permiso/);
  assert.match(mensajeErrorGuardado({ code: "22003" }), /números/);
  assert.match(mensajeErrorGuardado({ code: "XX000", message: "boom" }), /señal/);
  assert.match(mensajeErrorGuardado(null), /señal/);
});

test("usa el nombre de lo que se guardaba", () => {
  assert.match(mensajeErrorGuardado({ code: "42501" }, "el preoperacional"), /el preoperacional/);
});
