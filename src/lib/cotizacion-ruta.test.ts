import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodificarPolilinea, estadoTrafico, rutaRecomendada, totalCotizacion, totalesRuta, urlMapaEstatico } from "./cotizacion-ruta";

const tramo = (distancia_m: number, duracion_s: number, duracion_trafico_s: number | null) => ({ desde: "A", hasta: "B", distancia_m, duracion_s, duracion_trafico_s });

describe("totalCotizacion", () => {
  it("km × valor por km + adicional, redondeado a pesos (como SISRES)", () => {
    assert.equal(totalCotizacion(12_345, 3_500), 43_208);
    assert.equal(totalCotizacion(10_000, 3_000, 50_000), 80_000);
  });
});

describe("tráfico y ruta recomendada", () => {
  it("clasifica el tramo con los cortes de SISRES", () => {
    assert.equal(estadoTrafico(tramo(1, 600, 800)), "Fluido");
    assert.equal(estadoTrafico(tramo(1, 600, 900)), "Moderado");
    assert.equal(estadoTrafico(tramo(1, 600, 1500)), "Congestionado");
    assert.equal(estadoTrafico(tramo(1, 600, null)), "Fluido");
  });

  it("recomienda la más rápida con tráfico y suma los tramos", () => {
    assert.equal(rutaRecomendada([[tramo(10_000, 900, 1_800)], [tramo(12_000, 1_000, 1_100)]]), 1);
    assert.deepEqual(totalesRuta([tramo(1_000, 60, 90), tramo(2_000, 120, null)]), { distancia_m: 3_000, duracion_s: 180, duracion_trafico_s: null });
  });
});

describe("polilínea y mapa estático", () => {
  it("decodifica el ejemplo oficial de Google", () => {
    assert.deepEqual(decodificarPolilinea("_p~iF~ps|U_ulLnnqC_mqNvxq`@"), [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]);
  });

  it("arma la URL con trazo, marcadores A y B y la llave", () => {
    const u = urlMapaEstatico("_p~iF~ps|U_ulLnnqC_mqNvxq`@", "LLAVE") ?? "";
    assert.match(u, /^https:\/\/maps\.googleapis\.com\/maps\/api\/staticmap\?/);
    assert.match(u, /markers=color:green%7Clabel:A%7C38\.5,-120\.2/);
    assert.match(u, /markers=color:red%7Clabel:B%7C43\.252,-126\.453/);
    assert.match(u, /key=LLAVE$/);
    assert.equal(urlMapaEstatico("", "LLAVE"), null);
  });
});
