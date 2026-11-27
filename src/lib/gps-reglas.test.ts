import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluarReglasGps, gravedadTarjeta, type EntradaReglas } from "./gps-reglas";

const T = (hhmm: string) => new Date(`2026-11-07T${hhmm}:00-05:00`);

const servicio = (o: Partial<NonNullable<EntradaReglas["servicio"]>> = {}): NonNullable<EntradaReglas["servicio"]> => ({
  asignadoAt: T("08:00"),
  horaRecogida: null,
  iniciaDesplazamientoAt: null,
  pacienteABordo: false,
  ...o,
});
const base = (o: Partial<EntradaReglas>): EntradaReglas => ({
  now: T("08:00"),
  vehiculo: { encendido: false, detenidoDesde: null },
  servicio: null,
  ...o,
});
const codigos = (e: EntradaReglas) => evaluarReglasGps(e).map((a) => `${a.codigo}:${a.nivel}`);

describe("inicio de desplazamiento atrasado", () => {
  it("dentro de los 10 min no alerta; pasados, sí", () => {
    assert.deepEqual(codigos(base({ now: T("08:10"), servicio: servicio() })), []);
    assert.deepEqual(codigos(base({ now: T("08:11"), servicio: servicio() })), ["INICIO_ATRASADO:alerta"]);
  });

  it("si ya inició desplazamiento no alerta", () => {
    assert.deepEqual(codigos(base({ now: T("09:00"), servicio: servicio({ iniciaDesplazamientoAt: T("08:05") }) })), []);
  });

  it("un servicio programado para más tarde corre desde la hora en que debía salir, no desde la asignación", () => {
    const s = servicio({ asignadoAt: T("08:00"), horaRecogida: T("11:45") }); // sale a las 11:15 (viaje 30 min)
    assert.deepEqual(codigos(base({ now: T("10:00"), servicio: s })), []);
    assert.deepEqual(codigos(base({ now: T("11:25"), servicio: s })), []);
    assert.deepEqual(codigos(base({ now: T("11:26"), servicio: s })), ["INICIO_ATRASADO:alerta"]);
  });

  it("usa el viaje estimado cuando hay ruta calculada", () => {
    const s = servicio({ asignadoAt: T("08:00"), horaRecogida: T("09:30"), viajeEstimadoMin: 50 }); // sale a las 08:40
    assert.deepEqual(codigos(base({ now: T("08:50"), servicio: s })), []);
    assert.deepEqual(codigos(base({ now: T("08:51"), servicio: s })), ["INICIO_ATRASADO:alerta"]);
  });

  it("en almuerzo no alerta, y el reloj arranca al terminar si se asignó durante el almuerzo", () => {
    const almuerzo = { desde: T("12:00"), hasta: T("13:00") };
    const s = servicio({ asignadoAt: T("12:20") });
    assert.deepEqual(codigos(base({ now: T("12:50"), servicio: s, almuerzo })), []);
    assert.deepEqual(codigos(base({ now: T("13:10"), servicio: s, almuerzo })), []);
    assert.deepEqual(codigos(base({ now: T("13:11"), servicio: s, almuerzo })), ["INICIO_ATRASADO:alerta"]);
  });

  it("sin servicio pendiente no hay nada que atrasar", () => {
    assert.deepEqual(codigos(base({ now: T("12:00") })), []);
  });
});

describe("encendido y detenido", () => {
  const detenido = (min: number, o: Partial<EntradaReglas> = {}) =>
    base({ now: T("10:00"), vehiculo: { encendido: true, detenidoDesde: new Date(T("10:00").getTime() - min * 60_000) }, ...o });

  it("antes de 20 min no avisa; ni apagado, ni en movimiento", () => {
    assert.deepEqual(codigos(detenido(19)), []);
    assert.deepEqual(codigos(base({ vehiculo: { encendido: false, detenidoDesde: T("09:00") } })), []);
    assert.deepEqual(codigos(base({ vehiculo: { encendido: true, detenidoDesde: null } })), []);
  });

  it("a los 20 min avisa a Regulación y escribe al conductor sin tono de reclamo", () => {
    const [a, ...resto] = evaluarReglasGps(detenido(20));
    assert.equal(resto.length, 0);
    assert.equal(a.nivel, "aviso");
    assert.match(a.mensajeRegulacion, /encendido y detenido hace 20 min/);
    assert.match(a.mensajeConductor ?? "", /¿Hay alguna novedad que quieras reportar\?/);
  });

  it("a los 30 min sin paciente escala a alerta con segundo recordatorio", () => {
    const alertas = evaluarReglasGps(detenido(30));
    assert.deepEqual(alertas.map((a) => a.nivel), ["aviso", "alerta"]);
    assert.notEqual(alertas[0].clave, alertas[1].clave);
    assert.match(alertas[1].mensajeConductor ?? "", /apagarlo/);
  });

  it("con paciente a bordo no escala", () => {
    const e = detenido(45, { servicio: servicio({ iniciaDesplazamientoAt: T("09:00"), pacienteABordo: true }) });
    assert.deepEqual(codigos(e), ["ENCENDIDO_DETENIDO:aviso"]);
    assert.match(evaluarReglasGps(e)[0].mensajeRegulacion, /con paciente a bordo/);
  });

  it("si el conductor reportó una novedad después de detenerse, no escala", () => {
    assert.deepEqual(codigos(detenido(35, { novedadReportadaAt: T("09:50") })), ["ENCENDIDO_DETENIDO:aviso"]);
  });

  it("la clave cambia con cada detención: un episodio nuevo vuelve a avisar", () => {
    const a = evaluarReglasGps(detenido(20))[0].clave;
    const b = evaluarReglasGps(base({ now: T("12:00"), vehiculo: { encendido: true, detenidoDesde: T("11:30") } }))[0].clave;
    assert.notEqual(a, b);
  });
});

describe("gravedad de la tarjeta", () => {
  it("normal sin alertas, aviso o alerta según la mayor", () => {
    assert.equal(gravedadTarjeta([]), "normal");
    assert.equal(gravedadTarjeta(evaluarReglasGps(base({ now: T("10:00"), vehiculo: { encendido: true, detenidoDesde: T("09:38") } }))), "aviso");
    assert.equal(
      gravedadTarjeta(evaluarReglasGps(base({ now: T("10:00"), vehiculo: { encendido: true, detenidoDesde: T("09:50") }, servicio: servicio({ asignadoAt: T("09:00") }) }))),
      "alerta"
    );
  });
});
