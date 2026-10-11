import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ciudadDeCentro, condicionServiciosDeCentro, esDeOtraCiudad } from "./servicios-centro";

describe("ciudadDeCentro", () => {
  it("relaciona cada CRA con su ciudad", () => {
    assert.deepEqual(ciudadDeCentro("CRA_MEDELLIN"), { clave: "medellin", prefijo: "medell" });
    assert.deepEqual(ciudadDeCentro("CRA_BOGOTA"), { clave: "bogota", prefijo: "bogot" });
    assert.equal(ciudadDeCentro("CTG"), null);
    assert.equal(ciudadDeCentro(null), null);
  });
});

describe("condicionServiciosDeCentro", () => {
  it("de los servicios sin centro, solo los de su ciudad o sin ciudad", () => {
    assert.equal(
      condicionServiciosDeCentro({ id: 7, codigo: "CRA_MEDELLIN" }),
      "operational_center_id.eq.7,and(operational_center_id.is.null,or(ciudad_registro.is.null,ciudad_registro.ilike.medell*))"
    );
  });

  it("un centro sin ciudad conserva la regla anterior", () => {
    assert.equal(condicionServiciosDeCentro({ id: 9, codigo: "CTG" }), "operational_center_id.eq.9,operational_center_id.is.null");
  });
});

describe("esDeOtraCiudad", () => {
  it("detecta un servicio de Bogotá para Medellín, con o sin tildes y mayúsculas", () => {
    assert.equal(esDeOtraCiudad("BOGOTA D.C.", "CRA_MEDELLIN"), true);
    assert.equal(esDeOtraCiudad("MEDELLÍN", "CRA_MEDELLIN"), false);
    assert.equal(esDeOtraCiudad("medellin", "CRA_MEDELLIN"), false);
    assert.equal(esDeOtraCiudad("MEDELLÍN", "CRA_BOGOTA"), true);
  });

  it("sin ciudad de registro o con un centro de otra ciudad no se descarta nada", () => {
    assert.equal(esDeOtraCiudad(null, "CRA_MEDELLIN"), false);
    assert.equal(esDeOtraCiudad("BOGOTA D.C.", "CTG"), false);
  });
});
