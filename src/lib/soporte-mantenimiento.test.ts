import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esRutaSoporteDe, estadoSoporte, rutaSoporte, SOPORTE_TAMANO_MAXIMO, tipoSoportePorContenido } from "./soporte-mantenimiento";

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(12).fill(0)]);

describe("tipoSoportePorContenido", () => {
  it("reconoce PDF, JPG, PNG y WEBP por su firma", () => {
    assert.equal(tipoSoportePorContenido(bytes(0x25, 0x50, 0x44, 0x46, 0x2d))?.ext, "pdf");
    assert.equal(tipoSoportePorContenido(bytes(0xff, 0xd8, 0xff))?.ext, "jpg");
    assert.equal(tipoSoportePorContenido(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.ext, "png");
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
    assert.equal(tipoSoportePorContenido(webp)?.ext, "webp");
  });

  it("rechaza lo que no es de esos formatos, aunque se llame .pdf", () => {
    assert.equal(tipoSoportePorContenido(new TextEncoder().encode("MZ... un ejecutable .pdf")), null);
    assert.equal(tipoSoportePorContenido(new Uint8Array([])), null);
  });
});

describe("rutas del soporte", () => {
  const uid = "11111111-2222-3333-4444-555555555555";
  const ruta = rutaSoporte(uid, "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", { ext: "pdf", mime: "application/pdf" });

  it("la ruta lleva la carpeta del usuario y el nombre generado", () => {
    assert.equal(ruta, `${uid}/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf`);
    assert.ok(esRutaSoporteDe(uid, ruta));
  });

  it("no acepta la ruta de otro usuario, ni rutas manipuladas", () => {
    assert.ok(!esRutaSoporteDe("99999999-2222-3333-4444-555555555555", ruta));
    assert.ok(!esRutaSoporteDe(uid, `${uid}/../otro/archivo.pdf`));
    assert.ok(!esRutaSoporteDe(uid, `${uid}/mi factura.pdf`));
    assert.ok(!esRutaSoporteDe(uid, ""));
  });

  it("el límite es de 8 MB", () => assert.equal(SOPORTE_TAMANO_MAXIMO, 8_388_608));
});

describe("estadoSoporte", () => {
  it("con archivo: con soporte; correctivo nuevo sin archivo: sin soporte; histórico: no aplica", () => {
    assert.equal(estadoSoporte({ soporte_path: "x/y.pdf", requiere_soporte: true }), "con_soporte");
    assert.equal(estadoSoporte({ soporte_path: null, requiere_soporte: true }), "sin_soporte");
    assert.equal(estadoSoporte({ soporte_path: null, requiere_soporte: false }), "no_aplica");
    assert.equal(estadoSoporte({}), "no_aplica");
  });
});
