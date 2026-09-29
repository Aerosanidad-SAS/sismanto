import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validarPreoperacional } from "./preoperacional";

const catalogo = [
  { id: 1, descripcion: "Luces principales" },
  { id: 2, descripcion: "Sirena" },
  { id: 3, descripcion: "Radio Base" },
];

describe("validarPreoperacional", () => {
  it("acepta un registro con todos los ítems", () => {
    assert.equal(
      validarPreoperacional(catalogo, [
        { checklistItemId: 1, estado: "OK" },
        { checklistItemId: 2, estado: "FALLA", observacion: "No suena" },
        { checklistItemId: 3, estado: "NO_APLICA" },
      ]),
      null
    );
  });

  it("rechaza el registro parcial (bug: 1 de 96 ítems quedaba como OK)", () => {
    const error = validarPreoperacional(catalogo, [{ checklistItemId: 1, estado: "OK" }]);
    assert.match(error ?? "", /Faltan 2 ítem/);
  });

  it("rechaza un registro vacío", () => {
    assert.match(validarPreoperacional(catalogo, []) ?? "", /Faltan 3 ítem/);
  });

  it("exige describir la falla", () => {
    const error = validarPreoperacional(catalogo, [
      { checklistItemId: 1, estado: "OK" },
      { checklistItemId: 2, estado: "FALLA", observacion: "   " },
      { checklistItemId: 3, estado: "OK" },
    ]);
    assert.match(error ?? "", /Sirena/);
  });

  it("rechaza ítems que no están en el catálogo activo", () => {
    const error = validarPreoperacional(catalogo, [
      { checklistItemId: 1, estado: "OK" },
      { checklistItemId: 2, estado: "OK" },
      { checklistItemId: 3, estado: "OK" },
      { checklistItemId: 99, estado: "OK" },
    ]);
    assert.match(error ?? "", /catálogo activo/);
  });

  it("rechaza ítems repetidos (uno OK y otro FALLA del mismo ítem)", () => {
    const error = validarPreoperacional(catalogo, [
      { checklistItemId: 1, estado: "OK" },
      { checklistItemId: 1, estado: "FALLA", observacion: "x" },
      { checklistItemId: 2, estado: "OK" },
      { checklistItemId: 3, estado: "OK" },
    ]);
    assert.match(error ?? "", /repetido/);
  });
});
