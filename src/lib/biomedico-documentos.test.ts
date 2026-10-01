import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extensionPorContenido, formatoTamano, rutaDocumento, validarRutaDocumento } from "./biomedico-documentos";

const bytes = (...b: number[]) => new Uint8Array(b);

describe("extensionPorContenido", () => {
  it("reconoce PDF, JPG y PNG por su firma", () => {
    assert.equal(extensionPorContenido(new TextEncoder().encode("%PDF-1.7\n")), "pdf");
    assert.equal(extensionPorContenido(bytes(0xff, 0xd8, 0xff, 0xe0)), "jpg");
    assert.equal(extensionPorContenido(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)), "png");
  });

  it("rechaza otros contenidos aunque se llamen .pdf", () => {
    assert.equal(extensionPorContenido(new TextEncoder().encode("<html>")), null);
    assert.equal(extensionPorContenido(bytes(0x50, 0x4b, 0x03, 0x04)), null); // zip / docx
    assert.equal(extensionPorContenido(bytes()), null);
  });
});

describe("validarRutaDocumento", () => {
  const uuid = "0f8fad5b-d9cb-469f-a165-70867728950e";

  it("acepta la ruta del mismo equipo y devuelve la extensión", () => {
    assert.equal(validarRutaDocumento(rutaDocumento(12, uuid, "pdf"), 12), "pdf");
  });

  it("rechaza otra carpeta, otro equipo, recorridos y extensiones no permitidas", () => {
    assert.equal(validarRutaDocumento(rutaDocumento(12, uuid, "pdf"), 13), null);
    assert.equal(validarRutaDocumento(`equipo-12/../equipo-13/${uuid}.pdf`, 12), null);
    assert.equal(validarRutaDocumento(`equipo-12/${uuid}.exe`, 12), null);
    assert.equal(validarRutaDocumento(`otra/${uuid}.pdf`, 12), null);
  });
});

describe("formatoTamano", () => {
  it("muestra KB o MB", () => {
    assert.equal(formatoTamano(512), "1 KB");
    assert.equal(formatoTamano(250_000), "244 KB");
    assert.equal(formatoTamano(3 * 1024 * 1024), "3.0 MB");
    assert.equal(formatoTamano(null), "");
  });
});
