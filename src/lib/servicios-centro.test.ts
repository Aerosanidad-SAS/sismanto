import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ciudadDeCentro, condicionServiciosDeCentro } from "./servicios-centro";

describe("ciudadDeCentro", () => {
  it("relaciona cada CRA con su ciudad", () => {
    assert.deepEqual(ciudadDeCentro("CRA_MEDELLIN"), { clave: "medellin", prefijo: "medell" });
    assert.deepEqual(ciudadDeCentro("CRA_BOGOTA"), { clave: "bogota", prefijo: "bogot" });
    assert.equal(ciudadDeCentro("CTG"), null);
    assert.equal(ciudadDeCentro(null), null);
  });
});

describe("condicionServiciosDeCentro", () => {
  it("de los servicios sin centro, solo los que son de su ciudad de registro (los sin ciudad no se ven)", () => {
    assert.equal(
      condicionServiciosDeCentro({ id: 7, codigo: "CRA_MEDELLIN" }),
      "operational_center_id.eq.7,and(operational_center_id.is.null,ciudad_registro.ilike.medell*)"
    );
    assert.doesNotMatch(condicionServiciosDeCentro({ id: 7, codigo: "CRA_BOGOTA" }), /ciudad_registro\.is\.null/);
  });

  it("un centro sin ciudad conserva la regla anterior", () => {
    assert.equal(condicionServiciosDeCentro({ id: 9, codigo: "CTG" }), "operational_center_id.eq.9,operational_center_id.is.null");
  });
});
