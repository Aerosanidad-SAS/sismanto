// Campos obligatorios configurables por módulo (migración 101), portado del motor genérico de SISRES
// (includes/camposObligatoriosGenerico.php + un *CamposConfig.php por módulo). Puro: lo usan las acciones de cada
// módulo, la pantalla de configuración y los formularios.
//
// Cada módulo declara SOLO sus campos opcionales: los que el esquema ya exige siempre no se configuran.
// Para sumar un módulo: agregar su entrada aquí, llamar a `camposFaltantes` en su acción de crear/editar y marcar
// las etiquetas del formulario con `conAsterisco`.

export const MODULOS_CAMPOS = {
  pacientes: {
    etiqueta: "Pacientes",
    siempre: "Tipo y número de documento, primer nombre y primer apellido",
    campos: [
      { campo: "nombre2", etiqueta: "Segundo nombre" },
      { campo: "apellido2", etiqueta: "Segundo apellido" },
      { campo: "fecha_nacimiento", etiqueta: "Fecha de nacimiento" },
      { campo: "sexo", etiqueta: "Sexo" },
      { campo: "rh", etiqueta: "RH" },
      { campo: "estatura", etiqueta: "Estatura" },
      { campo: "departamento", etiqueta: "Departamento" },
      { campo: "ciudad", etiqueta: "Ciudad" },
      { campo: "direccion", etiqueta: "Dirección" },
      { campo: "barrio", etiqueta: "Barrio" },
      { campo: "localidad", etiqueta: "Localidad" },
      { campo: "eps", etiqueta: "EPS" },
      { campo: "celular", etiqueta: "Celular" },
      { campo: "correo", etiqueta: "Correo" },
    ],
  },
} as const;

export type ModuloCampos = keyof typeof MODULOS_CAMPOS;
export const MODULOS_CONFIGURABLES = Object.keys(MODULOS_CAMPOS) as ModuloCampos[];

export function esModuloCampos(v: string): v is ModuloCampos {
  return Object.prototype.hasOwnProperty.call(MODULOS_CAMPOS, v);
}

/** Nombres de los campos configurables de un módulo. */
export function camposDelModulo(modulo: ModuloCampos): string[] {
  return MODULOS_CAMPOS[modulo].campos.map((c) => c.campo);
}

/** Solo los campos que el módulo conoce (una fila vieja de un campo retirado no debe bloquear el formulario). */
export function filtrarConocidos(modulo: ModuloCampos, campos: readonly string[]): string[] {
  const conocidos = camposDelModulo(modulo);
  return conocidos.filter((c) => campos.includes(c));
}

const vacio = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/** Etiquetas de los campos obligatorios que vienen vacíos (vacío = undefined, null o solo espacios). */
export function camposFaltantes(modulo: ModuloCampos, datos: Record<string, unknown>, obligatorios: readonly string[]): string[] {
  return MODULOS_CAMPOS[modulo].campos.filter((c) => obligatorios.includes(c.campo) && vacio(datos[c.campo])).map((c) => c.etiqueta);
}

/** Mensaje de error para el usuario, o null si no falta nada. */
export function mensajeFaltantes(faltantes: readonly string[]): string | null {
  if (faltantes.length === 0) return null;
  return `Faltan campos obligatorios: ${faltantes.join(", ")}`;
}

/** Etiqueta con « *» si el campo es obligatorio. */
export function conAsterisco(etiqueta: string, campo: string, obligatorios: readonly string[]): string {
  return obligatorios.includes(campo) ? `${etiqueta} *` : etiqueta;
}
