import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { puedeDesactivarCliente, puedeEscribirClientes } from "./clientes-reglas";

describe("clientes: quién escribe", () => {
  it("ADMIN, ANALISTA y REGULACION crean y editan; nadie más", () => {
    for (const rol of ["ADMIN", "ANALISTA", "REGULACION"]) assert.equal(puedeEscribirClientes(rol), true, rol);
    for (const rol of ["MEDICO", "AUXILIAR_ENFERMERIA", "VISTA", "COORDINACION", "GERENCIAL", "OVEM", "MANTENIMIENTO", "TECNICO", "AEROPUERTO"]) {
      assert.equal(puedeEscribirClientes(rol), false, rol);
    }
    assert.equal(puedeEscribirClientes(null), false);
    assert.equal(puedeEscribirClientes(undefined), false);
  });

  it("solo ADMIN desactiva; REGULACION no (como en SISRES)", () => {
    assert.equal(puedeDesactivarCliente("ADMIN"), true);
    assert.equal(puedeDesactivarCliente("REGULACION"), false);
    assert.equal(puedeDesactivarCliente("ANALISTA"), false);
    assert.equal(puedeDesactivarCliente(null), false);
  });
});
