// Quién puede escribir clientes. En SISRES el Regulador registra y edita clientes pero no los elimina
// (PARIDAD_REGULACION.md, CLI-04/05/06). Debe coincidir con las políticas de `clients`: INSERT y UPDATE
// (migración 123) y DELETE solo ADMIN. El «desactivar» es un UPDATE, por eso se controla también en la acción.

export const ROLES_ESCRIBIR_CLIENTES: readonly string[] = ["ADMIN", "ANALISTA", "REGULACION"];
export const ROLES_DESACTIVAR_CLIENTE: readonly string[] = ["ADMIN"];

export function puedeEscribirClientes(rol: string | null | undefined): boolean {
  return Boolean(rol) && ROLES_ESCRIBIR_CLIENTES.includes(rol as string);
}

export function puedeDesactivarCliente(rol: string | null | undefined): boolean {
  return Boolean(rol) && ROLES_DESACTIVAR_CLIENTE.includes(rol as string);
}
