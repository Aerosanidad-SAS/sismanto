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
  /**
   * Prefijo estable de la descripción (no lleva fecha ni detalle): identifica el hallazgo para no abrirlo otra vez
   * mientras haya una novedad abierta con la misma clave.
   */
  clave: string;
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
 * Una novedad por hallazgo, con una clave estable: si el bombillo sigue quemado mañana, el preoperacional de mañana
 * NO abre otra novedad; la primera basta hasta que se cierre (el mantenimiento que lo resuelve). La clave no lleva la
 * fecha ni lo que escribió el OVEM, por eso coincide día tras día.
 */
export function novedadesDeHallazgos(hallazgos: Hallazgo[], _hoy: Dia): NovedadPropuesta[] {
  return hallazgos.map((h) => {
    const critico = h.severidad === "CRITICA";
    const clave = `${PREFIJO_NOVEDAD} ${critico ? "CRÍTICO: " : ""}${h.titulo}`;
    return {
      clave,
      descripcion: h.detalle ? `${clave} — ${h.detalle}` : clave,
      severidad: critico || h.severidad === "ALTA" ? "ALTA" : h.severidad === "BAJA" ? "BAJA" : "MEDIA",
      afectaOperatividad: critico,
    };
  });
}

export interface ResumenHallazgos {
  criticos: number;
  otros: number;
  /** Texto para mostrar al OVEM al terminar. */
  mensaje: string | null;
}

/** Qué pasó con el aviso inmediato por correo de los críticos: salió, no pudo salir, o no hubo uno nuevo (ya estaba reportado). */
export type EstadoAviso = "ENVIADO" | "FALLO" | "YA_REPORTADO";

export function resumirHallazgos(hallazgos: Hallazgo[], aviso: EstadoAviso = "ENVIADO"): ResumenHallazgos {
  const criticos = hallazgos.filter((h) => h.severidad === "CRITICA").length;
  const otros = hallazgos.length - criticos;
  if (hallazgos.length === 0) return { criticos, otros, mensaje: null };
  const partes: string[] = [];
  if (criticos > 0) {
    const n = `${criticos} hallazgo${criticos === 1 ? "" : "s"} crítico${criticos === 1 ? "" : "s"}`;
    if (aviso === "FALLO") partes.push(`${n}: el vehículo queda FUERA DE SERVICIO. El aviso por correo NO se pudo enviar: llama ya a Regulación y no operes el vehículo`);
    else if (aviso === "YA_REPORTADO") partes.push(`${n}: el vehículo sigue FUERA DE SERVICIO (ya estaba reportado). No lo operes`);
    else partes.push(`${n}: el vehículo queda FUERA DE SERVICIO y se avisó a Regulación y Mantenimiento`);
  }
  if (otros > 0) partes.push(`${otros} hallazgo${otros === 1 ? "" : "s"} reportado${otros === 1 ? "" : "s"} como novedad`);
  return { criticos, otros, mensaje: partes.join(". ") + "." };
}
