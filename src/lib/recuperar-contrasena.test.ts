import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { codigoCoincide, esCorreoInterno, estadoCodigo, generarCodigo, hashCodigo, normalizarCedula } from "./recuperar-contrasena";

describe("generarCodigo", () => {
  it("siempre 6 dígitos", () => {
    for (let i = 0; i < 200; i++) assert.match(generarCodigo(), /^\d{6}$/);
  });
});

describe("hash del código", () => {
  const u1 = "11111111-1111-1111-1111-111111111111";
  const u2 = "22222222-2222-2222-2222-222222222222";

  it("coincide solo con el mismo usuario y el mismo código", () => {
    const h = hashCodigo(u1, "012345");
    assert.equal(codigoCoincide(u1, "012345", h), true);
    assert.equal(codigoCoincide(u1, "012346", h), false);
    assert.equal(codigoCoincide(u2, "012345", h), false);
    assert.notEqual(h, "012345");
  });
});

describe("estadoCodigo", () => {
  const ahora = Date.parse("2026-09-30T12:00:00Z");
  const base = { expira_en: "2026-09-30T12:10:00Z", usado: false, intentos: 0 };

  it("válido, vencido, usado o bloqueado por intentos", () => {
    assert.equal(estadoCodigo(base, ahora), "valido");
    assert.equal(estadoCodigo({ ...base, expira_en: "2026-09-30T11:59:59Z" }, ahora), "vencido");
    assert.equal(estadoCodigo({ ...base, usado: true }, ahora), "usado");
    assert.equal(estadoCodigo({ ...base, intentos: 5 }, ahora), "bloqueado");
  });
});

describe("normalizarCedula", () => {
  it("acepta puntos y espacios, rechaza lo que no es cédula", () => {
    assert.equal(normalizarCedula("1.020.458 300"), "1020458300");
    assert.equal(normalizarCedula("abc"), null);
    assert.equal(normalizarCedula("123"), null);
  });
});

describe("esCorreoInterno", () => {
  it("reconoce el correo inventado por la carga masiva y no a un correo real", () => {
    assert.equal(esCorreoInterno("usuario.1020458300@sismanto.invalid"), true);
    assert.equal(esCorreoInterno(" Prueba@SISMANTO.test "), true);
    assert.equal(esCorreoInterno("conductor@aerosanidad.com"), false);
  });
});
