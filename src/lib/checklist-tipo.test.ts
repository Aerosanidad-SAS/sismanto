import assert from "node:assert/strict";
import { test } from "node:test";

import { aplicaAlTipo } from "./checklist-tipo";

const SOLO_AMBULANCIA = ["AMBULANCIA_TAB", "AMBULANCIA_TAM"];

test("ítem sin tipos aplica a todos", () => {
  for (const t of ["AMBULANCIA_TAB", "AMBULANCIA_TAM", "DOMI", "VAN", "ADMIN", null]) {
    assert.equal(aplicaAlTipo(null, t), true);
    assert.equal(aplicaAlTipo([], t), true);
  }
});

test("ítem exclusivo de ambulancia: aplica a TAB y TAM, no a DOMI, VAN ni ADMIN", () => {
  assert.equal(aplicaAlTipo(SOLO_AMBULANCIA, "AMBULANCIA_TAB"), true);
  assert.equal(aplicaAlTipo(SOLO_AMBULANCIA, "AMBULANCIA_TAM"), true);
  for (const t of ["DOMI", "VAN", "ADMIN"]) assert.equal(aplicaAlTipo(SOLO_AMBULANCIA, t), false);
});

test("vehículo sin tipo responde la lista completa", () => {
  assert.equal(aplicaAlTipo(SOLO_AMBULANCIA, null), true);
  assert.equal(aplicaAlTipo(SOLO_AMBULANCIA, undefined), true);
});
