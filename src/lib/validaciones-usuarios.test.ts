import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createUserAsAdminSchema, updateUserAsAdminSchema } from "./validations";

const ROLES = ["OVEM", "ADMIN", "REGULACION", "GERENCIAL", "MANTENIMIENTO", "COORDINACION", "ANALISTA", "MEDICO", "AUXILIAR_ENFERMERIA", "VISTA", "TECNICO", "AEROPUERTO"];
const USER_ID = "7b9d3c8e-1f2a-4b5c-8d6e-9f0a1b2c3d4e";

describe("rol de usuario al crear y editar (admin)", () => {
  for (const roleCodigo of ROLES) {
    it(`acepta ${roleCodigo}`, () => {
      const edit = updateUserAsAdminSchema.safeParse({ userId: USER_ID, nombreCompleto: "Prueba", operationalCenterId: null, roleCodigo });
      const create = createUserAsAdminSchema.safeParse({ email: "a@b.co", password: "12345678", nombreCompleto: "Prueba", roleCodigo });
      assert.equal(edit.success, true);
      assert.equal(create.success, true);
    });
  }

  it("rechaza un rol inexistente", () => {
    const r = updateUserAsAdminSchema.safeParse({ userId: USER_ID, nombreCompleto: "Prueba", operationalCenterId: null, roleCodigo: "INVENTADO" });
    assert.equal(r.success, false);
  });
});
