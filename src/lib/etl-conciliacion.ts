// Conciliación de identificadores entre un CSV de SISRES y la base de SISMANTO (scripts/etl-conciliar.ts).
// Pura, para probarla. Solo maneja identificadores numéricos: nunca se guarda ni se muestra un dato de persona.

/**
 * Valores de una columna de un CSV (RFC 4180: comillas, comas y saltos de línea dentro de un campo; BOM al inicio).
 * Los encabezados no distinguen mayúsculas. Lanza si la columna no existe.
 */
export function extraerColumnaCsv(texto: string, columna: string): string[] {
  const contenido = texto.replace(/^﻿/, "");
  const objetivo = columna.trim().toLowerCase();
  const valores: string[] = [];
  let indice = -1; // posición de la columna buscada (se conoce al terminar el encabezado)
  let enEncabezado = true;
  let col = 0;
  let campo = "";
  let enComillas = false;
  let filaConDatos = false;
  let valorFila = "";

  const cerrarCampo = () => {
    if (enEncabezado) {
      if (campo.trim().toLowerCase() === objetivo && indice === -1) indice = col;
    } else if (col === indice) {
      valorFila = campo.trim();
    }
    if (campo !== "") filaConDatos = true;
    campo = "";
    col++;
  };
  const cerrarFila = () => {
    cerrarCampo();
    if (enEncabezado) {
      enEncabezado = false;
      if (indice === -1) throw new Error(`El CSV no tiene la columna «${columna}»`);
    } else if (filaConDatos) {
      // Una fila con datos cuenta aunque su identificador venga vacío (se contará como inválido); una fila en blanco no.
      valores.push(valorFila);
    }
    col = 0;
    filaConDatos = false;
    valorFila = "";
  };

  for (let i = 0; i < contenido.length; i++) {
    const c = contenido[i];
    if (enComillas) {
      if (c === '"') {
        if (contenido[i + 1] === '"') {
          campo += '"';
          i++;
        } else enComillas = false;
      } else campo += c;
    } else if (c === '"') enComillas = true;
    else if (c === ",") cerrarCampo();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && contenido[i + 1] === "\n") i++;
      cerrarFila();
    } else campo += c;
  }
  if (campo !== "" || col > 0) cerrarFila();
  if (enEncabezado) throw new Error(`El CSV no tiene la columna «${columna}»`);
  return valores;
}

export interface Conciliacion {
  /** Identificadores distintos válidos en el CSV. */
  enCsv: number;
  /** Cuántos identificadores aparecen repetidos en el CSV (filas de más). */
  repetidosEnCsv: number;
  /** Valores del CSV que no son un entero positivo (se ignoran). */
  invalidosEnCsv: number;
  enAmbos: number;
  /** Están en la base pero ya no en el CSV (se borraron en SISRES, o el CSV es más viejo). */
  soloEnBd: number[];
  /** Están en el CSV pero no en la base (todavía no se cargaron). */
  soloEnCsv: number[];
}

export function conciliar(valoresCsv: string[], idsBd: number[]): Conciliacion {
  const vistos = new Set<number>();
  let repetidos = 0;
  let invalidos = 0;
  for (const v of valoresCsv) {
    if (!/^[1-9]\d*$/.test(v)) {
      invalidos++;
      continue;
    }
    const n = Number(v);
    if (vistos.has(n)) repetidos++;
    else vistos.add(n);
  }
  const bd = new Set(idsBd);
  const soloEnBd = [...bd].filter((id) => !vistos.has(id)).sort((a, b) => a - b);
  const soloEnCsv = [...vistos].filter((id) => !bd.has(id)).sort((a, b) => a - b);
  return {
    enCsv: vistos.size,
    repetidosEnCsv: repetidos,
    invalidosEnCsv: invalidos,
    enAmbos: vistos.size - soloEnCsv.length,
    soloEnBd,
    soloEnCsv,
  };
}
