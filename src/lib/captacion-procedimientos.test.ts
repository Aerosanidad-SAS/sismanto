import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PROCEDIMIENTOS } from "./captacion";
import {
  PROCEDIMIENTOS_EXTERNOS,
  agruparPorLote,
  captacionProcedimientosSchema,
  type FilaProcedimientoGuardada,
} from "./captacion-procedimientos";
import { rolesDeRuta } from "./navegacion";
import { ROLES_CAPTACION_LISTA } from "./captacion";

const LOTE = "3f2b8c1e-9d4a-4e7b-8a61-0c5d2e9f7a10";

function valido(parcial: Record<string, unknown> = {}) {
  return {
    fecha_atencion: "2026-11-25T10:30",
    aeropuerto_atencion: "AEROPUERTO OLAYA HERRERA",
    lineas: [{ procedimiento: "AMBULANCIAS EXTERNAS", cantidad: 1 }],
    ...parcial,
  };
}

describe("captacionProcedimientosSchema", () => {
  it("acepta lo mínimo: fecha, aeropuerto y una línea (sin datos del paciente)", () => {
    const r = captacionProcedimientosSchema.safeParse(valido());
    assert.equal(r.success, true);
    if (r.success) {
      assert.equal(r.data.emergencia_tipo, undefined);
      assert.equal(r.data.notas, undefined);
    }
  });

  it("acepta varias líneas con cantidad, tipo de emergencia, notas y lote", () => {
    const r = captacionProcedimientosSchema.safeParse(
      valido({
        lote: LOTE,
        emergencia_tipo: "ALISTAMIENTOS",
        notas: "  Simulacro  ",
        lineas: [
          { procedimiento: "AMBULANCIAS EXTERNAS", cantidad: "3" },
          { procedimiento: "GLUCOMETRIA", cantidad: 99 },
        ],
      }),
    );
    assert.equal(r.success, true);
    if (r.success) {
      assert.deepEqual(r.data.lineas, [
        { procedimiento: "AMBULANCIAS EXTERNAS", cantidad: 3 },
        { procedimiento: "GLUCOMETRIA", cantidad: 99 },
      ]);
      assert.equal(r.data.notas, "Simulacro");
    }
  });

  it("exige fecha, aeropuerto y al menos una línea", () => {
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ fecha_atencion: "" })).success, false);
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ fecha_atencion: "25/11/2026" })).success, false);
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ aeropuerto_atencion: "  " })).success, false);
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ lineas: [] })).success, false);
  });

  it("la cantidad va de 1 a 99 y es entera", () => {
    const con = (cantidad: unknown) => captacionProcedimientosSchema.safeParse(valido({ lineas: [{ procedimiento: "GLUCOMETRIA", cantidad }] })).success;
    assert.equal(con(1), true);
    assert.equal(con(99), true);
    assert.equal(con(0), false);
    assert.equal(con(100), false);
    assert.equal(con(-2), false);
    assert.equal(con(1.5), false);
    assert.equal(con(""), false);
    assert.equal(con("abc"), false);
  });

  it("solo acepta procedimientos del catálogo y no NINGUNO / NO APLICA", () => {
    const con = (procedimiento: string) => captacionProcedimientosSchema.safeParse(valido({ lineas: [{ procedimiento, cantidad: 1 }] })).success;
    assert.equal(con("INVENTADO"), false);
    assert.equal(con("NINGUNO"), false);
    assert.equal(con("NO APLICA"), false);
    for (const p of PROCEDIMIENTOS_EXTERNOS) assert.equal(con(p), true, p);
    assert.deepEqual(
      PROCEDIMIENTOS_EXTERNOS,
      PROCEDIMIENTOS.filter((p) => p !== "NINGUNO" && p !== "NO APLICA"),
    );
  });

  it("rechaza el mismo procedimiento repetido en dos líneas", () => {
    const r = captacionProcedimientosSchema.safeParse(
      valido({
        lineas: [
          { procedimiento: "GLUCOMETRIA", cantidad: 1 },
          { procedimiento: "GLUCOMETRIA", cantidad: 2 },
        ],
      }),
    );
    assert.equal(r.success, false);
    if (!r.success) assert.match(r.error.issues[0].message, /repetido/i);
  });

  it("valida el tipo de emergencia y el lote", () => {
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ emergencia_tipo: "OTRA" })).success, false);
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ emergencia_tipo: "" })).success, true);
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ lote: "no-es-uuid" })).success, false);
  });

  it("limita las notas a 2000 caracteres", () => {
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ notas: "x".repeat(2000) })).success, true);
    assert.equal(captacionProcedimientosSchema.safeParse(valido({ notas: "x".repeat(2001) })).success, false);
  });
});

describe("agruparPorLote", () => {
  const base = { aeropuerto_atencion: "A", emergencia_tipo: null, notas: null, nombre_registrado_por: "Alguien" };
  const f = (id: number, lote: string, procedimiento: string, cantidad: number, fecha = "2026-11-25T15:00:00Z"): FilaProcedimientoGuardada => ({
    ...base,
    id,
    lote,
    fecha_atencion: fecha,
    procedimiento,
    cantidad,
    created_at: fecha,
  });

  it("une las líneas del mismo lote y conserva el orden de llegada", () => {
    const grupos = agruparPorLote([
      f(3, "b", "GLUCOMETRIA", 2, "2026-11-25T16:00:00Z"),
      f(1, "a", "AMBULANCIAS EXTERNAS", 3),
      f(2, "a", "GLUCOMETRIA", 1),
    ]);
    assert.deepEqual(grupos.map((g) => g.lote), ["b", "a"]);
    assert.deepEqual(grupos[1].lineas, [
      { id: 1, procedimiento: "AMBULANCIAS EXTERNAS", cantidad: 3 },
      { id: 2, procedimiento: "GLUCOMETRIA", cantidad: 1 },
    ]);
    assert.equal(grupos[1].totalCantidad, 4);
  });

  it("sin filas devuelve una lista vacía", () => {
    assert.deepEqual(agruparPorLote([]), []);
  });
});

describe("menú", () => {
  it("el ítem nuevo y el de captación comparten los roles de captación (incluida COORDINACION)", () => {
    const ordenar = (r: readonly string[]) => [...r].sort();
    assert.deepEqual(ordenar(rolesDeRuta("/captacion")), ordenar(ROLES_CAPTACION_LISTA));
    assert.deepEqual(ordenar(rolesDeRuta("/captacion/procedimientos")), ordenar(ROLES_CAPTACION_LISTA));
  });
});
