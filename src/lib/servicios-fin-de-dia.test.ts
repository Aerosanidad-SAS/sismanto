import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  claveAvisoFinDeDia,
  HORA_FIN_AVISO_FIN_DIA,
  HORA_INICIO_AVISO_FIN_DIA,
  horaEnBogota,
  textoAvisoFinDeDia,
  tocaAvisoFinDeDia,
} from "./servicios-fin-de-dia";

// Colombia es UTC-5 todo el año: las 20:30 en Bogotá son las 01:30 UTC del día siguiente.
const bogota = (dia: string, hhmm: string) => Date.parse(`${dia}T${hhmm}:00-05:00`);

describe("horaEnBogota", () => {
  it("usa el reloj de Colombia, no el de la máquina", () => {
    assert.equal(horaEnBogota(bogota("2026-10-07", "20:30")), 20);
    assert.equal(horaEnBogota(bogota("2026-10-07", "00:05")), 0);
    assert.equal(horaEnBogota(bogota("2026-10-07", "23:59")), 23);
    assert.equal(horaEnBogota(Date.parse("2026-10-08T01:30:00Z")), 20);
  });
});

describe("tocaAvisoFinDeDia", () => {
  it("avisa de las 8 p. m. a las 11 p. m., y no antes ni a medianoche", () => {
    assert.equal(HORA_INICIO_AVISO_FIN_DIA, 20);
    assert.equal(HORA_FIN_AVISO_FIN_DIA, 23);
    for (const h of [20, 21, 22, 23]) assert.equal(tocaAvisoFinDeDia(h), true, String(h));
    for (const h of [0, 8, 12, 19]) assert.equal(tocaAvisoFinDeDia(h), false, String(h));
  });
});

describe("claveAvisoFinDeDia", () => {
  it("cambia cada hora y cada día, pero no cada minuto", () => {
    const a = claveAvisoFinDeDia(bogota("2026-10-07", "20:05"));
    assert.equal(a, claveAvisoFinDeDia(bogota("2026-10-07", "20:59")));
    assert.notEqual(a, claveAvisoFinDeDia(bogota("2026-10-07", "21:00")));
    assert.notEqual(a, claveAvisoFinDeDia(bogota("2026-10-08", "20:05")));
  });

  it("el día es el de Colombia: a las 9 p. m. de Bogotá sigue siendo el mismo día aunque en UTC ya sea el siguiente", () => {
    assert.equal(claveAvisoFinDeDia(bogota("2026-10-07", "21:00")), "aviso_fin_dia_2026-10-07_21");
  });
});

describe("textoAvisoFinDeDia", () => {
  it("sin servicios abiertos no hay aviso", () => {
    assert.equal(textoAvisoFinDeDia({ programado: 0, curso: 0 }), null);
  });

  it("singular y plural", () => {
    assert.equal(textoAvisoFinDeDia({ programado: 1, curso: 0 })?.titulo, "🌙 Fin del día: 1 servicio sigue abierto");
    assert.equal(textoAvisoFinDeDia({ programado: 2, curso: 3 })?.titulo, "🌙 Fin del día: 5 servicios siguen abiertos");
  });

  it("el detalle cuenta por etapa, omite la que está en cero y pide cerrar", () => {
    const solo = textoAvisoFinDeDia({ programado: 0, curso: 4 });
    assert.ok(solo?.detalle.startsWith("4 en CURSO."));
    assert.ok(!solo?.detalle.includes("PROGRAMADO"));
    const ambos = textoAvisoFinDeDia({ programado: 2, curso: 3 });
    assert.ok(ambos?.detalle.startsWith("2 en PROGRAMADO y 3 en CURSO."));
    assert.ok(ambos?.detalle.includes("Ciérralos"));
  });
});
