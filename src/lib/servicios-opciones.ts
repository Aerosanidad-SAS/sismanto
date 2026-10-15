import {
  AISLAMIENTO_OPCIONES,
  FINALIDAD_TRASLADO_OPCIONES,
  METODO_PAGO_OPCIONES,
  MOTIVO_EXTERNO_OPCIONES,
  MOTIVO_INTERNO_OPCIONES,
  PERIMETRO_OPCIONES,
  TURNO_OPCIONES,
} from "@/lib/validations";

// Soporte que necesita el paciente. Los 7 valores más usados del histórico de SISRES (12 valores cubren el 96 % de
// 37 mil servicios); lo demás se escribe a mano. El administrador puede cambiar la lista (migración 134).
const SOPORTE_OPCIONES = [
  "NO REQUIERE",
  "OXIGENO A 1 LITRO",
  "OXIGENO A 2 LITROS",
  "OXIGENO A 3 LITROS",
  "OXIGENO A NECESIDAD",
  "MOVILIDAD REDUCIDA",
  "VIGILANCIA MEDICA",
] as const;

// Opciones administrables de 8 selects del formulario de servicios (migraciones 091 y 134), portado de
// includes/servicioCamposConfig.php de SISRES. Puro (sin base de datos): lo usan la acción, la
// pantalla de configuración y el formulario.

export const CAMPOS_OPCIONES_SERVICIO = [
  { campo: "turno_programacion", etiqueta: "Turno de programación", fabrica: TURNO_OPCIONES },
  { campo: "requiere_aislamiento", etiqueta: "Requiere aislamiento", fabrica: AISLAMIENTO_OPCIONES },
  { campo: "perimetro", etiqueta: "Perímetro", fabrica: PERIMETRO_OPCIONES },
  { campo: "finalidad_traslado", etiqueta: "Finalidad del traslado", fabrica: FINALIDAD_TRASLADO_OPCIONES },
  { campo: "metodo_pago", etiqueta: "Método de pago", fabrica: METODO_PAGO_OPCIONES },
  { campo: "motivo_externo", etiqueta: "Motivo externo (no efectivo)", fabrica: MOTIVO_EXTERNO_OPCIONES },
  { campo: "motivo_interno", etiqueta: "Motivo interno (no efectivo)", fabrica: MOTIVO_INTERNO_OPCIONES },
  { campo: "soporte", etiqueta: "Soporte", fabrica: SOPORTE_OPCIONES },
] as const;

export type CampoOpcionesServicio = (typeof CAMPOS_OPCIONES_SERVICIO)[number]["campo"];
export type OpcionesServicio = Record<CampoOpcionesServicio, string[]>;

export const MAX_OPCIONES = 60;
export const MAX_LARGO_OPCION = 100;

export function esCampoOpcionesServicio(campo: string): campo is CampoOpcionesServicio {
  return CAMPOS_OPCIONES_SERVICIO.some((c) => c.campo === campo);
}

/** Las opciones de fábrica de todos los campos (las que había fijas en el código). */
export function opcionesDeFabrica(): OpcionesServicio {
  return Object.fromEntries(CAMPOS_OPCIONES_SERVICIO.map((c) => [c.campo, [...c.fabrica]])) as OpcionesServicio;
}

/**
 * Limpia una lista escrita por el administrador: recorta espacios, quita vacías y repetidas (sin distinguir
 * mayúsculas) y conserva el orden. No cambia mayúsculas: el valor se guarda tal cual en el servicio.
 */
export function limpiarOpciones(opciones: readonly unknown[]): string[] {
  const vistas = new Set<string>();
  const limpio: string[] = [];
  for (const o of opciones) {
    const v = String(o ?? "").trim().replace(/\s+/g, " ");
    const clave = v.toLocaleUpperCase("es");
    if (!v || vistas.has(clave)) continue;
    vistas.add(clave);
    limpio.push(v);
  }
  return limpio;
}

/**
 * Opciones vigentes a partir de las filas guardadas: la lista del administrador si es válida y no está vacía,
 * si no, la de fábrica (mismo criterio que obtenerOpcionesCampoServicio de SISRES).
 */
export function combinarOpciones(filas: readonly { campo: string; opciones: unknown }[]): OpcionesServicio {
  const r = opcionesDeFabrica();
  for (const f of filas) {
    if (!esCampoOpcionesServicio(f.campo) || !Array.isArray(f.opciones)) continue;
    const lista = limpiarOpciones(f.opciones);
    if (lista.length > 0) r[f.campo] = lista;
  }
  return r;
}

/**
 * Las opciones a mostrar en un select: si el servicio tiene guardado un valor que el administrador ya quitó de la
 * lista, se agrega al final para que se vea y no se pierda al guardar (como editarServicio.php de SISRES).
 */
export function opcionesConValorActual(opciones: readonly string[], valorActual: string | null | undefined): string[] {
  const v = (valorActual ?? "").trim();
  return v && !opciones.includes(v) ? [...opciones, v] : [...opciones];
}
