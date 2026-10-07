import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_INTENTOS_CODIGO, codigoCoincide, estadoCodigo, generarCodigo, hashCodigo, normalizarCedula, reclamoDeIntento } from "./recuperar-contrasena";

describe("generarCodigo", () => {
  it("siempre 6 dígitos", () => {
    for (let i = 0; i < 200; i++) assert.match(generarCodigo(), /^\d{6}$/);
  });
});

describe("hash del código", () => {
  const u1 = "11111111-1111-1111-1111-111111111111";
  const u2 = "22222222-2222-2222-2222-222222222222";

  it("coincide solo con el mismo usuario y el mismo código", () => {
    const h = hashCodigo(u1, "012345");
    assert.equal(codigoCoincide(u1, "012345", h), true);
    assert.equal(codigoCoincide(u1, "012346", h), false);
    assert.equal(codigoCoincide(u2, "012345", h), false);
    assert.notEqual(h, "012345");
  });
});

describe("estadoCodigo", () => {
  const ahora = Date.parse("2026-09-30T12:00:00Z");
  const base = { expira_en: "2026-09-30T12:10:00Z", usado: false, intentos: 0 };

  it("válido, vencido, usado o bloqueado por intentos", () => {
    assert.equal(estadoCodigo(base, ahora), "valido");
    assert.equal(estadoCodigo({ ...base, expira_en: "2026-09-30T11:59:59Z" }, ahora), "vencido");
    assert.equal(estadoCodigo({ ...base, usado: true }, ahora), "usado");
    assert.equal(estadoCodigo({ ...base, intentos: 5 }, ahora), "bloqueado");
  });
});

describe("normalizarCedula", () => {
  it("acepta puntos y espacios, rechaza lo que no es cédula", () => {
    assert.equal(normalizarCedula("1.020.458 300"), "1020458300");
    assert.equal(normalizarCedula("abc"), null);
    assert.equal(normalizarCedula("123"), null);
  });
});

describe("reclamoDeIntento (compare-and-swap del contador de intentos)", () => {
  // Fila de la base simulada: la actualización solo vale si el contador sigue siendo el esperado, igual que
  // `UPDATE ... SET intentos = nuevo WHERE id = ... AND intentos = esperado`.
  function baseSimulada() {
    const fila = { id: 7, intentos: 0 };
    return {
      leer: () => ({ ...fila }),
      reclamar: (r: { id: number; esperado: number; nuevo: number }) => {
        if (r.id !== fila.id || fila.intentos !== r.esperado) return false;
        fila.intentos = r.nuevo;
        return true;
      },
      actual: () => fila.intentos,
    };
  }

  it("de 100 peticiones simultáneas que leyeron el mismo contador solo una reclama el intento", () => {
    const db = baseSimulada();
    const lecturas = Array.from({ length: 100 }, () => db.leer());
    const ganadoras = lecturas.filter((l) => db.reclamar(reclamoDeIntento(l)));
    assert.equal(ganadoras.length, 1);
    assert.equal(db.actual(), 1);
  });

  it("el tope de intentos vale aunque el atacante dispare muchas rondas en paralelo", () => {
    const db = baseSimulada();
    let comparaciones = 0;
    for (let ronda = 0; ronda < 50; ronda++) {
      const lecturas = Array.from({ length: 100 }, () => db.leer());
      for (const l of lecturas) {
        if (estadoCodigo({ expira_en: "2999-01-01T00:00:00Z", usado: false, intentos: l.intentos }) !== "valido") continue;
        if (db.reclamar(reclamoDeIntento(l))) comparaciones++;
      }
    }
    assert.equal(comparaciones, MAX_INTENTOS_CODIGO);
    assert.equal(estadoCodigo({ expira_en: "2999-01-01T00:00:00Z", usado: false, intentos: db.actual() }), "bloqueado");
  });
});
