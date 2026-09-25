import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import { checkBudget, logUsage, getInsightsData } from "@/app/api/actions/ai-data";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INSIGHTS_MODEL = "claude-sonnet-4-6";
// Sonnet 4.6: $3.00/M input, $15.00/M output
const COST_IN = 0.000003;
const COST_OUT = 0.000015;

const SYSTEM_PROMPT = `Eres un analista experto en gestión de flotas de vehículos de emergencia (ambulancias) en Colombia.
Tu tarea es analizar datos de la flota de Aeromanto SAS e identificar patrones, anomalías y oportunidades de mejora.
Responde en español de Colombia. Sé específico con nombres de placas, conductores y cifras.
Enfócate en hallazgos accionables que el equipo de gestión pueda atender.`;

const INSIGHTS_SCHEMA: Anthropic.Tool = {
  name: "generar_insights",
  description: "Genera insights estructurados a partir del análisis de datos de flota",
  input_schema: {
    type: "object" as const,
    required: ["insights", "resumen_ejecutivo"],
    properties: {
      insights: {
        type: "array",
        items: {
          type: "object",
          required: ["categoria", "severidad", "titulo", "descripcion"],
          properties: {
            categoria: { type: "string", enum: ["combustible", "novedades", "mantenimiento", "disponibilidad", "conductores"] },
            severidad: { type: "string", enum: ["crítico", "alerta", "info"] },
            titulo: { type: "string" },
            descripcion: { type: "string" },
            vehiculos_afectados: { type: "array", items: { type: "string" } },
            recomendacion: { type: "string" },
          },
        },
      },
      resumen_ejecutivo: { type: "string" },
    },
  },
};

export async function POST(req: NextRequest) {
  // Auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // El rol vive en `roles.codigo` (user_profiles solo tiene `role_id`): se lee con getProfile(), que además exige
  // perfil activo. Antes se pedía la columna inexistente user_profiles.role_codigo y toda petición daba 403.
  const profile = await getProfile();

  if (!profile || !["ADMIN", "GERENCIAL", "COORDINACION"].includes(profile.role_codigo)) {
    return NextResponse.json({ error: "Sin permisos para IA Insights" }, { status: 403 });
  }

  // Budget check
  const budget = await checkBudget();
  if (!budget.ok) {
    return NextResponse.json({ error: budget.reason }, { status: 429 });
  }

  // Fetch aggregated fleet data
  const fleetData = await getInsightsData();

  const response = await anthropic.messages.create({
    model: INSIGHTS_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [INSIGHTS_SCHEMA],
    tool_choice: { type: "tool", name: "generar_insights" },
    messages: [
      {
        role: "user",
        content: `Analiza los siguientes datos de la flota de Aeromanto SAS del período ${fleetData.periodoAnalisis} y genera insights accionables:

${JSON.stringify(fleetData, null, 2)}

Identifica:
1. Vehículos con consumo de combustible atípico o alarmante (cargas excesivas, frecuencia inusual)
2. Conductores que frecuentemente tienen novedades o daños asociados
3. Vehículos con alto número de novedades abiertas o repetidas
4. Patrones en disponibilidad: vehículos con muchos días fuera de servicio
5. Alertas de costos de mantenimiento inusuales

Sé específico: nombra placas, conductores y cifras exactas.`,
      },
    ],
  });

  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) {
    return NextResponse.json({ error: "El modelo no generó insights estructurados" }, { status: 500 });
  }

  const cost = response.usage.input_tokens * COST_IN + response.usage.output_tokens * COST_OUT;
  await logUsage("insights", INSIGHTS_MODEL, response.usage.input_tokens, response.usage.output_tokens, cost, user.id);

  return NextResponse.json({
    ...toolUse.input,
    periodo: fleetData.periodoAnalisis,
    generado_en: new Date().toISOString(),
  });
}
