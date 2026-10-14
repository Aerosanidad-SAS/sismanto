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

/**
 * Quién puede crear y editar pacientes. Es EXACTAMENTE la lista de las políticas `patients_insert` y `patients_update`
 * de la base: la acción la valida también (SEC-07 de PARIDAD_REGULACION.md: no confiar solo en la RLS, y fallar con un
 * mensaje claro en vez de «0 filas» o un error de política). Si cambia una, cambia la otra.
 */
export const ROLES_ESCRIBIR_PACIENTE: readonly string[] = ["ADMIN", "REGULACION", "MEDICO", "AUXILIAR_ENFERMERIA", "ANALISTA"];

export function puedeEscribirPaciente(rol: string | null | undefined): boolean {
  return Boolean(rol) && ROLES_ESCRIBIR_PACIENTE.includes(rol as string);
}
