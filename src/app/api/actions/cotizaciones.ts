"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { auditar } from "@/lib/auditoria";
import { valorIntegracion } from "@/lib/integraciones-servidor";
import { enviarCorreo } from "@/lib/notifications/email";
import { CotizacionRutaPdf, type CotizacionPdfDatos } from "@/lib/pdf/cotizacion-ruta";
import {
  ROLES_COTIZACION,
  cotizacionSchema,
  formatoCOP,
  totalCotizacion,
  totalesRuta,
  urlMapaEstatico,
  type CotizacionEntrada,
  type TramoRuta,
} from "@/lib/cotizacion-ruta";

// Cotizaciones de ruta (migración 106). La llave de Google Maps sale de Administración → Integraciones (migración 099).

async function autorizado() {
  const profile = await getProfile();
  return profile && (ROLES_COTIZACION as readonly string[]).includes(profile.role_codigo) ? profile : null;
}

/**
 * Llave de Google Maps para el mapa del navegador. Es una llave de navegador (Google la ve en cada petición del
 * mapa): se protege restringiéndola por dominio en Google Cloud, no ocultándola. Solo se entrega a quien cotiza.
 */
export async function getLlaveMapsNavegador(): Promise<string | null> {
  if (!(await autorizado())) return null;
  return valorIntegracion("google_maps_api_key");
}

export interface CotizacionFila extends CotizacionPdfDatos {
  id: number;
  cliente_correo: string | null;
  polilinea: string;
}

const COLUMNAS =
  "id, numero, created_at, cliente_nombre, cliente_correo, origen, intermedio, destino, distancia_m, duracion_s, duracion_trafico_s, valor_km, valor_adicional, total, tramos, notas, polilinea";

export async function listarCotizaciones(): Promise<CotizacionFila[]> {
  if (!(await autorizado())) return [];
  const { data, error } = await createClient().from("cotizaciones_ruta").select(COLUMNAS).order("created_at", { ascending: false }).limit(50);
  if (error) return [];
  return ((data ?? []) as unknown as CotizacionFila[]).map(normalizar);
}

/** Postgres devuelve NUMERIC como texto. */
function normalizar(c: CotizacionFila): CotizacionFila {
  return { ...c, valor_km: Number(c.valor_km), valor_adicional: Number(c.valor_adicional), total: Number(c.total) };
}

/** Guarda la cotización. Distancias y total se recalculan aquí desde los tramos: no se confía en el navegador. */
export async function crearCotizacion(entrada: CotizacionEntrada) {
  const profile = await autorizado();
  if (!profile) return { error: "Sin permisos para cotizar" };
  const parsed = cotizacionSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;
  const t = totalesRuta(d.tramos);
  if (t.distancia_m <= 0) return { error: "La ruta no tiene distancia" };
  const total = totalCotizacion(t.distancia_m, d.valor_km, d.valor_adicional);

  const { data, error } = await createClient()
    .from("cotizaciones_ruta")
    .insert({ ...d, ...t, total, created_by: profile.user_id } as never)
    .select("id, numero")
    .single();
  if (error) return { error: error.message };
  const fila = data as { id: number; numero: string };
  await auditar("INSERTAR", "cotizaciones", fila.id, `Cotización ${fila.numero}: ${formatoCOP(total)}`);
  revalidatePath("/cotizaciones");
  return { success: true as const, id: fila.id, numero: fila.numero };
}

async function obtener(id: number): Promise<CotizacionFila | null> {
  if (!z.number().int().positive().safeParse(id).success) return null;
  const { data } = await createClient().from("cotizaciones_ruta").select(COLUMNAS).eq("id", id).maybeSingle();
  return data ? normalizar(data as unknown as CotizacionFila) : null;
}

async function bytes(url: string): Promise<Buffer | undefined> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (!r.ok || !r.headers.get("content-type")?.startsWith("image/")) return undefined;
    return Buffer.from(await r.arrayBuffer());
  } catch {
    return undefined;
  }
}

/** PDF de la cotización con el mapa estático del trazo (si hay llave de Maps). */
async function renderPdf(c: CotizacionFila): Promise<Buffer> {
  const llave = await valorIntegracion("google_maps_api_key");
  const urlMapa = llave && c.polilinea ? urlMapaEstatico(c.polilinea, llave) : null;
  const [mapa, logo] = await Promise.all([
    urlMapa ? bytes(urlMapa) : Promise.resolve(undefined),
    readFile(path.join(process.cwd(), "public", "brand", "alianza.png")).catch(() => undefined),
  ]);
  const doc = createElement(CotizacionRutaPdf, { c: { ...c, tramos: c.tramos as TramoRuta[] }, mapa, logo }) as unknown as ReactElement<DocumentProps>;
  return renderToBuffer(doc);
}

/** PDF en base64 para descargar o imprimir (mismo patrón que los demás PDF, sin Route Handler). */
export async function generarCotizacionPdf(id: number) {
  if (!(await autorizado())) return { error: "Sin permisos" };
  const c = await obtener(id);
  if (!c) return { error: "Cotización no encontrada" };
  try {
    const pdf = await renderPdf(c);
    return { success: true as const, data: pdf.toString("base64"), filename: `${c.numero}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}

/** Envía la cotización en PDF, adjunta, al correo indicado. */
export async function enviarCotizacionCorreo(id: number, correo: string) {
  if (!(await autorizado())) return { error: "Sin permisos" };
  const destino = z.string().trim().email("Correo inválido").max(200).safeParse(correo);
  if (!destino.success) return { error: destino.error.issues[0]?.message ?? "Correo inválido" };
  const c = await obtener(id);
  if (!c) return { error: "Cotización no encontrada" };
  const pdf = await renderPdf(c);
  const r = await enviarCorreo(
    [destino.data],
    `Cotización ${c.numero} — Aerosanidad S.A.S.`,
    `<div style="font-family:sans-serif;color:#111827">
      <p>Adjuntamos la cotización <strong>${c.numero}</strong> del traslado en ambulancia.</p>
      <p><strong>Total: ${formatoCOP(c.total)}</strong></p>
      <p style="color:#6b7280;font-size:12px">Aerosanidad S.A.S.</p>
    </div>`,
    [{ nombre: `${c.numero}.pdf`, contentType: "application/pdf", base64: pdf.toString("base64") }]
  );
  if (!r.ok) return { error: r.error ?? "No se pudo enviar el correo" };
  await auditar("NOTIFICAR", "cotizaciones", c.id, `Cotización ${c.numero} enviada por correo`);
  return { success: true as const };
}
