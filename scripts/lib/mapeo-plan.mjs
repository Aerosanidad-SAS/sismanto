// Mapeo del historial de mantenimientos (Excel de control) a las tareas del plan preventivo de SISMANTO.
// Función pura y sin base de datos para poder probarla. Decisiones (Daniel, 2026-11-25): se decide por SERVICIO
// (misma placa + fecha + factura), no por fila; cuenta lo que se hizo y no el tipo preventivo/correctivo; la mano
// de obra hereda; las tareas compuestas exigen todos sus componentes en la misma visita.
// Detalle y justificación por categoría: SISMANTO/MAPEO_HISTORIAL_MANTENIMIENTOS_A_PLAN.xlsx.

export const norm = (t) =>
  String(t ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

const KIT = "Cambio Kit Filtros (Aire, Combustible, Aceite)";
const FRE = "Sustitución Líquido de Frenos y Refrigerante";
const T = {
  aceite: "Cambio de Aceite de Motor (Sintético)",
  alineacion: "Alineación, balanceo y rotación de llantas",
  pastillas: "Cambio de pastillas de frenos y ajuste de bandas",
  discos: "Rectificación de discos y campanas",
  separador: "Drenaje de filtro separador y ajuste de AdBlue",
  clutch: "Cambio Kit de Embrague (Clutch completo)",
  radiador: "Limpieza y sondeo de Radiador e Intercooler",
  bateria: "Cambio de Batería (Preventivo)",
  llantas: "Cambio de llantas",
  distribucion: "Kit Distribución + Bomba de Agua + Termostato",
  cajaDif: "Cambio Aceite de Caja, Diferencial y Transfer",
  engrase: "Engrase de crucetas, cardán y terminales",
  hvac: "Mantenimiento HVAC (Aire cabina pacientes)",
  inyectores: "Laboratorio de Inyectores y Common Rail",
  soportes: "Revisión de soportes de motor y caja",
  egr: "Limpieza de Válvula EGR y Sensores MAF/MAP",
  alternador: "Mantenimiento de Alternador y Motor de Arranque",
  amortiguadores: "Cambio de Amortiguadores y bujes de ballesta",
  compresion: "Revisión de compresión y estado interno de motor",
};
// Tareas AIRPLAN (plan por días) equivalentes.
const A = {
  aceite: "Cambio de aceite y filtro de aceite",
  alineacion: "Alineación y balanceo",
  pastas: "Revisión de pastas",
  bandas: "Verificación bandas y tambores de freno",
  aire: "Cambio filtro de aire",
  combustible: "Reemplazo filtro de combustible",
  embrague: "Verificación-ajuste juego pedal embrague",
  refrigerante: "Cambiar refrigerante de motor",
  frenos: "Cambiar fluido tanque reserva de frenos",
  llantas: "Cambio de llantas",
  distribucion: "Cambio de correa de distribución",
  diferencial: "Cambiar aceite diferencial trasero/delantero",
  caja: "Cambiar aceite transmisión manual",
  engrase: "Lubricación terminales, crucetas y suspensión",
  hvac: "Revisión funcionamiento aire acondicionado",
  inyectores: "Limpieza de inyectores",
  alternador: "Revisar y/o reparar alternador",
  amortiguadores: "Revisar y/o cambiar amortiguadores",
  lavaparabrisas: "Revisión sistema lavaparabrisas",
  tecnico: "Revisión técnico-mecánica",
};

const tiene = (d, ...palabras) => palabras.some((p) => norm(d).includes(p));

/** Una línea del historial → trabajos del plan que cubre. `parte` es el componente de una tarea compuesta. */
const REGLAS = {
  "CAMBIO DE ACEITE": () => [{ f: T.aceite, a: A.aceite }, { f: KIT, parte: "aceite" }],
  "ALINEACION, BALANCEO Y ROTACION DE LLANTAS": () => [{ f: T.alineacion, a: A.alineacion }],
  "FRENOS PREVENTIVO": (d) => (tiene(d, "PASTA", "PASTILLA", "BANDA") ? [{ f: T.pastillas, a: A.pastas }] : []),
  "FRENOS CORRECTIVO": (d) => (tiene(d, "DISCO", "CAMPANA", "RECTIFIC") ? [{ f: T.discos }] : []),
  "CAMBIO DE PASTILLAS DE FRENOS": () => [{ f: T.pastillas, a: A.pastas }],
  "REVISION, LIMPIEZA Y AJUSTE DE BANDAS Y CANASTAS TRASERAS DE FRENOS": () => [{ f: T.pastillas, a: A.bandas }],
  "CAMBIO DE FILTRO DE AIRE DE MOTOR": () => [{ f: KIT, parte: "aire", a: A.aire }],
  "CAMBIO DE FILTRO DE COMBUSTIBLE": () => [{ f: KIT, parte: "combustible", a: A.combustible }],
  "DRENAJE DE FILTRO SEPARADOR DE AGUA DEL COMBUSTIBLE": () => [{ f: T.separador }],
  "CAMBIO KIT DE EMBRAGUE/CLUTCH": () => [{ f: T.clutch, a: A.embrague }],
  "KIT CLUTCH (EMBRAGUE)": (d) => (tiene(d, "KIT", "DISCO", "PLATO", "PRENSA") ? [{ f: T.clutch }] : []),
  CAJA: (d) => (tiene(d, "EMBRAGUE", "CLUTCH") ? [{ f: T.clutch }] : []),
  "RADIADOR Y REFRIGERACION": (d) =>
    tiene(d, "SONDEO", "LIMPIEZA") ? [{ f: T.radiador }] : tiene(d, "REFRIGERANTE", "LIQUIDO") ? [{ f: FRE, parte: "refrigerante", a: A.refrigerante }] : [],
  "CAMBIO DE LIQUIDO REFRIGERANTE": () => [{ f: FRE, parte: "refrigerante", a: A.refrigerante }],
  "CAMBIO DE LIQUIDO DE FRENOS": () => [{ f: FRE, parte: "frenos", a: A.frenos }],
  "MANTENIMIENTO, LIMPIEZA Y SONDEO DE RADIADOR": () => [{ f: T.radiador }],
  BATERIA: (d) => (tiene(d, "CAMBIO", "INSTALACION", "BATERIA NUEVA") ? [{ f: T.bateria }] : []),
  "CAMBIO BATERIA": () => [{ f: T.bateria }],
  "CAMBIO DE LLANTAS (O SEGUN DESGASTE)": () => [{ f: T.llantas, a: A.llantas }],
  "CAMBIO DE LLANTAS": () => [{ f: T.llantas, a: A.llantas }],
  LLANTAS: (d) => (tiene(d, "MONTAJE", "LLANTA", "CAMBIO") && !tiene(d, "PARCHE", "VALVULA") ? [{ f: T.llantas, a: A.llantas }] : []),
  "CAMBIAR CORREA DE DISTRIBUCION": () => [{ f: T.distribucion, a: A.distribucion }],
  "CAMBIO DE BOMBA DE AGUA": () => [{ f: T.distribucion, parte: "bomba" }],
  "CAMBIO ACEITE DE TRANSMISION Y DIFERENCIAL": () => [{ f: T.cajaDif, a: A.diferencial }],
  "CAMBIO ACEITE DE CAJA DE CAMBIOS": () => [{ f: T.cajaDif, a: A.caja }],
  "LUBRICACION DE PARTES DE LA DIRECCION Y SUSPENSION": () => [{ f: T.engrase, a: A.engrase }],
  "REPARACION SISTEMA DE AIRE ACONDICIONADO": (d) =>
    tiene(d, "LIMPIEZA", "CALIBRACION", "MANTENIMIENTO", "REVISION", "PURIFICACION") ? [{ f: T.hvac, a: A.hvac }] : [],
  "MANTENIMIENTO PREVENTIVO DEL SISTEMA DE AIRE ACONDICIONADO": () => [{ f: T.hvac, a: A.hvac }],
  INYECCION: (d) => (tiene(d, "INYECTOR", "COMMON RAIL") ? [{ f: T.inyectores, a: A.inyectores }] : []),
  "SINCRONIZACION COMPLETA: LAVADO INYECTORES, VALVULAS, COMMON RAIL": () => [{ f: T.inyectores, a: A.inyectores }],
  "CAMBIO DE SOPORTES DE MOTOR Y CAJA": () => [{ f: T.soportes }],
  "INSPECCION Y LIMPIEZA DEL SISTEMA DE RECIRCULACION DE GASES (EGR)": () => [{ f: T.egr }],
  "MANTENIMIENTO PREVENTIVO DE ALTERNADOR (DESMONTAJE Y REVISION INTERNA)": () => [{ f: T.alternador, a: A.alternador }],
  "CAMBIO DE BUJES DE TIJERAS Y SUSPENSION": () => [{ f: T.amortiguadores, a: A.amortiguadores }],
  SUSPENSION: (d) => (tiene(d, "AMORTIGUADOR", "BUJE") ? [{ f: T.amortiguadores, a: A.amortiguadores }] : []),
  "REVISAR EL FUNCIONAMIENTO DE LIMPIAPARABRISAS Y NIVEL DE LIQUIDO": () => [{ a: A.lavaparabrisas }],
  OTROS: (d) => (tiene(d, "TECNICOMECANICA", "TECNICO MECANICA", "TECNICO-MECANICA") ? [{ a: A.tecnico }] : []),
  ELECTRICO: (d) => (tiene(d, "ALTERNADOR", "MOTOR DE ARRANQUE") ? [{ f: T.alternador, a: A.alternador }] : []),
  "MOTOR Y RELACIONADOS": (d) => (tiene(d, "COMPRESION") ? [{ f: T.compresion }] : []),
};

/** Trabajos que cubre una línea. `[]` si solo queda en el historial. */
export function trabajosDeLinea(categoria, descripcion) {
  const regla = REGLAS[norm(categoria)];
  return regla ? regla(descripcion ?? "") : [];
}

const PARTES = { [KIT]: ["aceite", "aire", "combustible"], [FRE]: ["frenos", "refrigerante"], [T.distribucion]: ["distribucion", "bomba"] };

/**
 * Tareas del plan que reinicia UN servicio (todas sus líneas). `esAirplan`: el vehículo usa también el plan AIRPLAN.
 * Las compuestas se dan por cumplidas solo si todas sus partes están; la distribución se da con la correa/kit, o con la
 * bomba de agua si la descripción habla de distribución.
 */
export function tareasDelServicio(lineas, esAirplan) {
  const tareas = new Set();
  const partes = new Map();
  for (const l of lineas) {
    for (const w of trabajosDeLinea(l.categoria, l.descripcion)) {
      if (w.a && esAirplan) tareas.add(w.a);
      if (!w.f) continue;
      if (w.parte) {
        const s = partes.get(w.f) ?? new Set();
        s.add(w.parte);
        partes.set(w.f, s);
      } else {
        tareas.add(w.f);
        if (w.f === T.distribucion) {
          const s = partes.get(w.f) ?? new Set();
          s.add("distribucion");
          partes.set(w.f, s);
        }
      }
    }
  }
  for (const [tarea, s] of partes) {
    const exigidas = PARTES[tarea] ?? [];
    if (exigidas.every((p) => s.has(p))) tareas.add(tarea);
  }
  // Mantenimiento mayor de distribución: la correa sola ya cumple la tarea (el kit se cambia junto).
  if (lineas.some((l) => norm(l.categoria) === "CAMBIAR CORREA DE DISTRIBUCION")) tareas.add(T.distribucion);
  return [...tareas];
}

/** Clave del servicio: placa + fecha + factura (sin factura, solo placa + fecha). */
export const claveServicio = (placa, fecha, factura) => `${placa}|${String(fecha).slice(0, 10)}|${String(factura ?? "").trim().toUpperCase()}`;

/** Fecha escrita como texto: «26/11/2024» (día primero, como en Colombia) o ISO «2024-11-26». */
export function fechaTexto(v) {
  const s = String(v || "").trim();
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : s.slice(0, 10);
}

/** Celda de fecha del Excel (número de serie o texto) → «YYYY-MM-DD», o null si no es una fecha. */
export function fechaExcel(v) {
  if (typeof v === "number") return v >= 1 ? new Date((Math.floor(v) - 25569) * 86400000).toISOString().slice(0, 10) : null;
  const s = fechaTexto(v);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) ? s : null;
}

/**
 * Km de un servicio al sumarle una línea. El escrito en el Excel (real) manda sobre el de la base, que pudo ser
 * imputado por el cargador, sin importar en qué orden vengan las líneas.
 */
export function kmDelServicio(actual, kmExcel, kmBase) {
  if (kmExcel > 0) return !actual.kmReal || kmExcel > actual.km ? { km: kmExcel, kmReal: true } : actual;
  return !actual.kmReal && kmBase > actual.km ? { km: kmBase, kmReal: false } : actual;
}

/** Ítem del plan con esa descripción que le aplica al vehículo (misma regla de la vista: TODOS, su centro o su placa). */
export function itemDelPlan(plan, descripcion, vehiculo) {
  return plan.find(
    (p) => p.descripcion === descripcion && (p.aplica_a === "TODOS" || p.aplica_a === vehiculo.centro_operativo || p.aplica_a === vehiculo.placa)
  );
}

/** En un ítem por kilómetros, un vínculo sin km dejaría la tarea «al día» para siempre en la vista: no se crea. */
export const faltaKm = (item, km) => item.intervalo_km > 0 && !(km > 0);
