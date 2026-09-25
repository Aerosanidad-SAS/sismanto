import { hoyBogota } from "@/lib/fechas";
import { createAdminClient } from "@/lib/supabase/admin";

// Presupuesto y registro de uso de la IA. Vive fuera de `api/actions/ai-data.ts` a propósito: ese archivo es
// "use server" y todo lo que exporta se puede llamar desde el navegador como endpoint; estas funciones usan la
// clave de servicio y solo deben correr desde las rutas /api/ai/*, que ya validan sesión y rol.

const DAILY_BUDGET_USD = parseFloat(process.env.AI_DAILY_BUDGET_USD ?? "2.00");
const MONTHLY_BUDGET_USD = parseFloat(process.env.AI_MONTHLY_BUDGET_USD ?? "30.00");

export async function checkBudget(): Promise<{ ok: boolean; reason?: string }> {
  const admin = createAdminClient();
  const today = hoyBogota();
  const monthStart = today.slice(0, 7) + "-01";

  const { data: daily } = await admin
    .from("ai_usage_log")
    .select("cost_usd")
    .gte("created_at", today + "T00:00:00Z");

  const dailyTotal = (daily ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
  if (dailyTotal >= DAILY_BUDGET_USD) {
    return { ok: false, reason: `Límite diario alcanzado ($${DAILY_BUDGET_USD.toFixed(2)} USD)` };
  }

  const { data: monthly } = await admin
    .from("ai_usage_log")
    .select("cost_usd")
    .gte("created_at", monthStart + "T00:00:00Z");

  const monthlyTotal = (monthly ?? []).reduce((s, r) => s + Number(r.cost_usd), 0);
  if (monthlyTotal >= MONTHLY_BUDGET_USD) {
    return { ok: false, reason: `Límite mensual alcanzado ($${MONTHLY_BUDGET_USD.toFixed(2)} USD)` };
  }

  return { ok: true };
}

export async function logUsage(
  feature: "chat" | "insights",
  modelo: string,
  tokensIn: number,
  tokensOut: number,
  costUsd: number,
  usuarioId: string
) {
  const admin = createAdminClient();
  await admin.from("ai_usage_log").insert({
    feature,
    modelo,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost_usd: costUsd,
    usuario_id: usuarioId,
  });
}
