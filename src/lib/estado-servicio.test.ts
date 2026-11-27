import assert from "node:assert/strict";
import { test } from "node:test";

import { estadoOperativo, minutosDeRetraso, modalidadTraslado, pasosPorTipo, type ServicioParaEstado } from "./estado-servicio";
import { PERFIL_FORMULARIO_SERVICIO } from "./validations";

const ahora = "2026-11-23T15:00:00.000Z";

/** Secuencia de botones que ve la tripulación por tipo de servicio (hitos en orden). */
const ESPERADO: Record<string, string[]> = {
  "TAB SIMPLE": ["Inicio de desplazamiento", "Llegada a sitio", "Salida con paciente", "Llegada a destino", "Paciente entregado"],
  "TAB SENCILLO": ["Inicio de desplazamiento", "Llegada a sitio", "Salida con paciente", "Llegada a destino", "Paciente entregado"],
  "TAM SIMPLE": ["Inicio de desplazamiento", "Llegada a sitio", "Salida con paciente", "Llegada a destino", "Paciente entregado"],
  "TAB DOBLE": [
    "Inicio de desplazamiento",
    "Llegada a sitio",
    "Salida con paciente",
    "Llegada a punto intermedio",
    "Salida de regreso",
    "Llegada a origen",
    "Paciente entregado",
  ],
  "TAM DOBLE": [
    "Inicio de desplazamiento",
    "Llegada a sitio",
    "Salida con paciente",
    "Llegada a punto intermedio",
    "Salida de regreso",
    "Llegada a origen",
    "Paciente entregado",
  ],
  "TRASLADO AEREO": [
    "Inicio de desplazamiento",
    "Llegada a sitio",
    "Salida con paciente",
    "Llegada a aeropuerto",
    "Salida de aeropuerto",
    "Llegada a destino",
    "Paciente entregado",
  ],
  "MEDICINA DOMICILIARIA": ["Inicio de desplazamiento", "Inicio de atención", "Fin de atención"],
  "ENFERMERIA DOMICILIARIA": ["Inicio de desplazamiento", "Inicio de atención", "Fin de atención"],
  TELEMEDICINA: [],
};

test("cada tipo de servicio tiene la secuencia de pasos esperada", () => {
  for (const [tipo, hitos] of Object.entries(ESPERADO)) {
    assert.deepEqual(pasosPorTipo(tipo).map((p) => p.hito), hitos, tipo);
  }
});

test("todo tipo del catálogo está cubierto por la tabla de esperados", () => {
  const todos = Object.values(PERFIL_FORMULARIO_SERVICIO).flat() as string[];
  for (const tipo of todos) assert.ok(tipo in ESPERADO, `falta ${tipo}`);
});

test("el primer paso pasa a CURSO y el último a FINALIZADO; los intermedios no mueven la etapa", () => {
  for (const [tipo, hitos] of Object.entries(ESPERADO)) {
    if (hitos.length === 0) continue;
    const pasos = pasosPorTipo(tipo);
    assert.equal(pasos[0].etapaDestino, "CURSO", tipo);
    assert.equal(pasos[pasos.length - 1].etapaDestino, "FINALIZADO", tipo);
    for (const p of pasos.slice(1, -1)) assert.equal(p.etapaDestino, undefined, `${tipo}: ${p.hito}`);
  }
});

test("ningún tipo repite el campo de fecha de un paso", () => {
  for (const tipo of Object.keys(ESPERADO)) {
    const campos = pasosPorTipo(tipo).map((p) => p.campo);
    assert.equal(new Set(campos).size, campos.length, tipo);
  }
});

test("modalidad: doble, aéreo y sencillo; domiciliaria y telemedicina no son traslado", () => {
  assert.equal(modalidadTraslado("TAB DOBLE"), "DOBLE");
  assert.equal(modalidadTraslado("TAM DOBLE"), "DOBLE");
  assert.equal(modalidadTraslado("TRASLADO AEREO"), "AEREO");
  assert.equal(modalidadTraslado("TAB SIMPLE"), "SENCILLO");
  assert.equal(modalidadTraslado("TAM SIMPLE"), "SENCILLO");
  assert.equal(modalidadTraslado("MEDICINA DOMICILIARIA"), null);
  assert.equal(modalidadTraslado("TELEMEDICINA"), null);
});

test("el estado operativo avanza con cada paso marcado, en todos los tipos con pasos", () => {
  for (const [tipo, hitos] of Object.entries(ESPERADO)) {
    if (hitos.length === 0) continue;
    const pasos = pasosPorTipo(tipo);
    const s: ServicioParaEstado = { etapa: "PROGRAMADO", tipo_servicio: tipo, vehicle_id: "v1" };
    assert.equal(estadoOperativo(s).etiqueta, "Asignado", tipo);
    pasos.forEach((p, i) => {
      s[p.campo] = ahora;
      s.etapa = p.etapaDestino ?? s.etapa;
      const e = estadoOperativo(s);
      if (i === pasos.length - 1) assert.equal(e.etiqueta, "Finalizado", `${tipo}: final`);
      else assert.equal(e.etiqueta, p.estado, `${tipo}: ${p.hito}`);
    });
  }
});

test("telemedicina: en CURSO es «En atención» y no genera retraso", () => {
  const s: ServicioParaEstado = { etapa: "CURSO", tipo_servicio: "TELEMEDICINA" };
  assert.equal(estadoOperativo(s).etiqueta, "En atención");
  assert.equal(minutosDeRetraso({ ...s, etapa: "PROGRAMADO", fecha_hora_programacion: "2026-11-23T10:00:00.000Z" }), null);
});

test("retraso: ambulancia cuenta hasta «Llegada a sitio»; domiciliaria hasta «Inicio de atención»", () => {
  const prog = "2026-11-23T14:00:00.000Z";
  const t = Date.parse(ahora);
  assert.equal(minutosDeRetraso({ etapa: "PROGRAMADO", tipo_servicio: "TAB DOBLE", fecha_hora_programacion: prog }, t), 60);
  assert.equal(
    minutosDeRetraso({ etapa: "CURSO", tipo_servicio: "TAB DOBLE", fecha_hora_programacion: prog, fecha_hora_llegada_origen: ahora }, t),
    null
  );
  assert.equal(minutosDeRetraso({ etapa: "PROGRAMADO", tipo_servicio: "MEDICINA DOMICILIARIA", fecha_hora_programacion: prog }, t), 60);
  assert.equal(
    minutosDeRetraso(
      { etapa: "CURSO", tipo_servicio: "MEDICINA DOMICILIARIA", fecha_hora_programacion: prog, fecha_hora_llegada_destino: ahora },
      t
    ),
    null
  );
});

test("un servicio con el último paso marcado pero sin FINALIZADO queda «Pendiente de cierre»", () => {
  const s: ServicioParaEstado = { etapa: "CURSO", tipo_servicio: "TAB SIMPLE", fecha_hora_salida_destino: ahora };
  assert.equal(estadoOperativo(s).etiqueta, "Pendiente de cierre");
});
