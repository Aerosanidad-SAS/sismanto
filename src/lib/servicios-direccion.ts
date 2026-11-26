// Dirección que debe tener un servicio para poder despacharse. Puro, para probarlo sin base de datos.
//
// Decisión de Daniel (#343, opción recomendada): un servicio SE PUEDE GUARDAR sin dirección (Regulación la completa
// después), con aviso visible, pero NO se despacha —pasar a CURSO o asignarle un OVEM— sin ella: en el celular del OVEM
// el origen salía «Medellín» a secas y no sabía adónde ir.
//  · TAB y TAM: dirección y ciudad de origen y de destino.
//  · Medicina domiciliaria: la dirección del domicilio (la domiciliaria va directo al domicilio, que la tripulación graba
//    como destino; se acepta en origen o en destino, igual que `servicios-finalizar.ts`).
//  · Telemedicina y traslado aéreo: no se exige (no hay ruta terrestre que seguir).
// Los servicios históricos sin dirección no se tocan: solo se exige al despachar, y solo si el cambio es nuevo.

import { perfilFormularioServicio } from "@/lib/validations";

export interface DatosDireccion {
  direccion_origen?: string | null;
  ciudad_origen?: string | null;
  direccion_destino?: string | null;
  ciudad_destino?: string | null;
}

export type CampoDireccion = keyof DatosDireccion;
export interface FaltaDireccion {
  campo: CampoDireccion;
  /** Para el resumen y el aviso: «dirección de origen». */
  etiqueta: string;
  /** Para mostrar junto al campo. */
  mensaje: string;
}

const TIPOS_TAB_TAM = ["TAB SIMPLE", "TAB DOBLE", "TAB SENCILLO", "TAM SIMPLE", "TAM DOBLE"];

const tiene = (v: string | null | undefined) => typeof v === "string" && v.trim() !== "";

const falta = (campo: CampoDireccion, etiqueta: string, verbo: "Escribe" | "Selecciona"): FaltaDireccion => ({
  campo,
  etiqueta,
  mensaje: `${verbo} la ${etiqueta} para despachar el servicio.`,
});

/** Lo que le falta de dirección a un servicio según su tipo (no mira si se va a despachar). Vacío = completo. */
export function direccionesFaltantes(tipoServicio: string | null | undefined, datos: DatosDireccion): FaltaDireccion[] {
  const tipo = (tipoServicio ?? "").trim().toUpperCase();
  if (TIPOS_TAB_TAM.includes(tipo)) {
    const faltas: FaltaDireccion[] = [];
    if (!tiene(datos.direccion_origen)) faltas.push(falta("direccion_origen", "dirección de origen", "Escribe"));
    if (!tiene(datos.ciudad_origen)) faltas.push(falta("ciudad_origen", "ciudad de origen", "Selecciona"));
    if (!tiene(datos.direccion_destino)) faltas.push(falta("direccion_destino", "dirección de destino", "Escribe"));
    if (!tiene(datos.ciudad_destino)) faltas.push(falta("ciudad_destino", "ciudad de destino", "Selecciona"));
    return faltas;
  }
  if (perfilFormularioServicio(tipo) === "MEDICINA_DOMICILIARIA") {
    return tiene(datos.direccion_origen) || tiene(datos.direccion_destino)
      ? []
      : [falta("direccion_destino", "dirección del domicilio", "Escribe")];
  }
  return [];
}

export interface CambioDespacho {
  etapaAntes?: string | null;
  etapaDespues: string;
  ovemAntes?: string | null;
  ovemDespues?: string | null;
}

/**
 * ¿Este guardado despacha el servicio? Pasar a CURSO o dejar un OVEM distinto del que ya tenía.
 * Devolver un FINALIZADO a CURSO no despacha: es volver atrás sobre un servicio que ya salió (corrección del ADMIN).
 */
export function seDespacha(c: CambioDespacho): boolean {
  const pasaACurso = c.etapaDespues === "CURSO" && c.etapaAntes !== "CURSO" && c.etapaAntes !== "FINALIZADO";
  const ovemNuevo = tiene(c.ovemDespues) && c.ovemDespues !== (c.ovemAntes ?? "");
  return pasaACurso || ovemNuevo;
}

/** Lo que impide despachar con este cambio. Vacío = se puede guardar. */
export function faltasParaDespachar(
  tipoServicio: string | null | undefined,
  datos: DatosDireccion,
  cambio: CambioDespacho
): FaltaDireccion[] {
  return seDespacha(cambio) ? direccionesFaltantes(tipoServicio, datos) : [];
}

/** Mensaje con el que el servidor rechaza un despacho sin dirección; null si se puede guardar. */
export function errorDeDespacho(
  tipoServicio: string | null | undefined,
  datos: DatosDireccion,
  cambio: CambioDespacho
): string | null {
  const faltas = faltasParaDespachar(tipoServicio, datos, cambio);
  if (faltas.length === 0) return null;
  return `Falta: ${faltas.map((f) => f.etiqueta).join(", ")}. Sin eso no se puede asignar un OVEM ni pasar el servicio a CURSO: edítalo y complétalo.`;
}
