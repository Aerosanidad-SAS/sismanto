import { z } from 'zod';
import { ESTADO_VALORACION_OPCIONES, VALORACION_OPCIONES } from '@/lib/valoraciones-lista';

// Schema de validación para mantenimiento
export const maintenanceSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  fecha: z.date().max(new Date(), 'No puede ser fecha futura'),
  kilometrajeActual: z.number().int().positive('Kilometraje debe ser positivo'),
  tipo: z.enum(['PREVENTIVO', 'CORRECTIVO'], {
    required_error: 'Debe seleccionar un tipo de mantenimiento',
  }),
  categoriaId: z.number().int().positive('Debe seleccionar una categoría'),
  descripcionTrabajo: z.string().min(10, 'Mínimo 10 caracteres'),
  proveedor: z.string().min(1, 'Requerido'),
  supplierId: z.number().int().optional(),
  valor: z.number().nonnegative('El valor no puede ser negativo'),
  numeroFactura: z.string().optional(),
  tiempoFueraServicioHoras: z.number().nonnegative().default(0),
  notasAdicionales: z.string().optional(),
  incidentId: z.number().int().optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

// Schema de validación para incidente/novedad (severidad opcional si el reporter no la define; servidor usa MEDIA)
export const incidentSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  descripcion: z.string().min(10, 'Mínimo 10 caracteres'),
  severidad: z.enum(['BAJA', 'MEDIA', 'ALTA']).optional(),
  reportadoPor: z.string().min(3, 'Mínimo 3 caracteres'),
  afectaOperatividad: z.boolean().default(false),
});

export type IncidentFormData = z.infer<typeof incidentSchema>;

export const updateIncidentPrioridadSchema = z.object({
  incidentId: z.number().int().positive(),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA']).nullable(),
});

// Schema de validación para vehículo (completo)
export const vehicleSchema = z.object({
  placa: z.string().min(5, 'Mínimo 5 caracteres').max(10, 'Máximo 10 caracteres'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  linea: z.string().optional(),
  tipo_combustible: z.string().optional(),
  tipo_llantas: z.string().min(1, 'Tipo de llantas es obligatorio'),
  tipo_bombillos: z.string().optional(),
  bombilleria_farolas: z.string().min(1, 'Bombillería farolas es obligatoria'),
  bombilleria_stops: z.string().min(1, 'Bombillería stops es obligatoria'),
  bombilleria_direccionales: z.string().min(1, 'Bombillería direccionales es obligatoria'),
  tipo_refrigerante: z.string().min(1, 'Refrigerante es obligatorio'),
  aceite_usado: z.string().min(1, 'Aceite de motor es obligatorio'),
  ref_filtro_aire_motor: z.string().min(1, 'Filtro de aire es obligatorio'),
  ref_filtro_aceite: z.string().min(1, 'Filtro de aceite es obligatorio'),
  ref_filtro_combustible: z.string().optional(),
  bateria_principal: z.string().min(1, 'Batería principal es obligatoria'),
  bateria_auxiliar: z.string().min(1, 'Batería auxiliar es obligatoria'),
  notas: z.string().optional(),
  vencimiento_soat: z.string().optional().nullable(),
  vencimiento_tecnicomecanica: z.string().optional().nullable(),
  costo_soat_anual: z.coerce.number().nonnegative().optional().nullable(),
  costo_tecnomecanica_anual: z.coerce.number().nonnegative().optional().nullable(),
  costo_poliza_anual: z.coerce.number().nonnegative().optional().nullable(),
  centro_operativo_id: z.number().int().positive('Debe seleccionar un centro de operaciones'),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

export const vehicleGeneralSchema = z.object({
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  linea: z.string().optional(),
  tipo_combustible: z.string().optional(),
  centro_operativo_id: z.number().int().positive("Debe seleccionar un centro de operaciones"),
  vencimiento_soat: z.string().optional().nullable(),
  vencimiento_rtm: z.string().optional().nullable(),
  vencimiento_tecnicomecanica: z.string().optional().nullable(),
  costo_soat_anual: z.coerce.number().nonnegative().optional().nullable(),
  costo_tecnomecanica_anual: z.coerce.number().nonnegative().optional().nullable(),
  costo_poliza_anual: z.coerce.number().nonnegative().optional().nullable(),
});

export type VehicleGeneralFormData = z.infer<typeof vehicleGeneralSchema>;

export const vehicleSpecsSchema = z.object({
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  tipo_llantas: z.string().min(1, 'Tipo de llantas es obligatorio'),
  aceite_usado: z.string().min(1, 'Aceite de motor es obligatorio'),
  ref_filtro_aceite: z.string().min(1, 'Filtro de aceite es obligatorio'),
  ref_filtro_aire_motor: z.string().min(1, 'Filtro de aire es obligatorio'),
  bombilleria_farolas: z.string().min(1, 'Bombillería farolas es obligatoria'),
  bombilleria_stops: z.string().min(1, 'Bombillería stops es obligatoria'),
  bombilleria_direccionales: z.string().min(1, 'Bombillería direccionales es obligatoria'),
  tipo_refrigerante: z.string().min(1, 'Refrigerante es obligatorio'),
  bateria_principal: z.string().min(1, 'Batería principal es obligatoria'),
  bateria_auxiliar: z.string().min(1, 'Batería auxiliar es obligatoria'),
});

export type VehicleSpecsFormData = z.infer<typeof vehicleSpecsSchema>;

// Schema para centro de operaciones
export const operationalCenterSchema = z.object({
  codigo: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres')
    .regex(/^[A-Z0-9_]+$/, 'Solo letras mayúsculas, números y guión bajo'),
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(200),
});

export type OperationalCenterFormData = z.infer<typeof operationalCenterSchema>;

// Schema para proveedor
export const supplierSchema = z.object({
  nombre:    z.string().min(3, 'Mínimo 3 caracteres').max(200),
  nit:       z.string().optional(),
  telefono:  z.string().min(7, 'Teléfono requerido (mínimo 7 caracteres)'),
  ciudad:    z.string().min(2, 'Ciudad requerida'),
  servicio:  z.string().min(3, 'Servicio requerido (mínimo 3 caracteres)'),
  direccion: z.string().min(5, 'Dirección requerida (mínimo 5 caracteres)'),
  contacto:  z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

// Schema para fuel log
export const fuelLogSchema = z
  .object({
    vehicleId: z.string().uuid(),
    fecha: z.string(),
    kilometraje: z.number().int().nonnegative(),
    galones: z.number().positive("Los galones deben ser positivos"),
    costo: z.number().nonnegative().optional(),
    notas: z.string().optional(),
  })
  .superRefine((row, ctx) => {
    if (Number.isNaN(Date.parse(String(row.fecha || "").trim()))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Fecha inválida: "${row.fecha}"`, path: ["fecha"] });
    }
  });

export type FuelLogFormData = z.infer<typeof fuelLogSchema>;

// Schema de validación para registro de kilometraje
export const mileageLogSchema = z.object({
  vehicleId: z.string().uuid(),
  fecha: z.date().max(new Date()),
  lecturaKilometraje: z.number().int().positive(),
});

export type MileageLogFormData = z.infer<typeof mileageLogSchema>;

const parseableDateString = z
  .string()
  .min(1, "Fecha requerida")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Fecha inválida");

export const dateRangeSchema = z
  .object({
    fechaInicio: parseableDateString,
    fechaFin: parseableDateString,
  })
  .refine(
    (d) => new Date(d.fechaInicio).getTime() <= new Date(d.fechaFin).getTime(),
    { message: "La fecha fin debe ser posterior o igual a la fecha inicio", path: ["fechaFin"] }
  );

export const signInSchema = z.object({
  // Cédula (usuarios migrados de SISRES) o correo (usuarios de Aeromanto) —
  // se resuelve al email de Supabase Auth en resolverEmailLogin (auth.ts).
  identificador: z.string().trim().min(1, "Ingrese su cédula o correo").max(254),
  password: z.string().min(1, "Contraseña requerida"),
});

const userRoleEnum = z.enum([
  "OVEM",
  "ADMIN",
  "REGULACION",
  "GERENCIAL",
  "MANTENIMIENTO",
  "COORDINACION",
]);

export const createUserAsAdminSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  nombreCompleto: z.string().min(2, "Nombre demasiado corto"),
  cedula: z.string().trim().min(4, "Documento inválido").max(20).optional().or(z.literal("")),
  ciudad: z.string().trim().max(100).optional().or(z.literal("")),
  operationalCenterId: z.number().int().positive("Centro inválido").nullable().optional(),
  roleCodigo: userRoleEnum,
});

export const updateUserAsAdminSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  nombreCompleto: z.string().trim().min(2, "Nombre demasiado corto").max(200),
  cedula: z.string().trim().min(4, "Documento inválido").max(20).optional().or(z.literal("")),
  ciudad: z.string().trim().max(100).optional().or(z.literal("")),
  operationalCenterId: z.number().int().positive("Centro inválido").nullable(),
  roleCodigo: userRoleEnum,
});

export const toggleUserActiveSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  activo: z.boolean(),
});

export const dailyCheckSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  fecha: z.string().min(1, "Fecha requerida"),
  kilometrajeInicial: z.number().int().positive("El kilometraje actual es obligatorio y debe ser mayor a cero"),
  kilometrajeFinal: z.number().int().nonnegative().optional(),
  /** Mantiene compatibilidad, pero se recalcula por daily_check_items (trigger DB). */
  checklistOk: z.boolean().optional(),
  observaciones: z.string().optional(),
  isAssignment: z.boolean().default(false),
  items: z
    .array(
      z.object({
        checklistItemId: z.number().int().positive(),
        estado: z.enum(["OK", "FALLA", "NO_APLICA"]),
        /** Para ítems con cantidad esperada numérica (ej. 2 luces): cuántos están OK. */
        cantidadOk: z.number().int().nonnegative().optional(),
        observacion: z.string().optional(),
      })
    )
    .optional(),
});

const checklistResultItemSchema = z.object({
  checklistItemId: z.number().int().positive(),
  estado: z.enum(["OK", "FALLA", "NO_APLICA"]),
  cantidadOk: z.number().int().nonnegative().optional(),
  observacion: z.string().optional(),
});

/** Dotación e insumos verificados al recibir la ambulancia. */
export const supplyCheckSchema = z.object({
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  observaciones: z.string().max(1000).optional(),
  items: z.array(checklistResultItemSchema).min(1, "No hay ítems de dotación para guardar"),
});

/** Tanqueo registrado por el OVEM desde el portal. */
export const ovemFuelLogSchema = z.object({
  vehicleId: z.string().uuid("Seleccione un vehículo"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  kilometraje: z.number().int().positive("El kilometraje es obligatorio"),
  galones: z.number().positive("Los galones deben ser mayores a cero").max(100, "Revise los galones: más de 100 no cabe en un tanque"),
  costo: z.number().nonnegative().optional(),
  numeroVenta: z.string().trim().max(40).optional(),
});

/** Siniestro vial reportado por el OVEM. */
export const roadAccidentSchema = z
  .object({
    vehicleId: z.string().uuid("Seleccione un vehículo"),
    fechaHora: z.string().min(1, "Indique fecha y hora"),
    lugar: z.string().trim().min(5, "Indique dirección o punto de referencia"),
    descripcion: z.string().trim().min(10, "Mínimo 10 caracteres"),
    pacienteABordo: z.boolean(),
    hayLesionados: z.boolean(),
    lesionadosDetalle: z.string().trim().optional(),
    hayTerceros: z.boolean(),
    terceroPlaca: z.string().trim().max(10).optional(),
    terceroNombre: z.string().trim().max(200).optional(),
    terceroTelefono: z.string().trim().max(30).optional(),
    terceroAseguradora: z.string().trim().max(120).optional(),
    intervinoAutoridad: z.boolean(),
    numeroIpat: z.string().trim().max(40).optional(),
    vehiculoOperativo: z.boolean(),
  })
  .superRefine((row, ctx) => {
    if (Number.isNaN(Date.parse(row.fechaHora))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Fecha y hora inválidas", path: ["fechaHora"] });
    } else if (Date.parse(row.fechaHora) > Date.now() + 5 * 60_000) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La fecha no puede ser futura", path: ["fechaHora"] });
    }
    if (row.hayLesionados && !row.lesionadosDetalle) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Describa los lesionados", path: ["lesionadosDetalle"] });
    }
    if (row.hayTerceros && !row.terceroPlaca && !row.terceroNombre) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Indique al menos placa o nombre del tercero", path: ["terceroPlaca"] });
    }
  });

export type RoadAccidentFormData = z.infer<typeof roadAccidentSchema>;

export const updateKilometrajeOdometerSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  fecha: z.string().min(1, "Fecha requerida"),
  kilometraje: z.number().int().nonnegative("Kilometraje inválido"),
});

export const toggleVehicleStatusSchema = z.object({
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  nuevoEstado: z.enum(["OPERATIVO", "FUERA_DE_SERVICIO"]),
});

export const ROLES_TRIPULACION = ["OVEM", "MEDICO", "AUXILIAR_ENFERMERIA"] as const;

export const vehicleAssignmentSchema = z.object({
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  userId: z.string().uuid("ID de usuario inválido"),
  rol: z.enum(ROLES_TRIPULACION).default("OVEM"),
  fechaInicio: parseableDateString,
  fechaFin: z.string().optional().nullable(),
});

export const tipoFiltroMantenimientoSchema = z.enum(["AMBOS", "PREVENTIVO", "CORRECTIVO"]);

export const metricasConsumoParamsSchema = z
  .object({
    fechaInicio: parseableDateString,
    fechaFin: parseableDateString,
    vehicleId: z.string().uuid().optional(),
    centroId: z.number().int().positive().optional(),
  })
  .refine(
    (d) => new Date(d.fechaInicio).getTime() <= new Date(d.fechaFin).getTime(),
    { message: "La fecha fin debe ser posterior o igual a la fecha inicio", path: ["fechaFin"] }
  );

/** Fila Excel/CSV mantenimiento: normaliza tipo y valores numéricos. */
export const filaMantenimientoImportSchema = z
  .object({
    placa: z.string(),
    fecha: z.string(),
    kilometraje: z.coerce.number().int().nonnegative(),
    tipo: z
      .string()
      .transform((s) => s.trim().toUpperCase())
      .pipe(z.enum(["PREVENTIVO", "CORRECTIVO"])),
    categoria: z.string(),
    descripcion: z.string(),
    proveedor: z.string(),
    valor: z.coerce.number().nonnegative(),
    numero_factura: z.string().optional(),
    tiempo_fuera_servicio: z.coerce.number().nonnegative().optional(),
  })
  .superRefine((row, ctx) => {
    if (Number.isNaN(Date.parse(String(row.fecha || "").trim()))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Fecha inválida: "${row.fecha}"`, path: ["fecha"] });
    }
  });

/** Fila Excel/CSV combustible. */
export const filaCombustibleImportSchema = z
  .object({
    placa: z.string(),
    fecha: z.string(),
    kilometraje: z.coerce.number().int().nonnegative(),
    galones: z.coerce.number().positive(),
    costo: z.coerce.number().nonnegative().optional(),
    notas: z.string().optional(),
  })
  .superRefine((row, ctx) => {
    if (Number.isNaN(Date.parse(String(row.fecha || "").trim()))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Fecha inválida: "${row.fecha}"`, path: ["fecha"] });
    }
  });

function cleanImportString(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

/** Fila Excel/CSV vehículos (centro_codigo = operational_centers.codigo). */
export const filaVehiculoImportSchema = z
  .object({
    placa: z.unknown(),
    marca: z.unknown().optional(),
    modelo: z.unknown().optional(),
    linea: z.unknown().optional(),
    centro_codigo: z.unknown(),
    tipo_combustible: z.unknown().optional(),
    tipo_llantas: z.unknown().optional(),
    tipo_bombillos: z.unknown().optional(),
    bombilleria_farolas: z.unknown().optional(),
    bombilleria_stops: z.unknown().optional(),
    bombilleria_direccionales: z.unknown().optional(),
    tipo_refrigerante: z.unknown().optional(),
    aceite_usado: z.unknown().optional(),
    ref_filtro_aire_motor: z.unknown().optional(),
    ref_filtro_aceite: z.unknown().optional(),
    ref_filtro_combustible: z.unknown().optional(),
    bateria_principal: z.unknown().optional(),
    bateria_auxiliar: z.unknown().optional(),
    notas: z.unknown().optional(),
    vencimiento_soat: z.unknown().optional(),
    vencimiento_tecnicomecanica: z.unknown().optional(),
  })
  .transform((raw) => ({
    placa: String(raw.placa ?? "").trim().toUpperCase(),
    marca: cleanImportString(raw.marca),
    modelo: cleanImportString(raw.modelo),
    linea: cleanImportString(raw.linea),
    centro_codigo: String(raw.centro_codigo ?? "").trim().toUpperCase(),
    tipo_combustible: cleanImportString(raw.tipo_combustible),
    tipo_llantas: cleanImportString(raw.tipo_llantas),
    tipo_bombillos: cleanImportString(raw.tipo_bombillos),
    bombilleria_farolas: cleanImportString(raw.bombilleria_farolas),
    bombilleria_stops: cleanImportString(raw.bombilleria_stops),
    bombilleria_direccionales: cleanImportString(raw.bombilleria_direccionales),
    tipo_refrigerante: cleanImportString(raw.tipo_refrigerante),
    aceite_usado: cleanImportString(raw.aceite_usado),
    ref_filtro_aire_motor: cleanImportString(raw.ref_filtro_aire_motor),
    ref_filtro_aceite: cleanImportString(raw.ref_filtro_aceite),
    ref_filtro_combustible: cleanImportString(raw.ref_filtro_combustible),
    bateria_principal: cleanImportString(raw.bateria_principal),
    bateria_auxiliar: cleanImportString(raw.bateria_auxiliar),
    notas: cleanImportString(raw.notas),
    vencimiento_soat: cleanImportString(raw.vencimiento_soat),
    vencimiento_tecnicomecanica: cleanImportString(raw.vencimiento_tecnicomecanica),
  }))
  .superRefine((row, ctx) => {
    if (row.placa.length < 5 || row.placa.length > 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Placa debe tener entre 5 y 10 caracteres",
        path: ["placa"],
      });
    }
    if (!row.centro_codigo || row.centro_codigo.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "centro_codigo es requerido (código del centro operativo)",
        path: ["centro_codigo"],
      });
    }
    if (row.vencimiento_soat && Number.isNaN(Date.parse(row.vencimiento_soat))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Fecha inválida: "${row.vencimiento_soat}"`,
        path: ["vencimiento_soat"],
      });
    }
    if (
      row.vencimiento_tecnicomecanica &&
      Number.isNaN(Date.parse(row.vencimiento_tecnicomecanica))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Fecha inválida: "${row.vencimiento_tecnicomecanica}"`,
        path: ["vencimiento_tecnicomecanica"],
      });
    }
  });

export type FilaVehiculoImport = z.output<typeof filaVehiculoImportSchema>;

/** Fila Excel/CSV proveedores */
export const filaProveedorImportSchema = z
  .object({
    nombre:    z.unknown(),
    nit:       z.unknown().optional(),
    telefono:  z.unknown(),
    ciudad:    z.unknown(),
    servicio:  z.unknown(),
    direccion: z.unknown(),
    contacto:  z.unknown().optional(),
  })
  .transform((raw) => ({
    nombre:    String(raw.nombre    ?? "").trim(),
    nit:       cleanImportString(raw.nit),
    telefono:  String(raw.telefono  ?? "").trim(),
    ciudad:    String(raw.ciudad    ?? "").trim(),
    servicio:  String(raw.servicio  ?? "").trim(),
    direccion: String(raw.direccion ?? "").trim(),
    contacto:  cleanImportString(raw.contacto),
  }))
  .superRefine((row, ctx) => {
    if (row.nombre.length < 3)    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nombre debe tener al menos 3 caracteres", path: ["nombre"] });
    if (!row.telefono)            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Teléfono requerido",  path: ["telefono"] });
    if (!row.ciudad)              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ciudad requerida",    path: ["ciudad"] });
    if (row.servicio.length < 3)  ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Servicio requerido (mínimo 3 caracteres)", path: ["servicio"] });
    if (row.direccion.length < 5) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dirección requerida (mínimo 5 caracteres)", path: ["direccion"] });
  });

export type FilaProveedorImport = z.output<typeof filaProveedorImportSchema>;

export const operationalCenterUpdateNombreSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres").max(200),
});

// ============================================================
// Integración SISRES — módulos clínicos y biomédicos
// ============================================================

const optStr = z.string().trim().max(255).optional().or(z.literal("")).transform((v) => (v ? v : undefined));
const optText = z.string().trim().max(5000).optional().or(z.literal("")).transform((v) => (v ? v : undefined));
/** Select cerrado opcional: vacío o uno de los valores permitidos (con mensaje claro si no lo es). */
const optEnum = (valores: readonly string[], mensaje: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || valores.includes(v), mensaje)
    .optional()
    .transform((v) => (v ? v : undefined));

// Catálogo real — verificado contra el <select> de sisres/registroPacientes.php
// (Ronda de QA, 2026-07-21). No son valores inventados.
export const TIPOS_DOCUMENTO = [
  "REGISTRO DE NACIMIENTO",
  "TARJETA DE IDENTIDAD",
  "CEDULA CIUDADANIA",
  "CEDULA EXTRAJERIA",
  "NIT",
  "PASAPORTE",
  "DOCUMENTO EXTRAJERO",
  "CERTIFICADO NACIDO VIVO",
  "MENOR SIN IDENTIFICACION",
  "CARNET DIPLOMATICO",
  "ADULTO SIN IDENTIFICACION",
  "PERMISO ESPECIAL PERMANENCIA",
] as const;

// Documentos exclusivos de mayores de edad — mismo criterio que el hallazgo
// de QA de Daniel ("si es menor de edad no puede permitir cédula").
export const TIPOS_DOCUMENTO_SOLO_ADULTO = ["CEDULA CIUDADANIA", "CEDULA EXTRAJERIA"] as const;
// Documentos exclusivos de menores de edad.
export const TIPOS_DOCUMENTO_SOLO_MENOR = [
  "REGISTRO DE NACIMIENTO",
  "TARJETA DE IDENTIDAD",
  "CERTIFICADO NACIDO VIVO",
  "MENOR SIN IDENTIFICACION",
] as const;

export const SEXO_OPCIONES = ["HOMBRE", "MUJER", "NO BINARIO", "TRANSGENERO", "TRANSEXUAL", "GÉNERO FLUIDO"] as const;

export const RH_OPCIONES = ["A+", "A-", "O+", "O-", "B+", "B-", "AB+", "AB-"] as const;

export const patientSchema = z.object({
  cedula: z.string().trim().min(4, "Documento inválido").max(20),
  tipo_documento: z.enum(TIPOS_DOCUMENTO, { errorMap: () => ({ message: "Selecciona un tipo de documento válido" }) }),
  nombre1: z.string().trim().min(2, "Nombre requerido").max(60),
  nombre2: optStr,
  apellido1: z.string().trim().min(2, "Apellido requerido").max(60),
  apellido2: optStr,
  fecha_nacimiento: optStr,
  direccion: optStr,
  barrio: optStr,
  localidad: optStr,
  departamento: optStr,
  ciudad: optStr,
  rh: optStr,
  sexo: optStr,
  estatura: optStr,
  eps: optStr,
  celular: optStr,
  correo: z.string().trim().email("Correo inválido").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});
export type PatientFormData = z.input<typeof patientSchema>;

// Verificado contra SISRES real (Ronda 2, pregunta 3): "NO EFECTIVO" lleva
// espacio, no guion bajo, y DUPLICADO es una etapa terminal viva hoy.
export const ETAPAS_SERVICIO = ["PROGRAMADO", "CURSO", "FINALIZADO", "CANCELADO", "FALLIDO", "NO EFECTIVO", "DUPLICADO"] as const;
export type EtapaServicio = (typeof ETAPAS_SERVICIO)[number];

// Catálogos reales del formulario de servicios — verificados contra
// sisres/registroServicios.php (QA, 2026-07-21). El de "Aislamiento" NO es
// SI/NO como se había asumido: es el tipo de precaución de aislamiento.
export const TURNO_OPCIONES = ["DIA", "NOCHE"] as const;

export const AISLAMIENTO_OPCIONES = [
  "CONTACTO",
  "AEREO",
  "AEROSOL",
  "GOTAS",
  "PROTECTOR",
  "VECTORES",
  "N/A",
] as const;

export const FINALIDAD_TRASLADO_OPCIONES = [
  "REMISION POR ESPECIALIDAD",
  "CITA MEDICA PROGRAMADA",
  "EGRESO MEDICO",
  "PRIMARIO",
  "SIMULACRO",
  "CITA MEDICA PROGRAMADA TELEMEDICINA",
  "APLICACION MEDICAMENTO",
  "MEDICO DOMICILIARIO",
  "N/A",
] as const;

export const PERIMETRO_OPCIONES = ["METROPOLITANO", "URBANO", "RURAL"] as const;

// Catálogos reales de motivo de no-efectividad — verificados contra
// registroServicios.php de SISRES (selects fijos, no texto libre).
export const MOTIVO_EXTERNO_OPCIONES = [
  "No aceptan disponibilidad",
  "Solo por cotizar",
  "Sin Cobertura",
] as const;

export const MOTIVO_INTERNO_OPCIONES = [
  "Tiempo de desplazamiento",
  "Por fuera del horario de servicio",
  "Sin capacidad instalada",
  "Tripulación en otro servicio",
  "Sin Cobertura",
] as const;

// SISRES guarda el estado como "0"/"1" (estadoServicio, select binario) —
// no es texto libre.
export const ESTADO_SERVICIO_OPCIONES = [
  { value: "0", label: "ACTIVO" },
  { value: "1", label: "INACTIVO" },
] as const;

export const METODO_PAGO_OPCIONES = [
  "N/A",
  "QR BANCOLOMBIA",
  "TRANSFERENCIA BANCOLOMBIA",
  "TRANSFERENCIA DAVIVIENDA",
  "TRANSFERENCIA NEQUI",
  "EFECTIVO",
  "QR DAVIVIENDA",
  "QR NEQUI",
  "WOMPI",
] as const;

// Tripulación real (FK) — reemplaza gradualmente a los campos de texto
// libre medico/auxiliar/ovem de abajo (ver migración 050). Un servicio
// puede tener médico_user_id sin vehicle_id/ovem_user_id: prestador
// externo con su propio vehículo (típico de Medicina Domiciliaria).
const optUuid = z.string().uuid().optional().or(z.literal("")).transform((v) => (v ? v : undefined));

export const medicalServiceSchema = z.object({
  patient_id: z.number().int().positive().optional(),
  nombre_completo: z.string().trim().min(3, "Nombre del paciente requerido").max(200),
  tipo_servicio: z.string().trim().min(2, "Tipo de servicio requerido").max(60),
  vehicle_id: z.string().uuid().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  ovem_user_id: optUuid,
  medico_user_id: optUuid,
  auxiliar_user_id: optUuid,
  fecha_hora_inicio_desplazamiento: optStr,
  fecha_hora_programacion: optStr,
  turno_programacion: optStr,
  autorizacion: optStr,
  asesor: optStr,
  prestador: optStr,
  cie_codigo: optStr,
  requiere_aislamiento: optStr,
  soporte: optStr,
  departamento_origen: optStr,
  ciudad_origen: optStr,
  departamento_destino: optStr,
  ciudad_destino: optStr,
  perimetro: optStr,
  direccion_origen: optStr,
  fecha_hora_llegada_origen: optStr,
  fecha_hora_salida_origen: optStr,
  direccion_intermedia: optStr,
  fecha_hora_llegada_intermedia: optStr,
  fecha_hora_salida_intermedia: optStr,
  direccion_destino: optStr,
  fecha_hora_llegada_destino: optStr,
  fecha_hora_salida_destino: optStr,
  finalidad_traslado: optStr,
  acepta_ips: optStr,
  // Campo opcional en SISRES: vacío llega como "" o NaN desde el input
  // numérico y no debe romper el guardado con "Expected number, received nan".
  valor_servicio: z.preprocess(
    (v) => (v === "" || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)),
    z.number().nonnegative("El valor del servicio no puede ser negativo").optional()
  ),
  metodo_pago: optStr,
  cliente: optStr,
  proveedor: optStr,
  medico: optStr,
  auxiliar: optStr,
  ovem: optStr,
  usuario_recibe: optStr,
  usuario_despacha: optStr,
  novedad_servicio: optText,
  observaciones: optText,
  motivo_externo: optStr,
  motivo_interno: optStr,
  estado_servicio: optStr,
  ciudad_registro: optStr,
});
export type MedicalServiceFormData = z.input<typeof medicalServiceSchema>;

// Perfiles de formulario por tipo de servicio (Regulación, QA 2026-07-22):
// cada tipo de servicio real muestra un subconjunto de secciones/campos.
// Enfermería Domiciliaria comparte perfil con Medicina Domiciliaria por
// similitud (visita a domicilio) — a confirmar con un usuario real.
export const PERFIL_FORMULARIO_SERVICIO = {
  MEDICINA_DOMICILIARIA: ["MEDICINA DOMICILIARIA", "ENFERMERIA DOMICILIARIA"],
  TRASLADO: ["TAB SIMPLE", "TAB DOBLE", "TAB SENCILLO", "TAM SIMPLE", "TAM DOBLE", "TRASLADO AEREO"],
  TELEMEDICINA: ["TELEMEDICINA"],
} as const;

export function perfilFormularioServicio(tipoServicio: string): keyof typeof PERFIL_FORMULARIO_SERVICIO | null {
  for (const [perfil, tipos] of Object.entries(PERFIL_FORMULARIO_SERVICIO)) {
    if ((tipos as readonly string[]).includes(tipoServicio)) return perfil as keyof typeof PERFIL_FORMULARIO_SERVICIO;
  }
  return null;
}

// Pasos y estados operativos del servicio: src/lib/estado-servicio.ts.

export const assessmentSchema = z.object({
  cedula: z.string().trim().min(4, "Documento inválido").max(20),
  nombre_completo: z.string().trim().min(3, "Nombre requerido").max(200),
  fecha_nacimiento: optStr,
  genero: optStr,
  aerolinea: optStr,
  fecha_hora_vuelo: optStr,
  acompanante: optStr,
  origen: optStr,
  destino: optStr,
  hc: optText,
  concepto_medico: optText,
  tiempo_estimado: optStr,
  recomendaciones: optText,
  // Selects cerrados como en registroValoracion.php de SISRES (antes eran texto libre:
  // "apto", "NO  APTO"… y el conteo de aptos no era confiable).
  valoracion: optEnum(VALORACION_OPCIONES, "Valoración: elige APTO o NO APTO"),
  estado: optEnum(ESTADO_VALORACION_OPCIONES, "Estado: elige ACTIVO o INACTIVO"),
  // `medico` y `pasajero` ya no vienen del formulario: los pone el servidor (médico = usuario que
  // registra; pasajero = nombre del paciente), como los campos ocultos de SISRES.
});
export type AssessmentFormData = z.input<typeof assessmentSchema>;

export const clientSchema = z.object({
  tipo_documento: z.string().trim().min(1).max(20),
  numero: z.string().trim().min(3, "NIT/documento requerido").max(30),
  digito_verificacion: optStr,
  nombre: z.string().trim().min(3, "Nombre requerido").max(200),
  sector: optStr,
  direccion: optStr,
  departamento: optStr,
  ciudad: optStr,
  telefono1: optStr,
  telefono2: optStr,
  telefono3: optStr,
  correo: z.string().trim().email("Correo inválido").optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
});
export type ClientFormData = z.input<typeof clientSchema>;

export const biomedicalEquipmentSchema = z.object({
  placa_equipo: z.string().trim().min(2, "Placa del equipo requerida").max(30),
  equipo: z.string().trim().min(2, "Nombre del equipo requerido").max(150),
  marca: optStr,
  modelo: optStr,
  serie: optStr,
  registro_invima: optStr,
  riesgo: optStr,
  ultimo_mantenimiento: optStr,
  proximo_mantenimiento: optStr,
  ultima_calibracion: optStr,
  proxima_calibracion: optStr,
  frec_mantenimiento: optStr,
  frec_calibracion: optStr,
  ubicacion_interna: optStr,
  aeropuerto: optStr,
  departamento: optStr,
  ciudad: optStr,
  adquisicion: optStr,
  area: optStr,
  observaciones: optText,
  voltaje: optStr,
  corriente: optStr,
  potencia: optStr,
  frecuencia: optStr,
  humedad: optStr,
  dimensiones: optStr,
  peso: optStr,
  temperatura: optStr,
  fecha_compra: optStr,
  proveedor_nombre: optStr,
  proveedor_contacto: optStr,
  operador: optStr,
});
export type BiomedicalEquipmentFormData = z.input<typeof biomedicalEquipmentSchema>;

export const biomedicalMaintenanceSchema = z.object({
  equipment_id: z.number().int().positive("Equipo requerido"),
  orden_numero: optStr,
  fecha_mantenimiento: z.string().trim().min(8, "Fecha requerida"),
  tipo_mantenimiento: optStr,
  codigo_institucional: optStr,
  ubicacion: optStr,
  sanidad: optStr,
  descripcion_falla: optText,
  obs_apto: z.boolean().default(true),
  obs_averiado: z.boolean().default(false),
  obs_reparacion: z.boolean().default(false),
  obs_baja: z.boolean().default(false),
  obs_partes: z.boolean().default(true),
  observaciones: optText,
  repuesto: optStr,
  referencia_serial: optStr,
  cantidad: z.number().int().nonnegative().optional(),
  obs_reparaciones: optText,
  realizo_nombre: z.string().trim().min(3, "Quién realizó es requerido").max(150),
  realizo_cargo: optStr,
  reviso_nombre: optStr,
  reviso_cargo: optStr,
});
export type BiomedicalMaintenanceFormData = z.input<typeof biomedicalMaintenanceSchema>;

export const waCampaignSchema = z.object({
  nombre: z.string().trim().min(3, "Nombre de campaña requerido").max(150),
  plantilla: z.string().trim().min(2, "Nombre de plantilla de Meta requerido").max(120),
  idioma: z.string().trim().min(2).max(10).default("es_CO"),
  destinatarios: z
    .array(
      z.object({
        telefono: z.string().trim().min(7, "Teléfono inválido").max(20),
        nombre: optStr,
        parametros: z.array(z.string().max(500)).default([]),
      })
    )
    .min(1, "Agrega al menos un destinatario")
    .max(2000, "Máximo 2000 destinatarios por campaña"),
});
export type WaCampaignFormData = z.input<typeof waCampaignSchema>;

// ─── Soporte técnico (tickets) — ver migración 065 ───────────────────────────
export const TICKET_PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const;
export const TICKET_ESTADOS = ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"] as const;

export const ticketSchema = z.object({
  sede: z.string().trim().min(1, "Selecciona la sede").max(100),
  area: z.string().trim().min(1, "Selecciona el área que solicita el soporte").max(100),
  categoria: z.string().trim().min(1, "Selecciona la categoría").max(100),
  prioridad: z.enum(TICKET_PRIORIDADES, { errorMap: () => ({ message: "Selecciona la prioridad" }) }),
  celular: z
    .string()
    .trim()
    .min(7, "Escribe un celular de contacto")
    .max(20, "Máximo 20 caracteres")
    .regex(/^[0-9+()\-\s]+$/, "El celular solo puede llevar números"),
  asunto: z.string().trim().min(1, "El asunto es obligatorio").max(150, "Máximo 150 caracteres"),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria").max(5000, "Máximo 5000 caracteres"),
});
export type TicketFormData = z.input<typeof ticketSchema>;

export const reabrirTicketSchema = z.object({
  id: z.number().int().positive(),
  nota: z.string().trim().min(1, "Tienes que explicar por qué reabres el ticket").max(1000, "Máximo 1000 caracteres"),
});

// ─── Soporte técnico: configuración — ver migración 067 ─────────────────────
const horaHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (HH:MM)");

export const ticketSlaSchema = z.object({
  baja: z.number().int().min(1, "Entre 1 y 720 horas").max(720, "Entre 1 y 720 horas"),
  media: z.number().int().min(1, "Entre 1 y 720 horas").max(720, "Entre 1 y 720 horas"),
  alta: z.number().int().min(1, "Entre 1 y 720 horas").max(720, "Entre 1 y 720 horas"),
  urgente: z.number().int().min(1, "Entre 1 y 720 horas").max(720, "Entre 1 y 720 horas"),
});

export const ticketHorarioSchema = z
  .object({
    dias: z.array(z.number().int().min(1).max(7)).min(1, "Elige al menos un día"),
    inicio: horaHHMM,
    fin: horaHHMM,
  })
  .refine((h) => h.fin > h.inicio, { message: "La hora de cierre debe ser posterior a la de apertura", path: ["fin"] });

export const ticketDisponibilidadSchema = z.object({
  anio: z.number().int().min(2020, "Año entre 2020 y 2100").max(2100, "Año entre 2020 y 2100"),
  mes: z.number().int().min(1, "Mes entre 1 y 12").max(12, "Mes entre 1 y 12"),
  porcentaje: z.number().min(0, "Entre 0 y 100").max(100, "Entre 0 y 100"),
  notas: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

export const ticketCorreoSchema = z.string().trim().toLowerCase().email("Correo inválido").max(254);
export const ticketMensajeSchema = z.string().trim().max(500, "Máximo 500 caracteres");
export const ticketCatalogoTipoSchema = z.enum(["sedes", "areas", "categorias"]);

// ─── Captación aeroportuaria + SISPRO — ver migración 080 ────────────────────
const textoOpc = (max: number) =>
  z.string().trim().max(max, `Máximo ${max} caracteres`).optional().transform((v) => (v ? v : undefined));
const textoReq = (max: number, msg: string) => z.string().trim().min(1, msg).max(max, `Máximo ${max} caracteres`);
const codigo = (min: number, max: number, msg: string) => z.coerce.number({ invalid_type_error: msg }).int(msg).min(min, msg).max(max, msg);
const vacioAUndefined = z.literal("").transform(() => undefined);

export const captacionSchema = z
  .object({
    // "yyyy-MM-ddTHH:mm" en hora de Colombia (el servidor lo convierte con aTimestamptzColombia)
    fecha_atencion: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Fecha y hora de la atención inválidas"),
    aeropuerto_atencion: textoReq(150, "Selecciona el aeropuerto de atención"),
    paciente_id: z.coerce.number().int().positive().optional().or(vacioAUndefined),
    tipo_identificacion: z.enum(["CC", "RC", "TI", "CE", "PA", "MS", "AS", "CD", "NV"], {
      errorMap: () => ({ message: "Selecciona el tipo de identificación" }),
    }),
    numero_identificacion: textoReq(18, "El número de identificación es obligatorio"),
    primer_nombre: textoReq(30, "El primer nombre es obligatorio"),
    segundo_nombre: textoOpc(30),
    primer_apellido: textoReq(30, "El primer apellido es obligatorio"),
    segundo_apellido: textoOpc(30),
    fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de nacimiento inválida").optional().or(vacioAUndefined),
    sexo: z.enum(["F", "M"], { errorMap: () => ({ message: "Selecciona el sexo" }) }),
    nacionalidad: textoReq(35, "La nacionalidad es obligatoria"),
    pais_residencia: textoReq(80, "Selecciona el país de residencia"),
    pais_procedencia: textoReq(80, "Selecciona el país de procedencia"),
    aeropuerto_procedencia: textoReq(150, "Selecciona el aeropuerto de procedencia"),
    telefono: z.string().trim().max(20).regex(/^[0-9+()\-\s]*$/, "El teléfono solo puede llevar números").optional().transform((v) => (v ? v : undefined)),
    tipo_usuario: codigo(1, 4, "Selecciona el tipo de usuario"),
    momento_atencion: codigo(1, 4, "Selecciona el momento de la atención"),
    motivo_consulta: codigo(1, 6, "Selecciona el motivo de consulta"),
    tipo_egreso: codigo(1, 3, "Selecciona el tipo de egreso"),
    tipo_atencion: textoOpc(60),
    resultado_autorizacion: z.enum(["APTO", "NO APTO"]).optional().or(vacioAUndefined),
    lugar_atencion: z.enum(["SERVICIO", "EXTERNO"]).optional().or(vacioAUndefined),
    lado_atencion: z.enum(["TIERRA", "AIRE"]).optional().or(vacioAUndefined),
    ubicacion_atencion: textoOpc(40),
    detalle_ubicacion: textoOpc(2000),
    tiempo_activacion: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora inválida").optional().or(vacioAUndefined),
    tiempo_llegada: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Hora inválida").optional().or(vacioAUndefined),
    condicion: textoOpc(30),
    cie10: z.string().trim().toUpperCase().regex(/^[A-Z]\d{2}[A-Z0-9]$/, "El CIE-10 debe tener 4 caracteres (ej. J449)"),
    patologia_sistema: textoOpc(120),
    otra_patologia: textoOpc(120),
    post_operatorio: textoOpc(120),
    accidente_especial: textoOpc(60),
    notificacion_obligatoria: textoOpc(150),
    tipo_vuelo: textoOpc(30),
    aerolinea: textoOpc(150),
    procedimientos: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
    emergencia_tipo: textoOpc(40),
    emergencia_notas: textoOpc(2000),
    remision: z.boolean(),
    ips_receptora: textoOpc(200),
    origen: textoOpc(100),
    destino: textoOpc(100),
    recibio_medicamentos: z.boolean(),
    medicamento: textoOpc(150),
    evento_adverso_medicamento: z.boolean().optional(),
    uso_dispositivo: z.boolean(),
    dispositivo: textoOpc(150),
    evento_adverso_dispositivo: z.boolean().optional(),
    medico_atendio: textoReq(100, "Indica el médico que atendió"),
  })
  .superRefine((d, ctx) => {
    const falta = (path: string, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    if (d.remision && !d.ips_receptora) falta("ips_receptora", "Selecciona la IPS receptora (999 si es desconocida)");
    if (d.recibio_medicamentos && !d.medicamento) falta("medicamento", "Indica el nombre del medicamento");
    if (d.recibio_medicamentos && d.evento_adverso_medicamento === undefined) falta("evento_adverso_medicamento", "Indica si hubo evento adverso");
    if (d.uso_dispositivo && !d.dispositivo) falta("dispositivo", "Indica el nombre del dispositivo");
    if (d.uso_dispositivo && d.evento_adverso_dispositivo === undefined) falta("evento_adverso_dispositivo", "Indica si hubo evento adverso");
    if (d.tipo_atencion === "AUTORIZACION DE VUELO" && !d.resultado_autorizacion) falta("resultado_autorizacion", "Indica el resultado (APTO / NO APTO)");
    if (d.lado_atencion && d.ubicacion_atencion) {
      const validas = { TIERRA: ["AREA TERMINAL", "VIAS DE ACCESO"], AIRE: ["AREA MANIOBRAS", "PLATAFORMA"] }[d.lado_atencion];
      if (!validas.includes(d.ubicacion_atencion)) falta("ubicacion_atencion", "La ubicación no corresponde al lado seleccionado");
    }
  });
export type CaptacionFormData = z.input<typeof captacionSchema>;
