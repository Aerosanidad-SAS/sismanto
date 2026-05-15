"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/app/api/actions/auth";
import { revalidatePath } from "next/cache";

export interface ExtractedItem {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface ExtractedInvoiceData {
  placa?: string;
  fecha?: string;
  tipo?: "PREVENTIVO" | "CORRECTIVO";
  descripcion_trabajo?: string;
  proveedor?: string;
  numero_factura?: string;
  valor?: number;
  items?: ExtractedItem[];
  notas_extraccion?: string;
}

export interface AprobarFacturaData {
  vehicleId: string;
  fecha: string;
  tipo: "PREVENTIVO" | "CORRECTIVO";
  descripcionTrabajo: string;
  proveedor: string;
  valor: number;
  numeroFactura?: string;
  categoriaId?: number;
  kilometrajeActual: number;
  tiempoFueraServicioHoras?: number;
  notasAdicionales?: string;
}

const EXTRACTION_PROMPT = `Eres un extractor especializado en facturas de mantenimiento vehicular colombianas.

Extrae los siguientes campos de la factura adjunta:
- placa: placa del vehículo en formato colombiano sin espacios (ej: "OKL227", "TRG542")
- fecha: fecha de la factura en formato "YYYY-MM-DD"
- tipo: "PREVENTIVO" si es servicio rutinario (cambio de aceite, filtros programados), "CORRECTIVO" si es reparación de falla
- descripcion_trabajo: descripción concisa de los trabajos y repuestos (máx 300 chars)
- proveedor: nombre del taller o empresa que emitió la factura
- numero_factura: número, código o referencia de la factura
- valor: SUMA de todos los ítems de línea reales (repuestos + mano de obra)
- items: lista detallada de ítems con cantidad, precio unitario y subtotal

⚠️ REGLA CRÍTICA — EL ERROR MÁS COMÚN:
Las facturas colombianas incluyen texto legal como:
  "A esta factura de venta aplican las normas relativas a la ley... por valor de $116,620,000"
  "Resolución DIAN No. X del... por valor de $Y"
ESTOS VALORES SON REFERENCIAS LEGALES OBLIGATORIAS, NO SON EL COSTO DEL SERVICIO.
El valor real es la SUMA de los ítems de línea: ej. filtro $190,400 + aceite $35,700 = $226,100.
Nunca uses el valor del texto legal como precio del mantenimiento.

Si un campo no está en la factura, usa null.

Responde ÚNICAMENTE con JSON válido sin texto adicional:
{
  "placa": "OKL227",
  "fecha": "2023-03-15",
  "tipo": "CORRECTIVO",
  "descripcion_trabajo": "Cambio filtro secador, aceite de motor y filtro de aceite",
  "proveedor": "Taller Automotriz Central",
  "numero_factura": "F-2341",
  "valor": 226100,
  "items": [
    { "descripcion": "Filtro secador", "cantidad": 3, "precio_unitario": 190400, "subtotal": 571200 },
    { "descripcion": "Aceite motor 20W50", "cantidad": 7, "precio_unitario": 35700, "subtotal": 249900 }
  ],
  "notas_extraccion": "Se ignoró referencia legal DIAN por valor de $116,620,000"
}`;

export async function extractInvoiceAction(
  formData: FormData
): Promise<{ data?: ExtractedInvoiceData; error?: string }> {
  await requireRole(["ADMIN", "MANTENIMIENTO"]);

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No se recibió ningún archivo" };

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: `Formato no soportado: ${file.type}. Usa PDF, JPG, PNG o WEBP.` };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "El archivo supera el límite de 8 MB." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "ANTHROPIC_API_KEY no está configurada en el servidor." };

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const anthropic = new Anthropic({ apiKey });

  const contentBlock =
    file.type === "application/pdf"
      ? ({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        } as const)
      : ({
          type: "image",
          source: {
            type: "base64",
            media_type: file.type as "image/jpeg" | "image/png" | "image/webp",
            data: base64,
          },
        } as const);

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [contentBlock, { type: "text", text: EXTRACTION_PROMPT }],
        },
      ],
    });

    const raw = response.content[0]?.type === "text" ? response.content[0].text : "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { error: "Claude no encontró datos de factura en el documento." };

    const parsed: ExtractedInvoiceData = JSON.parse(match[0]);
    return { data: parsed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { error: `Error en extracción: ${msg}` };
  }
}

export interface DuplicadoInfo {
  idManto: number;
  fecha: string;
  descripcion: string | null;
  valor: number | null;
  placa: string;
}

export async function aprobarFacturaMantenimiento(
  data: AprobarFacturaData,
  forzar = false
): Promise<{ success?: boolean; idManto?: number; error?: string; duplicado?: DuplicadoInfo }> {
  await requireRole(["ADMIN", "MANTENIMIENTO"]);

  if (!data.vehicleId) return { error: "Debe seleccionar un vehículo." };
  if (!data.fecha) return { error: "La fecha es requerida." };
  if (!data.descripcionTrabajo || data.descripcionTrabajo.length < 5)
    return { error: "La descripción del trabajo es requerida (mín. 5 caracteres)." };
  if (!data.proveedor) return { error: "El proveedor es requerido." };

  const supabase = createClient();

  // ── Detección de duplicados (omitible con forzar=true) ────────────────────
  if (!forzar) {
    let dupQuery = supabase
      .from("maintenance_records")
      .select("id_manto, fecha, descripcion_trabajo, valor, vehicles(placa)")
      .eq("vehicle_id", data.vehicleId);

    // Criterio primario: mismo número de factura
    if (data.numeroFactura?.trim()) {
      dupQuery = dupQuery.eq("numero_factura", data.numeroFactura.trim());
    } else {
      // Criterio secundario: misma fecha + tipo + valor idéntico
      dupQuery = dupQuery.eq("fecha", data.fecha).eq("tipo", data.tipo).eq("valor", data.valor);
    }

    const { data: existing } = await dupQuery.limit(1).single();

    if (existing) {
      return {
        duplicado: {
          idManto: existing.id_manto,
          fecha: existing.fecha,
          descripcion: existing.descripcion_trabajo,
          valor: existing.valor,
          placa: (existing.vehicles as any)?.placa ?? "",
        },
      };
    }
  }

  // ── Inserción ─────────────────────────────────────────────────────────────
  const { data: record, error } = await supabase
    .from("maintenance_records")
    .insert({
      vehicle_id: data.vehicleId,
      fecha: data.fecha,
      kilometraje_actual: data.kilometrajeActual || 0,
      tipo: data.tipo,
      categoria_id: data.categoriaId ?? null,
      descripcion_trabajo: data.descripcionTrabajo,
      proveedor: data.proveedor,
      valor: data.valor,
      numero_factura: data.numeroFactura || null,
      tiempo_fuera_servicio_horas: data.tiempoFueraServicioHoras || 0,
      notas_adicionales: data.notasAdicionales || null,
    })
    .select("id_manto")
    .single();

  if (error) return { error: error.message };

  if (data.kilometrajeActual > 0) {
    await supabase.from("mileage_logs").upsert(
      {
        vehicle_id: data.vehicleId,
        fecha: data.fecha,
        lectura_kilometraje: data.kilometrajeActual,
      },
      { onConflict: "vehicle_id,fecha" }
    );
  }

  revalidatePath("/mantenimientos");
  revalidatePath("/");

  return { success: true, idManto: record.id_manto };
}
