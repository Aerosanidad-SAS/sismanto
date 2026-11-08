import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analizarReporte, casoDeTitulo, cuerpoIssue, errorLegible, huellaDe, informeCsv, marcaDeHuella, responsableDe, tituloIssue, type ReporteJson, type Responsables } from "./e2e-informe";

const R: Responsables = { porPrefijo: { R: "TecnicoAerosanidad", O: "daniel891025", A: "aerosanidad" }, porDefecto: "daniel891025" };

const spec = (title: string, file: string, tests: { projectName: string; status: string; error?: string }[]) => ({
  title,
  file,
  tests: tests.map((t) => ({
    projectName: t.projectName,
    status: t.status,
    results: [{ status: t.status === "expected" ? "passed" : "failed", error: t.error ? { message: t.error } : undefined }],
  })),
});

const reporte = {
  suites: [
    {
      file: "specs/smoke/aislamiento.spec.ts",
      suites: [
        {
          title: "REGULACION_MDE",
          specs: [
            spec("R-02: /vehiculos lista solo Medellín", "specs/smoke/aislamiento.spec.ts", [
              { projectName: "desktop", status: "unexpected", error: "\u001b[31mError:\u001b[0m expect(received).toBe(expected)\nline2" },
            ]),
            spec("R-03: otra", "specs/smoke/aislamiento.spec.ts", [{ projectName: "desktop", status: "expected" }]),
          ],
        },
      ],
    },
    {
      file: "specs/smoke/ovem@mobile.spec.ts",
      specs: [
        spec("O-33: OVEM sin scroll horizontal", "specs/smoke/ovem@mobile.spec.ts", [
          { projectName: "mobile-390", status: "unexpected", error: "ancho 412 > 390" },
          { projectName: "mobile-360", status: "unexpected", error: "ancho 412 > 360" },
        ]),
        spec("O-02: selector", "specs/smoke/ovem@mobile.spec.ts", [{ projectName: "mobile-390", status: "flaky", error: "timeout" }]),
        spec("sin id: cosa rara", "specs/smoke/roles-cargan.spec.ts", [{ projectName: "desktop", status: "unexpected", error: "x" }]),
        spec("A3: ruta sin sesión", "specs/smoke/acceso.spec.ts", [{ projectName: "desktop", status: "skipped" }]),
      ],
    },
  ],
} as unknown as ReporteJson;

describe("casoDeTitulo", () => {
  it("lee R-02, O-33 y A3", () => {
    assert.equal(casoDeTitulo("R-02: algo"), "R-02");
    assert.equal(casoDeTitulo("O-33: sin scroll"), "O-33");
    assert.equal(casoDeTitulo("A3: ruta protegida"), "A3");
    assert.equal(casoDeTitulo("/vehiculos lista solo Medellín"), null);
  });
});

describe("responsableDe", () => {
  it("por prefijo y con área; lo demás cae al responsable por defecto", () => {
    assert.deepEqual(responsableDe("R-02", R), { responsable: "TecnicoAerosanidad", area: "regulacion" });
    assert.deepEqual(responsableDe("A3", R), { responsable: "aerosanidad", area: "acceso" });
    assert.deepEqual(responsableDe(null, R), { responsable: "daniel891025", area: "sin-clasificar" });
  });
});

describe("analizarReporte", () => {
  const { hallazgos, resumen } = analizarReporte(reporte, R);

  it("cuenta ejecuciones (una por proyecto): pasadas, fallidas, inestables y omitidas", () => {
    assert.deepEqual(resumen, { total: 7, pasaron: 1, fallaron: 4, inestables: 1, omitidas: 1 });
  });

  it("une una misma prueba que falla en varios proyectos", () => {
    const o33 = hallazgos.filter((h) => h.caso === "O-33");
    assert.equal(o33.length, 1);
    assert.deepEqual(o33[0].proyectos, ["mobile-390", "mobile-360"]);
  });

  it("no crea hallazgos de lo que pasó u omitieron; las fallas van antes que lo inestable", () => {
    assert.equal(hallazgos.length, 4);
    assert.ok(!hallazgos.some((h) => h.caso === "A3" || h.caso === "R-03"));
    assert.equal(hallazgos[hallazgos.length - 1].gravedad, "inestable");
  });

  it("asigna responsable y limpia los colores del error", () => {
    const r02 = hallazgos.find((h) => h.caso === "R-02")!;
    assert.equal(r02.responsable, "TecnicoAerosanidad");
    assert.ok(!r02.error.includes("\u001b"));
    assert.equal(r02.archivo, "specs/smoke/aislamiento.spec.ts");
  });
});

describe("issues", () => {
  const { hallazgos } = analizarReporte(reporte, R);
  const h = hallazgos.find((x) => x.caso === "O-02")!;

  it("la huella es estable y va como marca invisible en el cuerpo", () => {
    assert.equal(huellaDe("a", "b"), huellaDe("a", "b"));
    assert.notEqual(huellaDe("a", "b"), huellaDe("a", "c"));
    assert.ok(cuerpoIssue(h, { baseUrl: "https://x", fecha: "2026-11-07" }).startsWith(marcaDeHuella(h.huella)));
  });

  it("marca lo inestable en el título y trae el comando para reproducir", () => {
    assert.match(tituloIssue(h), /^\[E2E\] \(inestable\) O-02/);
    assert.match(cuerpoIssue(h, { baseUrl: "https://x", fecha: "2026-11-07" }), /npx playwright test -g "O-02"/);
  });

  it("recorta el error largo", () => {
    assert.equal(errorLegible(Array.from({ length: 40 }, (_, i) => `l${i}`).join("\n"), 5).split("\n").length, 5);
  });

  it("el CSV escapa comillas y trae una fila por hallazgo", () => {
    const filas = informeCsv(hallazgos).split("\r\n");
    assert.equal(filas.length, hallazgos.length + 1);
    assert.match(filas[0], /^Caso,Prueba/);
  });
});
