import { diaEnBogota } from "@/lib/fechas";
// Captación de pacientes aeroportuarios + reporte SISPRO (migración 080/081).
// Listas fijas portadas de registroCaptacion.php de SISRES y códigos del libro "SISPRO 2026".
// Todo lo de aquí es puro (sin base de datos) para poder probarlo con datos inventados.

export const TIPOS_IDENTIFICACION = [
  { codigo: "CC", nombre: "Cédula de Ciudadanía" },
  { codigo: "TI", nombre: "Tarjeta de Identidad" },
  { codigo: "RC", nombre: "Registro Civil" },
  { codigo: "CE", nombre: "Cédula de Extranjería" },
  { codigo: "PA", nombre: "Pasaporte" },
  { codigo: "MS", nombre: "Menor sin identificación" },
  { codigo: "AS", nombre: "Adulto sin identificación" },
  { codigo: "CD", nombre: "Carnet diplomático" },
  { codigo: "NV", nombre: "Certificado de nacido vivo (menores de 2 meses)" },
] as const;

// Códigos numéricos del reporte SISPRO (ver los avisos de las celdas del libro).
export const TIPOS_USUARIO = [
  { codigo: 1, nombre: "Trabajador del aeropuerto" },
  { codigo: 2, nombre: "Tripulante" },
  { codigo: 3, nombre: "Visitante" },
  { codigo: 4, nombre: "Pasajero" },
] as const;
export const MOMENTOS_ATENCION = [
  { codigo: 1, nombre: "Antes de abordar el avión" },
  { codigo: 2, nombre: "Después de bajarse del avión" },
  { codigo: 3, nombre: "Acompañando a un viajero" },
  { codigo: 4, nombre: "No aplica" },
] as const;
export const MOTIVOS_CONSULTA = [
  { codigo: 1, nombre: "Accidente aéreo" },
  { codigo: 2, nombre: "Accidente de trabajo" },
  { codigo: 3, nombre: "Accidente de tránsito" },
  { codigo: 4, nombre: "Enfermedad" },
  { codigo: 5, nombre: "Traslado de paciente" },
  { codigo: 6, nombre: "Traslado de cadáver" },
] as const;
export const TIPOS_EGRESO = [
  { codigo: 1, nombre: "Por sus propios medios" },
  { codigo: 2, nombre: "Traslado en ambulancia terrestre" },
  { codigo: 3, nombre: "Traslado en ambulancia aérea" },
] as const;

// Listas fijas de la captación de SISRES.
export const TIPOS_ATENCION = [
  "AUTORIZACION DE VUELO",
  "ENFERMEDAD GENERAL",
  "ACCIDENTE LABORAL",
  "REMISION",
  "ACCIDENTE DE TRANSITO",
  "OTRO TIPO DE ACCIDENTE",
] as const;
export const LUGARES_ATENCION = ["SERVICIO", "EXTERNO"] as const;
export const LADOS_ATENCION = ["TIERRA", "AIRE"] as const;
export const UBICACIONES_POR_LADO: Record<(typeof LADOS_ATENCION)[number], readonly string[]> = {
  TIERRA: ["AREA TERMINAL", "VIAS DE ACCESO"],
  AIRE: ["AREA MANIOBRAS", "PLATAFORMA"],
};
export const CONDICIONES = ["PASAJERO", "TRIPULANTE", "EMPLEADO", "VISITANTE", "PEATÓN", "CONDUCTOR", "OTRO"] as const;
export const PATOLOGIAS_SISTEMA = [
  "E. INFECC", "E. PARASIT", "TUMORALES", "E. ENDOCR. NUTR METAB", "E. SANGRE ORGAN H", "TRANSTORNOS MENTALES",
  "ENF. SIST. NERVIOSO", "E. ORGANOS DE LOS SENTIDOS", "APARATO CIRCULATORIO", "APARATO RESPIRATORIO ALTO",
  "APARATO RESPIRATORIO BAJO", "E. APARATO DIGESTIVO", "E. APARATO GENITAL", "E. APARATO URINARIO", "E. PIEL Y T.O.S",
  "E. SISTEMA OSEO", "E. SISTEMA MUSCULAR", "E. CONGENITAS", "SIGNOS Y SINTOMAS MAL DEFINIDOS", "E. PERINATAL",
  "TRAUMAS", "ENVENENAMIENTO", "EMBARAZO SIN COMPLICACIONES", "EMBARAZO COMPLICADO", "OTROS",
] as const;
export const OTRAS_PATOLOGIAS = [
  "ACCIDENTE CEREBRAL", "CANCER", "DIABETES MELLITUS", "DOLOR ABDOMINAL", "DOLOR PRECORDIAL/ ANGINA",
  "ENF. DIARREICA AGUDA", "EPOC", "FRACTURAS", "HERIDAS POR CORTO PUNZANTE", "HIPERTENSION ARTERIAL", "INTOXICACION",
  "NEUMONIA", "QUEMADURAS", "RECIEN NACIDOS", "RINOFARINGITIS", "ODONTALGIAS (BAROTRAUMA)", "CEFALEA (BAROTRAUMA)",
  "OTALGIAS (BAROTRAUMA)", "PSIQUIATRICAS", "NEUROLOGICAS", "POST OPERATORIOS VARIOS",
] as const;
export const POST_OPERATORIOS = [
  "POST OPERATORIOS CIRUGIA PLASTICA", "POST OPERATORIOS CARDIOVASCULARES, TORACICAS Y ABDOMINALES",
  "POST OPERATORIOS ORTOPEDICOS", "POST OPERATORIO OTORRINO", "POST OPERATORIO OFTALMOLOGICO",
  "POST OPERATORIO NEUROLOGICO", "OTROS POST OPERATORIOS",
] as const;
export const ACCIDENTES_ESPECIALES = ["OFÍDICO", "RÁBICO", "MORDEDURA OTRO TIPO", "NINGUNO", "NO APLICA"] as const;
export const NOTIFICACIONES_OBLIGATORIAS = [
  "ACCIDENTE OFIDICO", "RABIA", "CHIKUNGUNYA", "COLERA", "DENGE", "EBOLA", "ESI - IRA GRAVE", "ETA", "MALARIA",
  "SARAMPION", "RUBEOLA", "VARICELA", "ZIKA", "TBC", "INTOXICACIONES", "EVENTO SIN ESTABLECER", "NINGUNO", "NO APLICA",
] as const;
export const TIPOS_VUELO = ["AMBULANCIA", "COMERCIAL", "CHARTER", "NO APLICA"] as const;
export const PROCEDIMIENTOS = [
  "ACOMPAÑAMIENTO A PACIENTES TRASLADADOS EN AMBULANCIA", "ACTIVIDADES DE CAPACITACION PROPIAS Y A OTRO PERSONAL",
  "ATENCION DE CONSULTAS MEDICAS", "ATENCION DE LLAMADAS DE EMERGENCIAS DE AERONAVES",
  "ATENCION DE LLAMADAS DE EMERGENCIAS DE PASAJEROS Y/O TRIPULACIONES", "ATENCION DE PACIENTES URGENTES",
  "ATENCION DE PACIENTES LESIONADOS EN EL AEROPUERTO", "AUTORIZACION DE ORGANOS (COMPONENTE ANATOMICO)",
  "VERIFICACIÓN DOCUMENTACIÓN SANITARIA FERETROS", "AMBULANCIAS EXTERNAS", "ELECTROCARDIOGRAMAS", "GLUCOMETRIA",
  "MONITOREO DE PACIENTES", "REUNION DE PERSONAL Y ADMINISTRATIVAS", "REUNIONES ADMINISTRATIVAS Y/O ACADEMICAS",
  "SALIDA POR LLAMADAS DE ACCIDENTES EXTERNOS", "SERVICIOS DE AMBULANCIAS DE SANIDAD", "SERVICIOS DE SILLA DE RUEDA",
  "ADMINISTRACIÓN DE MEDICAMENTOS IV  Y/O  IM", "ADMINISTRACIÓN DE MEDICAMENTOS VO", "SUTURAS, CURACIONES Y LAVADOS",
  "TERAPIAS RESPIRATORIAS Y NEBULIZACIONES", "TOMAS Y CONTROLES DE TENSION ARTERIAL", "NINGUNO", "NO APLICA",
] as const;
export const EMERGENCIAS_TIPO = ["EMERGENCIA SALUD PUBLICA", "ACCIDENTES AEREOS", "ALISTAMIENTOS", "CONTINGENCIAS"] as const;

// ─── Reporte SISPRO ─────────────────────────────────────────────────────────

/** Encabezados exactos de las 38 columnas (A–AL) de cada hoja mensual del libro SISPRO. */
export const COLUMNAS_SISPRO = [
  "#", "Fecha de atención", "Aeropuerto de atención", "Tipo de identificación del usuario",
  "Número de identificación del usuario", "Primer Nombre", "Segundo Nombre", "Primer Apellido", "Segundo Apellido",
  "Fecha de nacimiento", "Sexo", "Nacionalidad", "Nombre del País de residencia", "Pais de residencia",
  "Nombre del Pais de procedencia", "Pais de procedencia", "Aeropuerto de Procedencia",
  "Nombre de la Ciudad de procedencia", "Nombre de la Ciudad de procedencia", "Tipo de Usuario",
  "Momento de la atención", "Motivo de consulta", "Nombre del diagnóstico", "CODIGO DEL DIAGNOSTICO",
  "Tipo de egreso del usuario", "Remisión", "Nombre de IPS Receptora", "Código de la IPS Receptora", "Teléfono",
  "Origen", "Destino", "Recibio medicamentos (SI/NO)", "Nombre del medicamento", "Presento evento adverso (SI/NO)",
  "Se utilizó algun dispositivo (SI/NO)", "Nombre del dispositivo", "Presento evento adverso (SI/NO)",
  "Médico que atendio",
] as const;

export interface CaptacionParaSispro {
  id: number;
  fecha_atencion: string;
  aeropuerto_atencion: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
  nacionalidad: string;
  pais_residencia: string;
  pais_procedencia: string;
  aeropuerto_procedencia: string | null;
  telefono: string | null;
  tipo_usuario: number;
  momento_atencion: number;
  motivo_consulta: number;
  tipo_egreso: number;
  cie10: string | null;
  remision: boolean;
  ips_receptora: string | null;
  origen: string | null;
  destino: string | null;
  recibio_medicamentos: boolean;
  medicamento: string | null;
  evento_adverso_medicamento: boolean | null;
  uso_dispositivo: boolean;
  dispositivo: string | null;
  evento_adverso_dispositivo: boolean | null;
  medico_atendio: string | null;
}

/** Tablas de referencia (las mismas hojas PAISES / AEROPUERTOS / IPS / DIAGNOSTICOS del libro). */
export interface CatalogosSispro {
  paises: ReadonlyMap<string, string>; // nombre → código ISO
  aeropuertos: ReadonlyMap<string, { ciudad: string; codigo_ciudad: string | null }>; // nombre → ciudad
  ips: ReadonlyMap<string, string>; // nombre → código
  cie10: ReadonlyMap<string, string>; // código → nombre
}

const mayus = (v: string | null | undefined) => (v ?? "").replace(/\s+/g, " ").trim().toUpperCase();
const siNo = (v: boolean | null | undefined) => (v === null || v === undefined ? "" : v ? "SI" : "NO");

/** Fecha (yyyy-MM-dd) del instante dado, en hora de Colombia (UTC-5, sin horario de verano). */
export function diaColombia(iso: string): string {
  return diaEnBogota(iso);
}

/** dd/MM/aaaa — formato de "Fecha de atención" en el libro. */
export function fechaSispro(yyyyMmDd: string | null): string {
  if (!yyyyMmDd) return "";
  const [a, m, d] = yyyyMmDd.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

/**
 * Una fila del reporte, en el orden de COLUMNAS_SISPRO. Reproduce las fórmulas del libro:
 * el código del país, la ciudad de procedencia (y su código), el nombre del diagnóstico y el
 * código de la IPS salen de los catálogos; lo que no aparece se marca igual que el libro
 * ("FALTA EL PAIS", "FALTA CIUDAD", …) para que se vea y se corrija antes de enviar.
 */
export function filaSispro(c: CaptacionParaSispro, consecutivo: number, cat: CatalogosSispro): (string | number)[] {
  const paisRes = mayus(c.pais_residencia);
  const paisProc = mayus(c.pais_procedencia);
  const aeroProc = mayus(c.aeropuerto_procedencia);
  const aero = cat.aeropuertos.get(aeroProc);
  const cie = mayus(c.cie10);
  const ips = mayus(c.ips_receptora);

  return [
    consecutivo,
    fechaSispro(diaColombia(c.fecha_atencion)),
    mayus(c.aeropuerto_atencion),
    c.tipo_identificacion,
    mayus(c.numero_identificacion),
    mayus(c.primer_nombre),
    mayus(c.segundo_nombre) || "NONE",
    mayus(c.primer_apellido),
    mayus(c.segundo_apellido) || "NONE",
    c.fecha_nacimiento ? fechaSispro(c.fecha_nacimiento) : "",
    c.sexo ?? "",
    mayus(c.nacionalidad),
    paisRes,
    cat.paises.get(paisRes) ?? "FALTA EL PAIS",
    paisProc,
    cat.paises.get(paisProc) ?? "FALTA EL PAIS",
    aeroProc,
    aero ? aero.ciudad : "FALTA CIUDAD",
    aero ? (aero.codigo_ciudad ?? "FALTA CIUDAD") : "FALTA CIUDAD",
    c.tipo_usuario,
    c.momento_atencion,
    c.motivo_consulta,
    cie ? (cat.cie10.get(cie) ?? "NO HAY CODIGO SELECCIONADO") : "NO HAY CODIGO SELECCIONADO",
    cie,
    c.tipo_egreso,
    c.remision ? 1 : 2, // 1 = SI, 2 = NO
    c.remision ? ips : "",
    c.remision ? (cat.ips.get(ips) ?? "NO HA SELECCIONADO LA IPS") : "",
    (c.telefono ?? "").trim(),
    mayus(c.origen) || "NO APLICA",
    mayus(c.destino) || "NO APLICA",
    siNo(c.recibio_medicamentos),
    c.recibio_medicamentos ? mayus(c.medicamento) : "",
    c.recibio_medicamentos ? siNo(c.evento_adverso_medicamento) : "",
    siNo(c.uso_dispositivo),
    c.uso_dispositivo ? mayus(c.dispositivo) : "",
    c.uso_dispositivo ? siNo(c.evento_adverso_dispositivo) : "",
    mayus(c.medico_atendio),
  ];
}

/** Separa "Código-Nombre" (como lo guarda SISRES en el select de CIE-10) y devuelve solo el código. */
export function codigoCie10(valor: string): string {
  return valor.split("-")[0].trim().toUpperCase();
}

/** Descompone un nombre completo en 4 partes de forma razonable (apoyo al ETL; el formulario los pide por separado). */
export function partirNombreCompleto(completo: string): { n1: string; n2: string; a1: string; a2: string } {
  const p = mayus(completo).split(" ").filter(Boolean);
  if (p.length === 1) return { n1: p[0], n2: "", a1: p[0], a2: "" };
  if (p.length === 2) return { n1: p[0], n2: "", a1: p[1], a2: "" };
  if (p.length === 3) return { n1: p[0], n2: "", a1: p[1], a2: p[2] };
  return { n1: p[0], n2: p[1], a1: p[2], a2: p.slice(3).join(" ") };
}

// ─── Permisos ───────────────────────────────────────────────────────────────
// Deben coincidir con puede_captacion() de la migración 080 (la base es la que manda).
const ROLES_CAPTACION = ["ADMIN", "ANALISTA", "COORDINACION", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA"];
export const ROLES_CAPTACION_LISTA = ROLES_CAPTACION as ("ADMIN" | "ANALISTA" | "COORDINACION" | "REGULACION" | "MEDICO" | "AUXILIAR_ENFERMERIA")[];

/** Ver, registrar y exportar el reporte SISPRO. */
export function puedeUsarCaptacion(role: string | undefined | null): boolean {
  return !!role && ROLES_CAPTACION.includes(role);
}
/** Editar y eliminar registros (cargo 1 de SISRES). */
export function puedeAdministrarCaptacion(role: string | undefined | null): boolean {
  return role === "ADMIN";
}

// ─── Campos obligatorios configurables (migración 086) ──────────────────────
// Solo los OPCIONALES del formulario: los que exige SISPRO (identificación, nombres, país, tipo de usuario, momento,
// motivo, egreso, CIE-10, médico…) siempre son obligatorios y no se configuran.
export const CAMPOS_CONFIGURABLES = [
  { campo: "tipo_atencion", etiqueta: "Tipo de atención" },
  { campo: "lugar_atencion", etiqueta: "Lugar de atención" },
  { campo: "lado_atencion", etiqueta: "Lado" },
  { campo: "ubicacion_atencion", etiqueta: "Ubicación" },
  { campo: "detalle_ubicacion", etiqueta: "Detalle de la ubicación" },
  { campo: "tiempo_activacion", etiqueta: "Hora de activación" },
  { campo: "tiempo_llegada", etiqueta: "Hora de llegada" },
  { campo: "fecha_nacimiento", etiqueta: "Fecha de nacimiento" },
  { campo: "telefono", etiqueta: "Teléfono" },
  { campo: "condicion", etiqueta: "Condición" },
  { campo: "patologia_sistema", etiqueta: "Patología por sistema" },
  { campo: "otra_patologia", etiqueta: "Otra patología" },
  { campo: "post_operatorio", etiqueta: "Post operatorio" },
  { campo: "accidente_especial", etiqueta: "Accidente especial" },
  { campo: "notificacion_obligatoria", etiqueta: "Notificación obligatoria" },
  { campo: "tipo_vuelo", etiqueta: "Tipo de vuelo" },
  { campo: "aerolinea", etiqueta: "Aerolínea o entidad" },
  { campo: "origen", etiqueta: "Origen" },
  { campo: "destino", etiqueta: "Destino" },
  { campo: "emergencia_tipo", etiqueta: "Tipo de emergencia" },
] as const;

export type CampoConfigurable = (typeof CAMPOS_CONFIGURABLES)[number]["campo"];
const NOMBRES_CONFIGURABLES: readonly string[] = CAMPOS_CONFIGURABLES.map((c) => c.campo);

/** ¿Es un campo que se puede marcar como obligatorio? (el servidor no acepta nombres que no estén en la lista). */
export function esCampoConfigurable(campo: string): campo is CampoConfigurable {
  return NOMBRES_CONFIGURABLES.includes(campo);
}

/**
 * Etiquetas de los campos obligatorios que vienen vacíos. Vacío = undefined, null o solo espacios. Un campo marcado
 * obligatorio que el servidor no conoce se ignora (una fila vieja no debe bloquear todo el formulario).
 */
export function camposObligatoriosFaltantes(datos: Record<string, unknown>, obligatorios: readonly string[]): string[] {
  const vacio = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  return CAMPOS_CONFIGURABLES.filter((c) => obligatorios.includes(c.campo) && vacio(datos[c.campo])).map((c) => c.etiqueta);
}
