import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/app/api/actions/auth";
import { puedeGestionarTickets } from "@/lib/auth-utils";
import { getCatalogosTickets, getMisTickets } from "@/app/api/actions/tickets";
import { MisTickets } from "@/components/soporte/mis-tickets";

export default async function SoportePage() {
  // Cualquier usuario con perfil activo puede pedir soporte y ver SUS tickets.
  // Lo que ve cada rol lo decide la base (RLS, migración 065), no esta página.
  const { profile } = await requireAuth();
  const [tickets, catalogos] = await Promise.all([getMisTickets(), getCatalogosTickets()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Soporte técnico</h1>
        <p className="mt-2 text-muted-foreground">
          Registra un ticket cuando algo de tecnología no funcione y sigue su estado hasta que se resuelva.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mis tickets</CardTitle>
          <CardDescription>Solo ves los tickets que tú registraste (o que registraron a tu nombre).</CardDescription>
        </CardHeader>
        <CardContent>
          <MisTickets tickets={tickets} catalogos={catalogos} puedeRegistrarParaOtro={puedeGestionarTickets(profile.role_codigo)} />
        </CardContent>
      </Card>
    </div>
  );
}
