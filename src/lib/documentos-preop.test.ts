import assert from "node:assert/strict";
import { test } from "node:test";

import { detalleItem, esItemDocumentos, vigenciaDocumento } from "./documentos-preop";

test("vigenciaDocumento: días faltantes y alerta a 5 días o menos", () => {
  const hoy = "2026-10-13";
  assert.deepEqual(vigenciaDocumento("2026-11-24", hoy), { dias: 42, nivel: "ok", texto: "Faltan 42 días" });
  assert.equal(vigenciaDocumento("2026-10-19", hoy).nivel, "ok"); // 6 días
  assert.equal(vigenciaDocumento("2026-10-18", hoy).nivel, "alerta"); // 5 días
  assert.equal(vigenciaDocumento("2026-10-14", hoy).texto, "Faltan 1 día");
  assert.equal(vigenciaDocumento("2026-10-13", hoy).nivel, "vencido"); // vence hoy
  assert.equal(vigenciaDocumento("2026-10-10", hoy).texto, "Vencido hace 3 días");
  assert.equal(vigenciaDocumento(null, hoy).nivel, "sin_fecha");
});

test("el ítem de documentos del catálogo se reconoce; las luces internas llevan su detalle", () => {
  assert.equal(esItemDocumentos("Documentos (SOAT - Tecnicomecánica)"), true);
  assert.equal(esItemDocumentos("Luces Internas"), false);
  assert.match(detalleItem("Luces Internas") ?? "", /cabina/);
  assert.equal(detalleItem("Luces estacionarias"), null);
});

test("esItemDocumentos reconoce los dos ítems reales del catálogo", () => {
  assert.equal(esItemDocumentos("Documento SOAT vigente"), true);
  assert.equal(esItemDocumentos("Documento técnico-mecánica vigente"), true);
  assert.equal(esItemDocumentos("Sticker Visible"), false);
});
