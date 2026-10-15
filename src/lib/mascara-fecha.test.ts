import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aplicarMascaraFecha } from "./mascara-fecha";

describe("aplicarMascaraFecha", () => {
  it("pone las barras mientras se teclean solo números", () => {
    assert.equal(aplicarMascaraFecha("0"), "0");
    assert.equal(aplicarMascaraFecha("09"), "09");
    assert.equal(aplicarMascaraFecha("090"), "09/0");
    assert.equal(aplicarMascaraFecha("0903"), "09/03");
    assert.equal(aplicarMascaraFecha("09031"), "09/03/1");
    assert.equal(aplicarMascaraFecha("09031988"), "09/03/1988");
  });

  it("ignora letras y lo que sobra de 8 dígitos", () => {
    assert.equal(aplicarMascaraFecha("09a03b1988"), "09/03/1988");
    assert.equal(aplicarMascaraFecha("0903198812345"), "09/03/1988");
    assert.equal(aplicarMascaraFecha(""), "");
  });

  it("respeta las barras escritas a mano", () => {
    assert.equal(aplicarMascaraFecha("9/3/1988"), "9/3/1988");
    assert.equal(aplicarMascaraFecha("09/03/"), "09/03/");
    assert.equal(aplicarMascaraFecha("09/03/1988999"), "09/03/1988");
  });
});
