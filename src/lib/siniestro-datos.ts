// Datos obligatorios de un siniestro vial NUEVO (migración 112). Lógica pura: la usan el esquema del servidor y el formulario.
// Decisión de Daniel (2026-10-02): «siempre debe obligar». Las excepciones solo existen con una explicación escrita.

export const MIN_FOTOS_HECHOS = 2;
export const MIN_FOTOS_DOCUMENTOS = 1;
export const MIN_CARACTERES_EXPLICACION = 10;

export interface DatosObligatoriosSiniestro {
  hayTerceros: boolean;
  terceroPlaca?: string;
  terceroNombre?: string;
  terceroCedula?: string;
  sinTerceroMotivo?: string;
  abogadoNombre?: string;
  abogadoTelefono?: string;
  abogadoCedula?: string;
  abogadoCorreo?: string;
  sinAbogadoMotivo?: string;
  sinDocumentosMotivo?: string;
  fotosHechos: number;
  fotosDocumentos: number;
}

export interface ErrorSiniestro {
  path: keyof DatosObligatoriosSiniestro;
  message: string;
}

/** Placa colombiana: 5 a 7 letras o números (carro ABC123, moto ABC12D, remolque R12345), sin espacios ni guiones. */
export function normalizarPlaca(valor: string | undefined): string {
  return (valor ?? "").toUpperCase().replace(/[\s-]/g, "");
}

export function placaValida(valor: string | undefined): boolean {
  return /^[A-Z0-9]{5,7}$/.test(normalizarPlaca(valor));
}

/** Cédula (o documento de extranjería): 5 a 15 letras o números; se aceptan puntos y espacios al escribirla. */
export function normalizarCedula(valor: string | undefined): string {
  return (valor ?? "").toUpperCase().replace(/[\s.\-]/g, "");
}

export function cedulaValida(valor: string | undefined): boolean {
  return /^[A-Z0-9]{5,15}$/.test(normalizarCedula(valor));
}

export function telefonoValido(valor: string | undefined): boolean {
  return (valor ?? "").replace(/\D/g, "").length >= 7;
}

export function correoValido(valor: string | undefined): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((valor ?? "").trim());
}

function explicacionValida(valor: string | undefined): boolean {
  return (valor ?? "").trim().length >= MIN_CARACTERES_EXPLICACION;
}

function vacio(valor: string | undefined): boolean {
  return (valor ?? "").trim() === "";
}

/** Un abogado «presente» es cualquier dato del abogado escrito: si hay uno, deben estar los cuatro. */
export function abogadoDeclarado(d: Pick<DatosObligatoriosSiniestro, "abogadoNombre" | "abogadoTelefono" | "abogadoCedula" | "abogadoCorreo">): boolean {
  return [d.abogadoNombre, d.abogadoTelefono, d.abogadoCedula, d.abogadoCorreo].some((v) => !vacio(v));
}

const EXPLICA = `Explica el motivo (mínimo ${MIN_CARACTERES_EXPLICACION} caracteres).`;

/** Todos los obligatorios de un siniestro nuevo, con su mensaje por campo. Lista vacía = completo. */
export function validarObligatoriosSiniestro(d: DatosObligatoriosSiniestro): ErrorSiniestro[] {
  const errores: ErrorSiniestro[] = [];
  const falta = (path: ErrorSiniestro["path"], message: string) => errores.push({ path, message });

  if (d.hayTerceros) {
    if (!placaValida(d.terceroPlaca)) falta("terceroPlaca", "Escribe la placa del otro vehículo (5 a 7 letras o números).");
    if (vacio(d.terceroNombre)) falta("terceroNombre", "Escribe el nombre del implicado.");
    if (!cedulaValida(d.terceroCedula)) falta("terceroCedula", "Escribe la cédula del implicado (5 a 15 caracteres).");
  } else if (!explicacionValida(d.sinTerceroMotivo)) {
    falta("sinTerceroMotivo", "Si no hay otro vehículo o persona involucrada, explica por qué (p. ej. choque con un objeto fijo).");
  }

  // «Sin abogado» solo vale con una explicación escrita y sin datos de abogado; en cualquier otro caso van los cuatro datos.
  const sinAbogado = !abogadoDeclarado(d) && explicacionValida(d.sinAbogadoMotivo);
  if (!sinAbogado) {
    if (vacio(d.abogadoNombre)) falta("abogadoNombre", "Escribe el nombre del abogado presente, o marca «No hubo abogado presente» y explica por qué.");
    if (!telefonoValido(d.abogadoTelefono)) falta("abogadoTelefono", "Escribe el teléfono del abogado (mínimo 7 dígitos).");
    if (!cedulaValida(d.abogadoCedula)) falta("abogadoCedula", "Escribe la cédula del abogado (5 a 15 caracteres).");
    if (!correoValido(d.abogadoCorreo)) falta("abogadoCorreo", "Escribe un correo válido del abogado.");
  }

  if (d.fotosHechos < MIN_FOTOS_HECHOS) {
    falta("fotosHechos", `Adjunta al menos ${MIN_FOTOS_HECHOS} fotos de los hechos.`);
  }
  if (d.fotosDocumentos < MIN_FOTOS_DOCUMENTOS) {
    if (!explicacionValida(d.sinDocumentosMotivo)) {
      falta("fotosDocumentos", "Adjunta una foto de los documentos generados (IPAT, acta) o marca «No se generaron documentos» y explica por qué.");
    }
  }
  return errores;
}

/** Los mensajes de explicación de las casillas de excepción, por si el formulario necesita mostrarlos. */
export const MENSAJE_EXPLICACION = EXPLICA;

export interface ResumenFotosSiniestro {
  hechos: number;
  documentos: number;
  /** Cuántas fotos faltan para cumplir el mínimo (considerando la excepción «sin documentos»). */
  faltanHechos: number;
  faltanDocumentos: number;
  completo: boolean;
}

/** Estado de las fotos de un siniestro ya guardado (para el detalle y para reintentar lo pendiente). */
export function resumirFotos(hechos: number, documentos: number, sinDocumentosMotivo: string | null | undefined): ResumenFotosSiniestro {
  const faltanHechos = Math.max(0, MIN_FOTOS_HECHOS - hechos);
  const faltanDocumentos = explicacionValida(sinDocumentosMotivo ?? undefined) ? 0 : Math.max(0, MIN_FOTOS_DOCUMENTOS - documentos);
  return { hechos, documentos, faltanHechos, faltanDocumentos, completo: faltanHechos === 0 && faltanDocumentos === 0 };
}

/** Las novedades creadas por reportRoadAccident empiezan así; sirve para enlazar la novedad con el detalle del siniestro. */
export function esNovedadSiniestro(descripcion: string | null | undefined): boolean {
  return (descripcion ?? "").startsWith("Siniestro vial");
}
