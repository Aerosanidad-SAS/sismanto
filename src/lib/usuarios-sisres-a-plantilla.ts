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
import { correoValido, nombreDe, type FilaUsuario } from "./etl-usuarios";
import { LARGO_MINIMO_CLAVE, ROLES_CON_CENTRO, ROLES_CON_CLAVE_PROPIA } from "./usuarios-carga";

export { ROLES_CON_CLAVE_PROPIA };

/** Columnas de la hoja «USUARIOS» de la plantilla, en el orden en que se escriben. */
export const COLUMNAS_PLANTILLA = ["cedula", "nombre_completo", "rol", "centro_operativo", "ciudad", "email", "codigo_acceso", "password_inicial", "activo"] as const;

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
  /** Vacía = la clave inicial es la cédula. En una cuenta inactiva nunca va vacía: es una clave al azar que nadie ve. */
  password_inicial: string;
  /** «NO» = se crea desactivada (no entra): quien ya no trabaja pero sigue ligado a servicios históricos. */
  activo: "SI" | "NO";
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

/** Categoría fija de cada aviso (el resumen por pantalla cuenta por esto, no por texto libre). */
export type CategoriaAviso = "CORREO" | "CEROS_A_LA_IZQUIERDA" | "USUARIO_NO_ES_CEDULA" | "USUARIO_DISTINTO_DE_IDENTIFICACION";

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
  avisos: { categoria: CategoriaAviso; idSisres: string; cedula: string; aviso: string }[];
  clavesEspeciales: ClaveEspecial[];
}

export interface OpcionesConversion {
  claveAleatoria?: () => string;
  /** Roles que no entran con la cédula como clave. Por omisión `ROLES_CON_CLAVE_PROPIA`; se pueden agregar más, nunca quitar. */
  rolesConClavePropia?: readonly string[];
  /** Estados de SISRES que se cargan como personas ACTIVAS. Por omisión solo «1»: lo demás se omite. */
  estadosCargados?: readonly string[];
  /**
   * Estados de SISRES que se cargan como personas INACTIVAS (se crean desactivadas, sin poder entrar): quien ya no trabaja pero
   * está ligado a servicios históricos tiene que existir en el sistema. Por omisión ninguno.
   */
  estadosInactivos?: readonly string[];
  /** Ciudad de SISRES (como viene en el CSV) → código de centro, para las que no son Bogotá ni Medellín. */
  centrosPorCiudad?: Readonly<Record<string, string>>;
}

const sinTildes = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "").toUpperCase();

/**
 * Centro operativo de una ciudad de SISRES. Solo Bogotá y Medellín tienen regla oficial (servicios-centro.ts); cualquier
 * otro valor, o uno que nombre las dos ciudades a la vez, devuelve null y la persona queda en omitidas: no se adivina.
 */
export function centroDeCiudad(ciudad: string | null | undefined, adicionales: Readonly<Record<string, string>> = {}): string | null {
  const c = sinTildes(ciudad ?? "");
  // Una ciudad que el dueño asignó a mano a un centro manda sobre la regla general.
  const clave = Object.keys(adicionales).find((k) => sinTildes(k).trim() === c.trim());
  if (clave) return adicionales[clave];
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
 * Cédula limpia (solo dígitos) a partir de lo que trae SISRES. Quita los puntos y las comas cuando son separadores de miles
 * («1.020.458.300», «1,020,458,300»). Un punto que NO es de miles es el decimal que deja MySQL en un DOUBLE («1234567.0»):
 * la cédula es lo que está ANTES del punto. Quitarlo a ciegas le agregaría un dígito a la cédula (y a la clave).
 * Cualquier otra cosa (letras, «1.5»…) devuelve null o un valor demasiado corto que el rango de la carga rechaza.
 */
export function limpiarCedula(valor: string | undefined): string | null {
  const t = (valor ?? "").trim().replace(/\s+/g, "");
  const sinCeros = (d: string) => d.replace(/^0+/, "") || null;
  if (/^[0-9]+$/.test(t)) return sinCeros(t);
  if (/^[0-9]{1,3}([.,][0-9]{3})+$/.test(t)) return sinCeros(t.replace(/[.,]/g, ""));
  const decimal = t.match(/^([0-9]+)[.,][0-9]{1,2}$/);
  if (decimal) return sinCeros(decimal[1]);
  return null;
}

const CEDULA_VALIDA = /^\d{5,15}$/;

/**
 * La cédula de la persona. Manda `usuario` (con lo que se entraba a SISRES), ya limpio; si no sirve (p. ej. «1.5») se usa
 * `identificacion`. Si las dos sirven y no coinciden, se usa `usuario` y se deja el aviso para que alguien lo revise.
 */
export function resolverCedula(f: FilaUsuario): { cedula: string | null; aviso: { categoria: CategoriaAviso; texto: string } | null } {
  const deUsuario = limpiarCedula(f.usuario);
  const deIdentificacion = limpiarCedula(f.identificacion);
  if (deUsuario && CEDULA_VALIDA.test(deUsuario)) {
    const distinta = deIdentificacion && deIdentificacion !== deUsuario;
    return { cedula: deUsuario, aviso: distinta ? { categoria: "USUARIO_DISTINTO_DE_IDENTIFICACION", texto: "El usuario y la identificación no coinciden: se usó el usuario" } : null };
  }
  if (deIdentificacion && CEDULA_VALIDA.test(deIdentificacion)) {
    return { cedula: deIdentificacion, aviso: { categoria: "USUARIO_NO_ES_CEDULA", texto: "El usuario no era una cédula válida: se usó la identificación" } };
  }
  return { cedula: deUsuario ?? deIdentificacion, aviso: null };
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
  const estadosActivos = new Set(opciones.estadosCargados ?? ["1"]);
  const estadosInactivos = new Set(opciones.estadosInactivos ?? []);
  // Si un estado está en las dos listas, manda «activo».
  const esInactiva = (f: FilaUsuario) => !estadosActivos.has((f.estado ?? "").trim()) && estadosInactivos.has((f.estado ?? "").trim());
  const centrosPorCiudad = opciones.centrosPorCiudad ?? {};
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

  // Cédulas de TODA fila activa, aunque luego se omita (sin centro, cargo sin equivalente…): una persona inactiva con esa misma cédula
  // no se carga, porque quedaría con una cuenta inactiva y, cuando alguien resuelva su fila activa, la carga masiva la vería como «ya
  // existe» y nunca podría entrar.
  const cedulasDeActivas = new Set<string>();
  for (const f of conId) {
    if (!estadosActivos.has((f.estado ?? "").trim())) continue;
    const { cedula } = resolverCedula(f);
    if (cedula && CEDULA_VALIDA.test(cedula)) cedulasDeActivas.add(cedula);
  }

  // Primero las activas y luego las inactivas: si una persona inactiva comparte cédula o correo con una activa, se queda la activa.
  const ordenadas = conId.sort((a, b) => Number(esInactiva(a)) - Number(esInactiva(b)) || Number(a.id) - Number(b.id));
  for (const f of ordenadas) {
    const inactiva = esInactiva(f);
    if (!estadosActivos.has((f.estado ?? "").trim()) && !inactiva) {
      omitir(f, "INACTIVO", `Inactivo en SISRES (estado ${f.estado ?? "?"})`);
      continue;
    }
    const cargo = cargoDe(f.cargo);
    const rol = cargo === null ? null : rolParaCargoSisres(cargo);
    if (!rol) {
      omitir(f, "CARGO_SIN_EQUIVALENTE", `Cargo ${f.cargo ?? "?"} sin equivalente en SISMANTO`);
      continue;
    }
    const { cedula, aviso: avisoCedula } = resolverCedula(f);
    if (!cedula) {
      omitir(f, "SIN_CEDULA", "Sin cédula legible");
      continue;
    }
    // Mismo rango que valida la pantalla de carga: aquí se descarta con motivo en vez de fallar luego en la vista previa.
    if (!CEDULA_VALIDA.test(cedula)) {
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
    const centro = centroDeCiudad(ciudad, centrosPorCiudad);
    if (inactiva && cedulasDeActivas.has(cedula)) {
      omitir(f, "CEDULA_REPETIDA", "Cédula de una persona ACTIVA que no se cargó: resuélvela primero y enlaza lo histórico a esa cuenta");
      continue;
    }

    // Una cuenta inactiva no entra, así que el centro (que limita lo que se ve) no es obligatorio.
    if (!inactiva && (ROLES_CON_CENTRO as readonly string[]).includes(rol) && !centro) {
      omitir(f, "SIN_CENTRO", `El rol ${rol} necesita centro y la ciudad «${ciudad || "vacía"}» no corresponde a una sola de Bogotá o Medellín`);
      continue;
    }
    porCedula.set(cedula, f.id);

    if (avisoCedula) avisos.push({ categoria: avisoCedula.categoria, idSisres: f.id, cedula, aviso: avisoCedula.texto });
    // SISRES guarda la cédula como número: si venía con ceros a la izquierda se perdieron, y quien la teclee con ellos no entrará.
    const original = (f.usuario ?? "").trim();
    if (/^0[0-9]+$/.test(original)) avisos.push({ categoria: "CEROS_A_LA_IZQUIERDA", idSisres: f.id, cedula, aviso: "La cédula venía con ceros a la izquierda; se cargó sin ellos" });

    // Una persona inactiva va SIN correo (la carga le crea uno interno): si ese archivo llegara a una versión de la carga que no
    // entienda «activo», la cuenta quedaría activa y, con un correo real, podría entrar por «¿Olvidaste tu contraseña?».
    let email = inactiva ? "" : (f.correo ?? "").trim().toLowerCase();
    if (email && !correoValido(email)) {
      avisos.push({ categoria: "CORREO", idSisres: f.id, cedula, aviso: "Correo inválido: entra con la cédula y un correo interno (sin recuperación por correo)" });
      email = "";
    } else if (email && correosUsados.has(email)) {
      avisos.push({ categoria: "CORREO", idSisres: f.id, cedula, aviso: "Correo repetido con otra persona de SISRES: entra con la cédula y un correo interno (sin recuperación por correo)" });
      email = "";
    }
    if (email) correosUsados.add(email);

    let password = "";
    if (inactiva) {
      // Nunca la cédula: si esta fila se subiera a una versión de la carga que no entienda «activo», la cuenta no quedaría
      // abierta con una clave conocida. No va a la lista de entrega: nadie debe poder entrar con ella.
      password = claveAleatoria();
    } else if (clavePropia.has(rol)) {
      password = claveAleatoria();
      clavesEspeciales.push({ cedula, nombre, rol, clave: password, motivo: "ROL_CON_CLAVE_PROPIA" });
    } else if (cedula.length < LARGO_MINIMO_CLAVE) {
      password = claveAleatoria();
      clavesEspeciales.push({ cedula, nombre, rol, clave: password, motivo: "CEDULA_CORTA" });
    }

    plantilla.push({ cedula, nombre_completo: nombre, rol, centro_operativo: centro ?? "", ciudad, email, codigo_acceso: "", password_inicial: password, activo: inactiva ? "NO" : "SI" });
  }
  return { plantilla, omitidas, avisos, clavesEspeciales };
}

// ─── Carpeta de salida ────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Servicios que sincronizan carpetas a la nube: lo que se escriba ahí sale del equipo (cédulas y claves en claro). Lista fácil
 * de ampliar si aparece un caso real; la guía (docs/PASADA_USUARIOS.md) pide además revisarlo a mano.
 */
const CARPETA_SINCRONIZADA = /onedrive|dropbox|google ?drive|icloud|nextcloud|mega(sync)?|pcloud|proton ?drive|sync\.com|tresorit|seafile|syncthing/i;

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
export const PATRONES_SALIDA = [/^usuarios-plantilla-\d+\.xlsx$/, /^usuarios-inactivos-\d+\.xlsx$/, /^usuarios-omitidas\.csv$/, /^usuarios-avisos\.csv$/, /^claves-iniciales-especiales\.csv$/];

export function archivosDeCorridaAnterior(nombres: string[]): string[] {
  return nombres.filter((n) => PATRONES_SALIDA.some((p) => p.test(n)));
}
