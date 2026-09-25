import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/app/api/actions/auth";
import {
  checkBudget,
  logUsage,
  toolGetNovedades,
  toolGetVehiculos,
  toolGetMantenimientos,
  toolGetCombustible,
} from "@/app/api/actions/ai-data";
import { crearMantenimiento } from "@/app/api/actions/mantenimientos";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CHAT_MODEL = "claude-haiku-4-5";
// Haiku 4.5: $1.00/M input, $5.00/M output
const COST_IN = 0.000001;
const COST_OUT = 0.000005;

const SYSTEM_PROMPT = `Eres el asistente de gestión de flota de Aeromanto SAS, empresa de servicios de ambulancias.
Ayudas al equipo administrativo a consultar información y registrar operaciones de mantenimiento.
Responde siempre en español de Colombia. Sé conciso y directo.
Cuando muestres datos, usa tablas markdown si hay más de 3 registros.
Cuando el usuario pida registrar un mantenimiento, primero muéstrale los datos que vas a registrar y espera confirmación explícita antes de usar la herramienta register_mantenimiento.
Si no encuentras datos para un filtro, dilo claramente.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_novedades",
    description: "Obtiene novedades/incidentes de la flota. Usa cuando el usuario pida novedades, incidentes o daños.",
    input_schema: {
      type: "object" as const,
      properties: {
        placa: { type: "string", description: "Placa del vehículo (ej: OKL227)" },
        estado: { type: "string", enum: ["ABIERTO", "EN_PROCESO", "CERRADO"] },
        desde: { type: "string", description: "Fecha inicio YYYY-MM-DD" },
        hasta: { type: "string", description: "Fecha fin YYYY-MM-DD" },
        limit: { type: "number", description: "Máximo de resultados (default 20)" },
      },
    },
  },
  {
    name: "get_vehiculos",
    description: "Lista los vehículos de la flota con su estado actual.",
    input_schema: {
      type: "object" as const,
      properties: {
        estado: { type: "string", enum: ["OPERATIVO", "FUERA_SERVICIO", "EN_MANTENIMIENTO"] },
      },
    },
  },
  {
    name: "get_mantenimientos",
    description: "Obtiene registros de mantenimiento preventivo y correctivo.",
    input_schema: {
      type: "object" as const,
      properties: {
        placa: { type: "string" },
        desde: { type: "string" },
        hasta: { type: "string" },
        tipo: { type: "string", enum: ["PREVENTIVO", "CORRECTIVO"] },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "get_combustible",
    description: "Obtiene registros de combustible y cargas de la flota.",
    input_schema: {
      type: "object" as const,
      properties: {
        placa: { type: "string" },
        desde: { type: "string" },
        hasta: { type: "string" },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "register_mantenimiento",
    description: "Registra un mantenimiento realizado. Usar SOLO cuando el usuario confirme explícitamente. Puede cerrar novedades asociadas.",
    input_schema: {
      type: "object" as const,
      required: ["vehicleId", "fecha", "tipo", "descripcionTrabajo", "valor", "kilometrajeActual"],
      properties: {
        vehicleId: { type: "string", description: "ID UUID del vehículo" },
        fecha: { type: "string", description: "Fecha YYYY-MM-DD" },
        tipo: { type: "string", enum: ["PREVENTIVO", "CORRECTIVO"] },
        descripcionTrabajo: { type: "string" },
        valor: { type: "number", description: "Costo en pesos colombianos" },
        kilometrajeActual: { type: "number", description: "Kilometraje al momento del mantenimiento" },
        proveedor: { type: "string" },
        incidentId: { type: "number", description: "ID de la novedad que cierra este mantenimiento" },
        notasAdicionales: { type: "string" },
      },
    },
  },
];

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "get_novedades":
        return JSON.stringify(await toolGetNovedades(input as Parameters<typeof toolGetNovedades>[0]));
      case "get_vehiculos":
        return JSON.stringify(await toolGetVehiculos(input as Parameters<typeof toolGetVehiculos>[0]));
      case "get_mantenimientos":
        return JSON.stringify(await toolGetMantenimientos(input as Parameters<typeof toolGetMantenimientos>[0]));
      case "get_combustible":
        return JSON.stringify(await toolGetCombustible(input as Parameters<typeof toolGetCombustible>[0]));
      case "register_mantenimiento": {
        const result = await crearMantenimiento(input as Parameters<typeof crearMantenimiento>[0]);
        if (result.error) return JSON.stringify({ error: result.error });
        return JSON.stringify({ success: true, mensaje: "Mantenimiento registrado correctamente", id: result.data?.id_manto });
      }
      default:
        return JSON.stringify({ error: `Herramienta desconocida: ${name}` });
    }
  } catch (e) {
    return JSON.stringify({ error: e instanceof Error ? e.message : "Error inesperado" });
  }
}

export async function POST(req: NextRequest) {
  // Auth
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // El rol vive en `roles.codigo` (user_profiles solo tiene `role_id`): se lee con getProfile(), que además exige
  // perfil activo. Antes se pedía la columna inexistente user_profiles.role_codigo y toda petición daba 403.
  const profile = await getProfile();

  if (!profile || !["ADMIN", "GERENCIAL"].includes(profile.role_codigo)) {
    return NextResponse.json({ error: "Sin permisos para el chat IA" }, { status: 403 });
  }

  // Budget check
  const budget = await checkBudget();
  if (!budget.ok) {
    return NextResponse.json({ error: budget.reason }, { status: 429 });
  }

  const { messages } = await req.json() as { messages: Anthropic.MessageParam[] };

  let currentMessages: Anthropic.MessageParam[] = [...messages];
  let totalIn = 0;
  let totalOut = 0;
  let finalText = "";
  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: CHAT_MODEL,
      max_tokens: 1024,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: TOOLS,
      messages: currentMessages,
    });

    totalIn += response.usage.input_tokens;
    totalOut += response.usage.output_tokens;

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      finalText = textBlock?.text ?? "";
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

      currentMessages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (t) => ({
          type: "tool_result" as const,
          tool_use_id: t.id,
          content: await executeTool(t.name, t.input as Record<string, unknown>),
        }))
      );

      currentMessages.push({ role: "user", content: toolResults });
    } else {
      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      finalText = textBlock?.text ?? "";
      break;
    }
  }

  const cost = totalIn * COST_IN + totalOut * COST_OUT;
  await logUsage("chat", CHAT_MODEL, totalIn, totalOut, cost, user.id);

  return NextResponse.json({ content: finalText });
}
