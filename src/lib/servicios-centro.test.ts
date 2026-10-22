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

  it("de los sin centro, deja fuera los atendidos por un móvil de la otra CRA (aunque su ciudad de registro diga otra)", () => {
    assert.equal(
      condicionServiciosDeCentro({ id: 7, codigo: "CRA_MEDELLIN" }, ["TRG540", "LTN715"]),
      "operational_center_id.eq.7,and(operational_center_id.is.null,ciudad_registro.ilike.medell*,or(movil_placa.is.null,movil_placa.not.in.(TRG540,LTN715)))"
    );
  });

  it("descarta placas con caracteres de sintaxis del filtro", () => {
    const condicion = condicionServiciosDeCentro({ id: 7, codigo: "CRA_BOGOTA" }, ["ABC123", "X),operational_center_id.is.null,(Y"]);
    assert.match(condicion, /not\.in\.\(ABC123\)/);
    assert.doesNotMatch(condicion, /X\)/);
  });

  it("un centro sin ciudad conserva la regla anterior", () => {
    assert.equal(condicionServiciosDeCentro({ id: 9, codigo: "CTG" }), "operational_center_id.eq.9,operational_center_id.is.null");
  });
});
