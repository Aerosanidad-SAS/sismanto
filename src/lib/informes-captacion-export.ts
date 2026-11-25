import { COLUMNAS_SISPRO } from "@/lib/captacion";
import { diasDelRango, esDia } from "@/lib/fechas";
import type {
  HMT,
  InformeAcm,
  InformeAerocivil,
  InformePae,
  InformePme,
  TablaCantidad,
  TablaHMT,
} from "@/lib/informes-captacion";
import { celdaExcelSegura } from "@/lib/servicios-lista";

// Exportación a Excel de los informes de captación (un libro, una hoja por informe elegido). Funciones puras: reciben
// lo que ya calculó informes-captacion.ts y devuelven la matriz de la hoja, con las mismas cifras de la pantalla.

export type Celda = string | number;
export type Hoja = Celda[][];

/** Orden en que salen las hojas del libro, sea cual sea el orden en que se pidieron. */
export const INFORMES_EXPORTABLES = ["acm", "aerocivil", "pme", "pae", "sispro"] as const;
export type InformeExportable = (typeof INFORMES_EXPORTABLES)[number];

/** Marcados de entrada en la pantalla: SISPRO trae datos personales, así que va desmarcado. */
export const INFORMES_POR_DEFECTO: readonly InformeExportable[] = ["acm", "aerocivil", "pme", "pae"];

export const ROTULO_INFORME: Record<InformeExportable, string> = {
  acm: "ACM",
  aerocivil: "Aerocivil",
  pme: "PME",
  pae: "PAE",
  sispro: "SISPRO",
};

/** Tope de filas leídas por exportación (el mismo de la exportación de pacientes). */
export const EXPORT_INFORMES_MAX_FILAS = 50000;
/** Tope del rango de fechas: un año. */
export const EXPORT_INFORMES_MAX_DIAS = 366;
/** SISPRO lleva una hoja por mes; más de un año de meses no se exporta de una vez. */
export const EXPORT_SISPRO_MAX_MESES = 12;

/** Lista de informes pedidos (`acm,pae`) → lista blanca, sin repetidos y en orden fijo. null si está vacía o trae algo desconocido. */
export function parsearInformes(valor: string | null | undefined): InformeExportable[] | null {
  if (!valor) return null;
  const pedidos = valor.split(",").map((v) => v.trim().toLowerCase());
  if (pedidos.some((p) => !(INFORMES_EXPORTABLES as readonly string[]).includes(p))) return null;
  const set = new Set(pedidos);
  return INFORMES_EXPORTABLES.filter((i) => set.has(i));
}

/** Mensaje de error si el rango no sirve para exportar; null si es válido. */
export function validarRangoExport(desde: unknown, hasta: unknown): string | null {
  if (!esDia(desde) || !esDia(hasta)) return "Fechas inválidas: usa el formato aaaa-mm-dd";
  if (desde > hasta) return "La fecha inicial es posterior a la final";
  if (diasDelRango(desde, hasta) > EXPORT_INFORMES_MAX_DIAS) {
    return `El rango es muy largo: exporta como máximo ${EXPORT_INFORMES_MAX_DIAS} días por descarga`;
  }
  return null;
}

/** Meses (aaaa-mm) que toca un rango de días válido, en orden. */
export function mesesDelRango(desde: string, hasta: string): string[] {
  const [a0, m0] = desde.split("-").map(Number);
  const [a1, m1] = hasta.split("-").map(Number);
  const meses: string[] = [];
  for (let i = a0 * 12 + (m0 - 1); i <= a1 * 12 + (m1 - 1); i++) {
    meses.push(`${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`);
  }
  return meses;
}

export const nombreHojaSispro = (mes: string) => `SISPRO ${mes}`;

// ─── Piezas de las hojas ────────────────────────────────────────────────────

const segura = (fila: Celda[]): Celda[] => fila.map((c) => celdaExcelSegura(c));

function encabezado(titulo: string, periodo: string, rotulo: string, total: number): Hoja {
  return [segura([titulo]), segura([periodo]), [rotulo, total], []];
}

const sumaHmt = (filas: TablaHMT): HMT =>
  Object.values(filas).reduce<HMT>((a, c) => ({ H: a.H + c.H, M: a.M + c.M, T: a.T + c.T }), { H: 0, M: 0, T: 0 });

/** Tabla H / M / T con su fila TOTAL, igual que en pantalla (las filas «extra» van sangradas con ↳ y no cuentan en el total). */
function tablaHmt(titulo: string, filas: TablaHMT): Hoja {
  const t = sumaHmt(filas);
  return [
    [titulo, "H", "M", "T"],
    ...Object.entries(filas).map(([e, c]) => segura([e, c.H, c.M, c.T])),
    ["TOTAL", t.H, t.M, t.T],
    [],
  ];
}

function tablaConteo(titulo: string, filas: TablaCantidad, total?: number): Hoja {
  const suma = total ?? Object.values(filas).reduce((a, b) => a + b, 0);
  return [[titulo, "Cantidad"], ...Object.entries(filas).map(([e, n]) => segura([e, n])), ["TOTAL", suma], []];
}

// ─── Hojas ──────────────────────────────────────────────────────────────────

export function hojaAcm(d: InformeAcm, periodo: string): Hoja {
  return [
    ...encabezado("Informe ACM — Captación aeroportuaria", periodo, "Pacientes atendidos", d.totalPacientes),
    ...tablaHmt("Tipo de atención", d.tipoAtencion),
    ...tablaHmt("Resultado autorización de vuelo", d.resultadoAutorizacion),
    ...tablaHmt("Condición", d.condicion),
    ...tablaHmt("Condición accidente de tránsito", d.condicionTransito),
    ...tablaHmt("Identidad", d.identidad),
    ...tablaHmt("Accidentes especiales", d.accidentesEspeciales),
    ...tablaHmt("Grupo etáreo", d.grupoEtareo),
    ...tablaHmt("Notificación obligatoria", d.notificacionObligatoria),
    ...tablaHmt("Tipo de vuelo", d.tipoVuelo),
    ...tablaConteo("Patología por sistema", d.patologiaSistema),
    ...tablaConteo("Otras patologías", d.otraPatologia),
    ...tablaConteo("Post operatorios", d.postOperatorio),
    ...tablaConteo("Emergencias", d.emergencias),
  ];
}

export function hojaAerocivil(d: InformeAerocivil, periodo: string): Hoja {
  const resumen: [string, number][] = [
    ["Servicio médico", d.totalServicio],
    ["Externos", d.totalExterno],
    ["Total", d.totalServicio + d.totalExterno],
    ["Hombres", d.hombres],
    ["Mujeres", d.mujeres],
    ["Pasajeros", d.pasajeros],
    ["Tripulantes", d.tripulantes],
    ["Empleados aeropuerto", d.empleados],
    ["Accidentes", d.accidentes],
    ["Enfermos", d.enfermos],
    ["Remisiones", d.remisiones],
    ["Visitantes", d.visitantes],
    ["Inyecciones", d.inyecciones],
    ["Curaciones", d.curaciones],
    ["Silla de ruedas", d.sillaRuedas],
    ["Ambulancia", d.ambulancia],
  ];
  return [
    ...encabezado("Informe Aerocivil (GSAP2.2-8-02)", periodo, "Pacientes atendidos", d.totalPacientes),
    ["Resumen", "Cantidad"],
    ...resumen,
    [],
    ...tablaConteo("Patologías", d.patologias),
    ...tablaHmt("Tipo de vuelo", { "Vuelo comercial": d.vueloComercial, "Vuelo ambulancia": d.vueloAmbulancia }),
    ...tablaHmt("Grupo etáreo", d.grupoEtareo),
  ];
}

export function hojaPme(d: InformePme, periodo: string): Hoja {
  return [
    ...encabezado("Informe PME — Procedimientos médicos y de enfermería", periodo, "Procedimientos", d.total),
    ...tablaConteo("Procedimiento", d.conteo, d.total),
  ];
}

export function hojaPae(d: InformePae, periodo: string): Hoja {
  const empresas = Object.entries(d.conteo);
  const cabecera = encabezado("Informe PAE — Pacientes atendidos por empresa", periodo, "Pacientes atendidos", d.totalGeneral.TOTAL);
  if (empresas.length === 0) return [...cabecera, ["No hay aerolíneas activas en el catálogo."]];
  return [
    ...cabecera,
    ["Aerolínea / entidad", "Empleados", "Pasajeros", "Total"],
    ...empresas.map(([e, c]) => segura([e, c.EMPLEADOS, c.PASAJEROS, c.TOTAL])),
    ["TOTAL", d.totalGeneral.EMPLEADOS, d.totalGeneral.PASAJEROS, d.totalGeneral.TOTAL],
    [],
    ["El total de cada empresa incluye todas sus captaciones (tripulantes, visitantes y demás), no solo empleados y pasajeros."],
  ];
}

/** Hoja de un mes de SISPRO: las 38 columnas del reporte y las filas de getFilasSisproMes, con el texto a salvo de fórmulas. */
export function hojaSispro(filas: Celda[][]): Hoja {
  return [[...COLUMNAS_SISPRO], ...filas.map(segura)];
}
