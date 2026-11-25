import { requireRole } from "@/app/api/actions/auth";
import { getCatalogosCaptacion } from "@/app/api/actions/captacion";
import { FormularioProcedimientos } from "@/components/captacion/formulario-procedimientos";
import { ROLES_CAPTACION_LISTA } from "@/lib/captacion";

export const metadata = { title: "Nuevo registro de procedimientos" };

export default async function NuevoProcedimientoExternoPage() {
  await requireRole(ROLES_CAPTACION_LISTA);
  const catalogos = await getCatalogosCaptacion();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Nuevo registro de procedimientos</h1>
        <p className="mt-2 text-muted-foreground">Los campos con * son obligatorios. No se piden datos del paciente.</p>
      </div>
      <FormularioProcedimientos aeropuertos={catalogos.aeropuertosAtencion} />
    </div>
  );
}
