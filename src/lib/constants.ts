// Constantes del sistema - Categorías de Mantenimiento

export const GRUPOS_MANTENIMIENTO = {
  SISTEMA_LUBRICACION: {
    nombre: "Sistema de Lubricación",
    procedimientos: [
      "CAMBIO DE ACEITE",
      "CAMBIO DE FILTRO DE ACEITE",
      "ANÁLISIS DE MUESTRA DE ACEITE DE MOTOR",
    ]
  },
  SISTEMA_AIRE_COMBUSTIBLE: {
    nombre: "Sistema de Aire y Combustible",
    procedimientos: [
      "CAMBIO DE FILTRO DE AIRE DE MOTOR",
      "CAMBIO DE FILTRO DE COMBUSTIBLE",
      "DRENAJE DE FILTRO SEPARADOR DE AGUA",
      "MANTENIMIENTO BOMBA DE COMBUSTIBLE",
      "LIMPIEZA DE INYECTORES",
    ]
  },
  SISTEMA_FRENOS: {
    nombre: "Sistema de Frenos",
    procedimientos: [
      "REVISAR SISTEMA DE FRENOS: DESGASTE, MANGUERAS Y FUGAS",
      "CAMBIO DE PASTILLAS DE FRENOS",
      "CAMBIO DE LIQUIDO DE FRENOS",
      "CAMBIO O RECTIFICACION DE DISCOS DE FRENOS",
      "CAMBIO DE CAMPANAS DE FRENOS",
      "REVISION, LIMPIEZA Y AJUSTE DE BANDAS Y CANASTAS TRASERAS",
    ]
  },
  SISTEMA_SUSPENSION: {
    nombre: "Sistema de Suspensión",
    procedimientos: [
      "REVISAR SISTEMA DE SUSPENSION: AMORTIGUADORES, TOPES, BRAZOS",
      "CAMBIO DE AMORTIGUADORES",
      "CAMBIO DE BUJES DE TIJERAS Y SUSPENSIÓN",
      "CAMBIO DE HOJAS DE BALLESTA / MUELLES",
      "REVISAR ESTADO DE TUERCAS Y BUJES DE TIJERAS",
    ]
  },
  SISTEMA_DIRECCION: {
    nombre: "Sistema de Dirección",
    procedimientos: [
      "LUBRICACION DE PARTES DE LA DIRECCION",
      "LUBRICAR EXTREMOS DE BARRAS DE ACOPLAMIENTO",
      "REVISION GENERAL SISTEMA DE DIRECCION Y CAJA DE CAMBIOS",
      "CAMBIO DE ROTULAS / TERMINALES",
      "CAMBIO DE GUARDAPOLVOS",
      "REVISION DE LIQUIDO DE DIRECCION HIDRAULICA",
    ]
  },
  SISTEMA_ELECTRICO: {
    nombre: "Sistema Eléctrico",
    procedimientos: [
      "REVISAR NIVEL DE CARGA DE BATERIA",
      "REVISAR FUNCIONAMIENTO LUCES, SIRENA Y ALARMAS",
      "CAMBIO DE BOMBILLERIA",
      "PRUEBA DE CARGA DEL SISTEMA ELÉCTRICO DUAL",
      "CAMBIO BATERIA",
      "CAMBIO DE SENSORES ELECTRONICOS",
      "MANTENIMIENTO PREVENTIVO DE ALTERNADOR",
      "MANTENIMIENTO PREVENTIVO DE MOTOR DE ARRANQUE",
    ]
  },
  SISTEMA_REFRIGERACION: {
    nombre: "Sistema de Refrigeración",
    procedimientos: [
      "MANTENIMIENTO, LIMPIEZA Y SONDEO DE RADIADOR",
      "CAMBIO DE LIQUIDO REFRIGERANTE",
      "CAMBIO DE BOMBA DE AGUA",
      "REVISAR ESTADO GENERAL DEL RADIADOR",
      "VERIFICAR QUE LOS VENTILADORES DEL RADIADOR FUNCIONAN",
    ]
  },
  LLANTAS: {
    nombre: "Neumáticos",
    procedimientos: [
      "REVISAR PRESION Y ESTADO DE LAS LLANTAS",
      "REVISION, BARRENOS, REPARACION MENOR DE LLANTAS",
      "ALINEACION, BALANCEO Y ROTACION DE LLANTAS",
      "CAMBIO DE LLANTAS",
    ]
  },
  MOTOR: {
    nombre: "Motor",
    procedimientos: [
      "CAMBIO DE BUJIAS",
      "CAMBIO CORREA DE DISTRIBUCION",
      "REVISION/MANTENIMIENTO PROFUNDO DEL MOTOR",
      "CAMBIO DE SOPORTES DE MOTOR",
      "VERIFICACION MARCHA MINIMA Y GASES",
      "SINCRONIZACION COMPLETA",
    ]
  },
  TRANSMISION: {
    nombre: "Transmisión",
    procedimientos: [
      "CAMBIO ACEITE DE CAJA DE CAMBIOS",
      "CAMBIO ACEITE DE TRANSMISION Y DIFERENCIAL",
      "CAMBIO KIT DE EMBRAGUE/CLUTCH",
      "VERIFICAR HOLGURA EN EL PEDAL DE EMBRAGUE",
      "MANTENIMIENTO GENERAL DE LA CAJA DE CAMBIOS",
    ]
  },
  AIRE_ACONDICIONADO: {
    nombre: "Climatización",
    procedimientos: [
      "MANTENIMIENTO PREVENTIVO DEL SISTEMA DE AIRE ACONDICIONADO",
      "REVISION DEL SISTEMA DE CLIMATIZACIÓN CABINA PACIENTES",
      "MANTENIMIENTO GENERAL AIRE ACONDICIONADO: COMPRESOR, EVAPORADOR",
      "REPARACION SISTEMA DE AIRE ACONDICIONADO",
    ]
  },
  CARROCERIA: {
    nombre: "Carrocería y Exterior",
    procedimientos: [
      "LAVADO GENERAL DEL VEHICULO",
      "MANTENIMIENTO Y LIMPIEZA DE ACRÍLICOS EN LUCES",
      "INSPECCIÓN DE GABINETES, SOPORTES DE EQUIPOS",
      "ASEO EXTERNO Y DESMANCHADA",
      "CARROCERIA, PINTURA, LATONERIA, FAROLAS",
    ]
  },
  EQUIPAMIENTO_MEDICO: {
    nombre: "Equipamiento Médico",
    procedimientos: [
      "INSPECCIÓN DE ANCLAJES Y MECANISMOS DE LA CAMILLA",
      "PRUEBA FUNCIONAL DEL SISTEMA DE SUCCIÓN Y OXÍGENO",
      "MANTENIMIENTO PREVENTIVO DE INVERSOR",
    ]
  },
  INSPECCIONES_GENERALES: {
    nombre: "Inspecciones y Diagnóstico",
    procedimientos: [
      "REPOSICION Y AJUSTE DE LIQUIDOS Y FLUIDOS",
      "REVISAR INDICADORES Y TESTIGOS DEL TABLERO",
      "REVISION Y DIAGNOSTICO",
      "VERIFICAR ESPEJOS Y CINTURONES DE SEGURIDAD",
      "REVISAR RASTROS DE FLUIDOS O GOTEOS",
    ]
  },
  OTROS: {
    nombre: "Otros Procedimientos",
    procedimientos: [
      "REPARACIONES MENORES, AJUSTES",
      "REPARACIONES DE OTRO TIPO",
      "MO Mano de obra",
      "Otros",
    ]
  }
} as const;

// Función para generar categorías para insertar en BD
export function generarCategoriasParaDB() {
  const categorias: Array<{
    nombre: string;
    grupo_padre: string;
    activo: boolean;
  }> = [];
  
  for (const [key, grupo] of Object.entries(GRUPOS_MANTENIMIENTO)) {
    for (const proc of grupo.procedimientos) {
      categorias.push({
        nombre: proc,
        grupo_padre: grupo.nombre,
        activo: true
      });
    }
  }
  
  return categorias;
}

// Mapeo de centros operativos
export const CENTROS_OPERATIVOS = {
  CRA_MEDELLIN: 'CRA Medellín',
  CRA_BOGOTA: 'CRA Bogotá',
  AIRPLAN: 'Airplan',
  CTG: 'CTG'
} as const;
