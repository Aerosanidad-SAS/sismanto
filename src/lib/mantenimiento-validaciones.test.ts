import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { maintenanceSchema } from "./validations";

const mensajes = (datos: unknown) => {
  const r = maintenanceSchema.safeParse(datos);
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe("maintenanceSchema: mensajes en español", () => {
  it("el formulario vacío (km y valor en NaN, sin fecha ni categoría) no muestra inglés técnico", () => {
    const m = mensajes({ vehicleId: "", kilometrajeActual: NaN, categoriaId: NaN, valor: NaN, tiempoFueraServicioHoras: NaN, descripcionTrabajo: "", proveedor: "" });
    assert.ok(m.length >= 4);
    for (const texto of m) assert.doesNotMatch(texto, /Required|Expected|received|Invalid/i, texto);
    assert.ok(m.includes("Ingresa el kilometraje"));
    assert.ok(m.includes("Ingresa el valor"));
    assert.ok(m.includes("Selecciona un vehículo"));
  });

  it("sin fecha pide la fecha en español", () => {
    assert.ok(mensajes({ vehicleId: "x", fecha: undefined }).includes("Selecciona la fecha"));
  });

  it("km decimal o negativo y horas negativas tienen su mensaje", () => {
    const base = { vehicleId: "00000000-0000-4000-8000-000000000000", fecha: new Date(0), categoriaId: 1, descripcionTrabajo: "una descripción larga", proveedor: "P", valor: 0, tipo: "CORRECTIVO" as const };
    assert.ok(mensajes({ ...base, kilometrajeActual: 10.5 }).includes("El kilometraje debe ser un número entero"));
    assert.ok(mensajes({ ...base, kilometrajeActual: -1 }).includes("Kilometraje debe ser positivo"));
    assert.ok(mensajes({ ...base, kilometrajeActual: 100, tiempoFueraServicioHoras: -2 }).includes("Las horas no pueden ser negativas"));
  });

  it("la fecha de hoy (el valor por defecto del formulario) es válida y la de mañana no", () => {
    const base = { vehicleId: "00000000-0000-4000-8000-000000000000", kilometrajeActual: 100, categoriaId: 1, descripcionTrabajo: "una descripción larga", proveedor: "P", valor: 10, tipo: "PREVENTIVO" as const };
    assert.deepEqual(mensajes({ ...base, fecha: new Date() }), []);
    assert.ok(mensajes({ ...base, fecha: new Date(Date.now() + 24 * 3_600_000) }).includes("No puede ser fecha futura"));
  });

  it("datos válidos pasan, y las horas vacías (0) también", () => {
    const ok = { vehicleId: "00000000-0000-4000-8000-000000000000", fecha: new Date(0), kilometrajeActual: 100, categoriaId: 1, descripcionTrabajo: "una descripción larga", proveedor: "P", valor: 10, tipo: "PREVENTIVO" as const };
    assert.deepEqual(mensajes(ok), []);
    assert.deepEqual(mensajes({ ...ok, tiempoFueraServicioHoras: 0 }), []);
  });
});
