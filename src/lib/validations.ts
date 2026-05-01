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

// Schema de validación para incidente/novedad
export const incidentSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  descripcion: z.string().min(10, 'Mínimo 10 caracteres'),
  severidad: z.enum(['BAJA', 'MEDIA', 'ALTA'], {
    required_error: 'Debe seleccionar una severidad',
  }),
  reportadoPor: z.string().min(3, 'Mínimo 3 caracteres'),
  afectaOperatividad: z.boolean().default(false),
});

export type IncidentFormData = z.infer<typeof incidentSchema>;

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
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  nit: z.string().optional(),
  contacto: z.string().optional(),
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

const userRoleEnum = z.enum(["OVEM", "ADMIN", "SUPERADMIN", "REGULACION", "GERENCIAL"]);

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
  kilometrajeInicial: z.number().int().nonnegative("Kilometraje inicial inválido"),
  kilometrajeFinal: z.number().int().nonnegative().optional(),
  checklistOk: z.boolean(),
  observaciones: z.string().optional(),
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

export const operationalCenterUpdateNombreSchema = z.object({
  nombre: z.string().min(3, "Mínimo 3 caracteres").max(200),
});
