import { z } from "zod";

// Prestadores médicos (tabla medical_providers, migración 058; en SISRES `proveedores`: registroProveedores.php /
// editarProveedor.php). Esquema propio aquí, no en validations.ts, para no tocar ese archivo compartido.

/** Áreas del select de registroProveedores.php (no tienen tabla propia en SISRES). */
export const AREAS_PRESTADOR = ["BIOMEDICA", "SISTEMAS", "TALENTO HUMANO", "CRA MEDELLIN", "CRA BOGOTA", "MANTENIMIENTO"] as const;

/** Quiénes crean y editan (RLS de la 058: INSERT/UPDATE a ADMIN y ANALISTA). */
export const ROLES_EDITAR_PRESTADORES = ["ADMIN", "ANALISTA"] as const;

export function puedeEditarPrestadores(rol: string | null | undefined): boolean {
  return (ROLES_EDITAR_PRESTADORES as readonly string[]).includes(rol ?? "");
}

const opcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => (v ? v : null));

// Límites = tamaño de las columnas de medical_providers.
export const prestadorSchema = z.object({
  tipo_documento: opcional(20),
  numero: z.string().trim().min(3, "Documento requerido").max(20, "Máximo 20 caracteres"),
  digito_verificacion: opcional(2),
  nombre: z.string().trim().min(3, "Nombre requerido").max(200),
  sector: opcional(40),
  direccion: opcional(150),
  departamento: opcional(100),
  ciudad: opcional(100),
  telefono1: opcional(20),
  telefono2: opcional(20),
  telefono3: opcional(20),
  correo: z.string().trim().max(150).email("Correo inválido").optional().or(z.literal("")).transform((v) => (v ? v : null)),
  area: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || (AREAS_PRESTADOR as readonly string[]).includes(v), "Área inválida"),
  activo: z.boolean().default(true),
});
export type PrestadorFormData = z.input<typeof prestadorSchema>;
