import { armarAlertaNoApto } from "@/lib/hallazgos-criticos";
import { emailConfigurado, enviarCorreo } from "@/lib/notifications/email";

// Tipado laxo a propósito: el cliente de Supabase colapsa a `never` en este repo (ver CLAUDE.md).
type Cliente = any;

const ZONA = "America/Bogota";

/** Correos que no son de una persona (cuentas de prueba o internas): no se les escribe. */
const NO_ENVIABLE = /@sismanto\.(test|invalid)$/i;

/**
 * Avisa de inmediato que un vehículo quedó NO APTO: Regulación y Coordinación del CRA del vehículo, más los
 * responsables de Mantenimiento que figuren en `ALERTA_NO_APTO_CORREOS` (correos separados por coma). Módulo de
 * servidor, sin "use server". Nunca lanza: un fallo de correo no debe deshacer el reporte que ya quedó guardado, pero
 * se deja en el log y se devuelve cuántos destinatarios se intentaron.
 */
export async function avisarVehiculoNoApto(
  supabase: Cliente,
  args: { vehicleId: string; hallazgos: string[]; reportadoPor: string; tipo?: "NO_APTO" | "SOLICITUD" }
): Promise<{ destinatarios: number; enviado: boolean }> {
  try {
    const { data: v } = await supabase.from("vehicles").select("placa, centro_operativo").eq("id", args.vehicleId).maybeSingle();
    if (!v) return { destinatarios: 0, enviado: false };

    const correos = new Set<string>();
    const { data: centro } = await supabase.from("operational_centers").select("id, nombre").eq("codigo", v.centro_operativo).maybeSingle();
    if (centro) {
      const { data: roles } = await supabase.from("roles").select("id").in("codigo", args.tipo === "SOLICITUD" ? ["COORDINACION"] : ["REGULACION", "COORDINACION"]);
      const ids = ((roles ?? []) as { id: number }[]).map((r) => r.id);
      if (ids.length > 0) {
        const { data: personas } = await supabase
          .from("user_profiles")
          .select("email")
          .eq("activo", true)
          .eq("operational_center_id", centro.id)
          .in("role_id", ids);
        for (const p of (personas ?? []) as { email: string | null }[]) {
          if (p.email && !NO_ENVIABLE.test(p.email)) correos.add(p.email.toLowerCase());
        }
      }
    }
    for (const c of (process.env.ALERTA_NO_APTO_CORREOS ?? "").split(",")) {
      const e = c.trim().toLowerCase();
      if (e && !NO_ENVIABLE.test(e)) correos.add(e);
    }

    if (correos.size === 0) {
      console.warn("[no-apto] " + v.placa + ": sin destinatarios (revisa los correos del CRA y ALERTA_NO_APTO_CORREOS)");
      return { destinatarios: 0, enviado: false };
    }

    if (!emailConfigurado()) {
      // enviarCorreo responde «ok» sin enviar cuando Azure no está configurado: aquí no se puede dar por avisado.
      console.error("[no-apto] " + v.placa + ": el correo no está configurado (Azure/NOTIFICATIONS_MAIL_FROM); nadie fue avisado");
      return { destinatarios: correos.size, enviado: false };
    }

    const cuando = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, dateStyle: "short", timeStyle: "short", hour12: false }).format(new Date());
    const { asunto, html } = armarAlertaNoApto({ placa: v.placa, centro: centro?.nombre ?? null, hallazgos: args.hallazgos, reportadoPor: args.reportadoPor, cuando, tipo: args.tipo });
    const r = await enviarCorreo(Array.from(correos), asunto, html);
    if (!r.ok) console.error("[no-apto] " + v.placa + ": el correo falló: " + r.error);
    return { destinatarios: correos.size, enviado: r.ok };
  } catch (e) {
    console.error("[no-apto] no se pudo avisar:", e instanceof Error ? e.message : e);
    return { destinatarios: 0, enviado: false };
  }
}
