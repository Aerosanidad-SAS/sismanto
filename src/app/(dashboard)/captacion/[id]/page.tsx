import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/app/api/actions/auth";
import { getCaptacion, getCatalogosCaptacion } from "@/app/api/actions/captacion";
import { FormularioCaptacion } from "@/components/captacion/formulario-captacion";
import { ROLES_CAPTACION_LISTA, puedeAdministrarCaptacion } from "@/lib/captacion";

export default async function CaptacionDetallePage({ params }: { params: { id: string } }) {
  const profile = await requireRole(ROLES_CAPTACION_LISTA);
  // Editar es solo del Administrador (cargo 1 de SISRES); los demás roles ven el registro.
  const puedeEditar = puedeAdministrarCaptacion(profile.role_codigo);

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [captacion, catalogos] = await Promise.all([getCaptacion(id), getCatalogosCaptacion()]);
  if (!captacion) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/captacion" className="text-sm text-muted-foreground underline">
          ← Volver a las captaciones
        </Link>
        <h1 className="mt-2 text-3xl">Captación #{captacion.id}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registrada por {captacion.nombre_registrado_por ?? "—"}
          {puedeEditar ? "" : ". Solo un Administrador puede modificarla."}
        </p>
      </div>
      {puedeEditar ? (
        <FormularioCaptacion catalogos={catalogos} inicial={captacion} />
      ) : (
        <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-xs">
          {JSON.stringify(
            {
              fecha_atencion: captacion.fecha_atencion,
              aeropuerto: captacion.aeropuerto_atencion,
              paciente: `${captacion.primer_nombre} ${captacion.segundo_nombre ?? ""} ${captacion.primer_apellido} ${captacion.segundo_apellido ?? ""}`.replace(/\s+/g, " "),
              identificacion: `${captacion.tipo_identificacion} ${captacion.numero_identificacion}`,
              cie10: captacion.cie10,
              tipo_atencion: captacion.tipo_atencion,
              procedimientos: captacion.procedimientos,
              medico: captacion.medico_atendio,
            },
            null,
            2,
          )}
        </pre>
      )}
    </div>
  );
}
