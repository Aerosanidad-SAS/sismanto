import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aplicarPlantilla, plantillasDelCampo, type PlantillaTexto } from "./biomedico-plantillas";

describe("aplicarPlantilla", () => {
  it("pega el texto si el campo está vacío, sin importar el modo", () => {
    assert.equal(aplicarPlantilla("", "Prueba funcional.", "agregar"), "Prueba funcional.");
    assert.equal(aplicarPlantilla("   \n", "Prueba funcional.", "agregar"), "Prueba funcional.");
    assert.equal(aplicarPlantilla(null, "Prueba funcional.", "reemplazar"), "Prueba funcional.");
  });

  it("reemplaza o agrega al final con un salto de línea", () => {
    assert.equal(aplicarPlantilla("Texto previo", "Nuevo", "reemplazar"), "Nuevo");
    assert.equal(aplicarPlantilla("Texto previo  \n", "Nuevo", "agregar"), "Texto previo\nNuevo");
  });
});

describe("plantillasDelCampo", () => {
  it("filtra por campo y ordena por nombre", () => {
    const lista: PlantillaTexto[] = [
      { id: 1, campo: "observaciones", nombre: "Zeta", texto: "z" },
      { id: 2, campo: "descripcion_falla", nombre: "Alfa", texto: "a" },
      { id: 3, campo: "observaciones", nombre: "Ávila", texto: "b" },
    ];
    assert.deepEqual(plantillasDelCampo(lista, "observaciones").map((p) => p.id), [3, 1]);
  });
});
