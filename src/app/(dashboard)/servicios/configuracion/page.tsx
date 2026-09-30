import Link from "next/link";
import { requireRole } from "@/app/api/actions/auth";
import { getOpcionesServicio } from "@/app/api/actions/servicios-opciones";
import { ConfiguracionOpcionesServicio } from "@/components/servicios/configuracion-opciones";

export default async function ConfiguracionServiciosPage() {
  // Solo Administrador (SISRES: permiso act_configurar_campos_servicio).
  await requireRole(["ADMIN"]);
  const opciones = await getOpcionesServicio();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/servicios" className="text-sm text-muted-foreground underline">
          ← Volver a los servicios
        </Link>
        <h1 className="mt-2 text-3xl">Opciones del formulario de servicios</h1>
        <p className="mt-2 text-muted-foreground">
          Agrega o quita las opciones de estas listas sin esperar un despliegue. Los servicios que ya tienen guardada una
          opción que quites la conservan. El tipo de servicio, la etapa y el estado no se configuran aquí porque otras
          partes del sistema dependen de sus valores exactos.
        </p>
      </div>
      <ConfiguracionOpcionesServicio inicial={opciones} />
    </div>
  );
}
