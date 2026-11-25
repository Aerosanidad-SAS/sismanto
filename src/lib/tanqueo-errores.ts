// Errores del formulario de tanqueo del OVEM, escritos para mostrarlos junto a cada campo. Mismo criterio que
// `ovemFuelLogSchema` (el servidor sigue siendo quien manda): aquí solo se evita que el conductor vea el aviso del navegador
// —que depende del idioma del teléfono y desaparece— o nada, y se le dice qué falta.
import { KM_MAXIMO, parseKilometraje, parseNumeroDecimal } from "@/lib/ovem-portal";

export interface DatosTanqueo {
  fecha: string;
  km: string;
  galones: string;
  costo: string;
}

export type ErroresTanqueo = Partial<Record<keyof DatosTanqueo, string>>;

/** Mensaje por campo con error; objeto vacío = se puede enviar. `hoy` es el día de hoy en Bogotá (YYYY-MM-DD). */
export function erroresTanqueo(d: DatosTanqueo, hoy: string): ErroresTanqueo {
  const e: ErroresTanqueo = {};

  if (!d.fecha) e.fecha = "Selecciona la fecha del tanqueo.";
  else if (d.fecha > hoy) e.fecha = "La fecha del tanqueo no puede ser futura.";

  if (!d.km.trim()) e.km = "Ingresa el kilometraje del tablero.";
  else {
    const km = parseKilometraje(d.km);
    if (km === undefined) e.km = "El kilometraje debe ser un número, por ejemplo 125000.";
    else if (km <= 0) e.km = "El kilometraje debe ser mayor a cero.";
    else if (km > KM_MAXIMO) e.km = "El kilometraje es demasiado alto: revisa el número del tablero.";
  }

  if (!d.galones.trim()) e.galones = "Ingresa los galones.";
  else {
    const galones = parseNumeroDecimal(d.galones);
    if (galones === undefined) e.galones = "Los galones deben ser un número, por ejemplo 12,5.";
    else if (galones <= 0) e.galones = "Los galones deben ser mayores a cero.";
    else if (galones > 100) e.galones = "Revisa los galones: más de 100 no cabe en un tanque.";
  }

  if (d.costo.trim()) {
    const costo = parseNumeroDecimal(d.costo);
    if (costo === undefined) e.costo = "El valor pagado debe ser un número, o déjalo vacío.";
    else if (costo < 0) e.costo = "El valor pagado no puede ser negativo.";
  }

  return e;
}
