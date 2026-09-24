/** CSV mínimo para los ETL (bitácora). Mismo código que `etl-usuarios.ts` (PR #52): unificar cuando ambos estén en dev. */

export type Fila = Record<string, string>;

/** CSV con BOM (Excel lo abre bien) y celdas a prueba de fórmulas. */
export function aCsv(columnas: string[], filas: string[][]): string {
  const celda = (x: string) => {
    const seguro = /^[=+@\t\r-]/.test(x) ? `'${x}` : x;
    return `"${seguro.replace(/"/g, '""')}"`;
  };
  return "﻿" + [columnas, ...filas].map((f) => f.map(celda).join(",")).join("\n");
}

/** Parser CSV RFC 4180 (comillas, comas y saltos de línea embebidos). Encabezados en minúscula. */
export function parseCsv(texto: string): Fila[] {
  const contenido = texto.replace(/^﻿/, "");
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;
  for (let i = 0; i < contenido.length; i++) {
    const c = contenido[i];
    if (enComillas) {
      if (c === '"') {
        if (contenido[i + 1] === '"') { campo += '"'; i++; } else enComillas = false;
      } else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && contenido[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.some((x) => x !== "")) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo !== "" || fila.length > 0) { fila.push(campo); if (fila.some((x) => x !== "")) filas.push(fila); }
  if (filas.length === 0) return [];
  const enc = filas[0].map((h) => h.trim().toLowerCase());
  return filas.slice(1).map((f) => Object.fromEntries(enc.map((h, i) => [h, (f[i] ?? "").trim()])));
}
