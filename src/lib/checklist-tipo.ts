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

/** Tipos de vehículo que Configuración trata como «medicina domiciliaria» (la lista de automóvil o van). */
export const TIPOS_DOMICILIARIA: readonly string[] = ["DOMI", "VAN", "ADMIN"];

export interface AplicaA {
  ambulancia: boolean;
  domiciliaria: boolean;
}

/** `tipos_vehiculo` de la base → casillas de Configuración. Vacío o NULL = aplica a todos. */
export function aplicaDesdeTipos(tipos: readonly string[] | null | undefined): AplicaA {
  if (!tipos || tipos.length === 0) return { ambulancia: true, domiciliaria: true };
  return {
    ambulancia: tipos.some((t) => TIPOS_AMBULANCIA.includes(t)),
    domiciliaria: tipos.some((t) => TIPOS_DOMICILIARIA.includes(t)),
  };
}

/** Casillas de Configuración → `tipos_vehiculo`. Las dos marcadas = NULL (todos). Ninguna marcada no es válida: devuelve undefined. */
export function tiposDesdeAplica(a: AplicaA): string[] | null | undefined {
  if (a.ambulancia && a.domiciliaria) return null;
  if (a.ambulancia) return [...TIPOS_AMBULANCIA];
  if (a.domiciliaria) return [...TIPOS_DOMICILIARIA];
  return undefined;
}
