import { z } from 'zod';

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
  tipo_llantas: z.string().optional(),
  tipo_bombillos: z.string().optional(),
  tipo_refrigerante: z.string().optional(),
  aceite_usado: z.string().optional(),
  ref_filtro_aire_motor: z.string().optional(),
  ref_filtro_aceite: z.string().optional(),
  ref_filtro_combustible: z.string().optional(),
  notas: z.string().optional(),
  vencimiento_soat: z.string().optional().nullable(),
  vencimiento_tecnicomecanica: z.string().optional().nullable(),
  costo_soat_anual: z.coerce.number().nonnegative().optional().nullable(),
  costo_tecnomecanica_anual: z.coerce.number().nonnegative().optional().nullable(),
  costo_poliza_anual: z.coerce.number().nonnegative().optional().nullable(),
  centro_operativo_id: z.number().int().positive('Debe seleccionar un centro de operaciones'),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

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
  email: z.string().email("Email inválido"),
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
  roleCodigo: userRoleEnum,
});

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid("ID de usuario inválido"),
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

export const vehicleAssignmentSchema = z.object({
  vehicleId: z.string().uuid("ID de vehículo inválido"),
  userId: z.string().uuid("ID de usuario inválido"),
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
    tipo_refrigerante: z.unknown().optional(),
    aceite_usado: z.unknown().optional(),
    ref_filtro_aire_motor: z.unknown().optional(),
    ref_filtro_aceite: z.unknown().optional(),
    ref_filtro_combustible: z.unknown().optional(),
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
    tipo_refrigerante: cleanImportString(raw.tipo_refrigerante),
    aceite_usado: cleanImportString(raw.aceite_usado),
    ref_filtro_aire_motor: cleanImportString(raw.ref_filtro_aire_motor),
    ref_filtro_aceite: cleanImportString(raw.ref_filtro_aceite),
    ref_filtro_combustible: cleanImportString(raw.ref_filtro_combustible),
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
