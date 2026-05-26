// Standalone Claude-based invoice extractor.
// Used by the cron processor (not a Server Action — no "use server" directive).

import Anthropic from "@anthropic-ai/sdk";

export interface InvoiceLineItem {
  description: string;
  quantity:    number;
  unit_price:  number;
  total:       number;
}

export interface ExtractedInvoice {
  vehicle_plate:   string | null;
  invoice_date:    string | null;  // YYYY-MM-DD
  invoice_number:  string | null;
  supplier_name:   string | null;
  line_items:      InvoiceLineItem[];
  subtotal:        number | null;
  tax:             number | null;
  total_amount:    number | null;
  currency:        string | null;  // e.g. "COP"
  tipo:            "PREVENTIVO" | "CORRECTIVO" | null;
  work_description: string | null;
  extraction_notes: string | null;
}

export interface ExtractionResult {
  data:          ExtractedInvoice | null;
  lowConfidence: boolean;
}

const SYSTEM_PROMPT = `Eres un extractor especializado en facturas de mantenimiento vehicular colombianas.

Extrae los siguientes campos de la factura adjunta y responde ÚNICAMENTE con JSON válido sin bloques de código ni texto adicional:

{
  "vehicle_plate":    "OKL227",
  "invoice_date":     "2024-03-15",
  "invoice_number":   "F-2341",
  "supplier_name":    "Taller Automotriz Central",
  "line_items": [
    { "description": "Filtro aceite", "quantity": 1, "unit_price": 35700, "total": 35700 }
  ],
  "subtotal":         226100,
  "tax":              0,
  "total_amount":     226100,
  "currency":         "COP",
  "tipo":             "PREVENTIVO",
  "work_description": "Cambio filtro aceite y aceite motor 20W50",
  "extraction_notes": null
}

⚠️ REGLA CRÍTICA — el error más frecuente:
Las facturas colombianas incluyen texto legal como:
  "Resolución DIAN No. X del … por valor de $116,620,000"
ESTOS VALORES SON REFERENCIAS LEGALES, NO EL COSTO DEL SERVICIO.
El valor real es la SUMA de los ítems de línea.
Nunca uses el valor del texto legal como total_amount.

Reglas:
- vehicle_plate: placa colombiana sin espacios ni guiones (ej. OKL227, TRG542)
- invoice_date: formato YYYY-MM-DD; null si no está
- tipo: "PREVENTIVO" para servicios rutinarios; "CORRECTIVO" para reparaciones de falla
- work_description: máx 300 caracteres
- Si un campo no está en la factura usa null
- currency: "COP" por defecto si no se especifica otra`;

export async function extractInvoice(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const anthropic = new Anthropic({ apiKey });
  const base64    = buffer.toString("base64");

  const contentBlock =
    mimeType === "application/pdf"
      ? ({
          type:   "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        } as const)
      : ({
          type:   "image",
          source: {
            type:       "base64",
            media_type: mimeType as "image/jpeg" | "image/png" | "image/webp",
            data:       base64,
          },
        } as const);

  try {
    const response = await anthropic.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: "user", content: [contentBlock] }],
    });

    const raw   = response.content[0]?.type === "text" ? response.content[0].text : "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { data: null, lowConfidence: true };

    const data: ExtractedInvoice = JSON.parse(match[0]);
    const lowConfidence =
      !data.vehicle_plate || !data.total_amount || !data.invoice_date;

    return { data, lowConfidence };
  } catch {
    return { data: null, lowConfidence: true };
  }
}

export function buildFileName(
  plate:       string,
  date:        string,  // YYYY-MM-DD
  description: string,
  ext:         string   // e.g. "pdf"
): string {
  // Format: [DESCRIPCION_CORTA] [PLACA] [DD-MM-AA].ext
  const [year, month, day] = date.split("-");
  const yy  = (year ?? "00").slice(-2);
  const dateStr = `${day ?? "00"}-${month ?? "00"}-${yy}`;
  const desc = description
    .replace(/[/\\?%*:|"<>]/g, "")  // remove illegal filename chars
    .trim()
    .slice(0, 30)
    .trimEnd();
  return `${desc} ${plate.toUpperCase()} ${dateStr}.${ext}`;
}
