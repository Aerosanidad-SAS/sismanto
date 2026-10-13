import { getProfile } from "@/app/api/actions/auth";
import { centroVisible } from "@/lib/auth-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { validarKmEnLinea, type LecturaKm, type OrigenLectura } from "@/lib/kilometraje";

/**
 * El historial se lee con la clave de servicio, así que primero se comprueba que el vehículo sea visible para quien pide
 * (su centro, con el cliente de sesión): si no, un OVEM podría reconstruir el km de un vehículo ajeno por los mensajes.
 */
async function vehiculoAccesible(vehicleId: string): Promise<boolean> {
  const profile = await getProfile();
  if (!profile) return false;
  const centro = centroVisible(profile);
  let q = (createClient() as any).from("vehicles").select("id").eq("id", vehicleId);
  if (centro) q = q.eq("centro_operativo", centro.codigo);
  const { data } = await q.maybeSingle();
  return Boolean(data);
}

/**
 * Lecturas de km que importan para validar una nueva (`km` en `fecha`): la mayor de ese día o anteriores y la menor de
 * días posteriores, en cada fuente. Se leen con la clave de servicio porque el OVEM solo ve sus propias filas de
 * tanqueos y preoperacionales (RLS), y la regla tiene que mirar todas las del vehículo. Solo se devuelve un mensaje.
 */
async function leerLecturasAcotadas(vehicleId: string, fecha: string, soloAnterior = false): Promise<LecturaKm[]> {
  const admin = createAdminClient() as any;
  const fuentes: Array<{ tabla: string; columna: string; origen: OrigenLectura }> = [
    { tabla: "mileage_logs", columna: "lectura_kilometraje", origen: "odómetro" },
    { tabla: "fuel_logs", columna: "kilometraje", origen: "tanqueo" },
    { tabla: "daily_checks", columna: "kilometraje_inicial", origen: "preoperacional" },
    { tabla: "daily_checks", columna: "kilometraje_final", origen: "preoperacional" },
  ];
  const lados = soloAnterior ? (["anterior"] as const) : (["anterior", "posterior"] as const);
  const consultas = fuentes.flatMap((f) =>
    lados.map(async (lado) => {
      // Sin NULL: en Postgres un `order desc` los pone primero y `limit 1` devolvería una fila sin km.
      let q = admin.from(f.tabla).select(`fecha, ${f.columna}`).eq("vehicle_id", vehicleId).not(f.columna, "is", null);
      q =
        lado === "anterior"
          ? q.lte("fecha", fecha).order(f.columna, { ascending: false })
          : q.gt("fecha", fecha).order(f.columna, { ascending: true });
      const { data, error } = await q.limit(1);
      if (error) throw new Error(`${f.tabla}: ${error.message}`);
      return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
        fecha: String(r.fecha),
        km: Number(r[f.columna]),
        origen: f.origen,
      }));
    })
  );
  return (await Promise.all(consultas)).flat();
}

/**
 * Valida un km nuevo contra todo el historial del vehículo. Devuelve el mensaje de error o null.
 * Si no se puede leer el historial NO se deja pasar: sin poder comparar, un km bajo se colaría y rompería el plan de
 * mantenimiento (el km solo avanza). El OVEM puede reintentar; el detalle queda en el log del servidor.
 */
export async function validarKmContraHistorial(
  vehicleId: string,
  fecha: string,
  km: number,
  opciones: { mismoDiaCuenta?: boolean } = {}
): Promise<string | null> {
  try {
    if (!(await vehiculoAccesible(vehicleId))) return "Vehículo no encontrado.";
    return validarKmEnLinea(km, fecha, await leerLecturasAcotadas(vehicleId, fecha), opciones);
  } catch (e) {
    console.error("[kilometraje] no se pudo leer el historial para validar el km:", e instanceof Error ? e.message : e);
    return "No se pudo verificar el kilometraje contra el historial del vehículo. Inténtalo de nuevo en un momento.";
  }
}

/**
 * Mayor km conocido hasta `fecha` (todas las fuentes), para validar el cierre. Si no se puede leer LANZA: quien cierra el
 * turno no debe validar a ciegas. Un vehículo no visible para quien pide devuelve null.
 */
export async function ultimoKmHastaFecha(vehicleId: string, fecha: string): Promise<number | null> {
  if (!(await vehiculoAccesible(vehicleId))) return null;
  const lecturas = await leerLecturasAcotadas(vehicleId, fecha, true);
  return lecturas.length > 0 ? Math.max(...lecturas.map((l) => l.km)) : null;
}
