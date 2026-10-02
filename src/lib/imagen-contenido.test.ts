import assert from "node:assert/strict";
import { test } from "node:test";

import { tipoImagenPorContenido } from "./imagen-contenido";

test("reconoce JPG, PNG y WEBP por sus primeros bytes", () => {
  assert.deepEqual(tipoImagenPorContenido(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), { ext: "jpg", mime: "image/jpeg" });
  assert.deepEqual(
    tipoImagenPorContenido(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])),
    { ext: "png", mime: "image/png" }
  );
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
  assert.deepEqual(tipoImagenPorContenido(webp), { ext: "webp", mime: "image/webp" });
});

test("rechaza lo que no sea una de esas tres firmas, aunque mida lo mismo", () => {
  // Un SVG o un HTML no tienen ninguna de las firmas, sin importar qué diga el nombre o el content-type declarado.
  assert.equal(tipoImagenPorContenido(new Uint8Array([0x3c, 0x73, 0x76, 0x67])), null); // "<svg"
  assert.equal(tipoImagenPorContenido(new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c])), null); // "<html"
  // RIFF sin "WEBP" en el offset 8 (otro contenedor RIFF, p.ej. WAV) no cuenta como imagen.
  const riffNoWebp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]);
  assert.equal(tipoImagenPorContenido(riffNoWebp), null);
});

test("no revienta con cabeceras más cortas que la firma", () => {
  assert.equal(tipoImagenPorContenido(new Uint8Array([])), null);
  assert.equal(tipoImagenPorContenido(new Uint8Array([0xff, 0xd8])), null);
  assert.equal(tipoImagenPorContenido(new Uint8Array([0x52, 0x49, 0x46, 0x46])), null);
});
