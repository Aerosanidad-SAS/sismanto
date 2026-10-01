import { diasEntre, esDia, formatoDia, type Dia } from "@/lib/fechas";

/**
 * Motor de alertas del preoperacional: convierte lo que el OVEM marca (ítems en FALLA) y lo que dice la ficha del
 * vehículo (SOAT y técnico-mecánica) en hallazgos con severidad, y los hallazgos en novedades. Una CRÍTICA saca el
 * vehículo de servicio (la novedad lleva `afecta_operatividad` y el trigger de la base lo pasa a FDS); las demás
 * quedan como novedad abierta para Regulación y Mantenimiento. Todo es puro: la escritura vive en
 * `preoperacional-hallazgos.ts`.
 *
 * La severidad de cada ítem NO está aquí: viene de `checklist_items.severidad_falla` (editable, ver migración 094).
 */

export type SeveridadFalla = "CRITICA" | "ALTA" | "MEDIA" | "BAJA";

export interface ItemEvaluado {
  descripcion: string;
  estado: "OK" | "FALLA" | "NO_APLICA";
  observacion?: string | null;
  severidadFalla?: SeveridadFalla | null;
}

export interface VehiculoDocumentos {
  vencimiento_soat?: string | null;
  vencimiento_tecnicomecanica?: string | null;
  vencimiento_rtm?: string | null;
}

export interface Hallazgo {
  severidad: SeveridadFalla;
  titulo: string;
  detalle: string;
  /** Saca el vehículo de servicio. */
  fds: boolean;
  origen: "ITEM" | "DOCUMENTO";
}

export interface NovedadPropuesta {
  descripcion: string;
  /** El enum de `incidents.severidad` solo tiene BAJA, MEDIA y ALTA: una crítica entra como ALTA + afecta_operatividad. */
  severidad: "BAJA" | "MEDIA" | "ALTA";
  afectaOperatividad: boolean;
}

export const PREFIJO_NOVEDAD = "[Preoperacional]";

const ORDEN: Record<SeveridadFalla, number> = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAJA: 3 };

function hallazgoDocumento(nombre: "SOAT" | "Técnico-mecánica", fecha: string | null | undefined, hoy: Dia): Hallazgo | null {
  const f = fecha?.slice(0, 10);
  if (!f || !esDia(f)) {
    // Dato faltante: no se saca de servicio por ignorancia de la ficha (hay hojas de vida incompletas), pero se avisa.
    return { severidad: "ALTA", titulo: `${nombre}: sin fecha de vencimiento registrada`, detalle: "Completa la hoja de vida del vehículo.", fds: false, origen: "DOCUMENTO" };
  }
  if (diasEntre(hoy, f) < 0) {
    return { severidad: "CRITICA", titulo: `${nombre} vencido`, detalle: `Venció el ${formatoDia(f)}.`, fds: true, origen: "DOCUMENTO" };
  }
  return null;
}

/** Hallazgos de un preoperacional, de más a menos grave. */
export function hallazgosPreoperacional(items: ItemEvaluado[], vehiculo: VehiculoDocumentos, hoy: Dia): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];

  for (const it of items) {
    if (it.estado !== "FALLA") continue;
    const severidad = it.severidadFalla ?? "MEDIA";
    hallazgos.push({ severidad, titulo: it.descripcion, detalle: it.observacion?.trim() ?? "", fds: severidad === "CRITICA", origen: "ITEM" });
  }

  const soat = hallazgoDocumento("SOAT", vehiculo.vencimiento_soat, hoy);
  if (soat) hallazgos.push(soat);
  const rtm = hallazgoDocumento("Técnico-mecánica", vehiculo.vencimiento_tecnicomecanica || vehiculo.vencimiento_rtm, hoy);
  if (rtm) hallazgos.push(rtm);

  return hallazgos.sort((a, b) => ORDEN[a.severidad] - ORDEN[b.severidad]);
}

/**
 * Novedades a abrir: una por cada hallazgo CRÍTICO (cada una saca el vehículo de servicio y se ve por separado) y una
 * sola consolidada para el resto, para no inundar el tablero de Regulación con una novedad por ítem.
 */
export function novedadesDeHallazgos(hallazgos: Hallazgo[], hoy: Dia): NovedadPropuesta[] {
  const novedades: NovedadPropuesta[] = [];

  for (const h of hallazgos.filter((x) => x.severidad === "CRITICA")) {
    novedades.push({
      descripcion: `${PREFIJO_NOVEDAD} CRÍTICO: ${h.titulo}${h.detalle ? ` — ${h.detalle}` : ""}`,
      severidad: "ALTA",
      afectaOperatividad: true,
    });
  }

  const resto = hallazgos.filter((x) => x.severidad !== "CRITICA");
  if (resto.length > 0) {
    const hayAlta = resto.some((x) => x.severidad === "ALTA");
    const soloBaja = resto.every((x) => x.severidad === "BAJA");
    novedades.push({
      descripcion: `${PREFIJO_NOVEDAD} Hallazgos del ${formatoDia(hoy)}: ${resto.map((h) => (h.detalle ? `${h.titulo} (${h.detalle})` : h.titulo)).join("; ")}`,
      severidad: hayAlta ? "ALTA" : soloBaja ? "BAJA" : "MEDIA",
      afectaOperatividad: false,
    });
  }
  return novedades;
}

export interface ResumenHallazgos {
  criticos: number;
  otros: number;
  /** Texto para mostrar al OVEM al terminar. */
  mensaje: string | null;
}

export function resumirHallazgos(hallazgos: Hallazgo[]): ResumenHallazgos {
  const criticos = hallazgos.filter((h) => h.severidad === "CRITICA").length;
  const otros = hallazgos.length - criticos;
  if (hallazgos.length === 0) return { criticos, otros, mensaje: null };
  const partes: string[] = [];
  if (criticos > 0) partes.push(`${criticos} hallazgo${criticos === 1 ? "" : "s"} crítico${criticos === 1 ? "" : "s"}: el vehículo queda FUERA DE SERVICIO y se avisó a Regulación y Mantenimiento`);
  if (otros > 0) partes.push(`${otros} hallazgo${otros === 1 ? "" : "s"} reportado${otros === 1 ? "" : "s"} como novedad`);
  return { criticos, otros, mensaje: partes.join(". ") + "." };
}
