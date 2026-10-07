"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { auditar } from "@/lib/auditoria";
import { centroVisible } from "@/lib/auth-utils";
import { tipoImagenPorContenido } from "@/lib/imagen-contenido";
import { getProfile, requireRole } from "./auth";
import { resumirFotos, type ResumenFotosSiniestro } from "@/lib/siniestro-datos";
import {
  BUCKET_SINIESTROS,
  MAX_FOTOS_POR_TIPO,
  TAMANO_MAXIMO_SUBIDA,
  esTipoFoto,
  rutaFotoSiniestro,
  type TipoFotoSiniestro,
} from "@/lib/siniestro-fotos";

// Fotos del siniestro vial (migración 116). Mismo patrón que vehiculo-fotos (111): la acción de servidor valida el
// contenido real del archivo por sus bytes, sube al bucket privado y guarda la RUTA; se sirve con URL firmada.
// La pertenencia (el OVEM solo sube a su propio siniestro) la exige la RLS de road_accident_fotos y de storage.objects.

const ROLES_SUBEN = ["OVEM", "ADMIN", "ANALISTA", "REGULACION"] as const;
const ROLES_LEEN = ["OVEM", "ADMIN", "ANALISTA", "GERENCIAL", "REGULACION", "COORDINACION", "MANTENIMIENTO"] as const;
const SEGUNDOS_URL_FIRMADA = 3600;

export type ResultadoFoto = { error: string; success?: undefined } | { error?: undefined; success: true; ruta: string };

/** Sube y registra UNA foto. El cliente la llama una vez por foto, así un fallo se reintenta sin duplicar el reporte. */
export async function registrarFotoSiniestro(accidentId: number, tipo: string, file: File): Promise<ResultadoFoto> {
  const profile = await requireRole([...ROLES_SUBEN]);
  const id = z.number().int().positive().safeParse(accidentId);
  if (!id.success) return { error: "Siniestro inválido" };
  if (!esTipoFoto(tipo)) return { error: "Tipo de foto inválido" };
  if (!(file instanceof File) || file.size <= 0) return { error: "La foto está vacía" };
  if (file.size > TAMANO_MAXIMO_SUBIDA) return { error: "La foto pesa más de 8 MB" };

  const cabecera = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const firma = tipoImagenPorContenido(cabecera);
  if (!firma) return { error: "Formato no soportado — usa JPG, PNG o WEBP" };

  const supabase = createClient() as any;
  const { count } = await supabase
    .from("road_accident_fotos")
    .select("id", { count: "exact", head: true })
    .eq("accident_id", id.data)
    .eq("tipo", tipo);
  if ((count ?? 0) >= MAX_FOTOS_POR_TIPO) return { error: `Ya hay ${MAX_FOTOS_POR_TIPO} fotos de este tipo` };

  // La ruta siempre termina en .jpg (la compresión del cliente produce JPEG); el tipo real se toma de los bytes.
  const ruta = rutaFotoSiniestro(id.data, tipo as TipoFotoSiniestro, randomUUID());
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_SINIESTROS)
    .upload(ruta, file, { cacheControl: "3600", upsert: false, contentType: firma.mime });
  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase
    .from("road_accident_fotos")
    .insert({ accident_id: id.data, tipo, storage_path: ruta, subido_por: profile.user_id });
  if (error) {
    // El bucket no tiene política de borrado (la evidencia no se borra): el huérfano sin registro se retira con el cliente de servicio.
    try {
      await createAdminClient().storage.from(BUCKET_SINIESTROS).remove([ruta]);
    } catch {
      /* si tampoco se puede, queda un objeto sin registro: inofensivo, nadie lo referencia */
    }
    return { error: error.message };
  }

  await auditar("INSERTAR", "siniestros", id.data, `Foto de ${tipo === "HECHOS" ? "los hechos" : "documentos"} del siniestro`);
  revalidatePath("/novedades");
  return { success: true as const, ruta };
}

export interface FotoSiniestro {
  id: number;
  tipo: TipoFotoSiniestro;
  url: string | null;
  createdAt: string;
}

export interface DetalleSiniestro {
  id: number;
  incidentId: number | null;
  placa: string;
  fechaHora: string;
  lugar: string;
  descripcion: string;
  pacienteABordo: boolean;
  hayLesionados: boolean;
  lesionadosDetalle: string | null;
  hayTerceros: boolean;
  tercero: { placa: string | null; nombre: string | null; cedula: string | null; telefono: string | null; aseguradora: string | null };
  sinTerceroMotivo: string | null;
  abogado: { nombre: string | null; telefono: string | null; cedula: string | null; correo: string | null };
  sinAbogadoMotivo: string | null;
  intervinoAutoridad: boolean;
  numeroIpat: string | null;
  sinDocumentosMotivo: string | null;
  vehiculoOperativo: boolean;
}

interface FilaSiniestro {
  id: number;
  incident_id: number | null;
  fecha_hora: string;
  lugar: string;
  descripcion: string;
  paciente_a_bordo: boolean;
  hay_lesionados: boolean;
  lesionados_detalle: string | null;
  hay_terceros: boolean;
  tercero_placa: string | null;
  tercero_nombre: string | null;
  tercero_cedula: string | null;
  tercero_telefono: string | null;
  tercero_aseguradora: string | null;
  sin_tercero_motivo: string | null;
  abogado_nombre: string | null;
  abogado_telefono: string | null;
  abogado_cedula: string | null;
  abogado_correo: string | null;
  sin_abogado_motivo: string | null;
  intervino_autoridad: boolean;
  numero_ipat: string | null;
  sin_documentos_motivo: string | null;
  vehiculo_operativo: boolean;
  reportado_por: string;
  vehicles: { placa: string; centro_operativo: string | null } | null;
}

/**
 * Detalle de un siniestro con las fotos como URLs firmadas (1 h). Coordinación solo ve los de su centro; el OVEM, el suyo
 * (la RLS ya lo limita). `puedeSubir` indica si quien consulta puede completar fotos pendientes.
 */
export async function getSiniestro(accidentId: number): Promise<
  | { error: string }
  | { siniestro: DetalleSiniestro; fotos: FotoSiniestro[]; resumen: ResumenFotosSiniestro; puedeSubir: boolean }
> {
  const profile = await requireRole([...ROLES_LEEN]);
  const id = z.number().int().positive().safeParse(accidentId);
  if (!id.success) return { error: "Siniestro inválido" };

  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("road_accidents")
    .select("*, vehicles(placa, centro_operativo)")
    .eq("id", id.data)
    .maybeSingle();
  const fila = data as unknown as FilaSiniestro | null;
  if (error || !fila) return { error: "No encontramos ese siniestro o no tienes acceso a él." };

  const centro = centroVisible(await getProfile());
  if (profile.role_codigo === "COORDINACION" && centro && fila.vehicles?.centro_operativo !== centro.codigo) {
    return { error: "No encontramos ese siniestro o no tienes acceso a él." };
  }

  const { data: filasFoto } = await supabase
    .from("road_accident_fotos")
    .select("id, tipo, storage_path, created_at")
    .eq("accident_id", id.data)
    .order("created_at", { ascending: true });
  const lista = ((filasFoto ?? []) as unknown as { id: number; tipo: TipoFotoSiniestro; storage_path: string; created_at: string }[]);

  const fotos: FotoSiniestro[] = await Promise.all(
    lista.map(async (f) => {
      const firmada = await supabase.storage.from(BUCKET_SINIESTROS).createSignedUrl(f.storage_path, SEGUNDOS_URL_FIRMADA);
      return { id: f.id, tipo: f.tipo, url: firmada.data?.signedUrl ?? null, createdAt: f.created_at };
    })
  );

  const hechos = lista.filter((f) => f.tipo === "HECHOS").length;
  const documentos = lista.filter((f) => f.tipo === "DOCUMENTOS").length;
  const rol = profile.role_codigo;
  const puedeSubir = rol === "ADMIN" || rol === "ANALISTA" || rol === "REGULACION" || (rol === "OVEM" && fila.reportado_por === profile.user_id);

  return {
    siniestro: {
      id: fila.id,
      incidentId: fila.incident_id,
      placa: fila.vehicles?.placa ?? "",
      fechaHora: fila.fecha_hora,
      lugar: fila.lugar,
      descripcion: fila.descripcion,
      pacienteABordo: fila.paciente_a_bordo,
      hayLesionados: fila.hay_lesionados,
      lesionadosDetalle: fila.lesionados_detalle,
      hayTerceros: fila.hay_terceros,
      tercero: {
        placa: fila.tercero_placa,
        nombre: fila.tercero_nombre,
        cedula: fila.tercero_cedula,
        telefono: fila.tercero_telefono,
        aseguradora: fila.tercero_aseguradora,
      },
      sinTerceroMotivo: fila.sin_tercero_motivo,
      abogado: {
        nombre: fila.abogado_nombre,
        telefono: fila.abogado_telefono,
        cedula: fila.abogado_cedula,
        correo: fila.abogado_correo,
      },
      sinAbogadoMotivo: fila.sin_abogado_motivo,
      intervinoAutoridad: fila.intervino_autoridad,
      numeroIpat: fila.numero_ipat,
      sinDocumentosMotivo: fila.sin_documentos_motivo,
      vehiculoOperativo: fila.vehiculo_operativo,
    },
    fotos,
    resumen: resumirFotos(hechos, documentos, fila.sin_documentos_motivo),
    puedeSubir,
  };
}

/** Id del siniestro asociado a una novedad (para enlazar desde la tabla de novedades). */
export async function getSiniestroIdPorNovedad(incidentId: number): Promise<number | null> {
  await requireRole([...ROLES_LEEN]);
  const id = z.number().int().positive().safeParse(incidentId);
  if (!id.success) return null;
  const supabase = createClient() as any;
  const { data } = await supabase.from("road_accidents").select("id").eq("incident_id", id.data).maybeSingle();
  return (data as { id: number } | null)?.id ?? null;
}
