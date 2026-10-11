/**
 * Reglas de formato de documento y celular para pacientes en Colombia (QA 2026-10-10, R13 y U2).
 * Sin dependencias de servidor: las usan el esquema del formulario y las acciones.
 *
 * Los rangos son deliberadamente anchos: cubren el formato real de cada documento sin rechazar números antiguos. Los
 * tipos «sin identificación» y los que no tienen un formato nacional único solo exigen un largo razonable.
 */

interface ReglaDocumento {
  /** Qué se acepta, para el mensaje de error. */
  descripcion: string;
  patron: RegExp;
}

const SOLO_NUMEROS = (min: number, max: number, nombre: string): ReglaDocumento => ({
  descripcion: `${nombre} lleva solo números, entre ${min} y ${max} dígitos`,
  patron: new RegExp(`^\\d{${min},${max}}$`),
});

const ALFANUMERICO = (min: number, max: number, nombre: string): ReglaDocumento => ({
  descripcion: `${nombre} lleva letras y números, entre ${min} y ${max} caracteres`,
  patron: new RegExp(`^[A-Za-z0-9]{${min},${max}}$`),
});

const REGLAS_DOCUMENTO: Record<string, ReglaDocumento> = {
  "CEDULA CIUDADANIA": SOLO_NUMEROS(6, 10, "La cédula de ciudadanía"),
  "CEDULA EXTRAJERIA": SOLO_NUMEROS(6, 10, "La cédula de extranjería"),
  "TARJETA DE IDENTIDAD": SOLO_NUMEROS(8, 11, "La tarjeta de identidad"),
  "REGISTRO DE NACIMIENTO": SOLO_NUMEROS(8, 11, "El registro de nacimiento"),
  "CERTIFICADO NACIDO VIVO": SOLO_NUMEROS(6, 15, "El certificado de nacido vivo"),
  NIT: { descripcion: "El NIT lleva entre 9 y 10 dígitos, con guion y dígito de verificación opcional (900123456-7)", patron: /^\d{9,10}(-\d)?$/ },
  PASAPORTE: ALFANUMERICO(5, 16, "El pasaporte"),
  "PERMISO ESPECIAL PERMANENCIA": ALFANUMERICO(5, 16, "El permiso especial de permanencia"),
  "DOCUMENTO EXTRAJERO": ALFANUMERICO(4, 20, "El documento extranjero"),
  "CARNET DIPLOMATICO": ALFANUMERICO(4, 20, "El carné diplomático"),
  "MENOR SIN IDENTIFICACION": ALFANUMERICO(4, 20, "El código de menor sin identificación"),
  "ADULTO SIN IDENTIFICACION": ALFANUMERICO(4, 20, "El código de adulto sin identificación"),
};

/** Documento sin espacios ni puntos de miles («1.020.437.165» → «1020437165»). */
export function normalizarDocumento(valor: string): string {
  return valor.replace(/[\s.]/g, "");
}

/** Mensaje de error si el documento no cumple el formato de su tipo; null si es válido. */
export function errorDeDocumento(tipo: string, valor: string): string | null {
  const regla = REGLAS_DOCUMENTO[tipo];
  const limpio = normalizarDocumento(valor);
  if (!limpio) return "Escribe el número de documento";
  if (!regla) return /^[A-Za-z0-9-]{4,20}$/.test(limpio) ? null : "El documento lleva letras, números y guion, entre 4 y 20 caracteres";
  return regla.patron.test(limpio) ? null : `${regla.descripcion}.`;
}

const MENSAJE_CELULAR =
  "El celular lleva 10 dígitos y empieza por 3 (ej. 3001234567). Si es fijo: 7 dígitos, o 10 con indicativo 60 (ej. 6041234567).";

/**
 * Celular o teléfono colombiano → solo dígitos, sin el +57. Devuelve el número normalizado, o null si no es válido.
 * Acepta móvil (10 dígitos, empieza por 3), fijo con indicativo (60 + ciudad 1 a 8 + 7 dígitos) y fijo local de 7 dígitos.
 */
export function normalizarCelularColombia(valor: string): string | null {
  const digitos = valor.replace(/[\s()\-]/g, "").replace(/^(\+57|0057|57)(?=\d{10}$)/, "");
  if (!/^\d+$/.test(digitos)) return null;
  if (/^3\d{9}$/.test(digitos)) return digitos;
  if (/^60[1-8]\d{7}$/.test(digitos)) return digitos;
  if (/^[2-8]\d{6}$/.test(digitos)) return digitos;
  return null;
}

export const mensajeCelular = (): string => MENSAJE_CELULAR;
