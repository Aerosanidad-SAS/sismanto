/**
 * Del reporte JSON de Playwright a hallazgos con responsable. Sin E/S: lo usa `scripts/e2e-informe.ts`, que lee el
 * reporte, consulta GitHub y crea los issues. Aquí solo está lo que se puede probar.
 *
 * Un hallazgo es una prueba que falló (o que pasó solo al reintentar: «inestable»), unida a través de los proyectos
 * (escritorio, celular 390, celular 360). Su huella identifica el caso, no la ejecución: sirve para no abrir dos issues del
 * mismo fallo y para reabrir el viejo cuando vuelve a fallar.
 */
import { createHash } from "node:crypto";

export interface ReporteJson {
  config?: { projects?: { name: string }[] };
  suites?: SuiteJson[];
}
interface SuiteJson {
  title?: string;
  file?: string;
  suites?: SuiteJson[];
  specs?: SpecJson[];
}
interface SpecJson {
  title: string;
  file?: string;
  tests?: {
    projectName?: string;
    status?: "expected" | "unexpected" | "flaky" | "skipped";
    results?: { status?: string; error?: { message?: string }; errors?: { message?: string }[] }[];
  }[];
}

export type Gravedad = "falla" | "inestable";

export interface Hallazgo {
  huella: string;
  /** ID del caso del plan (`R-02`, `O-33`, `A3`…) o null si el título no lo trae. */
  caso: string | null;
  titulo: string;
  archivo: string;
  proyectos: string[];
  gravedad: Gravedad;
  error: string;
  responsable: string;
  area: string;
}

export interface Resumen {
  total: number;
  pasaron: number;
  fallaron: number;
  inestables: number;
  omitidas: number;
}

export interface Responsables {
  /** Letra(s) del ID del caso → usuario de GitHub. `R-02` usa la clave «R»; `A3`, la «A». */
  porPrefijo: Record<string, string>;
  /** Quien recibe lo que no tiene ID de caso o cuyo prefijo no está en el mapa. */
  porDefecto: string;
}

/** Etiqueta de área por prefijo, para filtrar los issues. */
const AREA_POR_PREFIJO: Record<string, string> = {
  R: "regulacion",
  O: "ovem",
  X: "cruce-regulacion-ovem",
  A: "acceso",
  G: "general",
};

const RE_ANSI = /\u001b\[[0-9;]*m/g;
const RE_CASO = /^\s*([A-Z]{1,2})(-?)(\d+)\b/;

export function casoDeTitulo(titulo: string): string | null {
  const m = titulo.match(RE_CASO);
  return m ? `${m[1]}${m[2]}${m[3]}` : null;
}

export function huellaDe(archivo: string, titulo: string): string {
  return createHash("sha1").update(`${archivo}\n${titulo}`).digest("hex").slice(0, 10);
}

/** Primeras líneas del error, sin colores de terminal, para que el issue sea legible. */
export function errorLegible(mensaje: string | undefined, maxLineas = 14): string {
  const lineas = (mensaje ?? "sin mensaje de error").replace(RE_ANSI, "").split(/\r?\n/).map((l) => l.trimEnd());
  return lineas.slice(0, maxLineas).join("\n").trim();
}

export function responsableDe(caso: string | null, r: Responsables): { responsable: string; area: string } {
  const prefijo = caso?.match(/^[A-Z]+/)?.[0] ?? "";
  return {
    responsable: r.porPrefijo[prefijo] ?? r.porDefecto,
    area: AREA_POR_PREFIJO[prefijo] ?? "sin-clasificar",
  };
}

function* especificaciones(suites: SuiteJson[] | undefined, archivo = ""): Generator<SpecJson & { file: string }> {
  for (const s of suites ?? []) {
    const f = s.file ?? archivo;
    for (const spec of s.specs ?? []) yield { ...spec, file: spec.file ?? f };
    yield* especificaciones(s.suites, f);
  }
}

export function analizarReporte(reporte: ReporteJson, responsables: Responsables): { hallazgos: Hallazgo[]; resumen: Resumen } {
  const resumen: Resumen = { total: 0, pasaron: 0, fallaron: 0, inestables: 0, omitidas: 0 };
  const porHuella = new Map<string, Hallazgo>();

  for (const spec of especificaciones(reporte.suites)) {
    for (const t of spec.tests ?? []) {
      resumen.total++;
      if (t.status === "expected") resumen.pasaron++;
      else if (t.status === "skipped") resumen.omitidas++;
      if (t.status !== "unexpected" && t.status !== "flaky") continue;

      const gravedad: Gravedad = t.status === "unexpected" ? "falla" : "inestable";
      if (gravedad === "falla") resumen.fallaron++;
      else resumen.inestables++;

      const huella = huellaDe(spec.file, spec.title);
      const proyecto = t.projectName ?? "—";
      const previo = porHuella.get(huella);
      if (previo) {
        if (!previo.proyectos.includes(proyecto)) previo.proyectos.push(proyecto);
        if (gravedad === "falla") previo.gravedad = "falla";
        continue;
      }
      const fallido = (t.results ?? []).find((r) => r.status !== "passed" && r.status !== "skipped");
      const caso = casoDeTitulo(spec.title);
      porHuella.set(huella, {
        huella,
        caso,
        titulo: spec.title,
        archivo: spec.file,
        proyectos: [proyecto],
        gravedad,
        error: errorLegible(fallido?.error?.message ?? fallido?.errors?.[0]?.message),
        ...responsableDe(caso, responsables),
      });
    }
  }
  const orden = (h: Hallazgo) => (h.gravedad === "falla" ? 0 : 1);
  return { hallazgos: [...porHuella.values()].sort((a, b) => orden(a) - orden(b) || a.titulo.localeCompare(b.titulo)), resumen };
}

export const marcaDeHuella = (huella: string) => `<!-- e2e:${huella} -->`;

export function tituloIssue(h: Hallazgo): string {
  return `[E2E] ${h.gravedad === "inestable" ? "(inestable) " : ""}${h.titulo}`;
}

export function cuerpoIssue(h: Hallazgo, ctx: { baseUrl: string; fecha: string }): string {
  const filtro = h.caso ?? h.titulo.slice(0, 40);
  return [
    marcaDeHuella(h.huella),
    `**Prueba:** ${h.titulo}`,
    `**Archivo:** \`${h.archivo}\``,
    `**Proyectos:** ${h.proyectos.join(", ")}`,
    `**Entorno:** ${ctx.baseUrl} · **Fecha:** ${ctx.fecha}`,
    `**Gravedad:** ${h.gravedad === "falla" ? "falló" : "inestable (pasó solo al reintentar)"}`,
    "",
    "### Error",
    "```",
    h.error,
    "```",
    "",
    "### Cómo reproducirlo",
    "```powershell",
    `npx playwright test -g "${filtro}"`,
    "npm run e2e:report   # captura y traza de lo que falló",
    "```",
    "",
    "_Generado desde el reporte de Playwright. Si el comportamiento es el correcto y la prueba está desactualizada, corrige la prueba y cierra el issue._",
  ].join("\n");
}

export function informeMarkdown(hallazgos: Hallazgo[], resumen: Resumen, ctx: { baseUrl: string; fecha: string }): string {
  const filas = hallazgos.map(
    (h) => `| ${h.caso ?? "—"} | ${h.titulo.replace(/\|/g, "\\|")} | ${h.proyectos.join(", ")} | ${h.gravedad} | ${h.responsable} |`
  );
  return [
    `# Informe E2E · ${ctx.fecha}`,
    "",
    `Entorno: ${ctx.baseUrl}`,
    "",
    `- Pruebas: **${resumen.total}** · pasaron **${resumen.pasaron}** · fallaron **${resumen.fallaron}** · inestables **${resumen.inestables}** · omitidas **${resumen.omitidas}** (rol sin credenciales)`,
    "",
    hallazgos.length === 0 ? "Sin hallazgos." : ["| Caso | Prueba | Proyectos | Gravedad | Responsable |", "|---|---|---|---|---|", ...filas].join("\n"),
    "",
  ].join("\n");
}

const csv = (v: string) => `"${v.replace(/"/g, '""')}"`;

/** Para quien prefiera verlo en una hoja: es una foto del informe, no el lugar donde se sigue el trabajo (eso son los issues). */
export function informeCsv(hallazgos: Hallazgo[]): string {
  const filas = hallazgos.map((h) => [h.caso ?? "", h.titulo, h.proyectos.join(" / "), h.gravedad, h.responsable, h.area, h.archivo].map(csv).join(","));
  return ["Caso,Prueba,Proyectos,Gravedad,Responsable,Área,Archivo", ...filas].join("\r\n");
}
