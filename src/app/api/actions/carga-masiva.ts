"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { filaCombustibleImportSchema, filaMantenimientoImportSchema } from "@/lib/validations";

export interface FilaMantenimiento {
  placa: string;
  fecha: string;
  kilometraje: number | string;
  tipo: string;
  categoria: string;
  descripcion: string;
  proveedor: string;
  valor: number | string;
  numero_factura?: string;
  tiempo_fuera_servicio?: number | string;
}

export interface FilaCombustible {
  placa: string;
  fecha: string;
  kilometraje: number | string;
  galones: number | string;
  costo?: number | string;
  notas?: string;
}

export interface ResultadoCarga {
  exitosos: number;
  errores: Array<{ fila: number; error: string; datos: any }>;
}

export async function importarMantenimientos(
  filas: FilaMantenimiento[]
): Promise<ResultadoCarga> {
  const supabase = createClient();
  const resultado: ResultadoCarga = { exitosos: 0, errores: [] };

  // Cargar catálogo de vehículos y categorías una sola vez
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, placa");
  const { data: categorias } = await supabase
    .from("maintenance_categories")
    .select("id, nombre");

  const vehicleMap = new Map(
    (vehicles || []).map((v) => [v.placa.toUpperCase(), v.id])
  );
  const categoriaMap = new Map(
    (categorias || []).map((c) => [c.nombre.toUpperCase(), c.id])
  );

  // Procesar en lotes de 50
  const loteSize = 50;
  for (let i = 0; i < filas.length; i += loteSize) {
    const lote = filas.slice(i, i + loteSize);
    const registros: any[] = [];
    const erroresLote: ResultadoCarga["errores"] = [];

    for (let j = 0; j < lote.length; j++) {
      const fila = lote[j];
      const filaNum = i + j + 2; // +2 porque la fila 1 es encabezado

      try {
        const rowParsed = filaMantenimientoImportSchema.safeParse({
          placa: fila.placa,
          fecha: fila.fecha,
          kilometraje: fila.kilometraje,
          tipo: fila.tipo,
          categoria: fila.categoria,
          descripcion: fila.descripcion,
          proveedor: fila.proveedor,
          valor: fila.valor,
          numero_factura: fila.numero_factura,
          tiempo_fuera_servicio: fila.tiempo_fuera_servicio,
        });
        if (!rowParsed.success) {
          erroresLote.push({
            fila: filaNum,
            error: rowParsed.error.issues[0]?.message ?? "Fila inválida",
            datos: fila,
          });
          continue;
        }

        const r = rowParsed.data;
        const placa = String(r.placa ?? "").trim().toUpperCase();
        const vehicleId = vehicleMap.get(placa);
        if (!vehicleId) {
          erroresLote.push({
            fila: filaNum,
            error: `Vehículo con placa "${placa}" no encontrado`,
            datos: fila,
          });
          continue;
        }

        const fechaStr = String(r.fecha ?? "").trim();
        const categoriaNombre = String(r.categoria ?? "").trim().toUpperCase();
        const categoriaId = categoriaMap.get(categoriaNombre) || null;

        const tfds = r.tiempo_fuera_servicio ?? 0;

        registros.push({
          vehicle_id: vehicleId,
          fecha: fechaStr,
          kilometraje_actual: r.kilometraje,
          tipo: r.tipo,
          categoria_id: categoriaId,
          descripcion_trabajo: String(r.descripcion ?? "").trim() || null,
          proveedor: String(r.proveedor ?? "").trim() || null,
          valor: r.valor,
          numero_factura: r.numero_factura ? String(r.numero_factura).trim() : null,
          tiempo_fuera_servicio_horas: tfds,
        });
      } catch {
        erroresLote.push({
          fila: filaNum,
          error: "Error procesando fila",
          datos: fila,
        });
      }
    }

    // Insertar lote
    if (registros.length > 0) {
      const { error } = await supabase
        .from("maintenance_records")
        .insert(registros);
      if (error) {
        erroresLote.push({
          fila: -1,
          error: `Error en base de datos: ${error.message}`,
          datos: {},
        });
      } else {
        resultado.exitosos += registros.length;
      }
    }

    resultado.errores.push(...erroresLote);
  }

  revalidatePath("/mantenimientos");
  return resultado;
}

export async function importarCombustible(
  filas: FilaCombustible[]
): Promise<ResultadoCarga> {
  const supabase = createClient();
  const resultado: ResultadoCarga = { exitosos: 0, errores: [] };

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, placa");
  const vehicleMap = new Map(
    (vehicles || []).map((v) => [v.placa.toUpperCase(), v.id])
  );

  const loteSize = 50;
  for (let i = 0; i < filas.length; i += loteSize) {
    const lote = filas.slice(i, i + loteSize);
    const registros: any[] = [];
    const erroresLote: ResultadoCarga["errores"] = [];

    for (let j = 0; j < lote.length; j++) {
      const fila = lote[j];
      const filaNum = i + j + 2;

      try {
        const rowParsed = filaCombustibleImportSchema.safeParse(fila);
        if (!rowParsed.success) {
          erroresLote.push({
            fila: filaNum,
            error: rowParsed.error.issues[0]?.message ?? "Fila inválida",
            datos: fila,
          });
          continue;
        }

        const r = rowParsed.data;
        const placa = String(r.placa ?? "").trim().toUpperCase();
        const vehicleId = vehicleMap.get(placa);
        if (!vehicleId) {
          erroresLote.push({
            fila: filaNum,
            error: `Vehículo con placa "${placa}" no encontrado`,
            datos: fila,
          });
          continue;
        }

        const fechaStr = String(r.fecha ?? "").trim();
        registros.push({
          vehicle_id: vehicleId,
          fecha: fechaStr,
          kilometraje: r.kilometraje,
          galones: r.galones,
          costo:
            r.costo !== undefined && !Number.isNaN(r.costo)
              ? r.costo
              : null,
          notas: r.notas ? String(r.notas).trim() : null,
        });
      } catch {
        erroresLote.push({ fila: filaNum, error: "Error procesando fila", datos: fila });
      }
    }

    if (registros.length > 0) {
      const { error } = await supabase.from("fuel_logs").insert(registros);
      if (error) {
        erroresLote.push({ fila: -1, error: `Error BD: ${error.message}`, datos: {} });
      } else {
        resultado.exitosos += registros.length;
      }
    }

    resultado.errores.push(...erroresLote);
  }

  return resultado;
}
