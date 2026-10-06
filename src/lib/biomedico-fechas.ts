import { esDia, sumarMeses, type Dia } from "@/lib/fechas";

// Fechas «próximas» de mantenimiento y calibración de un equipo biomédico. SISRES (insertarInventario.php /
// modificar_inventario.php) calcula próximo = último + 6 meses y próxima calibración = última + 12 meses, solo si
// el «último» tiene una fecha real. Aquí además se respeta la frecuencia del equipo (frec_mantenimiento /
// frec_calibracion: SEMESTRAL, ANUAL…) cuando está escrita; si no, se usan los 6 y 12 meses de SISRES.

const MESES_POR_FRECUENCIA: Record<string, number> = {
  MENSUAL: 1,
  BIMESTRAL: 2,
  TRIMESTRAL: 3,
  CUATRIMESTRAL: 4,
  SEMESTRAL: 6,
  ANUAL: 12,
  BIENAL: 24,
};

export const MESES_MANTENIMIENTO_POR_DEFECTO = 6;
export const MESES_CALIBRACION_POR_DEFECTO = 12;

/** Meses de una frecuencia escrita (sin importar mayúsculas ni tildes); `porDefecto` si no se reconoce. */
export function mesesDeFrecuencia(frecuencia: string | null | undefined, porDefecto: number): number {
  const clave = (frecuencia ?? "").trim().toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return MESES_POR_FRECUENCIA[clave] ?? porDefecto;
}

export interface FechasEquipo {
  ultimo_mantenimiento?: string | null;
  proximo_mantenimiento?: string | null;
  ultima_calibracion?: string | null;
  proxima_calibracion?: string | null;
  frec_mantenimiento?: string | null;
  frec_calibracion?: string | null;
}

/** Los 3 tipos de mantenimiento biomédico: ahora el formulario ofrece una lista, no texto libre (sin migración —
 * la columna sigue siendo texto; datos históricos como «Calibración»/«CALIBRACION» se siguen leyendo igual). */
export const TIPOS_MANTENIMIENTO_BIOMEDICO = ["PREVENTIVO", "CORRECTIVO", "CALIBRACION"] as const;
export type TipoMantenimientoBiomedico = (typeof TIPOS_MANTENIMIENTO_BIOMEDICO)[number];

/** ¿Es un mantenimiento de calibración? (datos históricos lo escribieron libre: «CALIBRACION», «Calibración»…). */
export function esCalibracion(tipo: string | null | undefined): boolean {
  return /calibr/i.test(tipo ?? "");
}

/** ¿Es un mantenimiento correctivo? No es parte del cronograma preventivo — no mueve ninguna fecha del equipo. */
export function esCorrectivo(tipo: string | null | undefined): boolean {
  return /correctiv/i.test(tipo ?? "");
}

/**
 * Cambios en el equipo al registrar un mantenimiento del día `fecha`. SISRES (3061acc, 2026-10-01):
 * PREVENTIVO mueve último/próximo mantenimiento; CALIBRACION mueve última/próxima calibración; CORRECTIVO no
 * mueve ninguna fecha — arreglar una falla puntual no es una revisión programada. Si el equipo ya tiene una fecha
 * más reciente que `fecha` (se está cargando un mantenimiento viejo/atrasado), tampoco se toca nada.
 */
export function fechasTrasMantenimiento(equipo: FechasEquipo, fecha: string, tipo: string | null | undefined): Partial<FechasEquipo> {
  if (!esDia(fecha)) return {};
  if (esCorrectivo(tipo)) return {};
  if (esCalibracion(tipo)) {
    if (esDia(equipo.ultima_calibracion) && equipo.ultima_calibracion > fecha) return {};
    return {
      ultima_calibracion: fecha,
      proxima_calibracion: sumarMeses(fecha, mesesDeFrecuencia(equipo.frec_calibracion, MESES_CALIBRACION_POR_DEFECTO)),
    };
  }
  if (esDia(equipo.ultimo_mantenimiento) && equipo.ultimo_mantenimiento > fecha) return {};
  return {
    ultimo_mantenimiento: fecha,
    proximo_mantenimiento: sumarMeses(fecha, mesesDeFrecuencia(equipo.frec_mantenimiento, MESES_MANTENIMIENTO_POR_DEFECTO)),
  };
}

function proximaSiFalta(ultimo: string | null | undefined, proximo: string | null | undefined, meses: number): Dia | null {
  if (!esDia(ultimo)) return null;
  if (esDia(proximo) && proximo > ultimo) return null; // ya hay una próxima coherente escrita a mano
  return sumarMeses(ultimo, meses);
}

/**
 * Al crear o editar un equipo: completa el próximo mantenimiento y la próxima calibración cuando hay un «último» real y
 * el «próximo» está vacío o quedó igual o antes que el último (desactualizado). Una fecha próxima coherente escrita a
 * mano se respeta.
 */
export function completarFechasProximas<T extends FechasEquipo>(datos: T): T {
  const r = { ...datos };
  const pm = proximaSiFalta(r.ultimo_mantenimiento, r.proximo_mantenimiento, mesesDeFrecuencia(r.frec_mantenimiento, MESES_MANTENIMIENTO_POR_DEFECTO));
  if (pm) r.proximo_mantenimiento = pm;
  const pc = proximaSiFalta(r.ultima_calibracion, r.proxima_calibracion, mesesDeFrecuencia(r.frec_calibracion, MESES_CALIBRACION_POR_DEFECTO));
  if (pc) r.proxima_calibracion = pc;
  return r;
}
