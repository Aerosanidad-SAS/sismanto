import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hoyBogota, sumarDias } from "@/lib/fechas";
import { cronAutorizado } from "@/lib/cron-auth";

export const maxDuration = 30;

/**
 * Materializa la operación de hoy y de mañana desde los conductores titulares (migración 108), para que el historial
 * de quién operó cada vehículo exista aunque nadie abra Regulación. Idempotente: no pisa lo que Regulación ajustó.
 * Vercel invoca los crons con GET; POST se acepta para dispararlo a mano.
 */
async function ejecutar(request: NextRequest): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if (!cronAutorizado(request.headers.get("authorization"), cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient() as any;
  const hoy = hoyBogota();
  const creadas: Record<string, number> = {};
  for (const dia of [hoy, sumarDias(hoy, 1)]) {
    const { data, error } = await supabase.rpc("materializar_operacion_dia", { p_fecha: dia });
    if (error) return NextResponse.json({ error: error.message, dia }, { status: 500 });
    creadas[dia] = data ?? 0;
  }
  return NextResponse.json({ ok: true, creadas });
}

export const GET = ejecutar;
export const POST = ejecutar;
