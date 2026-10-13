import { diasHasta } from "@/lib/vencimientos";

/** Días o menos para el vencimiento a partir de los cuales el preoperacional muestra una alerta en pantalla. */
export const UMBRAL_ALERTA_DIAS = 5;

export interface VigenciaDocumento {
  dias: number | null;
  nivel: "ok" | "alerta" | "vencido" | "sin_fecha";
  /** Texto corto para la fila: «Faltan 42 días», «Vence hoy», «Vencido hace 3 días». */
  texto: string;
}

const plural = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

/** Cuánto falta para el vencimiento de un documento (SOAT, técnico-mecánica…) y si merece alerta. */
export function vigenciaDocumento(fecha: string | null | undefined, hoy: string): VigenciaDocumento {
  if (!fecha) return { dias: null, nivel: "sin_fecha", texto: "Sin fecha registrada" };
  const dias = diasHasta(fecha, hoy);
  if (dias < 0) return { dias, nivel: "vencido", texto: `Vencido hace ${plural(Math.abs(dias))}` };
  if (dias === 0) return { dias, nivel: "vencido", texto: "Vence hoy" };
  if (dias <= UMBRAL_ALERTA_DIAS) return { dias, nivel: "alerta", texto: `Faltan ${plural(dias)}` };
  return { dias, nivel: "ok", texto: `Faltan ${plural(dias)}` };
}

/** El ítem del catálogo «Documentos (SOAT - Tecnicomecánica)» no se responde OK/Falla: se confirma leyendo los vencimientos. */
export function esItemDocumentos(descripcion: string): boolean {
  return /soat/i.test(descripcion);
}

/**
 * Qué piezas cubre un ítem que agrupa varias, para mostrarlo al lado del nombre.
 * shortcut: vive en código; pasar a una columna del catálogo si crece más allá de un par de ítems.
 */
const DETALLE_ITEM: Record<string, string> = {
  "luces internas": "Luz de cabina · luces de habitáculo · luz fría",
};

export function detalleItem(descripcion: string): string | null {
  return DETALLE_ITEM[descripcion.trim().toLowerCase()] ?? null;
}
