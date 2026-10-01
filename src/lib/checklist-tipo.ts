/**
 * El preoperacional tiene dos listas: la de AMBULANCIA (TAB y TAM, formato G-TECN-F 002) y la de automóvil o van
 * (DOMI, VAN y ADMIN). Cada ítem del catálogo lleva `tipos_vehiculo`: vacío (NULL) = aplica a todos.
 */

export type TipoVehiculo = "AMBULANCIA_TAB" | "AMBULANCIA_TAM" | "VAN" | "ADMIN" | "DOMI";

export const TIPOS_AMBULANCIA: readonly string[] = ["AMBULANCIA_TAB", "AMBULANCIA_TAM"];

/** Un vehículo sin tipo (hoja de vida aún sin cargar) responde la lista completa: es el caso seguro. */
export function aplicaAlTipo(tiposDelItem: readonly string[] | null | undefined, tipoVehiculo: string | null | undefined): boolean {
  if (!tiposDelItem || tiposDelItem.length === 0) return true;
  if (!tipoVehiculo) return true;
  return tiposDelItem.includes(tipoVehiculo);
}
