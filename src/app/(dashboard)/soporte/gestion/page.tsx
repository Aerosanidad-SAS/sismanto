import { requireRole } from "@/app/api/actions/auth";
import { getCatalogosTickets } from "@/app/api/actions/tickets";
import { getTicketsGestion } from "@/app/api/actions/tickets-gestion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GestionTickets } from "@/components/soporte/gestion-tickets";

interface Props {
  searchParams: { estado?: string; categoria?: string; prioridad?: string; buscar?: string; desde?: string; hasta?: string; mios?: string };
}

export default async function GestionTicketsPage({ searchParams }: Props) {
  // Solo gestores (misma lista que es_gestor_tickets() en la base).
  const profile = await requireRole(["ADMIN", "ANALISTA", "COORDINACION", "TECNICO"]);

  const [tickets, catalogos] = await Promise.all([
    getTicketsGestion({
      estado: searchParams.estado,
      categoria: searchParams.categoria,
      prioridad: searchParams.prioridad,
      buscar: searchParams.buscar,
      desde: searchParams.desde,
      hasta: searchParams.hasta,
      soloMios: searchParams.mios === "1",
    }),
    getCatalogosTickets(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Gestión de tickets</h1>
        <p className="mt-2 text-muted-foreground">Todos los tickets de soporte técnico: toma, atiende y cierra.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Se muestran los 500 más recientes que cumplan los filtros.</CardDescription>
        </CardHeader>
        <CardContent>
          <GestionTickets tickets={tickets} categorias={catalogos.categorias} esAdmin={profile.role_codigo === "ADMIN"} filtros={searchParams} />
        </CardContent>
      </Card>
    </div>
  );
}
