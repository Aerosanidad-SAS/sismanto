// Destinatarios de los avisos de vencimiento del inventario por área (migración 095), portado de
// includes/inventarioNotificacionConfig.php de SISRES. Puro: lo usan el cron, la acción y la pantalla.

export const AREAS_INVENTARIO = [
  { area: "BIOMEDICA", etiqueta: "Biomédica", sinCorreos: "Se avisa a los usuarios Administrador, Mantenimiento y Coordinación." },
  { area: "SISTEMAS", etiqueta: "Sistemas", sinCorreos: "No se envía ningún aviso." },
] as const;
export type AreaInventario = (typeof AREAS_INVENTARIO)[number]["area"];
export const MAX_CORREOS_AREA = 30;

export function esAreaInventario(v: string): v is AreaInventario {
  return AREAS_INVENTARIO.some((a) => a.area === v);
}

/** Área de un equipo según su columna `area`: SISTEMAS si lo dice (sin importar mayúsculas/espacios), si no BIOMÉDICA. */
export function areaDeEquipo(area: string | null | undefined): AreaInventario {
  return (area ?? "").trim().toUpperCase() === "SISTEMAS" ? "SISTEMAS" : "BIOMEDICA";
}

const CORREO = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/;

/**
 * Separa una lista escrita a mano (uno por línea, o separados por coma o punto y coma) en correos válidos, en
 * minúsculas y sin repetir, y los textos que no son correo.
 */
export function leerCorreos(texto: string): { validos: string[]; invalidos: string[] } {
  const validos: string[] = [];
  const invalidos: string[] = [];
  for (const parte of texto.split(/[\n,;]+/)) {
    const v = parte.trim().toLowerCase();
    if (!v) continue;
    if (!CORREO.test(v)) invalidos.push(parte.trim());
    else if (!validos.includes(v)) validos.push(v);
  }
  return { validos, invalidos };
}

/**
 * Destinatarios de un área: los correos configurados si hay; si no, los de respaldo (solo Biomédica tiene respaldo:
 * los roles operativos; Sistemas sin correos no avisa).
 */
export function destinatariosArea(area: AreaInventario, configurados: readonly string[] | undefined, respaldo: readonly string[]): string[] {
  if (configurados && configurados.length > 0) return [...configurados];
  return area === "BIOMEDICA" ? [...respaldo] : [];
}
