import assert from "node:assert/strict";
import { test } from "node:test";

import { hallazgosPreoperacional, novedadesDeHallazgos, resumenSiFallaElMotor, resumirHallazgos, type ItemEvaluado } from "./preoperacional-alertas";

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

test("el resumen no afirma que se avisó cuando el correo no salió", () => {
  const h = hallazgosPreoperacional([item("Freno de pedal", "FALLA", "CRITICA", "x")], AL_DIA, HOY);
  assert.match(resumirHallazgos(h, "ENVIADO").mensaje ?? "", /se avisó a Regulación/);
  const fallo = resumirHallazgos(h, "FALLO").mensaje ?? "";
  assert.match(fallo, /NO se pudo enviar/);
  assert.doesNotMatch(fallo, /se avisó/);
  assert.match(resumirHallazgos(h, "YA_REPORTADO").mensaje ?? "", /ya estaba reportado/);
});

test("si la novedad crítica no se pudo guardar, el resumen NO dice «ya estaba reportado» y manda a llamar a Regulación", () => {
  const h = hallazgosPreoperacional([item("Freno de pedal", "FALLA", "CRITICA", "x")], AL_DIA, HOY);
  const r = resumirHallazgos(h, "YA_REPORTADO", { criticos: 1, otros: 0 });
  assert.equal(r.registroIncompleto, true);
  assert.match(r.mensaje ?? "", /NO se pudo registrar/);
  assert.match(r.mensaje ?? "", /llama ya a Regulación/);
  assert.match(r.mensaje ?? "", /Revisar y actualizar/);
  assert.doesNotMatch(r.mensaje ?? "", /ya estaba reportado/);
  assert.doesNotMatch(r.mensaje ?? "", /se avisó/);
});

test("si solo falló una novedad no crítica, se avisa y se cuenta lo que sí quedó reportado", () => {
  const h = hallazgosPreoperacional([item("Pito", "FALLA", "MEDIA", "x"), item("Espejo", "FALLA", "BAJA", "x")], AL_DIA, HOY);
  const r = resumirHallazgos(h, "YA_REPORTADO", { criticos: 0, otros: 1 });
  assert.equal(r.registroIncompleto, true);
  assert.match(r.mensaje ?? "", /1 hallazgo no crítico NO se pudo registrar como novedad/);
  assert.match(r.mensaje ?? "", /1 hallazgo reportado como novedad/);
});

test("sin fallos de registro el resumen no marca registroIncompleto", () => {
  const h = hallazgosPreoperacional([item("Freno de pedal", "FALLA", "CRITICA", "x")], AL_DIA, HOY);
  assert.equal(resumirHallazgos(h).registroIncompleto, false);
  assert.equal(resumirHallazgos(h, "ENVIADO", { criticos: 0, otros: 0 }).registroIncompleto, false);
  assert.equal(resumirHallazgos([]).registroIncompleto, false);
});

test("sinDocumentos omite SOAT y técnico-mecánica (ficha ilegible) pero conserva las fallas de los ítems", () => {
  const sinFicha = {};
  const conDocs = hallazgosPreoperacional([item("Freno de pedal", "FALLA", "CRITICA", "x")], sinFicha, HOY);
  assert.equal(conDocs.length, 3); // el ítem + SOAT y técnico-mecánica «sin fecha»
  const sinDocs = hallazgosPreoperacional([item("Freno de pedal", "FALLA", "CRITICA", "x")], sinFicha, HOY, { sinDocumentos: true });
  assert.equal(sinDocs.length, 1);
  assert.equal(sinDocs[0].titulo, "Freno de pedal");
});

test("plurales: «se pudo» con uno y «se pudieron» con varios, en críticos y no críticos", () => {
  const dos = hallazgosPreoperacional([item("Freno de pedal", "FALLA", "CRITICA", "x"), item("Aceite", "FALLA", "CRITICA", "x")], AL_DIA, HOY);
  assert.match(resumirHallazgos(dos, "ENVIADO", { criticos: 2, otros: 0 }).mensaje ?? "", /2 hallazgos críticos: NO se pudieron registrar/);
  const noCriticos = hallazgosPreoperacional([item("Pito", "FALLA", "MEDIA", "x"), item("Espejo", "FALLA", "BAJA", "x")], AL_DIA, HOY);
  assert.match(resumirHallazgos(noCriticos, "ENVIADO", { criticos: 0, otros: 2 }).mensaje ?? "", /2 hallazgos no críticos NO se pudieron registrar como novedad/);
});

test("críticos guardados y fallidos a la vez: no afirma que el vehículo sigue operativo y dice que los demás sí quedaron", () => {
  const tres = hallazgosPreoperacional(
    [item("Freno de pedal", "FALLA", "CRITICA", "x"), item("Aceite", "FALLA", "CRITICA", "x"), item("Dirección", "FALLA", "CRITICA", "x")],
    AL_DIA,
    HOY
  );
  const m = resumirHallazgos(tres, "ENVIADO", { criticos: 2, otros: 0 }).mensaje ?? "";
  assert.match(m, /3 hallazgos críticos: 2 NO se pudieron registrar en el sistema; los demás sí/);
  assert.match(m, /llama ya a Regulación/);
  assert.doesNotMatch(m, /puede seguir como OPERATIVO/);
});

test("ficha del vehículo ilegible: avisa que no se revisaron SOAT ni técnico-mecánica aunque no haya hallazgos", () => {
  const r = resumirHallazgos([], "ENVIADO", { criticos: 0, otros: 0, documentosSinEvaluar: true });
  assert.equal(r.registroIncompleto, true);
  assert.match(r.mensaje ?? "", /SOAT/);
  assert.match(r.mensaje ?? "", /Revisar y actualizar/);
});

test("si el motor falla entero, siempre hay aviso: con una crítica marcada manda llamar a Regulación", () => {
  const r = resumenSiFallaElMotor([item("Freno de pedal", "FALLA", "CRITICA", "x"), item("Luces", "OK", "MEDIA")], HOY);
  assert.equal(r.criticos, 1);
  assert.equal(r.registroIncompleto, true);
  assert.match(r.mensaje ?? "", /NO se pudo registrar/);
  assert.match(r.mensaje ?? "", /llama ya a Regulación/);
  assert.match(r.mensaje ?? "", /SOAT/);
});

test("si el motor falla entero y todo está OK, no se muestra «completado correctamente»: hay aviso de lo que no se revisó", () => {
  const r = resumenSiFallaElMotor([item("Luces", "OK", "MEDIA"), item("Pito", "NO_APLICA", "MEDIA")], HOY);
  assert.equal(r.criticos, 0);
  assert.equal(r.registroIncompleto, true);
  assert.ok(r.mensaje && /SOAT/.test(r.mensaje));
  assert.doesNotMatch(r.mensaje ?? "", /FUERA DE SERVICIO/);
});
