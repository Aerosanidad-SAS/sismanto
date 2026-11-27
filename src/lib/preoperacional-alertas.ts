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
  /** Equipo contado que no está completo: es un faltante (novedad leve), nunca una falla ni motivo de FDS. */
  faltante?: { hay: number; esperadas: number };
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

/**
 * Hallazgos de un preoperacional, de más a menos grave. `sinDocumentos` omite SOAT y técnico-mecánica: se usa cuando la
 * ficha del vehículo no se pudo leer, para no inventar un «sin fecha de vencimiento» que no es verdad.
 */
export function hallazgosPreoperacional(
  items: ItemEvaluado[],
  vehiculo: VehiculoDocumentos,
  hoy: Dia,
  opciones: { sinDocumentos?: boolean } = {}
): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];

  for (const it of items) {
    if (it.faltante) {
      hallazgos.push({
        severidad: "BAJA",
        titulo: `Faltante: ${it.descripcion}`,
        detalle: `Hay ${it.faltante.hay} de ${it.faltante.esperadas}.`,
        fds: false,
        origen: "ITEM",
      });
      continue;
    }
    if (it.estado !== "FALLA") continue;
    const severidad = it.severidadFalla ?? "MEDIA";
    hallazgos.push({ severidad, titulo: it.descripcion, detalle: it.observacion?.trim() ?? "", fds: severidad === "CRITICA", origen: "ITEM" });
  }

  if (!opciones.sinDocumentos) {
    const soat = hallazgoDocumento("SOAT", vehiculo.vencimiento_soat, hoy);
    if (soat) hallazgos.push(soat);
    const rtm = hallazgoDocumento("Técnico-mecánica", vehiculo.vencimiento_tecnicomecanica || vehiculo.vencimiento_rtm, hoy);
    if (rtm) hallazgos.push(rtm);
  }

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
  /** Algo de lo que el OVEM marcó (o de lo que el sistema debía revisar) no quedó completo para Regulación. */
  registroIncompleto: boolean;
}

/** Qué pasó con el aviso inmediato por correo de los críticos: salió, no pudo salir, o no hubo uno nuevo (ya estaba reportado). */
export type EstadoAviso = "ENVIADO" | "FALLO" | "YA_REPORTADO";

/** Lo que NO se pudo hacer al registrar los hallazgos (falló el insert de la novedad, la lectura de la ficha, o el motor entero). */
export interface HallazgosNoRegistrados {
  criticos: number;
  otros: number;
  /** No se pudo leer la ficha del vehículo: el SOAT y la técnico-mecánica no se revisaron. */
  documentosSinEvaluar?: boolean;
}

const s = (n: number) => (n === 1 ? "" : "s");
const sePudo = (n: number) => (n === 1 ? "se pudo" : "se pudieron");

export function resumirHallazgos(hallazgos: Hallazgo[], aviso: EstadoAviso = "ENVIADO", noRegistrados?: HallazgosNoRegistrados): ResumenHallazgos {
  const criticos = hallazgos.filter((h) => h.severidad === "CRITICA").length;
  const otros = hallazgos.length - criticos;
  const fallanCriticos = Math.min(noRegistrados?.criticos ?? 0, criticos);
  const fallanOtros = Math.min(noRegistrados?.otros ?? 0, otros);
  const documentosSinEvaluar = noRegistrados?.documentosSinEvaluar === true;
  const registroIncompleto = fallanCriticos + fallanOtros > 0 || documentosSinEvaluar;
  if (hallazgos.length === 0 && !documentosSinEvaluar) return { criticos, otros, mensaje: null, registroIncompleto: false };

  const partes: string[] = [];
  if (criticos > 0) {
    const n = `${criticos} hallazgo${s(criticos)} crítico${s(criticos)}`;
    if (fallanCriticos === criticos) {
      // Sin la novedad crítica el trigger de la base no saca el vehículo de servicio: el sistema puede seguir mostrándolo operativo.
      partes.push(`${n}: NO ${sePudo(criticos)} registrar en el sistema y el vehículo puede seguir como OPERATIVO. No lo operes y llama ya a Regulación`);
    } else if (fallanCriticos > 0) {
      // Los que sí quedaron registrados ya sacaron el vehículo de servicio; aun así hay que avisar de los que faltan.
      partes.push(`${n}: ${fallanCriticos} NO ${sePudo(fallanCriticos)} registrar en el sistema; los demás sí. No operes el vehículo y llama ya a Regulación`);
    } else if (aviso === "FALLO") {
      partes.push(`${n}: el vehículo queda FUERA DE SERVICIO. El aviso por correo NO se pudo enviar: llama ya a Regulación y no operes el vehículo`);
    } else if (aviso === "YA_REPORTADO") {
      partes.push(`${n}: el vehículo sigue FUERA DE SERVICIO (ya estaba reportado). No lo operes`);
    } else {
      partes.push(`${n}: el vehículo queda FUERA DE SERVICIO y se avisó a Regulación y Mantenimiento`);
    }
  }
  if (otros > 0) {
    const guardados = otros - fallanOtros;
    if (fallanOtros > 0) {
      partes.push(`${fallanOtros} hallazgo${s(fallanOtros)} no crítico${s(fallanOtros)} NO ${sePudo(fallanOtros)} registrar como novedad: avisa a Regulación`);
      if (guardados > 0) partes.push(`${guardados} hallazgo${s(guardados)} reportado${s(guardados)} como novedad`);
    } else {
      partes.push(`${otros} hallazgo${s(otros)} reportado${s(otros)} como novedad`);
    }
  }
  if (documentosSinEvaluar) partes.push("No se pudieron revisar el SOAT ni la técnico-mecánica del vehículo: pregunta a Regulación si están al día");
  // Reenviar es seguro: el motor no duplica las novedades que ya están abiertas y reintenta solo las que faltan. El botón se
  // llama así una vez enviado el primer checklist (ovem-portal.tsx).
  if (registroIncompleto) partes.push("Para reintentar, toca «Revisar y actualizar» y envía el checklist de nuevo");
  return { criticos, otros, mensaje: partes.join(". ") + ".", registroIncompleto };
}

/**
 * Qué decirle al OVEM cuando el motor de hallazgos falló ENTERO y no se sabe qué alcanzó a guardarse: se arma con lo que
 * sí se puede saber (los ítems que marcó) y se avisa que los documentos del vehículo no se revisaron. Siempre devuelve un
 * aviso: aunque todos los ítems estén bien, el OVEM no debe leer «completado correctamente» sin que se haya revisado nada.
 */
export function resumenSiFallaElMotor(items: ItemEvaluado[], hoy: Dia): ResumenHallazgos {
  const deItems = hallazgosPreoperacional(items, {}, hoy, { sinDocumentos: true });
  const criticos = deItems.filter((h) => h.severidad === "CRITICA").length;
  return resumirHallazgos(deItems, "FALLO", { criticos, otros: deItems.length - criticos, documentosSinEvaluar: true });
}
