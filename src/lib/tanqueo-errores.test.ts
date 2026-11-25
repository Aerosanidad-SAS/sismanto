import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { erroresTanqueo } from "./tanqueo-errores";

const HOY = "2026-11-25";
const BUENO = { fecha: HOY, km: "125.430", galones: "12,5", costo: "" };

describe("erroresTanqueo", () => {
  it("el tanqueo vacío dice qué falta, en español y por campo", () => {
    const e = erroresTanqueo({ fecha: HOY, km: "", galones: "", costo: "" }, HOY);
    assert.equal(e.km, "Ingresa el kilometraje del tablero.");
    assert.equal(e.galones, "Ingresa los galones.");
    assert.equal(e.fecha, undefined);
    assert.equal(e.costo, undefined);
  });

  it("sin fecha pide la fecha y una fecha futura se rechaza", () => {
    assert.equal(erroresTanqueo({ ...BUENO, fecha: "" }, HOY).fecha, "Selecciona la fecha del tanqueo.");
    assert.equal(erroresTanqueo({ ...BUENO, fecha: "2026-11-26" }, HOY).fecha, "La fecha del tanqueo no puede ser futura.");
  });

  it("un tanqueo correcto no tiene errores (km con punto de miles, galones con coma)", () => {
    assert.deepEqual(erroresTanqueo(BUENO, HOY), {});
    assert.deepEqual(erroresTanqueo({ ...BUENO, costo: "150000" }, HOY), {});
  });

  it("texto que no es número, cero o muy alto, con el mismo criterio del servidor", () => {
    assert.equal(erroresTanqueo({ ...BUENO, km: "abc" }, HOY).km, "El kilometraje debe ser un número, por ejemplo 125000.");
    assert.equal(erroresTanqueo({ ...BUENO, km: "0" }, HOY).km, "El kilometraje debe ser mayor a cero.");
    assert.equal(erroresTanqueo({ ...BUENO, km: "3.000.000" }, HOY).km, "El kilometraje es demasiado alto: revisa el número del tablero.");
    assert.equal(erroresTanqueo({ ...BUENO, galones: "doce" }, HOY).galones, "Los galones deben ser un número, por ejemplo 12,5.");
    assert.equal(erroresTanqueo({ ...BUENO, galones: "0" }, HOY).galones, "Los galones deben ser mayores a cero.");
    assert.equal(erroresTanqueo({ ...BUENO, galones: "101" }, HOY).galones, "Revisa los galones: más de 100 no cabe en un tanque.");
  });

  it("el valor pagado es opcional, pero si se escribe debe ser un número no negativo", () => {
    assert.equal(erroresTanqueo({ ...BUENO, costo: "mucho" }, HOY).costo, "El valor pagado debe ser un número, o déjalo vacío.");
    assert.equal(erroresTanqueo({ ...BUENO, costo: "-5" }, HOY).costo, "El valor pagado no puede ser negativo.");
    assert.equal(erroresTanqueo({ ...BUENO, costo: "0" }, HOY).costo, undefined);
  });
});
