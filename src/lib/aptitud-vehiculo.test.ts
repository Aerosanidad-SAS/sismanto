import assert from "node:assert/strict";
import { test } from "node:test";

import {
  armarTablero,
  contarTablero,
  estadoAptitud,
  formatearDuracion,
  horaCorta,
  ocupacionVehiculo,
  ordenarTablero,
  resumirNovedades,
  type Aptitud,
  type EntradaAptitud,
  type EntradaVehiculo,
  type ServicioDelVehiculo,
} from "./aptitud-vehiculo";

const base: EntradaAptitud = { estadoActual: "OPERATIVO", solicitudPendiente: false, tienePreoperacionalHoy: true, novedadesAbiertas: 0 };

test("aptitud: cada estado", () => {
  assert.equal(estadoAptitud(base), "APTO");
  assert.equal(estadoAptitud({ ...base, novedadesAbiertas: 2 }), "APTO_CON_NOVEDADES");
  assert.equal(estadoAptitud({ ...base, tienePreoperacionalHoy: false }), "SIN_PREOPERACIONAL");
  assert.equal(estadoAptitud({ ...base, solicitudPendiente: true }), "NO_APTO_PENDIENTE_AVAL");
  assert.equal(estadoAptitud({ ...base, estadoActual: "FUERA_DE_SERVICIO" }), "NO_APTO");
});

test("aptitud: precedencia (NO_APTO gana a todo; pendiente de aval gana a «con novedades»)", () => {
  const todo: EntradaAptitud = { estadoActual: "FUERA_DE_SERVICIO", solicitudPendiente: true, tienePreoperacionalHoy: false, novedadesAbiertas: 3 };
  assert.equal(estadoAptitud(todo), "NO_APTO");
  assert.equal(estadoAptitud({ ...todo, estadoActual: "OPERATIVO" }), "NO_APTO_PENDIENTE_AVAL");
  assert.equal(estadoAptitud({ ...todo, estadoActual: "OPERATIVO", solicitudPendiente: false }), "SIN_PREOPERACIONAL");
  assert.equal(estadoAptitud({ ...todo, estadoActual: "OPERATIVO", solicitudPendiente: false, tienePreoperacionalHoy: true }), "APTO_CON_NOVEDADES");
  // Pendiente de aval con preoperacional hecho y novedades: sigue ganando el aval.
  assert.equal(estadoAptitud({ ...base, solicitudPendiente: true, novedadesAbiertas: 5 }), "NO_APTO_PENDIENTE_AVAL");
});

test("novedades: cuenta y mayor severidad", () => {
  assert.deepEqual(resumirNovedades([]), { cantidad: 0, severidadMaxima: null });
  assert.deepEqual(resumirNovedades(["BAJA", "ALTA", "MEDIA"]), { cantidad: 3, severidadMaxima: "ALTA" });
  assert.deepEqual(resumirNovedades(["BAJA", "MEDIA"]), { cantidad: 2, severidadMaxima: "MEDIA" });
  // Una severidad desconocida cuenta como novedad pero no define la máxima.
  assert.deepEqual(resumirNovedades(["RARA"]), { cantidad: 1, severidadMaxima: null });
});

// ── Ocupación ──
const AHORA = new Date("2026-10-02T15:00:00-05:00").getTime();
const en = (hhmm: string) => `2026-10-02T${hhmm}:00-05:00`;

const traslado = (id: number, extra: Record<string, unknown> = {}): ServicioDelVehiculo => ({
  id,
  etapa: "PROGRAMADO",
  tipo_servicio: "TAB SENCILLO",
  vehicle_id: "v1",
  fecha_hora_programacion: en("16:00"),
  ...extra,
});

test("ocupación: sin servicios o solo programados = LIBRE, con próximo servicio", () => {
  assert.equal(ocupacionVehiculo([], AHORA).estado, "LIBRE");
  assert.equal(ocupacionVehiculo([], AHORA).proximo, null);

  const o = ocupacionVehiculo([traslado(2, { fecha_hora_programacion: en("18:00") }), traslado(1, { fecha_hora_programacion: en("16:30") })], AHORA);
  assert.equal(o.estado, "LIBRE");
  assert.equal(o.servicioActual, null);
  assert.equal(o.proximo?.id, 1);
  assert.equal(o.proximo?.minutosDeRetraso, null);
});

test("ocupación: próximo servicio ya vencido reporta el retraso", () => {
  const o = ocupacionVehiculo([traslado(1, { fecha_hora_programacion: en("14:40") })], AHORA);
  assert.equal(o.estado, "LIBRE");
  assert.equal(o.proximo?.minutosDeRetraso, 20);
});

test("ocupación: EN_SERVICIO con último hito, hora y minutos transcurridos", () => {
  const o = ocupacionVehiculo(
    [
      traslado(1, {
        etapa: "CURSO",
        fecha_hora_inicio_desplazamiento: en("14:10"),
        fecha_hora_llegada_origen: en("14:35"),
        fecha_hora_salida_origen: en("14:50"),
      }),
      traslado(2, { fecha_hora_programacion: en("17:00") }),
    ],
    AHORA,
  );
  assert.equal(o.estado, "EN_SERVICIO");
  assert.equal(o.serviciosEnCurso, 1);
  assert.equal(o.servicioActual?.hito, "Salida con paciente");
  assert.equal(o.servicioActual?.estado, "En traslado");
  assert.equal(o.servicioActual?.hitoAt, en("14:50"));
  assert.equal(o.servicioActual?.minutosEnServicio, 50);
  assert.equal(o.proximo?.id, 2);
  assert.equal(o.estimadoLibre, null);
});

test("ocupación: un hito marcado con la etapa aún PROGRAMADO ya cuenta como en servicio; sin marcas usa null", () => {
  const conHito = ocupacionVehiculo([traslado(1, { fecha_hora_inicio_desplazamiento: en("14:45") })], AHORA);
  assert.equal(conHito.estado, "EN_SERVICIO");
  assert.equal(conHito.servicioActual?.minutosEnServicio, 15);

  const telemedicina = ocupacionVehiculo([{ id: 3, etapa: "CURSO", tipo_servicio: "TELEMEDICINA" }], AHORA);
  assert.equal(telemedicina.estado, "EN_SERVICIO");
  assert.equal(telemedicina.servicioActual?.hito, null);
  assert.equal(telemedicina.servicioActual?.minutosEnServicio, null);
});

test("ocupación: finalizados, cerrados y cancelados no ocupan al vehículo", () => {
  const o = ocupacionVehiculo(
    [traslado(1, { etapa: "FINALIZADO", fecha_hora_inicio_desplazamiento: en("10:00") }), traslado(2, { etapa: "CANCELADO" })],
    AHORA,
  );
  assert.equal(o.estado, "LIBRE");
  assert.equal(o.proximo, null);
});

test("ocupación: con dos en curso se muestra el de actividad más reciente", () => {
  const o = ocupacionVehiculo(
    [
      traslado(1, { etapa: "CURSO", fecha_hora_inicio_desplazamiento: en("13:00"), fecha_hora_llegada_origen: en("13:30") }),
      traslado(2, { etapa: "CURSO", fecha_hora_inicio_desplazamiento: en("14:00"), fecha_hora_llegada_origen: en("14:20") }),
    ],
    AHORA,
  );
  assert.equal(o.serviciosEnCurso, 2);
  assert.equal(o.servicioActual?.id, 2);
});

// ── Tablero: orden y conteos ──
function vehiculo(placa: string, extra: Partial<EntradaVehiculo> = {}): EntradaVehiculo {
  return { vehicleId: placa, placa, estadoActual: "OPERATIVO", conductores: [], tienePreoperacionalHoy: true, severidadesNovedades: [], motivoSolicitud: null, servicios: [], ...extra };
}
const enCurso = (id: number): ServicioDelVehiculo => traslado(id, { etapa: "CURSO", fecha_hora_inicio_desplazamiento: en("14:30") });

const FLOTA: EntradaVehiculo[] = [
  vehiculo("LIB-003"),
  vehiculo("SRV-002", { servicios: [enCurso(1)] }),
  vehiculo("LIB-001", { servicios: [traslado(5, { fecha_hora_programacion: en("16:00") })] }),
  vehiculo("PRE-001", { tienePreoperacionalHoy: false }),
  vehiculo("NOV-001", { severidadesNovedades: ["BAJA", "ALTA"] }),
  vehiculo("AVL-001", { motivoSolicitud: "Choque lateral" }),
  vehiculo("FDS-001", { estadoActual: "FUERA_DE_SERVICIO" }),
  vehiculo("SRV-001", { servicios: [enCurso(2)] }),
  vehiculo("LIB-002", { servicios: [traslado(6, { fecha_hora_programacion: en("15:30") })] }),
];

test("tablero: atención primero (por urgencia), luego en servicio, luego libres por próximo servicio", () => {
  const { filas } = armarTablero(FLOTA, AHORA);
  assert.deepEqual(
    filas.map((f) => f.placa),
    ["FDS-001", "AVL-001", "PRE-001", "SRV-001", "SRV-002", "LIB-002", "LIB-001", "LIB-003", "NOV-001"],
  );
});

test("tablero: un NO_APTO con servicio abierto sigue en el grupo de atención", () => {
  const { filas } = armarTablero([vehiculo("SRV-001", { servicios: [enCurso(1)] }), vehiculo("FDS-001", { estadoActual: "FUERA_DE_SERVICIO", servicios: [enCurso(2)] })], AHORA);
  assert.deepEqual(filas.map((f) => f.placa), ["FDS-001", "SRV-001"]);
  assert.equal(filas[0].aptitud, "NO_APTO");
  assert.equal(filas[0].ocupacion.estado, "EN_SERVICIO");
});

test("tablero: ordenar no muta la lista recibida", () => {
  const { filas } = armarTablero(FLOTA, AHORA);
  const copia = [...filas].reverse();
  const antes = copia.map((f) => f.placa);
  ordenarTablero(copia);
  assert.deepEqual(copia.map((f) => f.placa), antes);
});

test("tablero: contadores (libres cuentan solo aptos; los demás por su estado)", () => {
  const { filas, contadores } = armarTablero(FLOTA, AHORA);
  assert.deepEqual(contadores, { libres: 4, enServicio: 2, conNovedades: 1, noAptos: 2, sinPreoperacional: 1 });
  assert.deepEqual(contarTablero(filas), contadores);
  // Cada vehículo cae en exactamente una de: en servicio, libre y apto, o libre y no apto/sin preoperacional.
  const libresNoAptos = filas.filter((f) => f.ocupacion.estado === "LIBRE" && !["APTO", "APTO_CON_NOVEDADES"].includes(f.aptitud)).length;
  assert.equal(contadores.enServicio + contadores.libres + libresNoAptos, filas.length);
  const aptitudes = filas.map((f) => f.aptitud) as Aptitud[];
  assert.equal(aptitudes.filter((a) => a === "APTO").length, 5);
});

test("tablero: vacío", () => {
  const { filas, contadores } = armarTablero([], AHORA);
  assert.deepEqual(filas, []);
  assert.deepEqual(contadores, { libres: 0, enServicio: 0, conNovedades: 0, noAptos: 0, sinPreoperacional: 0 });
});

// ── Formato ──
test("hora de Colombia, 24 h, sin depender de la zona del equipo", () => {
  assert.equal(horaCorta("2026-10-02T19:05:00Z"), "14:05");
  assert.equal(horaCorta("2026-10-02T05:30:00Z"), "00:30");
  assert.equal(horaCorta(null), "—");
  assert.equal(horaCorta("no-es-fecha"), "—");
});

test("duración legible", () => {
  assert.equal(formatearDuracion(0), "0 min");
  assert.equal(formatearDuracion(45), "45 min");
  assert.equal(formatearDuracion(120), "2 h");
  assert.equal(formatearDuracion(135), "2 h 15 min");
});
