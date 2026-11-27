import Link from "next/link";
import { requireRole } from "@/app/api/actions/auth";
import { getCatalogosCaptacion } from "@/app/api/actions/captacion";
import { getProcedimientosExternos } from "@/app/api/actions/captacion-procedimientos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListaProcedimientos } from "@/components/captacion/lista-procedimientos";
import { ROLES_CAPTACION_LISTA, puedeAdministrarCaptacion } from "@/lib/captacion";
import { agruparPorLote } from "@/lib/captacion-procedimientos";

export const metadata = { title: "Procedimientos y ambulancias externas" };

interface Props {
  searchParams: Promise<{ desde?: string; hasta?: string; aeropuerto?: string }>;
}

export default async function ProcedimientosExternosPage(props: Props) {
  const searchParams = await props.searchParams;
  // Mismos roles que la captación completa: puede_captacion() en la base (migración 080).
  const profile = await requireRole(ROLES_CAPTACION_LISTA);

  const [filas, catalogos] = await Promise.all([getProcedimientosExternos(searchParams), getCatalogosCaptacion()]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/captacion" className="text-sm text-muted-foreground underline">
          ← Captación aeroportuaria
        </Link>
        <h1 className="mt-2 text-3xl">Procedimientos y ambulancias externas</h1>
        <p className="mt-2 text-muted-foreground">
          Registra solo el procedimiento o la ambulancia externa, sin diligenciar la captación completa del paciente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
          <CardDescription>Se muestran los más recientes que cumplan los filtros (hasta 1000 líneas).</CardDescription>
        </CardHeader>
        <CardContent>
          <ListaProcedimientos
            lotes={agruparPorLote(filas)}
            aeropuertos={catalogos.aeropuertosAtencion}
            filtros={searchParams}
            esAdmin={puedeAdministrarCaptacion(profile.role_codigo)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
