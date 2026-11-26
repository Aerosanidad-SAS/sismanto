import { test } from "node:test";
import assert from "node:assert/strict";
import { pasoADevolver } from "./estado-servicio";

const base = { tipo_servicio: "TAB SENCILLO", etapa: "CURSO" };

test("devolver el inicio de desplazamiento regresa la etapa a PROGRAMADO", () => {
  const r = pasoADevolver({ ...base, fecha_hora_inicio_desplazamiento: "2026-11-25T10:00:00Z" });
  assert.deepEqual(r, { campo: "fecha_hora_inicio_desplazamiento", hito: "Inicio de desplazamiento", etapaNueva: "PROGRAMADO" });
});

test("devolver un paso intermedio deja la etapa en CURSO", () => {
  const r = pasoADevolver({
    ...base,
    fecha_hora_inicio_desplazamiento: "a",
    fecha_hora_llegada_origen: "b",
  });
  assert.equal(r?.campo, "fecha_hora_llegada_origen");
  assert.equal(r?.etapaNueva, undefined);
});

test("sin hitos: PROGRAMADO no tiene nada que deshacer y CURSO vuelve a PROGRAMADO", () => {
  assert.equal(pasoADevolver({ ...base, etapa: "PROGRAMADO" }), null);
  assert.deepEqual(pasoADevolver({ tipo_servicio: "TELEMEDICINA", etapa: "CURSO" }), { etapaNueva: "PROGRAMADO" });
});

test("un servicio cerrado no se devuelve", () => {
  assert.equal(pasoADevolver({ ...base, etapa: "FINALIZADO", fecha_hora_inicio_desplazamiento: "a" }), null);
});
