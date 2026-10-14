// Datos personales de un usuario que SISRES guardaba y SISMANTO no tenía dónde poner (migración 133, `user_profile_extra`).
// Puro (sin red ni base de datos) para probarlo: lo usan la acción de servidor y el formulario de Administración → Usuarios.
import { z } from "zod";
import { esDia, hoyBogota } from "@/lib/fechas";
import { TIPOS_DOCUMENTO } from "@/lib/validations";

export const RH_VALIDOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

/** Lo que el formulario manda: todo texto, y el vacío significa «sin dato». */
export interface DatosPersonalesUsuario {
  tipoDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  /** `YYYY-MM-DD`. Es un día, no un instante. */
  fechaNacimiento: string;
  rh: string;
  celular: string;
  departamento: string;
}

export const DATOS_PERSONALES_VACIOS: DatosPersonalesUsuario = {
  tipoDocumento: "",
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  fechaNacimiento: "",
  rh: "",
  celular: "",
  departamento: "",
};

const texto = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres`);
const nombre = (etiqueta: string) =>
  texto(100).regex(/^[\p{L}\p{M}' .-]*$/u, `${etiqueta}: solo letras, espacios y guion`);

export const datosPersonalesSchema = z.object({
  tipoDocumento: z.union([z.enum(TIPOS_DOCUMENTO), z.literal("")]),
  primerNombre: nombre("Primer nombre"),
  segundoNombre: nombre("Segundo nombre"),
  primerApellido: nombre("Primer apellido"),
  segundoApellido: nombre("Segundo apellido"),
  fechaNacimiento: z
    .string()
    .trim()
    .refine((v) => v === "" || esDia(v), "Fecha de nacimiento inválida")
    .refine((v) => v === "" || v >= "1900-01-01", "Fecha de nacimiento demasiado antigua")
    .refine((v) => v === "" || v <= hoyBogota(), "La fecha de nacimiento no puede ser futura"),
  rh: z.union([z.enum(RH_VALIDOS), z.literal("")]),
  celular: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9+()\s-]{7,30}$/.test(v), "Celular inválido: solo números, espacios, + y guion (7 a 30)"),
  departamento: texto(100),
});

/** Nombre completo a partir de las cuatro partes, sin espacios dobles. Vacío si no hay ninguna. */
export function nombreCompletoDe(d: Pick<DatosPersonalesUsuario, "primerNombre" | "segundoNombre" | "primerApellido" | "segundoApellido">): string {
  return [d.primerNombre, d.segundoNombre, d.primerApellido, d.segundoApellido]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/ +/g, " ");
}

const nulo = (v: string) => (v.trim() === "" ? null : v.trim());

/** Fila de `user_profile_extra` (sin `sisres_id`, que solo pone el ETL). Lo vacío va como NULL. */
export function filaExtra(userId: string, d: DatosPersonalesUsuario) {
  return {
    user_id: userId,
    tipo_documento: nulo(d.tipoDocumento),
    primer_nombre: nulo(d.primerNombre),
    segundo_nombre: nulo(d.segundoNombre),
    primer_apellido: nulo(d.primerApellido),
    segundo_apellido: nulo(d.segundoApellido),
    fecha_nacimiento: nulo(d.fechaNacimiento),
    rh: nulo(d.rh),
    celular: nulo(d.celular),
    departamento: nulo(d.departamento),
    updated_at: new Date().toISOString(),
  };
}

type FilaBase = Record<string, string | null | undefined>;

/** Lo que devuelve la base (`user_profile_extra`) a lo que usa el formulario. */
export function datosDesdeFila(f: FilaBase | null | undefined): DatosPersonalesUsuario {
  if (!f) return { ...DATOS_PERSONALES_VACIOS };
  return {
    tipoDocumento: f.tipo_documento ?? "",
    primerNombre: f.primer_nombre ?? "",
    segundoNombre: f.segundo_nombre ?? "",
    primerApellido: f.primer_apellido ?? "",
    segundoApellido: f.segundo_apellido ?? "",
    fechaNacimiento: f.fecha_nacimiento ?? "",
    rh: f.rh ?? "",
    celular: f.celular ?? "",
    departamento: f.departamento ?? "",
  };
}

/** ¿Escribió algo? Para no crear una fila vacía en `user_profile_extra`. */
export function tieneDatos(d: DatosPersonalesUsuario): boolean {
  return Object.values(d).some((v) => v.trim() !== "");
}
