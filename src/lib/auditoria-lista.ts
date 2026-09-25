/**
 * Bitácora de auditoría (SISRES: mostrarLog.php, includes/registrarLog.php). Funciones puras: las usan la página,
 * la acción de lectura y el ayudante que escribe. Sin dependencias de servidor.
 */

export const ACCIONES_AUDITORIA = ["INSERTAR", "MODIFICAR", "ELIMINAR", "LOGIN", "LOGOUT", "NOTIFICAR", "ERROR", "EXPORTAR"] as const;
export type AccionAuditoria = (typeof ACCIONES_AUDITORIA)[number];

/** Módulos que registran hoy: alimenta el filtro "Módulo". Una entidad nueva funciona igual; solo falta añadirla aquí para filtrarla. */
export const ENTIDADES_AUDITORIA = [
  "servicios",
  "pacientes",
  "usuarios",
  "inventario",
  "campanas",
  "login",
  "valoraciones",
  "formatos_ti",
  "tickets",
  "captacion",
  "configuracion",
] as const;

export const AUDITORIA_POR_PAGINA = 50;
export const DETALLE_MAX = 500;

export interface FiltrosAuditoria {
  usuario: string;
  accion: string;
  entidad: string;
  desde: string;
  hasta: string;
  pagina: number;
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

function uno(params: Record<string, string | string[] | undefined>, k: string, max = 80): string {
  const x = params[k];
  return ((Array.isArray(x) ? x[0] : x) ?? "").trim().slice(0, max);
}

/** Lee los filtros de la URL descartando valores inválidos (acción fuera de la lista, fechas mal formadas, entidad rara). */
export function leerFiltrosAuditoria(params: Record<string, string | string[] | undefined>): FiltrosAuditoria {
  const accion = uno(params, "accion", 20).toUpperCase();
  const entidad = uno(params, "entidad", 50);
  const p = Number(uno(params, "pagina", 10));
  return {
    usuario: uno(params, "usuario", 100),
    accion: (ACCIONES_AUDITORIA as readonly string[]).includes(accion) ? accion : "",
    entidad: /^[a-z_]{1,50}$/.test(entidad) ? entidad : "",
    desde: FECHA.test(uno(params, "desde", 10)) ? uno(params, "desde", 10) : "",
    hasta: FECHA.test(uno(params, "hasta", 10)) ? uno(params, "hasta", 10) : "",
    pagina: Number.isInteger(p) && p > 0 ? p : 1,
  };
}

/**
 * Rango de una fecha (día en hora de Colombia, UTC-5 sin horario de verano) a instantes ISO: `desde` es el inicio de ese
 * día y `hastaExclusivo` es el inicio del día SIGUIENTE al de `hasta` (así el día `hasta` entra completo).
 */
export function rangoFechasColombia(desde: string, hasta: string): { desde: string | null; hastaExclusivo: string | null } {
  const inicio = FECHA.test(desde) ? new Date(`${desde}T00:00:00-05:00`) : null;
  let fin: Date | null = null;
  if (FECHA.test(hasta)) {
    fin = new Date(`${hasta}T00:00:00-05:00`);
    fin = new Date(fin.getTime() + 86400000);
  }
  return {
    desde: inicio && !Number.isNaN(inicio.getTime()) ? inicio.toISOString() : null,
    hastaExclusivo: fin && !Number.isNaN(fin.getTime()) ? fin.toISOString() : null,
  };
}

/** Quita caracteres de control, junta espacios y corta: el detalle es una línea corta, no un volcado. */
export function sanearTexto(s: string | null | undefined, max = DETALLE_MAX): string {
  // eslint-disable-next-line no-control-regex
  const limpio = (s ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return limpio.length > max ? `${limpio.slice(0, max - 1)}…` : limpio;
}

/**
 * Identificador de un intento de login fallido, enmascarado: sirve para reconocer un patrón (mismo identificador, mismas
 * horas) sin dejar una cédula o un correo completos en la bitácora de alguien que ni siquiera inició sesión.
 */
export function enmascararIdentificador(id: string): string {
  const t = (id ?? "").trim();
  if (t === "") return "(vacío)";
  const arroba = t.indexOf("@");
  if (arroba > 0) return `${t[0]}***${t.slice(arroba)}`;
  return t.length <= 4 ? `${t[0]}***` : `${t.slice(0, 2)}${"*".repeat(Math.min(6, t.length - 4))}${t.slice(-2)}`;
}

/** Enlaces de paginación conservando los filtros. */
export function auditoriaAQuery(f: Partial<FiltrosAuditoria>, pagina = 1): string {
  const sp = new URLSearchParams();
  if (f.usuario) sp.set("usuario", f.usuario);
  if (f.accion) sp.set("accion", f.accion);
  if (f.entidad) sp.set("entidad", f.entidad);
  if (f.desde) sp.set("desde", f.desde);
  if (f.hasta) sp.set("hasta", f.hasta);
  if (pagina > 1) sp.set("pagina", String(pagina));
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Palabras limpias para `.ilike` del filtro de usuario (quita lo que rompe la sintaxis de PostgREST y los comodines). */
export function textoBusquedaAuditoria(q: string): string {
  return q.replace(/[,()"\\%*_]/g, " ").replace(/\s+/g, " ").trim();
}
