import assert from "node:assert/strict";
import { test } from "node:test";

import { aplicaDesdeTipos, tiposDesdeAplica } from "./checklist-tipo";

test("aplicaDesdeTipos: NULL o vacío aplica a las dos familias", () => {
  assert.deepEqual(aplicaDesdeTipos(null), { ambulancia: true, domiciliaria: true });
  assert.deepEqual(aplicaDesdeTipos([]), { ambulancia: true, domiciliaria: true });
});

test("aplicaDesdeTipos: solo ambulancia o solo domiciliaria", () => {
  assert.deepEqual(aplicaDesdeTipos(["AMBULANCIA_TAB", "AMBULANCIA_TAM"]), { ambulancia: true, domiciliaria: false });
  assert.deepEqual(aplicaDesdeTipos(["DOMI", "VAN"]), { ambulancia: false, domiciliaria: true });
});

test("tiposDesdeAplica es la inversa; ninguna familia no es válido", () => {
  assert.equal(tiposDesdeAplica({ ambulancia: true, domiciliaria: true }), null);
  assert.deepEqual(tiposDesdeAplica({ ambulancia: true, domiciliaria: false }), ["AMBULANCIA_TAB", "AMBULANCIA_TAM"]);
  assert.deepEqual(tiposDesdeAplica({ ambulancia: false, domiciliaria: true }), ["DOMI", "VAN", "ADMIN"]);
  assert.equal(tiposDesdeAplica({ ambulancia: false, domiciliaria: false }), undefined);
});
