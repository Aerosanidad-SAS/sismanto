import assert from "node:assert/strict";
import { test } from "node:test";

import { hallazgosPreoperacional, novedadesDeHallazgos, resumirHallazgos, type ItemEvaluado } from "./preoperacional-alertas";

const HOY = "2026-09-30";
const AL_DIA = { vencimiento_soat: "2027-03-01", vencimiento_tecnicomecanica: "2027-03-01" };

const item = (descripcion: string, estado: ItemEvaluado["estado"], severidadFalla: ItemEvaluado["severidadFalla"], observacion = ""): ItemEvaluado => ({
  descripcion,
  estado,
  severidadFalla,
  observacion,
});

test("todo OK y documentos al día: sin hallazgos ni novedades", () => {
  const h = hallazgosPreoperacional([item("Nivel aceite de motor", "OK", "CRITICA"), item("Pito", "NO_APLICA", "MEDIA")], AL_DIA, HOY);
  assert.deepEqual(h, []);
  assert.deepEqual(novedadesDeHallazgos(h, HOY), []);
  assert.equal(resumirHallazgos(h).mensaje, null);
});

test("sin aceite de motor es crítico y saca el vehículo de servicio", () => {
  const h = hallazgosPreoperacional([item("Nivel aceite de motor", "FALLA", "CRITICA", "sin aceite en la varilla")], AL_DIA, HOY);
  assert.equal(h.length, 1);
  assert.equal(h[0].severidad, "CRITICA");
  assert.equal(h[0].fds, true);
  const n = novedadesDeHallazgos(h, HOY);
  assert.equal(n.length, 1);
  assert.equal(n[0].afectaOperatividad, true);
  assert.equal(n[0].severidad, "ALTA");
  assert.match(n[0].descripcion, /CRÍTICO.*aceite/);
});

test("una novedad por hallazgo, con clave estable que no lleva fecha ni detalle", () => {
  const items = [
    item("Freno de pedal", "FALLA", "CRITICA", "pedal largo"),
    item("Fuga de líquidos en el piso", "FALLA", "CRITICA", "charco de refrigerante"),
    item("Pito", "FALLA", "MEDIA", "no suena"),
    item("Luces principales", "FALLA", "ALTA", "una apagada"),
  ];
  const n = novedadesDeHallazgos(hallazgosPreoperacional(items, AL_DIA, HOY), HOY);
  assert.equal(n.length, 4);
  assert.equal(n.filter((x) => x.afectaOperatividad).length, 2);
  assert.equal(n.find((x) => x.clave.endsWith("Pito"))?.severidad, "MEDIA");
  assert.equal(n.find((x) => x.clave.endsWith("Luces principales"))?.severidad, "ALTA");
  assert.match(n.find((x) => x.clave.endsWith("Pito"))?.descripcion ?? "", /^\[Preoperacional\] Pito — no suena$/);
});

test("el mismo bombillo quemado en días distintos produce la misma clave (no se acumulan novedades)", () => {
  const ayer = novedadesDeHallazgos(hallazgosPreoperacional([item("Luz de freno", "FALLA", "MEDIA", "izquierda apagada")], AL_DIA, "2026-10-01"), "2026-10-01");
  const hoy = novedadesDeHallazgos(hallazgosPreoperacional([item("Luz de freno", "FALLA", "MEDIA", "sigue apagada")], AL_DIA, "2026-10-02"), "2026-10-02");
  assert.equal(ayer[0].clave, hoy[0].clave);
  assert.ok(hoy[0].descripcion.startsWith(ayer[0].clave));
});

test("SOAT o técnico-mecánica vencidos son críticos aunque el OVEM no marque nada", () => {
  const h = hallazgosPreoperacional([], { vencimiento_soat: "2026-09-29", vencimiento_rtm: "2026-01-01" }, HOY);
  assert.equal(h.filter((x) => x.severidad === "CRITICA").length, 2);
  assert.ok(h.every((x) => x.fds && x.origen === "DOCUMENTO"));
});

test("documento sin fecha en la ficha: alerta alta, pero no saca de servicio", () => {
  const h = hallazgosPreoperacional([], {}, HOY);
  assert.equal(h.length, 2);
  assert.ok(h.every((x) => x.severidad === "ALTA" && !x.fds));
});

test("el resumen para el OVEM cuenta críticos y otros", () => {
  const h = hallazgosPreoperacional([item("Freno de pedal", "FALLA", "CRITICA", "x"), item("Pito", "FALLA", "MEDIA", "x")], AL_DIA, HOY);
  const r = resumirHallazgos(h);
  assert.equal(r.criticos, 1);
  assert.equal(r.otros, 1);
  assert.match(r.mensaje ?? "", /FUERA DE SERVICIO/);
});

test("ítem sin severidad configurada se trata como media", () => {
  const h = hallazgosPreoperacional([item("Algo nuevo", "FALLA", undefined, "roto")], AL_DIA, HOY);
  assert.equal(h[0].severidad, "MEDIA");
  assert.equal(h[0].fds, false);
});
