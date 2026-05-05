"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/app/api/actions/auth";
import {
  filaCombustibleImportSchema,
  filaMantenimientoImportSchema,
  filaVehiculoImportSchema,
  filaProveedorImportSchema,
} from "@/lib/validations";

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

/** Fila cruda desde Excel (keys = encabezados). */
export type FilaVehiculo = Record<string, unknown>;

export type FilaProveedor = Record<string, unknown>;

export interface ResultadoCarga {
  exitosos: number;
  errores: Array<{ fila: number; error: string; datos: any }>;
  omitidos: Array<{ fila: number; motivo: string }>;
}

function normNombreKey(n: string) {
  return n.replace(/\s+/g, " ").trim().toUpperCase();
}

function normNitKey(n: string | undefined) {
  if (!n) return null;
  const d = n.replace(/\D/g, "");
  return d === "" ? null : d;
}

export async function importarMantenimientos(
  filas: FilaMantenimiento[]
): Promise<ResultadoCarga> {
  await requireRole(["ADMIN"]);
  const supabase = createClient();
  const resultado: ResultadoCarga = { exitosos: 0, errores: [], omitidos: [] };

  const { data: vehicles } = await supabase.from("vehicles").select("id, placa");
  const { data: categorias } = await supabase
    .from("maintenance_categories")
    .select("id, nombre");

  const vehicleMap = new Map((vehicles || []).map((v) => [v.placa.toUpperCase(), v.id]));
  const categoriaMap = new Map((categorias || []).map((c) => [c.nombre.toUpperCase(), c.id]));

  const loteSize = 50;
  for (let i = 0; i < filas.length; i += loteSize) {
    const lote = filas.slice(i, i + loteSize);
    const registros: any[] = [];
    const erroresLote: ResultadoCarga["errores"] = [];

    for (let j = 0; j < lote.length; j++) {
      const fila = lote[j];
      const filaNum = i + j + 2;

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

    if (registros.length > 0) {
      const { error } = await supabase.from("maintenance_records").insert(registros);
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

export async function importarCombustible(filas: FilaCombustible[]): Promise<ResultadoCarga> {
  await requireRole(["ADMIN"]);
  const supabase = createClient();
  const resultado: ResultadoCarga = { exitosos: 0, errores: [], omitidos: [] };

  const { data: vehicles } = await supabase.from("vehicles").select("id, placa");
  const vehicleMap = new Map((vehicles || []).map((v) => [v.placa.toUpperCase(), v.id]));

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

  revalidatePath("/consumo");
  return resultado;
}

export async function importarVehiculos(filas: FilaVehiculo[]): Promise<ResultadoCarga> {
  await requireRole(["ADMIN"]);
  const supabase = createClient();
  const resultado: ResultadoCarga = { exitosos: 0, errores: [], omitidos: [] };

  const { data: centros } = await supabase.from("operational_centers").select("id, codigo, nombre");
  const codigoMap = new Map(
    (centros || []).map((c) => [String(c.codigo).trim().toUpperCase(), c])
  );
  const nombreMap = new Map(
    (centros || []).map((c) => [normNombreKey(c.nombre), c])
  );

  const { data: existingVehicles } = await supabase.from("vehicles").select("placa");
  const placasDb = new Set((existingVehicles || []).map((v) => v.placa.toUpperCase()));

  const seenPlacaInFile = new Set<string>();
  const loteSize = 50;

  for (let i = 0; i < filas.length; i += loteSize) {
    const lote = filas.slice(i, i + loteSize);
    const registros: any[] = [];
    const erroresLote: ResultadoCarga["errores"] = [];

    for (let j = 0; j < lote.length; j++) {
      const raw = lote[j];
      const filaNum = i + j + 2;

      try {
        const rowParsed = filaVehiculoImportSchema.safeParse({
          placa: raw.placa,
          marca: raw.marca,
          modelo: raw.modelo,
          linea: raw.linea,
          centro_codigo: raw.centro_codigo ?? raw.centro_código,
          tipo_combustible: raw.tipo_combustible,
          tipo_llantas: raw.tipo_llantas,
          tipo_bombillos: raw.tipo_bombillos,
          tipo_refrigerante: raw.tipo_refrigerante,
          aceite_usado: raw.aceite_usado,
          ref_filtro_aire_motor: raw.ref_filtro_aire_motor,
          ref_filtro_aceite: raw.ref_filtro_aceite,
          ref_filtro_combustible: raw.ref_filtro_combustible,
          notas: raw.notas,
          vencimiento_soat: raw.vencimiento_soat,
          vencimiento_tecnicomecanica: raw.vencimiento_tecnicomecanica,
        });

        if (!rowParsed.success) {
          erroresLote.push({
            fila: filaNum,
            error: rowParsed.error.issues[0]?.message ?? "Fila inválida",
            datos: raw,
          });
          continue;
        }

        const r = rowParsed.data;
        if (placasDb.has(r.placa)) {
          resultado.omitidos.push({ fila: filaNum, motivo: "Placa ya existe en la base de datos" });
          continue;
        }
        if (seenPlacaInFile.has(r.placa)) {
          resultado.omitidos.push({ fila: filaNum, motivo: "Placa duplicada en el archivo" });
          continue;
        }
        seenPlacaInFile.add(r.placa);

        let centro = codigoMap.get(r.centro_codigo);
        if (!centro) centro = nombreMap.get(normNombreKey(r.centro_codigo)) ?? undefined;
        if (!centro) {
          erroresLote.push({
            fila: filaNum,
            error: `Centro "${r.centro_codigo}" no encontrado (use codigo o nombre exacto)`,
            datos: raw,
          });
          continue;
        }

        const tipoComb = r.tipo_combustible ?? null;
        registros.push({
          placa: r.placa,
          marca: r.marca ?? null,
          modelo: r.modelo ?? null,
          linea: r.linea ?? null,
          tipo_combustible: tipoComb,
          combustible: tipoComb,
          tipo_llantas: r.tipo_llantas ?? null,
          tipo_bombillos: r.tipo_bombillos ?? null,
          tipo_refrigerante: r.tipo_refrigerante ?? null,
          aceite_usado: r.aceite_usado ?? null,
          ref_filtro_aire_motor: r.ref_filtro_aire_motor ?? null,
          ref_filtro_aceite: r.ref_filtro_aceite ?? null,
          ref_filtro_combustible: r.ref_filtro_combustible ?? null,
          notas: r.notas ?? null,
          vencimiento_soat: r.vencimiento_soat ?? null,
          vencimiento_tecnicomecanica: r.vencimiento_tecnicomecanica ?? null,
          centro_operativo: centro.codigo,
          centro_operativo_id: centro.id,
          estado_actual: "OPERATIVO",
        });
      } catch {
        erroresLote.push({ fila: filaNum, error: "Error procesando fila", datos: raw });
      }
    }

    if (registros.length > 0) {
      const { error } = await supabase.from("vehicles").insert(registros);
      if (error) {
        erroresLote.push({
          fila: -1,
          error: `Error en base de datos: ${error.message}`,
          datos: {},
        });
      } else {
        resultado.exitosos += registros.length;
        for (const row of registros) {
          placasDb.add(String(row.placa).toUpperCase());
        }
      }
    }

    resultado.errores.push(...erroresLote);
  }

  revalidatePath("/configuracion");
  revalidatePath("/vehiculos");
  return resultado;
}

export async function importarProveedores(filas: FilaProveedor[]): Promise<ResultadoCarga> {
  await requireRole(["ADMIN"]);
  const supabase = createClient();
  const resultado: ResultadoCarga = { exitosos: 0, errores: [], omitidos: [] };

  const { data: suppliers } = await supabase.from("suppliers").select("id, nombre, nit");

  const byNit = new Map<string, boolean>();
  const byNombre = new Map<string, boolean>();
  for (const s of suppliers || []) {
    const nk = normNitKey(s.nit ?? undefined);
    if (nk) byNit.set(nk, true);
    byNombre.set(normNombreKey(s.nombre), true);
  }

  const nitSeenFile = new Set<string>();
  const nombreSeenFile = new Set<string>();
  const loteSize = 50;

  for (let i = 0; i < filas.length; i += loteSize) {
    const lote = filas.slice(i, i + loteSize);
    const registros: any[] = [];
    const erroresLote: ResultadoCarga["errores"] = [];

    for (let j = 0; j < lote.length; j++) {
      const raw = lote[j];
      const filaNum = i + j + 2;

      try {
        const rowParsed = filaProveedorImportSchema.safeParse({
          nombre: raw.nombre,
          nit: raw.nit,
          contacto: raw.contacto,
        });

        if (!rowParsed.success) {
          erroresLote.push({
            fila: filaNum,
            error: rowParsed.error.issues[0]?.message ?? "Fila inválida",
            datos: raw,
          });
          continue;
        }

        const r = rowParsed.data;
        const nk = normNitKey(r.nit);
        const nkNombre = normNombreKey(r.nombre);

        if (nk) {
          if (byNit.has(nk)) {
            resultado.omitidos.push({ fila: filaNum, motivo: "Proveedor con mismo NIT ya existe" });
            continue;
          }
          if (nitSeenFile.has(nk)) {
            resultado.omitidos.push({ fila: filaNum, motivo: "NIT duplicado en el archivo" });
            continue;
          }
          nitSeenFile.add(nk);
        } else {
          if (byNombre.has(nkNombre)) {
            resultado.omitidos.push({
              fila: filaNum,
              motivo: "Proveedor con mismo nombre ya existe",
            });
            continue;
          }
          if (nombreSeenFile.has(nkNombre)) {
            resultado.omitidos.push({
              fila: filaNum,
              motivo: "Nombre duplicado en el archivo",
            });
            continue;
          }
          nombreSeenFile.add(nkNombre);
        }

        registros.push({
          nombre: r.nombre,
          nit: r.nit ?? null,
          contacto: r.contacto ?? null,
          activo: true,
        });
      } catch {
        erroresLote.push({ fila: filaNum, error: "Error procesando fila", datos: raw });
      }
    }

    if (registros.length > 0) {
      const { error } = await supabase.from("suppliers").insert(registros);
      if (error) {
        erroresLote.push({
          fila: -1,
          error: `Error en base de datos: ${error.message}`,
          datos: {},
        });
      } else {
        resultado.exitosos += registros.length;
        for (const row of registros) {
          const nk = normNitKey(row.nit ?? undefined);
          if (nk) byNit.set(nk, true);
          byNombre.set(normNombreKey(row.nombre), true);
        }
      }
    }

    resultado.errores.push(...erroresLote);
  }

  revalidatePath("/configuracion");
  return resultado;
}
