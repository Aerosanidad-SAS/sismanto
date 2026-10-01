import { esDia } from "@/lib/fechas";

/**
 * Validación y normalización de la plantilla de hoja de vida de vehículos (PLANTILLA_HOJA_DE_VIDA_VEHICULOS.xlsx:
 * hojas 1_VEHICULOS, 2_DOCUMENTOS_Y_COSTOS y 3_ULTIMO_MANTENIMIENTO). Funciones puras, sin acceso a la base, para que la
 * vista previa y la carga usen exactamente las mismas reglas y se puedan probar.
 *
 * Regla de fondo: lo desconocido queda vacío (NULL) y se reporta como faltante; no se rechaza la fila por eso.
 * Solo es error lo que está MAL (catálogo, fecha o número inválidos) o lo que impide identificar la fila.
 */

export const CENTROS = ["CRA_MEDELLIN", "CRA_BOGOTA", "AIRPLAN", "CTG", "ADO"] as const;
export const ESTADOS = ["OPERATIVO", "FUERA_DE_SERVICIO"] as const;
export const TIPOS_VEHICULO = ["AMBULANCIA_TAB", "AMBULANCIA_TAM", "VAN", "ADMIN", "DOMI"] as const;
export const COMBUSTIBLES = ["DIESEL", "GASOLINA", "GAS", "ELECTRICO", "HIBRIDO"] as const;
export const TIPOS_DOCUMENTO = ["SOAT", "POLIZA", "RTM", "IMPUESTO_VEHICULAR", "LEASING_CUOTA", "GPS_MENSUAL"] as const;

export interface ErrorFila {
  hoja: string;
  fila: number;
  columna?: string;
  mensaje: string;
}

/** Fila cruda de la hoja: número de fila en Excel y celdas por nombre de encabezado (sin el « *»). */
export interface FilaCruda {
  fila: number;
  datos: Record<string, unknown>;
}

type Resultado<T> = { ok: true; valor: T } | { ok: false; errores: Omit<ErrorFila, "hoja" | "fila">[] };

// ─── Normalizadores ─────────────────────────────────────────────────────────

export function texto(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export function normalizarPlaca(v: unknown): string | null {
  const s = texto(v);
  return s ? s.replace(/[\s-]/g, "").toUpperCase() : null;
}

/** Número en formato colombiano o anglosajón: «62.648,00», «$ 1.234.567», «1234.5». null si no es número. */
export function numero(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s0 = texto(v);
  if (!s0) return null;
  let s = s0.replace(/[$\s]/g, "");
  if (s.includes(",") && s.includes(".")) {
    // El separador decimal es el último de los dos.
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** La plantilla trae las fechas como texto AAAA-MM-DD. Cualquier otra cosa es un error a corregir en el Excel. */
function dia(v: unknown): { valor: string | null; invalido: boolean } {
  const s = texto(v);
  if (!s) return { valor: null, invalido: false };
  return esDia(s) ? { valor: s, invalido: false } : { valor: null, invalido: true };
}

const enCatalogo = <T extends readonly string[]>(lista: T, v: string): v is T[number] => (lista as readonly string[]).includes(v);

// ─── Vehículos ──────────────────────────────────────────────────────────────

export interface VehiculoFila {
  placa: string;
  centro_operativo: (typeof CENTROS)[number] | null;
  estado_actual: (typeof ESTADOS)[number] | null;
  fds_desde: string | null;
  tipo_vehiculo: (typeof TIPOS_VEHICULO)[number] | null;
  marca: string | null;
  linea: string | null;
  modelo: string | null;
  color: string | null;
  combustible: string | null;
  cilindraje: string | null;
  pasajeros: number | null;
  carroceria: string | null;
  numero_motor: string | null;
  numero_chasis: string | null;
  ciudad_placa: string | null;
  propietario: string | null;
  fecha_matricula: string | null;
  imei_gps: string | null;
  fecha_pase_aeroportuario: string | null;
  multas: string | null;
  obs_multas: string | null;
  tipo_llantas: string | null;
  tipo_bombillos: string | null;
  bombilleria_farolas: string | null;
  bombilleria_stops: string | null;
  bombilleria_direccionales: string | null;
  tipo_refrigerante: string | null;
  aceite_usado: string | null;
  ref_filtro_aceite: string | null;
  ref_filtro_aire_motor: string | null;
  ref_filtro_combustible: string | null;
  bateria_principal: string | null;
  bateria_auxiliar: string | null;
  notas: string | null;
  /** No van a `vehicles` directamente: entran por `mileage_logs` (el trigger actualiza `km_actual`). */
  km_actual: number | null;
  fecha_km_actual: string | null;
}

const CAMPOS_TEXTO_VEHICULO = [
  "marca", "linea", "modelo", "color", "cilindraje", "carroceria", "numero_motor", "numero_chasis", "ciudad_placa",
  "propietario", "imei_gps", "obs_multas", "tipo_llantas", "tipo_bombillos", "bombilleria_farolas", "bombilleria_stops",
  "bombilleria_direccionales", "tipo_refrigerante", "aceite_usado", "ref_filtro_aceite", "ref_filtro_aire_motor",
  "ref_filtro_combustible", "bateria_principal", "bateria_auxiliar", "notas",
] as const;

/** Campos que la plantilla marca obligatorios (*). Vacíos NO rechazan la fila: la dejan «incompleta». */
export const CAMPOS_HOJA_COMPLETA = [
  "tipo_vehiculo", "marca", "linea", "modelo", "combustible", "km_actual", "fecha_km_actual", "tipo_llantas",
  "bombilleria_farolas", "bombilleria_stops", "bombilleria_direccionales", "tipo_refrigerante", "aceite_usado",
  "ref_filtro_aceite", "ref_filtro_aire_motor", "bateria_principal", "bateria_auxiliar",
] as const;

export function validarVehiculo(d: Record<string, unknown>): Resultado<VehiculoFila> {
  const errores: Omit<ErrorFila, "hoja" | "fila">[] = [];
  const falla = (columna: string, mensaje: string) => errores.push({ columna, mensaje });

  const placa = normalizarPlaca(d.placa);
  if (!placa) return { ok: false, errores: [{ columna: "placa", mensaje: "Falta la placa." }] };
  if (!/^[A-Z0-9]{5,7}$/.test(placa)) falla("placa", `Placa «${placa}» no parece válida (5 a 7 letras o números).`);

  const cat = <T extends readonly string[]>(campo: string, lista: T, obligatorio: boolean): T[number] | null => {
    const v = texto(d[campo])?.toUpperCase().replace(/\s+/g, "_") ?? null;
    if (!v) {
      if (obligatorio) falla(campo, "Falta el valor (es obligatorio).");
      return null;
    }
    if (!enCatalogo(lista, v)) {
      falla(campo, `«${texto(d[campo])}» no es un valor permitido (${lista.join(", ")}).`);
      return null;
    }
    return v;
  };

  const centro = cat("centro_operativo", CENTROS, true);
  const estado = texto(d.estado_actual) ? cat("estado_actual", ESTADOS, false) : null;
  const tipo = cat("tipo_vehiculo", TIPOS_VEHICULO, false);

  const combustibleCrudo = texto(d.combustible)?.toUpperCase() ?? null;
  if (combustibleCrudo && !enCatalogo(COMBUSTIBLES, combustibleCrudo)) {
    falla("combustible", `«${texto(d.combustible)}» no es un valor permitido (${COMBUSTIBLES.join(", ")}).`);
  }

  const fecha = (campo: string) => {
    const r = dia(d[campo]);
    if (r.invalido) falla(campo, `«${texto(d[campo])}» no es una fecha AAAA-MM-DD válida.`);
    return r.valor;
  };
  const fds_desde = fecha("fds_desde");
  const fecha_matricula = fecha("fecha_matricula");
  const fecha_pase_aeroportuario = fecha("fecha_pase_aeroportuario");
  const fecha_km_actual = fecha("fecha_km_actual");

  const entero = (campo: string, min: number, max: number) => {
    const t = texto(d[campo]);
    if (!t) return null;
    const n = numero(d[campo]);
    if (n === null || !Number.isInteger(n) || n < min || n > max) {
      falla(campo, `«${t}» debe ser un número entero entre ${min} y ${max}.`);
      return null;
    }
    return n;
  };
  const modeloNum = entero("modelo", 1980, 2100);
  const pasajeros = entero("pasajeros", 0, 200);
  const km_actual = entero("km_actual", 0, 5_000_000);

  if (km_actual !== null && !fecha_km_actual) falla("fecha_km_actual", "Hay km_actual pero falta su fecha.");

  const multasTxt = texto(d.multas)?.toUpperCase() ?? null;
  if (multasTxt && multasTxt !== "SI" && multasTxt !== "NO") falla("multas", "Debe ser SI o NO.");

  if (errores.length > 0) return { ok: false, errores };

  const v = {
    placa,
    centro_operativo: centro,
    estado_actual: estado,
    fds_desde,
    tipo_vehiculo: tipo,
    combustible: combustibleCrudo,
    modelo: modeloNum === null ? null : String(modeloNum),
    pasajeros,
    fecha_matricula,
    fecha_pase_aeroportuario,
    multas: multasTxt,
    km_actual,
    fecha_km_actual,
  } as VehiculoFila;
  for (const c of CAMPOS_TEXTO_VEHICULO) {
    if (c !== "modelo") (v as unknown as Record<string, unknown>)[c] = texto(d[c]);
  }
  return { ok: true, valor: v };
}

/** Nombres de los campos obligatorios de la plantilla que están vacíos: la hoja de vida «incompleta». */
export function faltantesHojaDeVida(v: object): string[] {
  const fila = v as Record<string, unknown>;
  return CAMPOS_HOJA_COMPLETA.filter((c) => fila[c] === null || fila[c] === undefined || String(fila[c]).trim() === "");
}

// ─── Documentos y costos ────────────────────────────────────────────────────

export interface DocumentoFila {
  placa: string;
  tipo: (typeof TIPOS_DOCUMENTO)[number];
  /** Puede faltar solo si tampoco hay valor: entonces la fila es un «solo vencimiento» (ver cargarHojaDeVida). */
  vigencia_desde: string | null;
  vigencia_hasta: string;
  /** null = valor aún desconocido: no se inventa, no se escribe costo. */
  valor: number | null;
  fecha_pago: string | null;
  proveedor: string | null;
  numero_documento: string | null;
  estimado: boolean;
  notas: string | null;
}

export function validarDocumento(d: Record<string, unknown>): Resultado<DocumentoFila> {
  const errores: Omit<ErrorFila, "hoja" | "fila">[] = [];
  const falla = (columna: string, mensaje: string) => errores.push({ columna, mensaje });

  const placa = normalizarPlaca(d.placa);
  if (!placa) return { ok: false, errores: [{ columna: "placa", mensaje: "Falta la placa." }] };

  const tipoCrudo = texto(d.tipo)?.toUpperCase().replace(/\s+/g, "_") ?? null;
  if (!tipoCrudo || !enCatalogo(TIPOS_DOCUMENTO, tipoCrudo)) {
    falla("tipo", `«${texto(d.tipo) ?? ""}» no es un tipo permitido (${TIPOS_DOCUMENTO.join(", ")}).`);
  }

  // Sin valor (pendiente de conseguir) la fila solo aporta el vencimiento; con valor, la vigencia completa es obligatoria.
  const hayValor = texto(d.valor) !== null;
  const valor = hayValor ? numero(d.valor) : null;
  if (hayValor && (valor === null || valor < 0)) falla("valor", `«${texto(d.valor)}» no es un valor en pesos válido.`);

  const desde = dia(d.vigencia_desde);
  const hasta = dia(d.vigencia_hasta);
  if (desde.invalido) falla("vigencia_desde", "Fecha inválida (AAAA-MM-DD).");
  if (hayValor && !desde.valor && !desde.invalido) falla("vigencia_desde", "Con valor, la fecha de inicio de la vigencia es obligatoria.");
  if (!hasta.valor) falla("vigencia_hasta", hasta.invalido ? "Fecha inválida (AAAA-MM-DD)." : "Falta la fecha.");
  if (desde.valor && hasta.valor && hasta.valor < desde.valor) falla("vigencia_hasta", "La vigencia termina antes de empezar.");

  const pago = dia(d.fecha_pago);
  if (pago.invalido) falla("fecha_pago", "Fecha inválida (AAAA-MM-DD).");

  const est = texto(d.estimado)?.toUpperCase() ?? null;
  if (est && est !== "SI" && est !== "NO") falla("estimado", "Debe ser SI o NO.");

  if (errores.length > 0) return { ok: false, errores };
  return {
    ok: true,
    valor: {
      placa,
      tipo: tipoCrudo as DocumentoFila["tipo"],
      vigencia_desde: desde.valor,
      vigencia_hasta: hasta.valor!,
      valor,
      fecha_pago: pago.valor,
      proveedor: texto(d.proveedor),
      numero_documento: texto(d.numero_documento),
      estimado: est === "SI",
      notas: texto(d.notas),
    },
  };
}

// ─── Último mantenimiento ───────────────────────────────────────────────────

export interface UltimoMantenimientoFila {
  placa: string;
  item_plan: string;
  fecha_realizado: string;
  km_realizado: number | null;
  notas: string | null;
}

export function validarUltimoMantenimiento(d: Record<string, unknown>): Resultado<UltimoMantenimientoFila> {
  const errores: Omit<ErrorFila, "hoja" | "fila">[] = [];
  const falla = (columna: string, mensaje: string) => errores.push({ columna, mensaje });

  const placa = normalizarPlaca(d.placa);
  if (!placa) return { ok: false, errores: [{ columna: "placa", mensaje: "Falta la placa." }] };
  const item = texto(d.item_plan);
  if (!item) falla("item_plan", "Falta la tarea del plan.");

  const fecha = dia(d.fecha_realizado);
  if (!fecha.valor) falla("fecha_realizado", fecha.invalido ? "Fecha inválida (AAAA-MM-DD)." : "Falta la fecha.");

  let km: number | null = null;
  if (texto(d.km_realizado)) {
    const n = numero(d.km_realizado);
    if (n === null || !Number.isInteger(n) || n < 0) falla("km_realizado", `«${texto(d.km_realizado)}» no es un kilometraje válido.`);
    else km = n;
  }

  if (errores.length > 0) return { ok: false, errores };
  return { ok: true, valor: { placa, item_plan: item!, fecha_realizado: fecha.valor!, km_realizado: km, notas: texto(d.notas) } };
}

/** Clave de comparación de textos de catálogo (tarea del plan): sin tildes, espacios ni mayúsculas. */
export function claveTexto(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}
