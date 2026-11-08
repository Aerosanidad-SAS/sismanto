/**
 * Convierte el reporte JSON de Playwright en un informe y en issues de GitHub asignados.
 *
 *   npm run e2e:smoke                    # genera e2e-results/results.json
 *   npm run e2e:informe                  # simulación: escribe el informe y muestra qué haría
 *   npm run e2e:informe -- --crear       # crea los issues (y reabre los que vuelven a fallar)
 *
 * Responsable por prefijo del caso (R-02 → «R»): e2e/responsables.json. Un fallo ya registrado no se duplica: cada issue
 * lleva una marca con la huella de la prueba. Requiere `gh` con sesión iniciada solo para --crear.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { hoyBogota } from "../src/lib/fechas";
import {
  analizarReporte,
  cuerpoIssue,
  informeCsv,
  informeMarkdown,
  marcaDeHuella,
  tituloIssue,
  type ReporteJson,
  type Responsables,
} from "../src/lib/e2e-informe";

const REPO = "Aerosanidad-SAS/sismanto";
const REPORTE = "e2e-results/results.json";
const crear = process.argv.includes("--crear");

if (!existsSync(REPORTE)) {
  console.error(`No existe ${REPORTE}. Corre antes las pruebas (npm run e2e:smoke).`);
  process.exit(1);
}

const responsables = JSON.parse(readFileSync("e2e/responsables.json", "utf-8")) as Responsables;
const reporte = JSON.parse(readFileSync(REPORTE, "utf-8")) as ReporteJson;
const ctx = { baseUrl: process.env.E2E_BASE_URL ?? "http://localhost:3000", fecha: hoyBogota() };
const { hallazgos, resumen } = analizarReporte(reporte, responsables);

mkdirSync("e2e-results", { recursive: true });
writeFileSync("e2e-results/informe.md", informeMarkdown(hallazgos, resumen, ctx));
writeFileSync("e2e-results/informe.csv", `﻿${informeCsv(hallazgos)}`); // BOM: Excel lee bien las tildes
console.log(`Pruebas ${resumen.total} · pasaron ${resumen.pasaron} · fallaron ${resumen.fallaron} · inestables ${resumen.inestables} · omitidas ${resumen.omitidas}`);
console.log("Informe: e2e-results/informe.md y e2e-results/informe.csv\n");

const gh = (args: string[], input?: string) => execFileSync("gh", ["--repo", REPO, ...args], { encoding: "utf-8", input });

interface Existente {
  number: number;
  state: string;
  body: string;
}
let existentes: Existente[] = [];
try {
  existentes = JSON.parse(gh(["issue", "list", "--label", "e2e", "--state", "all", "--limit", "500", "--json", "number,state,body"])) as Existente[];
} catch {
  console.log("(no se pudieron leer los issues existentes: sin `gh` o sin sesión; se muestra todo como nuevo)\n");
}
const buscar = (huella: string) => existentes.find((i) => i.body.includes(marcaDeHuella(huella)));

if (crear) {
  gh(["label", "create", "e2e", "--color", "5319e7", "--description", "Hallazgo de las pruebas E2E", "--force"]);
}

for (const h of hallazgos) {
  const previo = buscar(h.huella);
  const etiqueta = `${h.caso ?? "—"} → ${h.responsable}`;
  if (previo?.state === "OPEN") {
    console.log(`= ya existe #${previo.number}  ${etiqueta}  ${h.titulo}`);
  } else if (previo) {
    console.log(`↺ reabrir #${previo.number}  ${etiqueta}  ${h.titulo}`);
    if (crear) {
      gh(["issue", "reopen", String(previo.number)]);
      gh(["issue", "comment", String(previo.number), "--body-file", "-"], `Vuelve a fallar (${ctx.fecha}, ${ctx.baseUrl}).\n\n\`\`\`\n${h.error}\n\`\`\``);
    }
  } else {
    console.log(`+ crear  ${etiqueta}  [${h.area}] ${h.titulo}`);
    if (crear) {
      gh(["label", "create", `area:${h.area}`, "--color", "c5def5", "--force"]);
      const url = gh([
        "issue", "create",
        "--title", tituloIssue(h),
        "--body-file", "-",
        "--label", "e2e",
        "--label", `area:${h.area}`,
        "--assignee", h.responsable,
      ], cuerpoIssue(h, ctx)).trim();
      console.log(`    ${url}`);
    }
  }
}
if (!crear && hallazgos.length > 0) console.log("\nSimulación: nada se creó. Repite con -- --crear para abrir los issues.");
