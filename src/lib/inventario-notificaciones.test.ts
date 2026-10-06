import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { areaDeEquipo, destinatariosArea, leerCorreos } from "./inventario-notificaciones";
import { asuntoCorreoVencimientosBiomedico, type AlertaBiomedica } from "./notifications/biomedical-expiry-digest";

describe("areaDeEquipo", () => {
  it("SISTEMAS sin importar mayúsculas o espacios; todo lo demás es Biomédica", () => {
    assert.equal(areaDeEquipo(" sistemas "), "SISTEMAS");
    assert.equal(areaDeEquipo("BIOMEDICA"), "BIOMEDICA");
    assert.equal(areaDeEquipo(null), "BIOMEDICA");
  });
});

describe("leerCorreos", () => {
  it("acepta líneas, comas y punto y coma; pasa a minúsculas y no repite", () => {
    assert.deepEqual(leerCorreos("A@x.co\nb@x.co; a@X.co ,  \n"), { validos: ["a@x.co", "b@x.co"], invalidos: [] });
  });

  it("separa lo que no es correo", () => {
    assert.deepEqual(leerCorreos("ok@x.co\n3001234567\nsin arroba").invalidos, ["3001234567", "sin arroba"]);
  });
});

describe("destinatariosArea", () => {
  it("usa los configurados; sin ellos, Biomédica cae en los roles y Sistemas no avisa", () => {
    assert.deepEqual(destinatariosArea("SISTEMAS", ["ti@x.co"], ["r@x.co"]), ["ti@x.co"]);
    assert.deepEqual(destinatariosArea("BIOMEDICA", [], ["r@x.co"]), ["r@x.co"]);
    assert.deepEqual(destinatariosArea("SISTEMAS", undefined, ["r@x.co"]), []);
  });
});

describe("asuntoCorreoVencimientosBiomedico", () => {
  const alerta = (dias: number) => ({ diasRestantes: dias }) as AlertaBiomedica;

  it("mantiene el asunto biomédico y cambia a «de Sistemas» para esa área", () => {
    assert.equal(asuntoCorreoVencimientosBiomedico([alerta(10), alerta(5)]), "Aeromanto: 2 vencimientos biomédicos próximos");
    assert.equal(asuntoCorreoVencimientosBiomedico([alerta(-1)], true), "⚠️ Aeromanto: 1 vencimiento de Sistemas urgente");
  });
});
