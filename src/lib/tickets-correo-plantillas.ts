// Plantillas de los correos de soporte técnico. Funciones puras (sin base de datos ni red) para probarlas sola.
// Todo texto que viene del usuario (asunto, descripción, solución, notas, nombres) se ESCAPA: un correo HTML con
// «<script>» o un enlace inyectado en el asunto de un ticket no debe llegar tal cual a otra persona.

export type EventoTicketCorreo = "NUEVO_GESTORES" | "NUEVO_SOLICITANTE" | "TOMADO" | "RESUELTO" | "REABIERTO";

export interface DatosCorreoTicket {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  sede: string;
  area: string;
  nombreSolicitante: string;
  nombreTecnico: string | null;
  solucion: string | null;
  /** Nota de la reapertura. */
  nota?: string | null;
  /** URL pública de la app (sin barra final). Si falta, el correo sale sin enlaces. */
  baseUrl?: string | null;
}

export function escaparHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const recortar = (t: string, max: number) => (t.length > max ? `${t.slice(0, max - 1)}…` : t);
// El asunto del correo no admite saltos de línea (inyección de cabeceras) y se mantiene corto.
const paraAsunto = (t: string) => recortar(t.replace(/[\r\n]+/g, " ").trim(), 90);

const PRIORIDAD: Record<string, string> = { BAJA: "Baja", MEDIA: "Media", ALTA: "Alta", URGENTE: "Urgente" };

function enlace(baseUrl: string | null | undefined, ruta: string, texto: string): string {
  if (!baseUrl || !/^https?:\/\/[^\s"'<>]+$/.test(baseUrl)) return "";
  return `<p><a href="${escaparHtml(baseUrl.replace(/\/+$/, "") + ruta)}">${escaparHtml(texto)}</a></p>`;
}

function fila(etiqueta: string, valor: string): string {
  return `<tr><td style="padding:2px 12px 2px 0;color:#555"><b>${escaparHtml(etiqueta)}</b></td><td>${escaparHtml(valor)}</td></tr>`;
}

function resumen(d: DatosCorreoTicket): string {
  return `<table style="border-collapse:collapse;font-size:14px">${[
    fila("Ticket", `#${d.id}`),
    fila("Asunto", d.asunto),
    fila("Categoría", d.categoria),
    fila("Prioridad", PRIORIDAD[d.prioridad] ?? d.prioridad),
    fila("Sede", d.sede),
    fila("Área", d.area),
    fila("Solicitante", d.nombreSolicitante),
  ].join("")}</table>`;
}

const envolver = (titulo: string, cuerpo: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222"><h3 style="margin:0 0 12px">${escaparHtml(titulo)}</h3>${cuerpo}<p style="color:#888;font-size:12px;margin-top:20px">Mensaje automático de SISMANTO — Soporte técnico. No respondas a este correo.</p></div>`;

export function armarCorreoTicket(evento: EventoTicketCorreo, d: DatosCorreoTicket): { asunto: string; html: string } {
  const gestion = enlace(d.baseUrl, `/soporte/gestion/${d.id}`, "Abrir el ticket en Gestión");
  const mios = enlace(d.baseUrl, "/soporte", "Ver mis tickets");

  switch (evento) {
    case "NUEVO_GESTORES":
      return {
        asunto: `[Soporte] Nuevo ticket #${d.id} (${PRIORIDAD[d.prioridad] ?? d.prioridad}): ${paraAsunto(d.asunto)}`,
        html: envolver(
          `Nuevo ticket #${d.id}`,
          `${resumen(d)}<p style="white-space:pre-wrap"><b>Descripción</b><br>${escaparHtml(recortar(d.descripcion, 600))}</p>${gestion}`,
        ),
      };
    case "NUEVO_SOLICITANTE":
      return {
        asunto: `Recibimos tu ticket #${d.id}: ${paraAsunto(d.asunto)}`,
        html: envolver(`Recibimos tu ticket #${d.id}`, `<p>Ya quedó registrado. Te avisaremos cuando un técnico lo tome.</p>${resumen(d)}${mios}`),
      };
    case "TOMADO":
      return {
        asunto: `Tu ticket #${d.id} ya tiene técnico: ${paraAsunto(d.asunto)}`,
        html: envolver(
          `Tu ticket #${d.id} ya tiene técnico`,
          `<p><b>${escaparHtml(d.nombreTecnico ?? "Un técnico")}</b> tomó tu ticket y se pondrá en contacto contigo.</p>${resumen(d)}${mios}`,
        ),
      };
    case "RESUELTO":
      return {
        asunto: `Tu ticket #${d.id} fue resuelto: ${paraAsunto(d.asunto)}`,
        html: envolver(
          `Tu ticket #${d.id} fue resuelto`,
          `<p style="white-space:pre-wrap"><b>Solución</b><br>${escaparHtml(recortar(d.solucion ?? "—", 1500))}</p><p>Si no estás de acuerdo, puedes <b>reabrirlo</b> desde «Mis tickets» explicando el motivo.</p>${mios}`,
        ),
      };
    case "REABIERTO":
      return {
        asunto: `[Soporte] Ticket #${d.id} reabierto: ${paraAsunto(d.asunto)}`,
        html: envolver(
          `Ticket #${d.id} reabierto`,
          `<p>El solicitante no estuvo de acuerdo con la solución y lo reabrió.</p><p style="white-space:pre-wrap"><b>Motivo</b><br>${escaparHtml(recortar(d.nota ?? "—", 1000))}</p>${resumen(d)}${gestion}`,
        ),
      };
  }
}
