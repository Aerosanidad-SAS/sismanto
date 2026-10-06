import assert from "node:assert/strict";
import { test } from "node:test";

import {
  TITULOS_PACIENTE_EN_SERVICIO,
  celdasPacienteEnServicio,
  exportaDatosPaciente,
  type PacienteExport,
} from "./pacientes-export";

const PACIENTE: PacienteExport = {
  id: 7,
  cedula: "123",
  tipo_documento: "CC",
  nombre1: "Ana",
  nombre2: null,
  apellido1: "Pérez",
  apellido2: "Gómez",
  fecha_nacimiento: "1990-10-02",
  direccion: "Calle 1",
  barrio: null,
  localidad: null,
  departamento: "Antioquia",
  ciudad: "Medellín",
  rh: "O+",
  sexo: "F",
  estatura: null,
  eps: "EPS X",
  celular: "300",
  correo: null,
  activo: true,
};

test("Excel de servicios: una celda por título, sin repetir ID ni cédula", () => {
  assert.equal(TITULOS_PACIENTE_EN_SERVICIO[0], "PACIENTE REGISTRADO");
  assert.ok(TITULOS_PACIENTE_EN_SERVICIO.every((t, i) => i === 0 || t.startsWith("PACIENTE - ")));
  assert.ok(!TITULOS_PACIENTE_EN_SERVICIO.includes("PACIENTE - ID"));
  assert.ok(!TITULOS_PACIENTE_EN_SERVICIO.includes("PACIENTE - CEDULA"));
  assert.equal(celdasPacienteEnServicio(7, PACIENTE, "2026-10-01").length, TITULOS_PACIENTE_EN_SERVICIO.length);
});

test("Excel de servicios: datos del paciente, edad al día y estado", () => {
  const celdas = celdasPacienteEnServicio(7, PACIENTE, "2026-10-01");
  const de = (titulo: string) => celdas[TITULOS_PACIENTE_EN_SERVICIO.indexOf(titulo)];
  assert.equal(de("PACIENTE REGISTRADO"), "SI");
  assert.equal(de("PACIENTE - NOMBRE 1"), "Ana");
  assert.equal(de("PACIENTE - EDAD"), 35); // cumple 36 al día siguiente
  assert.equal(de("PACIENTE - ESTADO"), "Activo");
});

test("Excel de servicios: sin paciente registrado, NO y celdas vacías", () => {
  const celdas = celdasPacienteEnServicio(null, null, "2026-10-01");
  assert.equal(celdas[0], "NO");
  assert.ok(celdas.slice(1).every((c) => c === ""));
  // Registrado pero la RLS no deja leerlo: SI, sin datos.
  assert.equal(celdasPacienteEnServicio(7, null, "2026-10-01")[0], "SI");
});

test("solo los roles que exportan pacientes reciben sus datos en el Excel de servicios", () => {
  assert.ok(exportaDatosPaciente("ADMIN"));
  assert.ok(exportaDatosPaciente("REGULACION"));
  assert.ok(!exportaDatosPaciente("MEDICO"));
  assert.ok(!exportaDatosPaciente("VISTA"));
});
