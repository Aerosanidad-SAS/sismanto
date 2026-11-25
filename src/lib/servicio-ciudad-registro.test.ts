import assert from "node:assert/strict";
import { test } from "node:test";

import { ciudadRegistroDeServicioNuevo, ERROR_CIUDAD_REGISTRO } from "./servicio-ciudad-registro";
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
