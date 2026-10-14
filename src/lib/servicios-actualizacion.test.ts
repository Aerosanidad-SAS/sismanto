import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAMPOS_CLINICOS_MEDICO_AUX, camposVaciables, filaDeActualizacion } from "./servicios-actualizacion";

describe("camposVaciables", () => {
  it("incluye los opcionales del formulario y excluye nombre y tipo de servicio", () => {
    const campos = camposVaciables();
    for (const k of ["autorizacion", "asesor", "observaciones", "ovem_user_id", "medico_user_id", "fecha_hora_inicio_desplazamiento"]) {
      assert.ok(campos.includes(k), k);
    }
    assert.ok(!campos.includes("nombre_completo"));
    assert.ok(!campos.includes("tipo_servicio"));
  });
});

describe("filaDeActualizacion", () => {
  it("pone en null los campos vaciables que no vienen (borrar un campo ahora se guarda)", () => {
    const fila = filaDeActualizacion({ nombre_completo: "Ana", tipo_servicio: "TAM SIMPLE", autorizacion: undefined }, false);
    assert.equal(fila.autorizacion, null);
    assert.equal(fila.asesor, null);
    assert.equal(fila.ovem_user_id, null);
    assert.equal(fila.nombre_completo, "Ana");
  });

  it("conserva los valores que sí vienen", () => {
    const fila = filaDeActualizacion({ nombre_completo: "Ana", tipo_servicio: "TAM SIMPLE", asesor: "Luis" }, false);
    assert.equal(fila.asesor, "Luis");
  });

  it("Médico y Auxiliar solo escriben campos clínicos y no tocan la logística", () => {
    const fila = filaDeActualizacion(
      { nombre_completo: "Ana", tipo_servicio: "TAM SIMPLE", vehicle_id: "x", asesor: "Luis", observaciones: "ok", valor_servicio: 5 },
      true
    );
    assert.deepEqual(Object.keys(fila).sort(), [...CAMPOS_CLINICOS_MEDICO_AUX].sort());
    assert.equal(fila.observaciones, "ok");
    assert.equal(fila.cie_codigo, null);
    assert.ok(!("vehicle_id" in fila) && !("asesor" in fila) && !("valor_servicio" in fila));
  });
});
