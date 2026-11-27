import { ciudadRegistroDePerfil } from "@/lib/servicios-lista";

export const ERROR_CIUDAD_REGISTRO =
  "Indica la ciudad de registro (CRA Medellín o CRA Bogotá): sin móvil asignado no hay de dónde tomarla.";

/**
 * Ciudad de registro de un servicio NUEVO. Un ADMIN no tiene centro asignado, así que el formulario se la ofrece vacía y
 * el servicio quedaba sin ciudad (sale «—» en la lista y los filtros por ciudad lo pierden, #387). Primero manda lo que
 * se eligió a mano; si falta, la del centro del móvil asignado. Sin ninguna de las dos devuelve null: hay que exigirla.
 */
export function ciudadRegistroDeServicioNuevo(datos: {
  ciudad: string | null | undefined;
  centroDelMovil: string | null | undefined;
}): string | null {
  const elegida = (datos.ciudad ?? "").trim();
  if (elegida) return elegida;
  return ciudadRegistroDePerfil({ centro_codigo: datos.centroDelMovil ?? null, ciudad: null }) || null;
}

/**
 * La misma regla para la acción del servidor: la ciudad elegida manda; si falta, se consulta el centro del móvil (solo
 * entonces). null = no hay de dónde tomarla y el servicio no se crea.
 */
export async function ciudadRegistroAlCrear(datos: {
  ciudad: string | null | undefined;
  vehicleId: string | null | undefined;
  centroDelMovil: (vehicleId: string) => Promise<string | null | undefined>;
}): Promise<string | null> {
  const elegida = ciudadRegistroDeServicioNuevo({ ciudad: datos.ciudad, centroDelMovil: null });
  if (elegida || !datos.vehicleId) return elegida;
  return ciudadRegistroDeServicioNuevo({ ciudad: "", centroDelMovil: await datos.centroDelMovil(datos.vehicleId) });
}
