/**
 * Convierte la tabla `usuarios` de SISRES en las filas de la plantilla de carga masiva de SISMANTO (lógica pura, sin red
 * ni archivos). La carga masiva ya crea la cuenta con la cédula como clave inicial, obliga a cambiarla en el primer
 * ingreso y rechaza la cédula como clave nueva (usuarios-carga.ts, auth.ts → cambiarClaveInicial): aquí solo se decide
 * qué fila va en la plantilla y con qué clave.
 *
 * Diferencias con el ETL directo (etl-usuarios.ts):
 *  - Quien no tiene correo NO se descarta: la carga masiva le crea un correo interno y entra con la cédula.
 *  - Las cuentas con más acceso (`ROLES_CON_CLAVE_PROPIA`) y quien tiene una cédula demasiado corta para ser clave
 *    reciben una clave aleatoria, que sale en una lista aparte para entregársela en persona: la cédula no es secreta.
 *  - Un rol que ve solo su centro NO se carga sin centro: sin centro vería toda la operación. Va a omitidas.
 */
import * as path from "path";
import { rolParaCargoSisres } from "../../scripts/cargo-sisres-a-rol";
import { generarClaveTemporal } from "./clave-temporal";
import { cedulaDe, correoValido, nombreDe, type FilaUsuario } from "./etl-usuarios";
import { LARGO_MINIMO_CLAVE, ROLES_CON_CENTRO, ROLES_CON_CLAVE_PROPIA } from "./usuarios-carga";

export { ROLES_CON_CLAVE_PROPIA };

/** Columnas de la hoja «USUARIOS» de la plantilla, en el orden en que se escriben. */
export const COLUMNAS_PLANTILLA = ["cedula", "nombre_completo", "rol", "centro_operativo", "ciudad", "email", "codigo_acceso", "password_inicial"] as const;

/** Columnas que el CSV de SISRES tiene que traer para poder convertirlo (el resto se ignora). */
export const COLUMNAS_SISRES_OBLIGATORIAS = ["id", "cargo", "estado"] as const;

export interface FilaPlantilla {
  cedula: string;
  nombre_completo: string;
  rol: string;
  centro_operativo: string;
  ciudad: string;
  email: string;
  codigo_acceso: string;
  /** Vacía = la clave inicial es la cédula. */
  password_inicial: string;
}

export interface ClaveEspecial {
  cedula: string;
  nombre: string;
  rol: string;
  clave: string;
  motivo: "ROL_CON_CLAVE_PROPIA" | "CEDULA_CORTA";
}

/** Categoría fija de cada omisión: el resumen por pantalla cuenta por esto, nunca por el texto libre del CSV. */
export type CategoriaOmitida =
  | "SIN_ID"
  | "INACTIVO"
  | "CARGO_SIN_EQUIVALENTE"
  | "SIN_CEDULA"
  | "CEDULA_FUERA_DE_RANGO"
  | "SIN_NOMBRE"
  | "CEDULA_REPETIDA"
  | "SIN_CENTRO";

export interface Omitida {
  categoria: CategoriaOmitida;
  motivo: string;
  fila: FilaUsuario;
}

export interface ResultadoConversion {
  plantilla: FilaPlantilla[];
  /** Filas que no entran a la plantilla y alguien tiene que resolver (o confirmar que no van). */
  omitidas: Omitida[];
  /** Filas que sí entran, pero con algo que revisar (p. ej. un correo repetido que se reemplazó por el interno). */
  avisos: { idSisres: string; cedula: string; aviso: string }[];
  clavesEspeciales: ClaveEspecial[];
}

export interface OpcionesConversion {
  claveAleatoria?: () => string;
  /** Roles que no entran con la cédula como clave. Por omisión `ROLES_CON_CLAVE_PROPIA`; se pueden agregar más, nunca quitar. */
  rolesConClavePropia?: readonly string[];
}

const sinTildes = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();

/**
 * Centro operativo de una ciudad de SISRES. Solo Bogotá y Medellín tienen regla oficial (servicios-centro.ts); cualquier
 * otro valor, o uno que nombre las dos ciudades a la vez, devuelve null y la persona queda en omitidas: no se adivina.
 */
export function centroDeCiudad(ciudad: string | null | undefined): string | null {
  const c = sinTildes(ciudad ?? "");
  const bogota = c.includes("BOGOTA");
  const medellin = c.includes("MEDELLIN");
  if (bogota === medellin) return null;
  return bogota ? "CRA_BOGOTA" : "CRA_MEDELLIN";
}

/** Cargo como número entero; acepta «7», «07» y «7.0» (lo que deja MySQL en un DOUBLE). Cualquier otra cosa: null. */
export function cargoDe(valor: string | undefined): number | null {
  const m = (valor ?? "").trim().match(/^([0-9]+)([.]0+)?$/);
  return m ? Number(m[1]) : null;
}

/**
 * ¿Trae el CSV las columnas mínimas? Un archivo con otro separador (`;`) o mal exportado no falla fila por fila con
 * «sin id» para todo: se detecta aquí y se dice. También avisa si hay caracteres de reemplazo (tildes dañadas por la codificación).
 */
export function revisarColumnasSisres(filas: FilaUsuario[]): string[] {
  if (filas.length === 0) return ["El archivo no tiene filas."];
  const problemas: string[] = [];
  const columnas = new Set(Object.keys(filas[0]));
  const faltan: string[] = COLUMNAS_SISRES_OBLIGATORIAS.filter((c) => !columnas.has(c));
  if (!columnas.has("usuario") && !columnas.has("identificacion")) faltan.push("usuario");
  if (faltan.length > 0) problemas.push(`Faltan las columnas ${faltan.join(", ")}: ¿el archivo usa «;» como separador o se exportó mal?`);
  if (filas.some((f) => Object.values(f).some((v) => v.includes("�")))) {
    problemas.push("Hay caracteres dañados (�): el archivo no está en UTF-8; vuelve a exportarlo en UTF-8.");
  }
  return problemas;
}

export function convertirUsuariosSisres(filas: FilaUsuario[], opciones: OpcionesConversion = {}): ResultadoConversion {
  const claveAleatoria = opciones.claveAleatoria ?? generarClaveTemporal;
  // Las del sistema siempre cuentan: una opción solo puede sumar roles, no sacarlos.
  const clavePropia = new Set([...ROLES_CON_CLAVE_PROPIA, ...(opciones.rolesConClavePropia ?? [])]);
  const plantilla: FilaPlantilla[] = [];
  const omitidas: Omitida[] = [];
  const avisos: ResultadoConversion["avisos"] = [];
  const clavesEspeciales: ClaveEspecial[] = [];
  const porCedula = new Map<string, string>();
  const correosUsados = new Set<string>();
  const omitir = (fila: FilaUsuario, categoria: CategoriaOmitida, motivo: string) => omitidas.push({ categoria, motivo, fila });

  // El id más bajo gana una cédula o un correo repetidos: es el registro más antiguo y el resultado no depende del orden del archivo.
  const conId = filas.filter((f) => {
    const valido = /^[0-9]+$/.test((f.id ?? "").trim());
    if (!valido) omitir(f, "SIN_ID", "Sin id de SISRES válido");
    return valido;
  });

  for (const f of conId.sort((a, b) => Number(a.id) - Number(b.id))) {
    if ((f.estado ?? "").trim() !== "1") {
      omitir(f, "INACTIVO", `Inactivo en SISRES (estado ${f.estado ?? "?"})`);
      continue;
    }
    const cargo = cargoDe(f.cargo);
    const rol = cargo === null ? null : rolParaCargoSisres(cargo);
    if (!rol) {
      omitir(f, "CARGO_SIN_EQUIVALENTE", `Cargo ${f.cargo ?? "?"} sin equivalente en SISMANTO`);
      continue;
    }
    const cedula = cedulaDe(f);
    if (!cedula) {
      omitir(f, "SIN_CEDULA", "Sin cédula legible");
      continue;
    }
    // Mismo rango que valida la pantalla de carga: aquí se descarta con motivo en vez de fallar luego en la vista previa.
    if (!/^\d{5,15}$/.test(cedula)) {
      omitir(f, "CEDULA_FUERA_DE_RANGO", "La cédula debe tener entre 5 y 15 dígitos");
      continue;
    }
    const nombre = nombreDe(f);
    if (nombre.length < 2) {
      omitir(f, "SIN_NOMBRE", "Sin nombre");
      continue;
    }
    const otra = porCedula.get(cedula);
    if (otra !== undefined) {
      omitir(f, "CEDULA_REPETIDA", `Cédula repetida con el usuario SISRES ${otra}`);
      continue;
    }

    const ciudad = (f.ciudad ?? "").trim();
    const centro = centroDeCiudad(ciudad);
    if ((ROLES_CON_CENTRO as readonly string[]).includes(rol) && !centro) {
      omitir(f, "SIN_CENTRO", `El rol ${rol} necesita centro y la ciudad «${ciudad || "vacía"}» no corresponde a una sola de Bogotá o Medellín`);
      continue;
    }
    porCedula.set(cedula, f.id);

    // SISRES guarda la cédula como número: si venía con ceros a la izquierda se perdieron, y quien la teclee con ellos no entrará.
    const original = (f.usuario ?? f.identificacion ?? "").trim();
    if (/^0[0-9]/.test(original)) avisos.push({ idSisres: f.id, cedula, aviso: "La cédula venía con ceros a la izquierda; se cargó sin ellos" });

    let email = (f.correo ?? "").trim().toLowerCase();
    if (email && !correoValido(email)) {
      avisos.push({ idSisres: f.id, cedula, aviso: "Correo inválido: entra con la cédula y un correo interno (sin recuperación por correo)" });
      email = "";
    } else if (email && correosUsados.has(email)) {
      avisos.push({ idSisres: f.id, cedula, aviso: "Correo repetido con otra persona de SISRES: entra con la cédula y un correo interno (sin recuperación por correo)" });
      email = "";
    }
    if (email) correosUsados.add(email);

    let password = "";
    if (clavePropia.has(rol)) {
      password = claveAleatoria();
      clavesEspeciales.push({ cedula, nombre, rol, clave: password, motivo: "ROL_CON_CLAVE_PROPIA" });
    } else if (cedula.length < LARGO_MINIMO_CLAVE) {
      password = claveAleatoria();
      clavesEspeciales.push({ cedula, nombre, rol, clave: password, motivo: "CEDULA_CORTA" });
    }

    plantilla.push({ cedula, nombre_completo: nombre, rol, centro_operativo: centro ?? "", ciudad, email, codigo_acceso: "", password_inicial: password });
  }
  return { plantilla, omitidas, avisos, clavesEspeciales };
}

// ─── Carpeta de salida ────────────────────────────────────────────────────────────────────────────────────────────

/** Servicios que sincronizan carpetas a la nube: lo que se escriba ahí sale del equipo (cédulas y claves en claro). */
const CARPETA_SINCRONIZADA = /onedrive|dropbox|google ?drive|icloud|nextcloud|mega(sync)?|pcloud/i;

export interface EvaluacionSalida {
  dentroDelRepo: boolean;
  sincronizada: boolean;
}

/**
 * Evalúa una carpeta de salida. Las dos rutas deben llegar YA resueltas con `realpath` (la guarda no puede evadirse con un
 * enlace simbólico ni con otra carpeta de trabajo): aquí solo se comparan.
 */
export function evaluarCarpetaDeSalida(salidaReal: string, raizRepoReal: string): EvaluacionSalida {
  return {
    dentroDelRepo: salidaReal === raizRepoReal || salidaReal.startsWith(raizRepoReal + path.sep),
    sincronizada: CARPETA_SINCRONIZADA.test(salidaReal),
  };
}

/** Nombres de los archivos que escribe el convertidor: si ya existe alguno, queda de una corrida anterior (con claves que ya no coinciden). */
export const PATRONES_SALIDA = [/^usuarios-plantilla-\d+\.xlsx$/, /^usuarios-omitidas\.csv$/, /^usuarios-avisos\.csv$/, /^claves-iniciales-especiales\.csv$/];

export function archivosDeCorridaAnterior(nombres: string[]): string[] {
  return nombres.filter((n) => PATRONES_SALIDA.some((p) => p.test(n)));
}
