/** Reglas puras de «Eliminar usuario» y «Cambiar correo» (Administración → Usuarios). Sin Next ni Supabase: se prueban solas. */
import { ticketCorreoSchema } from "@/lib/validations";

export interface TablaConHistorial {
  tabla: string;
  filas: number;
}

export interface EntradaBloqueoEliminar {
  actorId: string;
  actorRol: string;
  objetivoId: string;
  objetivoRol: string;
  objetivoActivo: boolean;
  /** Cuántos ADMIN activos hay ADEMÁS del objetivo: si es el único que queda, eliminarlo dejaría el sistema sin administrador. */
  otrosAdminsActivos: number;
  historial: TablaConHistorial[];
}

/** Nombres que entiende una persona para las tablas de historia; el resto se muestra con su nombre técnico. */
const NOMBRE_TABLA: Record<string, string> = {
  medical_services: "servicios",
  daily_checks: "preoperacionales",
  supply_checks: "tanqueos y suministros",
  vehicle_assignments: "asignaciones de vehículo",
  incidents: "novedades",
};

const sinEsquema = (t: string) => t.replace(/^public\./, "").replaceAll('"', "");

export function describirHistorial(historial: TablaConHistorial[]): string {
  const nombres = [...new Set(historial.map((h) => NOMBRE_TABLA[sinEsquema(h.tabla)] ?? sinEsquema(h.tabla)))];
  return nombres.slice(0, 6).join(", ") + (nombres.length > 6 ? ` y ${nombres.length - 6} más` : "");
}

/** Motivo por el que NO se puede eliminar, o null si se puede. El orden es el de las reglas: lo más fundamental primero. */
export function motivoBloqueoEliminar(e: EntradaBloqueoEliminar): string | null {
  if (e.actorRol !== "ADMIN") return "Solo un Administrador puede eliminar usuarios.";
  if (e.actorId === e.objetivoId) return "No puedes eliminar tu propio usuario.";
  if (e.objetivoRol === "ADMIN" && e.otrosAdminsActivos < 1) return "No se puede eliminar al último Administrador.";
  // Un usuario activo puede registrar historial (un preoperacional, un tanqueo) entre la comprobación y el borrado, y el
  // borrado en cascada se lo llevaría sin aviso. Deshabilitado ya no inicia sesión: la comprobación deja de ser una carrera.
  if (e.objetivoActivo) return "Deshabilita primero al usuario (así no puede registrar nada mientras se elimina) y luego elimínalo.";
  if (e.historial.length > 0) {
    return `Este usuario ya tiene historial (${describirHistorial(e.historial)}): eliminarlo borraría o dejaría sin autor esos registros. Usa «Deshabilitar», que le quita el acceso y conserva la trazabilidad.`;
  }
  return null;
}

/** Un ADMIN no cambia el correo de OTRO ADMIN: con él podría recuperar la clave de esa cuenta y actuar con su identidad. */
export function motivoBloqueoCorreo(e: { actorId: string; objetivoId: string; objetivoRol: string }): string | null {
  return e.objetivoRol === "ADMIN" && e.actorId !== e.objetivoId
    ? "No se puede cambiar el correo de otro Administrador: cada Administrador cambia el suyo."
    : null;
}

/** Lo que hay que escribir para confirmar la eliminación: el correo, o «ELIMINAR» si la persona no tiene. */
export const textoConfirmacionEliminar = (correo: string | null | undefined) => (correo?.trim() ? correo.trim() : "ELIMINAR");

export const confirmacionEliminarValida = (escrito: string, correo: string | null | undefined) =>
  escrito.trim().toLowerCase() === textoConfirmacionEliminar(correo).toLowerCase();

export type ResultadoCorreo = { ok: true; correo: string } | { ok: false; error: string };

/** Normaliza (recorta y pasa a minúsculas) y valida el formato; rechaza lo que ya es el correo actual. */
export function validarCorreoNuevo(nuevo: string, actual: string | null | undefined): ResultadoCorreo {
  const parsed = ticketCorreoSchema.safeParse(nuevo);
  if (!parsed.success) return { ok: false, error: "Escribe un correo válido, por ejemplo nombre@empresa.com" };
  if (parsed.data === (actual ?? "").trim().toLowerCase()) return { ok: false, error: "Ese ya es el correo de la persona." };
  return { ok: true, correo: parsed.data };
}

/** Error de Supabase Auth por correo repetido → mensaje claro (Auth lo dice de varias maneras según la versión). */
export const esCorreoDuplicado = (mensaje: string | undefined | null, codigo?: string | null) =>
  codigo === "email_exists" || /already (been )?registered|already exists|duplicate/i.test(mensaje ?? "");
