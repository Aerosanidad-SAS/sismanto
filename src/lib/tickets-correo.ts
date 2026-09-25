import { createAdminClient } from "@/lib/supabase/admin";
import { emailConfigurado, enviarCorreo } from "@/lib/notifications/email";
import { armarCorreoTicket, type EventoTicketCorreo } from "@/lib/tickets-correo-plantillas";

// Avisos por correo del soporte técnico (SISRES: mailer de insertarTicket.php / actualizarTicket.php).
//
// Reglas:
//  · NUNCA rompe la acción que lo llama: cualquier fallo se deja en el log del servidor y se sigue. Un ticket no
//    puede quedar sin registrar porque falló el correo.
//  · Si el correo no está configurado en este entorno (faltan las variables de Microsoft Graph) NO hace nada:
//    `enviarCorreo` simula un envío correcto en ese caso, y no queremos dejar en el registro «enviados» que no lo son.
//  · Lo llaman las acciones DESPUÉS de comprobar el rol y de que el cambio salió bien. Aquí se usa la clave de
//    servicio solo para leer el ticket completo y los correos de las personas; nunca se devuelve nada al cliente.
//  · Cada intento queda en `notification_log` (canal EMAIL). El detalle del error no incluye el cuerpo del correo.

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FilaTicket {
  id: number;
  asunto: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  sede: string;
  area: string;
  solicitante_id: string;
  nombre_solicitante: string;
  tecnico_id: string | null;
  nombre_tecnico: string | null;
  solucion: string | null;
}

export async function notificarTicket(evento: "NUEVO" | "TOMADO" | "RESUELTO" | "REABIERTO", ticketId: number, extra: { nota?: string } = {}): Promise<void> {
  try {
    if (!emailConfigurado()) return;
    const admin = createAdminClient();

    const { data } = await admin
      .from("tickets")
      .select("id, asunto, descripcion, categoria, prioridad, sede, area, solicitante_id, nombre_solicitante, tecnico_id, nombre_tecnico, solucion")
      .eq("id", ticketId)
      .maybeSingle();
    const t = data as unknown as FilaTicket | null;
    if (!t) return;

    const correoDe = async (userId: string | null): Promise<string | null> => {
      if (!userId) return null;
      const { data: p } = await admin.from("user_profiles").select("email").eq("user_id", userId).eq("activo", true).maybeSingle();
      const email = ((p as unknown as { email: string | null } | null)?.email ?? "").trim();
      return CORREO_VALIDO.test(email) ? email : null;
    };
    const correosGestores = async (): Promise<string[]> => {
      const { data: filas } = await admin.from("ticket_correos_gestores").select("correo");
      return ((filas ?? []) as unknown as { correo: string }[]).map((f) => f.correo.trim()).filter((c) => CORREO_VALIDO.test(c));
    };

    const datos = {
      id: t.id,
      asunto: t.asunto,
      descripcion: t.descripcion,
      categoria: t.categoria,
      prioridad: t.prioridad,
      sede: t.sede,
      area: t.area,
      nombreSolicitante: t.nombre_solicitante,
      nombreTecnico: t.nombre_tecnico,
      solucion: t.solucion,
      nota: extra.nota ?? null,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    };

    // Qué correo va a quién. Cada uno es un mensaje aparte: nadie ve las direcciones de los demás.
    const envios: { evento: EventoTicketCorreo; para: string[] }[] = [];
    if (evento === "NUEVO") {
      envios.push({ evento: "NUEVO_GESTORES", para: await correosGestores() });
      const solicitante = await correoDe(t.solicitante_id);
      if (solicitante) envios.push({ evento: "NUEVO_SOLICITANTE", para: [solicitante] });
    } else if (evento === "TOMADO" || evento === "RESUELTO") {
      const solicitante = await correoDe(t.solicitante_id);
      if (solicitante) envios.push({ evento, para: [solicitante] });
    } else {
      const tecnico = await correoDe(t.tecnico_id);
      const para = [...new Set([...(tecnico ? [tecnico] : []), ...(await correosGestores())])];
      envios.push({ evento: "REABIERTO", para });
    }

    for (const envio of envios) {
      for (const destino of envio.para) {
        const { asunto, html } = armarCorreoTicket(envio.evento, datos);
        const res = await enviarCorreo([destino], asunto, html);
        const { error } = await admin.from("notification_log").insert({
          canal: "EMAIL",
          destinatario: destino,
          asunto: asunto.slice(0, 255),
          plantilla: `ticket_${envio.evento.toLowerCase()}`,
          referencia: `ticket:${t.id}`,
          ok: res.ok,
          error: res.ok ? null : (res.error ?? "error desconocido").slice(0, 500),
        } as never);
        if (error) console.error("[tickets-correo] no se pudo registrar el envío:", error.message);
      }
    }
  } catch (e) {
    console.error("[tickets-correo] no se pudo notificar el ticket", ticketId, evento, e instanceof Error ? e.message : e);
  }
}
