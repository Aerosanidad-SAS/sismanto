import { requireRole } from "@/app/api/actions/auth";
import { getEstadoIntegraciones } from "@/app/api/actions/integraciones";
import { getEstadoCorreo } from "@/app/api/actions/config-general";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfigGeneralForm } from "@/components/admin/config-general-form";

export const metadata = { title: "Configuración general" };
// Refleja siempre lo guardado, no lo de la construcción.
export const dynamic = "force-dynamic";

export default async function ConfiguracionGeneralPage() {
  await requireRole(["ADMIN"]);
  const [estado, correo] = await Promise.all([getEstadoIntegraciones(), getEstadoCorreo()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Configuración general</h1>
        <p className="mt-2 text-muted-foreground">
          Parámetros del sistema que el administrador puede cambiar sin pedir un despliegue. Lo que se escribe aquí tiene
          prioridad sobre las variables de entorno del servidor; si un campo se borra, se vuelve a usar la variable. Las
          claves nunca se muestran completas.
        </p>
      </div>
      {"error" in estado || "error" in correo ? (
        <Alert variant="destructive">
          <AlertDescription>{"error" in estado ? estado.error : "error" in correo ? correo.error : ""}</AlertDescription>
        </Alert>
      ) : (
        <ConfigGeneralForm estado={estado} correo={correo} />
      )}
    </div>
  );
}
