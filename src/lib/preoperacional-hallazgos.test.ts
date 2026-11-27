import assert from "node:assert/strict";
import { test } from "node:test";

import type { ItemEvaluado } from "./preoperacional-alertas";
import { registrarHallazgosPreoperacional } from "./preoperacional-hallazgos";

const HOY = "2026-10-26";
const AL_DIA = { vencimiento_soat: "2027-03-01", vencimiento_tecnicomecanica: "2027-03-01" };
const FRENO: ItemEvaluado = { descripcion: "Freno de pedal", estado: "FALLA", severidadFalla: "CRITICA", observacion: "sin presión" };
const PITO: ItemEvaluado = { descripcion: "Pito", estado: "FALLA", severidadFalla: "MEDIA", observacion: "" };
const OK: ItemEvaluado = { descripcion: "Luces", estado: "OK", severidadFalla: "MEDIA", observacion: "" };

type Respuesta = { data: unknown; error: unknown };

/** Cliente de Supabase de mentira: cada consulta devuelve lo que se le diga, sin tocar ninguna base. */
function clienteFalso(r: { vehiculo: Respuesta; abiertas?: Respuesta; insert: Respuesta }) {
  const cadena = (inicial: Respuesta, alInsertar?: Respuesta): any => {
    let res = inicial;
    const c: any = {
      select: () => c,
      eq: () => c,
      in: () => c,
      insert: () => {
        if (alInsertar) res = alInsertar;
        return c;
      },
      maybeSingle: async () => res,
      single: async () => res,
      then: (ok: (v: Respuesta) => unknown, ko: (e: unknown) => unknown) => Promise.resolve(res).then(ok, ko),
    };
    return c;
  };
  return {
    from: (tabla: string) =>
      tabla === "vehicles" ? cadena(r.vehiculo) : cadena(r.abiertas ?? { data: [], error: null }, r.insert),
  } as any;
}

const falla = { code: "42501", message: "new row violates row-level security policy" };

test("si falla el insert de una novedad crítica, el resultado lo dice y no afirma «ya estaba reportado»", async (t) => {
  t.mock.method(console, "error", () => {});
  const cliente = clienteFalso({ vehiculo: { data: AL_DIA, error: null }, insert: { data: null, error: falla } });
  const r = await registrarHallazgosPreoperacional(cliente, { vehicleId: "v1", items: [FRENO, OK], reportadoPor: "OVEM", hoy: HOY });
  assert.equal(r.novedadesCreadas, 0);
  assert.equal(r.registroIncompleto, true);
  assert.equal(r.criticos, 1);
  assert.match(r.mensaje ?? "", /NO se pudo registrar/);
  assert.match(r.mensaje ?? "", /llama ya a Regulación/);
  assert.doesNotMatch(r.mensaje ?? "", /ya estaba reportado/);
});

test("si falla el insert de una no crítica, se marca registroIncompleto sin hablar de FUERA DE SERVICIO", async (t) => {
  t.mock.method(console, "error", () => {});
  const cliente = clienteFalso({ vehiculo: { data: AL_DIA, error: null }, insert: { data: null, error: falla } });
  const r = await registrarHallazgosPreoperacional(cliente, { vehicleId: "v1", items: [PITO], reportadoPor: "OVEM", hoy: HOY });
  assert.equal(r.novedadesCreadas, 0);
  assert.equal(r.registroIncompleto, true);
  assert.match(r.mensaje ?? "", /NO se pudo registrar como novedad/);
  assert.doesNotMatch(r.mensaje ?? "", /FUERA DE SERVICIO/);
});

test("si no se pudo leer la ficha del vehículo, no inventa «sin fecha de vencimiento»", async (t) => {
  t.mock.method(console, "error", () => {});
  const cliente = clienteFalso({ vehiculo: { data: null, error: falla }, insert: { data: null, error: falla } });
  const r = await registrarHallazgosPreoperacional(cliente, { vehicleId: "v1", items: [OK], reportadoPor: "OVEM", hoy: HOY });
  // No hay novedades, pero se avisa que SOAT y técnico-mecánica no se revisaron, y nunca el falso «sin fecha de vencimiento».
  assert.equal(r.registroIncompleto, true);
  assert.match(r.mensaje ?? "", /No se pudieron revisar el SOAT/);
  assert.doesNotMatch(r.mensaje ?? "", /sin fecha de vencimiento/);
  assert.equal(r.novedadesCreadas, 0);
});

test("todo OK y documentos al día: sin novedades ni avisos", async () => {
  const cliente = clienteFalso({ vehiculo: { data: AL_DIA, error: null }, insert: { data: null, error: falla } });
  const r = await registrarHallazgosPreoperacional(cliente, { vehicleId: "v1", items: [OK], reportadoPor: "OVEM", hoy: HOY });
  assert.equal(r.mensaje, null);
  assert.equal(r.registroIncompleto, false);
});
