import { ZONA_NEGOCIO, esDia, formatoDia } from "@/lib/fechas";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateadores
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Un DÍA de la base ("2024-03-22", columnas DATE) se muestra tal cual, sin pasar por ninguna zona horaria: antes
 * `new Date("2024-03-22")` (medianoche UTC) se formateaba en la zona del navegador y en Colombia salía "21". Un
 * instante (timestamptz) se muestra en hora de Colombia. Ver fechas.ts.
 */
export function formatDate(date: string | Date): string {
  if (typeof date === 'string' && esDia(date)) return formatoDia(date, 'largo');
  return new Date(date).toLocaleDateString('es-CO', {
    timeZone: ZONA_NEGOCIO,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  if (typeof date === 'string' && esDia(date)) return formatoDia(date);
  return new Date(date).toLocaleDateString('es-CO', {
    timeZone: ZONA_NEGOCIO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value);
}
