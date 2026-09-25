import { requireRole } from "@/app/api/actions/auth";
import { getCamposObligatorios, getCatalogosCaptacion } from "@/app/api/actions/captacion";
import { FormularioCaptacion } from "@/components/captacion/formulario-captacion";
import { ROLES_CAPTACION_LISTA } from "@/lib/captacion";

export default async function NuevaCaptacionPage() {
  const profile = await requireRole(ROLES_CAPTACION_LISTA);
  const [catalogos, obligatorios] = await Promise.all([getCatalogosCaptacion(), getCamposObligatorios()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Nueva captación</h1>
        <p className="mt-2 text-muted-foreground">Los campos con * son obligatorios para el reporte SISPRO.</p>
      </div>
      <FormularioCaptacion catalogos={catalogos} obligatorios={obligatorios} medicoPorDefecto={profile.role_codigo === "MEDICO" ? (profile.nombre_completo ?? "") : ""} />
    </div>
  );
}
