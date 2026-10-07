/**
 * Reglas puras del cierre de turno del OVEM (migración 115): validación de lo que digita, bloqueos y quién falta por
 * cerrar. Sin base de datos ni navegador, para poder probarlas. El día y la hora NUNCA entran aquí desde el cliente:
 * los pone el servidor (`hoyBogota()` y `cerrado_at` de la base).
 */

export const NIVELES_COMBUSTIBLE = ["LLENO", "TRES_CUARTOS", "MEDIO", "CUARTO", "RESERVA"] as const;
export type NivelCombustible = (typeof NIVELES_COMBUSTIBLE)[number];

export const NIVEL_COMBUSTIBLE_LABEL: Record<NivelCombustible, string> = {
  LLENO: "Lleno",
  TRES_CUARTOS: "Tres cuartos",
  MEDIO: "Medio tanque",
  CUARTO: "Un cuarto",
  RESERVA: "En reserva",
};

export type EstadoEntrega = "SIN_NOVEDAD" | "CON_NOVEDADES";

export const NOVEDADES_NOTA_MAX = 1000;

export function esNivelCombustible(v: unknown): v is NivelCombustible {
  return typeof v === "string" && (NIVELES_COMBUSTIBLE as readonly string[]).includes(v);
}

export interface EntradaCierre {
  kmFinal: number | undefined;
  huboNovedades: boolean | undefined;
  novedadesNota?: string;
  nivelCombustible: string | undefined;
  limpiezaOk: boolean | undefined;
}

export interface ContextoKm {
  /** Km inicial del preoperacional de hoy en ese vehículo. */
  kmInicialHoy: number | null | undefined;
  /** Última lectura de odómetro registrada (mileage_logs). */
  ultimoKm: number | null | undefined;
}

const fmtKm = (n: number) => n.toLocaleString("es-CO");

/** Mensaje de error del km final, o null si es válido. Se usa igual en el navegador y en el servidor. */
export function validarKmFinal(km: number | undefined, ctx: ContextoKm): string | null {
  if (km === undefined || !Number.isFinite(km)) return "El kilometraje final es obligatorio.";
  if (!Number.isInteger(km) || km <= 0) return "El kilometraje final debe ser un número entero mayor a cero.";
  if (ctx.kmInicialHoy !== null && ctx.kmInicialHoy !== undefined && km < ctx.kmInicialHoy) {
    return `El kilometraje final no puede ser menor al inicial de hoy (${fmtKm(ctx.kmInicialHoy)} km).`;
  }
  if (ctx.ultimoKm !== null && ctx.ultimoKm !== undefined && ctx.ultimoKm > 0 && km < ctx.ultimoKm) {
    return `El kilometraje final no puede ser menor al último registrado (${fmtKm(ctx.ultimoKm)} km).`;
  }
  return null;
}

/** Primer error de la entrada, o null si se puede cerrar. */
export function validarCierre(entrada: EntradaCierre, ctx: ContextoKm): string | null {
  const errKm = validarKmFinal(entrada.kmFinal, ctx);
  if (errKm) return errKm;
  if (entrada.huboNovedades === undefined) return "Indica si hubo novedades en el turno.";
  const nota = (entrada.novedadesNota ?? "").trim();
  if (entrada.huboNovedades && nota.length === 0) return "Cuenta qué novedad hubo: es obligatorio si respondes que sí.";
  if (nota.length > NOVEDADES_NOTA_MAX) return `La descripción de la novedad admite máximo ${NOVEDADES_NOTA_MAX} caracteres.`;
  if (!esNivelCombustible(entrada.nivelCombustible)) return "Indica el nivel de combustible.";
  if (entrada.limpiezaOk === undefined) return "Indica si el vehículo queda limpio.";
  return null;
}

export function estadoEntregaDe(huboNovedades: boolean): EstadoEntrega {
  return huboNovedades ? "CON_NOVEDADES" : "SIN_NOVEDAD";
}

export interface EstadoBloqueo {
  /** Existe el preoperacional de hoy de este OVEM en este vehículo. */
  tienePreoperacionalHoy: boolean;
  /** Ya hay un cierre de hoy de este OVEM en este vehículo. */
  yaCerrado: boolean;
  /** Servicios del vehículo en curso (etapa CURSO). */
  serviciosEnCurso: number;
}

/** Mensaje que impide cerrar el turno, o null si nada lo bloquea. El orden es el que el conductor puede resolver primero. */
export function bloqueoCierre(e: EstadoBloqueo): string | null {
  if (e.yaCerrado) return "Ya cerraste el turno de este vehículo hoy.";
  if (!e.tienePreoperacionalHoy) return "Primero haz el preoperacional de hoy de este vehículo: sin él no hay km inicial ni turno que cerrar.";
  if (e.serviciosEnCurso > 0) return "Termina el servicio en curso primero.";
  return null;
}

/** Hay que abrir una novedad con lo que dijo el OVEM: respondió que sí y el vehículo no tiene ninguna abierta. */
export function debeAbrirNovedad(huboNovedades: boolean, novedadesAbiertasDelVehiculo: number): boolean {
  return huboNovedades && novedadesAbiertasDelVehiculo === 0;
}

export function descripcionNovedadDeCierre(nota: string): string {
  const texto = `Cierre de turno: ${nota.trim()}`;
  // El formulario de novedades exige mínimo 10 caracteres; con la nota obligatoria casi siempre se cumple.
  return texto.length >= 10 ? texto : texto.padEnd(10, ".");
}

export interface VehiculoProgramadoCierre {
  vehicleId: string;
  placa: string;
  /** Nombres de quienes operan el vehículo hoy según la programación. */
  operadores: string[];
}

export interface CierreRegistrado {
  vehicleId: string;
  placa: string;
  ovem: string | null;
  /** Instante en que el servidor registró el cierre (ISO). */
  cerradoAt: string;
  estadoEntrega: EstadoEntrega;
  kmFinal: number;
}

export interface CierresDeHoy {
  /** Vehículos que se esperaba que operaran hoy (programados). */
  esperados: number;
  cerrados: CierreRegistrado[];
  /** Programados que aún no tienen cierre. */
  faltantes: VehiculoProgramadoCierre[];
}

/** Cruza los vehículos programados con los cierres de hoy. Un vehículo con al menos un cierre cuenta como cerrado. */
export function cruzarCierres(programados: VehiculoProgramadoCierre[], cierres: CierreRegistrado[]): CierresDeHoy {
  const conCierre = new Set(cierres.map((c) => c.vehicleId));
  const faltantes = programados.filter((p) => !conCierre.has(p.vehicleId));
  const ordenados = [...cierres].sort((a, b) => a.cerradoAt.localeCompare(b.cerradoAt));
  return { esperados: programados.length, cerrados: ordenados, faltantes };
}

/** HH:MM en hora de Colombia a partir de un instante; así la hora mostrada no depende del navegador. */
export function horaCierreBogota(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" }).format(new Date(iso));
}
