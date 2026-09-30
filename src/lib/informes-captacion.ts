import { diaEnBogota, edadEn, esDia } from "@/lib/fechas";
import { NOTIFICACIONES_OBLIGATORIAS, OTRAS_PATOLOGIAS, PATOLOGIAS_SISTEMA, POST_OPERATORIOS } from "@/lib/captacion";

// Informes regulatorios de la captación aeroportuaria (ACM, Aerocivil, PME, PAE), portados de
// includes/informe*Calculo.php de SISRES. Funciones puras: reciben las captaciones ya filtradas por
// período y aeropuerto y devuelven los conteos. Las categorías salen en el mismo orden y con los mismos
// textos que el formato oficial, incluidas las que no tuvieron datos.

export interface FilaInforme {
  fecha_atencion: string;
  fecha_nacimiento: string | null;
  sexo: string | null;
  tipo_identificacion: string;
  tipo_atencion: string | null;
  resultado_autorizacion: string | null;
  lugar_atencion: string | null;
  condicion: string | null;
  accidente_especial: string | null;
  notificacion_obligatoria: string | null;
  tipo_vuelo: string | null;
  patologia_sistema: string | null;
  otra_patologia: string | null;
  post_operatorio: string | null;
  emergencia_tipo: string | null;
  procedimientos: string[] | null;
  aerolinea: string | null;
}

/** Hombres / Mujeres / Total. T cuenta también a quien no tiene sexo registrado. */
export interface HMT {
  H: number;
  M: number;
  T: number;
}

export type TablaHMT = Record<string, HMT>;
export type TablaCantidad = Record<string, number>;

const NO_REPORTABLES = ["NINGUNO", "NO APLICA"];
const sinNoAplica = (lista: readonly string[]) => lista.filter((v) => !NO_REPORTABLES.includes(v));

function hmt(categorias: readonly string[]): TablaHMT {
  return Object.fromEntries(categorias.map((c) => [c, { H: 0, M: 0, T: 0 }]));
}

function cantidades(categorias: readonly string[]): TablaCantidad {
  return Object.fromEntries(categorias.map((c) => [c, 0]));
}

function sumar(tabla: TablaHMT, categoria: string, sexo: string | null) {
  const c = tabla[categoria];
  if (!c) return;
  c.T++;
  if (sexo === "M") c.H++;
  else if (sexo === "F") c.M++;
}

function contar(tabla: TablaCantidad, categoria: string | null) {
  const clave = (categoria ?? "").trim();
  if (clave in tabla) tabla[clave]++;
}

const texto = (v: string | null) => (v ?? "").trim().toUpperCase();

/** Edad en años cumplidos el día de la atención (hora de Colombia), o null si falta o no cuadra la fecha de nacimiento. */
export function edadAlAtender(f: Pick<FilaInforme, "fecha_nacimiento" | "fecha_atencion">): number | null {
  if (!f.fecha_nacimiento || !esDia(f.fecha_nacimiento)) return null;
  const edad = edadEn(f.fecha_nacimiento, diaEnBogota(f.fecha_atencion));
  return edad >= 0 ? edad : null;
}

// ─── Informe ACM (consolidado estadístico) ──────────────────────────────────

// Valor guardado → rótulo del informe (SISRES renombra ACCIDENTE LABORAL en el formato oficial).
const TIPO_ATENCION_ACM: Record<string, string> = {
  "ACCIDENTE LABORAL": "ACCIDENTE DE TRABAJO",
  "ACCIDENTE DE TRANSITO": "ACCIDENTE DE TRANSITO",
  "OTRO TIPO DE ACCIDENTE": "OTRO TIPO DE ACCIDENTE",
  "ENFERMEDAD GENERAL": "ENFERMEDAD GENERAL",
  "AUTORIZACION DE VUELO": "AUTORIZACION DE VUELO",
  REMISION: "REMISION",
};
export const ACM_CONDICION = ["PASAJERO", "TRIPULANTE", "EMPLEADO", "VISITANTE"] as const;
export const ACM_CONDICION_TRANSITO = ["CONDUCTOR", "PEATÓN", "OTRO"] as const;
export const ACM_IDENTIDAD = ["CC", "TI", "RC", "PAS", "OTROS"] as const;
export const ACM_ACCIDENTE_ESPECIAL = ["OFÍDICO", "RÁBICO", "MORDEDURA OTRO TIPO"] as const;
export const ACM_GRUPO_ETAREO = [
  "MENOS DE 1 AÑO", "DE 1 A 5", "DE 6 A 11", "DE 12 A 18", "DE 19 A 29", "DE 30 A 44", "DE 45 A 60", "MAYOR DE 60 AÑOS",
] as const;
export const ACM_TIPO_VUELO = ["COMERCIAL", "AMBULANCIA", "CHARTER"] as const;
export const ACM_EMERGENCIAS = ["ALISTAMIENTOS", "ACCIDENTES AEREOS", "CONTINGENCIAS", "EMERGENCIA SALUD PUBLICA"] as const;

// Tipos de identificación de SISMANTO (códigos SISPRO) → sigla del informe. El certificado de nacido vivo cuenta
// como registro civil, igual que en SISRES.
const IDENTIDAD_ACM: Record<string, (typeof ACM_IDENTIDAD)[number]> = { CC: "CC", TI: "TI", RC: "RC", NV: "RC", PA: "PAS" };

function grupoEtareoAcm(edad: number): (typeof ACM_GRUPO_ETAREO)[number] {
  if (edad < 1) return "MENOS DE 1 AÑO";
  if (edad <= 5) return "DE 1 A 5";
  if (edad <= 11) return "DE 6 A 11";
  if (edad <= 18) return "DE 12 A 18";
  if (edad <= 29) return "DE 19 A 29";
  if (edad <= 44) return "DE 30 A 44";
  if (edad <= 60) return "DE 45 A 60";
  return "MAYOR DE 60 AÑOS";
}

export interface InformeAcm {
  totalPacientes: number;
  tipoAtencion: TablaHMT;
  resultadoAutorizacion: TablaHMT;
  condicion: TablaHMT;
  condicionTransito: TablaHMT;
  identidad: TablaHMT;
  accidentesEspeciales: TablaHMT;
  grupoEtareo: TablaHMT;
  notificacionObligatoria: TablaHMT;
  tipoVuelo: TablaHMT;
  patologiaSistema: TablaCantidad;
  otraPatologia: TablaCantidad;
  postOperatorio: TablaCantidad;
  emergencias: TablaCantidad;
}

export function calcularInformeAcm(filas: FilaInforme[]): InformeAcm {
  const r: InformeAcm = {
    totalPacientes: filas.length,
    tipoAtencion: hmt(Object.values(TIPO_ATENCION_ACM)),
    resultadoAutorizacion: hmt(["APTO", "NO APTO"]),
    condicion: hmt(ACM_CONDICION),
    condicionTransito: hmt(ACM_CONDICION_TRANSITO),
    identidad: hmt(ACM_IDENTIDAD),
    accidentesEspeciales: hmt(ACM_ACCIDENTE_ESPECIAL),
    grupoEtareo: hmt(ACM_GRUPO_ETAREO),
    notificacionObligatoria: hmt(sinNoAplica(NOTIFICACIONES_OBLIGATORIAS)),
    tipoVuelo: hmt(ACM_TIPO_VUELO),
    patologiaSistema: cantidades(PATOLOGIAS_SISTEMA),
    otraPatologia: cantidades(OTRAS_PATOLOGIAS),
    postOperatorio: cantidades(POST_OPERATORIOS),
    emergencias: cantidades(ACM_EMERGENCIAS),
  };

  for (const f of filas) {
    const sexo = f.sexo;
    const tipoAtencion = TIPO_ATENCION_ACM[texto(f.tipo_atencion)];
    if (tipoAtencion) sumar(r.tipoAtencion, tipoAtencion, sexo);
    sumar(r.resultadoAutorizacion, texto(f.resultado_autorizacion), sexo);

    // La condición se reparte en dos tablas: la del aeropuerto y la de tránsito.
    const condicion = texto(f.condicion);
    if (condicion in r.condicion) sumar(r.condicion, condicion, sexo);
    else sumar(r.condicionTransito, condicion, sexo);

    if (f.tipo_identificacion) sumar(r.identidad, IDENTIDAD_ACM[f.tipo_identificacion] ?? "OTROS", sexo);
    sumar(r.accidentesEspeciales, texto(f.accidente_especial), sexo);

    const edad = edadAlAtender(f);
    if (edad !== null) sumar(r.grupoEtareo, grupoEtareoAcm(edad), sexo);

    sumar(r.notificacionObligatoria, texto(f.notificacion_obligatoria), sexo);
    sumar(r.tipoVuelo, texto(f.tipo_vuelo), sexo);
    contar(r.patologiaSistema, f.patologia_sistema);
    contar(r.otraPatologia, f.otra_patologia);
    contar(r.postOperatorio, f.post_operatorio);
    contar(r.emergencias, f.emergencia_tipo);
  }
  return r;
}

// ─── Informe Aerocivil (formato GSAP2.2-8-02) ───────────────────────────────

export const AEROCIVIL_GRUPO_ETAREO = ["DE 0 A <1", "DE 1 A 5", "DE 5 A 11", "DE 12 A 29", "DE 30 A 44", "DE 45 A 60", "DE 60 Y MAS"] as const;
// Mismo orden que el formato de la Aerocivil (OTROS va antes de los embarazos, a diferencia del formulario).
export const AEROCIVIL_PATOLOGIAS = [
  ...PATOLOGIAS_SISTEMA.filter((p) => p !== "OTROS" && !p.startsWith("EMBARAZO")),
  "OTROS",
  "EMBARAZO SIN COMPLICACIONES",
  "EMBARAZO COMPLICADO",
];

const TIPOS_ACCIDENTE = ["ACCIDENTE LABORAL", "ACCIDENTE DE TRANSITO", "OTRO TIPO DE ACCIDENTE"];
// Procedimientos que alimentan las columnas del formato Aerocivil.
const PROC_INYECCION = "ADMINISTRACIÓN DE MEDICAMENTOS IV  Y/O  IM";
const PROC_CURACION = "SUTURAS, CURACIONES Y LAVADOS";
const PROC_SILLA = "SERVICIOS DE SILLA DE RUEDA";
const PROC_AMBULANCIA = ["SERVICIOS DE AMBULANCIAS DE SANIDAD", "AMBULANCIAS EXTERNAS"];

function grupoEtareoAerocivil(edad: number): (typeof AEROCIVIL_GRUPO_ETAREO)[number] {
  if (edad < 1) return "DE 0 A <1";
  if (edad <= 5) return "DE 1 A 5";
  if (edad <= 11) return "DE 5 A 11";
  if (edad <= 29) return "DE 12 A 29";
  if (edad <= 44) return "DE 30 A 44";
  if (edad <= 60) return "DE 45 A 60";
  return "DE 60 Y MAS";
}

export interface InformeAerocivil {
  totalPacientes: number;
  totalServicio: number;
  totalExterno: number;
  hombres: number;
  mujeres: number;
  pasajeros: number;
  tripulantes: number;
  empleados: number;
  accidentes: number;
  enfermos: number;
  remisiones: number;
  visitantes: number;
  patologias: TablaCantidad;
  inyecciones: number;
  curaciones: number;
  sillaRuedas: number;
  ambulancia: number;
  vueloComercial: HMT;
  vueloAmbulancia: HMT;
  grupoEtareo: TablaHMT;
}

export function calcularInformeAerocivil(filas: FilaInforme[]): InformeAerocivil {
  const r: InformeAerocivil = {
    totalPacientes: filas.length,
    totalServicio: 0,
    totalExterno: 0,
    hombres: 0,
    mujeres: 0,
    pasajeros: 0,
    tripulantes: 0,
    empleados: 0,
    accidentes: 0,
    enfermos: 0,
    remisiones: 0,
    visitantes: 0,
    patologias: cantidades(AEROCIVIL_PATOLOGIAS),
    inyecciones: 0,
    curaciones: 0,
    sillaRuedas: 0,
    ambulancia: 0,
    vueloComercial: { H: 0, M: 0, T: 0 },
    vueloAmbulancia: { H: 0, M: 0, T: 0 },
    grupoEtareo: hmt(AEROCIVIL_GRUPO_ETAREO),
  };

  for (const f of filas) {
    if (f.sexo === "M") r.hombres++;
    else if (f.sexo === "F") r.mujeres++;

    const lugar = texto(f.lugar_atencion);
    if (lugar === "SERVICIO") r.totalServicio++;
    else if (lugar === "EXTERNO") r.totalExterno++;

    const condicion = texto(f.condicion);
    if (condicion === "PASAJERO") r.pasajeros++;
    else if (condicion === "TRIPULANTE") r.tripulantes++;
    else if (condicion === "EMPLEADO") r.empleados++;
    else if (condicion === "VISITANTE") r.visitantes++;

    const tipoAtencion = texto(f.tipo_atencion);
    if (TIPOS_ACCIDENTE.includes(tipoAtencion)) r.accidentes++;
    else if (tipoAtencion === "ENFERMEDAD GENERAL") r.enfermos++;
    else if (tipoAtencion === "REMISION") r.remisiones++;

    contar(r.patologias, f.patologia_sistema);

    const procs = f.procedimientos ?? [];
    if (procs.includes(PROC_INYECCION)) r.inyecciones++;
    if (procs.includes(PROC_CURACION)) r.curaciones++;
    if (procs.includes(PROC_SILLA)) r.sillaRuedas++;
    if (PROC_AMBULANCIA.some((p) => procs.includes(p))) r.ambulancia++;

    const vuelo = texto(f.tipo_vuelo);
    const tablaVuelo = vuelo === "COMERCIAL" ? r.vueloComercial : vuelo === "AMBULANCIA" ? r.vueloAmbulancia : null;
    if (tablaVuelo) {
      tablaVuelo.T++;
      if (f.sexo === "M") tablaVuelo.H++;
      else if (f.sexo === "F") tablaVuelo.M++;
    }

    const edad = edadAlAtender(f);
    if (edad !== null) sumar(r.grupoEtareo, grupoEtareoAerocivil(edad), f.sexo);
  }
  return r;
}

// ─── Informe PME (procedimientos médicos y de enfermería) ───────────────────

// Los 20 procedimientos del formato oficial: se excluyen las actividades administrativas/de capacitación y
// NINGUNO/NO APLICA, que el formulario ofrece pero el informe no cuenta.
export const PME_PROCEDIMIENTOS = [
  "ACOMPAÑAMIENTO A PACIENTES TRASLADADOS EN AMBULANCIA",
  "ATENCION DE CONSULTAS MEDICAS",
  "ATENCION DE LLAMADAS DE EMERGENCIAS DE AERONAVES",
  "ATENCION DE LLAMADAS DE EMERGENCIAS DE PASAJEROS Y/O TRIPULACIONES",
  "ATENCION DE PACIENTES URGENTES",
  "ATENCION DE PACIENTES LESIONADOS EN EL AEROPUERTO",
  "AUTORIZACION DE ORGANOS (COMPONENTE ANATOMICO)",
  "VERIFICACIÓN DOCUMENTACIÓN SANITARIA FERETROS",
  "AMBULANCIAS EXTERNAS",
  "ELECTROCARDIOGRAMAS",
  "GLUCOMETRIA",
  "MONITOREO DE PACIENTES",
  "SALIDA POR LLAMADAS DE ACCIDENTES EXTERNOS",
  "SERVICIOS DE AMBULANCIAS DE SANIDAD",
  "SERVICIOS DE SILLA DE RUEDA",
  "ADMINISTRACIÓN DE MEDICAMENTOS IV  Y/O  IM",
  "ADMINISTRACIÓN DE MEDICAMENTOS VO",
  "SUTURAS, CURACIONES Y LAVADOS",
  "TERAPIAS RESPIRATORIAS Y NEBULIZACIONES",
  "TOMAS Y CONTROLES DE TENSION ARTERIAL",
] as const;

export interface InformePme {
  conteo: TablaCantidad;
  total: number;
}

export function calcularInformePme(filas: FilaInforme[]): InformePme {
  const conteo = cantidades(PME_PROCEDIMIENTOS);
  for (const f of filas) for (const p of f.procedimientos ?? []) contar(conteo, p);
  return { conteo, total: Object.values(conteo).reduce((a, b) => a + b, 0) };
}

// ─── Informe PAE (pacientes atendidos por empresa) ──────────────────────────

export interface ConteoEmpresa {
  EMPLEADOS: number;
  PASAJEROS: number;
  /** Todas las captaciones de la empresa, sin importar la condición (incluye tripulantes, visitantes…). */
  TOTAL: number;
}

export interface InformePae {
  conteo: Record<string, ConteoEmpresa>;
  totalGeneral: ConteoEmpresa;
}

/** `empresas`: el catálogo de aerolíneas activas, en el orden en que se muestran (el del formato oficial). */
export function calcularInformePae(filas: FilaInforme[], empresas: string[]): InformePae {
  const conteo: Record<string, ConteoEmpresa> = Object.fromEntries(
    empresas.map((e) => [e, { EMPLEADOS: 0, PASAJEROS: 0, TOTAL: 0 }])
  );
  const totalGeneral: ConteoEmpresa = { EMPLEADOS: 0, PASAJEROS: 0, TOTAL: 0 };
  for (const f of filas) {
    const c = conteo[(f.aerolinea ?? "").trim()];
    if (!c) continue;
    c.TOTAL++;
    totalGeneral.TOTAL++;
    const condicion = texto(f.condicion);
    if (condicion === "EMPLEADO") {
      c.EMPLEADOS++;
      totalGeneral.EMPLEADOS++;
    } else if (condicion === "PASAJERO") {
      c.PASAJEROS++;
      totalGeneral.PASAJEROS++;
    }
  }
  return { conteo, totalGeneral };
}
