import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { conciliar, extraerColumnaCsv } from "./etl-conciliacion";

describe("extraerColumnaCsv", () => {
  it("lee la columna pedida, sin importar mayúsculas del encabezado ni el BOM", () => {
    const csv = "﻿Id,nombre,etapa\n1,Ana,CURSO\n2,Luis,FINALIZADO\n";
    assert.deepEqual(extraerColumnaCsv(csv, "id"), ["1", "2"]);
    assert.deepEqual(extraerColumnaCsv("ID,x\n7,a\n", "id"), ["7"]);
  });

  it("respeta comillas, comas y saltos de línea dentro de un campo, y CRLF", () => {
    const csv = 'id,observaciones,etapa\r\n1,"dijo ""hola"", y\nluego se fue",CURSO\r\n2,"otra, con coma",FINALIZADO\r\n3,,CURSO\r\n';
    assert.deepEqual(extraerColumnaCsv(csv, "id"), ["1", "2", "3"]);
    assert.deepEqual(extraerColumnaCsv(csv, "etapa"), ["CURSO", "FINALIZADO", "CURSO"]);
  });

  it("no cuenta las filas en blanco ni exige salto de línea al final", () => {
    assert.deepEqual(extraerColumnaCsv("id,x\n1,a\n\n2,b", "id"), ["1", "2"]);
  });

  it("una fila con datos pero sin identificador cuenta (como inválida); una en blanco no; el id puede no ser la primera columna", () => {
    // La fila «,» (todo vacío) y la línea en blanco no cuentan; «Luis,» tiene datos pero no identificador.
    assert.deepEqual(extraerColumnaCsv("nombre,id\nAna,1\n\nLuis,\n,\nMar,3\n", "id"), ["1", "", "3"]);
  });

  it("si falta la columna, lo dice", () => {
    assert.throws(() => extraerColumnaCsv("a,b\n1,2\n", "id"), /no tiene la columna/);
    assert.throws(() => extraerColumnaCsv("", "id"), /no tiene la columna/);
  });
});

describe("conciliar", () => {
  it("separa lo que está en los dos lados, solo en la base y solo en el CSV", () => {
    const r = conciliar(["1", "2", "3", "4"], [3, 4, 5, 6, 7]);
    assert.equal(r.enCsv, 4);
    assert.equal(r.enAmbos, 2);
    assert.deepEqual(r.soloEnBd, [5, 6, 7]);
    assert.deepEqual(r.soloEnCsv, [1, 2]);
  });

  it("cuenta repetidos e inválidos del CSV sin mezclarlos con los identificadores", () => {
    const r = conciliar(["1", "1", "2", "", "abc", "0", "-3", "4.5"], [1, 2]);
    assert.equal(r.enCsv, 2);
    assert.equal(r.repetidosEnCsv, 1);
    assert.equal(r.invalidosEnCsv, 5);
    assert.deepEqual(r.soloEnBd, []);
    assert.deepEqual(r.soloEnCsv, []);
  });

  it("listas ordenadas y sin duplicados aunque la base los repita", () => {
    const r = conciliar(["9"], [30, 10, 20, 10]);
    assert.deepEqual(r.soloEnBd, [10, 20, 30]);
    assert.deepEqual(r.soloEnCsv, [9]);
  });

  it("todo igual: nada sobra ni falta", () => {
    const r = conciliar(["1", "2"], [2, 1]);
    assert.deepEqual([r.soloEnBd.length, r.soloEnCsv.length, r.enAmbos], [0, 0, 2]);
  });
});
