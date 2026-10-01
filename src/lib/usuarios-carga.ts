import { texto } from "@/lib/hoja-de-vida";

/**
 * Validación de la plantilla de carga masiva de usuarios (PLANTILLA_USUARIOS_CARGA_MASIVA.xlsx). Funciones puras: la
 * vista previa y la carga usan las mismas reglas.
 */

export const ROLES_CARGA = [
  "ADMIN", "ANALISTA", "COORDINACION", "REGULACION", "OVEM", "MEDICO", "AUXILIAR_ENFERMERIA", "MANTENIMIENTO",
  "GERENCIAL", "VISTA", "TECNICO", "AEROPUERTO",
] as const;
export type RolCarga = (typeof ROLES_CARGA)[number];

/** Roles que ven solo la operación de su centro: sin centro asignado verían todo, así que aquí es obligatorio. */
export const ROLES_CON_CENTRO: readonly RolCarga[] = ["REGULACION", "OVEM", "MEDICO", "AUXILIAR_ENFERMERIA", "COORDINACION"];

export const LARGO_MINIMO_CLAVE = 8;

/** Filas por llamada al confirmar: cada usuario nuevo son varias llamadas a Auth y una función serverless dura pocos segundos. */
export const FILAS_POR_LOTE_USUARIOS = 12;

export interface FilaUsuarioCruda {
  fila: number;
  datos: Record<string, unknown>;
}

export interface UsuarioFila {
  cedula: string;
  nombre: string;
  rol: RolCarga;
  centro: string | null;
  ciudad: string | null;
  /** null = el sistema crea un correo interno. */
  email: string | null;
  /** null = el sistema asigna uno al azar. */
  codigo: string | null;
  /** Clave inicial ya resuelta (la cédula si no se escribió otra). */
  password: string;
  /** true si la clave es la cédula: es adivinable, solo sirve mientras no se use. */
  passwordEsCedula: boolean;
}

export interface ErrorUsuario {
  fila: number;
  columna?: string;
  mensaje: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function soloDigitos(v: unknown): string | null {
  const t = texto(v);
  if (!t) return null;
  return t.replace(/[\s.,-]/g, "");
}

/** Correo interno para quien no tiene: dominio .invalid (RFC 2606), nunca puede ser real. */
export function correoInterno(cedula: string): string {
  return `usuario.${cedula}@sismanto.invalid`;
}

export function validarUsuario(d: Record<string, unknown>, centrosValidos: ReadonlySet<string>): { ok: true; valor: UsuarioFila } | { ok: false; errores: Omit<ErrorUsuario, "fila">[] } {
  const errores: Omit<ErrorUsuario, "fila">[] = [];
  const falla = (columna: string, mensaje: string) => errores.push({ columna, mensaje });

  const cedula = soloDigitos(d.cedula);
  if (!cedula) falla("cedula", "Falta la cédula.");
  else if (!/^\d{5,15}$/.test(cedula)) falla("cedula", `«${texto(d.cedula)}» debe tener solo números (5 a 15 dígitos).`);

  const nombre = texto(d.nombre_completo);
  if (!nombre || nombre.length < 2) falla("nombre_completo", "Falta el nombre completo.");

  const rolCrudo = texto(d.rol)?.toUpperCase().replace(/\s+/g, "_") ?? null;
  const rol = rolCrudo && (ROLES_CARGA as readonly string[]).includes(rolCrudo) ? (rolCrudo as RolCarga) : null;
  if (!rol) falla("rol", rolCrudo ? `«${texto(d.rol)}» no es un rol válido (${ROLES_CARGA.join(", ")}).` : "Falta el rol.");

  const centroCrudo = texto(d.centro_operativo)?.toUpperCase().replace(/\s+/g, "_") ?? null;
  if (centroCrudo && !centrosValidos.has(centroCrudo)) falla("centro_operativo", `«${texto(d.centro_operativo)}» no es un centro válido (${Array.from(centrosValidos).join(", ")}).`);
  if (rol && (ROLES_CON_CENTRO as readonly string[]).includes(rol) && !centroCrudo) {
    falla("centro_operativo", `El rol ${rol} necesita centro operativo: define qué vehículos y servicios ve.`);
  }

  const email = texto(d.email)?.toLowerCase() ?? null;
  if (email && !EMAIL.test(email)) falla("email", `«${email}» no es un correo válido.`);

  const codigo = soloDigitos(d.codigo_acceso);
  if (codigo && !/^\d{6}$/.test(codigo)) falla("codigo_acceso", `«${texto(d.codigo_acceso)}» debe tener exactamente 6 números.`);

  const claveEscrita = texto(d.password_inicial);
  const password = claveEscrita ?? cedula ?? "";
  if (cedula && password.length < LARGO_MINIMO_CLAVE) {
    falla("password_inicial", `La clave inicial debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres${claveEscrita ? "" : " (la cédula es más corta: escribe una clave aquí)"}.`);
  }

  if (errores.length > 0) return { ok: false, errores };
  return {
    ok: true,
    valor: {
      cedula: cedula!,
      nombre: nombre!,
      rol: rol!,
      centro: centroCrudo,
      ciudad: texto(d.ciudad),
      email,
      codigo,
      password,
      passwordEsCedula: !claveEscrita,
    },
  };
}

/** Código de 6 dígitos que no esté en `usados` ni coincida con una cédula (ambos se aceptan en el mismo campo de login). */
export function generarCodigo(usados: Set<string>, azar: () => number = Math.random): string {
  for (let i = 0; i < 1000; i++) {
    const c = String(100000 + Math.floor(azar() * 900000));
    if (!usados.has(c)) {
      usados.add(c);
      return c;
    }
  }
  throw new Error("No se pudo generar un código de acceso libre.");
}

/** La clave nueva debe ser distinta de la cédula y del código de acceso, y tener el largo mínimo. */
export function validarClaveNueva(nueva: string, confirmacion: string, cedula: string | null, codigo: string | null): string | null {
  if (nueva.length < LARGO_MINIMO_CLAVE) return `La clave debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`;
  if (nueva !== confirmacion) return "Las dos claves no coinciden.";
  if (cedula && nueva === cedula) return "La clave no puede ser tu cédula.";
  if (codigo && nueva === codigo) return "La clave no puede ser tu código de acceso.";
  if (/^(\d)\1+$/.test(nueva)) return "La clave es demasiado simple.";
  return null;
}
