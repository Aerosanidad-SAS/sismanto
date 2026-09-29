import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcularIndicadores, formatoDuracion, minutosLaboralesEntre, type ConfigSla, type HorarioLaboral, type TicketParaIndicadores } from "./tickets-indicadores";

// Estas pruebas corren con TZ=UTC, America/Bogota y Asia/Tokyo (scripts/run-tests.mjs). El cálculo usa un
// desplazamiento fijo de -5h (hora de Colombia) sobre instantes UTC, nunca la zona del equipo que ejecuta el
// proceso: por eso da lo mismo en las tres.

const HORARIO_OFICINA: HorarioLaboral = { dias: [1, 2, 3, 4, 5], inicio: "08:00", fin: "17:00" };
const SLA: ConfigSla = { sla_baja_horas: 72, sla_media_horas: 24, sla_alta_horas: 8, sla_urgente_horas: 4 };

// Semana de referencia (verificada): lun 2026-09-28 … dom 2026-10-04.
const LUN = "2026-09-28";
const MAR = "2026-09-29";
const MIE = "2026-09-30";
const JUE = "2026-10-01";
const VIE = "2026-10-02";
const SAB = "2026-09-26";
const VIE_ANTERIOR = "2026-09-25";

// "HH:MM" de Bogotá → instante UTC de ese mismo día (Bogotá = UTC-5).
const bogota = (dia: string, hhmm: string) => new Date(`${dia}T${hhmm}:00-05:00`);

describe("minutosLaboralesEntre", () => {
  it("cuenta solo los minutos dentro de la ventana del mismo día", () => {
    const min = minutosLaboralesEntre(bogota(LUN, "09:00"), bogota(LUN, "11:30"), HORARIO_OFICINA);
    assert.equal(min, 150);
  });

  it("da 0 si el fin no es posterior al inicio", () => {
    assert.equal(minutosLaboralesEntre(bogota(LUN, "10:00"), bogota(LUN, "10:00"), HORARIO_OFICINA), 0);
    assert.equal(minutosLaboralesEntre(bogota(LUN, "10:00"), bogota(LUN, "09:00"), HORARIO_OFICINA), 0);
  });

  it("da 0 si el horario configurado no tiene ventana (fin <= inicio)", () => {
    const horarioInvalido: HorarioLaboral = { dias: [1, 2, 3, 4, 5], inicio: "08:00", fin: "08:00" };
    assert.equal(minutosLaboralesEntre(bogota(LUN, "08:00"), bogota(VIE, "17:00"), horarioInvalido), 0);
  });

  it("descuenta el fin de semana: solo cuentan las horas de los días laborales", () => {
    // Viernes 16:00 → 17:00 (60 min) + lunes 08:00 → 09:00 (60 min); sábado y domingo no cuentan.
    const min = minutosLaboralesEntre(bogota(VIE_ANTERIOR, "16:00"), bogota(LUN, "09:00"), HORARIO_OFICINA);
    assert.equal(min, 120);
  });

  it("da 0 si todo el rango cae en un día que no está en horario.dias", () => {
    const min = minutosLaboralesEntre(bogota(SAB, "10:00"), bogota(SAB, "15:00"), HORARIO_OFICINA);
    assert.equal(min, 0);
  });

  it("recorta lo que queda antes de abrir y después de cerrar", () => {
    // Antes de las 08:00 y después de las 17:00 no cuenta: un solo día laboral completo (540 min).
    const min = minutosLaboralesEntre(bogota(LUN, "05:00"), bogota(LUN, "20:00"), HORARIO_OFICINA);
    assert.equal(min, 540);
  });

  it("suma varios días laborales completos seguidos", () => {
    // Lunes 08:00 a miércoles 17:00: 3 días de 540 min = 1620.
    const min = minutosLaboralesEntre(bogota(LUN, "08:00"), bogota(MIE, "17:00"), HORARIO_OFICINA);
    assert.equal(min, 1620);
  });

  it("respeta un horario.dias distinto (por ejemplo, solo fin de semana)", () => {
    const horarioFinDeSemana: HorarioLaboral = { dias: [6, 7], inicio: "00:00", fin: "23:59" };
    // Un lunes completo no cuenta si solo se trabaja sábado y domingo.
    assert.equal(minutosLaboralesEntre(bogota(LUN, "00:00"), bogota(LUN, "23:00"), horarioFinDeSemana), 0);
  });
});

describe("formatoDuracion", () => {
  it("formatea null, minutos sueltos, horas exactas y horas con minutos", () => {
    assert.equal(formatoDuracion(null), "—");
    assert.equal(formatoDuracion(0), "0 min");
    assert.equal(formatoDuracion(45), "45 min");
    assert.equal(formatoDuracion(60), "1 h");
    assert.equal(formatoDuracion(200), "3 h 20 min");
  });

  it("redondea al minuto más cercano", () => {
    assert.equal(formatoDuracion(59.6), "1 h");
    assert.equal(formatoDuracion(89.4), "1 h 29 min");
  });
});

describe("calcularIndicadores", () => {
  it("da todo en null/0 sin tickets", () => {
    const r = calcularIndicadores([], new Set(), HORARIO_OFICINA, SLA, []);
    assert.deepEqual(r, {
      totalTickets: 0,
      cerrados: 0,
      respuestaPromedioMin: null,
      fcrPorcentaje: null,
      slaPorcentaje: null,
      slaEvaluados: 0,
      mttrPromedioMin: null,
      disponibilidadPromedio: null,
      disponibilidadMeses: 0,
      mtbf: [],
      cerradosPorTecnico: [],
    });
  });

  it("calcula respuesta, SLA, FCR, MTTR, MTBF y disponibilidad sobre un lote realista", () => {
    const tickets: TicketParaIndicadores[] = [
      {
        // ALTA: contesta en 2h laborales (dentro del SLA de 8h); cierra a las 5h. No se reabre.
        id: 1, categoria: "RED", area: "SEDE1", prioridad: "ALTA", estado: "CERRADO", nombre_tecnico: "Ana",
        created_at: bogota(LUN, "08:00").toISOString(),
        fecha_primer_contacto: bogota(LUN, "10:00").toISOString(),
        fecha_cierre: bogota(LUN, "13:00").toISOString(),
      },
      {
        // URGENTE: contesta en 5h laborales (fuera del SLA de 4h); cierra a las 9h. Se reabre después.
        id: 2, categoria: "RED", area: "SEDE1", prioridad: "URGENTE", estado: "CERRADO", nombre_tecnico: "Ana",
        created_at: bogota(MAR, "08:00").toISOString(),
        fecha_primer_contacto: bogota(MAR, "13:00").toISOString(),
        fecha_cierre: bogota(MAR, "17:00").toISOString(),
      },
      {
        // BAJA: sin atender todavía, no cerrado — no entra en respuesta/SLA/MTTR.
        id: 3, categoria: "IMPRESORA", area: "SEDE2", prioridad: "BAJA", estado: "ABIERTO", nombre_tecnico: null,
        created_at: bogota(MIE, "08:00").toISOString(),
        fecha_primer_contacto: null,
        fecha_cierre: null,
      },
      {
        // MEDIA: contesta en 1h laboral (dentro del SLA de 24h); sigue en proceso, no cerrado.
        id: 4, categoria: "RED", area: "SEDE1", prioridad: "MEDIA", estado: "EN_PROCESO", nombre_tecnico: "Ana",
        created_at: bogota(JUE, "08:00").toISOString(),
        fecha_primer_contacto: bogota(JUE, "09:00").toISOString(),
        fecha_cierre: null,
      },
    ];
    const disponibilidad = [
      { anio: 2026, mes: 9, porcentaje: 95 },
      { anio: 2026, mes: 8, porcentaje: 90 },
    ];

    const r = calcularIndicadores(tickets, new Set([2]), HORARIO_OFICINA, SLA, disponibilidad);

    assert.equal(r.totalTickets, 4);
    assert.equal(r.cerrados, 2);

    // Respuestas: 120, 300, 60 min laborales → promedio 160.
    assert.equal(r.respuestaPromedioMin, 160);

    // SLA: ticket 1 dentro (120<=480), ticket 2 fuera (300<=240 falso), ticket 4 dentro (60<=1440) → 2/3.
    assert.equal(r.slaEvaluados, 3);
    assert.ok(Math.abs((r.slaPorcentaje as number) - (200 / 3)) < 1e-9, `slaPorcentaje = ${r.slaPorcentaje}`);

    // FCR: 2 cerrados, solo el ticket 1 no se reabrió → 50%.
    assert.equal(r.fcrPorcentaje, 50);

    // MTTR: cierres en 300 y 540 min laborales → promedio 420.
    assert.equal(r.mttrPromedioMin, 420);

    assert.equal(r.disponibilidadPromedio, 92.5);
    assert.equal(r.disponibilidadMeses, 2);

    // MTBF: RED/SEDE1 tiene 3 tickets (lun, mar, jue) con huecos de 1 y 2 días → promedio 1.5.
    // IMPRESORA/SEDE2 tiene un solo ticket y no entra (hace falta al menos 2 para medir un intervalo).
    assert.equal(r.mtbf.length, 1);
    assert.equal(r.mtbf[0].categoria, "RED");
    assert.equal(r.mtbf[0].area, "SEDE1");
    assert.equal(r.mtbf[0].tickets, 3);
    assert.equal(r.mtbf[0].diasPromedio, 1.5);

    assert.deepEqual(r.cerradosPorTecnico, [{ tecnico: "Ana", cerrados: 2 }]);
  });

  it("agrupa los tickets cerrados sin técnico bajo «Sin técnico»", () => {
    const tickets: TicketParaIndicadores[] = [
      {
        id: 10, categoria: "RED", area: "SEDE1", prioridad: "BAJA", estado: "CERRADO", nombre_tecnico: null,
        created_at: bogota(LUN, "08:00").toISOString(),
        fecha_primer_contacto: bogota(LUN, "09:00").toISOString(),
        fecha_cierre: bogota(LUN, "10:00").toISOString(),
      },
    ];
    const r = calcularIndicadores(tickets, new Set(), HORARIO_OFICINA, SLA, []);
    assert.deepEqual(r.cerradosPorTecnico, [{ tecnico: "Sin técnico", cerrados: 1 }]);
  });

  it("ordena cerradosPorTecnico de mayor a menor", () => {
    const cerrado = (id: number, dia: string, tecnico: string): TicketParaIndicadores => ({
      id, categoria: "RED", area: "SEDE1", prioridad: "BAJA", estado: "CERRADO", nombre_tecnico: tecnico,
      created_at: bogota(dia, "08:00").toISOString(),
      fecha_primer_contacto: bogota(dia, "09:00").toISOString(),
      fecha_cierre: bogota(dia, "10:00").toISOString(),
    });
    const tickets = [cerrado(1, LUN, "Ana"), cerrado(2, MAR, "Beto"), cerrado(3, MIE, "Ana")];
    const r = calcularIndicadores(tickets, new Set(), HORARIO_OFICINA, SLA, []);
    assert.deepEqual(r.cerradosPorTecnico, [
      { tecnico: "Ana", cerrados: 2 },
      { tecnico: "Beto", cerrados: 1 },
    ]);
  });
});
