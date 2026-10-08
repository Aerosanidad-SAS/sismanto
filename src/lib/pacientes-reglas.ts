// Reglas de pacientes que vienen de SISRES y se comparten entre el servidor y las pantallas. Puro, para probarlo.

/** Largo mínimo del documento al registrar un paciente (insertarPacientes.php: «mínimo 5 caracteres»). */
export const CEDULA_PACIENTE_MIN = 5;

export function cedulaPacienteValida(cedula: string): boolean {
  return cedula.trim().length >= CEDULA_PACIENTE_MIN;
}

/**
 * Quién puede desactivar («eliminar») un paciente. En SISRES el Regulador no puede (PARIDAD_REGULACION.md, PAC-10), y
 * el borrado real de la tabla ya es solo de ADMIN (políticas de `patients`, migraciones 054 y 110): el desactivar es un
 * UPDATE, que la política de edición sí deja pasar a más roles, por eso se controla también aquí.
 */
export const ROLES_DESACTIVAR_PACIENTE: readonly string[] = ["ADMIN"];

export function puedeDesactivarPaciente(rol: string | null | undefined): boolean {
  return Boolean(rol) && ROLES_DESACTIVAR_PACIENTE.includes(rol as string);
}
