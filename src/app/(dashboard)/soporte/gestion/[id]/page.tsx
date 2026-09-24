import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/app/api/actions/auth";
import { getTicketGestion } from "@/app/api/actions/tickets-gestion";
import { DetalleTicketGestion } from "@/components/soporte/detalle-ticket-gestion";

export default async function GestionTicketPage({ params }: { params: { id: string } }) {
  const profile = await requireRole(["ADMIN", "ANALISTA", "COORDINACION"]);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const detalle = await getTicketGestion(id);
  if (!detalle) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/soporte/gestion" className="text-sm text-muted-foreground underline">
          ← Volver a la gestión de tickets
        </Link>
        <h1 className="mt-2 text-3xl">
          Ticket #{detalle.ticket.id} — {detalle.ticket.asunto}
        </h1>
      </div>
      <DetalleTicketGestion
        ticket={detalle.ticket}
        historial={detalle.historial}
        urlAdjunto={detalle.urlAdjunto}
        miId={profile.user_id}
      />
    </div>
  );
}
