import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalogoSinSeveridad, itemsEvaluados, validarPreoperacional } from "./preoperacional";
import { hallazgosPreoperacional } from "./preoperacional-alertas";

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

describe("itemsEvaluados", () => {
  const cat = [
    { id: 1, descripcion: "Freno de pedal", severidad_falla: "CRITICA" as const },
    { id: 2, descripcion: "Luces internas", severidad_falla: "MEDIA" as const },
  ];

  it("lleva la severidad del catálogo: una falla en un ítem crítico saca el vehículo de servicio", () => {
    const items = itemsEvaluados(cat, [
      { checklistItemId: 1, estado: "FALLA", observacion: "Pedal blando" },
      { checklistItemId: 2, estado: "OK" },
    ]);
    const hallazgos = hallazgosPreoperacional(items, { vencimiento_soat: "2099-01-01", vencimiento_tecnicomecanica: "2099-01-01" }, "2026-10-12");
    assert.equal(hallazgos.length, 1);
    assert.equal(hallazgos[0].severidad, "CRITICA");
    assert.equal(hallazgos[0].fds, true);
  });

  it("sin severidad en el catálogo toda falla queda MEDIA (por eso se detecta con catalogoSinSeveridad)", () => {
    const sinColumna = [{ id: 1, descripcion: "Freno de pedal" }];
    assert.equal(catalogoSinSeveridad(sinColumna), true);
    const items = itemsEvaluados(sinColumna, [{ checklistItemId: 1, estado: "FALLA", observacion: "x" }]);
    assert.equal(hallazgosPreoperacional(items, { vencimiento_soat: "2099-01-01", vencimiento_tecnicomecanica: "2099-01-01" }, "2026-10-12")[0].fds, false);
  });

  it("catalogoSinSeveridad es falso con la columna presente y con catálogo vacío", () => {
    assert.equal(catalogoSinSeveridad(cat), false);
    assert.equal(catalogoSinSeveridad([]), false);
  });
});


describe("faltantes de equipo (inventario)", () => {
  const cat = [
    { id: 10, descripcion: "Chalecos reflectivos", categoria: "EQUIPO_CARRETERA", cantidad_esperada: "2", severidad_falla: "CRITICA" as const },
    { id: 11, descripcion: "Luces principales", categoria: "LUCES", cantidad_esperada: "2", severidad_falla: "CRITICA" as const },
  ];

  it("1 chaleco de 2 es un faltante leve: no es falla ni saca el vehículo de servicio, aunque el ítem sea CRÍTICO", () => {
    const evaluados = itemsEvaluados(cat, [{ checklistItemId: 10, estado: "FALLA", cantidadOk: 1 }]);
    assert.equal(evaluados[0].estado, "OK");
    assert.deepEqual(evaluados[0].faltante, { hay: 1, esperadas: 2 });
    const h = hallazgosPreoperacional(evaluados, {}, "2026-10-12").filter((x) => x.origen === "ITEM");
    assert.equal(h.length, 1);
    assert.equal(h[0].severidad, "BAJA");
    assert.equal(h[0].fds, false);
    assert.match(h[0].titulo, /Faltante: Chalecos/);
  });

  it("0 de 2 también es faltante; completo no genera nada", () => {
    assert.ok(itemsEvaluados(cat, [{ checklistItemId: 10, estado: "FALLA", cantidadOk: 0 }])[0].faltante);
    assert.equal(itemsEvaluados(cat, [{ checklistItemId: 10, estado: "OK", cantidadOk: 2 }])[0].faltante, undefined);
  });

  it("una luz que no funciona (conteo de funcionamiento) sigue siendo falla crítica", () => {
    const evaluados = itemsEvaluados(cat, [{ checklistItemId: 11, estado: "FALLA", cantidadOk: 1, observacion: "farola" }]);
    assert.equal(evaluados[0].estado, "FALLA");
    assert.equal(evaluados[0].faltante, undefined);
    assert.equal(hallazgosPreoperacional(evaluados, {}, "2026-10-12")[0].fds, true);
  });
});
