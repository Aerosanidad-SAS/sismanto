"use server";

import { createClient } from "@/lib/supabase/server";
import { aTimestamptzColombia } from "@/lib/hora-colombia";
import { revalidatePath } from "next/cache";
import type { AssessmentFormData } from "@/lib/validations";
import { assessmentSchema } from "@/lib/validations";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import {
  ROLES_ELIMINAR_VALORACION,
  COLUMNAS_BUSQUEDA_VALORACIONES,
  VALORACIONES_POR_PAGINA,
  palabrasBusquedaValoraciones,
} from "@/lib/valoraciones-lista";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CertificadoValoracionPdf, type CertificadoValoracionDatos } from "@/lib/pdf/certificado-valoracion";
import { z } from "zod";
import { emailConfigurado, enviarCorreo } from "@/lib/notifications/email";
import {
  ROLES_ENVIAR_CERTIFICADO,
  armarCorreoCertificado,
  asuntoCertificado,
  nombreAdjuntoCertificado,
  CORREO_VALIDO,
} from "@/lib/certificado-correo";

/**
 * Una página de valoraciones (25) con búsqueda en el servidor, como
 * mostrarValoraciones.php de SISRES. Antes se traían las 500 más recientes y
 * la búsqueda y las tarjetas solo veían esas. Cada palabra debe aparecer en
 * alguna de las columnas de búsqueda (varios `.or()` encadenados = AND).
 */
export async function buscarValoraciones(q: string, pagina: number) {
  const supabase = createClient();
  const desde = (Math.max(1, pagina) - 1) * VALORACIONES_POR_PAGINA;
  let query = supabase
    .from("medical_assessments")
    .select("*", { count: "exact" })
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + VALORACIONES_POR_PAGINA - 1);
  for (const palabra of palabrasBusquedaValoraciones(q)) {
    query = query.or(COLUMNAS_BUSQUEDA_VALORACIONES.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  const { data, count, error } = await query;
  if (error) return { valoraciones: [], total: 0, error: error.message as string };
  return { valoraciones: data ?? [], total: count ?? 0 };
}

/** Totales de las tarjetas: sobre TODAS las valoraciones, no sobre la página ni la búsqueda. */
export async function getResumenValoraciones() {
  const supabase = createClient();
  const todas = () =>
    supabase.from("medical_assessments").select("id", { count: "exact", head: true }).eq("activo", true);
  // ilike sin comodines = igualdad sin distinguir mayúsculas: "APTO" no incluye a "NO APTO".
  const [total, aptos, noAptos] = await Promise.all([
    todas(),
    todas().ilike("valoracion", "APTO"),
    todas().ilike("valoracion", "NO APTO"),
  ]);
  return { total: total.count ?? 0, aptos: aptos.count ?? 0, noAptos: noAptos.count ?? 0 };
}

export async function crearValoracion(formData: AssessmentFormData) {
  const parsed = assessmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const profile = await getProfile();

  // Si el paciente existe en el maestro, se enlaza (SISRES solo guardaba la cédula)
  const { data: paciente } = await supabase
    .from("patients")
    .select("id")
    .eq("cedula", parsed.data.cedula)
    .maybeSingle();

  const { data, error } = await supabase
    .from("medical_assessments")
    .insert({
      ...parsed.data,
      patient_id: paciente?.id ?? null,
      fecha_nacimiento: parsed.data.fecha_nacimiento || null,
      fecha_hora_vuelo: aTimestamptzColombia(parsed.data.fecha_hora_vuelo),
      // Igual que los campos ocultos de registroValoracion.php: el médico es quien registra
      // (no se puede firmar a nombre de otro) y el pasajero es el paciente.
      medico: profile?.nombre_completo ?? profile?.email ?? null,
      pasajero: parsed.data.nombre_completo,
      created_by: userData.user?.id ?? null,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  // Solo el número: el detalle de la bitácora no lleva datos clínicos ni personales del pasajero.
  await auditar("INSERTAR", "valoraciones", (data as { id: number }).id, "Valoración creada");
  revalidatePath("/valoraciones");
  return { success: true, data };
}

export async function actualizarValoracion(id: number, formData: AssessmentFormData) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const parsed = assessmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const supabase = createClient();
  const { error } = await supabase
    .from("medical_assessments")
    .update({
      ...parsed.data,
      fecha_nacimiento: parsed.data.fecha_nacimiento || null,
      fecha_hora_vuelo: aTimestamptzColombia(parsed.data.fecha_hora_vuelo),
      // El médico que valoró no cambia al editar; el pasajero sigue al nombre del paciente.
      pasajero: parsed.data.nombre_completo,
      // El correo es un dato personal: si se vacía en el formulario, se borra (el resto de campos opcionales no se limpian).
      correo: parsed.data.correo ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("MODIFICAR", "valoraciones", idParsed.data, "Valoración actualizada");
  revalidatePath("/valoraciones");
  return { success: true };
}

/**
 * Eliminar = desactivar (borrado suave), como delete.php de SISRES (accion 'soft'): la valoración deja de
 * listarse y de contarse pero sigue en la base. En SISRES el permiso act_eliminar_valoracion viene
 * activo solo para los dos primeros roles; acá equivale a ADMIN y ANALISTA (paridad de ANALISTA con ADMIN, migración 046).
 */
export async function eliminarValoracion(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const profile = await getProfile();
  if (!ROLES_ELIMINAR_VALORACION.includes(profile?.role_codigo ?? "")) {
    return { error: "No tienes permiso para eliminar valoraciones" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("medical_assessments")
    .update({ activo: false, updated_at: new Date().toISOString() })
    .eq("id", idParsed.data);
  if (error) return { error: error.message };
  await auditar("ELIMINAR", "valoraciones", idParsed.data, "Valoración desactivada");
  revalidatePath("/valoraciones");
  return { success: true };
}

/**
 * Certificado PDF de una valoración (equivalente a DescargarValoracion_PDF.php de SISRES).
 * Devuelve el PDF en base64, mismo patrón que `generarHojaVidaPdf` (sin Route Handler).
 * La lectura pasa por RLS: solo quien puede ver la valoración puede descargarla.
 */
export async function generarCertificadoValoracionPdf(id: number) {
  const armado = await armarCertificadoPdf(id);
  if ("error" in armado) return { error: armado.error };
  return { success: true, data: armado.buffer.toString("base64"), filename: nombreAdjuntoCertificado((armado.valoracion as unknown as CertificadoValoracionDatos).id) };
}

/** Renderiza el certificado (compartido por la descarga y el envío por correo). La lectura pasa por RLS. */
async function armarCertificadoPdf(id: number) {
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: valoracion } = await supabase
    .from("medical_assessments")
    .select("*")
    .eq("id", idParsed.data)
    .maybeSingle();
  if (!valoracion) return { error: "Valoración no encontrada" };

  // El logo es opcional: si el archivo no está en el despliegue, el certificado sale igual, sin logo.
  let logo: Buffer | undefined;
  try {
    logo = await readFile(path.join(process.cwd(), "public", "brand", "alianza.png"));
  } catch {
    logo = undefined;
  }

  try {
    const buffer = await renderToBuffer(
      createElement(CertificadoValoracionPdf, {
        valoracion: valoracion as CertificadoValoracionDatos,
        logo,
      })
    );
    return { valoracion, buffer };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}

/**
 * Envía el certificado en PDF al correo del pasajero (tcpdf/EnviarValoracionCorreo.php de SISRES). Es un documento
 * clínico, así que: solo roles que pueden editar valoraciones, solo valoraciones activas y solo al correo guardado
 * en la valoración (el cliente nunca elige el destino). Si el correo no está configurado en este entorno se dice,
 * en vez de fingir un envío. Se registra a qué dirección y cuándo se envió.
 */
export async function enviarCertificadoValoracion(id: number) {
  const profile = await getProfile();
  if (!ROLES_ENVIAR_CERTIFICADO.includes(profile?.role_codigo ?? "")) return { error: "No tienes permiso para enviar certificados" };

  const armado = await armarCertificadoPdf(id);
  if ("error" in armado) return { error: armado.error };
  // El tipo generado de la tabla resuelve a `never` en las lecturas (ver database.types.ts): se tipa lo que se usa.
  const v = armado.valoracion as unknown as CertificadoValoracionDatos & { activo: boolean; correo: string | null };
  if (v.activo === false) return { error: "La valoración está eliminada: no se puede enviar" };
  const destino = (v.correo ?? "").trim();
  if (!CORREO_VALIDO.test(destino)) return { error: "La valoración no tiene un correo válido del pasajero. Edítala y agrégalo." };
  if (!emailConfigurado()) return { error: "El envío de correo no está configurado en este entorno (faltan las variables de Microsoft Graph)." };

  const res = await enviarCorreo([destino], asuntoCertificado(v.id), armarCorreoCertificado({ nombre: v.nombre_completo, numero: v.id }), [
    { nombre: nombreAdjuntoCertificado(v.id), contentType: "application/pdf", base64: armado.buffer.toString("base64") },
  ]);
  if (!res.ok) return { error: res.error ?? "No se pudo enviar el correo" };

  const supabase = createClient();
  await supabase
    .from("medical_assessments")
    .update({ certificado_enviado_at: new Date().toISOString(), certificado_enviado_a: destino })
    .eq("id", v.id);
  // Sin la dirección de correo (dato personal): queda registrada en la propia valoración (certificado_enviado_a).
  await auditar("NOTIFICAR", "valoraciones", v.id, "Certificado enviado por correo al pasajero");
  revalidatePath("/valoraciones");
  return { success: true, destino };
}
