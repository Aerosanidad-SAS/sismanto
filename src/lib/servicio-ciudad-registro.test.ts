import assert from "node:assert/strict";
import { test } from "node:test";

import { ciudadRegistroAlCrear, ciudadRegistroDeServicioNuevo, ERROR_CIUDAD_REGISTRO } from "./servicio-ciudad-registro";
import { ciudadRegistroCanonica } from "./servicios-lista";

// #387: un servicio creado por ADMIN (sin centro asignado) quedaba con la ciudad de registro vacía («—» en la lista) y los
// filtros por ciudad lo perdían.

test("ADMIN sin ciudad elegida: se toma la del centro del móvil asignado", () => {
  assert.equal(ciudadRegistroCanonica(ciudadRegistroDeServicioNuevo({ ciudad: "", centroDelMovil: "CRA_MEDELLIN" })), "MEDELLÍN");
  assert.equal(ciudadRegistroCanonica(ciudadRegistroDeServicioNuevo({ ciudad: undefined, centroDelMovil: "CRA_BOGOTA" })), "BOGOTA D.C.");
});

test("la ciudad elegida a mano manda sobre la del móvil", () => {
  assert.equal(ciudadRegistroDeServicioNuevo({ ciudad: "BOGOTA D.C.", centroDelMovil: "CRA_MEDELLIN" }), "BOGOTA D.C.");
  assert.equal(ciudadRegistroDeServicioNuevo({ ciudad: "  MEDELLÍN ", centroDelMovil: null }), "MEDELLÍN");
});

test("sin móvil (o con un móvil sin centro de las dos CRA) y sin ciudad elegida no hay ciudad: se debe exigir", () => {
  assert.equal(ciudadRegistroDeServicioNuevo({ ciudad: "", centroDelMovil: null }), null);
  assert.equal(ciudadRegistroDeServicioNuevo({ ciudad: "  ", centroDelMovil: undefined }), null);
  assert.equal(ciudadRegistroDeServicioNuevo({ ciudad: "", centroDelMovil: "OTRO_CENTRO" }), null);
  assert.match(ERROR_CIUDAD_REGISTRO, /ciudad de registro/i);
});

// La acción `crearServicioMedico` aplica lo mismo en el servidor.
test("servidor: con ciudad elegida no se consulta el móvil", async () => {
  const centroDelMovil = async () => assert.fail("no debía consultar el móvil");
  assert.equal(await ciudadRegistroAlCrear({ ciudad: "MEDELLÍN", vehicleId: "v1", centroDelMovil }), "MEDELLÍN");
  assert.equal(await ciudadRegistroAlCrear({ ciudad: "", vehicleId: null, centroDelMovil }), null);
});

test("servidor: sin ciudad se toma la del móvil; si el móvil no tiene centro, no hay ciudad", async () => {
  const pedidos: string[] = [];
  const centroDe = (centro: string | null) => async (id: string) => {
    pedidos.push(id);
    return centro;
  };
  assert.equal(await ciudadRegistroAlCrear({ ciudad: undefined, vehicleId: "v1", centroDelMovil: centroDe("CRA_BOGOTA") }), "BOGOTA D.C.");
  assert.equal(await ciudadRegistroAlCrear({ ciudad: "", vehicleId: "v2", centroDelMovil: centroDe(null) }), null);
  assert.deepEqual(pedidos, ["v1", "v2"]);
});
