import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { firmaProtrack, leerPosicion } from "./protrack";
import { enmascarar } from "../integraciones";

describe("firmaProtrack", () => {
  it("es md5(md5(llave) + tiempo), igual que token.php de SISRES", () => {
    const md5 = (s: string) => createHash("md5").update(s).digest("hex");
    assert.equal(firmaProtrack("llave-de-prueba", 1759248000), md5(md5("llave-de-prueba") + "1759248000"));
  });
});

describe("leerPosicion", () => {
  it("toma latitud, longitud, velocidad y hora del GPS", () => {
    assert.deepEqual(leerPosicion({ latitude: "4.6711", longitude: "-74.0542", speed: 38, gpstime: 1759248000 }), {
      latitud: 4.6711,
      longitud: -74.0542,
      velocidadKmh: 38,
      reportadaEn: "2025-09-30T16:00:00.000Z",
    });
  });

  it("descarta registros sin coordenadas, en 0,0 o fuera de rango", () => {
    assert.equal(leerPosicion(undefined), null);
    assert.equal(leerPosicion({ latitude: 0, longitude: 0 }), null);
    assert.equal(leerPosicion({ latitude: 95, longitude: 10 }), null);
    assert.equal(leerPosicion({ latitude: "x", longitude: 10 }), null);
  });
});

describe("enmascarar", () => {
  it("solo deja ver los últimos 4 caracteres", () => {
    assert.equal(enmascarar("abcdef123456"), "••••3456");
    assert.equal(enmascarar(""), "");
    assert.equal(enmascarar(null), "");
  });
});
