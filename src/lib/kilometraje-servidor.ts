import { createAdminClient } from "@/lib/supabase/admin";
import { validarKmEnLinea, type LecturaKm, type OrigenLectura } from "@/lib/kilometraje";

/**
 * Lecturas de km que importan para validar una nueva (`km` en `fecha`): la mayor de ese día o anteriores y la menor de
 * días posteriores, en cada fuente. Se leen con la clave de servicio porque el OVEM solo ve sus propias filas de
 * tanqueos y preoperacionales (RLS), y la regla tiene que mirar todas las del vehículo. Solo se devuelve un mensaje.
 */
async function leerLecturasAcotadas(vehicleId: string, fecha: string): Promise<LecturaKm[]> {
  const admin = createAdminClient() as any;
  const fuentes: Array<{ tabla: string; columna: string; origen: OrigenLectura; soloConValor?: boolean }> = [
    { tabla: "mileage_logs", columna: "lectura_kilometraje", origen: "odómetro" },
    { tabla: "fuel_logs", columna: "kilometraje", origen: "tanqueo" },
    { tabla: "daily_checks", columna: "kilometraje_inicial", origen: "preoperacional" },
    { tabla: "daily_checks", columna: "kilometraje_final", origen: "preoperacional", soloConValor: true },
  ];
  const consultas = fuentes.flatMap((f) =>
    (["anterior", "posterior"] as const).map(async (lado) => {
      let q = admin.from(f.tabla).select(`fecha, ${f.columna}`).eq("vehicle_id", vehicleId);
      if (f.soloConValor) q = q.not(f.columna, "is", null);
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
export async function validarKmContraHistorial(vehicleId: string, fecha: string, km: number): Promise<string | null> {
  try {
    return validarKmEnLinea(km, fecha, await leerLecturasAcotadas(vehicleId, fecha));
  } catch (e) {
    console.error("[kilometraje] no se pudo leer el historial para validar el km:", e instanceof Error ? e.message : e);
    return "No se pudo verificar el kilometraje contra el historial del vehículo. Revisa tu señal e inténtalo de nuevo.";
  }
}

/** Mayor km conocido hasta `fecha` (todas las fuentes), para mostrar «Último» y validar el cierre. */
export async function ultimoKmHastaFecha(vehicleId: string, fecha: string): Promise<number | null> {
  try {
    const lecturas = (await leerLecturasAcotadas(vehicleId, fecha)).filter((l) => l.fecha <= fecha);
    return lecturas.length > 0 ? Math.max(...lecturas.map((l) => l.km)) : null;
  } catch (e) {
    console.error("[kilometraje] no se pudo leer el último km:", e instanceof Error ? e.message : e);
    return null;
  }
}
