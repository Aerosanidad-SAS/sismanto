"use server";

import { createClient } from "@/lib/supabase/server";
import { auditar } from "@/lib/auditoria";
import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { z } from "zod";
import { getProfile } from "@/app/api/actions/auth";
import {
  FORMATOS_POR_PAGINA,
  hoyColombia,
  palabrasBusqueda,
  type EstadoFirma,
} from "@/lib/formatos-ti/comun";
import { anclaFecha } from "@/lib/formatos-ti/firma";
import * as motor from "@/lib/formatos-ti/firmas-registro";
import {
  actaEntregaSchema,
  camposClaveDevolucion,
  camposClaveEntrega,
  LADOS_ACTA_ENTREGA,
  type ActaEntregaEntrada,
  type ActaEntregaFila,
  type LadoActaEntrega,
} from "@/lib/formatos-ti/acta-entrega";
import { errorSiNoEsTi, urlBaseSitio } from "@/lib/formatos-ti/servidor";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarCorreo } from "@/lib/notifications/email";
import { enviarEnlaceFirmaActa } from "@/lib/formatos-ti/enviar-firma";
import { invalidarTokensPendientes, registrosConTokenPendiente } from "@/lib/formatos-ti/tokens-firma";
import { borrarFirmas, urlFirmada } from "@/lib/formatos-ti/storage-firmas";
import { ActaEntregaPdf } from "@/lib/pdf/acta-entrega";
import type { FirmaPdf } from "@/lib/formatos-ti/comun";

export interface FiltrosActaEntrega {
  q: string;
  tipo: string;
  sede: string;
  pagina: number;
}

/** Firmas que llegan del formulario, por lado (data URI PNG de la firma dibujada; ausente = no se firmó/cambió). */
export type FirmasActaEntrega = Partial<Record<LadoActaEntrega, string | null>>;

/** Cómo firma quien RECIBE al registrar el acta: dibujando aquí mismo, o desde un enlace enviado a su correo. */
export type ModoFirmaRecibe = "AQUI" | "CORREO";

export type ActaEntregaLista = ActaEntregaFila & {
  estadoFirmas: Record<LadoActaEntrega, EstadoFirma>;
  /** Hay un enlace de firma por correo vivo y todavía sin usar. */
  firmaRemotaPendiente: boolean;
};

const COLUMNAS_BUSQUEDA = ["func_nombre", "func_cedula", "equipo_placa", "equipo_referencia", "numero_orden"] as const;
const EXPORT_MAX = 5000;

/** Campos clave de cada juego de firmas del acta: los de entrega/recibe y los de devolución. */
const clavesActa = (f: ActaEntregaFila) => ({ entrega: camposClaveEntrega(f), devolucion: camposClaveDevolucion(f) });

/** Estado de integridad de cada firma con lo guardado (sin descargar los PNG). */
function estadoFirmas(fila: ActaEntregaFila): Record<LadoActaEntrega, EstadoFirma> {
  return motor.estadoFirmas(fila, LADOS_ACTA_ENTREGA, clavesActa(fila)) as Record<LadoActaEntrega, EstadoFirma>;
}

function aplicarFiltros<T extends { or: (f: string) => T; eq: (c: string, v: string) => T; ilike: (c: string, v: string) => T }>(
  query: T,
  f: FiltrosActaEntrega
): T {
  let q = query;
  if (f.tipo) q = q.eq("tipo_equipo", f.tipo);
  if (f.sede) q = q.eq("func_sede", f.sede);
  for (const palabra of palabrasBusqueda(f.q)) {
    q = q.or(COLUMNAS_BUSQUEDA.map((c) => `${c}.ilike.%${palabra}%`).join(","));
  }
  return q;
}

/** Una página del listado (25) con búsqueda en el servidor y los filtros de mostrarActaEntrega.php: tipo y sede. */
export async function listarActasEntrega(filtros: FiltrosActaEntrega) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { actas: [] as ActaEntregaLista[], total: 0, sedes: [] as string[], error: sinPermiso };

  const supabase = createClient();
  const desde = (Math.max(1, filtros.pagina) - 1) * FORMATOS_POR_PAGINA;
  const consulta = supabase
    .from("ti_acta_entrega")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(desde, desde + FORMATOS_POR_PAGINA - 1);
  const [{ data, count, error }, sedesRes] = await Promise.all([
    aplicarFiltros(consulta, filtros),
    supabase.from("ti_acta_entrega").select("func_sede").neq("func_sede", "").limit(2000),
  ]);
  if (error) return { actas: [] as ActaEntregaLista[], total: 0, sedes: [] as string[], error: error.message as string };

  const filas = (data ?? []) as unknown as ActaEntregaFila[];
  const sedes = Array.from(new Set(((sedesRes.data ?? []) as { func_sede: string }[]).map((s) => s.func_sede))).sort();
  // Solo las actas sin firma de "recibe" pueden tener un enlace pendiente.
  const pendientes = await registrosConTokenPendiente(supabase, "ti_acta_entrega", "recibe", filas.filter((f) => !f.firma_recibe_ruta).map((f) => f.id));
  return {
    actas: filas.map((f) => ({ ...f, estadoFirmas: estadoFirmas(f), firmaRemotaPendiente: pendientes.has(f.id) })),
    total: count ?? 0,
    sedes,
  };
}

export async function crearActaEntrega(entrada: ActaEntregaEntrada, firmas: FirmasActaEntrega, modoFirmaRecibe: ModoFirmaRecibe = "AQUI") {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const parsed = actaEntregaSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;
  const porCorreo = modoFirmaRecibe === "CORREO";
  // Para firmar por correo hace falta a dónde mandarlo: se avisa ANTES de crear, no después.
  if (porCorreo && d.func_correo === "") return { error: "Escribe el correo del funcionario para poder enviarle el enlace de firma." };
  // Si quien recibe firma por correo, cualquier firma de "recibe" dibujada aquí se ignora.
  const firmasAqui: FirmasActaEntrega = porCorreo ? { ...firmas, recibe: null } : firmas;

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  // La fecha de entrega es la de hoy en Colombia y no se acepta del formulario; la fecha de creación ancla el hash.
  const fechaEntrega = hoyColombia();
  const creadoEn = anclaFecha(new Date());

  const { data: creada, error } = await supabase
    .from("ti_acta_entrega")
    .insert({
      tipo_equipo: d.tipo_equipo,
      func_nombre: d.func_nombre, func_cedula: d.func_cedula, func_cargo: d.func_cargo, func_sede: d.func_sede, func_correo: d.func_correo,
      equipo_referencia: d.equipo_referencia, equipo_marca: d.equipo_marca, equipo_modelo: d.equipo_modelo, equipo_placa: d.equipo_placa,
      equipo_imei: d.equipo_imei, equipo_sim: d.equipo_sim, equipo_activo: d.equipo_activo,
      equipo_tarjeta_sd: d.equipo_tarjeta_sd, equipo_operador: d.equipo_operador,
      checklist: d.checklist,
      fecha_entrega: fechaEntrega, lugar_entrega: d.lugar_entrega, entrega_nombre: d.entrega_nombre, recibe_nombre: d.recibe_nombre,
      fecha_devolucion: d.fecha_devolucion, lugar_devolucion: d.lugar_devolucion,
      devolucion_entrega_nombre: d.devolucion_entrega_nombre, devolucion_recibe_nombre: d.devolucion_recibe_nombre,
      observaciones: d.observaciones,
      created_by: userData.user?.id ?? null,
      created_at: creadoEn,
    })
    .select("*")
    .single();
  if (error || !creada) return { error: error?.message ?? "No se pudo crear el acta" };
  const fila = { ...(creada as unknown as ActaEntregaFila), created_at: creadoEn };
  // Primero el alta y después (si aplica) el envío del enlace: así la bitácora queda en el orden en que ocurrió.
  await auditar("INSERTAR", "formatos_ti", fila.id, `Acta de entrega ${fila.numero_orden} creada`);

  const { cambios, png, avisos } = await motor.resolverFirmas(supabase, "acta-entrega", fila.id, fila, firmasAqui, LADOS_ACTA_ENTREGA, clavesActa(fila), (l) => l.clave === "devolucion" && d.tipo_equipo !== "CELULAR");
  if (Object.keys(cambios).length > 0) {
    const { error: e2 } = await supabase.from("ti_acta_entrega").update({ ...cambios, firmas_png: png }).eq("id", fila.id);
    if (e2) avisos.push(`El acta se creó pero no se pudieron enlazar las firmas: ${e2.message}`);
  }
  if (porCorreo) {
    const envio = await enviarEnlaceFirmaActa(createAdminClient(), enviarCorreo, urlBaseSitio(), {
      registroId: fila.id,
      numeroOrden: fila.numero_orden,
      nombre: d.recibe_nombre,
      correo: d.func_correo,
      equipo: [d.equipo_referencia, d.equipo_marca, d.equipo_modelo].filter(Boolean).join(" "),
      placa: d.equipo_placa,
    });
    if (!envio.ok) avisos.push(`El acta se guardó, pero ${envio.error} Puedes reenviarlo desde el listado.`);
    else await auditar("NOTIFICAR", "formatos_ti", fila.id, `Enlace de firma enviado por correo (acta ${fila.numero_orden})`);
  }
  revalidatePath("/formatos-ti/acta-entrega");
  return { success: true, id: fila.id, numero_orden: fila.numero_orden, avisos };
}

/** Edita el acta. La fecha de entrega y la de creación no cambian; las firmas solo se reemplazan si se dibujó una nueva. */
export async function actualizarActaEntrega(id: number, entrada: ActaEntregaEntrada, firmas: FirmasActaEntrega) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };
  const parsed = actaEntregaSchema.safeParse(entrada);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_acta_entrega").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Acta no encontrada" };
  const previa = actual as unknown as ActaEntregaFila;

  const nueva = {
    ...previa,
    tipo_equipo: d.tipo_equipo,
    func_nombre: d.func_nombre, func_cedula: d.func_cedula, func_cargo: d.func_cargo, func_sede: d.func_sede, func_correo: d.func_correo,
    equipo_referencia: d.equipo_referencia, equipo_marca: d.equipo_marca, equipo_modelo: d.equipo_modelo, equipo_placa: d.equipo_placa,
    lugar_entrega: d.lugar_entrega, entrega_nombre: d.entrega_nombre, recibe_nombre: d.recibe_nombre,
    fecha_devolucion: d.fecha_devolucion, lugar_devolucion: d.lugar_devolucion,
    devolucion_entrega_nombre: d.devolucion_entrega_nombre, devolucion_recibe_nombre: d.devolucion_recibe_nombre,
    created_at: anclaFecha(previa.created_at),
  } as ActaEntregaFila;

  const { cambios, png, viejas, avisos } = await motor.resolverFirmas(supabase, "acta-entrega", previa.id, nueva, firmas, LADOS_ACTA_ENTREGA, clavesActa(nueva), (l) => l.clave === "devolucion" && d.tipo_equipo !== "CELULAR");

  const { error } = await supabase
    .from("ti_acta_entrega")
    .update({
      tipo_equipo: d.tipo_equipo,
      func_nombre: d.func_nombre, func_cedula: d.func_cedula, func_cargo: d.func_cargo, func_sede: d.func_sede, func_correo: d.func_correo,
      equipo_referencia: d.equipo_referencia, equipo_marca: d.equipo_marca, equipo_modelo: d.equipo_modelo, equipo_placa: d.equipo_placa,
      equipo_imei: d.equipo_imei, equipo_sim: d.equipo_sim, equipo_activo: d.equipo_activo,
      equipo_tarjeta_sd: d.equipo_tarjeta_sd, equipo_operador: d.equipo_operador,
      checklist: d.checklist,
      lugar_entrega: d.lugar_entrega, entrega_nombre: d.entrega_nombre, recibe_nombre: d.recibe_nombre,
      fecha_devolucion: d.fecha_devolucion, lugar_devolucion: d.lugar_devolucion,
      devolucion_entrega_nombre: d.devolucion_entrega_nombre, devolucion_recibe_nombre: d.devolucion_recibe_nombre,
      observaciones: d.observaciones,
      ...cambios,
      firmas_png: png,
      updated_at: new Date().toISOString(),
    })
    .eq("id", previa.id);
  if (error) return { error: error.message };

  await borrarFirmas(supabase, viejas); // limpieza de las firmas reemplazadas
  // Se dibujó la firma de "recibe" en esta edición: un enlace de correo pendiente no debe poder pisarla después.
  if (cambios.firma_recibe_ruta) await invalidarTokensPendientes(createAdminClient(), "ti_acta_entrega", previa.id, "recibe");
  await auditar("MODIFICAR", "formatos_ti", previa.id, `Acta de entrega ${previa.numero_orden} actualizada`);
  revalidatePath("/formatos-ti/acta-entrega");
  return { success: true, avisos };
}

/**
 * Reenvía el enlace de firma por correo (listado, acta con "Pendiente de firma por correo"). Crea un enlace nuevo
 * e invalida el anterior. Solo si quien recibe todavía no firmó y el acta tiene correo.
 */
export async function reenviarEnlaceFirmaActa(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data } = await supabase.from("ti_acta_entrega").select("*").eq("id", idParsed.data).maybeSingle();
  if (!data) return { error: "Acta no encontrada" };
  const acta = data as unknown as ActaEntregaFila;
  if (acta.firma_recibe_ruta) return { error: "Esta acta ya está firmada por quien recibe." };

  const envio = await enviarEnlaceFirmaActa(createAdminClient(), enviarCorreo, urlBaseSitio(), {
    registroId: acta.id,
    numeroOrden: acta.numero_orden,
    nombre: acta.recibe_nombre,
    correo: acta.func_correo,
    equipo: [acta.equipo_referencia, acta.equipo_marca, acta.equipo_modelo].filter(Boolean).join(" "),
    placa: acta.equipo_placa,
  });
  if (!envio.ok) return { error: envio.error };
  await auditar("NOTIFICAR", "formatos_ti", acta.id, `Enlace de firma reenviado por correo (acta ${acta.numero_orden})`);
  revalidatePath("/formatos-ti/acta-entrega");
  return { success: true };
}

/** Eliminación física (igual que delete.php de SISRES para estos formatos) y limpieza de sus firmas. */
export async function eliminarActaEntrega(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data: actual } = await supabase.from("ti_acta_entrega").select("*").eq("id", idParsed.data).maybeSingle();
  if (!actual) return { error: "Acta no encontrada" };
  const fila = actual as unknown as ActaEntregaFila;

  const { error } = await supabase.from("ti_acta_entrega").delete().eq("id", idParsed.data);
  if (error) return { error: error.message };
  await borrarFirmas(supabase, LADOS_ACTA_ENTREGA.map((l) => fila[l.ruta]));
  await auditar("ELIMINAR", "formatos_ti", fila.id, `Acta de entrega ${fila.numero_orden} eliminada`);
  revalidatePath("/formatos-ti/acta-entrega");
  return { success: true };
}

/** URL temporal para ver una firma en pantalla. Se resuelve desde el registro: el cliente nunca elige la ruta. */
export async function urlFirmaActaEntrega(id: number, lado: LadoActaEntrega) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return null;
  const def = LADOS_ACTA_ENTREGA.find((l) => l.lado === lado);
  const idParsed = z.number().int().positive().safeParse(id);
  if (!def || !idParsed.success) return null;
  const supabase = createClient();
  const { data } = await supabase.from("ti_acta_entrega").select(def.ruta).eq("id", idParsed.data).maybeSingle();
  const ruta = (data as Record<string, string | null> | null)?.[def.ruta];
  return urlFirmada(supabase, ruta);
}

/** Filas para el Excel (mismos filtros del listado, hasta 5.000). */
export async function exportarActasEntrega(filtros: Omit<FiltrosActaEntrega, "pagina">) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const supabase = createClient();
  const consulta = supabase
    .from("ti_acta_entrega")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(EXPORT_MAX + 1);
  const { data, error } = await aplicarFiltros(consulta, { ...filtros, pagina: 1 });
  if (error) return { error: error.message };
  const filas = (data ?? []) as unknown as ActaEntregaFila[];
  // Nombres y cédulas de funcionarios salen del sistema: queda quién lo hizo y cuántas filas (no el contenido).
  await auditar("EXPORTAR", "formatos_ti", "", `Exportación de actas de entrega (${Math.min(filas.length, EXPORT_MAX)} filas${filas.length > EXPORT_MAX ? ", truncada" : ""})`);
  return { filas: filas.slice(0, EXPORT_MAX), truncado: filas.length > EXPORT_MAX };
}

/**
 * PDF del acta (G-TECN-F 028/031). Descarga los PNG de las firmas desde Storage, recalcula su hash y lo
 * compara con el guardado: una firma cuyos datos cambiaron después de firmar sale marcada "Modificado".
 */
export async function generarActaEntregaPdf(id: number) {
  const sinPermiso = await errorSiNoEsTi();
  if (sinPermiso) return { error: sinPermiso };
  const idParsed = z.number().int().positive().safeParse(id);
  if (!idParsed.success) return { error: "ID inválido" };

  const supabase = createClient();
  const { data } = await supabase.from("ti_acta_entrega").select("*").eq("id", idParsed.data).maybeSingle();
  if (!data) return { error: "Acta no encontrada" };
  const fila = data as unknown as ActaEntregaFila;
  const firmas = (await motor.firmasParaPdf(supabase, fila, LADOS_ACTA_ENTREGA, clavesActa(fila))) as Partial<Record<LadoActaEntrega, FirmaPdf>>;

  const profile = await getProfile();
  try {
    const buffer = await renderToBuffer(
      createElement(ActaEntregaPdf, {
        acta: fila,
        firmas,
        generadoPor: profile?.nombre_completo || profile?.email || "Usuario SISMANTO",
      })
    );
    return { success: true, data: buffer.toString("base64"), filename: `acta-entrega-${fila.numero_orden}.pdf` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el PDF" };
  }
}
