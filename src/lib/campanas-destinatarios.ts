/**
 * Destinatarios de una campaña de WhatsApp desde la base de datos o desde un Excel (SISRES: includes/wa/crearCampana.php,
 * xlsxReader.php). Funciones puras: sin Next, sin red y sin base de datos.
 *
 * Reglas comunes a las dos fuentes (y que SISRES no tenía escritas):
 *  - Un teléfono inválido **se omite y se cuenta**, no tumba la campaña entera (con miles de registros de pacientes es
 *    seguro que hay celulares mal digitados).
 *  - Un mismo número **se envía una sola vez** aunque esté en varios registros (una familia que comparte celular no
 *    recibe el mismo mensaje tres veces).
 *  - Los resultados dicen cuántos se omitieron y por qué, para que quien crea la campaña lo vea antes de enviar.
 */
import { sanitizarTelefono } from "@/lib/notifications/whatsapp";

export const MAX_DESTINATARIOS = 2000;
/** Registros que se leen de la base como máximo antes de pedir que se filtre (paginados de a 1000). */
export const MAX_REGISTROS_BASE = 5000;
export const MAX_FILAS_EXCEL = 5000;
export const MAX_BYTES_EXCEL = 5 * 1024 * 1024;
const PARAM_MAX = 500;

export interface DestinatarioCrudo {
  telefono: string;
  nombre?: string;
  parametros: string[];
}

export interface DestinatarioNormalizado extends DestinatarioCrudo {
  telefonoNormalizado: string;
}

export interface Omitidos {
  sinTelefono: number;
  invalidos: number;
  duplicados: number;
}

export const OMITIDOS_VACIOS: Omitidos = { sinTelefono: 0, invalidos: 0, duplicados: 0 };

/** Valida y deduplica: solo se conserva el primer registro de cada número. */
export function normalizarDestinatarios(crudos: DestinatarioCrudo[]): { destinatarios: DestinatarioNormalizado[]; omitidos: Omitidos } {
  const omitidos: Omitidos = { sinTelefono: 0, invalidos: 0, duplicados: 0 };
  const vistos = new Set<string>();
  const destinatarios: DestinatarioNormalizado[] = [];
  for (const c of crudos) {
    if (!c.telefono || !c.telefono.trim()) {
      omitidos.sinTelefono++;
      continue;
    }
    const tel = sanitizarTelefono(c.telefono);
    if (!tel) {
      omitidos.invalidos++;
      continue;
    }
    if (vistos.has(tel)) {
      omitidos.duplicados++;
      continue;
    }
    vistos.add(tel);
    destinatarios.push({ ...c, telefono: c.telefono.trim(), telefonoNormalizado: tel });
  }
  return { destinatarios, omitidos };
}

export function totalOmitidos(o: Omitidos): number {
  return o.sinTelefono + o.invalidos + o.duplicados;
}

/** "Se omitieron 12: 8 sin teléfono, 3 con teléfono inválido y 1 repetido." — null si no se omitió ninguno. */
export function resumenOmitidos(o: Omitidos): string | null {
  const partes: string[] = [];
  if (o.sinTelefono) partes.push(`${o.sinTelefono} sin teléfono`);
  if (o.invalidos) partes.push(`${o.invalidos} con teléfono inválido`);
  if (o.duplicados) partes.push(`${o.duplicados} ${o.duplicados === 1 ? "repetido" : "repetidos"}`);
  const total = totalOmitidos(o);
  if (total === 0) return null;
  return `Se omitieron ${total}: ${partes.join(", ").replace(/, ([^,]*)$/, " y $1")}.`;
}

/** Teléfono para mostrar en una vista previa sin exponerlo entero: 573001234567 → 57300***4567. */
export function mascararTelefono(t: string): string {
  const d = t.replace(/\D/g, "");
  return d.length <= 7 ? "***" : `${d.slice(0, 5)}***${d.slice(-4)}`;
}

// ─── Fuentes de la base de datos ─────────────────────────────────────────────

export type FuenteBase = "pacientes" | "clientes";

interface ConfigFuente {
  tabla: "patients" | "clients";
  columnaTelefono: string;
  columnaCiudad: string;
  /** Columna → etiqueta: las únicas que se pueden usar como variable {{n}} de la plantilla (lista blanca, como en SISRES). */
  columnas: Record<string, string>;
  /** Cómo se arma el nombre del destinatario a partir de la fila. */
  nombre: (fila: Record<string, unknown>) => string;
}

const t = (v: unknown): string => (v === null || v === undefined ? "" : String(v).trim());

export const FUENTES_BASE: Record<FuenteBase, ConfigFuente> = {
  pacientes: {
    tabla: "patients",
    columnaTelefono: "celular",
    columnaCiudad: "ciudad",
    columnas: {
      cedula: "Cédula",
      nombre1: "Primer nombre",
      nombre2: "Segundo nombre",
      apellido1: "Primer apellido",
      apellido2: "Segundo apellido",
      ciudad: "Ciudad",
      departamento: "Departamento",
      eps: "EPS",
    },
    nombre: (f) => [t(f.nombre1), t(f.apellido1)].filter(Boolean).join(" "),
  },
  clientes: {
    tabla: "clients",
    columnaTelefono: "telefono1",
    columnaCiudad: "ciudad",
    columnas: {
      numero: "NIT / documento",
      nombre: "Nombre",
      ciudad: "Ciudad",
      departamento: "Departamento",
      sector: "Sector",
      correo: "Correo",
    },
    nombre: (f) => t(f.nombre),
  },
};

export function esFuenteBase(x: unknown): x is FuenteBase {
  return x === "pacientes" || x === "clientes";
}

/** Las columnas pedidas como variable, en orden, sin repetir y solo las de la lista blanca. `null` + motivo si alguna no es válida. */
export function validarMapeoBase(fuente: FuenteBase, mapeo: string[]): { ok: true; columnas: string[] } | { ok: false; error: string } {
  const permitidas = Object.keys(FUENTES_BASE[fuente].columnas);
  const vistas = new Set<string>();
  for (const c of mapeo) {
    if (!permitidas.includes(c)) return { ok: false, error: `Columna no permitida para ${fuente}: "${c}". Permitidas: ${permitidas.join(", ")}` };
    vistas.add(c);
  }
  if (vistas.size > 10) return { ok: false, error: "Máximo 10 variables por plantilla" };
  return { ok: true, columnas: Array.from(vistas) };
}

/** Una fila de la base → destinatario crudo (teléfono, nombre y las variables en el orden del mapeo). */
export function filaADestinatario(fuente: FuenteBase, fila: Record<string, unknown>, mapeo: string[]): DestinatarioCrudo {
  const cfg = FUENTES_BASE[fuente];
  return {
    telefono: t(fila[cfg.columnaTelefono]),
    nombre: cfg.nombre(fila).slice(0, 200) || undefined,
    parametros: mapeo.map((c) => t(fila[c]).slice(0, PARAM_MAX)),
  };
}

/** Texto de ciudad para un `ilike`: sin comodines ni sintaxis de PostgREST (mismo saneo que los buscadores). */
export function textoCiudad(ciudad: string): string {
  return (ciudad ?? "").replace(/[,()"\\%*_]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

// ─── Excel ───────────────────────────────────────────────────────────────────

/** Encabezados aceptados para la columna del teléfono (los de SISRES). */
export const ALIAS_TELEFONO = ["telefono", "teléfono", "celular", "phone", "whatsapp", "telefono1", "numero", "movil", "móvil"];

export function detectarColumnaTelefono(encabezados: string[]): string | null {
  return encabezados.find((h) => ALIAS_TELEFONO.includes(h.trim().toLowerCase())) ?? null;
}

/**
 * Filas de una hoja (objetos por encabezado) → destinatarios crudos. `mapeo` son los encabezados que se usan como
 * variables, en orden. Devuelve un error legible si falta la columna del teléfono o si el mapeo nombra una columna que no existe.
 */
export function crudosDesdeHoja(
  encabezados: string[],
  filas: Record<string, unknown>[],
  mapeo: string[]
): { ok: true; crudos: DestinatarioCrudo[]; columnaTelefono: string } | { ok: false; error: string } {
  const columnaTelefono = detectarColumnaTelefono(encabezados);
  if (!columnaTelefono) {
    return { ok: false, error: "El Excel no tiene una columna de teléfono. Usa un encabezado como: telefono, celular o whatsapp." };
  }
  for (const c of mapeo) {
    if (!encabezados.includes(c)) return { ok: false, error: `La columna "${c}" no está en el Excel. Encabezados: ${encabezados.join(", ")}` };
  }
  if (filas.length > MAX_FILAS_EXCEL) return { ok: false, error: `El Excel tiene más de ${MAX_FILAS_EXCEL} filas. Divídelo en varios archivos.` };
  const colNombre = encabezados.find((h) => ["nombre", "name"].includes(h.trim().toLowerCase()));
  const crudos = filas.map((f) => ({
    telefono: t(f[columnaTelefono]),
    nombre: colNombre ? t(f[colNombre]).slice(0, 200) || undefined : undefined,
    parametros: mapeo.map((c) => t(f[c]).slice(0, PARAM_MAX)),
  }));
  return { ok: true, crudos, columnaTelefono };
}
