/**
 * Lista de servicios con la misma lógica de SISRES (mostrarServicios.php):
 * filtros, paginación de 100, avisos por hora programada y servicios estancados.
 * Sin dependencias de servidor: lo usan la página, las acciones y el cliente.
 */

export const SERVICIOS_POR_PAGINA = 100;
/** Tope de exportación, igual que EXPORT_MAX_FILAS en export/exportExcel.php. */
export const EXPORT_MAX_FILAS = 50000;

/**
 * Ciudades de la Junta (Bogotá y Medellín). La ciudad de un servicio es la de su REGISTRO (`ciudad_registro`): la del CRA
 * al que está asignado el usuario de Regulación que recibió la solicitud. Un servicio de Medellín a Chocó recibido por el
 * CRA Medellín cuenta como Medellín, sin importar su origen ni su destino. Como no hay catálogo cerrado, se agrupa por el
 * texto que empiece con el prefijo (sin acentos, sin importar mayúsculas).
 */
export const CIUDADES_SERVICIO = [
  { clave: "bogota", nombre: "Bogotá", prefijo: "bogot" },
  { clave: "medellin", nombre: "Medellín", prefijo: "medell" },
] as const;
export type CiudadServicio = (typeof CIUDADES_SERVICIO)[number]["clave"];

/** Prefijo de `ciudad_registro` para la clave elegida; null si es "ambas" o un valor desconocido. */
export function prefijoCiudad(clave: string | undefined | null): string | null {
  return CIUDADES_SERVICIO.find((c) => c.clave === clave)?.prefijo ?? null;
}

/** Cómo quedó escrita la ciudad de registro en los servicios importados de SISRES (30 mil de Bogotá, 11 mil de Medellín). */
const CIUDAD_REGISTRO_CANONICA = { bogota: "BOGOTA D.C.", medellin: "MEDELLÍN" } as const;
const CENTRO_A_CIUDAD: Record<string, CiudadServicio> = { CRA_BOGOTA: "bogota", CRA_MEDELLIN: "medellin" };

/**
 * Ciudad de registro que corresponde a quien crea el servicio: primero por su centro operativo (CRA Bogotá / CRA Medellín)
 * y, si no tiene, por la ciudad de su perfil. Vacío si no se puede saber (p. ej. un ADMIN sin centro).
 */
export function ciudadRegistroDePerfil(perfil: { centro_codigo: string | null; ciudad: string | null } | null | undefined): string {
  const porCentro = perfil?.centro_codigo ? CENTRO_A_CIUDAD[perfil.centro_codigo] : undefined;
  const ciudad = (perfil?.ciudad ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const clave = porCentro ?? CIUDADES_SERVICIO.find((c) => ciudad.startsWith(c.prefijo))?.clave;
  return clave ? CIUDAD_REGISTRO_CANONICA[clave] : "";
}

export interface FiltrosServicios {
  /** "bogota" | "medellin": ciudad de registro del servicio (la del CRA que lo recibió). Vacío = ambas. */
  ciudad?: string;
  /** Rango sobre fecha_hora_programacion (YYYY-MM-DD); SISRES exige ambos extremos. */
  desde?: string;
  hasta?: string;
  tipo?: string;
  etapa?: string;
  cliente?: string;
  origen?: string;
  destino?: string;
  cedula?: string;
}

const CLAVES: (keyof FiltrosServicios)[] = ["ciudad", "desde", "hasta", "tipo", "etapa", "cliente", "origen", "destino", "cedula"];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Lee filtros y página de los searchParams de la URL, descartando valores inválidos. */
export function leerFiltros(params: Record<string, string | string[] | undefined>): {
  filtros: FiltrosServicios;
  pagina: number;
} {
  const filtros: FiltrosServicios = {};
  for (const k of CLAVES) {
    const v = params[k];
    const s = (Array.isArray(v) ? v[0] : v)?.trim();
    if (!s) continue;
    if ((k === "desde" || k === "hasta") && !FECHA.test(s)) continue;
    if (k === "ciudad" && !prefijoCiudad(s)) continue;
    filtros[k] = s.slice(0, 120);
  }
  const p = Number(Array.isArray(params.pagina) ? params.pagina[0] : params.pagina);
  return { filtros, pagina: Number.isInteger(p) && p > 0 ? p : 1 };
}

export function filtrosAQuery(filtros: FiltrosServicios, pagina = 1): string {
  const sp = new URLSearchParams();
  for (const k of CLAVES) if (filtros[k]) sp.set(k, filtros[k] as string);
  if (pagina > 1) sp.set("pagina", String(pagina));
  const q = sp.toString();
  return q ? `?${q}` : "";
}

// ── Servicios estancados (includes/alertaEstancadoConfig.php) ──────────────
// Horas desde la hora programada sin salir de la etapa. En SISRES son
// configurables (configuracion_sistema); acá quedan fijas hasta que
// Regulación confirme los valores de producción.
export const UMBRAL_ESTANCADO_HORAS: Record<string, number> = { PROGRAMADO: 4, CURSO: 4 };

/** Horas enteras de atraso si el servicio cruzó el umbral de su etapa; si no, null. */
export function horasEstancado(
  s: { etapa: string; fecha_hora_programacion?: string | null },
  ahora: number = Date.now()
): number | null {
  const umbral = UMBRAL_ESTANCADO_HORAS[s.etapa];
  if (!umbral || !s.fecha_hora_programacion) return null;
  const prog = Date.parse(s.fecha_hora_programacion);
  if (Number.isNaN(prog) || prog > ahora) return null;
  const horas = (ahora - prog) / 3_600_000;
  return horas >= umbral ? Math.floor(horas) : null;
}

/** Avisos antes de la hora programada, en minutos (verificarAlertasProximas). */
export const UMBRALES_PROXIMOS_MIN = [60, 30, 15] as const;

// ── Exportación (export/exportExcel.php) ───────────────────────────────────

/** Columnas en el mismo orden y con los mismos títulos que el Excel de SISRES. */
export const COLUMNAS_EXPORT: [titulo: string, campo: string][] = [
  ["ID", "id"],
  ["ETAPA SERVICIO", "etapa"],
  ["NOMBRE COMPLETO", "nombre_completo"],
  ["CEDULA", "cedula_paciente"],
  ["FECHA HORA REGISTRO", "fecha_hora_registro"],
  ["TIPO SERVICIO", "tipo_servicio"],
  ["MOVIL", "movil"],
  ["FECHA HORA PROGRAMACION", "fecha_hora_programacion"],
  ["OPORTUNIDAD ATENCION (Minutos)", "oportunidad_atencion"],
  ["TURNO PROGRAMACION", "turno_programacion"],
  ["AUTORIZACION", "autorizacion"],
  ["ASESOR", "asesor"],
  ["PRESTADOR", "prestador"],
  ["DIAGNOSTICO", "diagnostico"],
  ["REQUIERE AISLAMIENTO", "requiere_aislamiento"],
  ["SOPORTE", "soporte"],
  ["DEPARTAMENTO ORIGEN", "departamento_origen"],
  ["CIUDAD ORIGEN", "ciudad_origen"],
  ["DEPARTAMENTO DESTINO", "departamento_destino"],
  ["CIUDAD DESTINO", "ciudad_destino"],
  ["PERIMETRO", "perimetro"],
  ["DIRECCION", "direccion_origen"],
  ["FECHA HORA LLEGADA ORIGEN", "fecha_hora_llegada_origen"],
  ["FECHA HORA SALIDA ORIGEN", "fecha_hora_salida_origen"],
  ["TIEMPO TOTAL ORIGEN", "tiempo_total_origen"],
  ["DIRECCION INTERMEDIA", "direccion_intermedia"],
  ["FECHA HORA LLEGADA INTERMEDIA", "fecha_hora_llegada_intermedia"],
  ["FECHA HORA SALIDA INTERMEDIA", "fecha_hora_salida_intermedia"],
  ["TIEMPO ESPERA INTERMEDIA", "tiempo_espera_intermedia"],
  ["DIRECCION DESTINO SERVICIO", "direccion_destino"],
  ["FECHA HORA LLEGADA DESTINO", "fecha_hora_llegada_destino"],
  ["FECHA HORA SALIDA DESTINO", "fecha_hora_salida_destino"],
  ["TIEMPO ESPERA DESTINO", "tiempo_espera_destino"],
  ["TIEMPO TOTAL ESPERA DESTINO", "tiempo_total"],
  ["FINALIDAD TRASLADO", "finalidad_traslado"],
  ["ACEPTA IPS", "acepta_ips"],
  ["VALOR SERVICIO", "valor_servicio"],
  ["METODO DE PAGO", "metodo_pago"],
  ["CLIENTE", "cliente"],
  ["PROVEEDOR", "proveedor"],
  ["MEDICO", "medico"],
  ["AUXILIAR", "auxiliar"],
  ["OVEM", "ovem"],
  ["USUARIO RECIBE SERVICIO", "usuario_recibe"],
  ["USUARIO DESPACHA SERVICIO", "usuario_despacha"],
  ["NOVEDAD SERVICIO", "novedad_servicio"],
  ["OBSERVACIONES", "observaciones"],
  ["ESTADO SERVICIO", "estado_servicio"],
  ["CIUDAD REGISTRO", "ciudad_registro"],
];

/**
 * Evita inyección de fórmulas al abrir el archivo en Excel (celdaExcelSegura
 * en SISRES): un texto que empieza por = + - @ o tabulador se antepone con '.
 */
export function celdaExcelSegura(valor: unknown): string | number {
  if (valor === null || valor === undefined) return "";
  if (typeof valor === "number") return valor;
  const s = String(valor);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
}

/** "2026-09-22 08:45" en hora de Colombia, 24 h: el formato de las tablas de SISRES. */
export function fechaHora24(iso: string | null | undefined, conSegundos = false): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const s = d.toLocaleString("sv-SE", { timeZone: "America/Bogota" });
  return conSegundos ? s : s.slice(0, 16);
}
