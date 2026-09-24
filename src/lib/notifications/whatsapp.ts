// Cliente WhatsApp Cloud API (Meta) — mensajes de plantilla.
// Portado de sisres/includes/wa/waClient.php al patrón de src/lib/graph/client.ts.
// Env: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID. Sin credenciales configuradas
// opera en modo desarrollo: no llama a la API y simula una respuesta OK, para
// que staging funcione sin riesgo de enviar mensajes reales (STAGING_SETUP.md §2).

const GRAPH_VERSION = "v20.0";

export interface WaSendResult {
  ok: boolean;
  wamid: string | null;
  error: string | null;
}

export interface WaMediaHeader {
  tipo: "image" | "document" | "video";
  mediaId: string;
  nombre?: string;
}

/**
 * Normaliza un teléfono a formato Meta (E.164 sin '+'). Colombia: antepone 57
 * a celulares de 10 dígitos que empiezan en 3. Devuelve null si no es válido.
 */
export function sanitizarTelefono(raw: string): string | null {
  let d = raw.replace(/\D+/g, "");
  if (!d) return null;
  if (d.length > 2 && d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d[0] === "3") return `57${d}`;
  if (d.length === 12 && d.startsWith("57") && d[2] === "3") return d;
  if (d.length >= 11 && d.length <= 15) return d;
  return null;
}

/**
 * Construye el payload de un mensaje de plantilla (función pura, testeable).
 * `parametros` son los valores para {{1}},{{2}}... del body.
 */
export function construirPlantilla(
  to: string,
  plantilla: string,
  idioma: string,
  parametros: string[] = [],
  media?: WaMediaHeader
): Record<string, unknown> {
  const template: Record<string, unknown> = { name: plantilla, language: { code: idioma } };
  const components: Record<string, unknown>[] = [];

  if (media) {
    const mediaObj: Record<string, string> = { id: media.mediaId };
    // Meta EXIGE 'filename' para encabezados de tipo documento
    if (media.tipo === "document") mediaObj.filename = media.nombre || "documento.pdf";
    components.push({ type: "header", parameters: [{ type: media.tipo, [media.tipo]: mediaObj }] });
  }
  if (parametros.length > 0) {
    components.push({
      type: "body",
      parameters: parametros.map((valor) => ({ type: "text", text: String(valor) })),
    });
  }
  if (components.length > 0) template.components = components;

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template,
  };
}

export function whatsappConfigurado(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Envía un mensaje de plantilla. Sin credenciales (staging) simula OK con un
 * wamid `wamid.DEV_*` — mismo comportamiento que el developer_mode de SISRES.
 */
export async function enviarPlantilla(
  to: string,
  plantilla: string,
  idioma: string,
  parametros: string[] = [],
  media?: WaMediaHeader
): Promise<WaSendResult> {
  if (!whatsappConfigurado()) {
    return {
      ok: true,
      wamid: `wamid.DEV_${Math.random().toString(16).slice(2, 18)}`,
      error: null,
    };
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = construirPlantilla(to, plantilla, idioma, parametros, media);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (json?.messages?.[0]?.id) {
      return { ok: true, wamid: json.messages[0].id, error: null };
    }
    const err = json?.error?.message ?? "Respuesta inesperada de la API";
    const code = json?.error?.code ?? "";
    return { ok: false, wamid: null, error: `[${code}] ${err}`.trim() };
  } catch (e) {
    return { ok: false, wamid: null, error: e instanceof Error ? e.message : "Error de red" };
  }
}

/**
 * Sube un archivo a Meta (multipart a /{phone}/media) y devuelve su `media_id`, que se usa en el encabezado de la
 * plantilla. Sin credenciales simula un id `DEV_*` (mismo criterio que enviarPlantilla). El id caduca a los ~30 días.
 */
export async function subirMediaMeta(
  bytes: Uint8Array,
  mime: string,
  nombre: string
): Promise<{ ok: true; mediaId: string } | { ok: false; error: string }> {
  if (!whatsappConfigurado()) return { ok: true, mediaId: `DEV_${Math.random().toString(16).slice(2, 18)}` };

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", mime);
  form.append("file", new Blob([bytes as BlobPart], { type: mime }), nombre);
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      body: form,
    });
    const json = await res.json();
    if (json?.id) return { ok: true, mediaId: String(json.id) };
    return { ok: false, error: `[${json?.error?.code ?? ""}] ${json?.error?.message ?? "Respuesta inesperada de la API"}`.trim() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red" };
  }
}
