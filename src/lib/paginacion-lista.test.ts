import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paginarLista } from "./paginacion-lista";

const lista = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe("paginarLista", () => {
  it("una lista corta cabe en una sola página", () => {
    const p = paginarLista(lista(30), 1, 100);
    assert.equal(p.paginas, 1);
    assert.equal(p.filas.length, 30);
    assert.deepEqual([p.desde, p.hasta, p.total], [1, 30, 30]);
  });

  it("parte en páginas de 100 y la última trae el resto (1.332 prestadores → 14 páginas)", () => {
    const todas = lista(1332);
    const primera = paginarLista(todas, 1);
    assert.equal(primera.paginas, 14);
    assert.equal(primera.filas.length, 100);
    const ultima = paginarLista(todas, 14);
    assert.equal(ultima.filas.length, 32);
    assert.deepEqual([ultima.desde, ultima.hasta], [1301, 1332]);
    assert.equal(ultima.filas[0], 1301);
  });

  it("alcanza todas las filas, sin repetir ni saltar ninguna", () => {
    const todas = lista(250);
    const vistas = [1, 2, 3].flatMap((n) => paginarLista(todas, n, 100).filas);
    assert.deepEqual(vistas, todas);
  });

  it("acota la página pedida al rango válido (p. ej. tras filtrar queda menos lista)", () => {
    assert.equal(paginarLista(lista(50), 9, 100).pagina, 1);
    assert.equal(paginarLista(lista(250), 99, 100).pagina, 3);
    assert.equal(paginarLista(lista(250), 0, 100).pagina, 1);
    assert.equal(paginarLista(lista(250), -4, 100).pagina, 1);
    assert.equal(paginarLista(lista(250), Number.NaN, 100).pagina, 1);
  });

  it("una lista vacía tiene una página y 0 filas", () => {
    const p = paginarLista([], 1);
    assert.deepEqual([p.paginas, p.filas.length, p.desde, p.hasta, p.total], [1, 0, 0, 0, 0]);
  });

  it("el tamaño de página sin sentido se toma como 1", () => {
    assert.equal(paginarLista(lista(3), 1, 0).paginas, 3);
  });
});
